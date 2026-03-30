import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apkRoot = path.resolve(__dirname, '..');

const flavor = String(process.argv[2] || '').trim().toLowerCase();
const templates = {
  admin: 'capacitor.config.admin.json',
  technician: 'capacitor.config.technician.json',
};

if (!templates[flavor]) {
  throw new Error(`Unknown flavor: ${flavor}. Expected admin or technician.`);
}

const sourcePath = path.resolve(apkRoot, templates[flavor]);
const targetPath = path.resolve(apkRoot, 'capacitor.config.json');
const configuredOrigin =
  process.env.CAPACITOR_SERVER_ORIGIN ||
  process.env.CLOUDFLARE_APP_ORIGIN ||
  process.env.APP_ORIGIN;

if (!fs.existsSync(sourcePath)) {
  throw new Error(`Config template not found: ${sourcePath}`);
}

const config = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

if (configuredOrigin) {
  const origin = configuredOrigin.replace(/\/+$/, '');
  const mobilePath = flavor === 'technician' ? '/mobile/technician' : '/mobile/admin';
  config.server = {
    ...(config.server || {}),
    url: `${origin}${mobilePath}`,
  };
}

fs.writeFileSync(targetPath, `${JSON.stringify(config, null, 2)}\n`);
console.log(`Applied ${flavor} Capacitor config.`);
