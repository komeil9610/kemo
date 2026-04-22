/**
 * Developed by [Kumeel Taher Al Nahab / كميل طاهر ال نهاب]
 * For TrkeebPro
 * Build date: 2026-04-10
 */
import {
  getTechnicianAssignmentIssues,
  normalizeInstallationWorkOrderRow,
  parseExcelOrdersFromArrayBuffer,
  parseInstallationWorkOrderReportFromArrayBuffer,
  parseTechnicianAssignment,
} from "./excelImport.js";
import { EmailMessage } from "cloudflare:email";

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost",
  "http://127.0.0.1",
  "https://localhost",
  "https://127.0.0.1",
  "capacitor://localhost",
];

const LOGIN_EMAIL_ALIASES = new Map([]);
const PRIVILEGED_INTERNAL_EMAILS = new Map([
  ["komeil9610@gmail.com", ["admin"]],
  ["kumeelalnahab@gmail.com", ["operations_manager"]],
]);

const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1581093458791-9d15482442f0?auto=format&fit=crop&w=900&q=80";

export default {
  async fetch(request, env) {
    const corsHeaders = buildCorsHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const url = new URL(request.url);
      const path = url.pathname;

      if (path === "/api/health" && request.method === "GET") {
        return json(
          {
            message: "ok",
            service: "tarkeeb-pro-edge-api",
            date: new Date().toISOString(),
          },
          200,
          request,
          env
        );
      }

      if (path === "/api/auth/register" && request.method === "POST") {
        return register(request, env);
      }

      if (path === "/api/auth/login" && request.method === "POST") {
        return login(request, env);
      }

      if (path === "/api/operations/dashboard" && request.method === "GET") {
        return getOperationsDashboard(request, env);
      }

      if (path === "/api/operations/summary" && request.method === "GET") {
        return getOperationsSummary(request, env);
      }

      if (path === "/api/operations/time-standards" && request.method === "GET") {
        return getServiceTimeStandards(request, env);
      }

      if (path === "/api/operations/time-standards" && request.method === "PUT") {
        return updateServiceTimeStandards(request, env);
      }

      if (path === "/api/operations/area-clusters" && request.method === "GET") {
        return getInternalAreaClusters(request, env);
      }

      if (path === "/api/operations/area-clusters" && request.method === "PUT") {
        return updateInternalAreaClusters(request, env);
      }

      if (path === "/api/operations/orders/import" && request.method === "POST") {
        return importServiceOrders(request, env);
      }

      if (path === "/api/operations/orders/import-jobs" && request.method === "POST") {
        return createImportJob(request, env);
      }

      if (path.startsWith("/api/operations/orders/import-jobs/") && path.endsWith("/process") && request.method === "POST") {
        const id = path.split("/").slice(-2, -1)[0];
        return processImportJob(request, id, env);
      }

      if (path.startsWith("/api/operations/orders/import-jobs/") && request.method === "GET") {
        const id = path.split("/").pop();
        return getImportJob(request, id, env);
      }

      if (path === "/api/operations/excel-import/preview-upload" && request.method === "POST") {
        return previewExcelUpload(request, env);
      }

      if (path === "/api/operations/excel-import/upload" && request.method === "POST") {
        return previewExcelUpload(request, env);
      }

      if (path === "/api/operations/orders" && request.method === "POST") {
        return createServiceOrder(request, env);
      }

      if (path === "/api/operations/technicians" && request.method === "POST") {
        return createTechnician(request, env);
      }

      if (path.startsWith("/api/operations/technicians/") && request.method === "PUT" && !path.endsWith("/status")) {
        const id = path.split("/").pop();
        return updateTechnician(request, id, env);
      }

      if (path.startsWith("/api/operations/technicians/") && request.method === "DELETE") {
        const id = path.split("/").pop();
        return deleteTechnician(request, id, env);
      }

      if (path === "/api/operations/technician/orders" && request.method === "GET") {
        return getTechnicianOrders(request, env);
      }

      if (path === "/api/notifications" && request.method === "GET") {
        return listNotifications(request, env);
      }

      if (path === "/api/notifications/config" && request.method === "GET") {
        return getPushNotificationConfig(request, env);
      }

      if (path === "/api/notifications/read-all" && request.method === "PUT") {
        return markAllNotificationsRead(request, env);
      }

      if (path.startsWith("/api/notifications/") && path.endsWith("/read") && request.method === "PUT") {
        const id = path.split("/").slice(-2, -1)[0];
        return markNotificationRead(request, id, env);
      }

      if (path.startsWith("/api/operations/orders/") && path.endsWith("/status") && request.method === "PUT") {
        const id = path.split("/").slice(-2, -1)[0];
        return updateServiceOrderStatus(request, id, env);
      }

      if (path.startsWith("/api/operations/orders/") && path.endsWith("/close-request") && request.method === "POST") {
        const id = path.split("/").slice(-2, -1)[0];
        return requestServiceOrderClosure(request, id, env);
      }

      if (path.startsWith("/api/operations/orders/") && path.endsWith("/close-otp") && request.method === "POST") {
        const id = path.split("/").slice(-2, -1)[0];
        return submitServiceOrderClosureOtp(request, id, env);
      }

      if (path.startsWith("/api/operations/orders/") && path.endsWith("/close-approve") && request.method === "POST") {
        const id = path.split("/").slice(-2, -1)[0];
        return approveServiceOrderClosure(request, id, env);
      }

      if (path.startsWith("/api/operations/orders/") && path.endsWith("/cancel") && request.method === "POST") {
        const id = path.split("/").slice(-2, -1)[0];
        return cancelServiceOrder(request, id, env);
      }

      if (path.startsWith("/api/operations/technicians/") && path.endsWith("/status") && request.method === "PUT") {
        const id = path.split("/").slice(-2, -1)[0];
        return updateTechnicianAvailability(request, id, env);
      }

      if (path.startsWith("/api/operations/orders/") && path.endsWith("/extras") && request.method === "PUT") {
        const id = path.split("/").slice(-2, -1)[0];
        return updateServiceOrderExtras(request, id, env);
      }

      if (path.startsWith("/api/operations/orders/") && path.endsWith("/photos") && request.method === "POST") {
        const id = path.split("/").slice(-2, -1)[0];
        return uploadServiceOrderPhoto(request, id, env);
      }

      if (path === "/api/notifications/push" && request.method === "POST") {
        return pushNotification(request, env);
      }

      if (path === "/api/notifications/subscribe" && request.method === "POST") {
        return subscribe(request, env);
      }

      if (path.startsWith("/api/operations/orders/") && request.method === "PUT") {
        const id = path.split("/").pop();
        return updateServiceOrder(request, id, env);
      }

      if (path.startsWith("/api/orders/") && request.method === "PATCH") {
        const id = path.split("/").pop();
        return quickUpdateCompactOrderStatus(request, id, env);
      }

      if (path === "/api/products" && request.method === "GET") {
        return listProducts(request, url, env);
      }

      if (path === "/api/footer" && request.method === "GET") {
        return getFooterSettings(request, env);
      }

      if (path === "/api/home-settings" && request.method === "GET") {
        return getHomeSettings(request, env);
      }

      if (path === "/api/products" && request.method === "POST") {
        return createProduct(request, env);
      }

      if (path.startsWith("/api/products/") && request.method === "GET") {
        const id = path.split("/").pop();
        return getProductById(request, id, env);
      }

      if (path.startsWith("/api/products/") && request.method === "PUT") {
        const id = path.split("/").pop();
        return updateProduct(request, id, env);
      }

      if (path.startsWith("/api/products/") && request.method === "DELETE") {
        const id = path.split("/").pop();
        return deleteProduct(request, id, env);
      }

      if (path === "/api/admin/products" && request.method === "GET") {
        return listAdminProducts(request, env);
      }

      if (path === "/api/admin/footer" && request.method === "GET") {
        return getAdminFooterSettings(request, env);
      }

      if (path === "/api/admin/footer" && request.method === "PUT") {
        return updateAdminFooterSettings(request, env);
      }

      if (path === "/api/admin/home-settings" && request.method === "GET") {
        return getAdminHomeSettings(request, env);
      }

      if (path === "/api/admin/home-settings" && request.method === "PUT") {
        return updateAdminHomeSettings(request, env);
      }

      if (path === "/api/admin/users" && request.method === "GET") {
        return listAdminUsers(request, env);
      }

      if (path.startsWith("/api/admin/users/") && request.method === "PUT") {
        const id = path.split("/").pop();
        return updateAdminUser(request, id, env);
      }

      if (path === "/api/bookings" && request.method === "POST") {
        return createBooking(request, env);
      }

      if ((path === "/api/bookings" || path === "/api/orders") && request.method === "GET") {
        return listUserOrders(request, env);
      }

      if ((path.startsWith("/api/bookings/") || path.startsWith("/api/orders/")) && request.method === "GET") {
        const id = path.split("/").pop();
        return getUserOrderById(request, id, env);
      }

      if (path.startsWith("/api/bookings/") && path.endsWith("/cancel") && request.method === "PUT") {
        const id = path.split("/").slice(-2, -1)[0];
        return cancelUserOrder(request, id, env);
      }

      if (path === "/api/cart/checkout" && request.method === "POST") {
        return checkoutCart(request, env);
      }

      if (path === "/api/admin/bookings" && request.method === "GET") {
        return listAdminBookings(request, env);
      }

      if (path.startsWith("/api/admin/bookings/") && request.method === "PUT") {
        const id = path.split("/").pop();
        return updateBookingStatus(request, id, env);
      }

      return json({ message: "Route not found" }, 404, request, env);
    } catch (error) {
      return json(
        {
          message: "Internal error",
          error: error?.message || "Unknown error",
        },
        500,
        request,
        env
      );
    }
  },

  async email(message, env, ctx) {
    const receivedAddress = sanitizeEmailHeaderValue(message.to).toLowerCase();
    const allowedInboundAddresses = getAllowedInboundEmailAddresses(env);
    const forwardRecipients = parseEmailAddressList(env.INBOUND_EMAIL_FORWARD_TO);
    const alertRecipients = parseEmailAddressList(env.INBOUND_EMAIL_ALERT_TO);

    if (!allowedInboundAddresses.includes(receivedAddress)) {
      message.setReject("This inbox is not configured for the worker.");
      return;
    }

    if (!forwardRecipients.length && !alertRecipients.length) {
      message.setReject("Inbound email routing is not configured.");
      return;
    }

    for (const recipient of forwardRecipients) {
      await message.forward(recipient);
    }

    if (alertRecipients.length && env.SEND_EMAIL) {
      ctx.waitUntil(sendInboundEmailAlert(message, env, alertRecipients));
    }
  },

  async queue(batch, env) {
    for (const message of batch.messages || []) {
      const jobId = String(message?.body?.jobId || "").trim();
      if (!jobId) {
        message.ack();
        continue;
      }

      try {
        await processImportJobInBackground(env, jobId);
        message.ack();
      } catch (error) {
        console.error("Import queue job failed", { jobId, error: String(error?.message || error || "") });
        message.retry();
      }
    }
  },
};

import webpush from "web-push";

const DEFAULT_VAPID_PUBLIC_KEY = "BJDe1im_oVNRMdPrjtBjE7qwlb-CJUDIxxc_Dp-mhPwuiuSgTHcFxWgS3MX-gyVyy3YPMS8nGQ6YaJIb1rrGgyo";
const DEFAULT_VAPID_CONTACT_EMAIL = "ops@tarkeebpro.sa";
const DEFAULT_EMAIL_ALERT_SUBJECT_PREFIX = "[Kumeel Al Nahab]";
const DEFAULT_INBOUND_EMAIL_ADDRESSES = [
  "hashimaldrweish@kumeelalnahab.com",
  "bookings@kumeelalnahab.com",
  "customerservice@kumeelalnahab.com",
  "info@kumeelalnahab.com",
];
let webPushConfigCacheKey = "";

function getWebPushConfig(env = {}) {
  const publicKey = String(env.WEB_PUSH_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC_KEY || "").trim();
  const privateKey = String(env.WEB_PUSH_PRIVATE_KEY || "").trim();
  const rawContact = String(env.WEB_PUSH_CONTACT_EMAIL || DEFAULT_VAPID_CONTACT_EMAIL || "").trim();
  const contactEmail = rawContact ? (rawContact.startsWith("mailto:") ? rawContact : `mailto:${rawContact}`) : "";

  return {
    enabled: Boolean(publicKey && privateKey && contactEmail),
    publicKey,
    privateKey,
    contactEmail,
  };
}

function ensureWebPushConfigured(env = {}) {
  const config = getWebPushConfig(env);
  if (!config.enabled) {
    return null;
  }

  const cacheKey = `${config.publicKey}:${config.privateKey}:${config.contactEmail}`;
  if (webPushConfigCacheKey !== cacheKey) {
    webpush.setVapidDetails(config.contactEmail, config.publicKey, config.privateKey);
    webPushConfigCacheKey = cacheKey;
  }

  return config;
}

