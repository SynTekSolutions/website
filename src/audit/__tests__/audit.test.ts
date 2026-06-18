import { describe, it, expect, vi, beforeEach } from "vitest";
import type { DomainUser, DomainSession } from "@/auth/types";

// Mock server-only before any other imports
vi.mock("server-only", () => ({}));

// ── Mocks ─────────────────────────────────────────────────────────────────────
let mockCurrentUser: Record<string, unknown> | null = null;
let mockSession: Record<string, unknown> | null = null;
const mockHeaders = new Map<string, string>();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    auditLog: {
      create: vi.fn(async () => ({})),
    },
  },
}));

vi.mock("@/auth/current-user", () => ({
  getCurrentUser: vi.fn(async () => mockCurrentUser as unknown as DomainUser),
}));

vi.mock("@/auth/session", () => ({
  getSession: vi.fn(async () => mockSession as unknown as DomainSession),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => ({
    get: (key: string) => mockHeaders.get(key) || null,
  })),
}));

// We need to import the tested modules after mocks are declared
import { prisma } from "@/lib/prisma";
import { Permission } from "@/auth/permissions";
import { createAuditedAction, awaitPendingBackgroundTasks } from "../create-audited-action";
import { setAuditLogger, CompositeAuditLogger, AuditLogger } from "../logger";
import { PrismaAuditLogger } from "../prisma-audit-logger";
import { ResourceType, AuditAction, AuditOperation, AuditConfigurationError } from "../types";

const mockPrismaCreate = vi.mocked(prisma.auditLog.create);

