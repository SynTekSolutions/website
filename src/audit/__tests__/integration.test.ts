import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import type { DomainUser, DomainSession, Role } from "@/auth/types";

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

// Mock feature services
vi.mock("@/features/contact/services/contact-admin.service", () => ({
  ContactAdminService: {
    getLeadById: vi.fn(),
    updateLead: vi.fn(),
  },
}));

vi.mock("@/features/contact/services/contact-lead.service", () => ({
  ContactLeadService: {
    saveLead: vi.fn(),
  },
}));

import { prisma } from "@/lib/prisma";
import { Permission } from "@/auth/permissions";
import { ContactAdminService } from "@/features/contact/services/contact-admin.service";
import { ContactLeadService } from "@/features/contact/services/contact-lead.service";
import { setAuditLogger } from "../logger";
import { PrismaAuditLogger } from "../prisma-audit-logger";
import { awaitPendingBackgroundTasks } from "../create-audited-action";

// Import route handlers to test
import { POST as contactPostRoute } from "@/app/api/contact/route";
import { GET as leadGetRoute, PATCH as leadPatchRoute } from "@/app/api/admin/leads/[id]/route";

const mockPrismaCreate = vi.mocked(prisma.auditLog.create);
const mockGetLeadById = vi.mocked(ContactAdminService.getLeadById);
const mockUpdateLead = vi.mocked(ContactAdminService.updateLead);
const mockSaveLead = vi.mocked(ContactLeadService.saveLead);

describe("Audit Route Handlers Integration (PR7B.1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentUser = {
      id: "admin-uuid-1",
      clerkId: "clerk-admin-1",
      email: "admin@syntek.solutions",
      role: "ADMIN",
      isActive: true,
      permissions: [Permission.CUSTOMER_READ, Permission.CUSTOMER_WRITE],
      organizationId: "org-1",
    };
    mockSession = {
      userId: "clerk-admin-1",
      clerkSessionId: "sess-admin",
      expiresAt: new Date(),
    };
    mockHeaders.clear();
    mockHeaders.set("user-agent", "Integration-Test-Agent");
    mockHeaders.set("x-forwarded-for", "127.0.0.1");

    setAuditLogger(new PrismaAuditLogger());
  });

  // ── 1. POST /api/contact (Público, sin auth requerida) ───────────────────────
  it("allows anonymous POST to contact route and registers CREATE audit log", async () => {
    // Public endpoint: getCurrentUser returns null or throws.
    // Unauthenticated user is allowed since no permissions are specified in POST contact route.
    mockCurrentUser = null;
    mockSession = null;

    mockSaveLead.mockResolvedValueOnce({
      success: true,
      message: "Consulta recibida.",
      leadId: "lead-abc-123",
    });

    const req = new NextRequest("http://localhost:3000/api/contact", {
      method: "POST",
      body: JSON.stringify({
        name: "Alice Smith",
        email: "alice@example.com",
        message: "Hello world!",
        serviceOfInterest: "development",
        company: "Smith Co",
      }),
    });

    const response = await contactPostRoute(req);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.leadId).toBe("lead-abc-123");

    await awaitPendingBackgroundTasks();

    expect(mockPrismaCreate).toHaveBeenCalledTimes(1);
    const logData = mockPrismaCreate.mock.calls[0][0].data;
    expect(logData.action).toBe("contact.create");
    expect(logData.operation).toBe("CREATE");
    expect(logData.result).toBe("SUCCESS");
    expect(logData.resourceId).toBe("lead-abc-123");
    expect(logData.actorId).toBeNull(); // Anonymous!
  });

  // ── 2. GET /api/admin/leads/[id] (Privado, requiere CUSTOMER_READ) ───────────
  it("blocks unauthorized user on GET admin lead route and registers DENIED audit log", async () => {
    // User does NOT have CUSTOMER_READ
    mockCurrentUser = {
      id: "staff-uuid-1",
      clerkId: "clerk-staff-1",
      email: "staff@syntek.solutions",
      role: "INVALID_ROLE" as unknown as Role,
      isActive: true,
      permissions: [Permission.PRODUCT_READ],
      organizationId: "org-1",
    };

    const req = new NextRequest("http://localhost:3000/api/admin/leads/lead-999");
    const params = Promise.resolve({ id: "lead-999" });

    const response = await leadGetRoute(req, { params });
    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe("AUTH_PERMISSION_DENIED");

    await awaitPendingBackgroundTasks();

    expect(mockPrismaCreate).toHaveBeenCalledTimes(1);
    const logData = mockPrismaCreate.mock.calls[0][0].data;
    expect(logData.action).toBe("admin.access");
    expect(logData.operation).toBe("READ");
    expect(logData.result).toBe("DENIED");
    expect(logData.statusCode).toBe(403);
    expect(logData.errorCode).toBe("AUTH_PERMISSION_DENIED");
    expect(logData.actorId).toBe("staff-uuid-1");
  });

  it("allows authorized user on GET admin lead route and registers SUCCESS audit log", async () => {
    mockGetLeadById.mockResolvedValueOnce({
      id: "lead-999",
      name: "Authorized Fetch",
      status: "new",
      email: "fetch@example.com",
      message: "Fetched details.",
    });

    const req = new NextRequest("http://localhost:3000/api/admin/leads/lead-999");
    const params = Promise.resolve({ id: "lead-999" });

    const response = await leadGetRoute(req, { params });
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe("lead-999");

    await awaitPendingBackgroundTasks();

    expect(mockPrismaCreate).toHaveBeenCalledTimes(1);
    const logData = mockPrismaCreate.mock.calls[0][0].data;
    expect(logData.action).toBe("admin.access");
    expect(logData.operation).toBe("READ");
    expect(logData.result).toBe("SUCCESS");
    expect(logData.resourceId).toBe("lead-999");
  });

  // ── 3. PATCH /api/admin/leads/[id] (Privado, requiere CUSTOMER_WRITE) ─────────
  it("captures state diff and registers SUCCESS on lead status update", async () => {
    // Before state mock
    mockGetLeadById.mockResolvedValueOnce({
      id: "lead-777",
      name: "Leads Diff",
      status: "new",
      email: "diff@example.com",
      message: "Status update test.",
    });

    // After state mock (for captureAfterState)
    mockGetLeadById.mockResolvedValueOnce({
      id: "lead-777",
      name: "Leads Diff",
      status: "contacted",
      email: "diff@example.com",
      message: "Status update test.",
    });

    mockUpdateLead.mockResolvedValueOnce({
      id: "lead-777",
      name: "Leads Diff",
      status: "contacted",
      email: "diff@example.com",
      message: "Status update test.",
    });

    const req = new NextRequest("http://localhost:3000/api/admin/leads/lead-777", {
      method: "PATCH",
      body: JSON.stringify({
        status: "contacted",
        metadata: { notes: "Called today" },
      }),
    });
    const params = Promise.resolve({ id: "lead-777" });

    const response = await leadPatchRoute(req, { params });
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);

    await awaitPendingBackgroundTasks();

    expect(mockPrismaCreate).toHaveBeenCalledTimes(1);
    const logData = mockPrismaCreate.mock.calls[0][0].data;
    expect(logData.action).toBe("contact.update");
    expect(logData.operation).toBe("UPDATE");
    expect(logData.result).toBe("SUCCESS");
    expect(logData.resourceId).toBe("lead-777");

    const metadata = logData.metadata as Record<string, unknown>;
    expect(metadata.previousStatus).toBe("new");
    expect(metadata.newStatus).toBe("contacted");
    expect(metadata.changed).toBe(true);
  });
});
