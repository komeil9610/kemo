import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseExcelOrdersFromArrayBuffer, parseInstallationWorkOrderReportFromArrayBuffer } from '../edge-api/src/excelImport.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const targetDir = path.join(repoRoot, 'frontend/public/excel-import');
const targetFile = path.join(targetDir, 'orders.json');
const sourceFile = path.join(repoRoot, 'data', 'data.xlsx');

const sourceBuffer = await fs.readFile(sourceFile);
const sourceArrayBuffer = sourceBuffer.buffer.slice(
  sourceBuffer.byteOffset,
  sourceBuffer.byteOffset + sourceBuffer.byteLength
);
const preview = parseExcelOrdersFromArrayBuffer(sourceArrayBuffer, sourceFile);
const installationReport = parseInstallationWorkOrderReportFromArrayBuffer(sourceArrayBuffer);

await fs.mkdir(targetDir, { recursive: true });
await fs.writeFile(
  targetFile,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      filePath: preview.filePath,
      fileName: path.basename(preview.filePath || 'data.xlsx'),
      summary: preview.summary,
      sheets: preview.sheets,
      orders: preview.orders,
      invalidRows: preview.invalidRows,
      installationSummary: installationReport.summary,
      analytics: installationReport.analytics,
    },
    null,
    2
  ),
  'utf8'
);

console.log(`Excel import asset generated at ${targetFile}`);
