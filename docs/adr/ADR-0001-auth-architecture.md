# ADR 0001: Authentication & Authorization Architecture

## Status
Approved

## Context
SynTek Solutions CRM requires a secure, production-grade authentication and authorization mechanism for Sprint 2.4. We chose Clerk as our Identity Provider (IdP). To maintain a clean architecture, we must decouple authentication from our domain logic, synchronize Clerk users with our local PostgreSQL database, enforce role-based permissions, support action auditing, and handle concurrency/resilience scenarios cleanly.

## Decisions

### 1. Identity vs. Domain Separation
* **Clerk** is the single source of truth for identity management, user credentials, passwords, session lifecycle, OAuth integrations, and MFA.
* **PostgreSQL** is the single source of truth for the application domain, including user profile records, roles, permissions, operational state, audit trails, and data relationships.

### 2. Provider Isolation
No business logic, API routes, or React components outside of the `src/auth/` directory may import packages from `@clerk/nextjs` or `@clerk/nextjs/server`. All auth operations must pass through the custom abstractions in `src/auth/`.

### 3. Permissions-Based Authorization
* Business logic must only authorize users via permissions using `requirePermission(Permission.ACTION)`.
* Direct role-checking (e.g. `user.role === "ADMIN"`) is forbidden in business logic.
* The translation of roles into permissions is strictly encapsulated inside the authorization layer (`src/auth/permissions.ts`).

### 4. Resilience & Hybrid Sync
* To guard against network latency, delayed webhook delivery, or duplicated event delivery, a hybrid synchronization model is established:
  * **Primary Sync:** Clerk Webhooks receive asynchronous push notifications to create/update/delete user records.
  * **Fallback JIT Sync:** In the event that a user logs in but the webhook delivery is delayed, the request lifecycle calling `getCurrentUser()` will trigger a Just-In-Time (JIT) sync to fetch the user profile from Clerk's API and upsert it into PostgreSQL.
  * Webhook and JIT sync write operations must be safe against concurrent execution using database-level `UPSERT` commands.

### 5. Soft Deletes
* Deletion events (`user.deleted`) received via Clerk Webhooks must perform a soft delete (`is_active = false`, `deleted_at = now()`) on the PostgreSQL `User` record to preserve historical audit records and data relationships.

### 6. Inactive User Policy
* If an authenticated user tries to execute an action but their local PostgreSQL user record has `isActive === false` (i.e. they are soft-deleted or suspended), `getCurrentUser()` will raise a `ForbiddenError` and force a session logout/cleanup.

### 7. Database Never Trusts Clerk Roles
* Clerk is only trusted for profile properties (name, email, avatar). 
* Authorization parameters (roles, permissions, organization memberships, billing, feature flags) must only be defined, validated, and read from the local PostgreSQL database to prevent unauthorized privilege escalation via Clerk's public metadata.

### 8. Authentication != Authorization Flow
* Authentication is separated from authorization. The flow is:
  ```
  Clerk (Authn) ──> CurrentUser ──> PostgreSQL ──> Authorization (RBAC/Perms) ──> Business Logic
  ```
  No component outside of `src/auth/` should map authentication states directly to permissions.

### 9. Event Ownership on Synchronization
* Webhook events have strict single-owner handlers inside `src/auth/handlers/` (e.g., `user.created` -> `handleUserCreated`, `user.updated` -> `handleUserUpdated`, `user.deleted` -> `handleUserDeleted`).
* All other unhandled webhook events are ignored explicitly and return `200 OK`.
* Webhook handlers must strictly perform data synchronization. No business logic (e.g. sending welcome emails, creating default CRM records) may be executed within webhook handlers.

## Consequences
* High resilience: the application is immune to race conditions where a user authenticates before the webhook finishes processing.
* Zero vendor lock-in for business logic: the entire application uses `src/auth/` abstractions, making it simple to replace or mock Clerk in testing or future sprints.
* Clear database foreign keys: audit trails link to standard PostgreSQL UUID foreign keys rather than external Clerk string IDs.
