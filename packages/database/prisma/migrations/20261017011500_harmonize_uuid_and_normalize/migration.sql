-- Phase 1: Database Harmonization (CUID to UUIDv4, snake_case mapping, normalized permissions, audit columns)
-- Softsasi OmniStay 360 - Safe Non-Destructive Migration

-- 1. Ensure UUID generation function is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Add temporary UUID columns to existing foundation tables
ALTER TABLE "User" 
  ADD COLUMN IF NOT EXISTS "new_id" UUID DEFAULT gen_random_uuid();

ALTER TABLE "Organization" 
  ADD COLUMN IF NOT EXISTS "new_id" UUID DEFAULT gen_random_uuid();

ALTER TABLE "Role" 
  ADD COLUMN IF NOT EXISTS "new_id" UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS "new_organization_id" UUID;

ALTER TABLE "Membership" 
  ADD COLUMN IF NOT EXISTS "new_id" UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS "new_user_id" UUID,
  ADD COLUMN IF NOT EXISTS "new_organization_id" UUID,
  ADD COLUMN IF NOT EXISTS "new_role_id" UUID;

ALTER TABLE "Hotel" 
  ADD COLUMN IF NOT EXISTS "new_id" UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS "new_organization_id" UUID;

ALTER TABLE "RefreshToken" 
  ADD COLUMN IF NOT EXISTS "new_id" UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS "new_user_id" UUID;

-- 3. Populate temporary foreign keys by joining existing CUIDs
UPDATE "Role" r 
SET "new_organization_id" = o."new_id" 
FROM "Organization" o 
WHERE r."organizationId" = o."id";

UPDATE "Membership" m 
SET "new_user_id" = u."new_id",
    "new_organization_id" = o."new_id",
    "new_role_id" = r."new_id"
FROM "User" u, "Organization" o, "Role" r
WHERE m."userId" = u."id" 
  AND m."organizationId" = o."id" 
  AND m."roleId" = r."id";

UPDATE "Hotel" h 
SET "new_organization_id" = o."new_id" 
FROM "Organization" o 
WHERE h."organizationId" = o."id";

UPDATE "RefreshToken" rt 
SET "new_user_id" = u."new_id" 
FROM "User" u 
WHERE rt."userId" = u."id";

-- 4. Create normalized permissions tables (PDF Chapter 3 §3.2)
CREATE TABLE IF NOT EXISTS "permissions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "permissions_name_key" ON "permissions"("name");

CREATE TABLE IF NOT EXISTS "role_permissions" (
  "role_id" UUID NOT NULL,
  "permission_id" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id", "permission_id")
);

CREATE INDEX IF NOT EXISTS "role_permissions_permission_id_idx" ON "role_permissions"("permission_id");

-- 5. Migrate permissions from Role array to normalized permissions & role_permissions
INSERT INTO "permissions" ("name")
SELECT DISTINCT unnest("permissions") 
FROM "Role" 
WHERE "permissions" IS NOT NULL
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r."new_id", p."id"
FROM "Role" r, unnest(r."permissions") AS perm_name
JOIN "permissions" p ON p."name" = perm_name
ON CONFLICT DO NOTHING;

-- 6. Drop existing foreign key constraints
ALTER TABLE "Role" DROP CONSTRAINT IF EXISTS "Role_organizationId_fkey";
ALTER TABLE "Membership" DROP CONSTRAINT IF EXISTS "Membership_userId_fkey";
ALTER TABLE "Membership" DROP CONSTRAINT IF EXISTS "Membership_organizationId_fkey";
ALTER TABLE "Membership" DROP CONSTRAINT IF EXISTS "Membership_roleId_fkey";
ALTER TABLE "Hotel" DROP CONSTRAINT IF EXISTS "Hotel_organizationId_fkey";
ALTER TABLE "RefreshToken" DROP CONSTRAINT IF EXISTS "RefreshToken_userId_fkey";

