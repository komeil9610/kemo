import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apkRoot = path.resolve(__dirname, '..');
const frontendRoot = path.resolve(apkRoot, '..', 'frontend');
const localPropertiesPath = path.resolve(apkRoot, 'android', 'local.properties');

function readLocalSdkDir() {
  if (!fs.existsSync(localPropertiesPath)) {
    return null;
  }

  const content = fs.readFileSync(localPropertiesPath, 'utf8');
  const match = content.match(/^sdk\.dir\s*=\s*(.+)$/m);
  return match ? match[1].trim() : null;
}

function detectSdkDir() {
  const home = os.homedir();
  const candidates = [
    process.env.ANDROID_SDK_ROOT,
    process.env.ANDROID_HOME,
    path.join(home, 'Android', 'Sdk'),
    path.join(home, 'Android', 'sdk'),
    path.join(home, 'android-sdk'),
    '/opt/android-sdk',
    '/usr/lib/android-sdk',
    '/usr/local/android-sdk',
    '/usr/local/share/android-sdk',
  ].filter(Boolean);

  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

function parseJavaMajorVersion(output) {
  const match = output.match(/version "(?:1\.)?(\d+)/);
  return match ? Number(match[1]) : null;
}

function checkJava() {
  const result = spawnSync('java', ['-version'], { encoding: 'utf8' });

  if (result.error) {
    if (result.error.code === 'EPERM' || result.error.code === 'EACCES') {
      console.warn('Java check skipped because this environment blocks spawning java.');
      return;
    }

    throw new Error(`Java is missing or unusable. ${result.error.message}`);
  }

  const combined = `${result.stdout || ''}${result.stderr || ''}`;
  const major = parseJavaMajorVersion(combined);

  if (!major || major < 17) {
    throw new Error(`Java 17 or newer is required. Detected version output: ${combined.trim()}`);
  }
}

function checkDir(label, dirPath, help) {
  if (!fs.existsSync(dirPath)) {
    throw new Error(`${label} is missing at ${dirPath}. ${help}`);
  }
}

function checkNodeDeps() {
  checkDir('apk/node_modules', path.resolve(apkRoot, 'node_modules'), 'Run `npm install` inside `apk/`.');
  checkDir('frontend/node_modules', path.resolve(frontendRoot, 'node_modules'), 'Run `npm install` inside `frontend/`.');
}

function checkAndroidSdk() {
  const configuredSdk = readLocalSdkDir();
  const sdkDir = configuredSdk || detectSdkDir();

  if (!sdkDir) {
    throw new Error(
      'Android SDK not found. Set ANDROID_SDK_ROOT or ANDROID_HOME, or create apk/android/local.properties with sdk.dir=...',
    );
  }

  const platforms35 = path.join(sdkDir, 'platforms', 'android-35');
  const platformTools = path.join(sdkDir, 'platform-tools', 'adb');

  checkDir('Android SDK platforms;android-35', platforms35, 'Install it with `sdkmanager "platforms;android-35"`.');
  checkDir('Android SDK platform-tools', platformTools, 'Install it with `sdkmanager "platform-tools"`.');
}

checkNodeDeps();
checkJava();
checkAndroidSdk();

console.log('Build environment looks ready.');
