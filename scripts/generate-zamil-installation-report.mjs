import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import * as XLSX from "../edge-api/node_modules/xlsx/xlsx.mjs";
import { parseInstallationWorkOrderReportFromArrayBuffer } from "../edge-api/src/excelImport.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const sourceFile = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.join(repoRoot, "data", "data.xlsx");
const targetWorkbook = process.argv[3]
  ? path.resolve(process.cwd(), process.argv[3])
  : path.join(repoRoot, "data", "zamil-installation-report.xlsx");
const targetJson = process.argv[4]
  ? path.resolve(process.cwd(), process.argv[4])
  : path.join(repoRoot, "data", "zamil-installation-report.json");

const makeSheetName = (value, fallback = "Sheet") =>
  String(value || fallback)
    .replace(/[\\/?*[\]:]/g, " ")
    .trim()
    .slice(0, 31) || fallback;

const appendWorksheet = (workbook, name, rows, columnWidths = []) => {
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  if (columnWidths.length) {
    worksheet["!cols"] = columnWidths.map((width) => ({ wch: width }));
  }
  XLSX.utils.book_append_sheet(workbook, worksheet, makeSheetName(name));
};

const formatDate = (value) => {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return "";
  }
  return value.toISOString().slice(0, 10);
};

const sourceBuffer = await fs.readFile(sourceFile);
const sourceArrayBuffer = sourceBuffer.buffer.slice(
  sourceBuffer.byteOffset,
  sourceBuffer.byteOffset + sourceBuffer.byteLength
);

const report = parseInstallationWorkOrderReportFromArrayBuffer(sourceArrayBuffer);
const workbook = XLSX.utils.book_new();
const { orders, summary, analytics } = report;

appendWorksheet(
  workbook,
  "Summary",
  [
    ["Metric", "Value"],
    ["Generated At", analytics.generatedAt],
    ["Today", analytics.today],
    ["Total orders", summary.totalOrders],
    ["Total devices", summary.totalDevices],
    ["Follow-up orders", summary.followUpOrders],
    ["Completed orders", summary.completedOrders],
    ["Canceled orders", summary.canceledOrders],
    ["Assigned tech orders", summary.assignedTechOrders],
    ["Unassigned tech orders", summary.unassignedTechOrders],
    ["Needs assignment review", summary.needsReviewOrders],
    ["Within SLA", summary.withinSLAOrders],
    ["Exceed SLA", summary.exceedSLAOrders],
    ["Dated orders", summary.datedOrders],
    ["Undated orders", summary.undatedOrders],
    ["Overdue follow-up", analytics.totals.overdueFollowUpOrders],
    ["Today follow-up", analytics.totals.todayFollowUpOrders],
    ["Upcoming follow-up", analytics.totals.upcomingFollowUpOrders],
  ],
  [28, 18]
);

appendWorksheet(
  workbook,
  "Orders",
  [
    [
      "SO ID",
      "WO ID",
      "Customer",
      "Email",
      "Phone",
      "Effective date",
      "Pickup date",
      "Status",
      "Devices count",
      "Devices",
      "City",
      "Address",
      "Within SLA",
      "Exceed SLA",
      "Courier",
      "Courier number",
      "Tech ID",
      "Area code",
      "Tech code",
      "Area name",
      "Tech short name",
    ],
    ...orders.map((order) => [
      order.soId || "",
      order.woId || "",
      order.customer || "",
      order.email || "",
      order.phone || "",
      formatDate(order.instDate || order.pickDate),
      formatDate(order.pickDate),
      order.status || "",
      order.devCount || 0,
      (order.devList || []).join(" | "),
      order.city || "",
      order.address || "",
      order.withinSLA || "",
      order.exceedSLA || "",
      order.courier || "",
      order.courierNum || "",
      order.techId || "",
      order.areaCode || "",
      order.techCode || "",
      order.areaName || "",
      order.techShortName || "",
    ]),
  ],
  [18, 18, 22, 24, 16, 14, 14, 22, 12, 42, 16, 36, 12, 12, 16, 18, 14, 12, 12, 16, 16]
);

appendWorksheet(
  workbook,
  "Follow Up",
  [
    ["SO ID", "WO ID", "Customer", "Status", "Effective date", "City", "Devices", "Tech ID", "Courier"],
    ...orders
      .filter((order) => analytics.statusBreakdown.some((item) => item.status === order.status && item.followUpCount > 0))
      .map((order) => [
        order.soId || "",
        order.woId || "",
        order.customer || "",
        order.status || "",
        formatDate(order.instDate || order.pickDate),
        order.city || "",
        order.devCount || 0,
        order.techId || "",
        order.courier || "",
      ]),
  ],
  [18, 18, 22, 22, 14, 16, 12, 14, 16]
);

appendWorksheet(
  workbook,
  "By Status",
  [["Status", "Orders", "Devices", "Follow-up", "Completed", "Canceled"]].concat(
    analytics.statusBreakdown.map((item) => [
      item.status || item.key,
      item.count || 0,
      item.devices || 0,
      item.followUpCount || 0,
      item.completedCount || 0,
      item.canceledCount || 0,
    ])
  ),
  [26, 12, 12, 12, 12, 12]
);

appendWorksheet(
  workbook,
  "By City",
  [["City", "Orders", "Devices", "Follow-up"]].concat(
    analytics.cityBreakdown.map((item) => [item.city || item.key, item.count || 0, item.devices || 0, item.followUpCount || 0])
  ),
  [20, 12, 12, 12]
);

appendWorksheet(
  workbook,
  "By Technician",
  [["Tech ID", "Area code", "Tech code", "Area", "Short name", "Orders", "Devices", "Follow-up", "Needs review"]].concat(
    analytics.technicianBreakdown.map((item) => [
      item.techId || item.key,
      item.areaCode || "",
      item.techCode || "",
      item.areaName || "",
      item.techShortName || "",
      item.count || 0,
      item.devices || 0,
      item.followUpCount || 0,
      item.needsReview || "",
    ])
  ),
  [16, 12, 12, 18, 16, 12, 12, 12, 14]
);

appendWorksheet(
  workbook,
  "By Courier",
  [["Courier", "Orders", "Devices", "Follow-up"]].concat(
    analytics.courierBreakdown.map((item) => [item.courier || item.key, item.count || 0, item.devices || 0, item.followUpCount || 0])
  ),
  [20, 12, 12, 12]
);

appendWorksheet(
  workbook,
  "By Device",
  [["Device", "Units"]].concat(analytics.deviceBreakdown.map((item) => [item.device || item.key, item.count || 0])),
  [56, 12]
);

appendWorksheet(
  workbook,
  "By Date",
  [["Date", "Orders", "Devices", "Follow-up"]].concat(
    analytics.dateBreakdown.map((item) => [item.date || item.key, item.count || 0, item.devices || 0, item.followUpCount || 0])
  ),
  [16, 12, 12, 12]
);

await fs.mkdir(path.dirname(targetWorkbook), { recursive: true });
await fs.mkdir(path.dirname(targetJson), { recursive: true });
const workbookBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
await fs.writeFile(targetWorkbook, workbookBuffer);
await fs.writeFile(targetJson, JSON.stringify(report, null, 2), "utf8");

console.log(
  JSON.stringify(
    {
      sourceFile,
      targetWorkbook,
      targetJson,
      totalOrders: summary.totalOrders,
      totalDevices: summary.totalDevices,
      followUpOrders: summary.followUpOrders,
    },
    null,
    2
  )
);