function parseEmailAddressList(value) {
  const seen = new Set();

  return String(value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .filter((entry) => {
      const key = entry.toLowerCase();
      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
}

function getAllowedInboundEmailAddresses(env = {}) {
  const configured = parseEmailAddressList(env.INBOUND_EMAIL_ALLOWED_TO);
  const list = configured.length ? configured : DEFAULT_INBOUND_EMAIL_ADDRESSES;
  return list.map((entry) => entry.toLowerCase());
}

function sanitizeEmailHeaderValue(value) {
  return String(value || "")
    .replace(/[\r\n]+/g, " ")
    .trim();
}

function getEmailHeader(message, name) {
  return sanitizeEmailHeaderValue(message?.headers?.get?.(name) || "");
}

function buildPlainTextEmail({ from, to, subject, text }) {
  const safeFrom = sanitizeEmailHeaderValue(from);
  const safeTo = sanitizeEmailHeaderValue(to);
  const safeSubject = sanitizeEmailHeaderValue(subject);
  const normalizedText = String(text || "").replace(/\r?\n/g, "\r\n");
  const raw = [
    `From: <${safeFrom}>`,
    `To: <${safeTo}>`,
    `Subject: ${safeSubject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    normalizedText,
    "",
  ].join("\r\n");

  return new EmailMessage(safeFrom, safeTo, raw);
}

async function sendInboundEmailAlert(message, env, recipients = []) {
  const receivedAddress = sanitizeEmailHeaderValue(message.to);
  const senderAddress = sanitizeEmailHeaderValue(message.from);
  const originalSubject = getEmailHeader(message, "subject") || "(no subject)";
  const originalDate = getEmailHeader(message, "date") || new Date().toISOString();
  const alertSubject = `${DEFAULT_EMAIL_ALERT_SUBJECT_PREFIX} New inbound email for ${receivedAddress}`;
  const alertBody = [
    "A new inbound email was received by the API worker.",
    "",
    `To: ${receivedAddress}`,
    `From: ${senderAddress || "(empty envelope sender)"}`,
    `Subject: ${originalSubject}`,
    `Date: ${originalDate}`,
  ].join("\n");

  await Promise.all(
    recipients.map((recipient) =>
      env.SEND_EMAIL.send(
        buildPlainTextEmail({
          from: receivedAddress,
          to: recipient,
          subject: alertSubject,
          text: alertBody,
        })
      )
    )
  );
}

function getWorkspacePathForRole(role) {
  return {
    admin: "/admin",
    operations_manager: "/operations-manager",
    technician: "/technician",
  }[String(role || "").trim()] || "/login";
}

async function getPushNotificationConfig(request, env) {
  const config = getWebPushConfig(env);
  return json(
    {
      enabled: config.enabled,
      publicKey: config.publicKey || null,
    },
    200,
    request,
    env
  );
}

async function subscribe(request, env) {
  const body = await readJson(request);
  const { endpoint, keys } = body;
  const user = await readActiveUser(request, env);

  if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
    return json({ message: "Invalid subscription" }, 400, request, env);
  }

  await env.DB.prepare(
    `INSERT INTO push_subscriptions (endpoint, p256dh, auth, user_id)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(endpoint) DO UPDATE SET
       p256dh = excluded.p256dh,
       auth = excluded.auth,
       user_id = excluded.user_id`
  )
    .bind(endpoint, keys.p256dh, keys.auth, user ? user.sub : null)
    .run();

  return json({ message: "Subscription saved" }, 201, request, env);
}

async function pushNotification(request, env) {
  if (!ensureWebPushConfigured(env)) {
    return json({ message: "Push notifications are not configured" }, 503, request, env);
  }

  const body = await readJson(request);
  const { message, title = "TrkeebPro", url = "/login", tag = "broadcast" } = body;

  if (!message) {
    return json({ message: "Message is required" }, 400, request, env);
  }

  const { results } = await env.DB.prepare("SELECT * FROM push_subscriptions").all();

  const payload =
    typeof message === "string"
      ? JSON.stringify({ title, body: message, url, tag, silent: false })
      : JSON.stringify({ title, url, tag, silent: false, ...message });

  const notificationPromises = results.map(async (subscription) => {
    const pushConfig = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    try {
      return await webpush.sendNotification(pushConfig, payload);
    } catch (error) {
      if ([404, 410].includes(Number(error?.statusCode))) {
        await env.DB.prepare("DELETE FROM push_subscriptions WHERE id = ?").bind(subscription.id).run();
      }
      return null;
    }
  });

  await Promise.allSettled(notificationPromises);

  return json({ message: "Push notifications sent" }, 200, request, env);
}

async function sendPushToUser(env, userId, payload = {}) {
  if (!userId || !ensureWebPushConfigured(env)) {
    return;
  }

  const { results } = await env.DB.prepare(
    `SELECT s.id, s.endpoint, s.p256dh, s.auth, u.role
     FROM push_subscriptions s
     LEFT JOIN users u ON u.id = s.user_id
     WHERE s.user_id = ?`
  )
    .bind(Number(userId))
    .all();

  if (!results?.length) {
    return;
  }

  const targetUrl = payload.url || getWorkspacePathForRole(results[0]?.role);
  const message = JSON.stringify({
    title: payload.title || "TrkeebPro",
    body: payload.body || "",
    url: targetUrl,
    tag: payload.tag || (payload.relatedOrderId ? `order-${payload.relatedOrderId}` : `user-${userId}`),
    relatedOrderId: payload.relatedOrderId || null,
    silent: false,
  });

  await Promise.allSettled(
    results.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          message
        );
      } catch (error) {
        if ([404, 410].includes(Number(error?.statusCode))) {
          await env.DB.prepare("DELETE FROM push_subscriptions WHERE id = ?").bind(subscription.id).run();
        }
      }
    })
  );
}

async function register(request, env) {
  const body = await readJson(request);
  const name = (body.name || "").trim();
  const email = (body.email || "").toLowerCase().trim();
  const password = body.password || "";

  if (!name || !email || password.length < 6) {
    return json({ message: "Invalid name, email, or password" }, 400, request, env);
  }

  const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?")
    .bind(email)
    .first();

  if (existing) {
    return json({ message: "Email already exists" }, 409, request, env);
  }

  const passwordHash = await hashPassword(password, user.email);
  const created = await env.DB.prepare(
    "INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)"
  )
    .bind(name, email, passwordHash, "member", "active")
    .run();

  const userId = created.meta.last_row_id;
  const user = { id: userId, name, email, role: "member", status: "active" };
  const jwtSecret = getJwtSecret(env, request);
  const token = await signJwt(
    { sub: String(userId), email, name, role: user.role, status: user.status },
    jwtSecret
  );

  return json({ token, user }, 201, request, env);
}

async function login(request, env) {
  const body = await readJson(request);
  const email = normalizeLoginEmail(body.email || "");
  const password = body.password || "";
  const requestedWorkspaceRole = body.workspaceRole || request.headers.get("X-Workspace-Role") || "";

  if (!email || !password) {
    return json({ message: "Email and password are required" }, 400, request, env);
  }

  const user = await env.DB.prepare(
    "SELECT id, name, email, password_hash, role, status FROM users WHERE email = ?"
  )
    .bind(email)
    .first();

  if (!user) {
    return json({ message: "Invalid credentials" }, 401, request, env);
  }

  if ((user.status || "active") !== "active") {
    return json({ message: "This account is inactive" }, 403, request, env);
  }

  const passwordHash = await hashPassword(password, user.email);
  if (passwordHash !== user.password_hash) {
    return json({ message: "Invalid credentials" }, 401, request, env);
  }

  const workspaceRoles = await readUserWorkspaceRoles(env, user.id, user.role);
  const activeRole = resolveRequestedWorkspaceRole(requestedWorkspaceRole, workspaceRoles);

  const technician =
    ["technician"].includes(normalizeServerRole(user.role))
      ? await env.DB.prepare(
          `SELECT
             id,
             user_id,
             name,
             phone,
             zone,
             coverage_json,
             status,
             COALESCE(notes, '') AS notes,
             COALESCE(excel_technician_code, '') AS excel_technician_code
           FROM technicians
           WHERE user_id = ?`
        )
          .bind(Number(user.id))
          .first()
      : null;

  const jwtSecret = getJwtSecret(env, request);
  const token = await signJwt(
    {
      sub: String(user.id),
      email: user.email,
      name: user.name,
      role: activeRole,
      roles: workspaceRoles,
      status: user.status || "active",
    },
    jwtSecret
  );

  return json(
    {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: activeRole,
        workspaceRoles,
        status: user.status || "active",
        technicianId: technician ? String(technician.id) : null,
        region: technician ? mapTechnician(technician).region : null,
        zone: technician ? mapTechnician(technician).zone : null,
        technicianName: technician?.name || null,
        technician: technician ? mapTechnician({ ...technician, email: user.email }) : null,
      },
    },
    200,
    request,
    env
  );
}

function normalizeLoginEmail(value) {
  const normalized = String(value || "").toLowerCase().trim();
  return LOGIN_EMAIL_ALIASES.get(normalized) || normalized;
}

function getPrivilegedWorkspaceRolesForEmail(value) {
  const normalized = normalizeLoginEmail(value);
  return PRIVILEGED_INTERNAL_EMAILS.get(normalized) || [];
}

async function listProducts(request, url, env) {
  const category = (url.searchParams.get("category") || "").trim();
  const city = (url.searchParams.get("city") || "").trim();
  const limit = Math.min(Number(url.searchParams.get("limit") || 12), 50);
  const page = Math.max(Number(url.searchParams.get("page") || 1), 1);
  const offset = (page - 1) * limit;

  let query =
    "SELECT id, owner_user_id, name, description, category, city, price_per_day, rating, image_url, quantity FROM products WHERE 1=1";
  const binds = [];

  if (category) {
    query += " AND category = ?";
    binds.push(category);
  }

  if (city) {
    query += " AND city LIKE ?";
    binds.push(`%${city}%`);
  }

  query += " ORDER BY id DESC LIMIT ? OFFSET ?";
  binds.push(limit, offset);

  const { results } = await env.DB.prepare(query).bind(...binds).all();

  return json(
    {
      products: (results || []).map(mapProduct),
      page,
      limit,
    },
    200,
    request,
    env
  );
}

async function getProductById(request, id, env) {
  if (!/^\d+$/.test(String(id))) {
    return json({ message: "Invalid product id" }, 400, request, env);
  }

  const product = await env.DB.prepare(
    "SELECT id, owner_user_id, name, description, category, city, price_per_day, rating, image_url, quantity FROM products WHERE id = ?"
  )
    .bind(Number(id))
    .first();

  if (!product) {
    return json({ message: "Product not found" }, 404, request, env);
  }

  return json({ product: mapProduct(product) }, 200, request, env);
}

async function createProduct(request, env) {
  const admin = await requireAdmin(request, env);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
  }

  const body = await readJson(request);
  const product = normalizeProductInput(body);
  if (product.error) {
    return json({ message: product.error }, 400, request, env);
  }

  const created = await env.DB.prepare(
    "INSERT INTO products (owner_user_id, name, description, category, city, price_per_day, rating, image_url, quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  )
    .bind(
      Number(admin.sub),
      product.name,
      product.description,
      product.category,
      product.city,
      product.pricePerDay,
      product.rating,
      product.imageUrl,
      product.quantity
    )
    .run();

  return json({ id: created.meta.last_row_id, message: "Product created" }, 201, request, env);
}

async function updateProduct(request, id, env) {
  const admin = await requireAdmin(request, env);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
  }

  if (!/^\d+$/.test(String(id))) {
    return json({ message: "Invalid product id" }, 400, request, env);
  }

  const existing = await env.DB.prepare("SELECT id FROM products WHERE id = ?").bind(Number(id)).first();
  if (!existing) {
    return json({ message: "Product not found" }, 404, request, env);
  }

  const body = await readJson(request);
  const product = normalizeProductInput(body);
  if (product.error) {
    return json({ message: product.error }, 400, request, env);
  }

  await env.DB.prepare(
    "UPDATE products SET name = ?, description = ?, category = ?, city = ?, price_per_day = ?, rating = ?, image_url = ?, quantity = ? WHERE id = ?"
  )
    .bind(
      product.name,
      product.description,
      product.category,
      product.city,
      product.pricePerDay,
      product.rating,
      product.imageUrl,
      product.quantity,
      Number(id)
    )
    .run();

  return json({ message: "Product updated" }, 200, request, env);
}

async function deleteProduct(request, id, env) {
  const admin = await requireAdmin(request, env);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
  }

  if (!/^\d+$/.test(String(id))) {
    return json({ message: "Invalid product id" }, 400, request, env);
  }

  const deleted = await env.DB.prepare("DELETE FROM products WHERE id = ?").bind(Number(id)).run();
  if (!deleted.meta.changes) {
    return json({ message: "Product not found" }, 404, request, env);
  }

  return json({ message: "Product deleted" }, 200, request, env);
}

async function listAdminProducts(request, env) {
  const admin = await requireAdmin(request, env);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
  }

  const { results } = await env.DB.prepare(
    `SELECT p.id, p.owner_user_id, p.name, p.description, p.category, p.city, p.price_per_day, p.rating, p.image_url, p.quantity,
            u.name AS owner_name, u.email AS owner_email
     FROM products p
     LEFT JOIN users u ON u.id = p.owner_user_id
     ORDER BY p.id DESC`
  ).all();

  return json(
    {
      products: (results || []).map((row) => ({
        ...mapProduct(row),
        ownerName: row.owner_name || null,
        ownerEmail: row.owner_email || null,
      })),
    },
    200,
    request,
    env
  );
}

async function getFooterSettings(request, env) {
  const settings = await readFooterSettings(env);
  return json({ footer: settings }, 200, request, env);
}

async function getHomeSettings(request, env) {
  const settings = await readHomeSettings(env);
  return json({ homeSettings: settings }, 200, request, env);
}

async function getAdminFooterSettings(request, env) {
  const admin = await requireAdmin(request, env);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
  }

  const settings = await readFooterSettings(env);
  return json({ footer: settings }, 200, request, env);
}

async function updateAdminFooterSettings(request, env) {
  const admin = await requireAdmin(request, env);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
  }

  const body = await readJson(request);
  const normalized = normalizeFooterSettingsInput(body);
  if (normalized.error) {
    return json({ message: normalized.error }, 400, request, env);
  }

  await env.DB.prepare(
    `INSERT INTO footer_settings (
      id,
      about_text,
      useful_links_json,
      customer_service_links_json,
      social_links_json,
      copyright_text,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      about_text = excluded.about_text,
      useful_links_json = excluded.useful_links_json,
      customer_service_links_json = excluded.customer_service_links_json,
      social_links_json = excluded.social_links_json,
      copyright_text = excluded.copyright_text,
      updated_at = CURRENT_TIMESTAMP`
  )
    .bind(
      1,
      normalized.aboutText,
      JSON.stringify(normalized.usefulLinks),
      JSON.stringify(normalized.customerServiceLinks),
      JSON.stringify(normalized.socialLinks),
      normalized.copyrightText
    )
    .run();

  const settings = await readFooterSettings(env);
  return json({ message: "Footer updated", footer: settings }, 200, request, env);
}

async function getAdminHomeSettings(request, env) {
  const admin = await requireAdmin(request, env);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
  }

  const settings = await readHomeSettings(env);
  return json({ homeSettings: settings }, 200, request, env);
}

async function updateAdminHomeSettings(request, env) {
  const admin = await requireAdmin(request, env);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
  }

  const body = await readJson(request);
  const normalized = normalizeHomeSettingsInput(body);
  if (normalized.error) {
    return json({ message: normalized.error }, 400, request, env);
  }

  await env.DB.prepare(
    `INSERT INTO home_settings (
      id,
      hero_kicker,
      hero_title,
      hero_subtitle,
      primary_button_text,
      primary_button_url,
      secondary_button_text,
      secondary_button_url,
      stats_json,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      hero_kicker = excluded.hero_kicker,
      hero_title = excluded.hero_title,
      hero_subtitle = excluded.hero_subtitle,
      primary_button_text = excluded.primary_button_text,
      primary_button_url = excluded.primary_button_url,
      secondary_button_text = excluded.secondary_button_text,
      secondary_button_url = excluded.secondary_button_url,
      stats_json = excluded.stats_json,
      updated_at = CURRENT_TIMESTAMP`
  )
    .bind(
      1,
      normalized.heroKicker,
      normalized.heroTitle,
      normalized.heroSubtitle,
      normalized.primaryButtonText,
      normalized.primaryButtonUrl,
      normalized.secondaryButtonText,
      normalized.secondaryButtonUrl,
      JSON.stringify({
        contentVersion: 2,
        heroNote: normalized.heroNote,
        heroHighlights: normalized.heroHighlights,
        stats: normalized.stats,
        aboutTitle: normalized.aboutTitle,
        aboutText: normalized.aboutText,
        servicesTitle: normalized.servicesTitle,
        services: normalized.services,
        featuresTitle: normalized.featuresTitle,
        features: normalized.features,
        galleryTitle: normalized.galleryTitle,
        galleryImages: normalized.galleryImages,
        testimonialsTitle: normalized.testimonialsTitle,
        testimonials: normalized.testimonials,
        contactTitle: normalized.contactTitle,
        phone: normalized.phone,
        whatsappNumber: normalized.whatsappNumber,
        coverageText: normalized.coverageText,
        hoursText: normalized.hoursText,
      })
    )
    .run();

  const settings = await readHomeSettings(env);
  return json({ message: "Home settings updated", homeSettings: settings }, 200, request, env);
}

async function listAdminUsers(request, env) {
  const admin = await requireAdmin(request, env);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
  }

  const { results } = await env.DB.prepare(
    "SELECT id, name, email, role, status, created_at FROM users ORDER BY id DESC"
  ).all();

  return json({ users: results || [] }, 200, request, env);
}

async function updateAdminUser(request, id, env) {
  const admin = await requireAdmin(request, env);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
  }

  if (!/^\d+$/.test(String(id))) {
    return json({ message: "Invalid user id" }, 400, request, env);
  }

  const body = await readJson(request);
  const role = (body.role || "member").trim();
  const status = (body.status || "active").trim();

  if (!["admin", "member"].includes(role)) {
    return json({ message: "Invalid role" }, 400, request, env);
  }

  if (!["active", "inactive"].includes(status)) {
    return json({ message: "Invalid status" }, 400, request, env);
  }

  const existing = await env.DB.prepare("SELECT id FROM users WHERE id = ?").bind(Number(id)).first();
  if (!existing) {
    return json({ message: "User not found" }, 404, request, env);
  }

  await env.DB.prepare("UPDATE users SET role = ?, status = ? WHERE id = ?")
    .bind(role, status, Number(id))
    .run();

  return json({ message: "User updated" }, 200, request, env);
}

async function createBooking(request, env) {
  const user = await readAuthUser(request, env);
  if (!user) {
    return json({ message: "Unauthorized" }, 401, request, env);
  }

  if ((user.status || "active") !== "active") {
    return json({ message: "This account is inactive" }, 403, request, env);
  }

  const body = await readJson(request);
  const productId = Number(body.productId);
  const quantity = Number(body.quantity || 1);
  const startDate = (body.startDate || "").trim();
  const endDate = (body.endDate || "").trim();

  if (!Number.isInteger(productId) || productId <= 0) {
    return json({ message: "Invalid product id" }, 400, request, env);
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return json({ message: "Quantity must be at least 1" }, 400, request, env);
  }

  if (!startDate || !endDate) {
    return json({ message: "Start date and end date are required" }, 400, request, env);
  }

  const product = await env.DB.prepare(
    "SELECT id, price_per_day, quantity FROM products WHERE id = ?"
  )
    .bind(productId)
    .first();

  if (!product) {
    return json({ message: "Product not found" }, 404, request, env);
  }

  if ((product.quantity ?? 0) < quantity) {
    return json({ message: "Requested quantity is not available" }, 400, request, env);
  }

  const days = Math.max(1, calculateRentalDays(startDate, endDate));
  const totalPrice = Number(product.price_per_day) * quantity * days;

  const created = await env.DB.prepare(
    "INSERT INTO bookings (user_id, product_id, start_date, end_date, quantity, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?)"
  )
    .bind(Number(user.sub), productId, startDate, endDate, quantity, totalPrice, "pending")
    .run();

  await env.DB.prepare("UPDATE products SET quantity = quantity - ? WHERE id = ?")
    .bind(quantity, productId)
    .run();

  return json(
    {
      id: created.meta.last_row_id,
      message: "Booking created",
    },
    201,
    request,
    env
  );
}

async function listAdminBookings(request, env) {
  const admin = await requireAdmin(request, env);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
  }

  const { results } = await env.DB.prepare(
    `SELECT b.id, b.start_date, b.end_date, b.quantity, b.total_price, b.status, b.created_at,
            u.id AS user_id, u.name AS user_name, u.email AS user_email,
            p.id AS product_id, p.name AS product_name, p.city AS product_city
     FROM bookings b
     JOIN users u ON u.id = b.user_id
     JOIN products p ON p.id = b.product_id
     ORDER BY b.id DESC`
  ).all();

  return json(
    {
      bookings: (results || []).map((row) => ({
        id: row.id,
        startDate: row.start_date,
        endDate: row.end_date,
        quantity: row.quantity,
        totalPrice: row.total_price,
        status: row.status,
        createdAt: row.created_at,
        user: {
          id: row.user_id,
          name: row.user_name,
          email: row.user_email,
        },
        product: {
          id: row.product_id,
          name: row.product_name,
          city: row.product_city,
        },
      })),
    },
    200,
    request,
    env
  );
}

async function updateBookingStatus(request, id, env) {
  const admin = await requireAdmin(request, env);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
  }

  if (!/^\d+$/.test(String(id))) {
    return json({ message: "Invalid booking id" }, 400, request, env);
  }

  const body = await readJson(request);
  const status = (body.status || "").trim();
  if (!["pending", "confirmed", "cancelled", "completed"].includes(status)) {
    return json({ message: "Invalid booking status" }, 400, request, env);
  }

  const existing = await env.DB.prepare(
    "SELECT id, product_id, quantity, status FROM bookings WHERE id = ?"
  )
    .bind(Number(id))
    .first();
  if (!existing) {
    return json({ message: "Booking not found" }, 404, request, env);
  }

  const stockAdjustment = getStockAdjustment(existing.status, status, existing.quantity);
  if (stockAdjustment < 0) {
    const product = await env.DB.prepare("SELECT quantity FROM products WHERE id = ?")
      .bind(existing.product_id)
      .first();

    if (!product || (product.quantity ?? 0) < Math.abs(stockAdjustment)) {
      return json({ message: "Not enough stock to reactivate this booking" }, 400, request, env);
    }
  }

  await env.DB.prepare("UPDATE bookings SET status = ? WHERE id = ?")
    .bind(status, Number(id))
    .run();

  if (stockAdjustment !== 0) {
    await env.DB.prepare("UPDATE products SET quantity = quantity + ? WHERE id = ?")
      .bind(stockAdjustment, existing.product_id)
      .run();
  }

  return json({ message: "Booking updated" }, 200, request, env);
}

async function listUserOrders(request, env) {
  const user = await readActiveUser(request, env);
  if (!user) {
    return json({ message: "Unauthorized" }, 401, request, env);
  }

  const { results } = await env.DB.prepare(
    `SELECT b.id, b.start_date, b.end_date, b.quantity, b.total_price, b.status, b.created_at,
            p.id AS product_id, p.name AS product_name, p.city AS product_city, p.image_url AS product_image_url
     FROM bookings b
     JOIN products p ON p.id = b.product_id
     WHERE b.user_id = ?
     ORDER BY b.id DESC`
  )
    .bind(Number(user.sub))
    .all();

  return json(
    {
      orders: (results || []).map(mapBookingRow),
    },
    200,
    request,
    env
  );
}

async function getUserOrderById(request, id, env) {
  const user = await readActiveUser(request, env);
  if (!user) {
    return json({ message: "Unauthorized" }, 401, request, env);
  }

  if (!/^\d+$/.test(String(id))) {
    return json({ message: "Invalid order id" }, 400, request, env);
  }

  const order = await env.DB.prepare(
    `SELECT b.id, b.start_date, b.end_date, b.quantity, b.total_price, b.status, b.created_at,
            p.id AS product_id, p.name AS product_name, p.city AS product_city, p.image_url AS product_image_url
     FROM bookings b
     JOIN products p ON p.id = b.product_id
     WHERE b.id = ? AND b.user_id = ?`
  )
    .bind(Number(id), Number(user.sub))
    .first();

  if (!order) {
    return json({ message: "Order not found" }, 404, request, env);
  }

  return json({ order: mapBookingRow(order) }, 200, request, env);
}

async function cancelUserOrder(request, id, env) {
  const user = await readActiveUser(request, env);
  if (!user) {
    return json({ message: "Unauthorized" }, 401, request, env);
  }

  if (!/^\d+$/.test(String(id))) {
    return json({ message: "Invalid booking id" }, 400, request, env);
  }

  const booking = await env.DB.prepare(
    "SELECT id, user_id, product_id, quantity, status FROM bookings WHERE id = ?"
  )
    .bind(Number(id))
    .first();

  if (!booking || Number(booking.user_id) !== Number(user.sub)) {
    return json({ message: "Booking not found" }, 404, request, env);
  }

  if (booking.status === "cancelled") {
    return json({ message: "Booking already cancelled" }, 400, request, env);
  }

  await env.DB.prepare("UPDATE bookings SET status = ? WHERE id = ?")
    .bind("cancelled", Number(id))
    .run();

  await env.DB.prepare("UPDATE products SET quantity = quantity + ? WHERE id = ?")
    .bind(Number(booking.quantity), Number(booking.product_id))
    .run();

  return json({ message: "Booking cancelled" }, 200, request, env);
}

async function checkoutCart(request, env) {
  const user = await readActiveUser(request, env);
  if (!user) {
    return json({ message: "Unauthorized" }, 401, request, env);
  }

  const body = await readJson(request);
  const items = Array.isArray(body.items) ? body.items : [];

  if (!items.length) {
    return json({ message: "Cart is empty" }, 400, request, env);
  }

  const normalizedItems = [];
  const reservedByProduct = new Map();
  let grandTotal = 0;

  for (const item of items) {
    const productId = Number(item.productId);
    const quantity = Number(item.quantity || 1);
    const startDate = (item.startDate || "").trim();
    const endDate = (item.endDate || "").trim();

    if (!Number.isInteger(productId) || productId <= 0) {
      return json({ message: "Invalid product in cart" }, 400, request, env);
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return json({ message: "Cart quantity must be at least 1" }, 400, request, env);
    }

    if (!startDate || !endDate) {
      return json({ message: "Each cart item must include start and end date" }, 400, request, env);
    }

    const product = await env.DB.prepare(
      "SELECT id, name, city, image_url, price_per_day, quantity FROM products WHERE id = ?"
    )
      .bind(productId)
      .first();

    if (!product) {
      return json({ message: "One of the selected products no longer exists" }, 404, request, env);
    }

    const reservedQuantity = reservedByProduct.get(productId) || 0;
    if ((product.quantity ?? 0) < quantity + reservedQuantity) {
      return json({ message: `Not enough stock for ${product.name}` }, 400, request, env);
    }

    const days = Math.max(1, calculateRentalDays(startDate, endDate));
    const totalPrice = Number(product.price_per_day) * quantity * days;
    grandTotal += totalPrice;

    normalizedItems.push({
      productId,
      quantity,
      startDate,
      endDate,
      totalPrice,
      product,
    });

    reservedByProduct.set(productId, reservedQuantity + quantity);
  }

  const createdOrders = [];

  for (const item of normalizedItems) {
    const created = await env.DB.prepare(
      "INSERT INTO bookings (user_id, product_id, start_date, end_date, quantity, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
      .bind(
        Number(user.sub),
        item.productId,
        item.startDate,
        item.endDate,
        item.quantity,
        item.totalPrice,
        "pending"
      )
      .run();

    await env.DB.prepare("UPDATE products SET quantity = quantity - ? WHERE id = ?")
      .bind(item.quantity, item.productId)
      .run();

    createdOrders.push({
      id: created.meta.last_row_id,
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity,
      totalPrice: item.totalPrice,
      status: "pending",
    });
  }

  return json(
    {
      message: "Checkout completed",
      orders: createdOrders,
      total: grandTotal,
    },
    201,
    request,
    env
  );
}

const OPERATIONS_PRICING = {
  includedCopperMeters: 3,
  copperPricePerMeter: 85,
  basePrice: 180,
};

const FAST_DELIVERY_CITIES = ["الدمام", "جدة", "الرياض", "الخبر", "الظهران", "جازان", "رأس تنورة"];
const OPERATIONS_REGIONS = [
  {
    key: "east",
    ar: "المنطقة الشرقية",
    en: "Eastern region",
    cities: ["الدمام", "الخبر", "الظهران", "القطيف", "رأس تنورة", "الجبيل", "بقيق", "الأحساء"],
  },
  {
    key: "west",
    ar: "المنطقة الغربية",
    en: "Western region",
    cities: ["جدة", "مكة", "المدينة المنورة", "الطائف", "ينبع"],
  },
  {
    key: "south",
    ar: "المنطقة الجنوبية",
    en: "Southern region",
    cities: ["جازان", "أبو عريش"],
  },
  {
    key: "central",
    ar: "المنطقة الوسطى",
    en: "Central region",
    cities: ["الرياض", "القصيم"],
  },
];

const TECHNICIAN_COVERAGE_OPTIONS = [
  { key: "riyadh", type: "city", ar: "الرياض", en: "Riyadh", aliases: ["r", "riy", "riyadh", "الرياض"] },
  { key: "al_kharj", type: "city", ar: "الخرج", en: "Al Kharj", aliases: ["kharj", "al kharj", "al_kharj", "الخرج"] },
  { key: "jeddah", type: "city", ar: "جدة", en: "Jeddah", aliases: ["j", "jd", "jed", "jeddah", "جدة", "جده"] },
  { key: "makkah", type: "city", ar: "مكة", en: "Makkah", aliases: ["m", "makkah", "mecca", "مكة"] },
  { key: "madinah", type: "city", ar: "المدينة المنورة", en: "Madinah", aliases: ["md", "madinah", "medina", "المدينة", "المدينة المنورة"] },
  { key: "taif", type: "city", ar: "الطائف", en: "Taif", aliases: ["taif", "الطائف"] },
  { key: "yanbu", type: "city", ar: "ينبع", en: "Yanbu", aliases: ["yan", "yanbu", "ينبع"] },
  { key: "rabigh", type: "city", ar: "رابغ", en: "Rabigh", aliases: ["rabigh", "رابغ"] },
  { key: "al_ula", type: "city", ar: "العلا", en: "Al Ula", aliases: ["ula", "al ula", "al_ula", "العلا"] },
  { key: "dammam", type: "city", ar: "الدمام", en: "Dammam", aliases: ["d", "dammam", "الدمام"] },
  { key: "khobar", type: "city", ar: "الخبر", en: "Khobar", aliases: ["kh", "khf", "khobar", "الخبر"] },
  { key: "dhahran", type: "city", ar: "الظهران", en: "Dhahran", aliases: ["dh", "dhahran", "الظهران"] },
  { key: "hofuf", type: "city", ar: "الأحساء", en: "Al Ahsa", aliases: ["h", "a", "ahsa", "alahsa", "hofuf", "الاحساء", "الأحساء", "الهفوف"] },
  { key: "qatif", type: "city", ar: "القطيف", en: "Qatif", aliases: ["q", "qatif", "القطيف"] },
  { key: "jubail", type: "city", ar: "الجبيل", en: "Jubail", aliases: ["jubail", "الجبيل"] },
  { key: "hafr_al_batin", type: "city", ar: "حفر الباطن", en: "Hafar Al Batin", aliases: ["hafr", "hafr al batin", "hafr_al_batin", "حفر الباطن"] },
  { key: "khafji", type: "city", ar: "الخفجي", en: "Khafji", aliases: ["khafji", "الخفجي"] },
  { key: "bqaiq", type: "city", ar: "بقيق", en: "Bqaiq", aliases: ["b", "bqaiq", "buqayq", "بقيق"] },
  { key: "ras_tanura", type: "city", ar: "رأس تنورة", en: "Ras Tanura", aliases: ["rs", "ras", "ras_tanura", "rastanura", "رأس تنورة"] },
  { key: "abha", type: "city", ar: "أبها", en: "Abha", aliases: ["abha", "أبها"] },
  { key: "khamis_mushait", type: "city", ar: "خميس مشيط", en: "Khamis Mushait", aliases: ["km", "khamis", "khamis mushait", "khamis_mushait", "خميس مشيط"] },
  { key: "najran", type: "city", ar: "نجران", en: "Najran", aliases: ["najran", "نجران"] },
  { key: "jazan", type: "city", ar: "جازان", en: "Jazan", aliases: ["g", "jazan", "جازان"] },
  { key: "abu_arish", type: "city", ar: "أبو عريش", en: "Abu Arish", aliases: ["abu_arish", "abu arish", "abuarish", "أبو عريش"] },
  { key: "sabya", type: "city", ar: "صبيا", en: "Sabya", aliases: ["sabya", "صبيا"] },
  { key: "bisha", type: "city", ar: "بيشة", en: "Bisha", aliases: ["bisha", "بيشة"] },
  { key: "al_baha", type: "city", ar: "الباحة", en: "Al Baha", aliases: ["baha", "al baha", "al_baha", "الباحة"] },
  { key: "buraidah", type: "city", ar: "بريدة", en: "Buraidah", aliases: ["bur", "br", "buraidah", "buraida", "بريدة"] },
  { key: "unaizah", type: "city", ar: "عنيزة", en: "Unaizah", aliases: ["unaizah", "unaiza", "عنيزة"] },
  { key: "qassim", type: "city", ar: "القصيم", en: "Qassim", aliases: ["qas", "qassim", "القصيم"] },
  { key: "hail", type: "city", ar: "حائل", en: "Hail", aliases: ["hail", "حائل"] },
  { key: "tabuk", type: "city", ar: "تبوك", en: "Tabuk", aliases: ["tabuk", "تبوك"] },
  { key: "sakaka", type: "city", ar: "سكاكا", en: "Sakaka", aliases: ["sakaka", "سكاكا"] },
  { key: "arar", type: "city", ar: "عرعر", en: "Arar", aliases: ["arar", "عرعر"] },
  { key: "qurayyat", type: "city", ar: "القريات", en: "Qurayyat", aliases: ["qurayyat", "القريات"] },
  { key: "east", type: "region", ar: "المنطقة الشرقية", en: "Eastern region", aliases: ["east", "eastern", "الشرقية", "المنطقة الشرقية"] },
  { key: "west", type: "region", ar: "المنطقة الغربية", en: "Western region", aliases: ["west", "western", "الغربية", "المنطقة الغربية"] },
  { key: "south", type: "region", ar: "المنطقة الجنوبية", en: "Southern region", aliases: ["south", "southern", "الجنوبية", "المنطقة الجنوبية"] },
  { key: "central", type: "region", ar: "المنطقة الوسطى", en: "Central region", aliases: ["central", "الوسطى", "المنطقة الوسطى"] },
];

const TECHNICIAN_COVERAGE_LOOKUP = new Map(
  TECHNICIAN_COVERAGE_OPTIONS.flatMap((item) =>
    [item.key, item.ar, item.en, ...(item.aliases || [])]
      .map((alias) => String(alias || "").trim().toLowerCase())
      .filter(Boolean)
      .map((alias) => [alias, item.key])
  )
);

function normalizeRegionKey(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeTechnicianCoverageKey(value) {
  const normalized = normalizeRegionKey(value);
  if (!normalized) {
    return "";
  }
  return TECHNICIAN_COVERAGE_LOOKUP.get(normalized) || normalized;
}

function getTechnicianCoverageByKey(value) {
  const normalized = normalizeTechnicianCoverageKey(value);
  if (!normalized) {
    return null;
  }
  return TECHNICIAN_COVERAGE_OPTIONS.find((item) => item.key === normalized) || null;
}

function getOperationsRegionByKey(value) {
  const normalized = normalizeRegionKey(value);
  if (!normalized) {
    return null;
  }

  return OPERATIONS_REGIONS.find((region) => region.key === normalized) || null;
}

function getOperationsRegionByCity(city) {
  const normalizedCity = String(city || "").trim();
  if (!normalizedCity) {
    return null;
  }

  return OPERATIONS_REGIONS.find((region) => region.cities.includes(normalizedCity)) || null;
}

function getOrderRegionKey(order = {}) {
  return getOperationsRegionByCity(order.city)?.key || "";
}

async function getOperationsDashboard(request, env) {
  const user = await requireRoles(request, env, ["admin", "customer_service", "operations_manager"]);
  if (!user) {
    return json({ message: "Internal access required" }, 403, request, env);
  }

  const orders = await readServiceOrders(env);
  const summary = await readOperationsSummary(env);
  const technicians = await readTechnicians(env);
  const timeStandards = await readServiceTimeStandards(env);
  const areaClusters = await readInternalAreaClusters(env);

  return json(
    {
      orders,
      summary,
      technicians,
      timeStandards,
      areaClusters,
      currentUser: user,
    },
    200,
    request,
    env
  );
}

async function getOperationsSummary(request, env) {
  const summary = await readOperationsSummary(env);

  return json({ summary }, 200, request, env);
}

async function getServiceTimeStandards(request, env) {
  const user = await requireRoles(request, env, ["admin", "customer_service", "operations_manager"]);
  if (!user) {
    return json({ message: "Unauthorized" }, 401, request, env);
  }

  const timeStandards = await readServiceTimeStandards(env);
  return json({ timeStandards }, 200, request, env);
}

async function getInternalAreaClusters(request, env) {
  const user = await requireRoles(request, env, ["admin", "customer_service", "operations_manager"]);
  if (!user) {
    return json({ message: "Unauthorized" }, 401, request, env);
  }

  const areaClusters = await readInternalAreaClusters(env);
  return json({ areaClusters }, 200, request, env);
}

async function updateServiceTimeStandards(request, env) {
  const admin = await requireRoles(request, env, ["operations_manager"]);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
  }

  const body = await readJson(request);
  const standards = normalizeServiceTimeStandards(body.standards);
  if (!standards.length) {
    return json({ message: "At least one time standard is required" }, 400, request, env);
  }

  for (const standard of standards) {
    await env.DB.prepare(
      `INSERT INTO service_time_standards (standard_key, label, ar_label, duration_minutes, sort_order)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(standard_key) DO UPDATE SET
         label = excluded.label,
         ar_label = excluded.ar_label,
         duration_minutes = excluded.duration_minutes,
         sort_order = excluded.sort_order`
    )
      .bind(
        standard.standardKey,
        standard.label,
        standard.arLabel,
        standard.durationMinutes,
        standard.sortOrder
      )
      .run();
  }

  const timeStandards = await readServiceTimeStandards(env);
  return json({ timeStandards }, 200, request, env);
}

async function updateInternalAreaClusters(request, env) {
  const admin = await requireRoles(request, env, ["operations_manager"]);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
  }

  const body = await readJson(request);
  const clusters = normalizeInternalAreaClusters(body.clusters);
  if (!clusters.length) {
    return json({ message: "At least one internal area mapping is required" }, 400, request, env);
  }

  await env.DB.prepare("DELETE FROM internal_area_clusters").run();

  for (const cluster of clusters) {
    await env.DB.prepare(
      `INSERT INTO internal_area_clusters (city, district, area_key, label, ar_label, sort_order, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    )
      .bind(cluster.city, cluster.district, cluster.areaKey, cluster.label, cluster.arLabel, cluster.sortOrder)
      .run();
  }

  const areaClusters = await readInternalAreaClusters(env);
  return json({ areaClusters }, 200, request, env);
}

async function createServiceOrder(request, env) {
  const actor = await requireRoles(request, env, ["admin", "customer_service"]);
  if (!actor) {
    return json({ message: "Admin or customer service access required" }, 403, request, env);
  }

  const body = await readJson(request);
  const normalized = normalizeManualInstallationServiceOrderInput(body || {});

  if (normalized.error) {
    return json({ message: normalized.error }, 400, request, env);
  }

  const registry = await readServiceOrderReferenceRegistry(env, null, { includeArchived: true });
  const conflict = findDuplicateOrderReference(registry, normalized);
  if (conflict) {
    return json({ message: buildDuplicateOrderMessage(conflict) }, 409, request, env);
  }

  const normalizedActorRole = normalizeServerRole(actor.role);
  const actorRole = normalizedActorRole === "admin" ? "admin" : "customer_service";
  const orderId = await insertServiceOrderRecord(env, normalized, Number(actor.sub), {
    actor: actorRole,
    message:
      actorRole === "admin"
        ? `تم إنشاء الطلب ${normalized.requestNumber} يدويًا بنفس جدول Excel بواسطة الإدارة.`
        : `تم إنشاء الطلب ${normalized.requestNumber} يدويًا بنفس جدول Excel بواسطة خدمة العملاء.`,
  });

  if (!orderId) {
    return json({ message: "Failed to create manual order" }, 500, request, env);
  }

  await notifyOperationsManagersAboutNewOrder(env, normalized, orderId);
  await notifyUsersAboutTechnicianAssignmentReview(env, normalized, orderId);
  const order = await readServiceOrderById(env, orderId);
  return json(
    {
      message: "Manual order created successfully",
      order,
    },
    201,
    request,
    env
  );
}

function resolveImportActorRole(actor = {}) {
  const normalizedActorRole = normalizeServerRole(actor.role);
  return normalizedActorRole === "admin"
    ? "admin"
    : normalizedActorRole === "operations_manager"
      ? "operations_manager"
      : "customer_service";
}

function buildImportJobId() {
  if (typeof crypto?.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return base64UrlEncode(`${Date.now()}-${Math.random()}-${Math.random()}`);
}

function buildImportPreviewId() {
  if (typeof crypto?.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return base64UrlEncode(`preview-${Date.now()}-${Math.random()}-${Math.random()}`);
}

function mapImportJobRow(row = {}) {
  return {
    id: String(row.id || ""),
    fileName: String(row.file_name || "Excel"),
    status: String(row.status || "pending"),
    totalRows: Number(row.total_rows || 0),
    processedRows: Number(row.processed_rows || 0),
    importedCount: Number(row.imported_count || 0),
    createdCount: Number(row.created_count || 0),
    updatedCount: Number(row.updated_count || 0),
    archivedCount: Number(row.archived_count || 0),
    restoredCount: Number(row.restored_count || 0),
    unchangedCount: Number(row.unchanged_count || 0),
    skippedCount: Number(row.skipped_count || 0),
    skippedOrders: parseJsonArray(row.skipped_orders_json),
    lastError: String(row.last_error || "").trim(),
    createdByUserId: row.created_by_user_id ? Number(row.created_by_user_id) : null,
    createdByRole: String(row.created_by_role || ""),
    startedAt: String(row.started_at || ""),
    completedAt: String(row.completed_at || ""),
    createdAt: String(row.created_at || ""),
    updatedAt: String(row.updated_at || ""),
  };
}

async function readImportJobById(env, jobId) {
  const row = await env.DB.prepare("SELECT * FROM import_jobs WHERE id = ?").bind(String(jobId || "")).first();
  return row ? mapImportJobRow(row) : null;
}

async function readImportPreviewById(env, previewId) {
  const row = await env.DB.prepare("SELECT * FROM import_previews WHERE id = ?").bind(String(previewId || "")).first();
  if (!row) {
    return null;
  }

  return {
    id: String(row.id || ""),
    fileName: String(row.file_name || "Excel"),
    orders: parseJsonArray(row.orders_json),
    createdByUserId: row.created_by_user_id ? Number(row.created_by_user_id) : null,
    createdByRole: String(row.created_by_role || ""),
  };
}

async function enqueueImportJobIfSupported(env, jobId) {
  const queue = env?.IMPORT_JOBS_QUEUE;
  if (!queue || typeof queue.send !== "function") {
    return false;
  }

  await queue.send({
    jobId: String(jobId || "").trim(),
    queuedAt: new Date().toISOString(),
  });
  return true;
}

async function processImportJobStep(env, jobId, actor = null) {
  const row = await env.DB.prepare("SELECT * FROM import_jobs WHERE id = ?").bind(String(jobId || "")).first();
  if (!row) {
    throw new Error("Import job not found");
  }

  const currentJob = mapImportJobRow(row);
  if (["completed", "failed"].includes(currentJob.status)) {
    return { job: currentJob, progressed: false };
  }

  const nextChunkRow = await env.DB.prepare(
    `SELECT chunk_index, row_count, orders_json
     FROM import_job_chunks
     WHERE job_id = ? AND processed_at IS NULL
     ORDER BY chunk_index ASC
     LIMIT 1`
  )
    .bind(String(jobId))
    .first();

  if (!nextChunkRow) {
    await env.DB.prepare(
      "UPDATE import_jobs SET status = 'completed', completed_at = COALESCE(completed_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    )
      .bind(String(jobId))
      .run();
    return { job: await readImportJobById(env, jobId), progressed: false };
  }

  const nextChunk = parseJsonArray(nextChunkRow.orders_json);
  if (!nextChunk.length) {
    await env.DB.prepare("UPDATE import_job_chunks SET processed_at = CURRENT_TIMESTAMP WHERE job_id = ? AND chunk_index = ?")
      .bind(String(jobId), Number(nextChunkRow.chunk_index || 0))
      .run();
    return { job: await readImportJobById(env, jobId), progressed: true };
  }

  const createdByActor = actor || {
    role: String(row.created_by_role || "customer_service"),
    sub: Number(row.created_by_user_id || 0),
  };

  await env.DB.prepare(
    "UPDATE import_jobs SET status = 'processing', started_at = COALESCE(started_at, CURRENT_TIMESTAMP), last_error = '', updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  )
    .bind(String(jobId))
    .run();

  try {
    const report = await processImportedServiceOrders(env, nextChunk, createdByActor, {
      fileName: row.file_name,
      notify: false,
    });
    await env.DB.prepare("UPDATE import_job_chunks SET processed_at = CURRENT_TIMESTAMP WHERE job_id = ? AND chunk_index = ?")
      .bind(String(jobId), Number(nextChunkRow.chunk_index || 0))
      .run();

    const processedRows = Math.max(0, Number(row.processed_rows || 0)) + Number(nextChunkRow.row_count || nextChunk.length || 0);
    const totalRows = Number(row.total_rows || 0);
    const completed = processedRows >= totalRows;
    const skippedOrders = [...parseJsonArray(row.skipped_orders_json), ...(report.skippedOrders || [])];

    await env.DB.prepare(
      `UPDATE import_jobs
       SET status = ?, processed_rows = ?, imported_count = imported_count + ?, created_count = created_count + ?,
           updated_count = updated_count + ?, archived_count = archived_count + ?, restored_count = restored_count + ?,
           unchanged_count = unchanged_count + ?, skipped_count = skipped_count + ?, skipped_orders_json = ?, completed_at = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
      .bind(
        completed ? "completed" : "processing",
        processedRows,
        Number(report.importedCount || 0),
        Number(report.createdCount || 0),
        Number(report.updatedCount || 0),
        Number(report.archivedCount || 0),
        Number(report.restoredCount || 0),
        Number(report.unchangedCount || 0),
        Number(report.skippedCount || 0),
        JSON.stringify(skippedOrders),
        completed ? new Date().toISOString() : null,
        String(jobId)
      )
      .run();

    return { job: await readImportJobById(env, jobId), progressed: true };
  } catch (error) {
    const message = String(error?.message || error || "Import job failed").trim() || "Import job failed";
    await env.DB.prepare(
      "UPDATE import_jobs SET status = 'failed', last_error = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    )
      .bind(message, String(jobId))
      .run();
    throw error;
  }
}

async function processImportJobInBackground(env, jobId) {
  let safetyCounter = 0;
  let currentJob = await readImportJobById(env, jobId);

  while (currentJob && !["completed", "failed"].includes(String(currentJob.status || "").trim()) && safetyCounter < 1000) {
    const step = await processImportJobStep(env, jobId);
    currentJob = step.job;
    safetyCounter += 1;
    if (!step.progressed) {
      break;
    }
  }

  return currentJob || (await readImportJobById(env, jobId));
}

async function processImportedServiceOrders(env, rawOrders = [], actor = {}, options = {}) {
  const sourceFileName = String(options.fileName || "Excel").trim() || "Excel";
  const notify = options.notify !== false;
  const existingReferences = await readServiceOrderReferenceRegistry(env, null, { includeArchived: true });
  const technicianCodeLookup = await readTechnicianExcelCodeLookup(env);
  const workingRegistry = {
    requestNumbers: new Map(existingReferences.requestNumbers),
    soIds: new Map(existingReferences.soIds),
    woIds: new Map(existingReferences.woIds),
  };
  const skippedOrders = [];
  let createdCount = 0;
  let updatedCount = 0;
  let archivedCount = 0;
  let restoredCount = 0;
  let unchangedCount = 0;
  const actorRole = resolveImportActorRole(actor);

  for (const item of Array.isArray(rawOrders) ? rawOrders : []) {
    const normalized = normalizeServiceOrderInput(item);
    const requestNumber = String(item?.requestNumber || normalized.requestNumber || "").trim();

    if (normalized.error) {
      skippedOrders.push({
        requestNumber,
        reason: normalized.error,
      });
      continue;
    }

    const duplicateReference = findDuplicateOrderReference(workingRegistry, normalized);

    if (duplicateReference) {
      const syncResult =
        duplicateReference.scope === "archived" && duplicateReference.archiveId
          ? await syncArchivedServiceOrderFromIncomingData(
              env,
              duplicateReference.archiveId,
              normalized,
              {
                role: actorRole,
                sub: actor.sub,
              },
              { notify, technicianCodeLookup }
            )
          : await syncExistingServiceOrderFromIncomingData(
              env,
              duplicateReference.orderId,
              normalized,
              {
                role: actorRole,
                sub: actor.sub,
              },
              { notify, technicianCodeLookup }
            );
      registerOrderReferenceIds(workingRegistry, normalized, {
        orderId: syncResult?.order?.numericId || duplicateReference.orderId,
        archiveId: duplicateReference.archiveId,
        customerName: normalized.customerName,
        scope: syncResult?.archived ? "archived" : "active",
      });
      if (syncResult?.action === "updated_existing") {
        updatedCount += 1;
      } else if (syncResult?.action === "archived_existing" || syncResult?.action === "restored_and_archived") {
        archivedCount += 1;
      } else if (syncResult?.action === "restored_existing") {
        restoredCount += 1;
      } else if (
        syncResult?.action === "restored_unchanged" ||
        syncResult?.action === "unchanged_existing" ||
        syncResult?.action === "updated_archived"
      ) {
        unchangedCount += 1;
      }
      continue;
    }

    const orderId = await insertServiceOrderRecord(
      env,
      normalized,
      Number(actor.sub || 0) || null,
      {
        actor: actorRole,
        message:
          actorRole === "admin"
            ? `تم استيراد الطلب ${normalized.requestNumber} من تكامل Zamil بواسطة الإدارة.`
            : actorRole === "operations_manager"
              ? `تم استيراد الطلب ${normalized.requestNumber} من تكامل Zamil بواسطة مدير العمليات.`
              : `تم استيراد الطلب ${normalized.requestNumber} من تكامل Zamil وإرساله إلى مدير العمليات.`,
      },
      { technicianCodeLookup }
    );
    if (orderId) {
      registerOrderReferenceIds(workingRegistry, normalized, {
        orderId,
        customerName: normalized.customerName,
      });
      if (notify) {
        await notifyOperationsManagersAboutNewOrder(env, normalized, orderId);
        await notifyUsersAboutTechnicianAssignmentReview(env, normalized, orderId, { technicianCodeLookup });
      }
      createdCount += 1;
    }
  }

  return {
    fileName: sourceFileName,
    importedCount: createdCount + updatedCount + archivedCount + restoredCount + unchangedCount,
    createdCount,
    updatedCount,
    archivedCount,
    restoredCount,
    unchangedCount,
    skippedCount: skippedOrders.length,
    skippedOrders,
  };
}

async function importServiceOrders(request, env) {
  const actor = await requireRoles(request, env, ["admin", "customer_service", "operations_manager"]);
  if (!actor) {
    return json({ message: "Admin, customer service, or operations manager access required" }, 403, request, env);
  }

  const body = await readJson(request);
  const rawOrders = Array.isArray(body?.orders) ? body.orders : [];
  const sourceFileName = String(body?.fileName || "Excel").trim();
  if (!rawOrders.length) {
    return json({ message: "At least one Excel order is required" }, 400, request, env);
  }

  const report = await processImportedServiceOrders(env, rawOrders, actor, {
    fileName: sourceFileName,
    notify: false,
  });

  return json(report, 201, request, env);
}

async function createImportJob(request, env) {
  const actor = await requireRoles(request, env, ["admin", "customer_service", "operations_manager"]);
  if (!actor) {
    return json({ message: "Admin, customer service, or operations manager access required" }, 403, request, env);
  }

  const body = await readJson(request);
  const previewToken = String(body?.previewToken || "").trim();
  const requestedProcessMode = String(body?.processMode || "").trim().toLowerCase();
  const previewRecord = previewToken ? await readImportPreviewById(env, previewToken) : null;
  const rawOrders = previewRecord ? previewRecord.orders : Array.isArray(body?.orders) ? body.orders : [];
  const fileName = String(body?.fileName || previewRecord?.fileName || "Excel").trim() || "Excel";
  const requestedChunkSize = Math.max(1, Math.min(100, Number(body?.chunkSize) || 30));
  if (!rawOrders.length) {
    return json({ message: "At least one Excel order is required" }, 400, request, env);
  }

  const jobId = buildImportJobId();
  const actorRole = resolveImportActorRole(actor);
  await env.DB.prepare(
    `INSERT INTO import_jobs (
      id, file_name, status, orders_json, total_rows, processed_rows,
      imported_count, created_count, updated_count, archived_count, restored_count, unchanged_count, skipped_count,
      skipped_orders_json, last_error, created_by_user_id, created_by_role, created_at, updated_at
    ) VALUES (?, ?, 'pending', ?, ?, 0, 0, 0, 0, 0, 0, 0, 0, '[]', '', ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
  )
    .bind(
      jobId,
      fileName,
      "[]",
      rawOrders.length,
      Number(actor.sub || 0) || null,
      actorRole
    )
    .run();

  for (let index = 0; index < rawOrders.length; index += requestedChunkSize) {
    const chunkOrders = rawOrders.slice(index, index + requestedChunkSize);
    await env.DB.prepare(
      `INSERT INTO import_job_chunks (
        job_id, chunk_index, row_count, orders_json, created_at
      ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`
    )
      .bind(jobId, Math.floor(index / requestedChunkSize), chunkOrders.length, JSON.stringify(chunkOrders))
      .run();
  }

  if (previewToken) {
    await env.DB.prepare("DELETE FROM import_previews WHERE id = ?").bind(previewToken).run();
  }

  const job = await readImportJobById(env, jobId);
  const backgroundQueued = requestedProcessMode !== "manual" ? await enqueueImportJobIfSupported(env, jobId) : false;
  return json({ message: "Import job created", job, backgroundQueued }, 201, request, env);
}

async function getImportJob(request, jobId, env) {
  const actor = await requireRoles(request, env, ["admin", "customer_service", "operations_manager"]);
  if (!actor) {
    return json({ message: "Admin, customer service, or operations manager access required" }, 403, request, env);
  }

  const job = await readImportJobById(env, jobId);
  if (!job) {
    return json({ message: "Import job not found" }, 404, request, env);
  }

  return json({ job }, 200, request, env);
}

async function processImportJob(request, jobId, env) {
  const actor = await requireRoles(request, env, ["admin", "customer_service", "operations_manager"]);
  if (!actor) {
    return json({ message: "Admin, customer service, or operations manager access required" }, 403, request, env);
  }

  await readJson(request);
  try {
    const step = await processImportJobStep(env, jobId, {
      role: String(actor.role || "customer_service"),
      sub: Number(actor.sub || 0),
    });
    return json({ job: step.job }, 200, request, env);
  } catch (error) {
    const message = String(error?.message || error || "Import job failed").trim() || "Import job failed";
    return json({ message, job: await readImportJobById(env, jobId) }, 500, request, env);
  }
}

async function previewExcelUpload(request, env) {
  const actor = await requireRoles(request, env, ["admin", "customer_service", "operations_manager"]);
  if (!actor) {
    return json({ message: "Internal access required" }, 403, request, env);
  }

  let formData;
  try {
    formData = await request.formData();
  } catch (error) {
    console.error("Failed to parse Excel upload form data", error);
    return json(
      {
        message: "تعذر قراءة ملف الرفع. أعد اختيار ملف Excel من الجهاز وحاول مرة أخرى.",
      },
      400,
      request,
      env
    );
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return json({ message: "يرجى اختيار ملف Excel أولاً" }, 400, request, env);
  }

  const originalFileName = String(file.name || "data.xlsx").trim() || "data.xlsx";
  if (!/\.(xlsx|xls|xlsm)$/i.test(originalFileName)) {
    return json({ message: "يرجى رفع ملف Excel بصيغة xlsx أو xls أو xlsm" }, 400, request, env);
  }

  const arrayBuffer = await file.arrayBuffer();
  const preview = parseExcelOrdersFromArrayBuffer(arrayBuffer, originalFileName);
  const installationReport = parseInstallationWorkOrderReportFromArrayBuffer(arrayBuffer);
  const previewToken = buildImportPreviewId();
  const actorRole = resolveImportActorRole(actor);

  await env.DB.prepare(
    `INSERT INTO import_previews (
      id, file_name, orders_json, created_by_user_id, created_by_role, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
  )
    .bind(
      previewToken,
      originalFileName,
      JSON.stringify(Array.isArray(preview?.orders) ? preview.orders : []),
      Number(actor.sub || 0) || null,
      actorRole
    )
    .run();

  return json(
    {
      message: "تمت قراءة ملف Excel بنجاح",
      originalFileName,
      savedFileName: originalFileName,
      fileName: originalFileName,
      preview: {
        ...preview,
        orders: [],
        previewToken,
        installationSummary: installationReport.summary,
        analytics: installationReport.analytics,
      },
    },
    200,
    request,
    env
  );
}

async function insertServiceOrderRecord(env, normalized, createdByUserId, auditEntry, options = {}) {
  const initialStatus = normalizeImportedOrderStatus(normalized.importStatus);
  const scheduledTime = ["scheduled", "completed"].includes(initialStatus) ? normalized.preferredTime : "";
  const canceledAt =
    initialStatus === "canceled" && normalized.preferredDate
      ? `${normalized.preferredDate}T${normalized.preferredTime || "09:00"}:00`
      : null;
  const completedAt =
    initialStatus === "completed" && normalized.preferredDate
      ? `${normalized.preferredDate}T${normalized.preferredTime || "09:00"}:00`
      : null;
  const linkedTechnician = resolveLinkedTechnicianFromImportedAssignment(normalized, options.technicianCodeLookup).technician;

  const created = await env.DB.prepare(
    `INSERT INTO service_orders (
      customer_name, request_number, phone, secondary_phone, whatsapp_phone, district, city, address, address_text,
      landmark, map_link, ac_type, service_category, standard_duration_minutes, work_type, ac_count, status, priority, delivery_type,
      preferred_date, preferred_time, scheduled_date, scheduled_time, coordination_note, source, notes, customer_action,
      reschedule_reason, cancellation_reason, canceled_at, completed_at, technician_id, copper_meters, base_included,
      extras_total, service_items_json, audit_log_json, created_by_user_id, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
  )
    .bind(
      normalized.customerName,
      normalized.requestNumber,
      normalizeSaudiPhoneNumber(normalized.phone),
      normalizeSaudiPhoneNumber(normalized.secondaryPhone),
      normalizeSaudiPhoneNumber(normalized.whatsappPhone),
      normalized.district,
      normalized.city,
      normalized.mapLink,
      normalized.addressText,
      normalized.landmark,
      normalized.mapLink,
      normalized.primaryAcType,
      "internal_request",
      1,
      normalized.serviceSummary,
      normalized.totalQuantity,
      initialStatus,
      normalized.priority,
      normalized.deliveryType,
      normalized.preferredDate,
      normalized.preferredTime,
      normalized.preferredDate,
      scheduledTime,
      "",
      normalized.sourceChannel,
      normalized.notes,
      "none",
      "",
      "",
      canceledAt,
      completedAt,
      linkedTechnician?.id || null,
      0,
      0,
      0,
      JSON.stringify(normalized.acDetails),
      JSON.stringify([
        {
          id: `audit-${Date.now()}`,
          type: "created",
          actor: String(auditEntry?.actor || "customer_service"),
          message: String(auditEntry?.message || `تم إنشاء الطلب ${normalized.requestNumber}.`),
          createdAt: new Date().toISOString(),
        },
      ]),
      Number(createdByUserId)
    )
    .run();

  return created.meta.last_row_id;
}

async function readArchivedServiceOrderRowById(env, archiveId) {
  try {
    return await env.DB.prepare(
      `SELECT
        id, original_order_id, customer_name, request_number, phone, secondary_phone, whatsapp_phone, district, city, address,
        address_text, landmark, map_link, ac_type, service_category, standard_duration_minutes, work_started_at, completion_note,
        delay_reason, delay_note, work_type, ac_count, status, priority, delivery_type, preferred_date, preferred_time,
        scheduled_date, scheduled_time, coordination_note, source, notes, customer_action, reschedule_reason, cancellation_reason,
        canceled_at, completed_at, approval_status, proof_status, approved_at, approved_by, client_signature,
        zamil_closure_status, zamil_close_requested_at, zamil_otp_code, zamil_otp_submitted_at, zamil_closed_at, suspension_reason,
        suspension_note, suspended_at, exception_status, audit_log_json, technician_id, copper_meters, base_included, extras_total,
        service_items_json, created_by_user_id, original_created_at, original_updated_at, archived_at, archive_reason
       FROM service_order_archives
       WHERE id = ?`
    )
      .bind(Number(archiveId))
      .first();
  } catch (error) {
    if (isMissingArchiveTableError(error)) {
      return null;
    }
    throw error;
  }
}

async function archiveServiceOrderById(env, orderId, options = {}) {
  const normalizedOrderId = Number(orderId);
  if (!Number.isInteger(normalizedOrderId) || normalizedOrderId <= 0) {
    return null;
  }

  const archiveReason = String(options.reason || "completed_import").trim() || "completed_import";
  let inserted;
  try {
    inserted = await env.DB.prepare(
      `INSERT INTO service_order_archives (
        original_order_id, customer_name, request_number, phone, secondary_phone, whatsapp_phone, district, city, address, address_text,
        landmark, map_link, ac_type, service_category, standard_duration_minutes, work_started_at, completion_note, delay_reason,
        delay_note, work_type, ac_count, status, priority, delivery_type, preferred_date, preferred_time, scheduled_date, scheduled_time,
        coordination_note, source, notes, customer_action, reschedule_reason, cancellation_reason, canceled_at, completed_at,
        approval_status, proof_status, approved_at, approved_by, client_signature, zamil_closure_status, zamil_close_requested_at,
        zamil_otp_code, zamil_otp_submitted_at, zamil_closed_at, suspension_reason, suspension_note, suspended_at, exception_status,
        audit_log_json, technician_id, copper_meters, base_included, extras_total, service_items_json, created_by_user_id,
        original_created_at, original_updated_at, archived_at, archive_reason
      )
      SELECT
        id, customer_name, request_number, phone, secondary_phone, whatsapp_phone, district, city, address, address_text,
        landmark, map_link, ac_type, service_category, standard_duration_minutes, work_started_at, completion_note, delay_reason,
        delay_note, work_type, ac_count, status, priority, delivery_type, preferred_date, preferred_time, scheduled_date, scheduled_time,
        coordination_note, source, notes, customer_action, reschedule_reason, cancellation_reason, canceled_at, completed_at,
        approval_status, proof_status, approved_at, approved_by, client_signature, zamil_closure_status, zamil_close_requested_at,
        zamil_otp_code, zamil_otp_submitted_at, zamil_closed_at, suspension_reason, suspension_note, suspended_at, exception_status,
        audit_log_json, technician_id, copper_meters, base_included, extras_total, service_items_json, created_by_user_id,
        created_at, updated_at, CURRENT_TIMESTAMP, ?
      FROM service_orders
      WHERE id = ?`
    )
      .bind(archiveReason, normalizedOrderId)
      .run();
  } catch (error) {
    if (isMissingArchiveTableError(error)) {
      return null;
    }
    throw error;
  }

  if (!Number(inserted?.meta?.changes || 0)) {
    return null;
  }

  await env.DB.prepare("DELETE FROM service_orders WHERE id = ?").bind(normalizedOrderId).run();
  try {
    return await env.DB.prepare(
      "SELECT id, original_order_id, request_number, customer_name, archived_at, archive_reason FROM service_order_archives WHERE original_order_id = ? ORDER BY id DESC LIMIT 1"
    )
      .bind(normalizedOrderId)
      .first();
  } catch (error) {
    if (isMissingArchiveTableError(error)) {
      return null;
    }
    throw error;
  }
}

async function restoreArchivedServiceOrder(env, archiveId) {
  const normalizedArchiveId = Number(archiveId);
  if (!Number.isInteger(normalizedArchiveId) || normalizedArchiveId <= 0) {
    return null;
  }

  let restored;
  try {
    restored = await env.DB.prepare(
      `INSERT INTO service_orders (
        customer_name, request_number, phone, secondary_phone, whatsapp_phone, district, city, address, address_text, landmark, map_link,
        ac_type, service_category, standard_duration_minutes, work_started_at, completion_note, delay_reason, delay_note, work_type,
        ac_count, status, priority, delivery_type, preferred_date, preferred_time, scheduled_date, scheduled_time, coordination_note,
        source, notes, customer_action, reschedule_reason, cancellation_reason, canceled_at, completed_at, approval_status, proof_status,
        approved_at, approved_by, client_signature, zamil_closure_status, zamil_close_requested_at, zamil_otp_code, zamil_otp_submitted_at,
        zamil_closed_at, suspension_reason, suspension_note, suspended_at, exception_status, audit_log_json, technician_id, copper_meters,
        base_included, extras_total, service_items_json, created_by_user_id, created_at, updated_at
      )
      SELECT
        customer_name, request_number, phone, secondary_phone, whatsapp_phone, district, city, address, address_text, landmark, map_link,
        ac_type, service_category, standard_duration_minutes, work_started_at, completion_note, delay_reason, delay_note, work_type,
        ac_count, status, priority, delivery_type, preferred_date, preferred_time, scheduled_date, scheduled_time, coordination_note,
        source, notes, customer_action, reschedule_reason, cancellation_reason, canceled_at, completed_at, approval_status, proof_status,
        approved_at, approved_by, client_signature, zamil_closure_status, zamil_close_requested_at, zamil_otp_code, zamil_otp_submitted_at,
        zamil_closed_at, suspension_reason, suspension_note, suspended_at, exception_status, audit_log_json, technician_id, copper_meters,
        base_included, extras_total, service_items_json, created_by_user_id, original_created_at, CURRENT_TIMESTAMP
      FROM service_order_archives
      WHERE id = ?`
    )
      .bind(normalizedArchiveId)
      .run();
  } catch (error) {
    if (isMissingArchiveTableError(error)) {
      return null;
    }
    throw error;
  }

  const restoredOrderId = Number(restored?.meta?.last_row_id || 0);
  if (!restoredOrderId) {
    return null;
  }

  try {
    await env.DB.prepare("DELETE FROM service_order_archives WHERE id = ?").bind(normalizedArchiveId).run();
  } catch (error) {
    if (!isMissingArchiveTableError(error)) {
      throw error;
    }
  }
  return {
    orderId: restoredOrderId,
  };
}

function getRiyadhTodayString() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function shiftRiyadhDateString(dateValue = getRiyadhTodayString(), offsetDays = 0) {
  const normalizedDate = String(dateValue || "").trim() || getRiyadhTodayString();
  const base = new Date(`${normalizedDate}T12:00:00+03:00`);
  if (Number.isNaN(base.getTime())) {
    return getRiyadhTodayString();
  }

  base.setUTCDate(base.getUTCDate() + Number(offsetDays || 0));
  return base.toISOString().slice(0, 10);
}

function isSameDayInstallationDate(dateValue) {
  return String(dateValue || "").trim() === getRiyadhTodayString();
}

function buildOperationsNewOrderNotification(normalized) {
  const sameDayInstallation = isSameDayInstallationDate(normalized.preferredDate);
  const deliveryHint =
    normalized.deliveryType === "express_24h"
      ? " ويتضمن توصيلاً سريعاً خلال 24 ساعة"
      : normalized.deliveryType === "standard"
        ? " ويتضمن طلب توصيل"
        : "";

  return sameDayInstallation
    ? {
        title: "تنبيه عاجل: طلب تركيب لنفس اليوم",
        body: `الطلب رقم ${normalized.requestNumber} للعميل ${normalized.customerName} موعد تركيبه اليوم ${normalized.preferredDate}${deliveryHint}. يرجى الانتباه والمتابعة العاجلة.`,
      }
    : {
        title: "طلب جديد بانتظار العمليات",
        body: `تمت إضافة الطلب رقم ${normalized.requestNumber} للعميل ${normalized.customerName} وموعد التركيب ${normalized.preferredDate || "-"}.${deliveryHint}`,
      };
}

function mergeImportedOrderStatus(currentStatus, incomingStatus) {
  const normalizedCurrent = ["pending", "scheduled", "in_transit", "completed", "canceled"].includes(
    String(currentStatus || "").trim()
  )
    ? String(currentStatus || "").trim()
    : "pending";
  const normalizedIncoming = normalizeImportedOrderStatus(incomingStatus);

  if (["completed", "canceled"].includes(normalizedCurrent)) {
    return normalizedCurrent;
  }

  if (["completed", "canceled"].includes(normalizedIncoming)) {
    return normalizedIncoming;
  }

  const statusRank = {
    pending: 1,
    scheduled: 2,
    in_transit: 3,
  };

  return (statusRank[normalizedIncoming] || 0) > (statusRank[normalizedCurrent] || 0)
    ? normalizedIncoming
    : normalizedCurrent;
}

async function syncExistingServiceOrderFromIncomingData(env, existingOrderId, normalized, actor = {}, options = {}) {
  const orderId = Number(existingOrderId);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return null;
  }

  const existingOrder = await readServiceOrderById(env, orderId);
  if (!existingOrder) {
    return null;
  }

  const actorRole = String(actor.role || actor.actor || "system").trim() || "system";
  const previousStatus = String(existingOrder.status || "pending").trim() || "pending";
  const nextStatus = mergeImportedOrderStatus(previousStatus, normalized.importStatus);
  const nextPreferredDate = normalized.preferredDate || existingOrder.preferredDate || existingOrder.scheduledDate || "";
  const nextPreferredTime = normalized.preferredTime || existingOrder.preferredTime || existingOrder.scheduledTime || "";
  const shouldRefreshSchedule = !existingOrder.technicianId && !String(existingOrder.coordinationNote || "").trim();
  const nextScheduledDate = shouldRefreshSchedule
    ? normalized.preferredDate || existingOrder.scheduledDate || nextPreferredDate
    : existingOrder.scheduledDate || nextPreferredDate;
  const nextScheduledTime = shouldRefreshSchedule
    ? normalized.preferredTime || existingOrder.scheduledTime || nextPreferredTime
    : existingOrder.scheduledTime || nextPreferredTime;
  const nextReferences = {
    idRef: normalized.idRef || existingOrder.requestNumber || existingOrder.soId,
    soId: normalized.soId || existingOrder.soId || normalized.requestNumber,
    woId: normalized.woId || existingOrder.woId,
  };
  const nextNotes = mergeImportedNotes(existingOrder.notes, normalized.notes, nextReferences);
  const nextDeliveryType = normalizeDeliveryType(normalized.deliveryType || existingOrder.deliveryType || "none");
  const nextSource = normalized.sourceChannel || existingOrder.source || "manual";
  const nextPriority = nextDeliveryType === "none" ? existingOrder.priority || normalized.priority || "normal" : "urgent";
  const nextCompletedAt =
    nextStatus === "completed"
      ? existingOrder.completedAt || `${nextPreferredDate || new Date().toISOString().slice(0, 10)}T${nextPreferredTime || "09:00"}:00`
      : null;
  const nextCanceledAt =
    nextStatus === "canceled"
      ? existingOrder.canceledAt || `${nextPreferredDate || new Date().toISOString().slice(0, 10)}T${nextPreferredTime || "09:00"}:00`
      : null;
  const linkedTechnician = resolveLinkedTechnicianFromImportedAssignment(normalized, options.technicianCodeLookup).technician;
  const nextTechnicianId = linkedTechnician?.id
    ? Number(linkedTechnician.id)
    : existingOrder.technicianId
      ? Number(existingOrder.technicianId)
      : null;
  const nextServiceCategory = inferServiceCategory(normalized.serviceSummary || existingOrder.workType);
  const nextServiceItemsJson = JSON.stringify(normalized.acDetails || []);
  const nextValues = {
    customerName: normalized.customerName || existingOrder.customerName,
    phone: normalizeSaudiPhoneNumber(normalized.phone || existingOrder.phone),
    secondaryPhone: normalizeSaudiPhoneNumber(normalized.secondaryPhone || existingOrder.secondaryPhone),
    whatsappPhone: normalizeSaudiPhoneNumber(normalized.whatsappPhone || existingOrder.whatsappPhone || existingOrder.phone),
    district: normalized.district || existingOrder.district,
    city: normalized.city || existingOrder.city,
    addressText: normalized.addressText || existingOrder.addressText,
    landmark: normalized.landmark || existingOrder.landmark,
    mapLink: normalized.mapLink || existingOrder.mapLink || existingOrder.address,
    acType: normalized.primaryAcType || existingOrder.acType || "split",
    serviceCategory: nextServiceCategory,
    workType: normalized.serviceSummary || existingOrder.workType,
    acCount: Math.max(1, Number(normalized.totalQuantity) || Number(existingOrder.acCount) || 1),
    status: nextStatus,
    priority: nextPriority,
    deliveryType: nextDeliveryType,
    preferredDate: nextPreferredDate,
    preferredTime: nextPreferredTime,
    scheduledDate: nextScheduledDate,
    scheduledTime: nextScheduledTime,
    source: nextSource,
    notes: nextNotes,
    canceledAt: nextCanceledAt,
    completedAt: nextCompletedAt,
    technicianId: nextTechnicianId,
    serviceItemsJson: nextServiceItemsJson,
  };
  const hasDataChanges =
    String(existingOrder.customerName || "") !== String(nextValues.customerName || "") ||
    String(existingOrder.phone || "") !== String(nextValues.phone || "") ||
    String(existingOrder.secondaryPhone || "") !== String(nextValues.secondaryPhone || "") ||
    String(existingOrder.whatsappPhone || "") !== String(nextValues.whatsappPhone || "") ||
    String(existingOrder.district || "") !== String(nextValues.district || "") ||
    String(existingOrder.city || "") !== String(nextValues.city || "") ||
    String(existingOrder.addressText || "") !== String(nextValues.addressText || "") ||
    String(existingOrder.landmark || "") !== String(nextValues.landmark || "") ||
    String(existingOrder.mapLink || existingOrder.address || "") !== String(nextValues.mapLink || "") ||
    String(existingOrder.acType || "") !== String(nextValues.acType || "") ||
    String(existingOrder.serviceCategory || "") !== String(nextValues.serviceCategory || "") ||
    String(existingOrder.workType || "") !== String(nextValues.workType || "") ||
    Number(existingOrder.acCount || 0) !== Number(nextValues.acCount || 0) ||
    String(existingOrder.status || "") !== String(nextValues.status || "") ||
    String(existingOrder.priority || "") !== String(nextValues.priority || "") ||
    String(existingOrder.deliveryType || "") !== String(nextValues.deliveryType || "") ||
    String(existingOrder.preferredDate || "") !== String(nextValues.preferredDate || "") ||
    String(existingOrder.preferredTime || "") !== String(nextValues.preferredTime || "") ||
    String(existingOrder.scheduledDate || "") !== String(nextValues.scheduledDate || "") ||
    String(existingOrder.scheduledTime || "") !== String(nextValues.scheduledTime || "") ||
    String(existingOrder.source || "") !== String(nextValues.source || "") ||
    String(existingOrder.notes || "") !== String(nextValues.notes || "") ||
    String(existingOrder.canceledAt || "") !== String(nextValues.canceledAt || "") ||
    String(existingOrder.completedAt || "") !== String(nextValues.completedAt || "") ||
    Number(existingOrder.technicianId || 0) !== Number(nextValues.technicianId || 0) ||
    JSON.stringify(existingOrder.acDetails || []) !== nextValues.serviceItemsJson;
  const nextAuditLog = hasDataChanges
    ? normalizeAuditLogEntries([
        ...normalizeAuditLogEntries(existingOrder.auditLog),
        {
          type: nextStatus === "completed" ? "archived" : "sync",
          actor: actorRole,
          message:
            previousStatus === nextStatus
              ? `تم تحديث الطلب ${existingOrder.requestNumber} ببيانات واردة من ${normalized.sourceChannel || actorRole}.`
              : `تم تحديث الطلب ${existingOrder.requestNumber} ببيانات واردة من ${normalized.sourceChannel || actorRole} وتغيرت الحالة من ${mapOrderStatusLabel(previousStatus)} إلى ${mapOrderStatusLabel(nextStatus)}.`,
          createdAt: new Date().toISOString(),
        },
      ])
    : normalizeAuditLogEntries(existingOrder.auditLog);

  if (hasDataChanges) {
    await env.DB.prepare(
      `UPDATE service_orders
       SET customer_name = ?, phone = ?, secondary_phone = ?, whatsapp_phone = ?, district = ?, city = ?, address = ?,
           address_text = ?, landmark = ?, map_link = ?, ac_type = ?, service_category = ?, work_type = ?, ac_count = ?,
           status = ?, priority = ?, delivery_type = ?, preferred_date = ?, preferred_time = ?, scheduled_date = ?,
           scheduled_time = ?, source = ?, notes = ?, canceled_at = ?, completed_at = ?, technician_id = ?, service_items_json = ?,
           audit_log_json = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
      .bind(
        nextValues.customerName,
        nextValues.phone,
        nextValues.secondaryPhone,
        nextValues.whatsappPhone,
        nextValues.district,
        nextValues.city,
        nextValues.mapLink,
        nextValues.addressText,
        nextValues.landmark,
        nextValues.mapLink,
        nextValues.acType,
        nextValues.serviceCategory,
        nextValues.workType,
        nextValues.acCount,
        nextValues.status,
        nextValues.priority,
        nextValues.deliveryType,
        nextValues.preferredDate,
        nextValues.preferredTime,
        nextValues.scheduledDate,
        nextValues.scheduledTime,
        nextValues.source,
        nextValues.notes,
        nextValues.canceledAt,
        nextValues.completedAt,
        nextValues.technicianId,
        nextValues.serviceItemsJson,
        JSON.stringify(nextAuditLog),
        orderId
      )
      .run();
  }

  let archived = null;
  if (nextStatus === "completed") {
    archived = await archiveServiceOrderById(env, orderId, {
      reason: "completed_import",
    });
  }

  if (options.notify !== false) {
    if (hasDataChanges && !archived && !["completed", "canceled"].includes(nextStatus)) {
      await notifyUsersAboutTechnicianAssignmentReview(env, normalized, orderId, {
        technicianCodeLookup: options.technicianCodeLookup,
      });
    }

    if (actorRole === "customer_service" && (previousStatus !== nextStatus || archived)) {
      await notifyOperationsManagersAboutStatusChange(
        env,
        archived ? "تمت أرشفة طلب مكتمل" : "تم تحديث حالة طلب موجود",
        archived
          ? `تمت مطابقة الطلب رقم ${normalized.requestNumber || existingOrder.requestNumber} مع طلب موجود، وتحديثه ثم أرشفته تلقائياً لأنه أصبح مكتملًا.`
          : `تمت مزامنة الطلب رقم ${normalized.requestNumber || existingOrder.requestNumber} وتحديث حالته إلى ${mapOrderStatusLabel(nextStatus)}.`,
        archived?.original_order_id || orderId
      );
    }

    if (actorRole === "operations_manager" && (previousStatus !== nextStatus || archived)) {
      await notifyUsersByRoles(
        env,
        ["admin", "customer_service"],
        archived ? "تمت أرشفة طلب مكتمل" : "تم تحديث حالة طلب موجود",
        archived
          ? `تمت مزامنة الطلب رقم ${normalized.requestNumber || existingOrder.requestNumber} وأُزيل من قائمة العمل لأنه أصبح مكتملًا.`
          : `تمت مزامنة الطلب رقم ${normalized.requestNumber || existingOrder.requestNumber} وتحديث حالته إلى ${mapOrderStatusLabel(nextStatus)}.`,
        archived?.original_order_id || orderId
      );
    }
  }

  const order = archived ? null : await readServiceOrderById(env, orderId);
  return {
    action: archived ? "archived_existing" : hasDataChanges ? "updated_existing" : "unchanged_existing",
    order,
    archived,
    previousStatus,
    nextStatus,
  };
}

async function syncArchivedServiceOrderFromIncomingData(env, archiveId, normalized, actor = {}, options = {}) {
  const archivedRow = await readArchivedServiceOrderRowById(env, archiveId);
  if (!archivedRow) {
    return null;
  }

  const incomingStatus = normalizeImportedOrderStatus(normalized.importStatus);
  const archiveReferences = {
    idRef: normalized.idRef || archivedRow.request_number || normalized.soId,
    soId: normalized.soId || archivedRow.request_number || normalized.requestNumber,
    woId: normalized.woId || extractImportReferenceValue({ notes: archivedRow.notes }, "WO ID"),
  };

  if (incomingStatus === "completed") {
    const nextNotes = mergeImportedNotes(archivedRow.notes, normalized.notes, archiveReferences);
    const nextAuditLog = normalizeAuditLogEntries([
      ...parseJsonArray(archivedRow.audit_log_json),
      {
        type: "archive_sync",
        actor: String(actor.role || actor.actor || "system").trim() || "system",
        message: `تمت مزامنة أرشيف الطلب ${archivedRow.request_number} ببيانات Excel الجديدة بدون إنشاء نسخة مكررة.`,
        createdAt: new Date().toISOString(),
      },
    ]);

    await env.DB.prepare(
      `UPDATE service_order_archives
       SET customer_name = ?, phone = ?, secondary_phone = ?, whatsapp_phone = ?, district = ?, city = ?, address = ?,
           address_text = ?, landmark = ?, map_link = ?, ac_type = ?, service_category = ?, work_type = ?, ac_count = ?,
           status = ?, priority = ?, delivery_type = ?, preferred_date = ?, preferred_time = ?, scheduled_date = ?, scheduled_time = ?,
           source = ?, notes = ?, completed_at = ?, audit_log_json = ?, service_items_json = ?, original_updated_at = CURRENT_TIMESTAMP,
           archived_at = CURRENT_TIMESTAMP, archive_reason = ?
       WHERE id = ?`
    )
      .bind(
        normalized.customerName || archivedRow.customer_name,
        normalizeSaudiPhoneNumber(normalized.phone || archivedRow.phone),
        normalizeSaudiPhoneNumber(normalized.secondaryPhone || archivedRow.secondary_phone),
        normalizeSaudiPhoneNumber(normalized.whatsappPhone || archivedRow.whatsapp_phone || archivedRow.phone),
        normalized.district || archivedRow.district,
        normalized.city || archivedRow.city,
        normalized.mapLink || archivedRow.address,
        normalized.addressText || archivedRow.address_text,
        normalized.landmark || archivedRow.landmark,
        normalized.mapLink || archivedRow.map_link || archivedRow.address,
        normalized.primaryAcType || archivedRow.ac_type || "split",
        inferServiceCategory(normalized.serviceSummary || archivedRow.work_type),
        normalized.serviceSummary || archivedRow.work_type,
        Math.max(1, Number(normalized.totalQuantity) || Number(archivedRow.ac_count) || 1),
        "completed",
        normalizeDeliveryType(normalized.deliveryType || archivedRow.delivery_type),
        normalizeDeliveryType(normalized.deliveryType || archivedRow.delivery_type) === "none" ? archivedRow.priority : "urgent",
        normalizeDeliveryType(normalized.deliveryType || archivedRow.delivery_type),
        normalized.preferredDate || archivedRow.preferred_date,
        normalized.preferredTime || archivedRow.preferred_time,
        normalized.preferredDate || archivedRow.scheduled_date,
        normalized.preferredTime || archivedRow.scheduled_time,
        normalized.sourceChannel || archivedRow.source || "manual",
        nextNotes,
        archivedRow.completed_at || `${normalized.preferredDate || new Date().toISOString().slice(0, 10)}T${normalized.preferredTime || "09:00"}:00`,
        JSON.stringify(nextAuditLog),
        JSON.stringify(normalized.acDetails || parseJsonArray(archivedRow.service_items_json)),
        "completed_import",
        Number(archiveId)
      )
      .run();

    return {
      action: "updated_archived",
      archived: true,
      nextStatus: "completed",
    };
  }

  const restored = await restoreArchivedServiceOrder(env, archiveId);
  if (!restored?.orderId) {
    return null;
  }

  await env.DB.prepare(
    "UPDATE service_orders SET status = 'pending', completed_at = NULL, canceled_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  )
    .bind(Number(restored.orderId))
    .run();

  const syncResult = await syncExistingServiceOrderFromIncomingData(env, restored.orderId, normalized, actor, options);
  return {
    ...syncResult,
    action:
      syncResult?.action === "archived_existing"
        ? "restored_and_archived"
        : syncResult?.action === "unchanged_existing"
          ? "restored_unchanged"
          : "restored_existing",
    restoredFromArchive: true,
  };
}
async function createTechnician(request, env) {
  const manager = await requireRoles(request, env, ["admin", "operations_manager"]);
  if (!manager) {
    return json({ message: "Admin or operations manager access required" }, 403, request, env);
  }

  const body = await readJson(request);
  const firstName = String(body.firstName || "").trim();
  const lastName = String(body.lastName || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const phone = normalizeSaudiPhoneNumber(body.phone);
  const password = String(body.password || "").trim();
  const coverageKeys = normalizeTechnicianCoverageKeys(body.coverageKeys || body.regions || body.region || body.cityCoverage || "");
  const excelTechnicianCode = normalizeExcelTechnicianCode(
    body.excelTechnicianCode || body.technicianCode || body.techId || body.techCode || ""
  );
  const region = coverageKeys[0] || "";
  const notes = String(body.notes || "").trim();
  const status = normalizeTechnicianStatus(body.status);

  if (!firstName || !lastName || !email || !phone || !password || !coverageKeys.length || !excelTechnicianCode) {
    return json({ message: "All technician fields and the Excel technician code are required" }, 400, request, env);
  }

  const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?")
    .bind(email)
    .first();

  if (existing) {
    return json({ message: "This email is already registered" }, 409, request, env);
  }

  const duplicateCode = await env.DB.prepare(
    "SELECT id FROM technicians WHERE excel_technician_code = ? LIMIT 1"
  )
    .bind(excelTechnicianCode)
    .first();

  if (duplicateCode) {
    return json({ message: "This Excel technician code is already linked to another technician" }, 409, request, env);
  }

  const passwordHash = await hashPassword(password, email);
  const userName = `${firstName} ${lastName}`.trim();

  const createdUser = await env.DB.prepare(
    "INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)"
  )
    .bind(userName, email, passwordHash, "technician", "active")
    .run();

  const userId = createdUser.meta.last_row_id;
  await env.DB.prepare(
    "INSERT INTO technicians (user_id, name, phone, zone, coverage_json, status, notes, excel_technician_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  )
    .bind(Number(userId), userName, phone, region, JSON.stringify(coverageKeys), status, notes, excelTechnicianCode)
    .run();

  const technician = await env.DB.prepare(
    `SELECT
       id,
       user_id,
       name,
       phone,
       zone,
       coverage_json,
       status,
       COALESCE(notes, '') AS notes,
       COALESCE(excel_technician_code, '') AS excel_technician_code
     FROM technicians
     WHERE user_id = ?`
  )
    .bind(Number(userId))
    .first();

  return json(
    {
      user: {
        id: Number(userId),
        firstName,
        lastName,
        name: userName,
        email,
        phone,
        role: "technician",
        technicianId: technician ? String(technician.id) : String(userId),
        region,
        coverageKeys,
        notes,
        excelTechnicianCode,
      },
      technician: mapTechnician(technician || {
        id: Number(userId),
        user_id: Number(userId),
        name: userName,
        phone,
        zone: region,
        status,
      }),
    },
    201,
    request,
    env
  );
}

async function updateTechnician(request, technicianId, env) {
  const manager = await requireRoles(request, env, ["admin", "operations_manager"]);
  if (!manager) {
    return json({ message: "Admin or operations manager access required" }, 403, request, env);
  }

  const id = Number(technicianId);
  if (!Number.isInteger(id) || id <= 0) {
    return json({ message: "Invalid technician id" }, 400, request, env);
  }

  const existing = await env.DB.prepare(
    `SELECT
      t.id,
      t.user_id,
      t.name,
      t.phone,
      t.zone,
      t.coverage_json,
      t.status,
      COALESCE(t.notes, '') AS notes,
      COALESCE(t.excel_technician_code, '') AS excel_technician_code,
      u.email
     FROM technicians t
     JOIN users u ON u.id = t.user_id
     WHERE t.id = ?`
  )
    .bind(id)
    .first();

  if (!existing) {
    return json({ message: "Technician not found" }, 404, request, env);
  }

  const body = await readJson(request);
  const firstName = String(body.firstName || "").trim();
  const lastName = String(body.lastName || "").trim();
  const email = String(body.email || existing.email || "").trim().toLowerCase();
  const phone = normalizeSaudiPhoneNumber(body.phone ?? existing.phone);
  const coverageKeys = normalizeTechnicianCoverageKeys(
    body.coverageKeys ?? body.regions ?? body.region ?? body.cityCoverage ?? existing.coverage_json ?? existing.zone ?? ""
  );
  const excelTechnicianCode = normalizeExcelTechnicianCode(
    body.excelTechnicianCode ?? body.technicianCode ?? body.techId ?? body.techCode ?? existing.excel_technician_code
  );
  const region = coverageKeys[0] || "";
  const notes = String(body.notes ?? existing.notes ?? "").trim();
  const status = normalizeTechnicianStatus(body.status ?? existing.status);
  const password = String(body.password || "").trim();
  const name =
    `${firstName || existing.name.split(" ").slice(0, -1).join(" ")} ${lastName || existing.name.split(" ").slice(-1).join(" ")}`.trim() ||
    existing.name;

  if (!name || !email || !phone || !coverageKeys.length || !excelTechnicianCode) {
    return json({ message: "Name, email, phone, coverage, and the Excel technician code are required" }, 400, request, env);
  }

  const duplicate = await env.DB.prepare(
    "SELECT id FROM users WHERE email = ? AND id != ?"
  )
    .bind(email, Number(existing.user_id))
    .first();

  if (duplicate) {
    return json({ message: "This email is already registered" }, 409, request, env);
  }

  const duplicateCode = await env.DB.prepare(
    "SELECT id FROM technicians WHERE excel_technician_code = ? AND id != ? LIMIT 1"
  )
    .bind(excelTechnicianCode, id)
    .first();

  if (duplicateCode) {
    return json({ message: "This Excel technician code is already linked to another technician" }, 409, request, env);
  }

  if (password) {
    const passwordHash = await hashPassword(password, email);
    await env.DB.prepare(
      "UPDATE users SET name = ?, email = ?, password_hash = ? WHERE id = ?"
    )
      .bind(name, email, passwordHash, Number(existing.user_id))
      .run();
  } else {
    await env.DB.prepare("UPDATE users SET name = ?, email = ? WHERE id = ?")
      .bind(name, email, Number(existing.user_id))
      .run();
  }

  await env.DB.prepare(
    "UPDATE technicians SET name = ?, phone = ?, zone = ?, coverage_json = ?, status = ?, notes = ?, excel_technician_code = ? WHERE id = ?"
  )
    .bind(name, phone, region, JSON.stringify(coverageKeys), status, notes, excelTechnicianCode, id)
    .run();

  const technician = await env.DB.prepare(
    `SELECT
      t.id,
      t.user_id,
      t.name,
      t.phone,
      t.zone,
      t.coverage_json,
      t.status,
      COALESCE(t.notes, '') AS notes,
      COALESCE(t.excel_technician_code, '') AS excel_technician_code,
      u.email
     FROM technicians t
     LEFT JOIN users u ON u.id = t.user_id
     WHERE t.id = ?`
  )
    .bind(id)
    .first();

  return json({ technician: mapTechnician(technician) }, 200, request, env);
}

async function deleteTechnician(request, technicianId, env) {
  const manager = await requireRoles(request, env, ["admin", "operations_manager"]);
  if (!manager) {
    return json({ message: "Admin or operations manager access required" }, 403, request, env);
  }

  const id = Number(technicianId);
  if (!Number.isInteger(id) || id <= 0) {
    return json({ message: "Invalid technician id" }, 400, request, env);
  }

  const technician = await env.DB.prepare(
    "SELECT id, user_id, name FROM technicians WHERE id = ?"
  )
    .bind(id)
    .first();

  if (!technician) {
    return json({ message: "Technician not found" }, 404, request, env);
  }

  const activeOrder = await env.DB.prepare(
    "SELECT id FROM service_orders WHERE technician_id = ? AND status IN ('pending', 'scheduled', 'in_transit') LIMIT 1"
  )
    .bind(id)
    .first();

  if (activeOrder) {
    return json(
      { message: "Cannot delete a technician with active assigned orders" },
      409,
      request,
      env
    );
  }

  await env.DB.prepare("DELETE FROM technicians WHERE id = ?").bind(id).run();
  await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(Number(technician.user_id)).run();

  return json({ message: "Technician deleted" }, 200, request, env);
}

async function updateServiceOrder(request, id, env) {
  const actor = await requireRoles(request, env, ["admin", "customer_service", "operations_manager", "technician"]);
  if (!actor) {
    return json({ message: "Internal access required" }, 403, request, env);
  }
  const isAdmin = actor.role === "admin";
  const isOperationsManager = actor.role === "operations_manager" || isAdmin;
  const isCustomerService = actor.role === "customer_service";
  const isTechnician = actor.role === "technician";

  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return json({ message: "Invalid order id" }, 400, request, env);
  }

  const existing = await env.DB.prepare(
    `SELECT
      id, technician_id, status, customer_name, request_number, phone, secondary_phone, whatsapp_phone, notes, district, city, address,
      address_text, landmark, map_link, ac_type, service_category, standard_duration_minutes, work_started_at, completion_note, delay_reason,
      delay_note, work_type, ac_count, priority, delivery_type, preferred_date, preferred_time, scheduled_date, scheduled_time, coordination_note, source,
      customer_action, reschedule_reason, cancellation_reason, canceled_at, completed_at, approval_status, proof_status, approved_at,
      approved_by, client_signature, zamil_closure_status, zamil_close_requested_at, zamil_otp_code, zamil_otp_submitted_at,
      zamil_closed_at, suspension_reason, suspension_note, suspended_at, exception_status, audit_log_json, copper_meters, base_included,
      service_items_json
     FROM service_orders
     WHERE id = ?`
  )
    .bind(orderId)
    .first();

  if (!existing) {
    return json({ message: "Order not found" }, 404, request, env);
  }

  const previousTechnician =
    existing.technician_id === null
      ? null
      : await env.DB.prepare("SELECT id, user_id, name FROM technicians WHERE id = ?").bind(Number(existing.technician_id)).first();

  const body = await readJson(request);
  const touchedKeys = Object.keys(body || {}).filter((key) => body[key] !== undefined);
  const technicianAllowedKeys = ["clientSignature"];
  const technicianTouchedKeys = touchedKeys;

  if (isTechnician) {
    if (technicianTouchedKeys.some((key) => !technicianAllowedKeys.includes(key))) {
      return json({ message: "Technicians can only update the client signature from this endpoint" }, 403, request, env);
    }

    const assignedTechnician =
      existing.technician_id === null
        ? null
        : await env.DB.prepare("SELECT id, user_id FROM technicians WHERE id = ?").bind(Number(existing.technician_id)).first();

    if (!assignedTechnician || Number(assignedTechnician.user_id || 0) !== Number(actor.sub || 0)) {
      return json({ message: "This order is not assigned to the active technician" }, 403, request, env);
    }

    if (body.clientSignature === undefined) {
      return json({ message: "Client signature is required" }, 400, request, env);
    }
  }

  const noteOnlyContactCustomer =
    !isCustomerService &&
    touchedKeys.length === 1 &&
    touchedKeys[0] === "contactCustomerNote" &&
    String(body.contactCustomerNote || "").trim();

  if (noteOnlyContactCustomer) {
    const contactCustomerNote = String(body.contactCustomerNote || "").trim();
    const nextCoordinationNote = [String(existing.coordination_note || "").trim(), `اتصل بالعميل: ${contactCustomerNote}`]
      .filter(Boolean)
      .join("\n");
    const nextAuditLog = normalizeAuditLogEntries([
      ...normalizeAuditLogEntries(parseJsonArray(existing.audit_log_json)),
      {
        type: "coordination",
        actor: "operations_manager",
        message: `سجل مدير العمليات تواصلاً مع العميل. الملاحظة: ${contactCustomerNote}`,
        createdAt: new Date().toISOString(),
      },
    ]);

    await env.DB.prepare(
      `UPDATE service_orders
       SET coordination_note = ?, audit_log_json = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
      .bind(nextCoordinationNote, JSON.stringify(nextAuditLog), orderId)
      .run();

    const order = await readServiceOrderById(env, orderId);
    return json({ order }, 200, request, env);
  }

  const requestNumber =
    body.requestNumber !== undefined ? String(body.requestNumber || "").trim() : String(existing.request_number || "").trim();
  const customerName =
    body.customerName !== undefined ? String(body.customerName || "").trim() : String(existing.customer_name || "").trim();
  const phone = body.phone !== undefined ? normalizeSaudiPhoneNumber(body.phone) : normalizeSaudiPhoneNumber(existing.phone);
  const secondaryPhone =
    body.secondaryPhone !== undefined
      ? normalizeSaudiPhoneNumber(body.secondaryPhone)
      : normalizeSaudiPhoneNumber(existing.secondary_phone);
  const whatsappPhone =
    body.whatsappPhone !== undefined
      ? normalizeSaudiPhoneNumber(body.whatsappPhone)
      : normalizeSaudiPhoneNumber(existing.whatsapp_phone || existing.phone);
  const status = body.status !== undefined ? String(body.status || "").trim() : String(existing.status || "pending").trim();
  const notes = body.notes !== undefined ? String(body.notes || "").trim() : String(existing.notes || "").trim();
  const existingExplicitSoId = String(
    extractImportReferenceValue(existing, "SO ID") || extractImportReferenceValue(existing, "soId") || ""
  ).trim();
  const existingExplicitWoId = String(
    extractImportReferenceValue(existing, "WO ID") || extractImportReferenceValue(existing, "woId") || ""
  ).trim();
  const soId = body.soId !== undefined ? String(body.soId || "").trim() : existingExplicitSoId || requestNumber;
  const woId = body.woId !== undefined ? String(body.woId || "").trim() : existingExplicitWoId;
  const nextNotes = normalizeServiceOrderNotes(notes, {
    soId: soId || requestNumber,
    woId,
  });
  const district = body.district !== undefined ? String(body.district || "").trim() : String(existing.district || "").trim();
  const city = body.city !== undefined ? String(body.city || "").trim() : String(existing.city || "").trim();
  const addressText =
    body.addressText !== undefined ? String(body.addressText || "").trim() : String(existing.address_text || "").trim();
  const landmark =
    body.landmark !== undefined ? String(body.landmark || "").trim() : String(existing.landmark || "").trim();
  const mapLink =
    body.mapLink !== undefined ? String(body.mapLink || "").trim() : String(existing.map_link || existing.address || "").trim();
  const address = mapLink;
  const acDetails =
    body.acDetails !== undefined
      ? (Array.isArray(body.acDetails) ? body.acDetails : [])
          .map((item, index) => ({
            id: String(item?.id || `ac-${Date.now()}-${index}`),
            type: String(item?.type || "").trim().toLowerCase(),
            quantity: Math.max(1, Number(item?.quantity) || 1),
          }))
          .filter((item) => item.type)
      : (() => {
          try {
            return JSON.parse(existing.service_items_json || "[]");
          } catch {
            return [];
          }
        })();
  const acType =
    body.acType !== undefined
      ? String(body.acType || "").trim()
      : String(existing.ac_type || acDetails[0]?.type || "").trim();
  const serviceCategory =
    body.serviceCategory !== undefined
      ? String(body.serviceCategory || "split_installation").trim()
      : String(existing.service_category || "split_installation").trim();
  const standardDurationMinutes =
    body.standardDurationMinutes !== undefined
      ? Math.max(1, Number(body.standardDurationMinutes) || 1)
      : Math.max(1, Number(existing.standard_duration_minutes) || 120);
  const workStartedAt =
    body.workStartedAt !== undefined ? String(body.workStartedAt || "").trim() || null : existing.work_started_at || null;
  const completionNote =
    body.completionNote !== undefined
      ? String(body.completionNote || "").trim()
      : String(existing.completion_note || "").trim();
  const delayReason =
    body.delayReason !== undefined ? String(body.delayReason || "").trim() : String(existing.delay_reason || "").trim();
  const delayNote =
    body.delayNote !== undefined ? String(body.delayNote || "").trim() : String(existing.delay_note || "").trim();
  const priority =
    body.priority !== undefined ? String(body.priority || "normal").trim() : String(existing.priority || "normal").trim();
  const deliveryType =
    body.deliveryType !== undefined
      ? normalizeDeliveryType(body.deliveryType)
      : normalizeDeliveryType(existing.delivery_type);
  const preferredDate =
    body.preferredDate !== undefined
      ? String(body.preferredDate || "").trim()
      : String(existing.preferred_date || existing.scheduled_date || "").trim();
  const preferredTime =
    body.preferredTime !== undefined
      ? String(body.preferredTime || "").trim()
      : String(existing.preferred_time || existing.scheduled_time || "").trim();
  const scheduledDate =
    body.scheduledDate !== undefined
      ? String(body.scheduledDate || "").trim()
      : String(existing.scheduled_date || "").trim();
  const scheduledTime =
    body.scheduledTime !== undefined
      ? String(body.scheduledTime || "").trim()
      : String(existing.scheduled_time || "").trim();
  const coordinationNote =
    body.coordinationNote !== undefined
      ? String(body.coordinationNote || "").trim()
      : String(existing.coordination_note || "").trim();
  const contactCustomerNote = String(body.contactCustomerNote || "").trim();
  const nextCoordinationNote = contactCustomerNote
    ? [coordinationNote, `اتصل بالعميل: ${contactCustomerNote}`].filter(Boolean).join("\n")
    : coordinationNote;
  const workType =
    body.workType !== undefined
      ? String(body.workType || "").trim()
      : body.serviceSummary !== undefined
        ? String(body.serviceSummary || "").trim()
        : String(existing.work_type || "").trim();
  const acCount =
    body.acCount !== undefined
      ? Math.max(1, Number(body.acCount) || 1)
      : acDetails.reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0) || Number(existing.ac_count || 1);
  const source =
    body.source !== undefined
      ? String(body.source || "manual").trim()
      : body.sourceChannel !== undefined
        ? String(body.sourceChannel || "manual").trim()
        : String(existing.source || "manual").trim();
  const customerAction =
    body.customerAction !== undefined
      ? String(body.customerAction || "none").trim()
      : String(existing.customer_action || "none").trim();
  const rescheduleReason =
    body.rescheduleReason !== undefined
      ? String(body.rescheduleReason || "").trim()
      : String(existing.reschedule_reason || "").trim();
  const cancellationReason =
    body.cancellationReason !== undefined
      ? String(body.cancellationReason || "").trim()
      : String(existing.cancellation_reason || "").trim();
  const approvalStatus =
    body.approvalStatus !== undefined
      ? String(body.approvalStatus || "pending").trim()
      : String(existing.approval_status || "pending").trim();
  const proofStatus =
    body.proofStatus !== undefined
      ? String(body.proofStatus || "pending_review").trim()
      : String(existing.proof_status || "pending_review").trim();
  const approvedAt =
    body.approvedAt !== undefined ? String(body.approvedAt || "").trim() || null : existing.approved_at || null;
  const approvedBy =
    body.approvedBy !== undefined ? String(body.approvedBy || "").trim() : String(existing.approved_by || "").trim();
  const clientSignature =
    body.clientSignature !== undefined
      ? String(body.clientSignature || "").trim()
      : String(existing.client_signature || "").trim();
  const zamilClosureStatus =
    body.zamilClosureStatus !== undefined
      ? String(body.zamilClosureStatus || "idle").trim()
      : String(existing.zamil_closure_status || "idle").trim();
  const zamilCloseRequestedAt =
    body.zamilCloseRequestedAt !== undefined
      ? String(body.zamilCloseRequestedAt || "").trim() || null
      : existing.zamil_close_requested_at || null;
  const zamilOtpCode =
    body.zamilOtpCode !== undefined
      ? String(body.zamilOtpCode || "").trim()
      : String(existing.zamil_otp_code || "").trim();
  const zamilOtpSubmittedAt =
    body.zamilOtpSubmittedAt !== undefined
      ? String(body.zamilOtpSubmittedAt || "").trim() || null
      : existing.zamil_otp_submitted_at || null;
  const zamilClosedAt =
    body.zamilClosedAt !== undefined
      ? String(body.zamilClosedAt || "").trim() || null
      : existing.zamil_closed_at || null;
  const suspensionReason =
    body.suspensionReason !== undefined
      ? String(body.suspensionReason || "").trim()
      : String(existing.suspension_reason || "").trim();
  const suspensionNote =
    body.suspensionNote !== undefined
      ? String(body.suspensionNote || "").trim()
      : String(existing.suspension_note || "").trim();
  const suspendedAt =
    body.suspendedAt !== undefined ? String(body.suspendedAt || "").trim() || null : existing.suspended_at || null;
  const exceptionStatus =
    body.exceptionStatus !== undefined
      ? String(body.exceptionStatus || "none").trim()
      : String(existing.exception_status || "none").trim();
  const technicianId =
    body.technicianId === undefined
      ? existing.technician_id
      : body.technicianId === "" || body.technicianId === null
        ? null
        : Number(body.technicianId);
  const auditLog =
    body.auditLog !== undefined
      ? normalizeAuditLogEntries(body.auditLog)
      : normalizeAuditLogEntries(parseJsonArray(existing.audit_log_json));

  if (!["pending", "scheduled", "in_transit", "completed", "canceled"].includes(status)) {
    return json({ message: "Invalid order status" }, 400, request, env);
  }

  if (!["idle", "requested", "otp_submitted", "closed"].includes(zamilClosureStatus)) {
    return json({ message: "Invalid Zamil closure status" }, 400, request, env);
  }

  if (!scheduledDate && status !== "canceled") {
    return json({ message: "Scheduled date is required" }, 400, request, env);
  }

  if (!requestNumber || !customerName || !phone || !mapLink) {
    return json({ message: "Request number, customer name, phone, and map link are required" }, 400, request, env);
  }

  const referenceRegistry = await readServiceOrderReferenceRegistry(env, orderId);
  const duplicateReference = findDuplicateOrderReference(referenceRegistry, {
    requestNumber,
    soId: soId || requestNumber,
    woId,
    notes: nextNotes,
  });
  if (duplicateReference) {
    return json({ message: buildDuplicateOrderMessage(duplicateReference) }, 409, request, env);
  }

  if (deliveryType === "express_24h" && !isFastDeliveryCity(city)) {
    return json({ message: "Fast delivery is only available in the listed major cities" }, 400, request, env);
  }

  if (!acType) {
    return json({ message: "AC type is required" }, 400, request, env);
  }

  if (technicianId !== null && (!Number.isInteger(technicianId) || technicianId <= 0)) {
    return json({ message: "Technician not found" }, 404, request, env);
  }

  const technician =
    technicianId === null
      ? null
      : await env.DB.prepare("SELECT id, user_id, name FROM technicians WHERE id = ?").bind(Number(technicianId)).first();

  if (technicianId !== null && !technician) {
    return json({ message: "Technician not found" }, 404, request, env);
  }

  if (isCustomerService && body.status !== undefined && status !== "canceled") {
    return json({ message: "Customer service can only request rescheduling or cancel the order" }, 403, request, env);
  }

  if (isCustomerService && body.customerAction === "reschedule_requested" && !rescheduleReason) {
    return json({ message: "Reschedule reason is required" }, 400, request, env);
  }

  if (isCustomerService && status === "canceled" && !cancellationReason) {
    return json({ message: "Cancellation reason is required" }, 400, request, env);
  }

  const serviceItemsTotal = calculateServiceItemsTotal(body.serviceItems || []);
  const extrasTotal =
    calculateExtrasTotal(existing.copper_meters, Boolean(existing.base_included)) + serviceItemsTotal;

  const nextAuditLog = normalizeAuditLogEntries([
    ...auditLog,
    {
      type: isOperationsManager ? "coordination" : isTechnician ? "signature" : "customer_action",
      actor: isOperationsManager
        ? "operations_manager"
        : isTechnician
          ? "technician"
          : "customer_service",
      message: isOperationsManager
        ? contactCustomerNote
          ? `سجل مدير العمليات تواصلاً مع العميل.${contactCustomerNote ? ` الملاحظة: ${contactCustomerNote}` : ""}`
          : "قام مدير العمليات بتحديث الموعد أو حالة الطلب."
        : isTechnician
          ? "قام الفني بتحديث توقيع العميل."
          : status === "canceled"
            ? `تم إلغاء الطلب من خدمة العملاء.${cancellationReason ? ` السبب: ${cancellationReason}` : ""}`
            : customerAction === "reschedule_requested"
              ? `تم طلب إعادة جدولة من خدمة العملاء.${rescheduleReason ? ` السبب: ${rescheduleReason}` : ""}`
              : "تم تحديث بيانات الطلب من خدمة العملاء.",
      createdAt: new Date().toISOString(),
    },
  ]);

  const effectivePriority = deliveryType === "none" ? priority : "urgent";

  const nextCustomerAction =
    isOperationsManager && (body.scheduledDate !== undefined || body.scheduledTime !== undefined || body.status !== undefined)
      ? String(body.customerAction || "none").trim() || "none"
      : customerAction;
  const nextCompletedAt =
    status === "completed" ? new Date().toISOString() : existing.completed_at || null;
  const nextCanceledAt = status === "canceled" ? new Date().toISOString() : existing.canceled_at || null;

  await env.DB.prepare(
    `UPDATE service_orders
     SET customer_name = ?, request_number = ?, phone = ?, secondary_phone = ?, whatsapp_phone = ?, status = ?, technician_id = ?, notes = ?,
         district = ?, city = ?, address = ?, address_text = ?, landmark = ?, map_link = ?, ac_type = ?, service_category = ?,
         standard_duration_minutes = ?, work_started_at = ?, completion_note = ?, delay_reason = ?, delay_note = ?,
         priority = ?, delivery_type = ?, preferred_date = ?, preferred_time = ?, scheduled_date = ?, scheduled_time = ?, coordination_note = ?,
         work_type = ?, ac_count = ?, source = ?, customer_action = ?, reschedule_reason = ?, cancellation_reason = ?, canceled_at = ?,
         completed_at = ?, approval_status = ?,
         proof_status = ?, approved_at = ?, approved_by = ?, client_signature = ?, zamil_closure_status = ?,
         zamil_close_requested_at = ?, zamil_otp_code = ?, zamil_otp_submitted_at = ?, zamil_closed_at = ?,
         suspension_reason = ?, suspension_note = ?, suspended_at = ?, exception_status = ?, audit_log_json = ?,
         service_items_json = ?, extras_total = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  )
    .bind(
      customerName,
      requestNumber,
      phone,
      secondaryPhone,
      whatsappPhone,
      status,
      technician ? technician.id : null,
      nextNotes,
      district,
      city,
      address,
      addressText,
      landmark,
      mapLink,
      acType,
      serviceCategory,
      standardDurationMinutes,
      workStartedAt,
      completionNote,
      delayReason,
      delayNote,
      effectivePriority,
      deliveryType,
      preferredDate,
      preferredTime,
      scheduledDate,
      scheduledTime,
      nextCoordinationNote,
      workType,
      acCount,
      source,
      nextCustomerAction,
      rescheduleReason,
      cancellationReason,
      nextCanceledAt,
      nextCompletedAt,
      approvalStatus,
      proofStatus,
      approvedAt,
      approvedBy,
      clientSignature,
      zamilClosureStatus,
      zamilCloseRequestedAt,
      zamilOtpCode,
      zamilOtpSubmittedAt,
      zamilClosedAt,
      suspensionReason,
      suspensionNote,
      suspendedAt,
      exceptionStatus,
      JSON.stringify(nextAuditLog),
      JSON.stringify(acDetails),
      extrasTotal,
      orderId
    )
    .run();

  if (technician && Number(existing.technician_id || 0) !== technician.id) {
    await createNotification(
      env,
      technician.user_id,
      "تم إسناد الطلب لك",
      await buildTechnicianTaskNotificationBody(
        env,
        technician.id,
        `تم إسناد الطلب رقم ${requestNumber || orderId} لك.`
      ),
      "assignment",
      orderId
    );
  }

  if (previousTechnician && Number(previousTechnician.id || 0) !== Number(technician?.id || 0)) {
    await createNotification(
      env,
      previousTechnician.user_id,
      "تم نقل الطلب من قائمتك",
      await buildTechnicianTaskNotificationBody(
        env,
        previousTechnician.id,
        `تم سحب الطلب رقم ${requestNumber || orderId} من قائمة مهامك.`
      ),
      "assignment",
      orderId
    );
  }

  if (isCustomerService && status !== String(existing.status || "").trim()) {
    await notifyOperationsManagersAboutStatusChange(
      env,
      "تم تحديث حالة الطلب",
      `تم تحديث حالة الطلب رقم ${requestNumber} إلى ${mapOrderStatusLabel(status)}${status === "canceled" && cancellationReason ? ` بسبب: ${cancellationReason}` : ""}.`,
      orderId
    );
  }

  if (isOperationsManager && (body.scheduledDate !== undefined || body.scheduledTime !== undefined)) {
    await notifyUsersByRoles(
      env,
        ["admin", "customer_service"],
        "تم تنسيق موعد الطلب",
        `تم تحديد موعد الطلب رقم ${requestNumber} بتاريخ ${scheduledDate || "-"} الساعة ${scheduledTime || "-"}.`,
        orderId
    );

    if (technician && Number(previousTechnician?.id || 0) === Number(technician.id)) {
      await createNotification(
        env,
        technician.user_id,
        "تم تحديث موعد المهمة",
        await buildTechnicianTaskNotificationBody(
          env,
          technician.id,
          `تم تحديث موعد الطلب رقم ${requestNumber || orderId} إلى ${scheduledDate || "-"} الساعة ${scheduledTime || "-"}.`
        ),
        "status_update",
        orderId
      );
    }
  }

  if (isOperationsManager && body.status !== undefined && status !== String(existing.status || "").trim()) {
    await notifyUsersByRoles(
      env,
        ["admin", "customer_service"],
        "تم تحديث حالة الطلب",
        `تم تحديث حالة الطلب رقم ${requestNumber} إلى ${mapOrderStatusLabel(status)}.`,
        orderId
    );
  }

  const order = await readServiceOrderById(env, orderId);
  return json({ order }, 200, request, env);
}

async function updateTechnicianAvailability(request, technicianId, env) {
  const user = await requireRoles(request, env, ["admin", "operations_manager", "technician"]);
  if (!user) {
    return json({ message: "Unauthorized" }, 401, request, env);
  }

  const id = Number(technicianId);
  if (!Number.isInteger(id) || id <= 0) {
    return json({ message: "Invalid technician id" }, 400, request, env);
  }

  const technician = await env.DB.prepare(
    `SELECT
       id,
       user_id,
       name,
       phone,
       zone,
       coverage_json,
       status,
       COALESCE(notes, '') AS notes,
       COALESCE(excel_technician_code, '') AS excel_technician_code
     FROM technicians
     WHERE id = ?`
  )
    .bind(id)
    .first();

  if (!technician) {
    return json({ message: "Technician not found" }, 404, request, env);
  }

  if (user.role === "technician" && String(technician.user_id) !== String(user.sub)) {
    return json({ message: "Forbidden" }, 403, request, env);
  }

  const body = await readJson(request);
  const status = normalizeTechnicianStatus(body.status);

  await env.DB.prepare("UPDATE technicians SET status = ? WHERE id = ?")
    .bind(status, id)
    .run();

  const nextTechnician = await env.DB.prepare(
    `SELECT
       id,
       user_id,
       name,
       phone,
       zone,
       coverage_json,
       status,
       COALESCE(notes, '') AS notes,
       COALESCE(excel_technician_code, '') AS excel_technician_code
     FROM technicians
     WHERE id = ?`
  )
    .bind(id)
    .first();

  return json({ technician: mapTechnician(nextTechnician) }, 200, request, env);
}

async function getTechnicianOrders(request, env) {
  const user = await requireRoles(request, env, ["technician"]);
  if (!user) {
    return json({ message: "Field access required" }, 403, request, env);
  }

  const technician = await env.DB.prepare(
    `SELECT
      t.id,
      t.user_id,
      t.name,
      t.phone,
      t.zone,
      t.coverage_json,
      t.status,
      COALESCE(t.notes, '') AS notes,
      COALESCE(t.excel_technician_code, '') AS excel_technician_code,
      u.email
     FROM technicians t
     LEFT JOIN users u ON u.id = t.user_id
     WHERE t.user_id = ?`
  )
    .bind(Number(user.sub))
    .first();

  if (!technician) {
    return json({ message: "Profile not found" }, 404, request, env);
  }

  const statement = env.DB.prepare(
        `SELECT
          o.id, o.customer_name, o.request_number, o.phone, o.secondary_phone, o.whatsapp_phone, o.district, o.city, o.address,
          o.address_text, o.landmark, o.map_link, o.ac_type, o.service_category, o.standard_duration_minutes,
          o.work_started_at, o.completion_note, o.delay_reason, o.delay_note, o.work_type, o.ac_count, o.status, o.priority,
          o.delivery_type, o.preferred_date, o.preferred_time, o.scheduled_date, o.scheduled_time, o.coordination_note, o.source,
          o.notes, o.customer_action, o.reschedule_reason, o.cancellation_reason, o.canceled_at, o.completed_at, o.approval_status,
          o.proof_status, o.approved_at, o.approved_by, o.client_signature, o.zamil_closure_status, o.zamil_close_requested_at,
          o.zamil_otp_code, o.zamil_otp_submitted_at, o.zamil_closed_at, o.suspension_reason, o.suspension_note, o.suspended_at,
          o.exception_status, o.audit_log_json, o.copper_meters, o.base_included, o.extras_total, o.service_items_json,
          o.created_at, o.updated_at, t.id AS technician_id, t.name AS technician_name, t.user_id AS technician_user_id
         FROM service_orders o
         LEFT JOIN technicians t ON t.id = o.technician_id
         WHERE o.technician_id = ?
         ORDER BY o.id DESC`
      ).bind(Number(technician.id));

  const { results } = await statement.all();
  const scopedResults = results || [];

  const areaClusters = await readInternalAreaClusters(env);
  const photosByOrderId = await readServiceOrderPhotosByOrderIds(
    env,
    scopedResults.map((row) => row.id)
  );
  const orders = scopedResults.map((row) =>
    mapServiceOrderRow(row, areaClusters, photosByOrderId.get(Number(row.id)) || [])
  );
  const timeStandards = await readServiceTimeStandards(env);

  return json(
    {
      technician: mapTechnician(technician),
      pricing: OPERATIONS_PRICING,
      timeStandards,
      areaClusters,
      orders,
    },
    200,
    request,
    env
  );
}

async function cancelServiceOrder(request, id, env) {
  const user = await requireRoles(request, env, ["admin", "technician"]);
  if (!user) {
    return json({ message: "Unauthorized" }, 401, request, env);
  }

  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return json({ message: "Invalid order id" }, 400, request, env);
  }

  const existing = await env.DB.prepare(
    `SELECT
      o.id,
      o.customer_name,
      o.notes,
      o.technician_id,
      t.user_id AS technician_user_id
     FROM service_orders o
     LEFT JOIN technicians t ON t.id = o.technician_id
     WHERE o.id = ?`
  )
    .bind(orderId)
    .first();

  if (!existing) {
    return json({ message: "Order not found" }, 404, request, env);
  }

  if (user.role === "technician" && Number(existing.technician_user_id) !== Number(user.sub)) {
    return json({ message: "This order is not assigned to you" }, 403, request, env);
  }

  const body = await readJson(request);
  const reason = String(body.reason || "").trim();
  const nextNotes = [existing.notes, reason].filter(Boolean).join(" | ");

  await env.DB.prepare(
    "UPDATE service_orders SET status = 'canceled', notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  )
    .bind(nextNotes, orderId)
    .run();

  if (user.role !== "operations_manager") {
    await notifyOperationsManagersAboutStatusChange(
      env,
      "تم إلغاء الطلب",
      `تم إلغاء الطلب #${orderId}${reason ? ` بسبب: ${reason}` : ""}.`,
      orderId
    );
  }

  const updated = await readServiceOrderById(env, orderId);
  return json({ order: updated }, 200, request, env);
}

async function updateServiceOrderStatus(request, id, env) {
  const user = await requireRoles(request, env, ["admin", "operations_manager", "technician"]);
  if (!user) {
    return json({ message: "Admin, operations manager, or technician access required" }, 401, request, env);
  }
  const isTechnician = user.role === "technician";
  const isOperationsLead = user.role === "operations_manager" || user.role === "admin";

  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return json({ message: "Invalid order id" }, 400, request, env);
  }

  const body = await readJson(request);
  const requestedStatus = String(body.status || "").trim();
  const status = isTechnician && requestedStatus === "rescheduled" ? "suspended" : requestedStatus;
  const allowedStatuses = isTechnician
    ? ["pending", "scheduled", "in_transit", "completed", "rescheduled", "suspended"]
    : ["pending", "scheduled", "in_transit", "completed"];

  if (!allowedStatuses.includes(requestedStatus)) {
    return json({ message: "Invalid order status" }, 400, request, env);
  }

  const order = await env.DB.prepare(
    `SELECT
      o.id, o.customer_name, o.request_number, o.status, o.audit_log_json,
      o.suspension_reason, o.suspension_note, o.suspended_at, o.exception_status,
      t.user_id AS technician_user_id
     FROM service_orders o
     LEFT JOIN technicians t ON t.id = o.technician_id
     WHERE o.id = ?`
  )
    .bind(orderId)
    .first();

  if (!order) {
    return json({ message: "Order not found" }, 404, request, env);
  }

  if (isTechnician && Number(order.technician_user_id) !== Number(user.sub)) {
    return json({ message: "This order is not assigned to you" }, 403, request, env);
  }

  const baseAuditLog = normalizeAuditLogEntries(parseJsonArray(order.audit_log_json));
  const nextAuditLog = normalizeAuditLogEntries([
    ...baseAuditLog,
    {
      type: "status",
      actor: isTechnician ? "technician" : isOperationsLead ? user.role : "operations_manager",
      message: isTechnician
        ? requestedStatus === "rescheduled"
          ? "قام الفني بطلب إعادة جدولة المهمة"
          : `قام الفني بتحديث المهمة إلى حالة ${mapOrderStatusLabel(status)}`
        : `تم تحديث الطلب إلى حالة ${mapOrderStatusLabel(status)}`,
      createdAt: new Date().toISOString(),
    },
  ]);
  const suspendedAt = status === "suspended" ? new Date().toISOString() : null;
  const suspensionReason =
    status === "suspended"
      ? String(body.suspensionReason || (requestedStatus === "rescheduled" ? "طلب إعادة جدولة من الفني" : "")).trim()
      : "";
  const suspensionNote = status === "suspended" ? String(body.suspensionNote || "").trim() : "";
  const exceptionStatus =
    status === "suspended"
      ? String(body.exceptionStatus || (requestedStatus === "rescheduled" ? "rescheduled" : "open")).trim() || "open"
      : "none";
  const completedAt = status === "completed" ? new Date().toISOString() : null;

  await env.DB.prepare(
    `UPDATE service_orders
     SET status = ?, suspension_reason = ?, suspension_note = ?, suspended_at = ?, exception_status = ?,
         completed_at = ?, audit_log_json = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  )
    .bind(status, suspensionReason, suspensionNote, suspendedAt, exceptionStatus, completedAt, JSON.stringify(nextAuditLog), orderId)
    .run();

  if (status === "in_transit") {
    await notifyUsersByRoles(
      env,
      ["admin", "customer_service"],
      "الطلب في الطريق",
      `الطلب رقم ${order.request_number || order.customer_name} في الطريق للعميل الآن.`,
      orderId
    );
  }

  if (status === "completed") {
    await notifyUsersByRoles(
      env,
      ["admin", "customer_service"],
      "تم إنهاء الطلب من الفني",
      `قام الفني بإنهاء الطلب رقم ${order.request_number || order.customer_name}.`,
      orderId
    );
  }

  if (requestedStatus === "rescheduled") {
    await notifyUsersByRoles(
      env,
      ["admin", "customer_service"],
      "طلب إعادة جدولة من الفني",
      `طلب الفني إعادة جدولة الطلب رقم ${order.request_number || order.customer_name}${suspensionReason ? ` بسبب: ${suspensionReason}` : ""}.`,
      orderId
    );
  }

  if (status !== String(order.status || "").trim()) {
    await notifyOperationsManagersAboutStatusChange(
      env,
      requestedStatus === "rescheduled" ? "طلب إعادة جدولة من الفني" : "تم تحديث حالة الطلب",
      requestedStatus === "rescheduled"
        ? `طلب الفني إعادة جدولة الطلب رقم ${order.request_number || order.customer_name}${suspensionReason ? ` بسبب: ${suspensionReason}` : ""}.`
        : `تم تحديث حالة الطلب رقم ${order.request_number || order.customer_name} إلى ${mapOrderStatusLabel(status)}${suspensionReason ? ` بسبب: ${suspensionReason}` : ""}.`,
      orderId
    );
  }

  const updated = await readServiceOrderById(env, orderId);
  return json({ order: updated }, 200, request, env);
}

async function quickUpdateCompactOrderStatus(request, id, env) {
  const user = await requireRoles(request, env, ["admin", "operations_manager"]);
  if (!user) {
    return json({ message: "Admin or operations manager access required" }, 401, request, env);
  }

  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return json({ message: "Invalid order id" }, 400, request, env);
  }

  const body = await readJson(request);
  const requestedStatus = String(body.status || "").trim();
  const status = requestedStatus === "rescheduled" ? "scheduled" : requestedStatus;

  if (!["completed", "scheduled"].includes(status) || !["completed", "rescheduled"].includes(requestedStatus)) {
    return json({ message: "Invalid compact order status" }, 400, request, env);
  }

  const order = await env.DB.prepare(
    `SELECT
      o.id, o.customer_name, o.request_number, o.status, o.city, o.completed_at, o.audit_log_json
     FROM service_orders o
     WHERE o.id = ?`
  )
    .bind(orderId)
    .first();

  if (!order) {
    return json({ message: "Order not found" }, 404, request, env);
  }

  if (String(order.status || "").trim() === "canceled") {
    return json({ message: "Canceled orders cannot be updated from the compact table" }, 409, request, env);
  }

  const nextAuditLog = normalizeAuditLogEntries([
    ...normalizeAuditLogEntries(parseJsonArray(order.audit_log_json)),
    {
      type: "status",
      actor: user.role === "admin" ? "admin" : "operations_manager",
      message:
        requestedStatus === "rescheduled"
          ? "تمت إعادة جدولة الطلب من الجدول المختصر."
          : `تم تحديث الطلب إلى حالة ${mapOrderStatusLabel(status)} من الجدول المختصر.`,
      createdAt: new Date().toISOString(),
    },
  ]);
  const nextCompletedAt = status === "completed" ? new Date().toISOString() : null;

  await env.DB.prepare(
    `UPDATE service_orders
     SET status = ?, completed_at = ?, audit_log_json = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  )
    .bind(status, nextCompletedAt, JSON.stringify(nextAuditLog), orderId)
    .run();

  if (requestedStatus === "rescheduled") {
    await notifyUsersByRoles(
      env,
      ["admin", "customer_service"],
      "تمت إعادة جدولة الطلب",
      `تمت إعادة جدولة الطلب رقم ${order.request_number || order.customer_name}.`,
      orderId
    );
  }

  if (requestedStatus === "completed") {
    await notifyUsersByRoles(
      env,
      ["admin", "customer_service"],
      "تم إنهاء الطلب",
      `تم الانتهاء من الطلب رقم ${order.request_number || order.customer_name} بنجاح.`,
      orderId
    );
  }

  const updated = await readServiceOrderById(env, orderId);
  return json({ order: updated }, 200, request, env);
}

async function requestServiceOrderClosure(request, id, env) {
  const user = await requireRoles(request, env, ["technician"]);
  if (!user) {
    return json({ message: "Technician access required" }, 403, request, env);
  }

  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return json({ message: "Invalid order id" }, 400, request, env);
  }

  const order = await env.DB.prepare(
    `SELECT
      o.id, o.customer_name, o.status, o.audit_log_json, o.zamil_closure_status, o.standard_duration_minutes,
      o.work_started_at, o.completion_note, o.delay_reason, o.delay_note,
      t.user_id AS technician_user_id, t.name AS technician_name
     FROM service_orders o
     LEFT JOIN technicians t ON t.id = o.technician_id
     WHERE o.id = ?`
  )
    .bind(orderId)
    .first();

  if (!order) {
    return json({ message: "Order not found" }, 404, request, env);
  }

  if (Number(order.technician_user_id) !== Number(user.sub)) {
    return json({ message: "This order is not assigned to you" }, 403, request, env);
  }

  if (["completed", "canceled", "suspended"].includes(String(order.status || ""))) {
    return json({ message: "This order cannot enter the closure flow" }, 409, request, env);
  }

  const photoCountRow = await env.DB.prepare(
    "SELECT COUNT(*) AS count FROM service_order_photos WHERE order_id = ?"
  )
    .bind(orderId)
    .first();

  if (Number(photoCountRow?.count || 0) < 1) {
    return json({ message: "Upload at least one proof photo before requesting the OTP" }, 400, request, env);
  }

  const body = await readJson(request);
  const completionNote = String(body.completionNote || "").trim();
  const delayReason = String(body.delayReason || "").trim();
  const delayNote = String(body.delayNote || "").trim();
  const workStartedAt = order.work_started_at || new Date().toISOString();
  const elapsedMinutes = calculateElapsedMinutes(workStartedAt, null);
  const standardDurationMinutes = Math.max(1, Number(order.standard_duration_minutes) || 120);

  if (elapsedMinutes > standardDurationMinutes && !delayReason) {
    return json({ message: "Delay reason is required before closing an overdue task" }, 400, request, env);
  }

  const requestedAt = new Date().toISOString();
  const nextAuditLog = normalizeAuditLogEntries([
    ...parseJsonArray(order.audit_log_json),
    {
      type: "zamil_request",
      actor: "technician",
      message: "طلب الفني بدء إغلاق الزامل",
      createdAt: requestedAt,
    },
  ]);

  await env.DB.prepare(
    `UPDATE service_orders
     SET status = ?, work_started_at = ?, completion_note = ?, delay_reason = ?, delay_note = ?, zamil_closure_status = 'requested',
         zamil_close_requested_at = ?, zamil_otp_code = '', zamil_otp_submitted_at = NULL, zamil_closed_at = NULL,
         approval_status = 'pending', proof_status = 'pending_review', audit_log_json = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  )
    .bind(
      ["pending", "scheduled"].includes(String(order.status || "")) ? "in_transit" : String(order.status || "in_transit"),
      workStartedAt,
      completionNote,
      delayReason,
      delayNote,
      requestedAt,
      JSON.stringify(nextAuditLog),
      orderId
    )
    .run();

  const updated = await readServiceOrderById(env, orderId);
  return json({ order: updated }, 200, request, env);
}

async function submitServiceOrderClosureOtp(request, id, env) {
  const user = await requireRoles(request, env, ["technician"]);
  if (!user) {
    return json({ message: "Technician access required" }, 403, request, env);
  }

  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return json({ message: "Invalid order id" }, 400, request, env);
  }

  const order = await env.DB.prepare(
    `SELECT
      o.id, o.customer_name, o.audit_log_json, o.zamil_closure_status,
      t.user_id AS technician_user_id, t.name AS technician_name
     FROM service_orders o
     LEFT JOIN technicians t ON t.id = o.technician_id
     WHERE o.id = ?`
  )
    .bind(orderId)
    .first();

  if (!order) {
    return json({ message: "Order not found" }, 404, request, env);
  }

  if (Number(order.technician_user_id) !== Number(user.sub)) {
    return json({ message: "This order is not assigned to you" }, 403, request, env);
  }

  if (!["requested", "otp_submitted"].includes(String(order.zamil_closure_status || "idle"))) {
    return json({ message: "Request the Zamil OTP first" }, 409, request, env);
  }

  const body = await readJson(request);
  const otpCode = String(body.otpCode || "")
    .replace(/\s+/g, "")
    .trim();

  if (!otpCode) {
    return json({ message: "OTP code is required" }, 400, request, env);
  }

  const submittedAt = new Date().toISOString();
  const nextAuditLog = normalizeAuditLogEntries([
    ...parseJsonArray(order.audit_log_json),
    {
      type: "zamil_otp",
      actor: "technician",
      message: "أرسل الفني رمز OTP للإدارة",
      createdAt: submittedAt,
    },
  ]);

  await env.DB.prepare(
    `UPDATE service_orders
     SET zamil_closure_status = 'otp_submitted', zamil_otp_code = ?, zamil_otp_submitted_at = ?,
         audit_log_json = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  )
    .bind(otpCode, submittedAt, JSON.stringify(nextAuditLog), orderId)
    .run();

  const updated = await readServiceOrderById(env, orderId);
  return json({ order: updated }, 200, request, env);
}

async function approveServiceOrderClosure(request, id, env) {
  const admin = await requireAdmin(request, env);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
  }

  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return json({ message: "Invalid order id" }, 400, request, env);
  }

  const order = await env.DB.prepare(
    `SELECT
      o.id, o.customer_name, o.audit_log_json, o.zamil_closure_status, o.technician_id,
      t.user_id AS technician_user_id, t.name AS technician_name,
      u.name AS technician_user_name
     FROM service_orders o
     LEFT JOIN technicians t ON t.id = o.technician_id
     LEFT JOIN users u ON u.id = t.user_id
     WHERE o.id = ?`
  )
    .bind(orderId)
    .first();

  if (!order) {
    return json({ message: "Order not found" }, 404, request, env);
  }

  if (String(order.zamil_closure_status || "idle") !== "otp_submitted") {
    return json({ message: "OTP has not been submitted yet" }, 409, request, env);
  }

  const approvedAt = new Date().toISOString();
  const adminName = String(admin.name || admin.email || "admin").trim();
  const nextAuditLog = normalizeAuditLogEntries([
    ...parseJsonArray(order.audit_log_json),
    {
      type: "zamil_closed",
      actor: "admin",
      message: "اعتمدت الإدارة إغلاق الطلب بعد قبول OTP في بوابة الزامل",
      createdAt: approvedAt,
    },
  ]);

  await env.DB.prepare(
    `UPDATE service_orders
     SET status = 'completed', approval_status = 'approved', proof_status = 'approved', approved_at = ?, approved_by = ?,
         exception_status = 'none', zamil_closure_status = 'closed', zamil_closed_at = ?, audit_log_json = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  )
    .bind(approvedAt, adminName, approvedAt, JSON.stringify(nextAuditLog), orderId)
    .run();

  if (order.technician_user_id) {
    await createNotification(
      env,
      order.technician_user_id,
      "تم إغلاق المهمة",
      `تم اعتماد الطلب #${orderId} ويمكنك مغادرة الموقع الآن.`,
      "status_update",
      orderId
    );
  }

  const updated = await readServiceOrderById(env, orderId);
  return json({ order: updated }, 200, request, env);
}

async function updateServiceOrderExtras(request, id, env) {
  const user = await requireRoles(request, env, ["admin", "technician"]);
  if (!user) {
    return json({ message: "Unauthorized" }, 401, request, env);
  }

  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return json({ message: "Invalid order id" }, 400, request, env);
  }

  const body = await readJson(request);
  const copperMeters = Math.max(0, Number(body.copperMeters) || 0);
  const baseIncluded = body.baseIncluded ? 1 : 0;
  const existing = await env.DB.prepare(
    `SELECT o.id, o.service_items_json, t.user_id AS technician_user_id
     FROM service_orders o
     LEFT JOIN technicians t ON t.id = o.technician_id
     WHERE o.id = ?`
  )
    .bind(orderId)
    .first();

  if (!existing) {
    return json({ message: "Order not found" }, 404, request, env);
  }

  if (user.role === "technician" && Number(existing.technician_user_id) !== Number(user.sub)) {
    return json({ message: "This order is not assigned to you" }, 403, request, env);
  }

  const extrasTotal =
    calculateExtrasTotal(copperMeters, Boolean(baseIncluded)) +
    calculateServiceItemsTotal(parseStoredServiceItems(existing.service_items_json));

  await env.DB.prepare(
    `UPDATE service_orders
     SET copper_meters = ?, base_included = ?, extras_total = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  )
    .bind(copperMeters, baseIncluded, extrasTotal, orderId)
    .run();

  const order = await readServiceOrderById(env, orderId);
  return json({ order }, 200, request, env);
}

async function uploadServiceOrderPhoto(request, id, env) {
  const user = await requireRoles(request, env, ["admin", "technician"]);
  if (!user) {
    return json({ message: "Unauthorized" }, 401, request, env);
  }

  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return json({ message: "Invalid order id" }, 400, request, env);
  }

  const body = await readJson(request);
  const name = String(body.name || "").trim();
  const url = String(body.url || "").trim();

  if (!name || !url) {
    return json({ message: "Photo name and url are required" }, 400, request, env);
  }

  await env.DB.prepare(
    "INSERT INTO service_order_photos (order_id, image_name, image_url, uploaded_by_user_id) VALUES (?, ?, ?, ?)"
  )
    .bind(orderId, name, url, Number(user.sub))
    .run();

  const order = await readServiceOrderById(env, orderId);
  return json({ order }, 201, request, env);
}

async function listNotifications(request, env) {
  const user = await readActiveUser(request, env);
  if (!user) {
    return json({ message: "Unauthorized" }, 401, request, env);
  }

  const sinceId = Number(new URL(request.url).searchParams.get("sinceId") || 0);

  const statement =
    sinceId > 0
      ? env.DB.prepare(
          `SELECT id, title, body, kind, related_order_id, is_read, created_at
           FROM notifications
           WHERE user_id = ? AND (target_role = '' OR target_role = ?) AND id > ?
           ORDER BY id DESC
           LIMIT 40`
        ).bind(Number(user.sub), user.role, sinceId)
      : env.DB.prepare(
          `SELECT id, title, body, kind, related_order_id, is_read, created_at
           FROM notifications
           WHERE user_id = ? AND (target_role = '' OR target_role = ?)
           ORDER BY id DESC
           LIMIT 40`
        ).bind(Number(user.sub), user.role);

  const { results } = await statement.all();
  const items = (results || []).map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    kind: row.kind,
    relatedOrderId: row.related_order_id,
    isRead: Boolean(row.is_read),
    createdAt: row.created_at,
  }));

  return json(
    {
      notifications: items,
      unreadCount: items.filter((item) => !item.isRead).length,
    },
    200,
    request,
    env
  );
}

async function markNotificationRead(request, id, env) {
  const user = await readActiveUser(request, env);
  if (!user) {
    return json({ message: "Unauthorized" }, 401, request, env);
  }

  await env.DB.prepare(
    "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ? AND (target_role = '' OR target_role = ?)"
  )
    .bind(Number(id), Number(user.sub), user.role)
    .run();

  return json({ ok: true }, 200, request, env);
}

async function markAllNotificationsRead(request, env) {
  const user = await readActiveUser(request, env);
  if (!user) {
    return json({ message: "Unauthorized" }, 401, request, env);
  }

  await env.DB.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ? AND (target_role = '' OR target_role = ?)")
    .bind(Number(user.sub), user.role)
    .run();

  return json({ ok: true }, 200, request, env);
}

async function readTechnicians(env) {
  const { results } = await env.DB.prepare(
    `SELECT
      t.id,
      t.user_id,
      t.name,
      t.phone,
      t.zone,
      t.coverage_json,
      t.status,
      COALESCE(t.notes, '') AS notes,
      COALESCE(t.excel_technician_code, '') AS excel_technician_code,
      u.email
     FROM technicians t
     LEFT JOIN users u ON u.id = t.user_id
     ORDER BY t.id ASC`
  ).all();

  return (results || []).map(mapTechnician);
}

function mapTechnician(row) {
  const coverageKeys = normalizeTechnicianCoverageKeys(row.coverage_json || row.zone || "");
  const primaryCoverageKey = coverageKeys[0] || normalizeTechnicianCoverageKey(row.zone);
  const coverageConfig = getTechnicianCoverageByKey(primaryCoverageKey);

  return {
    id: String(row.id),
    userId: String(row.user_id),
    name: row.name,
    email: row.email || "",
    phone: row.phone,
    region: coverageConfig ? coverageConfig.ar : row.zone,
    zone: coverageConfig ? coverageConfig.key : row.zone,
    coverageKeys,
    coverageLabelsAr: coverageKeys.map((item) => getTechnicianCoverageByKey(item)?.ar || item),
    coverageLabelsEn: coverageKeys.map((item) => getTechnicianCoverageByKey(item)?.en || item),
    coverageType: coverageConfig?.type || "custom",
    coverageLabelAr: coverageConfig?.ar || row.zone,
    coverageLabelEn: coverageConfig?.en || row.zone,
    status: row.status,
    notes: row.notes || "",
    excelTechnicianCode: normalizeExcelTechnicianCode(row.excel_technician_code),
  };
}

function normalizeExcelTechnicianCode(value) {
  const rawValue = String(value || "").trim().toUpperCase();
  if (!rawValue) {
    return "";
  }

  const parsedAssignment = parseTechnicianAssignment(`* ${rawValue} - by:`);
  return String(parsedAssignment.techId || rawValue).trim().toUpperCase();
}

async function readTechnicianExcelCodeLookup(env) {
  try {
    const { results } = await env.DB.prepare(
      `SELECT
         id,
         user_id,
         name,
         COALESCE(excel_technician_code, '') AS excel_technician_code
       FROM technicians`
    ).all();

    return new Map(
      (results || [])
        .map((row) => {
          const excelTechnicianCode = normalizeExcelTechnicianCode(row.excel_technician_code);
          if (!excelTechnicianCode) {
            return null;
          }

          return [
            excelTechnicianCode,
            {
              id: Number(row.id),
              userId: Number(row.user_id),
              name: String(row.name || "").trim(),
              excelTechnicianCode,
            },
          ];
        })
        .filter(Boolean)
    );
  } catch (error) {
    const message = String(error?.message || error || "").toLowerCase();
    if (message.includes("no such column") && message.includes("excel_technician_code")) {
      return new Map();
    }

    throw error;
  }
}

function resolveLinkedTechnicianFromImportedAssignment(normalized = {}, technicianCodeLookup = new Map()) {
  const assignment = readImportedTechnicianAssignment(normalized);
  const exactExcelTechnicianCode = normalizeExcelTechnicianCode(
    assignment.techId || normalized.excelTechnicianCode || normalized.techId || extractImportReferenceValue({ notes: normalized.notes }, "Tech ID")
  );
  const shortExcelTechnicianCode = normalizeExcelTechnicianCode(
    assignment.techCode || extractImportReferenceValue({ notes: normalized.notes }, "Tech Code")
  );
  const technician =
    (exactExcelTechnicianCode ? technicianCodeLookup.get(exactExcelTechnicianCode) || null : null) ||
    (shortExcelTechnicianCode ? technicianCodeLookup.get(shortExcelTechnicianCode) || null : null);

  return {
    assignment,
    excelTechnicianCode: exactExcelTechnicianCode || shortExcelTechnicianCode,
    technician,
  };
}

function normalizeTechnicianCoverageKeys(value) {
  const input = Array.isArray(value)
    ? value
    : typeof value === "string" && value.trim().startsWith("[")
      ? parseJsonArray(value)
      : String(value || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

  return Array.from(
    new Set(
      (Array.isArray(input) ? input : [])
        .map((item) => normalizeTechnicianCoverageKey(item))
        .filter(Boolean)
    )
  );
}

function normalizeTechnicianStatus(status) {
  return ["available", "busy"].includes(String(status || "").trim()) ? String(status).trim() : "available";
}

function normalizeServerRole(role) {
  return String(role || "").trim();
}

function normalizeRoleList(roles = []) {
  return Array.from(
    new Set(
      (Array.isArray(roles) ? roles : [roles])
        .map((role) => normalizeServerRole(role))
        .filter((role) => Boolean(role) && role !== "customer_service")
    )
  );
}

function resolveRequestedWorkspaceRole(requestedRole, availableRoles = []) {
  const normalizedRoles = normalizeRoleList(availableRoles);
  const normalizedRequestedRole = normalizeServerRole(requestedRole);

  if (normalizedRequestedRole && normalizedRoles.includes(normalizedRequestedRole)) {
    return normalizedRequestedRole;
  }

  if (normalizedRoles.includes("admin")) {
    return "admin";
  }

  if (normalizedRoles.includes("operations_manager")) {
    return "operations_manager";
  }

  return normalizedRoles[0] || "";
}

function isMissingUserWorkspaceRolesTableError(error) {
  return String(error?.message || error || "").toLowerCase().includes("user_workspace_roles");
}

async function readUserWorkspaceRoles(env, userId, baseRole = "") {
  const fallbackRoles = normalizeRoleList([baseRole]);

  if (!Number(userId)) {
    return fallbackRoles;
  }

  try {
    const { results } = await env.DB.prepare("SELECT role FROM user_workspace_roles WHERE user_id = ? ORDER BY role ASC")
      .bind(Number(userId))
      .all();

    return normalizeRoleList([baseRole, ...(results || []).map((row) => row.role)]);
  } catch (error) {
    if (isMissingUserWorkspaceRolesTableError(error)) {
      return fallbackRoles;
    }

    throw error;
  }
}

function normalizeSaudiPhoneNumber(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) {
    return "";
  }

  if (digits.startsWith("966")) {
    return `0${digits.slice(3)}`;
  }

  if (digits.startsWith("5") && digits.length === 9) {
    return `0${digits}`;
  }

  if (digits.startsWith("0")) {
    return digits;
  }

  return digits.length === 9 ? `0${digits}` : digits;
}

function normalizeDeliveryType(value) {
  const normalized = String(value || "none").trim().toLowerCase();
  return ["none", "standard", "express_24h"].includes(normalized) ? normalized : "none";
}

function normalizeImportedOrderStatus(value) {
  const normalized = String(value || "pending").trim().toLowerCase();
  if (["canceled", "cancelled"].includes(normalized)) {
    return "canceled";
  }
  if (["completed", "done"].includes(normalized)) {
    return "completed";
  }
  if (["scheduled", "assigned", "in_progress", "in progress"].includes(normalized)) {
    return "scheduled";
  }
  return "pending";
}

function normalizeOrderReferenceKey(value) {
  return String(value || "").trim().toUpperCase();
}

function escapeNoteLabel(label) {
  return String(label || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractImportReferenceValue(source, label) {
  const directValue = String(source?.[label] || source?.[`${label}Id`] || source?.importMeta?.[label] || "").trim();
  if (directValue) {
    return directValue;
  }

  const text = String(source?.notes || "").trim();
  if (!text) {
    return "";
  }

  const match = text.match(new RegExp(`(?:^|\\n)${escapeNoteLabel(label)}\\s*:\\s*(.+?)(?:\\n|$)`, "i"));
  return String(match?.[1] || "").trim();
}

function upsertStructuredNoteLine(text, label, value) {
  const pattern = new RegExp(`^${escapeNoteLabel(label)}\\s*:`, "i");
  const lines = String(text || "")
    .split(/\n+/)
    .map((line) => String(line || "").trim())
    .filter(Boolean)
    .filter((line) => !pattern.test(line));
  const normalizedValue = String(value || "").trim();

  if (normalizedValue) {
    lines.push(`${label}: ${normalizedValue}`);
  }

  return lines.join("\n");
}

function normalizeServiceOrderNotes(notes, references = {}) {
  let nextNotes = String(notes || "").trim();
  nextNotes = upsertStructuredNoteLine(nextNotes, "SO ID", references.soId);
  nextNotes = upsertStructuredNoteLine(nextNotes, "WO ID", references.woId);
  return nextNotes;
}

function readServiceOrderReferenceIds(source = {}) {
  const requestNumber = String(source.requestNumber || source.request_number || "").trim();
  const soId = String(
    source.soId ||
      extractImportReferenceValue(source, "soId") ||
      extractImportReferenceValue(source, "SO ID") ||
      requestNumber
  ).trim();
  const woId = String(
    source.woId || extractImportReferenceValue(source, "woId") || extractImportReferenceValue(source, "WO ID") || ""
  ).trim();

  return {
    requestNumber,
    soId,
    woId,
  };
}

async function readServiceOrderReferenceRegistry(env, excludeOrderId = null, options = {}) {
  const includeArchived = options?.includeArchived === true;
  const statement =
    excludeOrderId === null
      ? env.DB.prepare("SELECT id, customer_name, request_number, notes FROM service_orders")
      : env.DB.prepare("SELECT id, customer_name, request_number, notes FROM service_orders WHERE id != ?").bind(
          Number(excludeOrderId)
        );
  const { results } = await statement.all();
  const registry = {
    requestNumbers: new Map(),
    soIds: new Map(),
    woIds: new Map(),
  };

  for (const row of results || []) {
    registerOrderReferenceIds(registry, row, {
      orderId: Number(row.id),
      customerName: String(row.customer_name || "").trim(),
      scope: "active",
    });
  }

  if (includeArchived) {
    let archivedRows = { results: [] };
    try {
      const archivedStatement = env.DB.prepare(
        "SELECT id, original_order_id, customer_name, request_number, notes FROM service_order_archives ORDER BY id DESC"
      );
      archivedRows = await archivedStatement.all();
    } catch (error) {
      if (!isMissingArchiveTableError(error)) {
        throw error;
      }
    }

    for (const row of archivedRows.results || []) {
      registerOrderReferenceIds(registry, row, {
        orderId: Number(row.original_order_id || 0),
        archiveId: Number(row.id),
        originalOrderId: Number(row.original_order_id || 0),
        customerName: String(row.customer_name || "").trim(),
        scope: "archived",
      });
    }
  }
  return registry;
}

function isMissingArchiveTableError(error) {
  const message = String(error?.message || error || "").toLowerCase();
  return message.includes("service_order_archives") && (
    message.includes("no such table") ||
    message.includes("does not exist") ||
    message.includes("unknown table")
  );
}

function registerOrderReferenceIds(registry, source = {}, entry = {}) {
  const refs = readServiceOrderReferenceIds(source);
  const payload = {
    orderId: Number(entry.orderId || source.id || 0),
    archiveId: Number(entry.archiveId || 0) || null,
    originalOrderId: Number(entry.originalOrderId || 0) || null,
    scope: String(entry.scope || "active"),
    customerName: String(entry.customerName || source.customer_name || source.customerName || "").trim(),
    requestNumber: refs.requestNumber,
    soId: refs.soId,
    woId: refs.woId,
  };
  const mappings = [
    ["requestNumbers", refs.requestNumber],
    ["soIds", refs.soId],
    ["woIds", refs.woId],
  ];

  for (const [bucket, value] of mappings) {
    const normalizedKey = normalizeOrderReferenceKey(value);
    if (!normalizedKey || registry[bucket].has(normalizedKey)) {
      continue;
    }

    registry[bucket].set(normalizedKey, {
      ...payload,
      value: String(value || "").trim(),
    });
  }
}

function findDuplicateOrderReference(registry, source = {}) {
  const refs = readServiceOrderReferenceIds(source);
  const checks = [
    ["woIds", refs.woId, "woId"],
    ["soIds", refs.soId, "soId"],
    ["requestNumbers", refs.requestNumber, "requestNumber"],
  ];

  for (const [bucket, value, field] of checks) {
    const normalizedKey = normalizeOrderReferenceKey(value);
    if (!normalizedKey) {
      continue;
    }

    const conflict = registry[bucket]?.get(normalizedKey);
    if (conflict) {
      return {
        ...conflict,
        field,
      };
    }
  }

  return null;
}

function buildDuplicateOrderMessage(conflict) {
  if (!conflict) {
    return "Duplicate order reference detected";
  }

  if (conflict.field === "woId") {
    return `WO ID already exists: ${conflict.value}`;
  }

  if (conflict.field === "soId") {
    return `SO ID already exists: ${conflict.value}`;
  }

  return `Request number already exists: ${conflict.value}`;
}

function isFastDeliveryCity(city) {
  return FAST_DELIVERY_CITIES.includes(String(city || "").trim());
}

function normalizeServiceItems(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item) => {
      const id = String(item?.id || "").trim();
      const description = String(item?.description || "").trim();
      const price = Number(item?.price ?? 0) || 0;
      const unit = String(item?.unit || "").trim();
      const quantity = Math.max(1, Number(item?.quantity) || 1);
      const totalPrice = Number(item?.totalPrice ?? price * quantity) || 0;

      if (!id || !description || price <= 0) {
        return null;
      }

      return {
        id,
        description,
        price,
        unit,
        quantity,
        totalPrice,
      };
    })
    .filter(Boolean);
}

function parseStoredServiceItems(rawValue) {
  try {
    return normalizeServiceItems(JSON.parse(rawValue || "[]"));
  } catch {
    return [];
  }
}

function calculateServiceItemsTotal(items = []) {
  return normalizeServiceItems(items).reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
}

function normalizeAuditLogEntries(entries) {
  return (Array.isArray(entries) ? entries : [])
    .map((entry, index) => {
      const message = String(entry?.message || "").trim();
      if (!message) {
        return null;
      }

      return {
        id:
          String(entry?.id || "").trim() ||
          `audit-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
        type: String(entry?.type || "note").trim() || "note",
        actor: String(entry?.actor || "system").trim() || "system",
        message,
        createdAt: String(entry?.createdAt || new Date().toISOString()).trim() || new Date().toISOString(),
      };
    })
    .filter(Boolean);
}

function extractExcelStatusFromNotes(notes) {
  const text = String(notes || "");
  const match = text.match(/(?:^|\n)Excel status:\s*(.+?)(?:\n|$)/i);
  return String(match?.[1] || "").trim();
}

async function readServiceOrders(env) {
  const areaClusters = await readInternalAreaClusters(env);
  const { results } = await env.DB.prepare(
    `SELECT
      o.id, o.customer_name, o.request_number, o.phone, o.secondary_phone, o.whatsapp_phone, o.district, o.city, o.address,
      o.address_text, o.landmark, o.map_link, o.ac_type, o.service_category,
      o.standard_duration_minutes, o.work_started_at, o.completion_note, o.delay_reason, o.delay_note,
      o.work_type, o.ac_count, o.status, o.priority, o.delivery_type, o.preferred_date, o.preferred_time, o.scheduled_date, o.scheduled_time,
      o.coordination_note, o.source, o.notes, o.customer_action, o.reschedule_reason, o.cancellation_reason, o.canceled_at,
      o.completed_at, o.approval_status,
      o.proof_status, o.approved_at, o.approved_by, o.client_signature, o.zamil_closure_status, o.zamil_close_requested_at,
      o.zamil_otp_code, o.zamil_otp_submitted_at, o.zamil_closed_at, o.suspension_reason, o.suspension_note,
      o.suspended_at, o.exception_status, o.audit_log_json, o.copper_meters, o.base_included, o.extras_total,
      o.service_items_json, o.created_at, o.updated_at,
      t.id AS technician_id, t.name AS technician_name, t.user_id AS technician_user_id
     FROM service_orders o
     LEFT JOIN technicians t ON t.id = o.technician_id
     ORDER BY o.id DESC`
  ).all();

  const photosByOrderId = await readServiceOrderPhotosByOrderIds(
    env,
    (results || []).map((row) => row.id)
  );

  return (results || []).map((row) =>
    mapServiceOrderRow(row, areaClusters, photosByOrderId.get(Number(row.id)) || [])
  );
}

async function readServiceOrderById(env, orderId) {
  const areaClusters = await readInternalAreaClusters(env);
  const row = await env.DB.prepare(
    `SELECT
      o.id, o.customer_name, o.request_number, o.phone, o.secondary_phone, o.whatsapp_phone, o.district, o.city, o.address,
      o.address_text, o.landmark, o.map_link, o.ac_type, o.service_category,
      o.standard_duration_minutes, o.work_started_at, o.completion_note, o.delay_reason, o.delay_note,
      o.work_type, o.ac_count, o.status, o.priority, o.delivery_type, o.preferred_date, o.preferred_time, o.scheduled_date, o.scheduled_time,
      o.coordination_note, o.source, o.notes, o.customer_action, o.reschedule_reason, o.cancellation_reason, o.canceled_at,
      o.completed_at, o.approval_status,
      o.proof_status, o.approved_at, o.approved_by, o.client_signature, o.zamil_closure_status, o.zamil_close_requested_at,
      o.zamil_otp_code, o.zamil_otp_submitted_at, o.zamil_closed_at, o.suspension_reason, o.suspension_note,
      o.suspended_at, o.exception_status, o.audit_log_json, o.copper_meters, o.base_included, o.extras_total,
      o.service_items_json, o.created_at, o.updated_at,
      t.id AS technician_id, t.name AS technician_name, t.user_id AS technician_user_id
     FROM service_orders o
     LEFT JOIN technicians t ON t.id = o.technician_id
     WHERE o.id = ?`
  )
    .bind(Number(orderId))
    .first();

  if (!row) {
    return null;
  }

  const photosByOrderId = await readServiceOrderPhotosByOrderIds(env, [row.id]);
  return mapServiceOrderRow(row, areaClusters, photosByOrderId.get(Number(row.id)) || []);
}

async function readServiceOrderPhotosByOrderIds(env, orderIds = []) {
  const normalizedOrderIds = Array.from(
    new Set(
      (orderIds || [])
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0)
    )
  );

  const photosByOrderId = new Map();
  if (!normalizedOrderIds.length) {
    return photosByOrderId;
  }

  for (let index = 0; index < normalizedOrderIds.length; index += 50) {
    const chunk = normalizedOrderIds.slice(index, index + 50);
    const placeholders = chunk.map(() => "?").join(", ");
    const statement = env.DB.prepare(
      `SELECT id, order_id, image_name, image_url, created_at
       FROM service_order_photos
       WHERE order_id IN (${placeholders})
       ORDER BY id DESC`
    ).bind(...chunk);
    const { results } = await statement.all();

    for (const photo of results || []) {
      const orderId = Number(photo.order_id);
      if (!photosByOrderId.has(orderId)) {
        photosByOrderId.set(orderId, []);
      }
      photosByOrderId.get(orderId).push(photo);
    }
  }

  return photosByOrderId;
}

function mapServiceOrderRow(row, areaClusters = [], photos = []) {
  const references = readServiceOrderReferenceIds({
    request_number: row.request_number,
    notes: row.notes,
  });
  const importedTechnician = readImportedTechnicianAssignment({ notes: row.notes });

  return {
    id: `ORD-${row.id}`,
    numericId: row.id,
    requestNumber: row.request_number || row.customer_name,
    soId: references.soId,
    woId: references.woId,
    customerName: row.customer_name,
    email: extractImportReferenceValue(row, "Email"),
    phone: row.phone,
    secondaryPhone: row.secondary_phone || "",
    whatsappPhone: row.whatsapp_phone || row.phone,
    district: row.district || "",
    city: row.city || "",
    ...resolveInternalAreaCluster({ city: row.city, district: row.district }, areaClusters),
    addressText: row.address_text || "",
    landmark: row.landmark || "",
    mapLink: row.map_link || row.address,
    address: row.address,
    acType: row.ac_type,
    serviceCategory: row.service_category || "split_installation",
    standardDurationMinutes: Math.max(1, Number(row.standard_duration_minutes) || 120),
    workStartedAt: row.work_started_at,
    completionNote: row.completion_note || "",
    delayReason: row.delay_reason || "",
    delayNote: row.delay_note || "",
    workType: row.work_type || "",
    acCount: Number(row.ac_count || 1),
    status: row.status,
    externalStatus: extractExcelStatusFromNotes(row.notes),
    priority: row.priority || "normal",
    deliveryType: normalizeDeliveryType(row.delivery_type),
    preferredDate: row.preferred_date || row.scheduled_date,
    preferredTime: row.preferred_time || row.scheduled_time || "",
    pickupDate: extractImportReferenceValue(row, "Pickup date"),
    installationDate: extractImportReferenceValue(row, "Installation date"),
    scheduledDate: row.scheduled_date,
    scheduledTime: row.scheduled_time || "",
    coordinationNote: row.coordination_note || "",
    source: row.source || "manual",
    sourceChannel: row.source || "manual",
    notes: row.notes,
    customerAction: row.customer_action || "none",
    rescheduleReason: row.reschedule_reason || "",
    cancellationReason: row.cancellation_reason || "",
    canceledAt: row.canceled_at,
    completedAt: row.completed_at || row.updated_at,
    approvalStatus: row.approval_status || "pending",
    proofStatus: row.proof_status || "pending_review",
    approvedAt: row.approved_at,
    approvedBy: row.approved_by || "",
    clientSignature: row.client_signature || "",
    zamilClosureStatus: row.zamil_closure_status || "idle",
    zamilCloseRequestedAt: row.zamil_close_requested_at,
    zamilOtpCode: row.zamil_otp_code || "",
    zamilOtpSubmittedAt: row.zamil_otp_submitted_at,
    zamilClosedAt: row.zamil_closed_at,
    suspensionReason: row.suspension_reason || "",
    suspensionNote: row.suspension_note || "",
    suspendedAt: row.suspended_at,
    exceptionStatus: row.exception_status || "none",
    auditLog: parseJsonArray(row.audit_log_json),
    technicianId: row.technician_id ? String(row.technician_id) : "",
    technicianName: row.technician_name || "غير معين",
    withinSLA: extractImportReferenceValue(row, "Completed within SLA"),
    exceedSLA: extractImportReferenceValue(row, "Completed Exceed SLA"),
    courier: extractImportReferenceValue(row, "Courier"),
    courierNum: extractImportReferenceValue(row, "Courier number"),
    chatLog: extractImportReferenceValue(row, "Chat Log") || extractImportReferenceValue(row, "Chat message"),
    techId: importedTechnician.techId || "",
    areaCode: importedTechnician.areaCode || "",
    techCode: importedTechnician.techCode || "",
    areaName: importedTechnician.areaName || extractImportReferenceValue(row, "Area Name"),
    techShortName: importedTechnician.techShortName || extractImportReferenceValue(row, "Tech Short Name"),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    acDetails: (() => {
      try {
        return JSON.parse(row.service_items_json || "[]")
          .map((item, index) => ({
            id: String(item?.id || `ac-${row.id}-${index}`),
            type: String(item?.type || item?.description || "").trim().toLowerCase(),
            quantity: Math.max(1, Number(item?.quantity) || 1),
          }))
          .filter((item) => item.type);
      } catch {
        return [];
      }
    })(),
    extras: {
      copperMeters: Number(row.copper_meters || 0),
      baseIncluded: Boolean(row.base_included),
      totalPrice: Number(row.extras_total || 0),
    },
    serviceItems: (() => {
      try {
        return normalizeServiceItems(JSON.parse(row.service_items_json || "[]"));
      } catch {
        return [];
      }
    })(),
    photos: (photos || []).map((photo) => ({
      id: `photo-${photo.id}`,
      name: photo.image_name,
      url: photo.image_url,
      uploadedAt: photo.created_at,
    })),
  };
}

async function readOperationsSummary(env) {
  const row = await env.DB.prepare(
    `SELECT
      SUM(CASE WHEN status = 'canceled' THEN 0 ELSE 1 END) AS total_orders,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_orders,
      SUM(CASE WHEN status IN ('scheduled', 'in_transit') THEN 1 ELSE 0 END) AS active_orders,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_orders,
      SUM(CASE WHEN status = 'in_transit' THEN 1 ELSE 0 END) AS in_transit_orders,
      SUM(CASE WHEN status = 'canceled' THEN 1 ELSE 0 END) AS canceled_orders,
      SUM(CASE WHEN status IN ('canceled', 'completed') THEN 0 ELSE COALESCE(ac_count, 0) END) AS total_devices
     FROM service_orders`
  ).first();

  return {
    totalOrders: Number(row?.total_orders || 0),
    pendingOrders: Number(row?.pending_orders || 0),
    activeOrders: Number(row?.active_orders || 0),
    completedOrders: Number(row?.completed_orders || 0),
    inTransitOrders: Number(row?.in_transit_orders || 0),
    canceledOrders: Number(row?.canceled_orders || 0),
    totalDevices: Number(row?.total_devices || 0),
  };
}

function buildOperationsSummary(orders, technicians) {
  return orders.reduce(
    (summary, order) => ({
      totalOrders: summary.totalOrders + (order.status === "canceled" ? 0 : 1),
      pendingOrders: summary.pendingOrders + (order.status === "pending" ? 1 : 0),
      activeOrders: summary.activeOrders + (["scheduled", "in_transit"].includes(order.status) ? 1 : 0),
      completedOrders: summary.completedOrders + (order.status === "completed" ? 1 : 0),
      inTransitOrders: summary.inTransitOrders + (order.status === "in_transit" ? 1 : 0),
      canceledOrders: summary.canceledOrders + (order.status === "canceled" ? 1 : 0),
      totalDevices:
        summary.totalDevices +
        (["canceled", "completed"].includes(order.status) ? 0 : Math.max(0, Number(order.acCount || order.ac_count) || 0)),
    }),
    {
      totalOrders: 0,
      pendingOrders: 0,
      activeOrders: 0,
      completedOrders: 0,
      inTransitOrders: 0,
      canceledOrders: 0,
      totalDevices: 0,
    }
  );
}

function formatManualOrderDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  const normalized = String(value || "").trim();
  if (!normalized) {
    return "";
  }

  const dayFirstMatch = normalized.match(/^(\d{1,2})-(\d{1,2})-(\d{4})(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?$/);
  if (dayFirstMatch) {
    const [, day, month, year] = dayFirstMatch;
    return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const yearFirstMatch = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?$/);
  if (yearFirstMatch) {
    const [, year, month, day] = yearFirstMatch;
    return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  return normalized;
}

function buildManualOrderMapsLink(addressText) {
  const query = String(addressText || "").trim();
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : "";
}

function extractManualOrderDistrict(addressText, city) {
  const normalizedCity = String(city || "").trim().toLowerCase();
  const parts = String(addressText || "")
    .replace(/^.*?\s-\s*/, "")
    .split(",")
    .map((part) => String(part || "").trim())
    .filter(Boolean);

  if (!parts.length) {
    return String(city || "").trim();
  }

  const cityIndex = parts.findIndex((part) => String(part || "").trim().toLowerCase() === normalizedCity);
  if (cityIndex > 0) {
    return parts[cityIndex - 1];
  }

  return parts[1] || parts[0] || String(city || "").trim();
}

function inferManualOrderAcType(value) {
  const text = String(value || "").trim().toLowerCase();
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
}

function buildManualOrderAcDetails(devList = [], fallbackCount = 1) {
  const counts = new Map();
  for (const deviceName of Array.isArray(devList) ? devList : []) {
    const type = inferManualOrderAcType(deviceName);
    counts.set(type, (counts.get(type) || 0) + 1);
  }

  if (!counts.size) {
    counts.set("split", Math.max(1, Number(fallbackCount) || 1));
  }

  return Array.from(counts.entries()).map(([type, quantity], index) => ({
    id: `manual-${type}-${index}`,
    type,
    quantity,
  }));
}

function buildManualInstallationOrderNotes(body, parsedOrder) {
  const lines = [
    ["SO ID", parsedOrder.soId],
    ["WO ID", parsedOrder.woId],
    ["Customer", parsedOrder.customer],
    ["Email", body.email],
    ["Phone", parsedOrder.phone],
    ["Delivery date", formatManualOrderDate(body.deliveryDate || parsedOrder.deliveryDate)],
    ["Pickup date", formatManualOrderDate(body.pickupDate || parsedOrder.pickDate)],
    ["Installation date", formatManualOrderDate(body.installationDate || body.instDate)],
    ["Excel status", parsedOrder.status],
    ["Bundled items", body.bundledItems],
    ["Device count", parsedOrder.devCount],
    ["Shipping city", parsedOrder.city],
    ["Shipping address", parsedOrder.address],
    ["Devices", String(body.devices || "").trim().split(/\r?\n/).map((line) => String(line || "").trim()).filter(Boolean).join(" | ")],
    ["Completed within SLA", parsedOrder.withinSLA],
    ["Completed Exceed SLA", parsedOrder.exceedSLA],
    ["Courier", parsedOrder.courier],
    ["Courier number", parsedOrder.courierNum],
    ["Chat Log", String(body.chatLog || body.chat_message || "").trim()],
    ["Tech ID", parsedOrder.techId],
    ["Area Code", parsedOrder.areaCode],
    ["Tech Code", parsedOrder.techCode],
    ["Area Name", parsedOrder.areaName],
    ["Tech Short Name", parsedOrder.techShortName],
  ];

  return normalizeServiceOrderNotes(
    lines
      .map(([label, value]) => [label, String(value || "").trim()])
      .filter(([, value]) => Boolean(value))
      .map(([label, value]) => `${label}: ${value}`)
      .join("\n"),
    {
      idRef: parsedOrder.soId || parsedOrder.woId,
      soId: parsedOrder.soId,
      woId: parsedOrder.woId,
    }
  );
}

function normalizeManualInstallationServiceOrderInput(body) {
  const parsedOrder = normalizeInstallationWorkOrderRow({
    "SO ID": body.soId || body.requestNumber || body["SO ID"] || "",
    "WO ID": body.woId || body["WO ID"] || "",
    Customer: body.customer || body.customerName || body.Customer || "",
    Email: body.email || body.Email || "",
    Phone: body.phone || body.Phone || "",
    "Installation date": body.installationDate || body.instDate || body["Installation date"] || "",
    "Delivery date": body.deliveryDate || body["Delivery date"] || "",
    "Pickup date": body.pickupDate || body["Pickup date"] || "",
    Devices: body.devices || body.Devices || "",
    "Bundled Items": body.bundledItems || body["Bundled Items"] || "",
    Status: body.status || body.Status || "Scheduled",
    "Shipping City": body.shippingCity || body.city || body["Shipping City"] || "",
    "Shipping Address": body.shippingAddress || body.addressText || body["Shipping Address"] || "",
    "Completed within SLA": body.withinSLA || body["Completed within SLA"] || "",
    "Completed Exceed SLA": body.exceedSLA || body["Completed Exceed SLA"] || "",
    Courier: body.courier || body.Courier || "",
    "Courier number": body.courierNum || body["Courier number"] || "",
    "Chat Log": body.chatLog || body["Chat Log"] || body["chat message"] || "",
  });

  const preferredDate = formatManualOrderDate(parsedOrder.deliveryDate || parsedOrder.instDate || parsedOrder.pickDate);
  const acDetails = buildManualOrderAcDetails(parsedOrder.devList, parsedOrder.devCount);
  const district = extractManualOrderDistrict(parsedOrder.address, parsedOrder.city);

  if (!parsedOrder.soId || !parsedOrder.customer || !parsedOrder.phone || !preferredDate || !parsedOrder.city || !parsedOrder.address || !acDetails.length) {
    return {
      error: "SO ID, customer, phone, installation or delivery or pickup date, devices, shipping city, and shipping address are required",
    };
  }

  return {
    requestNumber: parsedOrder.soId,
    idRef: parsedOrder.soId || parsedOrder.woId,
    customerName: parsedOrder.customer,
    phone: parsedOrder.phone,
    secondaryPhone: "",
    whatsappPhone: parsedOrder.phone,
    city: parsedOrder.city,
    district: district || parsedOrder.city,
    addressText: parsedOrder.address,
    landmark: "",
    mapLink: buildManualOrderMapsLink(parsedOrder.address),
    sourceChannel: "Manual Excel-style intake",
    serviceSummary: String(body.devices || "")
      .split(/\r?\n/)
      .map((line) => String(line || "").trim())
      .filter(Boolean)
      .join(" | "),
    importStatus: parsedOrder.status,
    priority: "normal",
    deliveryType: "none",
    preferredDate,
    preferredTime: "09:00",
    notes: buildManualInstallationOrderNotes(body, parsedOrder),
    soId: parsedOrder.soId,
    woId: parsedOrder.woId,
    acDetails,
    primaryAcType: acDetails[0]?.type || "split",
    totalQuantity: Math.max(1, Number(parsedOrder.devCount) || acDetails.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)),
  };
}

function normalizeServiceOrderInput(body) {
  const requestNumber = String(body.requestNumber || "").trim();
  const customerName = String(body.customerName || "").trim();
  const phone = String(body.phone || "").trim();
  const secondaryPhone = String(body.secondaryPhone || "").trim();
  const whatsappPhone = String(body.whatsappPhone || body.phone || "").trim();
  const city = String(body.city || "").trim();
  const district = String(body.district || "").trim();
  const addressText = String(body.addressText || body.address || "").trim();
  const landmark = String(body.landmark || "").trim();
  const mapLink = String(body.mapLink || "").trim();
  const sourceChannel = String(body.sourceChannel || body.source || "الزامل").trim();
  const serviceSummary = String(body.serviceSummary || body.workType || "").trim();
  const deliveryType = normalizeDeliveryType(body.deliveryType);
  const importStatus = normalizeImportedOrderStatus(body.importStatus || body.status);
  const priority = deliveryType === "none" ? String(body.priority || "normal").trim() : "urgent";
  const preferredDate = String(body.preferredDate || body.scheduledDate || "").trim();
  const preferredTime = String(body.preferredTime || body.scheduledTime || "").trim();
  const rawNotes = String(body.notes || "").trim();
  const soId = String(
    body.soId || extractImportReferenceValue(body, "soId") || extractImportReferenceValue(body, "SO ID") || requestNumber
  ).trim();
  const woId = String(
    body.woId || extractImportReferenceValue(body, "woId") || extractImportReferenceValue(body, "WO ID") || ""
  ).trim();
  const notes = normalizeServiceOrderNotes(rawNotes, {
    soId: soId || requestNumber,
    woId,
  });
  const acDetails = (Array.isArray(body.acDetails) ? body.acDetails : [])
    .map((item, index) => ({
      id: `ac-${Date.now()}-${index}`,
      type: String(item?.type || "").trim().toLowerCase(),
      quantity: Math.max(1, Number(item?.quantity) || 1),
    }))
    .filter((item) => item.type);

  if (!requestNumber || !customerName || !phone || !city || !district || !addressText || !mapLink || !serviceSummary || !preferredDate || !preferredTime || !acDetails.length) {
    return {
      error:
        "Request number, customer name, phone, city, district, address, map link, service summary, preferred date/time, and AC details are required",
    };
  }

  if (deliveryType === "express_24h" && !isFastDeliveryCity(city)) {
    return {
      error: "Fast delivery is only available in the listed major cities",
    };
  }

  return {
    requestNumber,
    customerName,
    phone,
    secondaryPhone,
    whatsappPhone,
    city,
    district,
    addressText,
    landmark,
    mapLink,
    sourceChannel,
    serviceSummary,
    importStatus,
    priority,
    deliveryType,
    preferredDate,
    preferredTime,
    notes,
    soId: soId || requestNumber,
    woId,
    acDetails,
    primaryAcType: acDetails[0]?.type || "split",
    totalQuantity: acDetails.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
  };
}

function calculateExtrasTotal(copperMeters, baseIncluded) {
  const copperTotal = Math.max(0, Number(copperMeters) || 0) * OPERATIONS_PRICING.copperPricePerMeter;
  return copperTotal + (baseIncluded ? OPERATIONS_PRICING.basePrice : 0);
}

function inferServiceCategory(value) {
  const text = String(value || "").trim().toLowerCase();
  if (!text) {
    return "split_installation";
  }
  if (text.includes("cassette") || text.includes("كاسيت")) {
    return "cassette_installation";
  }
  if (text.includes("maintenance") || text.includes("preventive") || text.includes("صيانة") || text.includes("وقائية")) {
    return "preventive_maintenance";
  }
  return "split_installation";
}

function normalizeServiceTimeStandards(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item, index) => {
      const standardKey = String(item?.standardKey || "").trim();
      const label = String(item?.label || "").trim();
      const arLabel = String(item?.arLabel || "").trim();
      const durationMinutes = Math.max(1, Number(item?.durationMinutes) || 0);

      if (!standardKey || !label || !arLabel || !durationMinutes) {
        return null;
      }

      return {
        standardKey,
        label,
        arLabel,
        durationMinutes,
        sortOrder: Math.max(1, Number(item?.sortOrder) || index + 1),
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.sortOrder - right.sortOrder || left.label.localeCompare(right.label));
}

function normalizeAreaText(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeInternalAreaClusters(items = []) {
  const seen = new Set();

  return (Array.isArray(items) ? items : [])
    .map((item, index) => {
      const city = String(item?.city || "").trim();
      const district = String(item?.district || "").trim();
      const dedupeKey = `${normalizeAreaText(city)}::${normalizeAreaText(district)}`;

      if (!city || !district || seen.has(dedupeKey)) {
        return null;
      }

      seen.add(dedupeKey);

      const areaKey = String(item?.areaKey || item?.label || dedupeKey).trim() || dedupeKey;
      const label = String(item?.label || areaKey).trim() || areaKey;
      const arLabel = String(item?.arLabel || label).trim() || label;

      return {
        city,
        district,
        areaKey,
        label,
        arLabel,
        sortOrder: Math.max(1, Number(item?.sortOrder) || index + 1),
      };
    })
    .filter(Boolean)
    .sort(
      (left, right) =>
        left.sortOrder - right.sortOrder ||
        left.label.localeCompare(right.label) ||
        left.city.localeCompare(right.city) ||
        left.district.localeCompare(right.district)
    );
}

function calculateElapsedMinutes(startedAt, endedAt = null) {
  const start = startedAt ? new Date(startedAt) : null;
  if (!start || Number.isNaN(start.getTime())) {
    return 0;
  }

  const end = endedAt ? new Date(endedAt) : new Date();
  if (!end || Number.isNaN(end.getTime())) {
    return 0;
  }

  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
}

function mapOrderStatusLabel(status) {
  return (
    {
      pending: "قيد الانتظار",
      scheduled: "تمت الجدولة",
      in_transit: "في الطريق",
      completed: "مكتمل",
      suspended: "معلقة",
      canceled: "ملغي",
    }[status] || status
  );
}

function readImportedTechnicianAssignment(normalized = {}) {
  const noteSource = { notes: String(normalized?.notes || "").trim() };
  const directTechId = String(normalized?.techId || extractImportReferenceValue(noteSource, "Tech ID") || "").trim();
  const directAreaCode = String(normalized?.areaCode || extractImportReferenceValue(noteSource, "Area Code") || "").trim();
  const directTechCode = String(normalized?.techCode || extractImportReferenceValue(noteSource, "Tech Code") || "").trim();

  if (directTechId || directAreaCode || directTechCode) {
    return parseTechnicianAssignment(`* ${directTechId || [directAreaCode, directTechCode].filter(Boolean).join("-")} - by:`);
  }

  const chatLog = extractImportReferenceValue(noteSource, "Chat Log") || extractImportReferenceValue(noteSource, "Chat message");
  return parseTechnicianAssignment(chatLog);
}

async function notifyUsersAboutTechnicianAssignmentReview(env, normalized, relatedOrderId = null, options = {}) {
  const { assignment, technician } = resolveLinkedTechnicianFromImportedAssignment(normalized, options.technicianCodeLookup);
  const issues = getTechnicianAssignmentIssues(assignment);
  const hasAssignmentCode = Boolean(normalizeExcelTechnicianCode(assignment.techId));
  if (!issues.needsReview && (!hasAssignmentCode || technician)) {
    return;
  }

  const reference = normalized?.requestNumber || normalized?.soId || normalized?.woId || String(relatedOrderId || "").trim() || "-";
  const customer = String(normalized?.customerName || "").trim() || "العميل";
  const issueSummary = [
    issues.missingAreaCode ? `رمز المنطقة ${issues.areaCode || "-"} غير موجود` : "",
    issues.missingTechCode ? `رمز الفني ${issues.techCode || "-"} غير موجود` : "",
    !issues.needsReview && hasAssignmentCode && !technician ? `لا يوجد فني مربوط داخل النظام للكود ${assignment.techId || "-"}` : "",
  ]
    .filter(Boolean)
    .join("، ");

  await notifyUsersByRoles(
    env,
    ["admin", "operations_manager"],
    "مراجعة تعيين الفني مطلوبة",
    `الطلب رقم ${reference} للعميل ${customer} يحتوي على كود تعيين يحتاج مراجعة (${issues.techId || "-"}). ${issueSummary}. يرجى تعيين الفني يدويًا لهذا الطلب.`,
    relatedOrderId,
    "assignment_review"
  );
}

async function createNotification(env, userId, title, body, kind = "info", relatedOrderId = null, targetRole = "") {
  await env.DB.prepare(
    `INSERT INTO notifications (user_id, title, body, kind, related_order_id, is_read, target_role)
     VALUES (?, ?, ?, ?, ?, 0, ?)`
  )
    .bind(Number(userId), title, body, kind, relatedOrderId ? Number(relatedOrderId) : null, String(targetRole || "").trim())
    .run();

  try {
    await sendPushToUser(env, userId, {
      title,
      body,
      kind,
      relatedOrderId,
    });
  } catch (error) {
    console.error("Push delivery failed", error);
  }
}

async function notifyAdmins(env, title, body, relatedOrderId = null) {
  return notifyUsersByRoles(env, ["operations_manager"], title, body, relatedOrderId);
}

async function notifyUsersByRoles(env, roles = [], title, body, relatedOrderId = null, kind = "status_update") {
  const normalizedRoles = normalizeRoleList(roles);
  if (!normalizedRoles.length) {
    return;
  }

  const recipients = await readActiveUsersByRoles(env, normalizedRoles);

  for (const recipient of recipients) {
    await createNotification(env, recipient.id, title, body, kind, relatedOrderId, recipient.targetRole);
  }
}

async function readActiveUsersByRoles(env, roles = []) {
  const normalizedRoles = normalizeRoleList(roles);
  if (!normalizedRoles.length) {
    return [];
  }

  const placeholders = normalizedRoles.map(() => "?").join(", ");

  try {
    const { results } = await env.DB.prepare(
      `SELECT DISTINCT u.id, uwr.role AS target_role
       FROM users u
       INNER JOIN user_workspace_roles uwr ON uwr.user_id = u.id
       WHERE u.status = 'active' AND uwr.role IN (${placeholders})`
    )
      .bind(...normalizedRoles)
      .all();

    const mappedRecipients = (results || []).map((row) => ({
      id: Number(row.id),
      targetRole: normalizeServerRole(row.target_role),
    }));

    if (mappedRecipients.length) {
      return mappedRecipients;
    }
  } catch (error) {
    if (!isMissingUserWorkspaceRolesTableError(error)) {
      throw error;
    }
  }

  const { results } = await env.DB.prepare(
    `SELECT id, role FROM users WHERE status = 'active' AND role IN (${placeholders})`
  )
    .bind(...normalizedRoles)
    .all();

  return (results || []).map((row) => ({
    id: Number(row.id),
    targetRole: normalizeServerRole(row.role),
  }));
}

async function readOperationsRemainingTodaySummary(env, targetDate = getRiyadhTodayString()) {
  const row = await env.DB.prepare(
    `SELECT
      COUNT(*) AS remaining_orders,
      COALESCE(SUM(COALESCE(ac_count, 0)), 0) AS remaining_devices
     FROM service_orders
     WHERE status NOT IN ('completed', 'canceled')
       AND COALESCE(NULLIF(scheduled_date, ''), NULLIF(preferred_date, ''), substr(created_at, 1, 10)) = ?`
  )
    .bind(String(targetDate || "").trim() || getRiyadhTodayString())
    .first();

  return {
    date: String(targetDate || "").trim() || getRiyadhTodayString(),
    remainingOrders: Number(row?.remaining_orders || 0),
    remainingDevices: Number(row?.remaining_devices || 0),
  };
}

async function readTechnicianTaskSummary(env, technicianId, targetDate = getRiyadhTodayString()) {
  const today = String(targetDate || "").trim() || getRiyadhTodayString();
  const tomorrow = shiftRiyadhDateString(today, 1);
  const row = await env.DB.prepare(
    `SELECT
      COUNT(CASE WHEN task_date = ? AND status NOT IN ('completed', 'canceled') THEN 1 END) AS today_orders,
      COALESCE(SUM(CASE WHEN task_date = ? AND status NOT IN ('completed', 'canceled') THEN COALESCE(ac_count, 0) ELSE 0 END), 0) AS today_devices,
      COUNT(CASE WHEN task_date = ? AND status NOT IN ('completed', 'canceled') THEN 1 END) AS tomorrow_orders,
      COALESCE(SUM(CASE WHEN task_date = ? AND status NOT IN ('completed', 'canceled') THEN COALESCE(ac_count, 0) ELSE 0 END), 0) AS tomorrow_devices
     FROM (
       SELECT
         status,
         COALESCE(ac_count, 0) AS ac_count,
         COALESCE(NULLIF(scheduled_date, ''), NULLIF(preferred_date, ''), substr(created_at, 1, 10)) AS task_date
       FROM service_orders
       WHERE technician_id = ?
     ) scoped_orders`
  )
    .bind(today, today, tomorrow, tomorrow, Number(technicianId))
    .first();

  return {
    today,
    tomorrow,
    todayOrders: Number(row?.today_orders || 0),
    todayDevices: Number(row?.today_devices || 0),
    tomorrowOrders: Number(row?.tomorrow_orders || 0),
    tomorrowDevices: Number(row?.tomorrow_devices || 0),
  };
}

function formatTechnicianTaskSummary(summary) {
  if (!summary) {
    return "";
  }

  const todayLine = `مهام اليوم: ${summary.todayOrders} طلب${summary.todayDevices ? ` / ${summary.todayDevices} جهاز` : ""}.`;
  const tomorrowLine = `مهام الغد: ${summary.tomorrowOrders} طلب${summary.tomorrowDevices ? ` / ${summary.tomorrowDevices} جهاز` : ""}.`;
  return [todayLine, tomorrowLine].join("\n");
}

async function buildTechnicianTaskNotificationBody(env, technicianId, leadLine, targetDate = getRiyadhTodayString()) {
  const summary = await readTechnicianTaskSummary(env, technicianId, targetDate);
  return [String(leadLine || "").trim(), formatTechnicianTaskSummary(summary)].filter(Boolean).join("\n");
}

async function appendOperationsRemainingSummary(env, body) {
  const summary = await readOperationsRemainingTodaySummary(env);
  const suffix = `المتبقي في مهام اليوم: ${summary.remainingOrders} طلب${summary.remainingDevices ? ` / ${summary.remainingDevices} جهاز` : ""}.`;
  return [String(body || "").trim(), suffix].filter(Boolean).join("\n");
}

async function notifyOperationsManagersAboutNewOrder(env, normalized, relatedOrderId) {
  const notification = buildOperationsNewOrderNotification(normalized);
  const body = await appendOperationsRemainingSummary(env, notification.body);
  return notifyUsersByRoles(env, ["operations_manager"], notification.title, body, relatedOrderId, "new_order");
}

async function notifyOperationsManagersAboutStatusChange(env, title, body, relatedOrderId = null) {
  const nextBody = await appendOperationsRemainingSummary(env, body);
  return notifyUsersByRoles(env, ["operations_manager"], title, nextBody, relatedOrderId, "status_update");
}

async function readServiceTimeStandards(env) {
  const { results } = await env.DB.prepare(
    `SELECT standard_key, label, ar_label, duration_minutes, sort_order
     FROM service_time_standards
     ORDER BY sort_order ASC, standard_key ASC`
  ).all();

  return normalizeServiceTimeStandards(
    (results || []).map((row) => ({
      standardKey: row.standard_key,
      label: row.label,
      arLabel: row.ar_label,
      durationMinutes: row.duration_minutes,
      sortOrder: row.sort_order,
    }))
  );
}

async function readInternalAreaClusters(env) {
  const { results } = await env.DB.prepare(
    `SELECT city, district, area_key, label, ar_label, sort_order
     FROM internal_area_clusters
     ORDER BY sort_order ASC, label ASC, city ASC, district ASC`
  ).all();

  return normalizeInternalAreaClusters(
    (results || []).map((row) => ({
      city: row.city,
      district: row.district,
      areaKey: row.area_key,
      label: row.label,
      arLabel: row.ar_label,
      sortOrder: row.sort_order,
    }))
  );
}

function resolveInternalAreaCluster(location, areaClusters = []) {
  const city = String(location?.city || "").trim();
  const district = String(location?.district || "").trim();
  const matched =
    (areaClusters || []).find(
      (entry) =>
        normalizeAreaText(entry?.city) === normalizeAreaText(city) &&
        normalizeAreaText(entry?.district) === normalizeAreaText(district)
    ) || null;
  const fallbackLabel = [district, city].filter(Boolean).join(" - ") || "General pool";
  const fallbackArLabel = [district, city].filter(Boolean).join(" - ") || "منطقة عامة";

  return {
    internalAreaKey:
      String(
        matched?.areaKey ||
          `${normalizeAreaText(city || "general") || "general"}-${normalizeAreaText(district || "general") || "general"}`
      ).trim() || "general",
    internalAreaLabel: String(matched?.label || fallbackLabel).trim() || fallbackLabel,
    internalAreaArLabel: String(matched?.arLabel || fallbackArLabel).trim() || fallbackArLabel,
    internalAreaSortOrder: Math.max(1, Number(matched?.sortOrder) || 999),
    internalAreaMatched: Boolean(matched),
  };
}

function normalizeProductInput(body) {
  const name = (body.name || "").trim();
  const description = (body.description || "").trim();
  const category = (body.category || "device").trim();
  const city = (body.city || "Riyadh").trim();
  const pricePerDay = Number(body.pricePerDay);
  const rating = Number.isFinite(Number(body.rating)) ? Number(body.rating) : 0;
  const quantity = Number(body.quantity);
  const imageUrl = (body.imageUrl || "").trim() || null;

  if (!name || !description) {
    return { error: "Name and description are required" };
  }

  if (!Number.isFinite(pricePerDay) || pricePerDay < 0) {
    return { error: "Invalid price per day" };
  }

  if (!Number.isInteger(quantity) || quantity < 0) {
    return { error: "Quantity must be a non-negative integer" };
  }

  if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
    return { error: "Rating must be between 0 and 5" };
  }

  return {
    name,
    description,
    category,
    city,
    pricePerDay,
    rating,
    quantity,
    imageUrl,
  };
}

function normalizeFooterSettingsInput(body) {
  const aboutText = String(body.aboutText || "").trim();
  const copyrightText = String(body.copyrightText || "").trim();
  const usefulLinks = normalizeFooterLinkList(body.usefulLinks, "label");
  const customerServiceLinks = normalizeFooterLinkList(body.customerServiceLinks, "label");
  const socialLinks = normalizeFooterLinkList(body.socialLinks, "platform");

  if (!aboutText) {
    return { error: "About text is required" };
  }

  if (!copyrightText) {
    return { error: "Copyright text is required" };
  }

  if (usefulLinks.error || customerServiceLinks.error || socialLinks.error) {
    return { error: usefulLinks.error || customerServiceLinks.error || socialLinks.error };
  }

  return {
    aboutText,
    copyrightText,
    usefulLinks: usefulLinks.items,
    customerServiceLinks: customerServiceLinks.items,
    socialLinks: socialLinks.items,
  };
}

function normalizeHomeSettingsInput(body) {
  const defaults = getDefaultHomeSettings();
  const heroKicker = String(body.heroKicker || "").trim();
  const heroTitle = String(body.heroTitle || "").trim();
  const heroSubtitle = String(body.heroSubtitle || "").trim();
  const heroNote = String(body.heroNote || "").trim();
  const primaryButtonText = String(body.primaryButtonText || "").trim();
  const primaryButtonUrl = String(body.primaryButtonUrl || "").trim();
  const secondaryButtonText = String(body.secondaryButtonText || "").trim();
  const secondaryButtonUrl = String(body.secondaryButtonUrl || "").trim();
  const stats = normalizeHomeStats(body.stats);
  const heroHighlights = normalizeHomeStringList(body.heroHighlights, "Hero highlights");
  const services = normalizeHomeStringList(body.services, "Services");
  const features = normalizeHomeStringList(body.features, "Features");
  const testimonials = normalizeHomeStringList(body.testimonials, "Testimonials");
  const galleryImages = normalizeHomeGalleryImages(body.galleryImages);
  const aboutTitle = String(body.aboutTitle || "").trim();
  const aboutText = String(body.aboutText || "").trim();
  const servicesTitle = String(body.servicesTitle || "").trim();
  const featuresTitle = String(body.featuresTitle || "").trim();
  const galleryTitle = String(body.galleryTitle || "").trim();
  const testimonialsTitle = String(body.testimonialsTitle || "").trim();
  const contactTitle = String(body.contactTitle || "").trim();
  const phone = String(body.phone || "").trim();
  const whatsappNumber = String(body.whatsappNumber || "").trim();
  const coverageText = String(body.coverageText || "").trim();
  const hoursText = String(body.hoursText || "").trim();

  if (!heroKicker || !heroTitle || !heroSubtitle) {
    return { error: "Hero content is required" };
  }

  if (!primaryButtonText || !primaryButtonUrl || !secondaryButtonText || !secondaryButtonUrl) {
    return { error: "Hero buttons are required" };
  }

  if (stats.error) {
    return { error: stats.error };
  }

  if (heroHighlights.error || services.error || features.error || testimonials.error || galleryImages.error) {
    return {
      error:
        heroHighlights.error ||
        services.error ||
        features.error ||
        testimonials.error ||
        galleryImages.error,
    };
  }

  if (!aboutTitle || !aboutText || !servicesTitle || !featuresTitle || !galleryTitle || !testimonialsTitle || !contactTitle) {
    return { error: "Homepage section titles and copy are required" };
  }

  if (!phone || !coverageText || !hoursText) {
    return { error: "Contact details are required" };
  }

  return {
    contentVersion: 2,
    heroKicker,
    heroTitle,
    heroSubtitle,
    heroNote: heroNote || defaults.heroNote,
    primaryButtonText,
    primaryButtonUrl,
    secondaryButtonText,
    secondaryButtonUrl,
    stats: stats.items,
    heroHighlights: heroHighlights.items,
    aboutTitle,
    aboutText,
    servicesTitle,
    services: services.items,
    featuresTitle,
    features: features.items,
    galleryTitle,
    galleryImages: galleryImages.items,
    testimonialsTitle,
    testimonials: testimonials.items,
    contactTitle,
    phone,
    whatsappNumber: whatsappNumber || phone,
    coverageText,
    hoursText,
  };
}

function normalizeHomeStats(value) {
  if (!Array.isArray(value)) {
    return { error: "Invalid home stats payload" };
  }

  const items = value
    .map((entry) => ({
      value: String(entry?.value || "").trim(),
      label: String(entry?.label || "").trim(),
    }))
    .filter((entry) => entry.value || entry.label);

  for (const entry of items) {
    if (!entry.value || !entry.label) {
      return { error: "Each stat requires value and label" };
    }
  }

  return { items };
}

function normalizeHomeStringList(value, fieldName) {
  if (!Array.isArray(value)) {
    return { error: `${fieldName} must be a list` };
  }

  const items = value.map((entry) => String(entry || "").trim()).filter(Boolean);
  if (!items.length) {
    return { error: `${fieldName} must include at least one item` };
  }

  return { items };
}

function normalizeHomeGalleryImages(value) {
  if (!Array.isArray(value)) {
    return { error: "Gallery images must be a list" };
  }

  const items = value
    .map((entry) => ({
      title: String(entry?.title || "").trim(),
      caption: String(entry?.caption || "").trim(),
      imageUrl: String(entry?.imageUrl || "").trim(),
    }))
    .filter((entry) => entry.imageUrl && !LEGACY_HOME_GALLERY_IMAGE_URLS.has(entry.imageUrl));

  for (const entry of items) {
    if (!entry.imageUrl) {
      return { error: "Each gallery image requires an image URL" };
    }
  }

  return { items };
}

function normalizeFooterLinkList(value, titleKey) {
  if (!Array.isArray(value)) {
    return { error: "Invalid footer links payload" };
  }

  const items = value
    .map((entry) => ({
      [titleKey]: String(entry?.[titleKey] || "").trim(),
      url: String(entry?.url || "").trim(),
    }))
    .filter((entry) => entry[titleKey] || entry.url);

  for (const entry of items) {
    if (!entry[titleKey] || !entry.url) {
      return { error: "Each footer link requires text and URL" };
    }
  }

  return { items };
}

function mapProduct(row) {
  const quantity = Number(row.quantity ?? 0);
  const availableQuantity = Number.isFinite(quantity) ? Math.max(0, quantity) : 0;

  return {
    _id: String(row.id),
    ownerUserId: row.owner_user_id ? String(row.owner_user_id) : null,
    name: row.name,
    description: row.description,
    category: row.category,
    city: row.city,
    pricePerDay: row.price_per_day,
    rating: row.rating,
    quantity: availableQuantity,
    availableQuantity,
    isAvailable: availableQuantity > 0,
    availabilityLabel: availableQuantity > 0 ? "متوفر" : "غير متوفر",
    images: [
      {
        url: row.image_url || DEFAULT_PRODUCT_IMAGE,
      },
    ],
  };
}

function mapBookingRow(row) {
  return {
    id: row.id,
    startDate: row.start_date,
    endDate: row.end_date,
    quantity: row.quantity,
    totalPrice: row.total_price,
    status: row.status,
    createdAt: row.created_at,
    product: {
      id: row.product_id,
      name: row.product_name,
      city: row.product_city,
      imageUrl:
        row.product_image_url ||
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80",
    },
  };
}

async function readFooterSettings(env) {
  const row = await env.DB.prepare(
    `SELECT id, about_text, useful_links_json, customer_service_links_json, social_links_json, copyright_text
     FROM footer_settings
     WHERE id = 1`
  ).first();

  if (!row) {
    return getDefaultFooterSettings();
  }

  const settings = mapFooterSettings(row);
  return isLegacyFooterSettings(settings) ? getDefaultFooterSettings() : settings;
}

function mapFooterSettings(row) {
  return {
    aboutText: row.about_text,
    usefulLinks: parseJsonArray(row.useful_links_json),
    customerServiceLinks: parseJsonArray(row.customer_service_links_json),
    socialLinks: parseJsonArray(row.social_links_json),
    copyrightText: row.copyright_text,
  };
}

function getDefaultFooterSettings() {
  return {
    aboutText:
      "تركيب برو لخدمات تركيب وصيانة المكيفات بخبرة عالية، سرعة في الوصول، وضمان على جودة العمل.",
    usefulLinks: [
      { label: "Home", url: "/" },
      { label: "Login", url: "/login" },
    ],
    customerServiceLinks: [
      { label: "Support", url: "tel:0558232644" },
      { label: "WhatsApp", url: "https://wa.me/966558232644" },
      { label: "Call us", url: "tel:0558232644" },
    ],
    socialLinks: [{ platform: "whatsapp", url: "https://wa.me/966558232644" }],
    copyrightText: "© 2026 TrkeebPro",
  };
}

function isLegacyFooterSettings(settings) {
  return /internal|داخلية|الداخلية/i.test(String(settings?.aboutText || ""));
}

async function readHomeSettings(env) {
  const row = await env.DB.prepare(
    `SELECT
      hero_kicker,
      hero_title,
      hero_subtitle,
      primary_button_text,
      primary_button_url,
      secondary_button_text,
      secondary_button_url,
      stats_json
     FROM home_settings
     WHERE id = 1`
  ).first();

  if (!row) {
    return getDefaultHomeSettings();
  }

  const defaults = getDefaultHomeSettings();
  const payload = parseHomeSettingsPayload(row.stats_json);
  const isModern =
    Number(payload.contentVersion || 0) >= 2 ||
    payload.aboutTitle ||
    payload.aboutText ||
    Array.isArray(payload.services) ||
    Array.isArray(payload.heroHighlights);

  if (!isModern) {
    return defaults;
  }

  return {
    ...defaults,
    heroKicker: String(row.hero_kicker || defaults.heroKicker),
    heroTitle: String(row.hero_title || defaults.heroTitle),
    heroSubtitle: String(row.hero_subtitle || defaults.heroSubtitle),
    primaryButtonText: String(row.primary_button_text || defaults.primaryButtonText),
    primaryButtonUrl: String(row.primary_button_url || defaults.primaryButtonUrl),
    secondaryButtonText: String(row.secondary_button_text || defaults.secondaryButtonText),
    secondaryButtonUrl: String(row.secondary_button_url || defaults.secondaryButtonUrl),
    heroNote: String(payload.heroNote || defaults.heroNote),
    heroHighlights: normalizeStoredHomeStringList(payload.heroHighlights, defaults.heroHighlights),
    stats: normalizeStoredHomeStats(payload.stats, defaults.stats),
    aboutTitle: String(payload.aboutTitle || defaults.aboutTitle),
    aboutText: String(payload.aboutText || defaults.aboutText),
    servicesTitle: String(payload.servicesTitle || defaults.servicesTitle),
    services: normalizeStoredHomeStringList(payload.services, defaults.services),
    featuresTitle: String(payload.featuresTitle || defaults.featuresTitle),
    features: normalizeStoredHomeStringList(payload.features, defaults.features),
    galleryTitle: String(payload.galleryTitle || defaults.galleryTitle),
    galleryImages: normalizeStoredHomeGalleryImages(payload.galleryImages, defaults.galleryImages),
    testimonialsTitle: String(payload.testimonialsTitle || defaults.testimonialsTitle),
    testimonials: normalizeStoredHomeStringList(payload.testimonials, defaults.testimonials),
    contactTitle: String(payload.contactTitle || defaults.contactTitle),
    phone: String(payload.phone || defaults.phone),
    whatsappNumber: String(payload.whatsappNumber || payload.phone || defaults.whatsappNumber),
    coverageText: String(payload.coverageText || defaults.coverageText),
    hoursText: String(payload.hoursText || defaults.hoursText),
    contentVersion: 2,
  };
}

function getDefaultHomeSettings() {
  return {
    contentVersion: 2,
    heroKicker: "تركيب برو",
    heroTitle: "تركيب وصيانة المكيفات باحترافية عالية",
    heroSubtitle: "خدمة سريعة | أسعار منافسة | ضمان على العمل",
    heroNote:
      "متخصصون في تركيب وصيانة جميع أنواع المكيفات بخبرة عالية وفريق فني محترف، مع اهتمام بالتفاصيل وسرعة في التنفيذ.",
    primaryButtonText: "احجز الآن",
    primaryButtonUrl: "#contact",
    secondaryButtonText: "تواصل عبر واتساب",
    secondaryButtonUrl: "https://wa.me/966558232644",
    heroHighlights: ["خدمة سريعة", "أسعار منافسة", "ضمان على العمل"],
    stats: [
      { value: "6", label: "خدمات رئيسية" },
      { value: "24/7", label: "استجابة سريعة" },
      { value: "100%", label: "اهتمام بالنظافة والجودة" },
    ],
    aboutTitle: "من نحن",
    aboutText:
      "نحن في \"تركيب برو\" متخصصون في تركيب وصيانة جميع أنواع المكيفات، بخبرة عالية وفريق فني محترف. نضمن لك جودة العمل وسرعة التنفيذ بأفضل الأسعار.",
    servicesTitle: "خدماتنا",
    services: [
      "تركيب مكيفات سبليت",
      "تركيب مكيفات شباك",
      "فك ونقل المكيفات",
      "صيانة وتنظيف المكيفات",
      "تعبئة فريون",
      "كشف الأعطال",
    ],
    featuresTitle: "لماذا تختارنا؟",
    features: ["فنيين محترفين", "سرعة في الوصول", "أسعار مناسبة", "ضمان على الخدمة", "خدمة عملاء ممتازة"],
    galleryTitle: "أعمالنا",
    galleryImages: [],
    testimonialsTitle: "آراء العملاء",
    testimonials: ["خدمة ممتازة وسريعة، أنصح فيهم", "أسعارهم مناسبة وشغلهم نظيف"],
    contactTitle: "تواصل معنا",
    phone: "0558232644",
    whatsappNumber: "0558232644",
    coverageText: "نخدم جميع مناطق المملكة",
    hoursText: "يتم تحديد ساعات العمل لاحقًا",
  };
}

const LEGACY_HOME_GALLERY_IMAGE_URLS = new Set([
  "/home-gallery-1.jpg",
  "/home-gallery-2.png",
  "/home-gallery-2.webp",
  "/home-gallery-3.jpg",
]);

function parseHomeSettingsPayload(value) {
  try {
    const parsed = value ? JSON.parse(value) : null;
    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
      return {};
    }
    return parsed;
  } catch {
    return {};
  }
}

