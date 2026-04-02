import XLSX from "xlsx";

const CITY_ALIASES = new Map(
  [
    ["al-hassa", "الأحساء"],
    ["al hassa", "الأحساء"],
    ["alahsa", "الأحساء"],
    ["al ahsa", "الأحساء"],
    ["ahsa", "الأحساء"],
    ["hofuf", "الأحساء"],
    ["al-hofuf", "الأحساء"],
    ["al hofuf", "الأحساء"],
    ["الاحساء", "الأحساء"],
    ["الأحساء", "الأحساء"],
    ["jeddah", "جدة"],
    ["جده", "جدة"],
    ["جدة", "جدة"],
    ["dammam", "الدمام"],
    ["الدمام", "الدمام"],
    ["khobar", "الخبر"],
    ["al khobar", "الخبر"],
    ["alkhobar", "الخبر"],
    ["الخبر", "الخبر"],
    ["dhahran", "الظهران"],
    ["al dhahran", "الظهران"],
    ["الظهران", "الظهران"],
    ["qatif", "القطيف"],
    ["qatif city", "القطيف"],
    ["القطيف", "القطيف"],
    ["jubail", "الجبيل"],
    ["al jubail", "الجبيل"],
    ["الجبيل", "الجبيل"],
    ["riyadh", "الرياض"],
    ["الرياض", "الرياض"],
    ["qassim", "القصيم"],
    ["qasim", "القصيم"],
    ["القصيم", "القصيم"],
    ["jazan", "جازان"],
    ["جازان", "جازان"],
    ["abu arish", "أبو عريش"],
    ["abuarish", "أبو عريش"],
    ["أبو عريش", "أبو عريش"],
    ["makkah", "مكة"],
    ["mecca", "مكة"],
    ["مكة", "مكة"],
    ["madinah", "المدينة المنورة"],
    ["medina", "المدينة المنورة"],
    ["المدينة المنورة", "المدينة المنورة"],
    ["taif", "الطائف"],
    ["الطائف", "الطائف"],
    ["yanbu", "ينبع"],
    ["ينبع", "ينبع"],
    ["bqaiq", "بقيق"],
    ["بقيق", "بقيق"],
    ["ras tanura", "رأس تنورة"],
    ["rastanura", "رأس تنورة"],
    ["رأس تنورة", "رأس تنورة"],
  ].map(([key, value]) => [String(key).trim().toLowerCase(), value])
);

const DATE_TIME_FALLBACK = { date: "", time: "09:00" };

const normalizeText = (value) => String(value || "").trim();
const normalizeLookup = (value) => normalizeText(value).toLowerCase();

const canonicalizeCity = (value) => {
  const direct = CITY_ALIASES.get(normalizeLookup(value));
  if (direct) {
    return direct;
  }

  const normalized = normalizeText(value);
  if (!normalized) {
    return "";
  }

  for (const [alias, city] of CITY_ALIASES.entries()) {
    if (normalizeLookup(normalized).includes(alias)) {
      return city;
    }
  }

  return normalized;
};

const isUsefulLocationPart = (value) => {
  const normalized = normalizeText(value);
  if (!normalized) {
    return false;
  }

  if (/^[\d\s-]+$/.test(normalized)) {
    return false;
  }

  if (/^[A-Z]{2,}\d+$/i.test(normalized)) {
    return false;
  }

  return true;
};

const parseAddressParts = (value) => {
  const address = normalizeText(value);
  if (!address) {
    return [];
  }

  const withoutHeader = address.includes(" - ") ? address.split(" - ").slice(1).join(" - ") : address;
  return withoutHeader
    .split(",")
    .map((part) => normalizeText(part))
    .filter(Boolean);
};

