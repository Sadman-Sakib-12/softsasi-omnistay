const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Sakib@localhost:5432/omnistay_dev?schema=public',
  });
  await client.connect();

  const passwordHash = '$2b$10$xgeY49LaguXQQ.lX2t/61uF.WUqB16coXo/qCXZ1x1Y5xUIKBOTYi';

  // 1. Get or create Tenant
  let tenantRes = await client.query("SELECT id FROM tenants WHERE slug = 'omnistay-hq' LIMIT 1");
  let tenantId;
  if (tenantRes.rows.length === 0) {
    const newTenant = await client.query(
      "INSERT INTO tenants (id, name, slug, status, created_at, updated_at) VALUES (gen_random_uuid(), 'OmniStay Global HQ', 'omnistay-hq', 'ACTIVE', NOW(), NOW()) RETURNING id"
    );
    tenantId = newTenant.rows[0].id;
  } else {
    tenantId = tenantRes.rows[0].id;
  }

  // 2. Get or create Role
  let roleRes = await client.query(
    "SELECT id FROM roles WHERE organization_id = $1 AND name = 'Platform SuperAdmin' LIMIT 1",
    [tenantId]
  );
  let roleId;
  if (roleRes.rows.length === 0) {
    const newRole = await client.query(
      "INSERT INTO roles (id, organization_id, name, permissions, is_system_role, created_at, updated_at) VALUES (gen_random_uuid(), $1, 'Platform SuperAdmin', ARRAY['*'], true, NOW(), NOW()) RETURNING id",
      [tenantId]
    );
    roleId = newRole.rows[0].id;
  } else {
    roleId = roleRes.rows[0].id;
  }

  // 3. Upsert superadmin@omnistay.com
  let userRes = await client.query("SELECT id FROM users WHERE email = 'superadmin@omnistay.com'");
  let userId;
  if (userRes.rows.length === 0) {
    const newUser = await client.query(
      "INSERT INTO users (id, tenant_id, name, email, password_hash, is_superadmin, status, is_two_factor_enabled, created_at, updated_at) VALUES (gen_random_uuid(), $1, 'Super Administrator', 'superadmin@omnistay.com', $2, true, 'ACTIVE', false, NOW(), NOW()) RETURNING id",
      [tenantId, passwordHash]
    );
    userId = newUser.rows[0].id;
  } else {
    userId = userRes.rows[0].id;
    await client.query(
      "UPDATE users SET password_hash = $1, is_superadmin = true, is_two_factor_enabled = false, status = 'ACTIVE' WHERE id = $2",
      [passwordHash, userId]
    );
  }

  // 4. Upsert membership
  const memRes = await client.query(
    "SELECT id FROM memberships WHERE organization_id = $1 AND user_id = $2",
    [tenantId, userId]
  );
  if (memRes.rows.length === 0) {
    await client.query(
      "INSERT INTO memberships (id, organization_id, user_id, role_id, created_at, updated_at) VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())",
      [tenantId, userId, roleId]
    );
  } else {
    await client.query(
      "UPDATE memberships SET role_id = $1 WHERE id = $2",
      [roleId, memRes.rows[0].id]
    );
  }

  console.log('SUCCESS: superadmin@omnistay.com created/updated in database with Password@123!');
  await client.end();
}

main().catch(console.error);
