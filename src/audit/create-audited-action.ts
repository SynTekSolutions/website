import {
  AuditAction,
  AuditEntry,
  AuditResult,
  AuditActionSet,
  AuditOperationSet,
  AUDIT_SCHEMA_VERSION,
  AuditClock,
  AuditMetadataContext,
  AuditedActionConfig,
} from "./types";
import { getCurrentUser } from "@/auth/current-user";
import { getSession } from "@/auth/session";
import { requirePermission } from "@/auth/require-permission";
import { getAuditLogger } from "./logger";
import { RequestContext } from "@/lib/request-context";
import { headers } from "next/headers";
import { DomainUser } from "@/auth/types";
import { logger } from "@/lib/logger";
import { after, NextResponse } from "next/server";
import { serializeAuditMetadata } from "./prisma-audit-logger";
import crypto from "crypto";

export class AuditConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuditConfigurationError";
    Object.setPrototypeOf(this, AuditConfigurationError.prototype);
  }
}

// Track pending promises for test assertion synchronization
const pendingPromises = new Set<Promise<unknown>>();

/**
 * Schedule a background task resiliently.
 * Defer execution using Next.js `waitUntil` when available, falling back to
 * `setImmediate` or `setTimeout` depending on the runtime environment.
 */
export function scheduleBackgroundTask(promise: Promise<unknown>): void {
  pendingPromises.add(promise);
  promise.finally(() => {
    pendingPromises.delete(promise);
  });

  let scheduled = false;
  try {
    after(async () => {
      await promise;
    });
    scheduled = true;
  } catch {
    // Not in Next.js 15 request context
  }

  if (!scheduled) {
    if (typeof setImmediate === "function") {
      setImmediate(() => {
        promise.catch(() => {});
      });
    } else {
      setTimeout(() => {
        promise.catch(() => {});
      }, 0);
    }
  }
}

/**
 * Test utility to await all pending background tasks to ensure they finish before assertions.
 */
export async function awaitPendingBackgroundTasks(): Promise<void> {
  while (pendingPromises.size > 0) {
    await Promise.all(Array.from(pendingPromises));
  }
}

/**
 * Extrae información estructurada de errores para el registro de auditoría.
 */
function extractErrorInfo(error: unknown): { statusCode: number; errorCode: string; errorMessage: string } {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorName = error instanceof Error ? error.constructor?.name : "";

  // 1. Auth-specific errors
  if (errorName === "PermissionDeniedError" || (error instanceof Error && error.name === "PermissionDeniedError")) {
    return { statusCode: 403, errorCode: "AUTH_PERMISSION_DENIED", errorMessage };
  }
  if (errorName === "UnauthenticatedError" || (error instanceof Error && error.name === "UnauthenticatedError")) {
    return { statusCode: 401, errorCode: "AUTH_UNAUTHENTICATED", errorMessage };
  }
  if (errorName === "InactiveUserError" || (error instanceof Error && error.name === "InactiveUserError")) {
    return { statusCode: 403, errorCode: "AUTH_INACTIVE_USER", errorMessage };
  }
  if (errorName === "ClerkUserNotFoundError" || (error instanceof Error && error.name === "ClerkUserNotFoundError")) {
    return { statusCode: 404, errorCode: "AUTH_USER_NOT_FOUND", errorMessage };
  }

  // 2. Custom or general API error status/codes
  const status = typeof (error as Record<string, unknown>)?.status === "number" ? (error as Record<string, unknown>).status as number
               : typeof (error as Record<string, unknown>)?.statusCode === "number" ? (error as Record<string, unknown>).statusCode as number
               : 500;

  const code = typeof (error as Record<string, unknown>)?.code === "string" ? (error as Record<string, unknown>).code as string
             : typeof (error as Record<string, unknown>)?.errorCode === "string" ? (error as Record<string, unknown>).errorCode as string
             : "INTERNAL_SERVER_ERROR";

  return { statusCode: status, errorCode: code, errorMessage };
}

/**
 * Higher-order function to wrap Server Actions or handlers with automatic transparent audit logging.
 */
