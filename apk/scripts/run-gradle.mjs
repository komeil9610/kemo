import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';

function candidateGradleBinaries() {
  const candidates = [];

  if (process.env.GRADLE_BIN && fs.existsSync(process.env.GRADLE_BIN)) {
    candidates.push(process.env.GRADLE_BIN);
  }

  const pathParts = (process.env.PATH || '').split(path.delimiter).filter(Boolean);
  for (const dir of pathParts) {
    const candidate = path.join(dir, 'gradle');
    if (fs.existsSync(candidate)) {
      candidates.push(candidate);
      break;
    }
  }

  const home = os.homedir();
  const wrapperRoot = path.join(home, '.gradle', 'wrapper', 'dists');
  if (fs.existsSync(wrapperRoot)) {
    for (const distro of fs.readdirSync(wrapperRoot)) {
      const distroDir = path.join(wrapperRoot, distro);
      if (!fs.statSync(distroDir).isDirectory()) {
        continue;
      }
      for (const hashDir of fs.readdirSync(distroDir)) {
        const gradleBin = path.join(distroDir, hashDir, 'gradle-8.11.1', 'bin', 'gradle');
        if (fs.existsSync(gradleBin)) {
          candidates.push(gradleBin);
          return candidates;
        }
      }
    }
  }

  return candidates;
}

const args = process.argv.slice(2);
const gradleBinary = candidateGradleBinaries()[0];

let command;
let commandArgs;

if (gradleBinary) {
  command = gradleBinary;
  commandArgs = ['--no-daemon', ...args];
  console.log(`Using Gradle binary: ${gradleBinary}`);
} else {
  command = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
  commandArgs = ['--no-daemon', ...args];
  console.log(`Using Gradle wrapper: ${command}`);
}

const result = spawnSync(command, commandArgs, {
  stdio: 'inherit',
  env: {
    ...process.env,
    GRADLE_USER_HOME: process.env.GRADLE_USER_HOME || '.gradle',
  },
});

if (result.error) {
  throw result.error;
}

if (result.status !== 0) {
  process.exit(result.status || 1);
}
