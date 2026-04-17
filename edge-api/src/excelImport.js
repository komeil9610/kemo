import * as XLSX from "xlsx";

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
const READY_PICKUP_VALUES = new Set(["yes", "true", "1", "y", "جاهز", "جاهز للاستلام", "ready", "ready for pickup"]);
const NON_ACTIONABLE_STATUSES = new Set(["completed", "canceled"]);
export const INCOMPLETE_INSTALLATION_STATUSES = new Set([
  "Scheduled",
  "Schedule Confirmed",
  "Assigned",
  "Ready To Pickup",
  "Pick Up Requested",
  "Shipped",
  "Rescheduled",
  "Waiting Customer Confirmation",
  "Return Request",
]);

const normalizeText = (value) => String(value || "").trim();
const normalizeLookup = (value) => normalizeText(value).toLowerCase();
const toPositiveInteger = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, Math.round(numeric)) : fallback;
};
const hasMeaningfulCellValue = (value) => {
  if (value instanceof Date) {
    return !Number.isNaN(value.getTime());
  }
  return normalizeText(value) !== "";
};
const getRawRowValue = (row, labels = []) => {
  const normalizedCandidates = (Array.isArray(labels) ? labels : [labels])
    .map((label) => String(label || "").trim())
    .filter(Boolean);

  for (const candidate of normalizedCandidates) {
    if (row?.[candidate] !== undefined && hasMeaningfulCellValue(row[candidate])) {
      return row[candidate];
    }
  }

  const entries = Object.entries(row || {}).map(([key, value]) => [normalizeLookup(key), value]);
  for (const candidate of normalizedCandidates) {
    const matched = entries.find(([key]) => key === normalizeLookup(candidate));
    if (matched && hasMeaningfulCellValue(matched[1])) {
      return matched[1];
    }
  }

  return "";
};

const formatDateParts = (year, month, day) => `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
const formatTimeParts = (hour = 9, minute = 0) => `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
const getRiyadhTodayString = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

const getRowValue = (row, labels = []) => {
  const normalizedCandidates = (Array.isArray(labels) ? labels : [labels])
    .map((label) => String(label || "").trim())
    .filter(Boolean);

  for (const candidate of normalizedCandidates) {
    if (row?.[candidate] !== undefined && normalizeText(row[candidate])) {
      return normalizeText(row[candidate]);
    }
  }

  const entries = Object.entries(row || {}).map(([key, value]) => [normalizeLookup(key), value]);
  for (const candidate of normalizedCandidates) {
    const matched = entries.find(([key]) => key === normalizeLookup(candidate));
    if (matched && normalizeText(matched[1])) {
      return normalizeText(matched[1]);
    }
  }

  return "";
};

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
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return {
      date: formatDateParts(value.getFullYear(), value.getMonth() + 1, value.getDate()),
      time: formatTimeParts(value.getHours() || 9, value.getMinutes() || 0),
    };
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed?.y && parsed?.m && parsed?.d) {
      return {
        date: formatDateParts(parsed.y, parsed.m, parsed.d),
        time: formatTimeParts(parsed.H || 9, parsed.M || 0),
      };
    }
  }

  const normalized = normalizeText(value);
  if (!normalized) {
    return DATE_TIME_FALLBACK;
  }

  if (/^\d+(?:\.\d+)?$/.test(normalized)) {
    return parseExcelDateTime(Number(normalized));
  }

  const normalizedString = normalized.replace(/\s+/g, " ");
  const dayFirstMatch = normalizedString.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::\d{2})?)?$/);
  if (dayFirstMatch) {
    const [, day, month, year, hour = "09", minute = "00"] = dayFirstMatch;
    return {
      date: formatDateParts(year, month, day),
      time: formatTimeParts(hour === "00" && minute === "00" ? 9 : hour, minute),
    };
  }

  const yearFirstMatch = normalizedString.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:\s+(\d{1,2}):(\d{2})(?::\d{2})?)?$/);
  if (yearFirstMatch) {
    const [, year, month, day, hour = "09", minute = "00"] = yearFirstMatch;
    return {
      date: formatDateParts(year, month, day),
      time: formatTimeParts(hour === "00" && minute === "00" ? 9 : hour, minute),
    };
  }

  const parsedDate = new Date(normalizedString);
  if (!Number.isNaN(parsedDate.getTime())) {
    return {
      date: formatDateParts(parsedDate.getFullYear(), parsedDate.getMonth() + 1, parsedDate.getDate()),
      time: formatTimeParts(parsedDate.getHours() || 9, parsedDate.getMinutes() || 0),
    };
  }

  return DATE_TIME_FALLBACK;
};

