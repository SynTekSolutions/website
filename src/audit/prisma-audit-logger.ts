import { AuditLogger } from "./logger";
import { AuditEntry, JsonValue } from "./types";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/**
 * Robustly sanitizes and serializes complex metadata values into a strictly JSON-serializable structure.
 * Handles: Map, Set, Date, BigInt, Error, NaN, Infinity, Buffer, RegExp, undefined.
 */
export function serializeAuditMetadata(
  metadata?: Readonly<Record<string, unknown>>
): Record<string, JsonValue> {
  if (!metadata) return {};

  function sanitize(val: unknown): JsonValue {
    if (val === undefined || val === null) {
      return null;
    }
    if (typeof val === "function") {
      return null;
    }
    if (typeof val === "symbol") {
      return val.toString();
    }
    if (typeof val === "bigint") {
      return val.toString();
    }
    
    if (typeof val === "number") {
      if (Number.isNaN(val)) return "NaN";
      if (val === Infinity) return "Infinity";
      if (val === -Infinity) return "-Infinity";
      return val;
    }

    if (typeof val === "string" || typeof val === "boolean") {
      return val;
    }

    if (val instanceof Error) {
      const errorObj: Record<string, JsonValue> = {
        name: val.name,
        message: val.message,
        stack: val.stack || null,
      };
      for (const key of Object.keys(val)) {
        const propVal = (val as unknown as Record<string, unknown>)[key];
        errorObj[key] = sanitize(propVal);
      }
      return errorObj;
    }

    if (val instanceof Date) {
      return val.toISOString();
    }

    if (val instanceof Map) {
      const obj: Record<string, JsonValue> = {};
      for (const [k, v] of val.entries()) {
        obj[String(k)] = sanitize(v);
      }
      return obj;
    }

    if (val instanceof Set) {
      return Array.from(val).map(sanitize);
    }

    if (val instanceof RegExp) {
      return val.toString();
    }

    if (globalThis.Buffer && globalThis.Buffer.isBuffer(val)) {
      return val.toString("base64");
    }

    if (Array.isArray(val)) {
      return val.map(sanitize) as JsonValue[];
    }

    if (typeof val === "object") {
      const copy: Record<string, JsonValue> = {};
      for (const key of Object.keys(val as object)) {
        copy[key] = sanitize((val as Record<string, unknown>)[key]);
      }
      return copy;
    }

    return String(val);
  }

  const result: Record<string, JsonValue> = {};
  for (const key of Object.keys(metadata)) {
    result[key] = sanitize(metadata[key]);
  }
  return result;
}

export class PrismaAuditLogger implements AuditLogger {
  async log(entry: Readonly<AuditEntry>): Promise<void> {
    try {
      const serializedMetadata = serializeAuditMetadata(entry.metadata);

      await prisma.auditLog.create({
        data: {
          actorId: entry.actor?.id || null,
          actorEmail: entry.actor?.email || null,
          organizationId: entry.organizationId || null,
          requestId: entry.requestId || null,
          sessionId: entry.sessionId || null,
          action: entry.action,
          operation: entry.operation,
          resourceType: entry.resource.type,
          resourceId: entry.resource.id || null,
          result: entry.result,
          ipAddress: entry.ipAddress || null,
          userAgent: entry.userAgent || null,
          statusCode: entry.statusCode || null,
          errorCode: entry.errorCode || null,
          errorMessage: entry.errorMessage || null,
          metadata: serializedMetadata,
          schemaVersion: entry.schemaVersion,
          traceId: entry.traceId || null,
          durationMs: entry.durationMs || null,
          createdAt: entry.createdAt,
        },
      });
    } catch (error) {
      // Resilience rule: audit logging MUST NEVER crash the main flow
      logger.error("Audit log failed to write to database", error, {
        action: entry.action,
        resourceType: entry.resource.type,
        result: entry.result,
      });
    }
  }
}