function normalizeStoredHomeStringList(value, fallback = []) {
  const items = (Array.isArray(value) ? value : []).map((entry) => String(entry || "").trim()).filter(Boolean);
  return items.length ? items : fallback;
}

function normalizeStoredHomeStats(value, fallback = []) {
  const items = (Array.isArray(value) ? value : [])
    .map((entry) => ({
      value: String(entry?.value || "").trim(),
      label: String(entry?.label || "").trim(),
    }))
    .filter((entry) => entry.value && entry.label);
  return items.length ? items : fallback;
}

function normalizeStoredHomeGalleryImages(value) {
  return (Array.isArray(value) ? value : [])
    .map((entry) => ({
      title: String(entry?.title || "").trim(),
      caption: String(entry?.caption || "").trim(),
      imageUrl: String(entry?.imageUrl || "").trim(),
    }))
    .filter((entry) => entry.imageUrl && !LEGACY_HOME_GALLERY_IMAGE_URLS.has(entry.imageUrl));
}

function parseJsonArray(value) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function json(data, status = 200, request, env = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...buildSecurityHeaders(),
      ...buildCorsHeaders(request, env),
    },
  });
}

function buildSecurityHeaders() {
  return {
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Permissions-Policy": "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Cache-Control": "private, no-store, no-cache, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  };
}

