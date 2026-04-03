import mongoose from "mongoose";
import process from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvFiles, resolveEnvCandidates } from "../../scripts/load-env.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, "..");

loadEnvFiles(resolveEnvCandidates(backendDir));

const SUPABASE_URL = String(process.env.SUPABASE_URL || "").trim().replace(/\/$/, "");
const SUPABASE_SERVICE_ROLE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const SUPABASE_SCHEMA = String(process.env.SUPABASE_SCHEMA || "public").trim() || "public";
const MONGODB_URI = String(process.env.MONGODB_URI || "").trim();
const MONGODB_DB_NAME = String(process.env.MONGODB_DB_NAME || "").trim();
const ARCHIVE_BATCH_SIZE = Math.max(1, Number(process.env.SUPABASE_SYNC_BATCH_SIZE || 500));

const collectionConfigs = [
  { mongoCollection: "users", supabaseTable: "legacy_mongo_users" },
  { mongoCollection: "products", supabaseTable: "legacy_mongo_products" },
  { mongoCollection: "bookings", supabaseTable: "legacy_mongo_bookings" },
  { mongoCollection: "payments", supabaseTable: "legacy_mongo_payments" },
  { mongoCollection: "reviews", supabaseTable: "legacy_mongo_reviews" },
  { mongoCollection: "serviceorders", supabaseTable: "legacy_mongo_service_orders" },
  { mongoCollection: "subscriptions", supabaseTable: "legacy_mongo_subscriptions" },
];

function usage() {
  console.log(`Usage:
  node ./scripts/archive-mongodb-to-supabase.mjs
  node ./scripts/archive-mongodb-to-supabase.mjs --collection=users,products
  node ./scripts/archive-mongodb-to-supabase.mjs --dry-run

Required env:
  MONGODB_URI
  MONGODB_DB_NAME
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY

Optional env:
  SUPABASE_SCHEMA=public
  SUPABASE_SYNC_BATCH_SIZE=500`);
}

function parseArgs(argv) {
  const selectedCollections = new Set();
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
    if (arg.startsWith("--collection=")) {
      const rawValue = arg.slice("--collection=".length);
      for (const name of rawValue.split(",").map((value) => value.trim()).filter(Boolean)) {
        selectedCollections.add(name);
      }
    }
  }

  return { dryRun, selectedCollections };
}

function assertEnv() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is required.");
  }
  if (!MONGODB_DB_NAME) {
    throw new Error("MONGODB_DB_NAME is required.");
  }
  if (!SUPABASE_URL) {
    throw new Error("SUPABASE_URL is required.");
  }
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required.");
  }
}

function getCollectionsToArchive(selectedCollections) {
  if (!selectedCollections.size) {
    return collectionConfigs;
  }

  const selected = collectionConfigs.filter((entry) => selectedCollections.has(entry.mongoCollection));
  const missing = [...selectedCollections].filter(
    (name) => !selected.some((entry) => entry.mongoCollection === name)
  );

  if (missing.length) {
    throw new Error(`Unknown collection names: ${missing.join(", ")}`);
  }

  return selected;
}

function buildSupabaseUrl(table) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
  url.searchParams.set("on_conflict", "mongo_id");
  return url.toString();
}

function chunkRows(rows, size) {
  const chunks = [];
  for (let index = 0; index < rows.length; index += size) {
    chunks.push(rows.slice(index, index + size));
  }
  return chunks;
}

function sanitizeValue(value) {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeValue(entry));
  }
  if (value && typeof value === "object") {
    if (value?._bsontype === "ObjectId") {
      return String(value);
    }

    const output = {};
    for (const [key, entry] of Object.entries(value)) {
      output[key] = sanitizeValue(entry);
    }
    return output;
  }
  return value;
}

async function uploadChunk(table, rows) {
  const response = await fetch(buildSupabaseUrl(table), {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
      Accept: "application/json",
      "Accept-Profile": SUPABASE_SCHEMA,
      "Content-Profile": SUPABASE_SCHEMA,
    },
    body: JSON.stringify(rows),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase archive upload failed for "${table}": ${response.status} ${errorText}`);
  }
}

async function archiveCollection(db, config, { dryRun }) {
  const documents = await db.collection(config.mongoCollection).find({}).toArray();
  const payloadRows = documents.map((document) => ({
    mongo_id: String(document._id),
    payload: sanitizeValue(document),
    synced_at: new Date().toISOString(),
  }));

  console.log(`- ${config.mongoCollection}: fetched ${payloadRows.length} document(s) from MongoDB`);

  if (dryRun || payloadRows.length === 0) {
    return { count: payloadRows.length, uploaded: 0 };
  }

  const chunks = chunkRows(payloadRows, ARCHIVE_BATCH_SIZE);
  let uploaded = 0;

  for (const chunk of chunks) {
    await uploadChunk(config.supabaseTable, chunk);
    uploaded += chunk.length;
    console.log(`  archived ${uploaded}/${payloadRows.length} document(s) into ${config.supabaseTable}`);
  }

  return { count: payloadRows.length, uploaded };
}

async function main() {
  const { dryRun, selectedCollections } = parseArgs(process.argv.slice(2));
  assertEnv();

  const collections = getCollectionsToArchive(selectedCollections);
  await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB_NAME });

  try {
    const db = mongoose.connection.db;
    console.log(`Archive source: MongoDB ${MONGODB_DB_NAME}`);
    console.log(`Archive target: ${SUPABASE_URL} schema=${SUPABASE_SCHEMA}`);
    console.log(`Collections: ${collections.map((entry) => entry.mongoCollection).join(", ")}`);
    if (dryRun) {
      console.log("Dry run mode enabled. No data will be uploaded.");
    }

    let totalCount = 0;
    let totalUploaded = 0;

    for (const config of collections) {
      const result = await archiveCollection(db, config, { dryRun });
      totalCount += result.count;
      totalUploaded += result.uploaded;
    }

    console.log(
      `Completed. Read ${totalCount} document(s)${dryRun ? "" : ` and archived ${totalUploaded} document(s)`}.`
    );
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
