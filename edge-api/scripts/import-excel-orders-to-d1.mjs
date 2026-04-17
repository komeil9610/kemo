import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { parseExcelOrdersFromArrayBuffer } from '../src/excelImport.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');

const databaseName = process.env.D1_DATABASE_NAME || 'tarkeeb_pro_db';
const isRemote = process.env.D1_IMPORT_REMOTE !== 'false';
const batchSize = Math.max(1, Number(process.env.D1_IMPORT_BATCH_SIZE) || 100);
const startBatch = Math.max(1, Number(process.env.D1_IMPORT_START_BATCH) || 1);
const endBatch = Math.max(startBatch, Number(process.env.D1_IMPORT_END_BATCH) || Number.MAX_SAFE_INTEGER);

const sqlEscape = (value) => `'${String(value ?? '').replace(/'/g, "''")}'`;
const sqlNullable = (value) => {
  const normalized = String(value ?? '').trim();
  return normalized ? sqlEscape(normalized) : 'NULL';
};

const normalizeImportedStatus = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized.includes('canceled') || normalized.includes('cancelled')) {
    return 'canceled';
  }
  if (normalized.includes('completed') || normalized.includes('partially completed')) {
    return 'completed';
  }
  if (
    normalized.includes('scheduled') ||
    normalized.includes('assigned') ||
    normalized.includes('shipped') ||
    normalized.includes('delivered') ||
    normalized.includes('ready to pickup') ||
    normalized.includes('return request') ||
    normalized.includes('rescheduled') ||
    normalized.includes('waiting customer confirmation')
  ) {
    return 'scheduled';
  }
  return 'pending';
};

const buildAuditLog = (order) =>
  JSON.stringify([
    {
      id: `audit-import-${order.requestNumber}`,
      type: 'created',
      actor: 'customer_service',
      message: `تم استيراد الطلب ${order.requestNumber} من ملف Excel وإرساله إلى النظام.`,
      createdAt: new Date().toISOString(),
    },
  ]);

const buildInsertStatement = (order) => {
  const status = normalizeImportedStatus(order.externalStatus || order.importStatus || order.importMeta?.excelStatus);
  const preferredTime = String(order.preferredTime || '09:00').trim() || '09:00';
  const scheduledTime = ['scheduled', 'completed'].includes(status) ? preferredTime : '';
  const completedAt = status === 'completed' ? `${order.preferredDate}T${preferredTime}:00` : '';
  const canceledAt = status === 'canceled' ? `${order.preferredDate}T${preferredTime}:00` : '';
  const acDetails = Array.isArray(order.acDetails) ? order.acDetails : [];
  const totalQuantity = acDetails.reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0) || 1;
  const primaryAcType = String(acDetails[0]?.type || 'split').trim() || 'split';

  return `INSERT INTO service_orders (
    customer_name, request_number, phone, secondary_phone, whatsapp_phone, district, city, address, address_text,
    landmark, map_link, ac_type, service_category, standard_duration_minutes, work_type, ac_count, status, priority, delivery_type,
    preferred_date, preferred_time, scheduled_date, scheduled_time, coordination_note, source, notes, customer_action,
    reschedule_reason, cancellation_reason, canceled_at, completed_at, technician_id, copper_meters, base_included,
    extras_total, service_items_json, audit_log_json, created_by_user_id
  )
  SELECT
    ${sqlEscape(order.customerName)},
    ${sqlEscape(order.requestNumber)},
    ${sqlEscape(order.phone)},
    ${sqlEscape(order.secondaryPhone || '')},
    ${sqlEscape(order.whatsappPhone || order.phone)},
    ${sqlEscape(order.district)},
    ${sqlEscape(order.city)},
    ${sqlEscape(order.mapLink || '')},
    ${sqlEscape(order.addressText || '')},
    ${sqlEscape(order.landmark || '')},
    ${sqlEscape(order.mapLink || '')},
    ${sqlEscape(primaryAcType)},
    'internal_request',
    1,
    ${sqlEscape(order.serviceSummary || 'Imported from Excel')},
    ${Number(totalQuantity)},
    ${sqlEscape(status)},
    ${sqlEscape(order.priority || 'normal')},
    ${sqlEscape(order.deliveryType || 'none')},
    ${sqlEscape(order.preferredDate)},
    ${sqlEscape(preferredTime)},
    ${sqlEscape(order.preferredDate)},
    ${sqlEscape(scheduledTime)},
    '',
    ${sqlEscape(order.sourceChannel || 'Excel import')},
    ${sqlEscape(order.notes || '')},
    'none',
    '',
    '',
    ${sqlNullable(canceledAt)},
    ${sqlNullable(completedAt)},
    NULL,
    0,
    0,
    0,
    ${sqlEscape(JSON.stringify(acDetails))},
    ${sqlEscape(buildAuditLog(order))},
    (SELECT id FROM users WHERE email = 'komeil9610@gmail.com' LIMIT 1)
  WHERE NOT EXISTS (
    SELECT 1 FROM service_orders WHERE request_number = ${sqlEscape(order.requestNumber)}
  );`;
};

const runWrangler = async (sql, batchNumber, totalBatches) => {
  const tempFile = path.join(os.tmpdir(), `excel-import-batch-${batchNumber}.sql`);
  await fs.writeFile(tempFile, `${sql}\n`, 'utf8');
  console.log(`Importing batch ${batchNumber}/${totalBatches}...`);
  const args = ['wrangler', 'd1', 'execute', databaseName];
  if (isRemote) {
    args.push('--remote');
  } else {
    args.push('--local');
  }
  args.push('--file', tempFile);

  const result = spawnSync('npx', args, {
    cwd: path.join(repoRoot, 'edge-api'),
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    throw new Error(`Batch ${batchNumber} failed`);
  }

  await fs.unlink(tempFile).catch(() => {});
};

const sourceFile = path.join(repoRoot, 'data', 'data.xlsx');
const sourceBuffer = await fs.readFile(sourceFile);
const sourceArrayBuffer = sourceBuffer.buffer.slice(
  sourceBuffer.byteOffset,
  sourceBuffer.byteOffset + sourceBuffer.byteLength
);
const preview = parseExcelOrdersFromArrayBuffer(sourceArrayBuffer, sourceFile);
const orders = Array.isArray(preview.orders) ? preview.orders : [];

if (!orders.length) {
  console.log('No Excel orders found.');
  process.exit(0);
}

const totalBatches = Math.ceil(orders.length / batchSize);
for (let index = 0; index < orders.length; index += batchSize) {
  const currentBatch = Math.floor(index / batchSize) + 1;
  if (currentBatch < startBatch) {
    continue;
  }
  if (currentBatch > endBatch) {
    break;
  }
  const batchOrders = orders.slice(index, index + batchSize);
  const sql = batchOrders.map(buildInsertStatement).join('\n');
  await runWrangler(sql, currentBatch, totalBatches);
}

console.log(`Excel import to D1 completed for ${orders.length} orders.`);