describe("Audit Infrastructure (PR7A & PR7B.1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentUser = {
      id: "user-uuid-123",
      clerkId: "clerk-id-123",
      email: "test@syntek.solutions",
      role: "ADMIN",
      isActive: true,
      permissions: [Permission.PRODUCT_WRITE, Permission.PRODUCT_DELETE],
      organizationId: "org-uuid-456",
    };
    mockSession = {
      userId: "clerk-id-123",
      clerkSessionId: "sess-123",
      expiresAt: new Date(),
    };
    mockHeaders.clear();
    mockHeaders.set("user-agent", "Mozilla/5.0 Test");
    mockHeaders.set("x-forwarded-for", "192.168.1.1, 10.0.0.1");

    // Reset default logger to PrismaAuditLogger
    setAuditLogger(new PrismaAuditLogger());
  });

  // ── 1. Acción Exitosa ─────────────────────────────────────────────────────────
  it("logs SUCCESS status and passes context to handler when action finishes successfully", async () => {
    const handlerSpy = vi.fn(async (context: { user: DomainUser | null; requestId: string }, payload: { name: string }) => {
      expect(context.requestId).toBeDefined();
      expect(context.user).toEqual(mockCurrentUser);
      return { id: "prod-999", name: payload.name };
    });

    const action = createAuditedAction({
      action: AuditAction.PRODUCT_CREATE,
      operation: AuditOperation.CREATE,
      resourceType: ResourceType.PRODUCT,
      permissions: [Permission.PRODUCT_WRITE],
      getResourceId: (args, result) => result?.id,
      getMetadata: (context) => ({ payloadName: context.args[0].name }),
      handler: handlerSpy,
    });

    const result = await action({ name: "Gaming Mouse" });
    expect(result).toEqual({ id: "prod-999", name: "Gaming Mouse" });
    expect(handlerSpy).toHaveBeenCalledTimes(1);

    // Wait for background audit logging tasks
    await awaitPendingBackgroundTasks();

    expect(mockPrismaCreate).toHaveBeenCalledTimes(1);
    const createCall = mockPrismaCreate.mock.calls[0][0].data;

    expect(createCall.action).toBe(AuditAction.PRODUCT_CREATE);
    expect(createCall.operation).toBe(AuditOperation.CREATE);
    expect(createCall.resourceType).toBe(ResourceType.PRODUCT);
    expect(createCall.resourceId).toBe("prod-999");
    expect(createCall.result).toBe("SUCCESS");
    expect(createCall.actorId).toBe("user-uuid-123");
    expect(createCall.actorEmail).toBe("test@syntek.solutions");
    expect(createCall.organizationId).toBe("org-uuid-456");
    expect(createCall.sessionId).toBe("sess-123");
    expect(createCall.ipAddress).toBe("192.168.1.1");
    expect(createCall.userAgent).toBe("Mozilla/5.0 Test");
    expect(createCall.statusCode).toBe(200);
    expect(createCall.errorCode).toBeNull();
    expect(createCall.metadata).toEqual({ payloadName: "Gaming Mouse" });
    expect(createCall.traceId).toBeDefined();
    expect(createCall.durationMs).toBeGreaterThanOrEqual(0);
    expect(createCall.schemaVersion).toBe(1);
  });

  // ── 2. Acción Fallida (Error de Negocio) ──────────────────────────────────────
  it("logs FAILURE status, status_code 500, error_code, and propagates handler exception", async () => {
    const action = createAuditedAction({
      action: AuditAction.PRODUCT_CREATE,
      operation: AuditOperation.CREATE,
      resourceType: ResourceType.PRODUCT,
      getResourceId: () => undefined,
      handler: async () => {
        throw new Error("Out of stock database error");
      },
    });

    await expect(action({})).rejects.toThrow("Out of stock database error");

    await awaitPendingBackgroundTasks();

    expect(mockPrismaCreate).toHaveBeenCalledTimes(1);
    const createCall = mockPrismaCreate.mock.calls[0][0].data;

    expect(createCall.result).toBe("FAILURE");
    expect(createCall.statusCode).toBe(500);
    expect(createCall.errorCode).toBe("INTERNAL_SERVER_ERROR");
    expect(createCall.errorMessage).toBe("Out of stock database error");
  });

  // ── 3. Acción Denegada (Sin Permiso) ──────────────────────────────────────────
  it("logs DENIED status, status_code 403, error_code, and blocks handler if user lacks permission", async () => {
    // Modify user role to STAFF (which lacks Permission.PRODUCT_DELETE)
    mockCurrentUser.role = "STAFF";

    const handlerSpy = vi.fn(async () => "deleted");

    const action = createAuditedAction({
      action: AuditAction.PRODUCT_DELETE,
      operation: AuditOperation.DELETE,
      resourceType: ResourceType.PRODUCT,
      permissions: [Permission.PRODUCT_DELETE],
      getResourceId: (args) => args[0],
      handler: handlerSpy,
    });

    await expect(action("prod-123")).rejects.toThrow("Permission denied");
    expect(handlerSpy).not.toHaveBeenCalled();

    await awaitPendingBackgroundTasks();

    expect(mockPrismaCreate).toHaveBeenCalledTimes(1);
    const createCall = mockPrismaCreate.mock.calls[0][0].data;

    expect(createCall.result).toBe("DENIED");
    expect(createCall.resourceId).toBe("prod-123");
    expect(createCall.statusCode).toBe(403);
    expect(createCall.errorCode).toBe("AUTH_PERMISSION_DENIED");
    expect(createCall.errorMessage).toContain("Permission denied");
  });

  // ── 4. Acción Denegada (Usuario Inactivo / No Autenticado) ────────────────────
  it("logs DENIED status when user is inactive", async () => {
    mockCurrentUser.isActive = false;

    const action = createAuditedAction({
      action: AuditAction.PRODUCT_CREATE,
      operation: AuditOperation.CREATE,
      resourceType: ResourceType.PRODUCT,
      permissions: [Permission.PRODUCT_WRITE],
      getResourceId: () => undefined,
      handler: async () => "success",
    });

    await expect(action({})).rejects.toThrow("User account is inactive");

    await awaitPendingBackgroundTasks();

    expect(mockPrismaCreate).toHaveBeenCalledTimes(1);
    const createCall = mockPrismaCreate.mock.calls[0][0].data;
    expect(createCall.result).toBe("DENIED");
    expect(createCall.statusCode).toBe(403);
    expect(createCall.errorCode).toBe("AUTH_INACTIVE_USER");
  });

  it("logs DENIED status when user is unauthenticated", async () => {
    mockCurrentUser = null;
    mockSession = null;

    const action = createAuditedAction({
      action: AuditAction.PRODUCT_CREATE,
      operation: AuditOperation.CREATE,
      resourceType: ResourceType.PRODUCT,
      permissions: [Permission.PRODUCT_WRITE],
      getResourceId: () => undefined,
      handler: async () => "success",
    });

    await expect(action({})).rejects.toThrow("Unauthenticated");

    await awaitPendingBackgroundTasks();

    expect(mockPrismaCreate).toHaveBeenCalledTimes(1);
    const createCall = mockPrismaCreate.mock.calls[0][0].data;
    expect(createCall.result).toBe("DENIED");
    expect(createCall.statusCode).toBe(401);
    expect(createCall.errorCode).toBe("AUTH_UNAUTHENTICATED");
    expect(createCall.actorId).toBeNull();
  });

  // ── 5. Resiliencia: Logger Lento (No bloquea la request principal) ─────────────
  it("completes the action immediately without waiting for a slow logger to finish", async () => {
    const slowLogger: AuditLogger = {
      log: async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
      },
    };
    setAuditLogger(slowLogger);

    const action = createAuditedAction({
      action: AuditAction.PRODUCT_CREATE,
      operation: AuditOperation.CREATE,
      resourceType: ResourceType.PRODUCT,
      getResourceId: () => undefined,
      handler: async () => "instant-response",
    });

    const startTime = Date.now();
    const result = await action({});
    const duration = Date.now() - startTime;

    expect(result).toBe("instant-response");
    // Action should complete way before the 300ms logger finishes
    expect(duration).toBeLessThan(100);

    // Wait for the slow logger in the background
    await awaitPendingBackgroundTasks();
  });

  // ── 6. Resiliencia: Fallo del Logger (No rompe la operación principal) ────────
  it("prevents database logging failures from throwing exceptions to the caller", async () => {
    mockPrismaCreate.mockRejectedValueOnce(new Error("Database connection timeout"));

    const action = createAuditedAction({
      action: AuditAction.PRODUCT_CREATE,
      operation: AuditOperation.CREATE,
      resourceType: ResourceType.PRODUCT,
      getResourceId: () => undefined,
      handler: async () => "secure-operation",
    });

    // Action should succeed despite database logging failure
    const result = await action({});
    expect(result).toBe("secure-operation");

    await awaitPendingBackgroundTasks();
    expect(mockPrismaCreate).toHaveBeenCalledTimes(1);
  });

  // ── 7. Serialización de Metadatos Complejos ───────────────────────────────────
  it("safely sanitizes complex metadata values (Map, Set, BigInt, Date, Error, NaN, Infinity)", async () => {
    const action = createAuditedAction({
      action: AuditAction.PRODUCT_CREATE,
      operation: AuditOperation.CREATE,
      resourceType: ResourceType.PRODUCT,
      getResourceId: () => undefined,
      getMetadata: () => ({
        map: new Map([["key1", "val1"], ["key2", 42]]),
        set: new Set([1, 2, "three"]),
        bigint: BigInt(9007199254740991),
        date: new Date("2026-06-18T00:00:00.000Z"),
        error: new Error("nested detailed error"),
        nan: NaN,
        infinity: Infinity,
        negInfinity: -Infinity,
        undef: undefined,
      }),
      handler: async () => "done",
    });

    await action({});
    await awaitPendingBackgroundTasks();

    expect(mockPrismaCreate).toHaveBeenCalledTimes(1);
    const createCall = mockPrismaCreate.mock.calls[0][0].data;

    const metadata = createCall.metadata as Record<string, unknown>;
    expect(metadata.map).toEqual({ key1: "val1", key2: 42 });
    expect(metadata.set).toEqual([1, 2, "three"]);
    expect(metadata.bigint).toBe("9007199254740991");
    expect(metadata.date).toBe("2026-06-18T00:00:00.000Z");
    expect(metadata.error.name).toBe("Error");
    expect(metadata.error.message).toBe("nested detailed error");
    expect(metadata.nan).toBe("NaN");
    expect(metadata.infinity).toBe("Infinity");
    expect(metadata.negInfinity).toBe("-Infinity");
    expect(metadata.undef).toBeNull();
  });

  // ── 8. Concurrencia (Multi-request sin race conditions) ──────────────────────
  it("handles 50 concurrent audited actions correctly and registers all logs", async () => {
    const action = createAuditedAction({
      action: AuditAction.PRODUCT_CREATE,
      operation: AuditOperation.CREATE,
      resourceType: ResourceType.PRODUCT,
      getResourceId: (args) => `id-${args[0]}`,
      handler: async (context, num: number) => `result-${num}`,
    });

    const promises = Array.from({ length: 50 }).map((_, idx) => action(idx));
    const results = await Promise.all(promises);

    expect(results).toHaveLength(50);
    expect(results[0]).toBe("result-0");
    expect(results[49]).toBe("result-49");

    await awaitPendingBackgroundTasks();
    expect(mockPrismaCreate).toHaveBeenCalledTimes(50);

    const ids = mockPrismaCreate.mock.calls.map(call => call[0].data.resourceId);
    expect(ids).toContain("id-0");
    expect(ids).toContain("id-49");
  });

  // ── 9. Composite Logger (Destinos aislados con Promise.allSettled + timeout) ──
  it("dispatches log entries to multiple loggers and isolates failures/timeouts", async () => {
    const successLogger: AuditLogger = {
      log: vi.fn(async () => {}),
    };
    const failLogger: AuditLogger = {
      log: vi.fn(async () => {
        throw new Error("External logging service down");
      }),
    };
    const slowLogger: AuditLogger = {
      log: vi.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      }),
    };

    // Instantiate Composite Logger with a 50ms timeout for slow loggers
    const composite = new CompositeAuditLogger([successLogger, failLogger, slowLogger], 50);
    setAuditLogger(composite);

    const action = createAuditedAction({
      action: AuditAction.PRODUCT_CREATE,
      operation: AuditOperation.CREATE,
      resourceType: ResourceType.PRODUCT,
      getResourceId: () => undefined,
      handler: async () => "composite-done",
    });

    await action({});
    await awaitPendingBackgroundTasks();

    expect(successLogger.log).toHaveBeenCalledTimes(1);
    expect(failLogger.log).toHaveBeenCalledTimes(1);
    expect(slowLogger.log).toHaveBeenCalledTimes(1);
  });

  // ── 10. Ganchos de Estado Fallan (captureBeforeState obligatorio/resiliente) ──
  it("aborts the main action flow if captureBeforeState throws an exception", async () => {
    const action = createAuditedAction({
      action: AuditAction.PRODUCT_CREATE,
      operation: AuditOperation.CREATE,
      resourceType: ResourceType.PRODUCT,
      getResourceId: () => undefined,
      captureBeforeState: () => {
        throw new Error("Critical database query failed");
      },
      handler: async () => "should-not-reach-here",
    });

    await expect(action({})).rejects.toThrow("Critical database query failed");
    await awaitPendingBackgroundTasks();

    // Verify that it still logged the FAILURE entry to prevent audit log evasion
    expect(mockPrismaCreate).toHaveBeenCalledTimes(1);
    const logData = mockPrismaCreate.mock.calls[0][0].data;
    expect(logData.result).toBe("FAILURE");
    expect(logData.errorMessage).toBe("Critical database query failed");
  });

  it("proceeds with the main action if captureBeforeState utilizes manual try-catch resilience", async () => {
    const action = createAuditedAction({
      action: AuditAction.PRODUCT_CREATE,
      operation: AuditOperation.CREATE,
      resourceType: ResourceType.PRODUCT,
      getResourceId: () => undefined,
      captureBeforeState: () => {
        try {
          throw new Error("Non-critical DB warning");
        } catch {
          return undefined; // Handled resiliently!
        }
      },
      handler: async () => "success-with-warning",
    });

    const result = await action({});
    expect(result).toBe("success-with-warning");

    await awaitPendingBackgroundTasks();
    expect(mockPrismaCreate).toHaveBeenCalledTimes(1);
    expect(mockPrismaCreate.mock.calls[0][0].data.result).toBe("SUCCESS");
  });

  // ── 11. Acción Dinámica Inválida (Lanza AuditConfigurationError) ──────────────
  it("throws AuditConfigurationError when resolved dynamic action is invalid", async () => {
    const action = createAuditedAction({
      action: () => "invalid.action" as AuditAction,
      operation: AuditOperation.CREATE,
      resourceType: ResourceType.PRODUCT,
      getResourceId: () => undefined,
      handler: async () => "result",
    });

    await expect(action({})).rejects.toThrow(AuditConfigurationError);
    await awaitPendingBackgroundTasks();
  });

  // ── 12. shouldAudit = false (Evita construir y despachar AuditEntry) ──────────
  it("does not trigger logging or metadata hooks if shouldAudit returns false", async () => {
    const getMetadataSpy = vi.fn(() => ({ foo: "bar" }));
    const action = createAuditedAction({
      action: AuditAction.PRODUCT_CREATE,
      operation: AuditOperation.CREATE,
      resourceType: ResourceType.PRODUCT,
      getResourceId: () => undefined,
      shouldAudit: () => false,
      getMetadata: getMetadataSpy,
      handler: async () => "result",
    });

    const result = await action({});
    expect(result).toBe("result");

    await awaitPendingBackgroundTasks();
    expect(mockPrismaCreate).not.toHaveBeenCalled();
    expect(getMetadataSpy).not.toHaveBeenCalled();
  });

  // ── 13. Metadata Fallback con Detalles del Error ──────────────────────────────
  it("logs a fallback structure with error details if getMetadata throws an exception", async () => {
    const action = createAuditedAction({
      action: AuditAction.PRODUCT_CREATE,
      operation: AuditOperation.CREATE,
      resourceType: ResourceType.PRODUCT,
      getResourceId: () => undefined,
      getMetadata: () => {
        throw new TypeError("Failed to format metadata");
      },
      handler: async () => "result",
    });

    await action({});
    await awaitPendingBackgroundTasks();

    expect(mockPrismaCreate).toHaveBeenCalledTimes(1);
    const metadata = mockPrismaCreate.mock.calls[0][0].data.metadata as Record<string, unknown>;
    expect(metadata.metadataGenerationFailed).toBe(true);
    expect(metadata.metadataErrorName).toBe("TypeError");
    expect(metadata.metadataErrorMessage).toBe("Failed to format metadata");
  });
});
