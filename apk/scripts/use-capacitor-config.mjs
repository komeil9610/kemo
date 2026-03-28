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

if (!fs.existsSync(sourcePath)) {
  throw new Error(`Config template not found: ${sourcePath}`);
}

fs.copyFileSync(sourcePath, targetPath);
console.log(`Applied ${flavor} Capacitor config.`);
