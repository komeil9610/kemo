import crypto from 'node:crypto';

const [, , nameArg, emailArg, passwordArg, roleArg = 'operations_manager'] = process.argv;
const allowedRoles = new Set(['customer_service', 'operations_manager', 'excel_uploader', 'member']);

if (!nameArg || !emailArg || !passwordArg) {
  console.error('Usage: node scripts/generate-admin-sql.mjs "<name>" "<email>" "<password>" "[role]"');
  process.exit(1);
}

const name = nameArg.trim();
const email = emailArg.trim().toLowerCase();
const password = passwordArg;
const role = roleArg.trim().toLowerCase();

if (password.length < 6) {
  console.error('Password must be at least 6 characters.');
  process.exit(1);
}

if (!allowedRoles.has(role)) {
  console.error(`Role must be one of: ${Array.from(allowedRoles).join(', ')}`);
  process.exit(1);
}

const passwordHash = crypto
  .createHash('sha256')
  .update(`${email}:${password}`)
  .digest('hex');

const escapeSql = (value) => value.replace(/'/g, "''");

const workspaceInsert =
  role === 'member'
    ? ''
    : `

INSERT INTO user_workspace_roles (user_id, role)
SELECT id, '${escapeSql(role)}'
FROM users
WHERE email = '${escapeSql(email)}'
ON CONFLICT(user_id, role) DO NOTHING;`;

const sql = `INSERT INTO users (name, email, password_hash, role, status)
VALUES ('${escapeSql(name)}', '${escapeSql(email)}', '${passwordHash}', '${escapeSql(role)}', 'active')
ON CONFLICT(email) DO UPDATE SET
  name = excluded.name,
  password_hash = excluded.password_hash,
  role = excluded.role,
  status = excluded.status;${workspaceInsert}`;

console.log(sql);
