const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
};

export default {
  async fetch(request, env) {
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
          200
        );
      }

      if (path === "/api/auth/register" && request.method === "POST") {
        return register(request, env);
      }

      if (path === "/api/auth/login" && request.method === "POST") {
        return login(request, env);
      }

      if (path === "/api/products" && request.method === "GET") {
        return listProducts(url, env);
      }

      if (path === "/api/products" && request.method === "POST") {
        return createProduct(request, env);
      }

      if (path.startsWith("/api/products/") && request.method === "GET") {
        const id = path.split("/").pop();
        return getProductById(id, env);
      }

      return json({ message: "Route not found" }, 404);
    } catch (error) {
      return json(
        {
          message: "Internal error",
          error: error?.message || "Unknown error",
        },
        500
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
    return json({ message: "Invalid name, email, or password" }, 400);
  }

  const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?")
    .bind(email)
    .first();

  if (existing) {
    return json({ message: "Email already exists" }, 409);
  }

  const passwordHash = await hashPassword(password, email);
  const created = await env.DB.prepare(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)"
  )
    .bind(name, email, passwordHash)
    .run();

  const userId = created.meta.last_row_id;
  const token = await signJwt(
    { sub: String(userId), email, name },
    env.JWT_SECRET || "dev-secret"
  );

  return json(
    {
      token,
      user: { id: userId, name, email },
    },
    201
  );
}

async function login(request, env) {
  const body = await readJson(request);
  const email = (body.email || "").toLowerCase().trim();
  const password = body.password || "";

  if (!email || !password) {
    return json({ message: "Email and password are required" }, 400);
  }

  const user = await env.DB.prepare(
    "SELECT id, name, email, password_hash FROM users WHERE email = ?"
  )
    .bind(email)
    .first();

  if (!user) {
    return json({ message: "Invalid credentials" }, 401);
  }

  const passwordHash = await hashPassword(password, email);
  if (passwordHash !== user.password_hash) {
    return json({ message: "Invalid credentials" }, 401);
  }

  const token = await signJwt(
    { sub: String(user.id), email: user.email, name: user.name },
    env.JWT_SECRET || "dev-secret"
  );

  return json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
}

async function listProducts(url, env) {
  const category = (url.searchParams.get("category") || "").trim();
  const city = (url.searchParams.get("city") || "").trim();
  const limit = Math.min(Number(url.searchParams.get("limit") || 12), 50);
  const page = Math.max(Number(url.searchParams.get("page") || 1), 1);
  const offset = (page - 1) * limit;

  let query = "SELECT id, name, description, category, city, price_per_day, rating, image_url FROM products WHERE 1=1";
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

  return json({
    products: (results || []).map(mapProduct),
    page,
    limit,
  });
}

async function getProductById(id, env) {
  if (!/^\d+$/.test(String(id))) {
    return json({ message: "Invalid product id" }, 400);
  }

  const product = await env.DB.prepare(
    "SELECT id, name, description, category, city, price_per_day, rating, image_url FROM products WHERE id = ?"
  )
    .bind(Number(id))
    .first();

  if (!product) {
    return json({ message: "Product not found" }, 404);
  }

  return json({ product: mapProduct(product) });
}

async function createProduct(request, env) {
  const payload = await readAuthUser(request, env);
  if (!payload) {
    return json({ message: "Unauthorized" }, 401);
  }

  const body = await readJson(request);
  const name = (body.name || "").trim();
  const description = (body.description || "").trim();
  const category = (body.category || "device").trim();
  const city = (body.city || "Riyadh").trim();
  const price = Number(body.pricePerDay || 0);
  const imageUrl = (body.imageUrl || "").trim();

  if (!name || !description || !Number.isFinite(price) || price < 0) {
    return json({ message: "Invalid product payload" }, 400);
  }

  const created = await env.DB.prepare(
    "INSERT INTO products (owner_user_id, name, description, category, city, price_per_day, rating, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  )
    .bind(Number(payload.sub), name, description, category, city, price, 0, imageUrl || null)
    .run();

  return json({ id: created.meta.last_row_id, message: "Product created" }, 201);
}

function mapProduct(row) {
  return {
    _id: String(row.id),
    name: row.name,
    description: row.description,
    category: row.category,
    city: row.city,
    pricePerDay: row.price_per_day,
    rating: row.rating,
    images: [{ url: row.image_url || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80" }],
  };
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
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