const buildUtcDate = (year, month, day) => {
  const parsedYear = Number(year);
  const parsedMonth = Number(month);
  const parsedDay = Number(day);
  if (!Number.isInteger(parsedYear) || !Number.isInteger(parsedMonth) || !Number.isInteger(parsedDay)) {
    return null;
  }

  const date = new Date(Date.UTC(parsedYear, parsedMonth - 1, parsedDay));
  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== parsedYear ||
    date.getUTCMonth() !== parsedMonth - 1 ||
    date.getUTCDate() !== parsedDay
  ) {
    return null;
  }

  return date;
};

const getUtcDateKey = (value) => {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return "";
  }
  return value.toISOString().slice(0, 10);
};

const incrementBreakdown = (map, key, patch = {}) => {
  const normalizedKey = normalizeText(key) || "Unspecified";
  const current = map.get(normalizedKey) || {
    key: normalizedKey,
    count: 0,
    devices: 0,
    followUpCount: 0,
    completedCount: 0,
    canceledCount: 0,
  };

  current.count += Number(patch.count ?? 1) || 0;
  current.devices += Number(patch.devices ?? 0) || 0;
  current.followUpCount += Number(patch.followUpCount ?? 0) || 0;
  current.completedCount += Number(patch.completedCount ?? 0) || 0;
  current.canceledCount += Number(patch.canceledCount ?? 0) || 0;

  Object.entries(patch).forEach(([field, value]) => {
    if (["count", "devices", "followUpCount", "completedCount", "canceledCount"].includes(field)) {
      return;
    }
    if (value !== undefined && value !== null && value !== "") {
      current[field] = value;
    }
  });

  map.set(normalizedKey, current);
};

const toSortedBreakdown = (map, primaryField = "count") =>
  Array.from(map.values()).sort(
    (left, right) =>
      (Number(right?.[primaryField] || 0) - Number(left?.[primaryField] || 0)) ||
      (Number(right?.devices || 0) - Number(left?.devices || 0)) ||
      String(left?.key || "").localeCompare(String(right?.key || ""), "ar")
  );

const parseInstallationWorkOrderDate = (value) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return buildUtcDate(value.getFullYear(), value.getMonth() + 1, value.getDate());
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed?.y && parsed?.m && parsed?.d) {
      return buildUtcDate(parsed.y, parsed.m, parsed.d);
    }
  }

  const normalized = normalizeText(value);
  if (!normalized) {
    return null;
  }

  if (/^\d+(?:\.\d+)?$/.test(normalized)) {
    return parseInstallationWorkOrderDate(Number(normalized));
  }

  const compact = normalized.replace(/\s+/g, " ");
  const dayFirstMatch = compact.match(/^(\d{1,2})-(\d{1,2})-(\d{4})(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?$/);
  if (dayFirstMatch) {
    const [, day, month, year] = dayFirstMatch;
    return buildUtcDate(year, month, day);
  }

  const yearFirstMatch = compact.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?$/);
  if (yearFirstMatch) {
    const [, year, month, day] = yearFirstMatch;
    return buildUtcDate(year, month, day);
  }

  return null;
};

const cleanDeviceLine = (value) =>
  normalizeText(value)
    .replace(/^\*\s*/, "")
    .replace(/\s*\(\s*With Installation\s*\)\s*$/i, "")
    .trim();

const TECH_ASSIGNMENT_REGEX = /\*\s*([A-Z]{1,4}-[A-Z])\s*-\s*by:/gm;
const REVERSED_TECH_ASSIGNMENT_OVERRIDES = new Map([["W-J", "J-W"]]);
export const KNOWN_TECH_AREA_CODES = new Set([
  "A",
  "B",
  "BR",
  "BUR",
  "D",
  "DH",
  "G",
  "H",
  "HB",
  "J",
  "JD",
  "JED",
  "KHF",
  "KH",
  "M",
  "MD",
  "Q",
  "QAS",
  "R",
  "RAS",
  "RE",
  "RS",
  "S",
  "W",
  "Y",
  "YAN",
  "YNB",
]);
export const KNOWN_TECH_SHORT_CODES = new Set(["A", "D", "E", "G", "H", "J", "M", "Q", "R", "S", "W", "Y"]);
const AREA_NAME_BY_CODE = new Map([
  ["BUR", "Buraidah"],
  ["D", "Dammam"],
  ["DH", "Dhahran"],
  ["H", "Al Ahsa"],
  ["J", "Jubail"],
  ["JED", "Jeddah"],
  ["KH", "Khobar"],
  ["MD", "Madinah"],
  ["Q", "Qatif"],
  ["QAS", "Qassim"],
  ["R", "Riyadh"],
  ["RAS", "Ras Tanura"],
  ["RS", "Ras Tanura"],
  ["YAN", "Yanbu"],
  ["YNB", "Yanbu"],
]);
const TECH_SHORT_NAME_BY_CODE = new Map([
  ["A", "Ali"],
  ["G", "Ghulam"],
  ["M", "Mohsin"],
  ["R", "Rashid"],
  ["S", "Sajed"],
  ["W", "Waseem"],
]);

