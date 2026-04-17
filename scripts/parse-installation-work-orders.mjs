import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
  buildInstallationWorkOrderAnalytics,
  INCOMPLETE_INSTALLATION_STATUSES,
  parseInstallationWorkOrdersFromArrayBuffer,
} from "../edge-api/src/excelImport.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const sourceFile = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.join(repoRoot, "data", "data.xlsx");
const targetFile = process.argv[3]
  ? path.resolve(process.cwd(), process.argv[3])
  : path.join(repoRoot, "data", "installation-work-orders.parsed.json");

const sourceBuffer = await fs.readFile(sourceFile);
const sourceArrayBuffer = sourceBuffer.buffer.slice(
  sourceBuffer.byteOffset,
  sourceBuffer.byteOffset + sourceBuffer.byteLength
);
const orders = parseInstallationWorkOrdersFromArrayBuffer(sourceArrayBuffer);
const analytics = buildInstallationWorkOrderAnalytics(orders);

await fs.mkdir(path.dirname(targetFile), { recursive: true });
await fs.writeFile(targetFile, JSON.stringify(orders, null, 2), "utf8");

const followUpCount = orders.filter((order) => INCOMPLETE_INSTALLATION_STATUSES.has(order.status)).length;

console.log(
  JSON.stringify(
    {
      sourceFile,
      targetFile,
      orders: orders.length,
      followUpCount,
      totalDevices: analytics.totals.totalDevices,
      assignedTechOrders: analytics.totals.assignedTechOrders,
      unassignedTechOrders: analytics.totals.unassignedTechOrders,
      needsReviewOrders: analytics.totals.needsReviewOrders,
      statusesNeedingFollowUp: Array.from(INCOMPLETE_INSTALLATION_STATUSES),
    },
    null,
    2
  )
);
