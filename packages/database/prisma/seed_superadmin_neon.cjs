const path = require('path');
const fs = require('fs');
const bcrypt = require(path.join(__dirname, '..', '..', '..', 'node_modules', '.pnpm', 'bcrypt@6.0.0', 'node_modules', 'bcrypt'));
const { Client } = require(path.join(__dirname, '..', 'node_modules', 'pg'));

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
const match = envContent.match(/DATABASE_URL="([^"]+)"/);
if (!match) {
  console.error("No DATABASE_URL found");
  process.exit(1);
}

const client = new Client({ connectionString: match[1] });

async function main() {
  await client.connect();
  console.log("Connected to Neon DB successfully.");

  // Password Hash for Sakib@123
  const passwordHash = await bcrypt.hash('Sakib@123', 12);

  // 1. Get or create Tenant
  let tenantRes = await client.query("SELECT id FROM tenants LIMIT 1");
  let tenantId;
  if (tenantRes.rows.length === 0) {
    const newTenant = await client.query(
      `INSERT INTO tenants (id, name, slug, status, created_at, updated_at)
       VALUES (gen_random_uuid(), 'OmniStay Global HQ', 'omnistay-hq', 'ACTIVE', NOW(), NOW())
       RETURNING id;`
    );
    tenantId = newTenant.rows[0].id;
  } else {
    tenantId = tenantRes.rows[0].id;
  }
  console.log("Using Tenant ID:", tenantId);

  // 2. Get or create Platform SuperAdmin Role
  let roleRes = await client.query(
    "SELECT id FROM roles WHERE organization_id = $1 AND name = 'Platform SuperAdmin' LIMIT 1",
    [tenantId]
  );
  let roleId;
  if (roleRes.rows.length === 0) {
    const newRole = await client.query(
      `INSERT INTO roles (id, organization_id, name, permissions, is_system_role, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, 'Platform SuperAdmin', ARRAY['*'], true, NOW(), NOW())
       RETURNING id;`,
      [tenantId]
    );
    roleId = newRole.rows[0].id;
  } else {
    roleId = roleRes.rows[0].id;
  }
  console.log("Using Role ID:", roleId);

  // 3. Upsert Users (sadmansakib8530@gmail.com and admin@omnistay.com)
  const usersToSeed = [
    { email: 'sadmansakib8530@gmail.com', name: 'Sadman Sakib' },
    { email: 'admin@omnistay.com', name: 'Platform Administrator' }
  ];

  for (const u of usersToSeed) {
    const existing = await client.query("SELECT id FROM users WHERE email = $1", [u.email]);
    let userId;
    if (existing.rows.length === 0) {
      const ins = await client.query(
        `INSERT INTO users (id, tenant_id, name, email, password_hash, is_superadmin, status, is_two_factor_enabled, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, true, 'ACTIVE', false, NOW(), NOW())
         RETURNING id;`,
        [tenantId, u.name, u.email, passwordHash]
      );
      userId = ins.rows[0].id;
      console.log(`Created user ${u.email} (${userId})`);
    } else {
      userId = existing.rows[0].id;
      await client.query(
        `UPDATE users
         SET password_hash = $1, is_superadmin = true, is_two_factor_enabled = false, status = 'ACTIVE', tenant_id = $2, updated_at = NOW()
         WHERE id = $3;`,
        [passwordHash, tenantId, userId]
      );
      console.log(`Updated user ${u.email} (${userId}) with active status and password`);
    }

    // Upsert Membership
    const memRes = await client.query(
      "SELECT id FROM memberships WHERE organization_id = $1 AND user_id = $2",
      [tenantId, userId]
    );
    if (memRes.rows.length === 0) {
      await client.query(
        `INSERT INTO memberships (id, organization_id, user_id, role_id, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW());`,
        [tenantId, userId, roleId]
      );
      console.log(`Created membership for ${u.email}`);
    } else {
      await client.query(
        `UPDATE memberships SET role_id = $1, updated_at = NOW() WHERE id = $2;`,
        [roleId, memRes.rows[0].id]
      );
      console.log(`Updated membership for ${u.email}`);
    }
  }

  console.log("=== Seed Completed Successfully! ===");
  await client.end();
}

main().catch(err => {
  console.error("Error seeding users:", err);
  process.exit(1);
});