function buildCorsHeaders(request, env) {
  const requestOrigin = request.headers.get("Origin");
  const allowedOrigins = getAllowedOrigins(env);
  const allowOrigin =
    requestOrigin && allowedOrigins.includes(requestOrigin)
      ? requestOrigin
      : allowedOrigins[0];

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Workspace-Role",
    Vary: "Origin",
  };
}

function getAllowedOrigins(env) {
  const configuredOrigins = (env.CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return [...new Set([...configuredOrigins, ...DEFAULT_ALLOWED_ORIGINS])];
}

async function hashPassword(password, salt) {
  const msg = new TextEncoder().encode(`${salt}:${password}`);
  const hash = await crypto.subtle.digest("SHA-256", msg);
  return toHex(hash);
}

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function signJwt(payload, secret) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + 60 * 60 * 24 * 7 };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const input = `${encodedHeader}.${encodedPayload}`;
  const signature = await hmacSign(input, secret);
  return `${input}.${signature}`;
}

async function verifyJwt(token, secret) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, signature] = parts;
  const input = `${headerB64}.${payloadB64}`;
  const expected = await hmacSign(input, secret);
  if (expected !== signature) return null;
  const payload = JSON.parse(base64UrlDecode(payloadB64));
  const now = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp < now) return null;
  return payload;
}

