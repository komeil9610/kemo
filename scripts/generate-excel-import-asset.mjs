import fs from 'fs/promises';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);

const { loadExcelOrdersPreview } = require(path.join(repoRoot, 'backend/src/utils/excelOrders.js'));

const targetDir = path.join(repoRoot, 'frontend/public/excel-import');
const targetFile = path.join(targetDir, 'orders.json');

const preview = await loadExcelOrdersPreview('data.xlsx');

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
    },
    null,
    2
  ),
  'utf8'
);

console.log(`Excel import asset generated at ${targetFile}`);
