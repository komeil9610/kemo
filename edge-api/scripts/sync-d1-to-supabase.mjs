import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { loadEnvFiles, resolveEnvCandidates } from "../../scripts/load-env.mjs";

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const edgeApiDir = path.resolve(__dirname, "..");

loadEnvFiles(resolveEnvCandidates(edgeApiDir));

const DEFAULT_BATCH_SIZE = Math.max(1, Number(process.env.SUPABASE_SYNC_BATCH_SIZE || 500));
const DEFAULT_SCHEMA = String(process.env.SUPABASE_SCHEMA || "public").trim() || "public";
const D1_DATABASE_NAME = String(process.env.D1_DATABASE_NAME || "tarkeeb_pro_db").trim();
const D1_SYNC_REMOTE = !["0", "false", "no"].includes(String(process.env.D1_SYNC_REMOTE || "true").toLowerCase());
const SUPABASE_URL = String(process.env.SUPABASE_URL || "").trim().replace(/\/$/, "");
const SUPABASE_SERVICE_ROLE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

const tableConfigs = [
  { name: "users", conflict: "id", orderBy: "id" },
  { name: "products", conflict: "id", orderBy: "id" },
  { name: "bookings", conflict: "id", orderBy: "id" },
  { name: "footer_settings", conflict: "id", orderBy: "id" },
  { name: "home_settings", conflict: "id", orderBy: "id" },
  { name: "technicians", conflict: "id", orderBy: "id" },
  { name: "service_time_standards", conflict: "standard_key", orderBy: "sort_order, standard_key" },
  { name: "internal_area_clusters", conflict: "id", orderBy: "id" },
  { name: "service_orders", conflict: "id", orderBy: "id" },
  { name: "service_order_photos", conflict: "id", orderBy: "id" },
  { name: "notifications", conflict: "id", orderBy: "id" },
  { name: "push_subscriptions", conflict: "id", orderBy: "id" },
];

function usage() {
  console.log(`Usage:
  node ./scripts/sync-d1-to-supabase.mjs
  node ./scripts/sync-d1-to-supabase.mjs --table=users,products
  node ./scripts/sync-d1-to-supabase.mjs --dry-run

Required env:
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY

Optional env:
  SUPABASE_SCHEMA=public
  SUPABASE_SYNC_BATCH_SIZE=500
  D1_DATABASE_NAME=tarkeeb_pro_db
  D1_SYNC_REMOTE=true`);
}

function parseArgs(argv) {
  const selectedTables = new Set();
  let dryRun = false;

  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    }
    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (arg.startsWith("--table=")) {
      const rawValue = arg.slice("--table=".length);
      for (const name of rawValue.split(",").map((value) => value.trim()).filter(Boolean)) {
        selectedTables.add(name);
      }
    }
  }

  return { dryRun, selectedTables };
}

function assertEnv() {
  if (!SUPABASE_URL) {
    throw new Error("SUPABASE_URL is required.");
  }
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required.");
  }
  if (!D1_DATABASE_NAME) {
    throw new Error("D1_DATABASE_NAME is required.");
  }
}

function getTablesToSync(selectedTables) {
  if (!selectedTables.size) {
    return tableConfigs;
  }

  const selected = tableConfigs.filter((table) => selectedTables.has(table.name));
  const missing = [...selectedTables].filter((name) => !selected.some((table) => table.name === name));
  if (missing.length) {
    throw new Error(`Unknown table names: ${missing.join(", ")}`);
  }
  return selected;
}

async function fetchD1Rows(table) {
  const args = [
    "wrangler",
    "d1",
    "execute",
    D1_DATABASE_NAME,
    D1_SYNC_REMOTE ? "--remote" : "--local",
    "--json",
    "--command",
    `SELECT * FROM ${table.name}${table.orderBy ? ` ORDER BY ${table.orderBy}` : ""};`,
  ];

  const { stdout, stderr } = await execFileAsync("npx", args, {
    cwd: edgeApiDir,
    maxBuffer: 20 * 1024 * 1024,
    env: process.env,
  });

  if (stderr?.trim()) {
    console.warn(stderr.trim());
  }

  return extractResults(stdout, table.name);
}

function extractResults(rawJson, tableName) {
  let parsed;
  try {
    parsed = JSON.parse(rawJson);
  } catch (error) {
    throw new Error(`Failed to parse Wrangler JSON output for table "${tableName}": ${error.message}`);
  }

  const candidates = Array.isArray(parsed) ? parsed : [parsed];
  for (const candidate of candidates) {
    if (Array.isArray(candidate?.results)) {
      return candidate.results;
    }
    if (Array.isArray(candidate?.result?.[0]?.results)) {
      return candidate.result[0].results;
    }
    if (Array.isArray(candidate?.result?.results)) {
      return candidate.result.results;
    }
  }

  throw new Error(`Could not find tabular results in Wrangler output for table "${tableName}".`);
}

function chunkRows(rows, size) {
  const chunks = [];
  for (let index = 0; index < rows.length; index += size) {
    chunks.push(rows.slice(index, index + size));
  }
  return chunks;
}

function buildSupabaseUrl(table) {
  const base = new URL(`${SUPABASE_URL}/rest/v1/${table.name}`);
  base.searchParams.set("on_conflict", table.conflict);
  return base.toString();
}

async function upsertChunk(table, rows) {
  const response = await fetch(buildSupabaseUrl(table), {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: `resolution=merge-duplicates,return=minimal`,
      Accept: "application/json",
      "Accept-Profile": DEFAULT_SCHEMA,
      "Content-Profile": DEFAULT_SCHEMA,
    },
    body: JSON.stringify(rows),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase upsert failed for "${table.name}": ${response.status} ${errorText}`);
  }
}

async function syncTable(table, { dryRun }) {
  const rows = await fetchD1Rows(table);
  console.log(`- ${table.name}: fetched ${rows.length} row(s) from D1`);

  if (dryRun || rows.length === 0) {
    return { rows: rows.length, uploaded: 0 };
  }

  const chunks = chunkRows(rows, DEFAULT_BATCH_SIZE);
  let uploaded = 0;

  for (const chunk of chunks) {
    await upsertChunk(table, chunk);
    uploaded += chunk.length;
    console.log(`  uploaded ${uploaded}/${rows.length} row(s) to Supabase`);
  }

  return { rows: rows.length, uploaded };
}

async function main() {
  const { dryRun, selectedTables } = parseArgs(process.argv.slice(2));
  assertEnv();

  const tables = getTablesToSync(selectedTables);
  console.log(`Sync source: D1 ${D1_DATABASE_NAME} (${D1_SYNC_REMOTE ? "remote" : "local"})`);
  console.log(`Sync target: ${SUPABASE_URL} schema=${DEFAULT_SCHEMA}`);
  console.log(`Tables: ${tables.map((table) => table.name).join(", ")}`);
  if (dryRun) {
    console.log("Dry run mode enabled. No data will be uploaded.");
  }

  let totalRows = 0;
  let totalUploaded = 0;

  for (const table of tables) {
    const result = await syncTable(table, { dryRun });
    totalRows += result.rows;
    totalUploaded += result.uploaded;
  }

  console.log(`Completed. Read ${totalRows} row(s)${dryRun ? "" : ` and uploaded ${totalUploaded} row(s)`}.`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
