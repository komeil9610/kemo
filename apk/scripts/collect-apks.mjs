import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apkRoot = path.resolve(__dirname, '..');
const androidOutputRoot = path.resolve(apkRoot, 'android', 'app', 'build', 'outputs', 'apk');
const distRoot = path.resolve(apkRoot, 'dist');

const flavor = String(process.argv[2] || '').trim().toLowerCase();
if (!flavor) {
  throw new Error('Missing flavor argument. Expected admin or technician.');
}

const candidates = [];
const fallbackCandidates = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.apk')) {
      if (fullPath.toLowerCase().includes(flavor)) {
        candidates.push(fullPath);
      } else if (entry.name === 'app-debug.apk') {
        fallbackCandidates.push(fullPath);
      }
    }
  }
}

if (!fs.existsSync(androidOutputRoot)) {
  throw new Error(`Android outputs not found at ${androidOutputRoot}`);
}

walk(androidOutputRoot);

const chosenCandidates = candidates.length > 0 ? candidates : fallbackCandidates;

if (chosenCandidates.length === 0) {
  throw new Error(`No APK found for flavor "${flavor}" under ${androidOutputRoot}`);
}

fs.mkdirSync(distRoot, { recursive: true });

for (const sourcePath of chosenCandidates) {
  const fileName = path.basename(sourcePath);
  const targetName =
    candidates.length > 0 ? fileName.replace(/^app-/, 'tarkeeb-pro-') : `tarkeeb-pro-${flavor}-debug.apk`;
  const targetPath = path.resolve(distRoot, targetName);
  fs.copyFileSync(sourcePath, targetPath);
  console.log(`Copied ${sourcePath} -> ${targetPath}`);
}