const resolveLocation = (shippingAddress, shippingCity) => {
  const addressParts = parseAddressParts(shippingAddress);
  let city = canonicalizeCity(shippingCity);
  let cityIndex = -1;

  if (city) {
    cityIndex = addressParts.findIndex((part) => canonicalizeCity(part) === city);
  }

  if (!city) {
    cityIndex = addressParts.findIndex((part) => Boolean(canonicalizeCity(part)));
    city = cityIndex >= 0 ? canonicalizeCity(addressParts[cityIndex]) : "";
  }

  let district = "";
  if (cityIndex > 0 && isUsefulLocationPart(addressParts[cityIndex - 1])) {
    district = addressParts[cityIndex - 1];
  }

  if (!district) {
    district =
      addressParts.find((part) => isUsefulLocationPart(part) && canonicalizeCity(part) !== city) ||
      addressParts[0] ||
      "";
  }

  return {
    city,
    district,
    addressText: normalizeText(shippingAddress),
  };
};

const parseExcelDateTime = (value) => {
  const normalized = normalizeText(value);
  if (!normalized) {
    return DATE_TIME_FALLBACK;
  }

  const match = normalized.match(/^(\d{2})-(\d{2})-(\d{4})(?:\s+(\d{2}):(\d{2})(?::\d{2})?)?$/);
  if (!match) {
    return DATE_TIME_FALLBACK;
  }

  const [, day, month, year, hour = "09", minute = "00"] = match;
  const time = hour === "00" && minute === "00" ? "09:00" : `${hour}:${minute}`;
  return {
    date: `${year}-${month}-${day}`,
    time,
  };
};

const inferAcType = (value) => {
  const text = normalizeLookup(value);
  if (!text) {
    return "split";
  }
  if (text.includes("window") || text.includes("شباك")) {
    return "window";
  }
  if (text.includes("cassette") || text.includes("كاسيت")) {
    return "cassette";
  }
  if (text.includes("duct") || text.includes("دكت")) {
    return "duct";
  }
  if (text.includes("concealed") || text.includes("مخفي")) {
    return "concealed";
  }
  return "split";
};

const normalizeImportedStatus = (value) => {
  const status = normalizeLookup(value);
  if (!status) {
    return "pending";
  }
  if (status.includes("canceled") || status.includes("cancelled") || status.includes("ملغي")) {
    return "canceled";
  }
  if (status.includes("completed") || status.includes("done") || status.includes("مكتمل")) {
    return "completed";
  }
  if (status.includes("scheduled") || status.includes("assigned") || status.includes("in progress")) {
    return "scheduled";
  }
  return "pending";
};

const summarizeDevices = (value) =>
  normalizeText(value)
    .split(/\n+/)
    .map((line) => normalizeText(line.replace(/^\*\s*/, "")))
    .filter(Boolean)
    .join(" | ");

const extractLineQuantity = (line) => {
  const match = normalizeText(line).match(/^(\d+)\s*x\b/i);
  return match ? Math.max(1, Number(match[1]) || 1) : 1;
};

const buildAcDetails = (devices, bundledItems) => {
  const lines = normalizeText(devices)
    .split(/\n+/)
    .map((line) => normalizeText(line.replace(/^\*\s*/, "")))
    .filter(Boolean);

  const counts = new Map();
  for (const line of lines) {
    const type = inferAcType(line);
    counts.set(type, (counts.get(type) || 0) + extractLineQuantity(line));
  }

  if (!counts.size) {
    counts.set(inferAcType(devices), Math.max(1, Number(bundledItems) || 1));
  }

  return Array.from(counts.entries()).map(([type, quantity]) => ({
    type,
    quantity: Math.max(1, Number(quantity) || 1),
  }));
};

