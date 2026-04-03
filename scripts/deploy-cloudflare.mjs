import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const edgeApiOrigin = process.env.CLOUDFLARE_API_ORIGIN || 'https://tarkeeb-pro-edge-api.bobkumeel.workers.dev';
const frontendOrigin = process.env.CLOUDFLARE_APP_ORIGIN || 'https://tarkeeb-pro-frontend.bobkumeel.workers.dev';
const seedCloudflareTechnicians = process.env.CLOUDFLARE_SEED_TECHNICIANS !== 'false';

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

function migrateRemoteOperationsSchema() {
  ensureRemoteColumn('technicians', 'notes', "ALTER TABLE technicians ADD COLUMN notes TEXT NOT NULL DEFAULT '';");
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
    "INSERT INTO technicians (user_id, name, phone, zone, status, notes) SELECT id, 'محمود كميل', '05041102100', 'الرياض', 'available', 'تغطية فعلية لمنطقة الرياض.' FROM users WHERE email = 'moreme112982@gmail.com' ON CONFLICT(user_id) DO UPDATE SET name = excluded.name, phone = excluded.phone, zone = excluded.zone, status = excluded.status, notes = excluded.notes;",
  ].join(' ');

  run(
    'npx',
    ['wrangler', 'd1', 'execute', 'tarkeeb_pro_db', '--remote', '--command', seedSql],
    path.join(repoRoot, 'edge-api')
  );
}

console.log(`Using frontend origin: ${frontendOrigin}`);
console.log(`Using edge API origin: ${edgeApiOrigin}`);

migrateRemoteOperationsSchema();
run('npm', ['run', 'deploy'], path.join(repoRoot, 'edge-api'));
seedTechniciansIfNeeded();
run('npm', ['run', 'cf:deploy'], path.join(repoRoot, 'frontend'), {
  API_ORIGIN: edgeApiOrigin,
});
run('npm', ['run', 'build:apk:all'], path.join(repoRoot, 'apk'), {
  APP_ORIGIN: frontendOrigin,
  CAPACITOR_SERVER_ORIGIN: frontendOrigin,
  CLOUDFLARE_APP_ORIGIN: frontendOrigin,
});

console.log('Cloudflare deployment and APK export complete.');