const parseDeviceList = (value) => {
  const expandedDevices = [];
  const lines = normalizeText(value)
    .split(/\r?\n/)
    .map((line) => cleanDeviceLine(line))
    .filter(Boolean);

  for (const line of lines) {
    const quantityMatch = line.match(/^(\d+)\s*[Xx]\s*(.+)$/);
    const quantity = quantityMatch ? Math.max(1, Number(quantityMatch[1]) || 1) : 1;
    const deviceName = cleanDeviceLine(quantityMatch ? quantityMatch[2] : line);
    if (!deviceName) {
      continue;
    }

    for (let index = 0; index < quantity; index += 1) {
      expandedDevices.push(deviceName);
    }
  }

  return {
    expandedDevices,
    countedDevices: expandedDevices.length,
  };
};

export const parseTechnicianAssignment = (value) => {
  const text = String(value || "");
  const matches = Array.from(text.matchAll(TECH_ASSIGNMENT_REGEX));
  const lastMatch = matches.at(-1);
  const rawTechId = String(lastMatch?.[1] || "").trim().toUpperCase();
  const techId = REVERSED_TECH_ASSIGNMENT_OVERRIDES.get(rawTechId) || rawTechId || null;

  if (!techId) {
    return {
      techId: null,
      areaCode: null,
      techCode: null,
      areaName: null,
      techShortName: null,
    };
  }

  const [areaCode = "", techCode = ""] = techId.split("-");
  return {
    techId,
    areaCode: areaCode || null,
    techCode: techCode || null,
    areaName: AREA_NAME_BY_CODE.get(areaCode) || null,
    techShortName: TECH_SHORT_NAME_BY_CODE.get(techCode) || null,
  };
};

export const getTechnicianAssignmentIssues = (assignment = {}) => {
  const techId = normalizeText(assignment.techId).toUpperCase();
  const areaCode = normalizeText(assignment.areaCode || techId.split("-")[0] || "").toUpperCase();
  const techCode = normalizeText(assignment.techCode || techId.split("-").slice(1).join("-") || "").toUpperCase();
  const missingAreaCode = Boolean(techId) && (!areaCode || !KNOWN_TECH_AREA_CODES.has(areaCode));
  const missingTechCode = Boolean(techId) && (!techCode || !KNOWN_TECH_SHORT_CODES.has(techCode));

  return {
    techId: techId || null,
    areaCode: areaCode || null,
    techCode: techCode || null,
    missingAreaCode,
    missingTechCode,
    needsReview: missingAreaCode || missingTechCode,
  };
};

export const normalizeInstallationWorkOrderRow = (row) => {
  const instDate = parseInstallationWorkOrderDate(getRawRowValue(row, ["Installation date"]));
  const deliveryDate = parseInstallationWorkOrderDate(getRawRowValue(row, ["Delivery date"]));
  const pickDate = parseInstallationWorkOrderDate(getRawRowValue(row, ["Pickup date"]));
  const deviceInfo = parseDeviceList(getRawRowValue(row, ["Devices"]));
  const bundledItems = toPositiveInteger(getRawRowValue(row, ["Bundled Items"]), 0);
  const techAssignment = parseTechnicianAssignment(getRawRowValue(row, ["Chat Log", "chat message", "Chat message"]));

  return {
    soId: normalizeText(getRawRowValue(row, ["SO ID"])),
    woId: normalizeText(getRawRowValue(row, ["WO ID"])),
    customer: normalizeText(getRawRowValue(row, ["Customer"])),
    email: normalizeText(getRawRowValue(row, ["Email"])),
    phone: normalizeText(getRawRowValue(row, ["Phone"])),
    instDate: deliveryDate || instDate || pickDate || null,
    deliveryDate,
    pickDate,
    status: normalizeText(getRawRowValue(row, ["Status"])),
    devCount: Math.max(bundledItems, deviceInfo.countedDevices),
    devList: deviceInfo.expandedDevices,
    city: normalizeText(getRawRowValue(row, ["Shipping City"])),
    address: normalizeText(getRawRowValue(row, ["Shipping Address"])),
    withinSLA: normalizeText(getRawRowValue(row, ["Completed within SLA"])) === "Yes" ? "Yes" : "",
    exceedSLA: normalizeText(getRawRowValue(row, ["Completed Exceed SLA"])) === "Yes" ? "Yes" : "",
    courier: normalizeText(getRawRowValue(row, ["Courier"])),
    courierNum: normalizeText(getRawRowValue(row, ["Courier number"])),
    techId: techAssignment.techId,
    areaCode: techAssignment.areaCode,
    techCode: techAssignment.techCode,
    areaName: techAssignment.areaName,
    techShortName: techAssignment.techShortName,
  };
};

