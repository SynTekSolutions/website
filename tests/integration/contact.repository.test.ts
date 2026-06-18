import dotenv from "dotenv";
import postgres from "postgres";
import { SupabaseContactRepository } from "../../src/features/contact/repositories/supabase-contact.repository";
import { Lead } from "../../src/features/contact/types";
import crypto from "crypto";

dotenv.config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is not set in .env.local");
  process.exit(1);
}

const sql = postgres(databaseUrl);
const repo = new SupabaseContactRepository();

async function testRepository() {
  console.log("Running Repository integration tests...");

  const testId = crypto.randomUUID();
  
  try {
    // 1. Create a lead using repository
    const initialLead: Lead = {
      id:         testId,
      name:       "Repo Test Lead",
      email:      "repo-test@syntek.solutions",
      phone:      "5551234",
      company:    "Repository QA Corp",
      service:    "IT Consulting",
      message:    "Testing the repository save.",
      status:     "new",
      origin:     "test",
      created_at: new Date(),
      updated_at: new Date(),
      metadata: {
        ip: "8.8.8.8",
        userAgent: "Jest Runner"
      }
    };

    console.log("Creating test lead via repository...");
    await repo.create(initialLead);
    console.log("Lead created in DB:", testId);

    // 2. Fetch the lead by ID and verify fields
    console.log("Fetching lead by ID...");
    const lead = await repo.findById(testId);
    if (!lead) {
      throw new Error(`Expected to find lead with ID ${testId}, but got null`);
    }

    if (lead.name !== "Repo Test Lead" || lead.company !== "Repository QA Corp") {
      throw new Error("Lead fields do not match inserted values");
    }
    
    if (lead.metadata.ip !== "8.8.8.8" || lead.metadata.userAgent !== "Jest Runner") {
      throw new Error("Metadata was not saved correctly");
    }
    console.log("Fetch by ID verified: Data matches domain model perfectly.");

    // 3. Update status and metadata JSONB merge via repository
    console.log("Updating lead status and metadata...");
    const updated = await repo.update(testId, {
      status: "qualified",
      metadata: {
        notes: "Repository tests are looking solid.",
        assignedTo: "Lead Architect"
      }
    });

    if (updated.status !== "qualified") {
      throw new Error(`Expected status to be qualified, got: ${updated.status}`);
    }

    if (updated.metadata.ip !== "8.8.8.8" || updated.metadata.notes !== "Repository tests are looking solid.") {
      throw new Error("Repository update did not merge metadata correctly");
    }
    console.log("Repository update verified: Atomic JSONB merge works.");

    // 4. Test error handling for non-existent lead
    const fakeId = crypto.randomUUID();
    try {
      await repo.update(fakeId, { status: "proposal" });
      throw new Error("Expected repository.update to throw NotFoundError for non-existent ID, but it did not.");
    } catch (err) {
      const error = err as Error;
      if (error.name === "NotFoundError" || error.message.includes("Lead not found")) {
        console.log("Repository exception mapping verified: NotFoundError is thrown correctly.");
      } else {
        throw err;
      }
    }

    // 5. Test stable pagination sorting
    console.log("Testing repo.find filter and sort stable paging...");
    const result = await repo.find({
      search: "Repo Test",
      status: "qualified",
      pagination: {
        page: 1,
        pageSize: 10
      }
    });

    if (result.items.length === 0) {
      throw new Error("Expected to find at least one matching lead in pagination results");
    }
    console.log("Pagination search and filtering verified successfully.");

  } catch (err) {
    console.error("Repository test failed:", err);
    process.exit(1);
  } finally {
    // Cleanup: Ensure the test lead is ALWAYS deleted to leave database pristine
    console.log("Cleaning up test lead from database...");
    await sql`DELETE FROM contacts WHERE id = ${testId}`;
    console.log("Cleanup finished. Database pristine.");
    await sql.end();
    console.log("Repository tests completed successfully! ✅");
  }
}

testRepository();
