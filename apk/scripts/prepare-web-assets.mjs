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

function copyRecursive(source, target) {
  const stat = fs.lstatSync(source);
  if (stat.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      copyRecursive(path.join(source, entry), path.join(target, entry));
    }
    return;
  }

  if (stat.isSymbolicLink()) {
    const linkTarget = fs.readlinkSync(source);
    fs.symlinkSync(linkTarget, target);
    return;
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  fs.chmodSync(target, stat.mode);
}

fs.rmSync(webDir, { recursive: true, force: true });
copyRecursive(frontendBuildDir, webDir);

console.log(`Copied frontend build into ${webDir}`);