const buildMapsLink = (address) => {
  const query = normalizeText(address);
  if (!query) {
    return "";
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

const buildNotes = (sheetName, row, devicesSummary) => {
  const orderedFields = [
    ["Sheet", sheetName],
    ["SO ID", row["SO ID"]],
    ["WO ID", row["WO ID"]],
    ["Excel status", row.Status],
    ["Completed within SLA", row["Completed within SLA"]],
    ["Completed Exceed SLA", row["Completed Exceed SLA"]],
    ["Email", row.Email],
    ["Order date", row.Date],
    ["Month", row.Month],
    ["Pickup date", row["Pickup date"]],
    ["Installation date", row["Installation date"]],
    ["Bundled items", row["Bundled Items"]],
    ["Shipping city", row["Shipping City"]],
    ["Shipping address", row["Shipping Address"]],
    ["Devices", devicesSummary || row.Devices],
    ["Courier", row.Courier],
    ["Courier number", row["Courier number"]],
    ["Chat message", row["chat message"]],
  ];

  return orderedFields
    .map(([label, value]) => [label, normalizeText(value)])
    .filter(([, value]) => Boolean(value))
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");
};

const normalizeImportedRow = (sheetName, row) => {
  const soId = normalizeText(row["SO ID"]);
  const customerName = normalizeText(row.Customer);
  const phone = normalizeText(row.Phone);
  const shippingAddress = normalizeText(row["Shipping Address"]);

  if (!soId || !customerName || !phone || !shippingAddress) {
    return null;
  }

  const { city, district, addressText } = resolveLocation(shippingAddress, row["Shipping City"]);
  const preferred = parseExcelDateTime(row["Installation date"] || row["Pickup date"] || row.Date);
  const devicesSummary = summarizeDevices(row.Devices);
  const acDetails = buildAcDetails(row.Devices, row["Bundled Items"]);
  const importStatus = normalizeImportedStatus(row.Status);

  if (!city || !district || !preferred.date || !acDetails.length || importStatus === "completed") {
    return null;
  }

  return {
    requestNumber: soId,
    customerName,
    phone,
    secondaryPhone: "",
    whatsappPhone: phone,
    city,
    district,
    addressText,
    landmark: "",
    mapLink: buildMapsLink(addressText),
    sourceChannel: `Excel import - ${sheetName}`,
    serviceSummary: devicesSummary || "Imported from Excel",
    externalStatus: normalizeText(row.Status),
    priority: "normal",
    deliveryType: "none",
    importStatus,
    preferredDate: preferred.date,
    preferredTime: preferred.time || "09:00",
    notes: buildNotes(sheetName, row, devicesSummary),
    acDetails,
    importMeta: {
      sheetName,
      soId,
      woId: normalizeText(row["WO ID"]),
      excelStatus: normalizeText(row.Status),
      shippingCity: normalizeText(row["Shipping City"]),
    },
  };
};

const getSheetHeaders = (worksheet) => {
  const headerRow = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false })[0];
  return Array.isArray(headerRow) ? headerRow.map((value) => normalizeText(value)).filter(Boolean) : [];
};

export const parseExcelOrdersFromArrayBuffer = (arrayBuffer, fileName = "data.xlsx") => {
  const workbook = XLSX.read(arrayBuffer, { type: "array", raw: false });
  const orders = [];
  let invalidRows = 0;
  let skippedCompletedOrders = 0;

  const sheets = workbook.SheetNames.map((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const headers = getSheetHeaders(worksheet);
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "", raw: false });

    for (const row of rows) {
      const normalizedStatus = normalizeImportedStatus(row.Status);
      if (normalizedStatus === "completed") {
        skippedCompletedOrders += 1;
        continue;
      }

      const normalized = normalizeImportedRow(sheetName, row);
      if (!normalized) {
        invalidRows += 1;
        continue;
      }
      orders.push(normalized);
    }

    return {
      name: sheetName,
      rowCount: rows.length,
      headers,
    };
  });

  return {
    filePath: fileName,
    fileName,
    sheets,
    orders,
    summary: {
      sheetCount: sheets.length,
      totalRows: sheets.reduce((sum, sheet) => sum + (Number(sheet.rowCount) || 0), 0),
      validOrders: orders.length,
      skippedCompletedOrders,
      invalidRows,
    },
  };
};
