import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const edgeApiOrigin = process.env.CLOUDFLARE_API_ORIGIN || 'https://api.kumeelalnahab.com';
const frontendOrigin = process.env.CLOUDFLARE_APP_ORIGIN || 'https://kumeelalnahab.com';
const seedCloudflareTechnicians = process.env.CLOUDFLARE_SEED_TECHNICIANS !== 'false';
const importJobsQueueName = process.env.CLOUDFLARE_IMPORT_QUEUE || 'tarkeeb-import-jobs';

const mahmoudPasswordHash = '5e480eeb5034e94dc686598221daaa44278e3864267a8d0b5cd187d3eb481b4a';

function run(command, args, cwd, extraEnv = {}) {
  const result = spawnSync(command, args, {
    cwd,
    env: {
      ...process.env,
      ...extraEnv,
    },
    stdio: 'inherit',
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`);
  }
}

function runCapture(command, args, cwd, extraEnv = {}) {
  const result = spawnSync(command, args, {
    cwd,
    env: {
      ...process.env,
      ...extraEnv,
    },
    encoding: 'utf8',
  });

  if (result.error) {
    throw result.error;
  }

  return result;
}

function ensureRemoteColumn(tableName, columnName, alterSql) {
  const describe = runCapture(
    'npx',
    ['wrangler', 'd1', 'execute', 'tarkeeb_pro_db', '--remote', '--command', `PRAGMA table_info(${tableName});`],
    path.join(repoRoot, 'edge-api')
  );

  if (describe.status !== 0) {
    throw new Error(describe.stderr || `Unable to inspect ${tableName}`);
  }

  if ((describe.stdout || '').includes(columnName)) {
    return;
  }

  run(
    'npx',
    ['wrangler', 'd1', 'execute', 'tarkeeb_pro_db', '--remote', '--command', alterSql],
    path.join(repoRoot, 'edge-api')
  );
}

function ensureQueue(queueName) {
  const result = runCapture('npx', ['wrangler', 'queues', 'create', queueName], path.join(repoRoot, 'edge-api'));
  if (result.status === 0) {
    return;
  }

  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  if (/already exists/i.test(output)) {
    return;
  }

  throw new Error(output || `Unable to create queue ${queueName}`);
}

function migrateRemoteOperationsSchema() {
  ensureRemoteColumn('technicians', 'notes', "ALTER TABLE technicians ADD COLUMN notes TEXT NOT NULL DEFAULT '';");
  ensureRemoteColumn('technicians', 'coverage_json', "ALTER TABLE technicians ADD COLUMN coverage_json TEXT NOT NULL DEFAULT '[]';");
  run(
    'npx',
    [
      'wrangler',
      'd1',
      'execute',
      'tarkeeb_pro_db',
      '--remote',
      '--command',
      "UPDATE technicians SET coverage_json = CASE WHEN TRIM(COALESCE(coverage_json, '')) = '' OR coverage_json = '[]' THEN json_array(zone) ELSE coverage_json END;",
    ],
    path.join(repoRoot, 'edge-api')
  );
  ensureRemoteColumn(
    'service_orders',
    'service_items_json',
    "ALTER TABLE service_orders ADD COLUMN service_items_json TEXT NOT NULL DEFAULT '[]';"
  );
}

function seedTechniciansIfNeeded() {
  if (!seedCloudflareTechnicians) {
    return;
  }

  const seedSql = [
    "INSERT INTO users (name, email, password_hash, role, status) VALUES ('محمود كميل', 'moreme112982@gmail.com', '" +
      mahmoudPasswordHash +
      "', 'technician', 'active') ON CONFLICT(email) DO UPDATE SET name = excluded.name, password_hash = excluded.password_hash, role = excluded.role, status = excluded.status;",
    "INSERT INTO technicians (user_id, name, phone, zone, coverage_json, status, notes) SELECT id, 'محمود كميل', '05041102100', 'riyadh', '[\"riyadh\"]', 'available', 'تغطية فعلية لمنطقة الرياض.' FROM users WHERE email = 'moreme112982@gmail.com' ON CONFLICT(user_id) DO UPDATE SET name = excluded.name, phone = excluded.phone, zone = excluded.zone, coverage_json = excluded.coverage_json, status = excluded.status, notes = excluded.notes;",
  ].join(' ');

  run(
    'npx',
    ['wrangler', 'd1', 'execute', 'tarkeeb_pro_db', '--remote', '--command', seedSql],
    path.join(repoRoot, 'edge-api')
  );
}

console.log(`Using frontend origin: ${frontendOrigin}`);
console.log(`Using edge API origin: ${edgeApiOrigin}`);

ensureQueue(importJobsQueueName);
migrateRemoteOperationsSchema();
run('npx', ['wrangler', 'd1', 'execute', 'tarkeeb_pro_db', '--remote', '--file=./migrations/0032_refresh_public_homepage.sql'], path.join(repoRoot, 'edge-api'));
run('npm', ['run', 'deploy'], path.join(repoRoot, 'edge-api'));
seedTechniciansIfNeeded();
run('npm', ['run', 'cf:deploy'], path.join(repoRoot, 'frontend'), {
  API_ORIGIN: edgeApiOrigin,
});
console.log('Cloudflare deployment complete.');
