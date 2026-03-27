const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

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
            service: "rentit-edge-api",
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

  const token = await signJwt(
    {
      sub: String(user.id),
      email: user.email,
      name: user.name,
      role: user.role || "member",
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
        role: user.role || "member",
        status: user.status || "active",
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
  return {
    _id: String(row.id),
    ownerUserId: row.owner_user_id ? String(row.owner_user_id) : null,
    name: row.name,
    description: row.description,
    category: row.category,
    city: row.city,
    pricePerDay: row.price_per_day,
    rating: row.rating,
    quantity: row.quantity ?? 1,
    images: [
      {
        url:
          row.image_url ||
          "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80",
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
      "Rent It منصة موثوقة لتأجير المنتجات والخدمات بسهولة واحترافية، مع تجربة استخدام مرنة ودعم سريع للعملاء.",
    usefulLinks: [
      { label: "الرئيسية", url: "/" },
      { label: "المنتجات", url: "/products" },
      { label: "طلباتي", url: "/orders" },
    ],
    customerServiceLinks: [
      { label: "الدعم الفني", url: "mailto:support@rentit.app" },
      { label: "واتساب", url: "https://wa.me/966500000000" },
      { label: "الأسئلة الشائعة", url: "/products" },
    ],
    socialLinks: [
      { platform: "instagram", url: "https://instagram.com/rentit.app" },
      { platform: "x", url: "https://x.com/rentitapp" },
      { platform: "linkedin", url: "https://linkedin.com/company/rentit" },
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
    heroKicker: "RentIT Marketplace",
    heroTitle: "Rent smarter. Own less. Do more.",
    heroSubtitle: "Discover verified rentals for devices, costumes, and services across Saudi Arabia.",
    primaryButtonText: "Browse Products",
    primaryButtonUrl: "/products",
    secondaryButtonText: "Get Started",
    secondaryButtonUrl: "/register",
    stats: [
      { value: "10K+", label: "Trusted Users" },
      { value: "4.9/5", label: "Average Rating" },
      { value: "35+", label: "Cities Covered" },
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
  if (!payload || payload.role !== "admin") {
    return null;
  }

  return payload;
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
