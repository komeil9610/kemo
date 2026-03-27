import crypto from 'node:crypto';

const [, , nameArg, emailArg, passwordArg] = process.argv;

if (!nameArg || !emailArg || !passwordArg) {
  console.error('Usage: node scripts/generate-admin-sql.mjs "<name>" "<email>" "<password>"');
  process.exit(1);
}

const name = nameArg.trim();
const email = emailArg.trim().toLowerCase();
const password = passwordArg;

if (password.length < 6) {
  console.error('Password must be at least 6 characters.');
  process.exit(1);
}

const passwordHash = crypto
  .createHash('sha256')
  .update(`${email}:${password}`)
  .digest('hex');

const escapeSql = (value) => value.replace(/'/g, "''");

const sql = `INSERT INTO users (name, email, password_hash, role, status)
VALUES ('${escapeSql(name)}', '${escapeSql(email)}', '${passwordHash}', 'admin', 'active');`;

console.log(sql);
