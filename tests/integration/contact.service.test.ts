import dotenv from "dotenv";
import postgres from "postgres";
import { ContactLeadService } from "../../src/features/contact/services/contact-lead.service";
import { ContactAdminService } from "../../src/features/contact/services/contact-admin.service";
import crypto from "crypto";

dotenv.config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is not set in .env.local");
  process.exit(1);
}

const sql = postgres(databaseUrl);

async function testServices() {
  console.log("Running Services integration tests...");

  // Since ContactLeadService creates the ID internally using randomUUID, we will track the created lead by searching for its unique email.
  const uniqueEmail = `service-test-${crypto.randomBytes(4).toString("hex")}@syntek.solutions`;
  
  try {
    // 1. Submit contact via ContactLeadService
    console.log("Submitting lead via ContactLeadService...");
    const saveResult = await ContactLeadService.saveLead(
      {
        name: "Service E2E Test Lead",
        email: uniqueEmail,
        phone: "3001234567",
        company: "Service QA Division",
        serviceOfInterest: "Cloud Strategy",
        message: "Verifying service layer, DTO conversions, and logging."
      },
      {
        ip: "10.0.0.1",
        userAgent: "Playwright Integration Runner",
        referrer: "http://localhost:3000/contact"
      }
    );

    if (!saveResult.success) {
      throw new Error(`Lead submission failed: ${saveResult.message}`);
    }
    console.log("Lead submitted successfully.");

    // 2. Fetch the newly inserted lead using direct SQL to get its ID
    const [dbLead] = await sql`SELECT id FROM contacts WHERE email = ${uniqueEmail}`;
    if (!dbLead) {
      throw new Error("Could not find inserted lead in DB by email");
    }
    const leadId = dbLead.id;
    console.log("Found inserted lead ID:", leadId);

    // 3. Retrieve leads list via ContactAdminService.getLeads and verify it is a light DTO
    console.log("Retrieving leads list via ContactAdminService.getLeads...");
    const paginatedLeads = await ContactAdminService.getLeads({
      search: "Service E2E",
      pagination: {
        page: 1,
        pageSize: 10
      }
    });

    const listItem = paginatedLeads.items.find(item => item.id === leadId);
    if (!listItem) {
      throw new Error("Lead list DTO did not contain the newly created lead");
    }

    // List DTO asserts: verify message and email are NOT exposed (lazy loading)
    if ("message" in listItem || "email" in listItem || "metadata" in listItem) {
      throw new Error("LeadListItemDTO is exposing detailed lead fields (violates lazy loading DTO security)");
    }
    console.log("LeadListItemDTO validated: lightweight format, private fields protected.");

    // 4. Retrieve complete lead detail DTO via ContactAdminService.getLeadById (lazy load)
    console.log("Retrieving lead detail DTO via ContactAdminService.getLeadById...");
    const detailedLead = await ContactAdminService.getLeadById(leadId);
    if (!detailedLead) {
      throw new Error("Could not load lead detail by ID");
    }

    if (detailedLead.email !== uniqueEmail || detailedLead.message !== "Verifying service layer, DTO conversions, and logging.") {
      throw new Error("LeadDetailDTO fields do not match");
    }
    
    if (detailedLead.metadata.ip !== "10.0.0.1" || detailedLead.metadata.userAgent !== "Playwright Integration Runner") {
      throw new Error("LeadDetailDTO metadata is missing fields");
    }
    console.log("LeadDetailDTO validated: details and metadata loaded successfully.");

    // 5. Mutate status and metadata using ContactAdminService.updateLead
    console.log("Updating lead via ContactAdminService.updateLead...");
    const updated = await ContactAdminService.updateLead(leadId, {
      status: "won",
      metadata: {
        notes: "Lead has been won! Test passed."
      }
    });

    if (updated.status !== "won") {
      throw new Error(`Expected status to be won, got: ${updated.status}`);
    }

    if (updated.metadata.ip !== "10.0.0.1" || updated.metadata.notes !== "Lead has been won! Test passed.") {
      throw new Error("Lead update did not merge metadata atomically");
    }
    console.log("ContactAdminService.updateLead verified: update maps correctly to DTO.");

  } catch (err) {
    console.error("Service test failed:", err);
    process.exit(1);
  } finally {
    // Cleanup: Ensure the test lead is deleted from the DB
    console.log("Cleaning up service test lead from database...");
    await sql`DELETE FROM contacts WHERE email = ${uniqueEmail}`;
    console.log("Cleanup finished. Database pristine.");
    await sql.end();
    console.log("Services tests completed successfully! ✅");
  }
}

testServices();
