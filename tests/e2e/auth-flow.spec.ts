import { test, expect } from "@playwright/test";
import { prisma } from "../../src/lib/prisma";
import { Prisma } from "../../src/generated/prisma/client";
import { createClerkWebhookPayload } from "./helpers/webhook-payloads";

const TEST_CLERK_IDS = [
  "mock_admin_user",
  "mock_viewer_user",
  "mock_inactive_user",
  "mock_jit_admin_user",
  "mock_webhook_user",
  "mock_concurrent_admin_user",
];

let testLeadId: string | null = null;

async function cleanupDb() {
  // Get mock user UUIDs to clean up their audit logs
  const mockUsers = await prisma.user.findMany({
    where: { clerkId: { in: TEST_CLERK_IDS } },
    select: { id: true },
  });
  const mockUserIds = mockUsers.map((u) => u.id);

  // Delete audit logs associated with mock users
  await prisma.auditLog.deleteMany({
    where: {
      OR: [
        { actorId: { in: [...TEST_CLERK_IDS, ...mockUserIds] } },
        { actorEmail: { in: TEST_CLERK_IDS.map((id) => `${id}@example.com`) } },
      ],
    },
  });

  // Delete mock users
  await prisma.user.deleteMany({
    where: {
      clerkId: { in: TEST_CLERK_IDS },
    },
  });
}

async function seedLead() {
  const lead = await prisma.contacts.create({
    data: {
      name: "John Doe Test",
      email: "johndoe@example.com",
      phone: "1234567890",
      company: "Test Company",
      service: "Desarrollo Web",
      message: "This is a test message for E2E.",
      status: "new",
      origin: "website",
    },
  });
  testLeadId = lead.id;
}

async function cleanupLeads() {
  await prisma.contacts.deleteMany({
    where: {
      email: { in: ["johndoe@example.com", "johndoe-submitted@example.com"] },
    },
  });
  testLeadId = null;
}