export function createAuditedAction<TArgs extends unknown[], TResult, TBefore = unknown, TAfter = unknown>(
  config: AuditedActionConfig<TArgs, TResult, TBefore, TAfter>
) {
  // Validate action and operation configuration statically if they are static strings
  if (typeof config.action === "string" && !AuditActionSet.has(config.action)) {
    throw new AuditConfigurationError(`Invalid static audit action: ${config.action}`);
  }
  if (!AuditOperationSet.has(config.operation)) {
    throw new AuditConfigurationError(`Invalid audit operation: ${config.operation}`);
  }

  return async (...args: TArgs): Promise<TResult> => {
    // 1. Check if we already have an active RequestContext
    const existingRequestId = RequestContext.getRequestId();

    if (existingRequestId) {
      return runAction(
        existingRequestId,
        RequestContext.getIp(),
        RequestContext.getUserAgent(),
        RequestContext.getCorrelationId(),
        RequestContext.getTraceId(),
        ...args
      );
    } else {
      // Initialize a RequestContext store if not present (e.g. called as Server Action)
      const requestId = RequestContext.generateId();
      let ip: string | undefined;
      let userAgent: string | undefined;
      let traceId: string | undefined;

      try {
        const reqHeaders = await headers();
        ip = reqHeaders.get("x-forwarded-for")?.split(",")[0].trim() || reqHeaders.get("x-real-ip") || undefined;
        userAgent = reqHeaders.get("user-agent") || undefined;

        // Check for traceparent header
        const traceParent = reqHeaders.get("traceparent");
        if (traceParent) {
          const parts = traceParent.split("-");
          if (parts.length >= 2) {
            traceId = parts[1];
          }
        }
        if (!traceId) {
          traceId = reqHeaders.get("x-trace-id") || reqHeaders.get("x-request-id") || undefined;
        }
      } catch {
        // Non-request context (e.g. CLI, direct tests)
      }

      if (!traceId) {
        // Generate a standard 32-char hex string (UUID without hyphens)
        traceId = crypto.randomUUID().replace(/-/g, "");
      }

      const correlationId = requestId;

      return RequestContext.run({ requestId, ip, userAgent, correlationId, traceId }, () => {
        return runAction(requestId, ip, userAgent, correlationId, traceId, ...args);
      });
    }
  };

  async function runAction(
    requestId: string,
    ipAddress: string | undefined,
    userAgent: string | undefined,
    correlationId: string | undefined,
    traceId: string | undefined,
    ...args: TArgs
  ): Promise<TResult> {
    const startedAt = performance.now();
    let user: DomainUser | null = null;
    let sessionId: string | undefined;
    let actionError: unknown = null;
    let actionResult: TResult | undefined;
    let beforeState: TBefore | undefined = undefined;
    let afterState: TAfter | undefined = undefined;
    let durationMs = 0;

    try {
      // A. Resolve Actor
      user = await getCurrentUser();
      const session = await getSession();
      sessionId = session?.clerkSessionId || undefined;

      // B. Enforce Permission Check (RBAC Check)
      if (config.permissions && config.permissions.length > 0) {
        const strategy = config.permissionStrategy || "all";
        if (strategy === "all") {
          for (const perm of config.permissions) {
            requirePermission(user, perm);
          }
        } else {
          // strategy === "any"
          let hasAny = false;
          let lastError: unknown = null;
          for (const perm of config.permissions) {
            try {
              requirePermission(user, perm);
              hasAny = true;
              break;
            } catch (err) {
              lastError = err;
            }
          }
          if (!hasAny) {
            throw lastError || new Error("Permission denied");
          }
        }
      }

      // C. Capture Before State
      if (config.captureBeforeState) {
        beforeState = await config.captureBeforeState(args);
      }

      // D. Execute Action Handler
      actionResult = await config.handler({ user, requestId }, ...args);

      // E. Capture After State
      if (config.captureAfterState) {
        afterState = await config.captureAfterState(args, actionResult);
      }

      // Latency represents the duration of RBAC check + handler + captureAfterState
      durationMs = performance.now() - startedAt;

      // Resolve dynamic action synchronously to throw AuditConfigurationError immediately
      let resolvedAction: AuditAction;
      if (typeof config.action === "function") {
        resolvedAction = config.action(args, actionResult, undefined);
        if (!AuditActionSet.has(resolvedAction)) {
          throw new AuditConfigurationError(`Invalid resolved dynamic audit action: ${resolvedAction}`);
        }
      } else {
        resolvedAction = config.action;
      }

      const metadataCtx: AuditMetadataContext<TArgs, TResult, TBefore, TAfter> = {
        args,
        result: actionResult,
        beforeState,
        afterState,
      };

      // F. Resilient Background Audit Log Dispatch (SUCCESS path)
      // shouldAudit early exit
      let performLogging = true;
      if (config.shouldAudit) {
        try {
          performLogging = config.shouldAudit(metadataCtx);
        } catch (err) {
          logger.error("Error evaluating shouldAudit hook, defaulting to true", err);
        }
      }

      if (performLogging) {
        const dispatchSuccessPromise = (async () => {
          // getMetadata hook evaluation
          let metadata: Record<string, unknown> | undefined = undefined;
          if (config.getMetadata) {
            try {
              metadata = await config.getMetadata(metadataCtx);
            } catch (err) {
              logger.error("Error evaluating getMetadata hook, applying fallback", err);
              metadata = {
                metadataGenerationFailed: true,
                metadataErrorName: err instanceof Error ? err.constructor.name : "UnknownError",
                metadataErrorMessage: err instanceof Error ? err.message : String(err),
              };
            }
          }

          // getResourceId evaluation
          let resourceId: string | undefined = undefined;
          try {
            resourceId = await config.getResourceId(args, actionResult);
          } catch (err) {
            logger.error("Error evaluating getResourceId hook", err);
          }

          const entry: AuditEntry = {
            action: resolvedAction,
            operation: config.operation,
            actor: user
              ? {
                  id: user.id,
                  email: user.email,
                  role: user.role,
                }
              : undefined,
            organizationId: user?.organizationId || undefined,
            requestId,
            sessionId,
            correlationId,
            traceId,
            resource: {
              type: config.resourceType,
              id: resourceId,
            },
            result: "SUCCESS",
            ipAddress,
            userAgent,
            statusCode: 200,
            metadata: metadata ? serializeAuditMetadata(metadata) : undefined,
            schemaVersion: AUDIT_SCHEMA_VERSION,
            durationMs,
            createdAt: AuditClock.now(),
          };

          await getAuditLogger().log(entry);
        })();

        scheduleBackgroundTask(dispatchSuccessPromise);
      }

      return actionResult;
    } catch (err) {
      actionError = err;
      const errInfo = extractErrorInfo(actionError);

      // Latency represents execution duration up to error
      durationMs = performance.now() - startedAt;

      // Only check resolved action if we didn't throw AuditConfigurationError already during setup
      let resolvedAction: AuditAction | undefined;
      if (!(err instanceof AuditConfigurationError)) {
        try {
          if (typeof config.action === "function") {
            resolvedAction = config.action(args, undefined, actionError);
            if (!AuditActionSet.has(resolvedAction)) {
              throw new AuditConfigurationError(`Invalid resolved dynamic audit action: ${resolvedAction}`);
            }
          } else {
            resolvedAction = config.action;
          }
        } catch (resolveErr) {
          // If it is AuditConfigurationError, we want to propagate it instead of the business error
          if (resolveErr instanceof AuditConfigurationError) {
            throw resolveErr;
          }
          logger.error("Error resolving action on failure", resolveErr);
        }
      } else {
        resolvedAction = typeof config.action === "string" ? config.action : undefined;
      }

      const metadataCtx: AuditMetadataContext<TArgs, TResult, TBefore, TAfter> = {
        args,
        error: actionError,
        beforeState,
      };

      // shouldAudit early exit
      let performLogging = true;
      if (config.shouldAudit) {
        try {
          performLogging = config.shouldAudit(metadataCtx);
        } catch (errVal) {
          logger.error("Error evaluating shouldAudit hook on failure, defaulting to true", errVal);
        }
      }

      if (performLogging && resolvedAction) {
        const dispatchFailurePromise = (async () => {
          // getMetadata hook evaluation
          let metadata: Record<string, unknown> | undefined = undefined;
          if (config.getMetadata) {
            try {
              metadata = await config.getMetadata(metadataCtx);
            } catch (errVal) {
              logger.error("Error evaluating getMetadata hook on failure, applying fallback", errVal);
              metadata = {
                metadataGenerationFailed: true,
                metadataErrorName: errVal instanceof Error ? errVal.constructor.name : "UnknownError",
                metadataErrorMessage: errVal instanceof Error ? errVal.message : String(errVal),
              };
            }
          }

          // getResourceId evaluation
          let resourceId: string | undefined = undefined;
          try {
            resourceId = await config.getResourceId(args, undefined);
          } catch (errVal) {
            logger.error("Error evaluating getResourceId hook on failure", errVal);
          }


          let resultStatus: AuditResult = "FAILURE";

          if (
            errInfo.errorCode.startsWith("AUTH_") ||
            (actionError instanceof Error &&
              (actionError.name === "PermissionDeniedError" ||
                actionError.name === "UnauthenticatedError" ||
                actionError.name === "InactiveUserError" ||
                actionError.constructor.name === "PermissionDeniedError" ||
                actionError.constructor.name === "UnauthenticatedError" ||
                actionError.constructor.name === "InactiveUserError"))
          ) {
            resultStatus = "DENIED";
          }

          const entry: AuditEntry = {
            action: resolvedAction as AuditAction,
            operation: config.operation,
            actor: user
              ? {
                  id: user.id,
                  email: user.email,
                  role: user.role,
                }
              : undefined,
            organizationId: user?.organizationId || undefined,
            requestId,
            sessionId,
            correlationId,
            traceId,
            resource: {
              type: config.resourceType,
              id: resourceId,
            },
            result: resultStatus,
            ipAddress,
            userAgent,
            statusCode: errInfo.statusCode,
            errorCode: errInfo.errorCode,
            errorMessage: errInfo.errorMessage,
            metadata: metadata ? serializeAuditMetadata(metadata) : undefined,
            schemaVersion: AUDIT_SCHEMA_VERSION,
            durationMs,
            createdAt: AuditClock.now(),
          };

          await getAuditLogger().log(entry);
        })();

        scheduleBackgroundTask(dispatchFailurePromise);
      }

      // If we are in an API Route (first arg is a Request/NextRequest), map the error to a NextResponse
      if (args[0] && typeof args[0] === "object" && ("headers" in args[0] || "nextUrl" in args[0] || args[0] instanceof Request)) {
        return NextResponse.json(
          { success: false, error: errInfo.errorCode, message: errInfo.errorMessage },
          { status: errInfo.statusCode }
        ) as unknown as TResult;
      }

      throw actionError;
    }
  }
}
