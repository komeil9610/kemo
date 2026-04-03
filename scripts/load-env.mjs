import fs from "node:fs";
import path from "node:path";

function normalizeValue(rawValue = "") {
  const trimmed = rawValue.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  const separatorIndex = trimmed.indexOf("=");
  if (separatorIndex <= 0) {
    return null;
  }

  const key = trimmed.slice(0, separatorIndex).trim();
  const value = trimmed.slice(separatorIndex + 1);
  if (!key) {
    return null;
  }

  return [key, normalizeValue(value)];
}

export function loadEnvFiles(filePaths = []) {
  for (const filePath of filePaths) {
    if (!filePath || !fs.existsSync(filePath)) {
      continue;
    }

    const content = fs.readFileSync(filePath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const entry = parseEnvLine(line);
      if (!entry) {
        continue;
      }

      const [key, value] = entry;
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }
}

export function resolveEnvCandidates(baseDir) {
  return [
    path.resolve(baseDir, ".env"),
    path.resolve(baseDir, "..", ".env"),
  ];
}