-- 7. Drop existing primary key constraints
ALTER TABLE "Membership" DROP CONSTRAINT IF EXISTS "Membership_pkey";
ALTER TABLE "Role" DROP CONSTRAINT IF EXISTS "Role_pkey";
ALTER TABLE "Hotel" DROP CONSTRAINT IF EXISTS "Hotel_pkey";
ALTER TABLE "RefreshToken" DROP CONSTRAINT IF EXISTS "RefreshToken_pkey";
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_pkey";
ALTER TABLE "Organization" DROP CONSTRAINT IF EXISTS "Organization_pkey";

-- 8. Drop old CUID columns
ALTER TABLE "Membership" DROP COLUMN IF EXISTS "userId", DROP COLUMN IF EXISTS "organizationId", DROP COLUMN IF EXISTS "roleId", DROP COLUMN IF EXISTS "id";
ALTER TABLE "Role" DROP COLUMN IF EXISTS "organizationId", DROP COLUMN IF EXISTS "id";
ALTER TABLE "Hotel" DROP COLUMN IF EXISTS "organizationId", DROP COLUMN IF EXISTS "id";
ALTER TABLE "RefreshToken" DROP COLUMN IF EXISTS "userId", DROP COLUMN IF EXISTS "id";
ALTER TABLE "User" DROP COLUMN IF EXISTS "id";
ALTER TABLE "Organization" DROP COLUMN IF EXISTS "id";

-- 9. Rename temporary UUID columns to final column names
ALTER TABLE "User" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "Organization" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "Role" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "Role" RENAME COLUMN "new_organization_id" TO "organization_id";
ALTER TABLE "Membership" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "Membership" RENAME COLUMN "new_user_id" TO "user_id";
ALTER TABLE "Membership" RENAME COLUMN "new_organization_id" TO "organization_id";
ALTER TABLE "Membership" RENAME COLUMN "new_role_id" TO "role_id";
ALTER TABLE "Hotel" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "Hotel" RENAME COLUMN "new_organization_id" TO "organization_id";
ALTER TABLE "RefreshToken" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "RefreshToken" RENAME COLUMN "new_user_id" TO "user_id";

-- 10. Rename existing columns to snake_case matching schema @map
ALTER TABLE "User" RENAME COLUMN "passwordHash" TO "password_hash";
ALTER TABLE "User" RENAME COLUMN "twoFactorSecret" TO "two_factor_secret";
ALTER TABLE "User" RENAME COLUMN "isTwoFactorEnabled" TO "is_two_factor_enabled";
ALTER TABLE "User" RENAME COLUMN "twoFactorConfirmedAt" TO "two_factor_confirmed_at";
ALTER TABLE "User" RENAME COLUMN "twoFactorRecoveryCodes" TO "two_factor_recovery_codes";
ALTER TABLE "User" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "User" RENAME COLUMN "updatedAt" TO "updated_at";

ALTER TABLE "Organization" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "Organization" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "domain" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "subdomain" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'active';

ALTER TABLE "Role" RENAME COLUMN "isSystemRole" TO "is_system_role";
ALTER TABLE "Role" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "Role" RENAME COLUMN "updatedAt" TO "updated_at";

ALTER TABLE "Membership" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "Membership" RENAME COLUMN "updatedAt" TO "updated_at";

ALTER TABLE "Hotel" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "Hotel" RENAME COLUMN "updatedAt" TO "updated_at";

ALTER TABLE "RefreshToken" RENAME COLUMN "tokenHash" TO "token_hash";
ALTER TABLE "RefreshToken" RENAME COLUMN "familyId" TO "family_id";
ALTER TABLE "RefreshToken" RENAME COLUMN "isRevoked" TO "is_revoked";
ALTER TABLE "RefreshToken" RENAME COLUMN "expiresAt" TO "expires_at";
ALTER TABLE "RefreshToken" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "RefreshToken" RENAME COLUMN "updatedAt" TO "updated_at";

-- 11. Add audit and soft-delete columns (PDF Chapter 3 §3.1)
ALTER TABLE "User" 
  ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "created_by" UUID,
  ADD COLUMN IF NOT EXISTS "updated_by" UUID;

ALTER TABLE "Organization" 
  ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "created_by" UUID,
  ADD COLUMN IF NOT EXISTS "updated_by" UUID;

ALTER TABLE "Role" 
  ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "created_by" UUID,
  ADD COLUMN IF NOT EXISTS "updated_by" UUID;

