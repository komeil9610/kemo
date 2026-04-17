import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { unstable_dev } from "wrangler";

import { loadEnvFiles, resolveEnvCandidates } from "../../scripts/load-env.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectDir = path.resolve(__dirname, "..");

loadEnvFiles(resolveEnvCandidates(projectDir));

const host = String(process.env.BACKEND_HOST || process.env.HOST || "127.0.0.1").trim() || "127.0.0.1";
const port = Number(process.env.BACKEND_PORT || process.env.PORT || 8787) || 8787;

const worker = await unstable_dev(path.join(projectDir, "src/index.js"), {
  config: path.join(projectDir, "wrangler.toml"),
  envFiles: [".env"],
  ip: host,
  port,
  local: true,
  persist: true,
  logLevel: "info",
  experimental: {
    disableExperimentalWarning: true,
    forceLocal: true,
    showInteractiveDevSession: false,
    watch: true,
  },
});

let shuttingDown = false;

const shutdown = async (signal) => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  console.log(`Stopping local backend (${signal})...`);

  try {
    await worker.stop();
  } finally {
    process.exit(0);
  }
};

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

console.log(`Local backend running at http://${host}:${worker.port}/api`);
console.log("You can use this server for local development or expose it as the Excel upload backend behind EXCEL_UPLOAD_ORIGIN.");

await worker.waitUntilExit();