export const buildInstallationWorkOrderAnalytics = (orders = [], options = {}) => {
  const today = normalizeText(options.today || getRiyadhTodayString());
  const normalizedOrders = Array.isArray(orders) ? orders : [];
  const statusBreakdown = new Map();
  const cityBreakdown = new Map();
  const technicianBreakdown = new Map();
  const courierBreakdown = new Map();
  const areaBreakdown = new Map();
  const deviceBreakdown = new Map();
  const dateBreakdown = new Map();

  const totals = {
    totalOrders: normalizedOrders.length,
    totalDevices: 0,
    followUpOrders: 0,
    completedOrders: 0,
    canceledOrders: 0,
    assignedTechOrders: 0,
    unassignedTechOrders: 0,
    needsReviewOrders: 0,
    unknownAreaOrders: 0,
    unknownTechCodeOrders: 0,
    withinSLAOrders: 0,
    exceedSLAOrders: 0,
    datedOrders: 0,
    undatedOrders: 0,
    overdueFollowUpOrders: 0,
    todayFollowUpOrders: 0,
    upcomingFollowUpOrders: 0,
  };

  normalizedOrders.forEach((order) => {
    const devCount = Math.max(0, Number(order?.devCount || 0) || 0);
    const status = normalizeText(order?.status) || "Unknown";
    const city = canonicalizeCity(order?.city) || "غير محدد";
    const courier = normalizeText(order?.courier) || "No courier";
    const isFollowUp = isIncompleteInstallationStatus(status);
    const isCompleted = normalizeLookup(status).includes("completed");
    const isCanceled = /cancel/i.test(status);
    const assignmentIssues = getTechnicianAssignmentIssues(order);
    const effectiveDate = order?.instDate || order?.pickDate || null;
    const effectiveDateKey = getUtcDateKey(effectiveDate);

    totals.totalDevices += devCount;
    if (isFollowUp) {
      totals.followUpOrders += 1;
    }
    if (isCompleted) {
      totals.completedOrders += 1;
    }
    if (isCanceled) {
      totals.canceledOrders += 1;
    }
    if (order?.withinSLA === "Yes") {
      totals.withinSLAOrders += 1;
    }
    if (order?.exceedSLA === "Yes") {
      totals.exceedSLAOrders += 1;
    }
    if (assignmentIssues.techId) {
      totals.assignedTechOrders += 1;
    } else {
      totals.unassignedTechOrders += 1;
    }
    if (assignmentIssues.needsReview) {
      totals.needsReviewOrders += 1;
    }
    if (assignmentIssues.missingAreaCode) {
      totals.unknownAreaOrders += 1;
    }
    if (assignmentIssues.missingTechCode) {
      totals.unknownTechCodeOrders += 1;
    }
    if (effectiveDateKey) {
      totals.datedOrders += 1;
      if (isFollowUp && today) {
        if (effectiveDateKey < today) {
          totals.overdueFollowUpOrders += 1;
        } else if (effectiveDateKey === today) {
          totals.todayFollowUpOrders += 1;
        } else {
          totals.upcomingFollowUpOrders += 1;
        }
      }
    } else {
      totals.undatedOrders += 1;
    }

    incrementBreakdown(statusBreakdown, status, {
      devices: devCount,
      followUpCount: isFollowUp ? 1 : 0,
      completedCount: isCompleted ? 1 : 0,
      canceledCount: isCanceled ? 1 : 0,
      status,
    });
    incrementBreakdown(cityBreakdown, city, {
      devices: devCount,
      followUpCount: isFollowUp ? 1 : 0,
      city,
    });
    incrementBreakdown(courierBreakdown, courier, {
      devices: devCount,
      followUpCount: isFollowUp ? 1 : 0,
      courier,
    });
    incrementBreakdown(areaBreakdown, assignmentIssues.areaCode || "Unassigned", {
      devices: devCount,
      followUpCount: isFollowUp ? 1 : 0,
      areaCode: assignmentIssues.areaCode || null,
      areaName: order?.areaName || null,
    });
    incrementBreakdown(technicianBreakdown, assignmentIssues.techId || "Unassigned", {
      devices: devCount,
      followUpCount: isFollowUp ? 1 : 0,
      techId: assignmentIssues.techId || null,
      areaCode: assignmentIssues.areaCode || null,
      techCode: assignmentIssues.techCode || null,
      areaName: order?.areaName || null,
      techShortName: order?.techShortName || null,
      needsReview: assignmentIssues.needsReview ? "Yes" : "",
    });

    if (effectiveDateKey) {
      incrementBreakdown(dateBreakdown, effectiveDateKey, {
        devices: devCount,
        followUpCount: isFollowUp ? 1 : 0,
        date: effectiveDateKey,
      });
    }

    (Array.isArray(order?.devList) ? order.devList : []).forEach((deviceName) => {
      const cleanName = normalizeText(deviceName);
      if (!cleanName) {
        return;
      }
      incrementBreakdown(deviceBreakdown, cleanName, {
        count: 1,
        devices: 1,
        device: cleanName,
      });
    });
  });

  return {
    generatedAt: new Date().toISOString(),
    today,
    totals,
    statusBreakdown: toSortedBreakdown(statusBreakdown),
    cityBreakdown: toSortedBreakdown(cityBreakdown),
    technicianBreakdown: toSortedBreakdown(technicianBreakdown),
    areaBreakdown: toSortedBreakdown(areaBreakdown),
    courierBreakdown: toSortedBreakdown(courierBreakdown),
    deviceBreakdown: toSortedBreakdown(deviceBreakdown),
    dateBreakdown: toSortedBreakdown(dateBreakdown),
  };
};

