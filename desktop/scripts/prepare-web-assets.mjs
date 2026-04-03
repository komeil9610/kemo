import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopRoot = path.resolve(__dirname, '..');
const frontendBuildDir = path.resolve(desktopRoot, '../frontend/build');
const desktopAppDir = path.resolve(desktopRoot, 'app');

if (!fs.existsSync(frontendBuildDir)) {
  throw new Error(`Frontend build not found: ${frontendBuildDir}`);
}

fs.rmSync(desktopAppDir, { recursive: true, force: true });
fs.mkdirSync(desktopAppDir, { recursive: true });
fs.cpSync(frontendBuildDir, desktopAppDir, { recursive: true });

console.log(`Copied frontend build into ${desktopAppDir}`);