async function waitForAuditLog(whereClause: Prisma.AuditLogWhereInput, maxRetries = 15, delayMs = 200) {
  for (let i = 0; i < maxRetries; i++) {
    const log = await prisma.auditLog.findFirst({ where: whereClause });
    if (log) return log;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return null;
}

test.beforeEach(async () => {
  await cleanupDb();
  await cleanupLeads();
  await seedLead();
});

test.afterAll(async () => {
  await cleanupDb();
  await cleanupLeads();
  await prisma.$disconnect();
});

test.describe("PR 8: CRM E2E Tests", () => {
  test("Test 1: Public landing page contact form submission creates lead and audit log", async ({ page }) => {
    await page.goto("/");

    // Fill the contact form
    await page.fill('input[name="name"]', "John Doe Test");
    await page.fill('input[name="email"]', "johndoe-submitted@example.com");
    await page.fill('input[name="company"]', "Test Company");
    
    // Select a service from the custom select element
    await page.click("#serviceOfInterest");
    await page.click('[data-slot="select-item"]:has-text("Desarrollo de Software a Medida")');
    
    await page.fill('textarea[name="message"]', "This is a test message for E2E.");

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for success status
    const successHeader = page.locator('h3:has-text("¡Mensaje Enviado!")');
    await expect(successHeader).toBeVisible();

    // Verify lead was created in database
    const dbLead = await prisma.contacts.findFirst({
      where: { email: "johndoe-submitted@example.com" },
    });
    expect(dbLead).not.toBeNull();
    expect(dbLead?.name).toBe("John Doe Test");

    // Verify contact.create success audit log was generated
    const auditLog = await waitForAuditLog({
      action: "contact.create",
      resourceId: dbLead?.id,
    });
    expect(auditLog).not.toBeNull();
    expect(auditLog?.result).toBe("SUCCESS");
    expect(auditLog?.operation).toBe("CREATE");
  });

  test("Test 2: Unauthenticated access to /admin/leads redirects to /sign-in", async ({ page }) => {
    await page.goto("/admin/leads");
    await page.waitForURL("**/sign-in*");
    expect(page.url()).toContain("/sign-in");
  });

  test("Test 3: Admin login flow, dashboard loading, and lead status update", async ({ page }) => {
    // 1. Go to sign-in page and log in as admin
    await page.goto("/sign-in");
    await page.click("#btn-login-admin");

    // 2. Verify dashboard loads
    await page.waitForURL("**/admin/leads");
    expect(page.url()).toContain("/admin/leads");
    
    // Verify lead list header contains lead count
    const listHeader = page.locator('h2:has-text("Bandeja de Leads")');
    await expect(listHeader).toBeVisible();

    // Click the seeded lead in the list
    await page.click('button:has-text("John Doe Test")');

    // Verify lead details panel is visible and loaded
    const detailName = page.locator('h2:has-text("John Doe Test")');
    await expect(detailName).toBeVisible();

    // 3. Update lead status to 'contacted'
    await page.click("#detail-status-select");
    const option = page.locator('[data-slot="select-item"]:has-text("Contactado")').first();
    await option.click();

    // Wait for the status badge in the details page to update to 'Contactado'
    await expect(page.locator('#detail-status-select')).toHaveText("Contactado");

    // 4. Verify database lead status updated
    const dbLead = await prisma.contacts.findUnique({
      where: { id: testLeadId! },
    });
    expect(dbLead?.status).toBe("contacted");

    // 5. Verify success audit log generated
    const auditLog = await waitForAuditLog({
      action: "contact.update",
      resourceId: testLeadId!,
      result: "SUCCESS",
    });
    expect(auditLog).not.toBeNull();
    const dbAdmin = await prisma.user.findUnique({
      where: { clerkId: "mock_admin_user" },
    });
    expect(auditLog?.actorId).toBe(dbAdmin?.id);
    expect(auditLog?.operation).toBe("UPDATE");
  });

  test("Test 4: Viewer login flow gets redirected (Permission Denied)", async ({ page }) => {
    await page.goto("/sign-in");
    await page.click("#btn-login-viewer");

    // Viewer should be redirected back to sign-in with ?error=denied
    await page.waitForURL(/.*\/sign-in\?error=denied.*/);
    expect(page.url()).toContain("error=denied");
  });

  test("Test 5: Viewer direct API PATCH request is rejected with 403 and DENIED audit log", async ({ page, context }) => {
    // Authenticate as viewer by setting the cookie
    await context.addCookies([
      {
        name: "x-mock-user-id",
        value: "mock_viewer_user",
        url: "http://localhost:3000",
      },
    ]);

    // Navigate to local origin first so relative fetch works
    await page.goto("/");

    // Send PATCH request directly to API inside browser context
    const response = await page.evaluate(async (leadId) => {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "contacted",
        }),
      });
      const data = await res.json().catch(() => ({}));
      return { status: res.status, data };
    }, testLeadId!);

    expect(response.status).toBe(403);
    expect(response.data.success).toBe(false);

    // Verify DENIED audit log was created in DB
    const auditLog = await waitForAuditLog({
      action: "contact.update",
      resourceId: testLeadId!,
      result: "DENIED",
    });
    expect(auditLog).not.toBeNull();
    const dbViewer = await prisma.user.findUnique({
      where: { clerkId: "mock_viewer_user" },
    });
    expect(auditLog?.actorId).toBe(dbViewer?.id);
    expect(auditLog?.errorCode).toBe("AUTH_PERMISSION_DENIED");
  });

  test("Test 6: Logout flow clears cookies and redirects", async ({ page, context }) => {
    // 1. Log in as admin
    await page.goto("/sign-in");
    await page.click("#btn-login-admin");
    await page.waitForURL("**/admin/leads");

    // Verify session cookies exist
    const cookies = await context.cookies();
    const mockUserCookie = cookies.find((c) => c.name === "x-mock-user-id");
    expect(mockUserCookie).toBeDefined();

    // 2. Click logout button or navigate directly to logout endpoint
    await page.goto("/api/mock/logout");

    // 3. Verify redirected to sign-in page
    await page.waitForURL("**/sign-in*");
    expect(page.url()).toContain("/sign-in");

    // Verify cookies were deleted
    const updatedCookies = await context.cookies();
    const deletedCookie = updatedCookies.find((c) => c.name === "x-mock-user-id");
    expect(deletedCookie).toBeUndefined();
  });

  test("Test 7: Inactive user login is blocked with lockout warning", async ({ page }) => {
    await page.goto("/sign-in");
    await page.click("#btn-login-inactive");

    // Should redirect back with error=inactive
    await page.waitForURL(/.*\/sign-in\?error=inactive.*/);
    expect(page.url()).toContain("error=inactive");

    // Lockout message element should be visible
    const lockoutMsg = page.locator("#lockout-message");
    await expect(lockoutMsg).toBeVisible();
    await expect(lockoutMsg).toContainText("cuenta está inactiva");
  });

  test("Test 8: JIT synchronization for new user on first login", async ({ page, context }) => {
    // Verify user doesn't exist in DB
    const preUser = await prisma.user.findUnique({
      where: { clerkId: "mock_jit_admin_user" },
    });
    expect(preUser).toBeNull();

    // Access page with a mock admin user ID cookie that does not exist in PostgreSQL
    await context.addCookies([
      {
        name: "x-mock-user-id",
        value: "mock_jit_admin_user",
        url: "http://localhost:3000",
      },
    ]);

    await page.goto("/admin/leads");
    await page.waitForURL("**/admin/leads");

    // Verify JIT synced user now exists in DB
    const postUser = await prisma.user.findUnique({
      where: { clerkId: "mock_jit_admin_user" },
    });
    expect(postUser).not.toBeNull();
    expect(postUser?.role).toBe("ADMIN");
    expect(postUser?.isActive).toBe(true);
    expect(postUser?.email).toBe("mock_jit_admin_user@example.com");
  });

  test("Test 9: Clerk webhook synchronizes user actions (create, update, delete)", async ({ page }) => {
    // ── 1. user.created Webhook ──
    const createdPayload = createClerkWebhookPayload("user.created", "mock_webhook_user", {
      firstName: "Webhook",
      lastName: "User",
    });

    const createResponse = await page.request.post("/api/webhooks/clerk", {
      headers: {
        "svix-id": "evt_1",
        "svix-timestamp": String(Math.floor(Date.now() / 1000)),
        "svix-signature": "mock-signature",
      },
      data: createdPayload,
    });

    expect(createResponse.status()).toBe(200);

    // Verify user exists in database
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: "mock_webhook_user" },
    });
    expect(dbUser).not.toBeNull();
    expect(dbUser?.firstName).toBe("Webhook");
    expect(dbUser?.role).toBe("VIEWER"); // Default role
    expect(dbUser?.isActive).toBe(true);

    // ── 2. user.updated Webhook ──
    const updatedPayload = createClerkWebhookPayload("user.updated", "mock_webhook_user", {
      firstName: "UpdatedName",
      lastName: "User",
    });

    const updateResponse = await page.request.post("/api/webhooks/clerk", {
      headers: {
        "svix-id": "evt_2",
        "svix-timestamp": String(Math.floor(Date.now() / 1000)),
        "svix-signature": "mock-signature",
      },
      data: updatedPayload,
    });

    expect(updateResponse.status()).toBe(200);

    dbUser = await prisma.user.findUnique({
      where: { clerkId: "mock_webhook_user" },
    });
    expect(dbUser?.firstName).toBe("UpdatedName");

    // ── 3. user.deleted Webhook ──
    const deletedPayload = createClerkWebhookPayload("user.deleted", "mock_webhook_user");

    const deleteResponse = await page.request.post("/api/webhooks/clerk", {
      headers: {
        "svix-id": "evt_3",
        "svix-timestamp": String(Math.floor(Date.now() / 1000)),
        "svix-signature": "mock-signature",
      },
      data: deletedPayload,
    });

    expect(deleteResponse.status()).toBe(200);

    dbUser = await prisma.user.findUnique({
      where: { clerkId: "mock_webhook_user" },
    });
    expect(dbUser?.isActive).toBe(false);
    expect(dbUser?.deletedAt).not.toBeNull();
  });

  test("Test 10: Concurrent JIT synchronization and webhook event for the same user resolves cleanly", async ({ page, context }) => {
    const clerkId = "mock_concurrent_admin_user";
    
    // Verify user doesn't exist initially
    const preUser = await prisma.user.findUnique({
      where: { clerkId },
    });
    expect(preUser).toBeNull();

    // We will trigger both JIT sync (via direct page navigation) and Webhook creation concurrently
    const webhookPayload = createClerkWebhookPayload("user.created", clerkId);

    const triggerWebhook = async () => {
      // Small artificial delay to hit the server at almost the exact same time
      await new Promise((resolve) => setTimeout(resolve, 50));
      return page.request.post("/api/webhooks/clerk", {
        headers: {
          "svix-id": "evt_concurrent",
          "svix-timestamp": String(Math.floor(Date.now() / 1000)),
          "svix-signature": "mock-signature",
        },
        data: webhookPayload,
      });
    };

    const triggerJit = async () => {
      await context.addCookies([
        {
          name: "x-mock-user-id",
          value: clerkId,
          url: "http://localhost:3000",
        },
      ]);
      const newPage = await context.newPage();
      await newPage.goto("/admin/leads");
      await newPage.waitForURL("**/admin/leads");
      await newPage.close();
    };

    // Run both concurrently
    const [webhookResult] = await Promise.all([
      triggerWebhook(),
      triggerJit(),
    ]);

    expect(webhookResult.status()).toBe(200);

    // Verify user exists and is active
    const postUser = await prisma.user.findUnique({
      where: { clerkId },
    });
    expect(postUser).not.toBeNull();
    expect(postUser?.clerkId).toBe(clerkId);
    expect(postUser?.role).toBe("ADMIN"); // Sourced from JIT custom parser
    expect(postUser?.isActive).toBe(true);
  });

  test("Test 11: Dynamic redirect on 401 PATCH preserves url search parameters and context", async ({ page, context }) => {
    // 1. Create a dummy user and seed DB
    await prisma.user.upsert({
      where: { clerkId: "mock_admin_user" },
      update: { role: "ADMIN", isActive: true },
      create: { clerkId: "mock_admin_user", email: "mock_admin_user@example.com", role: "ADMIN", isActive: true }
    });

    // 2. Login as Admin
    await context.addCookies([
      { name: "x-mock-user-id", value: "mock_admin_user", url: "http://localhost:3000" },
      { name: "x-mock-session-id", value: "session-active-123", url: "http://localhost:3000" }
    ]);

    // 3. Go to leads dashboard with parameters
    await page.goto("/admin/leads?page=1&status=new");
    
    // Select first lead to show details
    const leadItem = page.locator("text=John Doe Test").first();
    await leadItem.click();
    await page.waitForSelector('h2:has-text("John Doe Test")');

    // 4. Simulate session expiration by deleting the session cookies
    await context.clearCookies();

    // 5. Click status dropdown trigger and change status to trigger PATCH
    await page.click("#detail-status-select");
    
    const option = page.locator('[data-slot="select-item"]:has-text("Contactado")').first();
    await option.click();

    // Confirm it redirects to sign-in with query parameters intact
    await page.waitForURL("**/sign-in?redirect_url=*");
    const currentUrl = page.url();
    expect(currentUrl).toContain("redirect_url=%2Fadmin%2Fleads%3Fpage%3D1%26status%3Dnew");
  });

  test("Test 12: Open Redirect mitigation validates and sanitizes redirect_url", async ({ page, context }) => {
    // Make sure mock_admin_user exists in DB
    await prisma.user.upsert({
      where: { clerkId: "mock_admin_user" },
      update: { role: "ADMIN", isActive: true },
      create: { clerkId: "mock_admin_user", email: "mock_admin_user@example.com", role: "ADMIN", isActive: true }
    });

    // 1. Test external domain redirect_url
    await page.goto("/sign-in?redirect_url=https://attacker.com/evil");
    await page.click("#btn-login-admin");
    await page.waitForURL("**/admin/leads");
    expect(page.url()).not.toContain("attacker.com");

    // 2. Test protocol-relative redirect_url
    await page.goto("/sign-in?redirect_url=//attacker.com/evil");
    await page.click("#btn-login-admin");
    await page.waitForURL("**/admin/leads");
    expect(page.url()).not.toContain("attacker.com");

    // 3. Test backslash-prefixed redirect_url
    await page.goto("/sign-in?redirect_url=\\\\attacker.com/evil");
    await page.click("#btn-login-admin");
    await page.waitForURL("**/admin/leads");
    expect(page.url()).not.toContain("attacker.com");

    // 4. Test malformed redirect_url (////)
    await page.goto("/sign-in?redirect_url=////");
    await page.click("#btn-login-admin");
    await page.waitForURL("**/admin/leads");
    expect(page.url()).not.toContain("////");

    // 5. Test empty redirect_url
    await page.goto("/sign-in?redirect_url=");
    await page.click("#btn-login-admin");
    await page.waitForURL("**/admin/leads");
  });

  test("Test 13: FAQ Accordion is collapsed by default and opens smoothly", async ({ page }) => {
    await page.goto("/");
    const firstContent = page.locator('[data-slot="accordion-content"]').first();
    await expect(firstContent).toBeHidden();

    const firstTrigger = page.locator('[data-slot="accordion-trigger"]').first();
    await firstTrigger.click();
    await expect(firstContent).toBeVisible();
  });
});