export const parseInstallationWorkOrderReportFromArrayBuffer = (arrayBuffer) => {
  const orders = parseInstallationWorkOrdersFromArrayBuffer(arrayBuffer);
  const analytics = buildInstallationWorkOrderAnalytics(orders);

  return {
    orders,
    summary: {
      totalOrders: analytics.totals.totalOrders,
      totalDevices: analytics.totals.totalDevices,
      followUpOrders: analytics.totals.followUpOrders,
      completedOrders: analytics.totals.completedOrders,
      canceledOrders: analytics.totals.canceledOrders,
      assignedTechOrders: analytics.totals.assignedTechOrders,
      unassignedTechOrders: analytics.totals.unassignedTechOrders,
      needsReviewOrders: analytics.totals.needsReviewOrders,
      withinSLAOrders: analytics.totals.withinSLAOrders,
      exceedSLAOrders: analytics.totals.exceedSLAOrders,
      datedOrders: analytics.totals.datedOrders,
      undatedOrders: analytics.totals.undatedOrders,
    },
    analytics,
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

const parseReadyForPickup = (row) => {
  const directValue = getRowValue(row, ["Ready for pickup", "Ready for Pickup", "ready_for_pickup", "جاهز للاستلام"]);
  if (directValue) {
    return READY_PICKUP_VALUES.has(normalizeLookup(directValue));
  }

  return normalizeLookup(getRowValue(row, ["Status"])).includes("ready");
};

const inferImportCategory = (preferredDate, importStatus) => {
  if (!preferredDate || NON_ACTIONABLE_STATUSES.has(importStatus)) {
    return "";
  }

  const today = getRiyadhTodayString();
  if (preferredDate < today) {
    return "overdue";
  }
  if (preferredDate === today) {
    return "today";
  }
  return "upcoming";
};

const parseImportedSchedule = (row) => {
  const scheduleCandidates = [
    { label: "Delivery date", aliases: ["Delivery date", "delivery date", "delivery_date"] },
    { label: "Installation date", aliases: ["Installation date", "installation date", "installation_date"] },
    { label: "Pickup date", aliases: ["Pickup date", "pickup date", "pickup_date"] },
    { label: "Order date", aliases: ["Date", "Order date", "order date", "order_date"] },
  ];

  for (const candidate of scheduleCandidates) {
    const rawValue = getRawRowValue(row, candidate.aliases);
    if (!hasMeaningfulCellValue(rawValue)) {
      continue;
    }

    const parsed = parseExcelDateTime(rawValue);
    if (parsed.date) {
      return {
        ...parsed,
        sourceLabel: candidate.label,
      };
    }
  }

  return {
    ...DATE_TIME_FALLBACK,
    sourceLabel: "",
  };
};

const buildNotes = (sheetName, row, devicesSummary, options = {}) => {
  const technicianAssignment = options.techAssignment || parseTechnicianAssignment(getRowValue(row, ["Chat Log", "chat message", "Chat message"]));
  const orderedFields = [
    ["Sheet", sheetName],
    ["ID", getRowValue(row, ["ID", "Order ID"])],
    ["SO ID", getRowValue(row, ["SO ID", "ID"])],
    ["WO ID", getRowValue(row, ["WO ID"])],
    ["Excel status", getRowValue(row, ["Status"])],
    ["Category", options.category],
    ["Ready for pickup", options.readyForPickup ? "Yes" : "No"],
    ["Completed within SLA", getRowValue(row, ["Completed within SLA"])],
    ["Completed Exceed SLA", getRowValue(row, ["Completed Exceed SLA"])],
    ["Email", getRowValue(row, ["Email"])],
    ["Order date", getRowValue(row, ["Date", "Order date"])],
    ["Month", getRowValue(row, ["Month"])],
    ["Delivery date", getRowValue(row, ["Delivery date"])],
    ["Pickup date", getRowValue(row, ["Pickup date"])],
    ["Installation date", getRowValue(row, ["Installation date"])],
    ["Effective schedule date", options.scheduleSource || ""],
    ["Bundled items", options.bundledItems || getRowValue(row, ["Bundled Items", "Device Count"])],
    ["Device count", options.totalQuantity],
    ["Shipping city", getRowValue(row, ["Shipping City", "City"])],
    ["Shipping address", getRowValue(row, ["Shipping Address", "Address"])],
    ["Devices", devicesSummary || getRowValue(row, ["Devices", "Device Description"])],
    ["Courier", getRowValue(row, ["Courier"])],
    ["Courier number", getRowValue(row, ["Courier number"])],
    ["Chat Log", getRowValue(row, ["Chat Log", "chat message", "Chat message"])],
    ["Chat message", getRowValue(row, ["chat message", "Chat message"])],
    ["Tech ID", technicianAssignment.techId],
    ["Area Code", technicianAssignment.areaCode],
    ["Tech Code", technicianAssignment.techCode],
    ["Area Name", technicianAssignment.areaName],
    ["Tech Short Name", technicianAssignment.techShortName],
  ];

  return orderedFields
    .map(([label, value]) => [label, normalizeText(value)])
    .filter(([, value]) => Boolean(value))
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");
};

const buildRowError = (sheetName, rowNumber, row, reason, field = "") => ({
  sheetName,
  rowNumber,
  orderId: normalizeText(row["SO ID"] || row["WO ID"] || row.ID || row["Order ID"]),
  field,
  reason,
});

const IMPORT_REFERENCE_FIELDS = [
  ["requestNumber", "Request number"],
  ["soId", "SO ID"],
  ["woId", "WO ID"],
];

const buildImportedRowSortKey = (order = {}) =>
  `${String(order?.preferredDate || "").trim()}T${String(order?.preferredTime || "00:00").trim() || "00:00"}`;

const compareImportedRowPriority = (left = {}, right = {}) => {
  const scheduleDiff = buildImportedRowSortKey(left).localeCompare(buildImportedRowSortKey(right));
  if (scheduleDiff !== 0) {
    return scheduleDiff;
  }

  return (Number(left?.importMeta?.importSequence) || 0) - (Number(right?.importMeta?.importSequence) || 0);
};

const pickPreferredImportedRow = (existingOrder, incomingOrder) =>
  compareImportedRowPriority(existingOrder, incomingOrder) >= 0 ? existingOrder : incomingOrder;

const normalizeImportedRow = (sheetName, row, rowNumber) => {
  const soId = getRowValue(row, ["SO ID", "ID", "Order ID", "WO ID"]);
  const woId = getRowValue(row, ["WO ID"]);
  const customerName = getRowValue(row, ["Customer", "Customer Name"]);
  const phone = getRowValue(row, ["Phone", "Mobile", "Customer Phone"]);
  const shippingAddress = getRowValue(row, ["Shipping Address", "Address"]);
  const shippingCity = getRowValue(row, ["Shipping City", "City"]);

  if (!soId || !customerName || !phone || (!shippingAddress && !shippingCity)) {
    const missingFields = [
      !soId ? "SO ID / ID / WO ID" : "",
      !customerName ? "Customer" : "",
      !phone ? "Phone" : "",
      !shippingAddress && !shippingCity ? "Shipping Address or Shipping City" : "",
    ].filter(Boolean);
    return {
      error: buildRowError(
        sheetName,
        rowNumber,
        row,
        `Missing required value: ${missingFields.join(", ")}`,
        missingFields[0] || ""
      ),
    };
  }

  const { city, district, addressText: resolvedAddressText } = resolveLocation(shippingAddress, shippingCity);
  const preferred = parseImportedSchedule(row);
  const devicesValue = getRowValue(row, ["Devices", "Device Description"]);
  const bundledItems = toPositiveInteger(getRowValue(row, ["Bundled Items", "Device Count", "Quantity"]), 0);
  const devicesSummary = summarizeDevices(devicesValue);
  const acDetails = buildAcDetails(devicesValue, bundledItems || 1);
  const importStatus = normalizeImportedStatus(getRowValue(row, ["Status"]));
  const chatLog = getRowValue(row, ["Chat Log", "chat message", "Chat message"]);
  const techAssignment = parseTechnicianAssignment(chatLog);
  const readyForPickup = parseReadyForPickup(row);
  const totalQuantity = acDetails.reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0);
  const category = inferImportCategory(preferred.date, importStatus);
  const addressText = resolvedAddressText || shippingAddress || [district || city, city].filter(Boolean).join(", ") || "غير محدد";

  if (!preferred.date) {
    return {
      error: buildRowError(
        sheetName,
        rowNumber,
        row,
        "Invalid installation, delivery, or pickup date. Expected DD-MM-YYYY or DD-MM-YYYY HH:MM",
        preferred.sourceLabel || "Schedule date"
      ),
    };
  }
  if (!acDetails.length) {
    return {
      error: buildRowError(sheetName, rowNumber, row, "Devices column is empty or invalid", "Devices"),
    };
  }

  return {
    requestNumber: soId,
    soId,
    woId,
    customerName,
    phone,
    secondaryPhone: "",
    whatsappPhone: phone,
    city: city || canonicalizeCity(shippingCity) || "غير محدد",
    district: district || city || canonicalizeCity(shippingCity) || "غير محدد",
    addressText,
    landmark: "",
    mapLink: buildMapsLink(addressText),
    sourceChannel: `Excel import - ${sheetName}`,
    serviceSummary: devicesSummary || `Imported from Excel - ${Math.max(1, totalQuantity)} device(s)`,
    externalStatus: getRowValue(row, ["Status"]),
    priority: "normal",
    deliveryType: "none",
    importStatus,
    acCount: totalQuantity,
    preferredDate: preferred.date,
    preferredTime: preferred.time || "09:00",
    readyForPickup,
    category,
    notes: buildNotes(sheetName, row, devicesSummary, {
      readyForPickup,
      category,
      bundledItems,
      totalQuantity,
      techAssignment,
      scheduleSource: preferred.sourceLabel,
    }),
    acDetails,
    chatLog,
    techId: techAssignment.techId,
    areaCode: techAssignment.areaCode,
    techCode: techAssignment.techCode,
    areaName: techAssignment.areaName,
    techShortName: techAssignment.techShortName,
    importMeta: {
      sheetName,
      soId,
      woId,
      excelStatus: getRowValue(row, ["Status"]),
      shippingCity,
      bundledItems,
      deviceCount: totalQuantity,
      scheduleSource: preferred.sourceLabel,
      readyForPickup,
      category,
      chatLog,
      techId: techAssignment.techId,
      areaCode: techAssignment.areaCode,
      techCode: techAssignment.techCode,
    },
  };
};

const getSheetHeaders = (worksheet) => {
  const headerRow = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false })[0];
  return Array.isArray(headerRow) ? headerRow.map((value) => normalizeText(value)).filter(Boolean) : [];
};

