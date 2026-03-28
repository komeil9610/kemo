import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apkRoot = path.resolve(__dirname, '..');
const frontendBuildDir = path.resolve(apkRoot, '../frontend/build');
const webDir = path.resolve(apkRoot, 'www');

if (!fs.existsSync(frontendBuildDir)) {
  throw new Error(`Frontend build not found: ${frontendBuildDir}`);
}

fs.rmSync(webDir, { recursive: true, force: true });
fs.mkdirSync(webDir, { recursive: true });
fs.cpSync(frontendBuildDir, webDir, { recursive: true });

console.log(`Copied frontend build into ${webDir}`);