ALTER TABLE "Membership" 
  ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "created_by" UUID,
  ADD COLUMN IF NOT EXISTS "updated_by" UUID;

ALTER TABLE "Hotel" 
  ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "created_by" UUID,
  ADD COLUMN IF NOT EXISTS "updated_by" UUID;

ALTER TABLE "RefreshToken" 
  ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

-- 12. Rename tables to snake_case matching schema @@map
ALTER TABLE "User" RENAME TO "users";
ALTER TABLE "Organization" RENAME TO "tenants";
ALTER TABLE "Role" RENAME TO "roles";
ALTER TABLE "Membership" RENAME TO "memberships";
ALTER TABLE "Hotel" RENAME TO "properties";
ALTER TABLE "RefreshToken" RENAME TO "refresh_tokens";

-- 13. Re-establish Primary Keys on UUID columns
ALTER TABLE "users" ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_pkey" PRIMARY KEY ("id");
ALTER TABLE "roles" ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_pkey" PRIMARY KEY ("id");
ALTER TABLE "properties" ADD CONSTRAINT "properties_pkey" PRIMARY KEY ("id");
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id");

-- 14. Re-establish Foreign Keys referencing UUID columns
ALTER TABLE "roles" 
  ADD CONSTRAINT "roles_organization_id_fkey" 
  FOREIGN KEY ("organization_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "role_permissions" 
  ADD CONSTRAINT "role_permissions_role_id_fkey" 
  FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "role_permissions" 
  ADD CONSTRAINT "role_permissions_permission_id_fkey" 
  FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "memberships" 
  ADD CONSTRAINT "memberships_user_id_fkey" 
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "memberships" 
  ADD CONSTRAINT "memberships_organization_id_fkey" 
  FOREIGN KEY ("organization_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "memberships" 
  ADD CONSTRAINT "memberships_role_id_fkey" 
  FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "properties" 
  ADD CONSTRAINT "properties_organization_id_fkey" 
  FOREIGN KEY ("organization_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "refresh_tokens" 
  ADD CONSTRAINT "refresh_tokens_user_id_fkey" 
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 15. Re-create / ensure unique constraints and indexes
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE INDEX IF NOT EXISTS "users_status_idx" ON "users"("status");
CREATE INDEX IF NOT EXISTS "users_deleted_at_idx" ON "users"("deleted_at");

CREATE UNIQUE INDEX IF NOT EXISTS "tenants_slug_key" ON "tenants"("slug");
CREATE INDEX IF NOT EXISTS "tenants_deleted_at_idx" ON "tenants"("deleted_at");

CREATE UNIQUE INDEX IF NOT EXISTS "roles_organization_id_name_key" ON "roles"("organization_id", "name");
CREATE INDEX IF NOT EXISTS "roles_organization_id_idx" ON "roles"("organization_id");
CREATE INDEX IF NOT EXISTS "roles_deleted_at_idx" ON "roles"("deleted_at");

CREATE UNIQUE INDEX IF NOT EXISTS "memberships_organization_id_user_id_key" ON "memberships"("organization_id", "user_id");
CREATE INDEX IF NOT EXISTS "memberships_user_id_idx" ON "memberships"("user_id");
CREATE INDEX IF NOT EXISTS "memberships_role_id_idx" ON "memberships"("role_id");
CREATE INDEX IF NOT EXISTS "memberships_deleted_at_idx" ON "memberships"("deleted_at");

CREATE UNIQUE INDEX IF NOT EXISTS "properties_organization_id_code_key" ON "properties"("organization_id", "code");
CREATE INDEX IF NOT EXISTS "properties_organization_id_idx" ON "properties"("organization_id");
CREATE INDEX IF NOT EXISTS "properties_deleted_at_idx" ON "properties"("deleted_at");

CREATE UNIQUE INDEX IF NOT EXISTS "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");
CREATE INDEX IF NOT EXISTS "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");
CREATE INDEX IF NOT EXISTS "refresh_tokens_family_id_idx" ON "refresh_tokens"("family_id");
CREATE INDEX IF NOT EXISTS "refresh_tokens_deleted_at_idx" ON "refresh_tokens"("deleted_at");