export const isIncompleteInstallationStatus = (status) =>
  INCOMPLETE_INSTALLATION_STATUSES.has(normalizeText(status));

export const parseInstallationWorkOrdersFromArrayBuffer = (arrayBuffer) => {
  const workbook = XLSX.read(arrayBuffer, { type: "array", raw: false, cellDates: true });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    return [];
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, {
    defval: "",
    raw: false,
    blankrows: false,
    dateNF: "dd-mm-yyyy",
  });

  return rows.map((row) => normalizeInstallationWorkOrderRow(row));
};

export const parseExcelOrdersFromArrayBuffer = (arrayBuffer, fileName = "data.xlsx") => {
  const workbook = XLSX.read(arrayBuffer, { type: "array", raw: false });
  const orders = [];
  const invalidRows = [];
  let deduplicatedRows = 0;
  let importSequence = 0;
  const seenReferences = {
    requestNumber: new Map(),
    soId: new Map(),
    woId: new Map(),
  };

  const registerReference = (type, value, orderIndex) => {
    const normalized = normalizeLookup(value);
    if (normalized) {
      seenReferences[type].set(normalized, orderIndex);
    }
  };

  const registerOrderReferences = (orderIndex, normalized) => {
    for (const [type] of IMPORT_REFERENCE_FIELDS) {
      registerReference(type, normalized?.[type], orderIndex);
    }
  };

  const findMatchedOrderReferences = (normalized) => {
    const matches = [];
    for (const [type, label] of IMPORT_REFERENCE_FIELDS) {
      const lookupValue = normalizeLookup(normalized?.[type]);
      const orderIndex = seenReferences[type].get(lookupValue);
      if (lookupValue && Number.isInteger(orderIndex)) {
        matches.push({
          type,
          label,
          value: normalizeText(normalized[type]),
          orderIndex,
        });
      }
    }

    return matches;
  };

  const sheets = workbook.SheetNames.map((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const headers = getSheetHeaders(worksheet);
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "", raw: false });

    rows.forEach((row, index) => {
      const rowNumber = index + 2;
      const normalized = normalizeImportedRow(sheetName, row, rowNumber);
      if (normalized?.error) {
        invalidRows.push(normalized.error);
        return;
      }

      normalized.importMeta = {
        ...normalized.importMeta,
        importSequence,
      };
      importSequence += 1;

      const matchedReferences = findMatchedOrderReferences(normalized);
      const matchedOrderIndexes = [...new Set(matchedReferences.map((match) => match.orderIndex))];
      if (matchedOrderIndexes.length > 1) {
        invalidRows.push(
          buildRowError(
            sheetName,
            rowNumber,
            row,
            `Conflicting duplicate references detected in upload: ${matchedReferences
              .map((match) => `${match.label} ${match.value}`)
              .join(", ")}`,
            matchedReferences[0]?.label || ""
          )
        );
        return;
      }

      if (!matchedOrderIndexes.length) {
        const orderIndex = orders.push(normalized) - 1;
        registerOrderReferences(orderIndex, normalized);
        return;
      }

      const existingOrderIndex = matchedOrderIndexes[0];
      const preferredOrder = pickPreferredImportedRow(orders[existingOrderIndex], normalized);
      orders[existingOrderIndex] = preferredOrder;
      registerOrderReferences(existingOrderIndex, normalized);
      registerOrderReferences(existingOrderIndex, preferredOrder);
      deduplicatedRows += 1;
    });

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
      completedOrders: orders.filter((order) => order.importStatus === "completed").length,
      invalidRows: invalidRows.length,
      duplicateRows: deduplicatedRows,
      deduplicatedRows,
      readyForPickupOrders: orders.filter((order) => order.readyForPickup).length,
      remainingToday: orders.filter(
        (order) => order.preferredDate === getRiyadhTodayString() && !NON_ACTIONABLE_STATUSES.has(order.importStatus)
      ).length,
      overdueOrders: orders.filter(
        (order) => order.preferredDate && order.preferredDate < getRiyadhTodayString() && !NON_ACTIONABLE_STATUSES.has(order.importStatus)
      ).length,
      totalDevices: orders.reduce((sum, order) => sum + Math.max(1, Number(order.acCount || 0)), 0),
      bundledDevices: orders.reduce((sum, order) => sum + toPositiveInteger(order.importMeta?.bundledItems, 0), 0),
      statusCounts: Array.from(
        orders.reduce((map, order) => {
          const status = normalizeImportedStatus(order.importStatus);
          map.set(status, (map.get(status) || 0) + 1);
          return map;
        }, new Map()).entries()
      ).map(([status, count]) => ({ status, count })),
    },
  };
};
