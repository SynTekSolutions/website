-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor_id" TEXT,
    "actor_email" TEXT,
    "organization_id" TEXT,
    "request_id" TEXT,
    "session_id" TEXT,
    "action" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT,
    "result" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "status_code" INTEGER,
    "error_code" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_audit_logs_created_at" ON "audit_logs"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_audit_logs_actor_created" ON "audit_logs"("actor_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_audit_logs_org_created" ON "audit_logs"("organization_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_audit_logs_action" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "idx_audit_logs_resource" ON "audit_logs"("resource_type", "resource_id");