async function hmacSign(text, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(text));
  return base64UrlFromBytes(new Uint8Array(sig));
}

function base64UrlEncode(text) {
  return base64UrlFromBytes(new TextEncoder().encode(text));
}

function base64UrlDecode(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "===".slice((base64.length + 3) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function base64UrlFromBytes(bytes) {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function getJwtSecret(env, request) {
  const configuredSecret = String(env.JWT_SECRET || "").trim();
  if (configuredSecret) {
    return configuredSecret;
  }

  try {
    const hostname = new URL(request?.url || "").hostname;
    const requestHost = String(request?.headers?.get("Host") || "")
      .split(":")[0]
      .trim()
      .toLowerCase();

    if (["localhost", "127.0.0.1"].includes(hostname) || ["localhost", "127.0.0.1"].includes(requestHost)) {
      return "dev-secret";
    }
  } catch {}

  throw new Error("JWT_SECRET is not configured");
}

async function readAuthUser(request, env) {
  const auth = request.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return null;
  const token = auth.slice("Bearer ".length);

  let jwtSecret;
  try {
    jwtSecret = getJwtSecret(env, request);
  } catch {
    return null;
  }

  return verifyJwt(token, jwtSecret);
}

async function readActiveUser(request, env) {
  const payload = await readAuthUser(request, env);
  if (!payload || (payload.status || "active") !== "active") {
    return null;
  }

  const availableRoles = normalizeRoleList([
    payload.roles || payload.workspaceRoles || payload.role,
    ...getPrivilegedWorkspaceRolesForEmail(payload.email),
  ]);
  const requestedRole = resolveRequestedWorkspaceRole(request.headers.get("X-Workspace-Role"), availableRoles);

  return {
    ...payload,
    role: requestedRole,
    roles: availableRoles,
    workspaceRoles: availableRoles,
  };
}

async function requireAdmin(request, env) {
  const payload = await readActiveUser(request, env);
  if (!payload || normalizeServerRole(payload.role) !== "admin") {
    return null;
  }

  return { ...payload, role: normalizeServerRole(payload.role) };
}

async function requireRoles(request, env, roles = []) {
  const payload = await readActiveUser(request, env);
  const normalizedRole = normalizeServerRole(payload?.role);
  const normalizedAllowedRoles = normalizeRoleList(roles);
  const adminCanAccess =
    normalizedRole === "admin" &&
    normalizedAllowedRoles.some((role) => ["admin", "operations_manager"].includes(role));

  if (!payload || (!normalizedAllowedRoles.includes(normalizedRole) && !adminCanAccess)) {
    return null;
  }

  return { ...payload, role: normalizedRole };
}

function getStockAdjustment(previousStatus, nextStatus, quantity) {
  if (previousStatus !== "cancelled" && nextStatus === "cancelled") {
    return Number(quantity);
  }

  if (previousStatus === "cancelled" && nextStatus !== "cancelled") {
    return -Number(quantity);
  }

  return 0;
}

function calculateRentalDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 1;
  }

  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
}
