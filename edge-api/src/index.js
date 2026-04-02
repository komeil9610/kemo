const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost",
  "http://127.0.0.1",
  "https://localhost",
  "https://127.0.0.1",
  "capacitor://localhost",
];

const INTERNAL_PROXY_HEADER = "X-Tarkeeb-Pro-Internal";
const DEFAULT_ACCESS_AUD = "282d6bbb5c79e6fa216dc031838ec36e641595f0c62f5ee0732e6d2f264eefa6";
const DEFAULT_ACCESS_JWKS_URL = "https://bobkumeel.cloudflareaccess.com/cdn-cgi/access/certs";
const jwksCache = new Map();

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

      if (!isInternalProxyRequest(request)) {
        const accessResponse = await validateCloudflareAccess(request, env);
        if (accessResponse) {
          return accessResponse;
        }
      }

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
};

import webpush from "web-push";

const DEFAULT_VAPID_PUBLIC_KEY = "BJDe1im_oVNRMdPrjtBjE7qwlb-CJUDIxxc_Dp-mhPwuiuSgTHcFxWgS3MX-gyVyy3YPMS8nGQ6YaJIb1rrGgyo";
const DEFAULT_VAPID_CONTACT_EMAIL = "ops@tarkeebpro.sa";
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

function getWorkspacePathForRole(role) {
  return {
    customer_service: "/customer-service",
    operations_manager: "/operations-manager",
    regional_dispatcher: "/regions",
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
  const { message, title = "Tarkeeb Pro", url = "/login", tag = "broadcast" } = body;

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
    title: payload.title || "Tarkeeb Pro",
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

  const passwordHash = await hashPassword(password, email);
  const created = await env.DB.prepare(
    "INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)"
  )
    .bind(name, email, passwordHash, "member", "active")
    .run();

  const userId = created.meta.last_row_id;
  const user = { id: userId, name, email, role: "member", status: "active" };
  const token = await signJwt(
    { sub: String(userId), email, name, role: user.role, status: user.status },
    env.JWT_SECRET || "dev-secret"
  );

  return json({ token, user }, 201, request, env);
}

async function login(request, env) {
  const body = await readJson(request);
  const email = (body.email || "").toLowerCase().trim();
  const password = body.password || "";

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

  const passwordHash = await hashPassword(password, email);
  if (passwordHash !== user.password_hash) {
    return json({ message: "Invalid credentials" }, 401, request, env);
  }

  const technician =
    ["technician", "regional_dispatcher"].includes(normalizeServerRole(user.role))
      ? await env.DB.prepare(
          "SELECT id, user_id, name, phone, zone, status, COALESCE(notes, '') AS notes FROM technicians WHERE user_id = ?"
        )
          .bind(Number(user.id))
          .first()
      : null;

  const token = await signJwt(
    {
      sub: String(user.id),
      email: user.email,
      name: user.name,
      role: normalizeServerRole(user.role),
      status: user.status || "active",
    },
    env.JWT_SECRET || "dev-secret"
  );

  return json(
    {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: normalizeServerRole(user.role),
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
      JSON.stringify(normalized.stats)
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

function normalizeRegionKey(value) {
  return String(value || "").trim().toLowerCase();
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
  const user = await requireRoles(request, env, ["customer_service", "operations_manager"]);
  if (!user) {
    return json({ message: "Internal access required" }, 403, request, env);
  }

  const orders = await readServiceOrders(env);
  const summary = buildOperationsSummary(orders, []);

  return json(
    {
      orders,
      summary,
      currentUser: user,
    },
    200,
    request,
    env
  );
}

async function getOperationsSummary(request, env) {
  const orders = await readServiceOrders(env);
  const summary = buildOperationsSummary(orders, []);

  return json({ summary }, 200, request, env);
}

async function getServiceTimeStandards(request, env) {
  const user = await requireRoles(request, env, ["customer_service", "operations_manager"]);
  if (!user) {
    return json({ message: "Unauthorized" }, 401, request, env);
  }

  const timeStandards = await readServiceTimeStandards(env);
  return json({ timeStandards }, 200, request, env);
}

async function getInternalAreaClusters(request, env) {
  const user = await requireRoles(request, env, ["customer_service", "operations_manager"]);
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
  const csr = await requireRoles(request, env, ["customer_service"]);
  if (!csr) {
    return json({ message: "Customer service access required" }, 403, request, env);
  }

  const body = await readJson(request);
  const normalized = normalizeServiceOrderInput(body);
  if (normalized.error) {
    return json({ message: normalized.error }, 400, request, env);
  }

  const createdOrderId = await insertServiceOrderRecord(env, normalized, Number(csr.sub), {
    actor: "customer_service",
    message: `تم إنشاء الطلب ${normalized.requestNumber} وإرساله إلى مدير العمليات${normalized.deliveryType !== "none" ? ` مع ${normalized.deliveryType === "express_24h" ? "توصيل سريع" : "طلب توصيل"}` : ""}.`,
  });

  await notifyUsersByRoles(
    env,
    ["operations_manager"],
    normalized.deliveryType === "none" ? "طلب جديد بانتظار العمليات" : "طلب توصيل بأولوية قصوى",
    normalized.deliveryType === "none"
      ? `تم إنشاء الطلب رقم ${normalized.requestNumber} للعميل ${normalized.customerName} ويحتاج إلى المتابعة.`
      : `تم إنشاء الطلب رقم ${normalized.requestNumber} للعميل ${normalized.customerName} ويتضمن ${normalized.deliveryType === "express_24h" ? "توصيلاً سريعاً خلال 24 ساعة" : "توصيلاً"} ويحتاج إلى متابعة عاجلة.`,
    createdOrderId
  );

  await notifyRegionalDispatchersForOrder(
    env,
    normalized,
    "طلب جديد ضمن منطقتكم",
    `تم إنشاء الطلب رقم ${normalized.requestNumber} للعميل ${normalized.customerName} وإرساله مباشرة إلى منطقتكم.`,
    createdOrderId
  );

  const order = await readServiceOrderById(env, createdOrderId);
  return json({ order }, 201, request, env);
}

async function importServiceOrders(request, env) {
  const csr = await requireRoles(request, env, ["customer_service"]);
  if (!csr) {
    return json({ message: "Customer service access required" }, 403, request, env);
  }

  const body = await readJson(request);
  const rawOrders = Array.isArray(body?.orders) ? body.orders : [];
  const sourceFileName = String(body?.fileName || "Excel").trim();
  if (!rawOrders.length) {
    return json({ message: "At least one Excel order is required" }, 400, request, env);
  }

  const seenRequestNumbers = new Set();
  const validOrders = [];
  const skippedOrders = [];

  for (const item of rawOrders) {
    const normalized = normalizeServiceOrderInput(item);
    const requestNumber = String(item?.requestNumber || normalized.requestNumber || "").trim();

    if (normalized.error) {
      skippedOrders.push({
        requestNumber,
        reason: normalized.error,
      });
      continue;
    }

    const dedupeKey = String(normalized.requestNumber || "").trim();
    if (!dedupeKey || seenRequestNumbers.has(dedupeKey)) {
      skippedOrders.push({
        requestNumber: dedupeKey || requestNumber,
        reason: "Duplicate request number inside the Excel import batch",
      });
      continue;
    }

    seenRequestNumbers.add(dedupeKey);
    validOrders.push(normalized);
  }

  if (!validOrders.length) {
    return json(
      {
        importedCount: 0,
        skippedCount: skippedOrders.length,
        skippedOrders,
        orders: [],
      },
      200,
      request,
      env
    );
  }

  const existingRequestNumbers = await readExistingServiceOrderNumbers(
    env,
    validOrders.map((item) => item.requestNumber)
  );

  let importedCount = 0;
  for (const normalized of validOrders) {
    if (existingRequestNumbers.has(normalized.requestNumber)) {
      skippedOrders.push({
        requestNumber: normalized.requestNumber,
        reason: "This SO ID is already imported",
      });
      continue;
    }

    const orderId = await insertServiceOrderRecord(env, normalized, Number(csr.sub), {
      actor: "customer_service",
      message: `تم استيراد الطلب ${normalized.requestNumber} من ملف Excel وإرساله إلى مدير العمليات.`,
    });
    importedCount += orderId ? 1 : 0;
  }

  return json(
    {
      fileName: sourceFileName,
      importedCount,
      skippedCount: skippedOrders.length,
      skippedOrders,
    },
    201,
    request,
    env
  );
}

async function insertServiceOrderRecord(env, normalized, createdByUserId, auditEntry) {
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
      null,
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

async function createTechnician(request, env) {
  const admin = await requireAdmin(request, env);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
  }

  const body = await readJson(request);
  const firstName = String(body.firstName || "").trim();
  const lastName = String(body.lastName || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const phone = normalizeSaudiPhoneNumber(body.phone);
  const password = String(body.password || "").trim();
  const region = String(body.region || "").trim();
  const notes = String(body.notes || "").trim();
  const status = normalizeTechnicianStatus(body.status);

  if (!firstName || !lastName || !email || !phone || !password || !region) {
    return json({ message: "All technician fields are required" }, 400, request, env);
  }

  const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?")
    .bind(email)
    .first();

  if (existing) {
    return json({ message: "This email is already registered" }, 409, request, env);
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
    "INSERT INTO technicians (user_id, name, phone, zone, status, notes) VALUES (?, ?, ?, ?, ?, ?)"
  )
    .bind(Number(userId), userName, phone, region, status, notes)
    .run();

  const technician = await env.DB.prepare(
    "SELECT id, user_id, name, phone, zone, status, COALESCE(notes, '') AS notes FROM technicians WHERE user_id = ?"
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
        notes,
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
  const admin = await requireAdmin(request, env);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
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
      t.status,
      COALESCE(t.notes, '') AS notes,
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
  const region = String(body.region ?? existing.zone ?? "").trim();
  const notes = String(body.notes ?? existing.notes ?? "").trim();
  const status = normalizeTechnicianStatus(body.status ?? existing.status);
  const password = String(body.password || "").trim();
  const name =
    `${firstName || existing.name.split(" ").slice(0, -1).join(" ")} ${lastName || existing.name.split(" ").slice(-1).join(" ")}`.trim() ||
    existing.name;

  if (!name || !email || !phone || !region) {
    return json({ message: "Name, email, phone, and region are required" }, 400, request, env);
  }

  const duplicate = await env.DB.prepare(
    "SELECT id FROM users WHERE email = ? AND id != ?"
  )
    .bind(email, Number(existing.user_id))
    .first();

  if (duplicate) {
    return json({ message: "This email is already registered" }, 409, request, env);
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
    "UPDATE technicians SET name = ?, phone = ?, zone = ?, status = ?, notes = ? WHERE id = ?"
  )
    .bind(name, phone, region, status, notes, id)
    .run();

  const technician = await env.DB.prepare(
    `SELECT
      t.id,
      t.user_id,
      t.name,
      t.phone,
      t.zone,
      t.status,
      COALESCE(t.notes, '') AS notes,
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
  const admin = await requireAdmin(request, env);
  if (!admin) {
    return json({ message: "Admin access required" }, 403, request, env);
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
  const actor = await requireRoles(request, env, ["customer_service", "operations_manager", "technician", "regional_dispatcher"]);
  if (!actor) {
    return json({ message: "Internal access required" }, 403, request, env);
  }
  const isOperationsManager = actor.role === "operations_manager";
  const isCustomerService = actor.role === "customer_service";
  const isTechnician = actor.role === "technician";
  const isRegionalDispatcher = actor.role === "regional_dispatcher";

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

  const body = await readJson(request);
  const technicianAllowedKeys = ["clientSignature"];
  const technicianTouchedKeys = Object.keys(body || {}).filter((key) => body[key] !== undefined);
  const regionalAllowedKeys = ["scheduledDate", "scheduledTime", "coordinationNote", "status", "completionNote"];
  const regionalTouchedKeys = Object.keys(body || {}).filter((key) => body[key] !== undefined);
  let regionalProfile = null;

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

  if (isRegionalDispatcher) {
    if (regionalTouchedKeys.some((key) => !regionalAllowedKeys.includes(key))) {
      return json({ message: "Regional accounts can only reschedule with a note or mark the order as completed" }, 403, request, env);
    }

    regionalProfile = await env.DB.prepare(
      "SELECT id, user_id, name, zone FROM technicians WHERE user_id = ?"
    )
      .bind(Number(actor.sub))
      .first();

    if (!regionalProfile) {
      return json({ message: "Regional profile not found" }, 404, request, env);
    }

    if (getOrderRegionKey({ city: existing.city }) !== normalizeRegionKey(regionalProfile.zone)) {
      return json({ message: "This order does not belong to your assigned region" }, 403, request, env);
    }
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

  if (isRegionalDispatcher && body.status !== undefined && !["scheduled", "completed"].includes(status)) {
    return json({ message: "Regional accounts can only keep the order scheduled or mark it as completed" }, 400, request, env);
  }

  if (
    isRegionalDispatcher &&
    (body.scheduledDate !== undefined || body.scheduledTime !== undefined) &&
    !coordinationNote
  ) {
    return json({ message: "A coordination note is required when rescheduling an order" }, 400, request, env);
  }

  const serviceItemsTotal = calculateServiceItemsTotal(body.serviceItems || []);
  const extrasTotal =
    calculateExtrasTotal(existing.copper_meters, Boolean(existing.base_included)) + serviceItemsTotal;

  const nextAuditLog = normalizeAuditLogEntries([
    ...auditLog,
    {
      type: isOperationsManager
        ? "coordination"
        : isTechnician
          ? "signature"
          : isRegionalDispatcher
            ? "regional_dispatch"
            : "customer_action",
      actor: isOperationsManager
        ? "operations_manager"
        : isTechnician
          ? "technician"
          : isRegionalDispatcher
            ? "regional_dispatcher"
            : "customer_service",
      message: isOperationsManager
        ? "قام مدير العمليات بتحديث الموعد أو حالة الطلب."
        : isTechnician
          ? "قام الفني بتحديث توقيع العميل."
          : isRegionalDispatcher
            ? status === "completed"
              ? `أكملت جهة المنطقة الطلب.${completionNote ? ` ملاحظة الإكمال: ${completionNote}` : ""}`
              : `أعادت جهة المنطقة جدولة الطلب.${coordinationNote ? ` الملاحظة: ${coordinationNote}` : ""}`
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
      notes,
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
      coordinationNote,
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
      `لديك الآن مهمة جديدة برقم #${orderId}.`,
      "assignment",
      orderId
    );
  }

  if (isCustomerService && customerAction === "reschedule_requested") {
    await notifyUsersByRoles(
      env,
      ["operations_manager"],
      "طلب إعادة جدولة",
      `طلبت خدمة العملاء إعادة جدولة الطلب رقم ${requestNumber}${rescheduleReason ? ` بسبب: ${rescheduleReason}` : ""}.`,
      orderId
    );
  }

  if (isCustomerService && status === "canceled") {
    await notifyUsersByRoles(
      env,
      ["operations_manager"],
      "تم إلغاء طلب",
      `تم إلغاء الطلب رقم ${requestNumber}${cancellationReason ? ` بسبب: ${cancellationReason}` : ""}.`,
      orderId
    );
  }

  if (isOperationsManager && (body.scheduledDate !== undefined || body.scheduledTime !== undefined)) {
    await notifyUsersByRoles(
      env,
      ["customer_service"],
      "تم تنسيق موعد الطلب",
      `تم تحديد موعد الطلب رقم ${requestNumber} بتاريخ ${scheduledDate || "-"} الساعة ${scheduledTime || "-"}.`,
      orderId
    );

    await notifyRegionalDispatchersForOrder(
      env,
      { city },
      "تم تسليم طلب جديد للمنطقة",
      `قام مدير العمليات بتحديد موعد الطلب رقم ${requestNumber} لمنطقتك بتاريخ ${scheduledDate || "-"} الساعة ${scheduledTime || "-"}.`,
      orderId
    );
  }

  if (isOperationsManager && body.status !== undefined && status !== String(existing.status || "").trim()) {
    await notifyUsersByRoles(
      env,
      ["customer_service"],
      "تم تحديث حالة الطلب",
      `تم تحديث حالة الطلب رقم ${requestNumber} إلى ${mapOrderStatusLabel(status)}.`,
      orderId
    );

    await notifyRegionalDispatchersForOrder(
      env,
      { city },
      "تحديث على طلب المنطقة",
      `قام مدير العمليات بتحديث الطلب رقم ${requestNumber} إلى ${mapOrderStatusLabel(status)} ضمن منطقتك.`,
      orderId
    );
  }

  if (isCustomerService && deliveryType !== "none") {
    await notifyUsersByRoles(
      env,
      ["operations_manager"],
      "طلب توصيل بأولوية قصوى",
      `الطلب رقم ${requestNumber} مسجل كـ ${deliveryType === "express_24h" ? "توصيل سريع خلال 24 ساعة" : "طلب توصيل"} ويحتاج إلى متابعة عاجلة.`,
      orderId
    );
  }

  if (isRegionalDispatcher && (body.scheduledDate !== undefined || body.scheduledTime !== undefined)) {
    await notifyUsersByRoles(
      env,
      ["operations_manager"],
      "إعادة جدولة من حساب المنطقة",
      `أعادت ${regionalProfile?.name || "جهة المنطقة"} جدولة الطلب رقم ${requestNumber}.${coordinationNote ? ` الملاحظة: ${coordinationNote}` : ""}`,
      orderId
    );
  }

  if (isRegionalDispatcher && status === "completed" && status !== String(existing.status || "").trim()) {
    await notifyUsersByRoles(
      env,
      ["operations_manager", "customer_service"],
      "تم إكمال الطلب من حساب المنطقة",
      `أكملت ${regionalProfile?.name || "جهة المنطقة"} الطلب رقم ${requestNumber}.${completionNote ? ` الملاحظة: ${completionNote}` : ""}`,
      orderId
    );
  }

  const order = await readServiceOrderById(env, orderId);
  return json({ order }, 200, request, env);
}

async function updateTechnicianAvailability(request, technicianId, env) {
  const user = await requireRoles(request, env, ["admin", "technician"]);
  if (!user) {
    return json({ message: "Unauthorized" }, 401, request, env);
  }

  const id = Number(technicianId);
  if (!Number.isInteger(id) || id <= 0) {
    return json({ message: "Invalid technician id" }, 400, request, env);
  }

  const technician = await env.DB.prepare(
    "SELECT id, user_id, name, phone, zone, status, COALESCE(notes, '') AS notes FROM technicians WHERE id = ?"
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
    "SELECT id, user_id, name, phone, zone, status, COALESCE(notes, '') AS notes FROM technicians WHERE id = ?"
  )
    .bind(id)
    .first();

  return json({ technician: mapTechnician(nextTechnician) }, 200, request, env);
}

async function getTechnicianOrders(request, env) {
  const user = await requireRoles(request, env, ["technician", "regional_dispatcher"]);
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
      t.status,
      COALESCE(t.notes, '') AS notes,
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

  const isRegionalDispatcher = normalizeServerRole(user.role) === "regional_dispatcher";
  const statement = isRegionalDispatcher
    ? env.DB.prepare(
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
         ORDER BY o.id DESC`
      )
    : env.DB.prepare(
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
  const scopedResults = isRegionalDispatcher
    ? (results || []).filter((row) => getOrderRegionKey({ city: row.city }) === normalizeRegionKey(technician.zone))
    : results || [];

  const areaClusters = await readInternalAreaClusters(env);
  const orders = await Promise.all(scopedResults.map((row) => mapServiceOrderRow(env, row, areaClusters)));
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

  await notifyAdmins(
    env,
    "تم إلغاء الطلب",
    `تم إلغاء الطلب #${orderId}${reason ? ` بسبب: ${reason}` : ""}.`,
    orderId
  );

  const updated = await readServiceOrderById(env, orderId);
  return json({ order: updated }, 200, request, env);
}

async function updateServiceOrderStatus(request, id, env) {
  const user = await requireRoles(request, env, ["operations_manager", "technician"]);
  if (!user) {
    return json({ message: "Operations manager or technician access required" }, 401, request, env);
  }
  const isTechnician = user.role === "technician";

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
      actor: isTechnician ? "technician" : "operations_manager",
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
      ["customer_service"],
      "الطلب في الطريق",
      `الطلب رقم ${order.request_number || order.customer_name} في الطريق للعميل الآن.`,
      orderId
    );
  }

  if (status === "completed") {
    await notifyUsersByRoles(
      env,
      ["operations_manager", "customer_service"],
      "تم إنهاء الطلب من الفني",
      `قام الفني بإنهاء الطلب رقم ${order.request_number || order.customer_name}.`,
      orderId
    );
  }

  if (requestedStatus === "rescheduled") {
    await notifyUsersByRoles(
      env,
      ["operations_manager", "customer_service"],
      "طلب إعادة جدولة من الفني",
      `طلب الفني إعادة جدولة الطلب رقم ${order.request_number || order.customer_name}${suspensionReason ? ` بسبب: ${suspensionReason}` : ""}.`,
      orderId
    );
  }

  if (status === "suspended" && requestedStatus !== "rescheduled") {
    await notifyUsersByRoles(
      env,
      ["operations_manager"],
      "تم تعليق مهمة ميدانية",
      `قام الفني بتعليق الطلب رقم ${order.request_number || order.customer_name}${suspensionReason ? ` بسبب: ${suspensionReason}` : ""}.`,
      orderId
    );
  }

  const updated = await readServiceOrderById(env, orderId);
  return json({ order: updated }, 200, request, env);
}

async function quickUpdateCompactOrderStatus(request, id, env) {
  const user = await requireRoles(request, env, ["operations_manager"]);
  if (!user) {
    return json({ message: "Operations manager access required" }, 401, request, env);
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
      actor: "operations_manager",
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
      ["customer_service"],
      "تمت إعادة جدولة الطلب",
      `تمت إعادة جدولة الطلب رقم ${order.request_number || order.customer_name}.`,
      orderId
    );

    await notifyRegionalDispatchersForOrder(
      env,
      { city: order.city },
      "تمت إعادة جدولة طلب المنطقة",
      `أعاد مدير العمليات جدولة الطلب رقم ${order.request_number || order.customer_name}.`,
      orderId
    );
  }

  if (requestedStatus === "completed") {
    await notifyUsersByRoles(
      env,
      ["customer_service"],
      "تم إنهاء الطلب",
      `تم الانتهاء من الطلب رقم ${order.request_number || order.customer_name} بنجاح.`,
      orderId
    );

    await notifyRegionalDispatchersForOrder(
      env,
      { city: order.city },
      "تم إنهاء طلب المنطقة",
      `قام مدير العمليات بإنهاء الطلب رقم ${order.request_number || order.customer_name}.`,
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

  await notifyAdmins(
    env,
    "جاهز لإغلاق الزامل",
    `الفني ${order.technician_name || "الميداني"} جاهز لإغلاق الطلب #${orderId} للعميل ${order.customer_name}.`,
    orderId
  );

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

  await notifyAdmins(
    env,
    "تم استلام OTP",
    `وصل رمز OTP للطلب #${orderId} من الفني ${order.technician_name || "الميداني"}.`,
    orderId
  );

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

  await notifyAdmins(
    env,
    "تحديث تكلفة إضافية",
    `تم تحديث إضافات الطلب #${orderId} إلى ${extrasTotal} ر.س.`,
    orderId
  );

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

  await notifyAdmins(
    env,
    "تم رفع صورة توثيق",
    `تم رفع صورة جديدة للطلب #${orderId}.`,
    orderId
  );

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
           WHERE user_id = ? AND id > ?
           ORDER BY id DESC
           LIMIT 40`
        ).bind(Number(user.sub), sinceId)
      : env.DB.prepare(
          `SELECT id, title, body, kind, related_order_id, is_read, created_at
           FROM notifications
           WHERE user_id = ?
           ORDER BY id DESC
           LIMIT 40`
        ).bind(Number(user.sub));

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
    "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?"
  )
    .bind(Number(id), Number(user.sub))
    .run();

  return json({ ok: true }, 200, request, env);
}

async function markAllNotificationsRead(request, env) {
  const user = await readActiveUser(request, env);
  if (!user) {
    return json({ message: "Unauthorized" }, 401, request, env);
  }

  await env.DB.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?")
    .bind(Number(user.sub))
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
      t.status,
      COALESCE(t.notes, '') AS notes,
      u.email
     FROM technicians t
     LEFT JOIN users u ON u.id = t.user_id
     ORDER BY t.id ASC`
  ).all();

  return (results || []).map(mapTechnician);
}

function mapTechnician(row) {
  const regionConfig = getOperationsRegionByKey(row.zone);

  return {
    id: String(row.id),
    userId: String(row.user_id),
    name: row.name,
    email: row.email || "",
    phone: row.phone,
    region: regionConfig ? regionConfig.ar : row.zone,
    zone: regionConfig ? regionConfig.key : row.zone,
    status: row.status,
    notes: row.notes || "",
  };
}

function normalizeTechnicianStatus(status) {
  return ["available", "busy"].includes(String(status || "").trim()) ? String(status).trim() : "available";
}

function normalizeServerRole(role) {
  if (role === "admin") {
    return "operations_manager";
  }

  return String(role || "").trim();
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

  return Promise.all((results || []).map((row) => mapServiceOrderRow(env, row, areaClusters)));
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

  return mapServiceOrderRow(env, row, areaClusters);
}

async function mapServiceOrderRow(env, row, areaClusters = []) {
  const { results } = await env.DB.prepare(
    `SELECT id, image_name, image_url, created_at
     FROM service_order_photos
     WHERE order_id = ?
     ORDER BY id DESC`
  )
    .bind(Number(row.id))
    .all();

  return {
    id: `ORD-${row.id}`,
    numericId: row.id,
    requestNumber: row.request_number || row.customer_name,
    customerName: row.customer_name,
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
    photos: (results || []).map((photo) => ({
      id: `photo-${photo.id}`,
      name: photo.image_name,
      url: photo.image_url,
      uploadedAt: photo.created_at,
    })),
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
    }),
    {
      totalOrders: 0,
      pendingOrders: 0,
      activeOrders: 0,
      completedOrders: 0,
      inTransitOrders: 0,
      canceledOrders: 0,
    }
  );
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
  const notes = String(body.notes || "").trim();
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

async function createNotification(env, userId, title, body, kind = "info", relatedOrderId = null) {
  await env.DB.prepare(
    `INSERT INTO notifications (user_id, title, body, kind, related_order_id, is_read)
     VALUES (?, ?, ?, ?, ?, 0)`
  )
    .bind(Number(userId), title, body, kind, relatedOrderId ? Number(relatedOrderId) : null)
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

async function notifyUsersByRoles(env, roles = [], title, body, relatedOrderId = null) {
  const roleList = (roles || []).map((role) => `'${String(role).replace(/'/g, "''")}'`).join(", ");
  if (!roleList) {
    return;
  }

  const { results } = await env.DB.prepare(
    `SELECT id FROM users WHERE role IN (${roleList}) AND status = 'active'`
  ).all();

  for (const user of results || []) {
    await createNotification(env, user.id, title, body, "status_update", relatedOrderId);
  }
}

async function notifyRegionalDispatchersForOrder(env, order = {}, title, body, relatedOrderId = null) {
  const regionKey = getOrderRegionKey(order);
  if (!regionKey) {
    return;
  }

  await notifyRegionalDispatchersByRegion(env, regionKey, title, body, relatedOrderId);
}

async function notifyRegionalDispatchersByRegion(env, regionKey, title, body, relatedOrderId = null) {
  if (!regionKey) {
    return;
  }

  const { results } = await env.DB.prepare(
    `SELECT u.id
     FROM users u
     JOIN technicians t ON t.user_id = u.id
     WHERE u.role = 'regional_dispatcher' AND u.status = 'active' AND LOWER(TRIM(t.zone)) = ?`
  )
    .bind(regionKey)
    .all();

  for (const user of results || []) {
    await createNotification(env, user.id, title, body, "assignment", relatedOrderId);
  }
}

async function readExistingServiceOrderNumbers(env, requestNumbers = []) {
  const normalized = Array.from(
    new Set(
      (requestNumbers || [])
        .map((value) => String(value || "").trim())
        .filter(Boolean)
    )
  );

  const existing = new Set();
  for (let index = 0; index < normalized.length; index += 50) {
    const chunk = normalized.slice(index, index + 50);
    if (!chunk.length) {
      continue;
    }

    const placeholders = chunk.map(() => "?").join(", ");
    const { results } = await env.DB.prepare(
      `SELECT request_number FROM service_orders WHERE request_number IN (${placeholders})`
    )
      .bind(...chunk)
      .all();

    for (const row of results || []) {
      const requestNumber = String(row?.request_number || "").trim();
      if (requestNumber) {
        existing.add(requestNumber);
      }
    }
  }

  return existing;
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
  const heroKicker = String(body.heroKicker || "").trim();
  const heroTitle = String(body.heroTitle || "").trim();
  const heroSubtitle = String(body.heroSubtitle || "").trim();
  const primaryButtonText = String(body.primaryButtonText || "").trim();
  const primaryButtonUrl = String(body.primaryButtonUrl || "").trim();
  const secondaryButtonText = String(body.secondaryButtonText || "").trim();
  const secondaryButtonUrl = String(body.secondaryButtonUrl || "").trim();
  const stats = normalizeHomeStats(body.stats);

  if (!heroKicker || !heroTitle || !heroSubtitle) {
    return { error: "Hero content is required" };
  }

  if (!primaryButtonText || !primaryButtonUrl || !secondaryButtonText || !secondaryButtonUrl) {
    return { error: "Hero buttons are required" };
  }

  if (stats.error) {
    return { error: stats.error };
  }

  return {
    heroKicker,
    heroTitle,
    heroSubtitle,
    primaryButtonText,
    primaryButtonUrl,
    secondaryButtonText,
    secondaryButtonUrl,
    stats: stats.items,
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

  return mapFooterSettings(row);
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
      "مساحة داخلية مبسطة لإدارة الطلبات بين خدمة العملاء ومدير العمليات فقط.",
    usefulLinks: [
      { label: "الرئيسية", url: "/" },
      { label: "اللوحة الداخلية", url: "/dashboard" },
      { label: "تسجيل الدخول", url: "/login" },
    ],
    customerServiceLinks: [
      { label: "الدعم", url: "tel:+966558232644" },
      { label: "واتساب", url: "https://wa.me/966558232644" },
      { label: "اتصل بنا", url: "tel:+966558232644" },
    ],
    socialLinks: [
      { platform: "instagram", url: "https://instagram.com/tarkeebpro" },
      { platform: "x", url: "https://x.com/tarkeebpro" },
      { platform: "linkedin", url: "https://linkedin.com/company/tarkeebpro" },
    ],
    copyrightText: "جميع الحقوق محفوظة لكميل",
  };
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

  return {
    heroKicker: row.hero_kicker,
    heroTitle: row.hero_title,
    heroSubtitle: row.hero_subtitle,
    primaryButtonText: row.primary_button_text,
    primaryButtonUrl: row.primary_button_url,
    secondaryButtonText: row.secondary_button_text,
    secondaryButtonUrl: row.secondary_button_url,
    stats: parseJsonArray(row.stats_json),
  };
}

function getDefaultHomeSettings() {
  return {
    heroKicker: "Built for the team",
    heroTitle: "Made with care to simplify the journey of customer service and the operations manager.",
    heroSubtitle: "A private request workspace that keeps intake fast, statuses clear, and heavy daily order volumes easier to manage.",
    primaryButtonText: "Open Dashboard",
    primaryButtonUrl: "/dashboard",
    secondaryButtonText: "Login",
    secondaryButtonUrl: "/login",
    stats: [
      { value: "2", label: "Dedicated internal roles" },
      { value: "4", label: "Clear request stages" },
      { value: "1", label: "Shared operations board" },
      { value: "Instant", label: "Customer service alerts" },
    ],
  };
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
      ...buildCorsHeaders(request, env),
    },
  });
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
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
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

function isInternalProxyRequest(request) {
  return request.headers.get(INTERNAL_PROXY_HEADER) === "1";
}

async function validateCloudflareAccess(request, env) {
  const token =
    request.headers.get("CF-Access-Jwt-Assertion") ||
    request.headers.get("Cf-Access-Jwt-Assertion") ||
    request.headers.get("cf-access-jwt-assertion");

  if (!token) {
    return json({ message: "Cloudflare Access token required" }, 401, request, env);
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return json({ message: "Invalid Cloudflare Access token" }, 401, request, env);
  }

  let header;
  let payload;

  try {
    header = JSON.parse(base64UrlDecode(parts[0]));
    payload = JSON.parse(base64UrlDecode(parts[1]));
  } catch {
    return json({ message: "Invalid Cloudflare Access token" }, 401, request, env);
  }

  const audience = env.ACCESS_AUD || DEFAULT_ACCESS_AUD;
  if (!hasAudience(payload.aud, audience)) {
    return json({ message: "Invalid Cloudflare Access audience" }, 403, request, env);
  }

  const jwksUrl = env.ACCESS_JWKS_URL || DEFAULT_ACCESS_JWKS_URL;
  const issuer = new URL(jwksUrl).origin;
  if (payload.iss && payload.iss !== issuer) {
    return json({ message: "Invalid Cloudflare Access issuer" }, 403, request, env);
  }

  if (payload.exp && Number(payload.exp) < Math.floor(Date.now() / 1000)) {
    return json({ message: "Cloudflare Access token expired" }, 401, request, env);
  }

  const jwkSet = await getAccessJwks(jwksUrl);
  const jwk = jwkSet.find((entry) => entry.kid === header.kid);
  if (!jwk) {
    return json({ message: "Cloudflare Access signing key not found" }, 401, request, env);
  }

  const publicKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["verify"]
  );

  const verified = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    publicKey,
    base64UrlToBytes(parts[2]),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
  );

  if (!verified) {
    return json({ message: "Cloudflare Access token verification failed" }, 401, request, env);
  }

  return null;
}

