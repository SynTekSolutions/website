import dotenv from "dotenv";
import postgres from "postgres";
import crypto from "crypto";

dotenv.config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is not set in .env.local");
  process.exit(1);
}

const sql = postgres(databaseUrl);

async function testRpc() {
  console.log("Running RPC integration tests...");

  try {
    await sql.begin(async (sql) => {
      // 1. Create a temporary test contact to perform updates on
      const contactId = crypto.randomUUID();
      await sql`
        INSERT INTO contacts (
          id, name, email, message, status, origin, metadata, created_at, updated_at
        ) VALUES (
          ${contactId}, 
          'RPC Test Contact', 
          'rpc-test@syntek.solutions', 
          'Testing the RPC logic.', 
          'new', 
          'test', 
          ${sql.json({ ip: "127.0.0.1", referrer: "http://localhost:3000" })}, 
          NOW(), 
          NOW()
        )
      `;

      console.log("Inserted test contact in transaction:", contactId);

      // 2. Call RPC update_contact_v1 to update status and merge metadata
      const [updatedContact] = await sql`
        SELECT * FROM update_contact_v1(
          ${contactId}, 
          'contacted', 
          ${sql.json({ notes: "RPC Call successfully tested.", assignedTo: "QA" })}
        )
      `;

      if (!updatedContact) {
        throw new Error("RPC returned no data");
      }

      console.log("RPC returned updated contact row successfully");

      // Asserts
      if (updatedContact.status !== "contacted") {
        throw new Error(`Expected status to be contacted, got: ${updatedContact.status}`);
      }

      const meta = typeof updatedContact.metadata === 'string' ? JSON.parse(updatedContact.metadata) : updatedContact.metadata;
      if (meta.notes !== "RPC Call successfully tested." || meta.ip !== "127.0.0.1") {
        throw new Error("Metadata was not merged correctly in RPC");
      }
      console.log("RPC metadata atomic merge verified: IP retained, notes added.");

      // 3. Test existence validation (throwing exception if contact not found)
      const fakeId = crypto.randomUUID();
      try {
        await sql`
          SELECT * FROM update_contact_v1(
            ${fakeId}, 
            'contacted', 
            ${sql.json({})}
          )
        `;
        throw new Error("Expected RPC to throw exception for non-existent contact, but it did not.");
      } catch (err) {
        const error = err as Error;
        if (error.message && error.message.includes("Contact not found")) {
          console.log("RPC exception validation verified: throws 'Contact not found' for invalid IDs.");
        } else {
          throw err;
        }
      }

      // Force Rollback by throwing an intentional error
      throw new Error("FORCE_ROLLBACK");
    });
  } catch (err) {
    const error = err as Error;
    if (error.message === "FORCE_ROLLBACK") {
      console.log("Transaction rolled back successfully. Database remains clean.");
      console.log("RPC tests completed successfully! ✅");
    } else {
      console.error("RPC test failed:", err);
      process.exit(1);
    }
  } finally {
    await sql.end();
  }
}

testRpc();
