import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apkRoot = path.resolve(__dirname, '..');
const localPropertiesPath = path.resolve(apkRoot, 'android', 'local.properties');

function normalizeSdkPath(input) {
  return path.resolve(input).replace(/\\/g, '/');
}

function existingSdkDirFromLocalProperties() {
  if (!fs.existsSync(localPropertiesPath)) {
    return null;
  }

  const content = fs.readFileSync(localPropertiesPath, 'utf8');
  const match = content.match(/^sdk\.dir\s*=\s*(.+)$/m);
  return match ? match[1].trim() : null;
}

function candidateSdkDirs() {
  const home = os.homedir();
  const candidates = [
    process.env.ANDROID_SDK_ROOT,
    process.env.ANDROID_HOME,
    path.join(home, 'Android', 'Sdk'),
    path.join(home, 'Android', 'sdk'),
    path.join(home, 'android-sdk'),
    path.join(home, '.android-sdk'),
    '/opt/android-sdk',
    '/usr/lib/android-sdk',
    '/usr/local/android-sdk',
    '/usr/local/share/android-sdk',
  ];

  return candidates.filter(Boolean);
}

function detectSdkDir() {
  for (const candidate of candidateSdkDirs()) {
    if (fs.existsSync(candidate)) {
      return normalizeSdkPath(candidate);
    }
  }

  return null;
}

const currentSdkDir = existingSdkDirFromLocalProperties();
if (currentSdkDir) {
  console.log(`Android SDK already configured in local.properties: ${currentSdkDir}`);
  process.exit(0);
}

const detectedSdkDir = detectSdkDir();
if (!detectedSdkDir) {
  throw new Error(
    'Android SDK not found. Set ANDROID_SDK_ROOT or ANDROID_HOME, or create apk/android/local.properties with sdk.dir=...',
  );
}

fs.mkdirSync(path.dirname(localPropertiesPath), { recursive: true });
fs.writeFileSync(localPropertiesPath, `sdk.dir=${detectedSdkDir}\n`);
console.log(`Wrote Android SDK path to ${localPropertiesPath}`);