function hasAudience(audience, expectedAudience) {
  if (Array.isArray(audience)) {
    return audience.includes(expectedAudience);
  }

  return String(audience || "") === expectedAudience;
}

async function getAccessJwks(jwksUrl) {
  const cacheKey = String(jwksUrl);
  const cached = jwksCache.get(cacheKey);
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    return cached.keys;
  }

  const response = await fetch(jwksUrl);
  if (!response.ok) {
    throw new Error(`Unable to load Cloudflare Access JWKs from ${jwksUrl}`);
  }

  const data = await response.json();
  const keys = Array.isArray(data?.keys) ? data.keys : [];
  jwksCache.set(cacheKey, { keys, expiresAt: now + 60 * 60 * 1000 });
  return keys;
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

function base64UrlToBytes(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "===".slice((base64.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

function base64UrlFromBytes(bytes) {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function readAuthUser(request, env) {
  const auth = request.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return null;
  const token = auth.slice("Bearer ".length);
  return verifyJwt(token, env.JWT_SECRET || "dev-secret");
}

async function readActiveUser(request, env) {
  const payload = await readAuthUser(request, env);
  if (!payload || (payload.status || "active") !== "active") {
    return null;
  }

  return payload;
}

async function requireAdmin(request, env) {
  const payload = await readActiveUser(request, env);
  if (!payload || normalizeServerRole(payload.role) !== "operations_manager") {
    return null;
  }

  return { ...payload, role: normalizeServerRole(payload.role) };
}

async function requireRoles(request, env, roles = []) {
  const payload = await readActiveUser(request, env);
  const normalizedRole = normalizeServerRole(payload?.role);
  if (!payload || !roles.includes(normalizedRole)) {
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
