// Cloudflare Pages Function — handles every request to /api/*
// Needs one D1 database binding named DB (set in Cloudflare project settings).
// Tables are created automatically on first request.

const CATEGORIES = ["Women's clothes", "Men's clothes", "Shoes", "Bags", "Kids", "Phones & gadgets", "Home & kitchen", "Furniture", "Other"];
const CONDITIONS = ["New with tags", "Like new", "Good", "Fair"];
const PAGE_SIZE = 24;

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL UNIQUE, city TEXT, pass_hash TEXT NOT NULL, salt TEXT NOT NULL, created_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id INTEGER NOT NULL, expires INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS listings (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, title TEXT NOT NULL, description TEXT, price INTEGER NOT NULL, category TEXT NOT NULL, item_condition TEXT NOT NULL, size TEXT, city TEXT, area TEXT, status TEXT NOT NULL DEFAULT 'active', created_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, listing_id INTEGER NOT NULL, pos INTEGER NOT NULL DEFAULT 0, data TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_listings_feed ON listings(status, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_listings_user ON listings(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_images_listing ON images(listing_id, pos)`,
];

let schemaReady = false;
async function ensureSchema(env) {
  if (schemaReady) return;
  await env.DB.batch(SCHEMA.map((s) => env.DB.prepare(s)));
  schemaReady = true;
}

// ---------- helpers ----------
const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", ...headers } });
const err = (msg, status = 400) => json({ error: msg }, status);

function randHex(n) {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return [...a].map((x) => x.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: enc.encode(salt), iterations: 100000 },
    key,
    256
  );
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

// Accepts 080..., 80..., +23480..., 23480... → returns 080xxxxxxxx or null
function normPhone(p) {
  let d = String(p || "").replace(/\D/g, "");
  if (d.startsWith("234")) d = "0" + d.slice(3);
  if (d.length === 10 && !d.startsWith("0")) d = "0" + d;
  return /^0[789]\d{9}$/.test(d) ? d : null;
}

function getCookie(req, name) {
  const c = req.headers.get("cookie") || "";
  const m = c.match(new RegExp("(?:^|; )" + name + "=([^;]+)"));
  return m ? m[1] : null;
}

async function currentUser(env, req) {
  const t = getCookie(req, "sid");
  if (!t) return null;
  return await env.DB.prepare(
    "SELECT u.id, u.name, u.phone, u.city FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ? AND s.expires > ?"
  ).bind(t, Date.now()).first();
}

async function startSession(env, userId) {
  const token = randHex(32);
  const days = 30;
  await env.DB.prepare("INSERT INTO sessions (token, user_id, expires) VALUES (?, ?, ?)")
    .bind(token, userId, Date.now() + days * 864e5).run();
  return `sid=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${days * 86400}`;
}

const body = (req) => req.json().catch(() => ({}));
const clean = (v, max) => String(v ?? "").trim().slice(0, max);

// ---------- router ----------
export async function onRequest({ request, env, params }) {
  if (!env.DB) {
    return err("The database isn't connected yet. In Cloudflare, add a D1 binding named DB to this project, then redeploy.", 500);
  }
  try {
    await ensureSchema(env);
    const [a, b, c] = params.path || [];
    const m = request.method;

    if (a === "signup" && m === "POST") return await signup(request, env);
    if (a === "login" && m === "POST") return await login(request, env);
    if (a === "logout" && m === "POST") return await logout(request, env);
    if (a === "me" && m === "GET") return json({ user: await currentUser(env, request) });
    if (a === "img" && b && m === "GET") return await image(env, b);
    if (a === "my-listings" && m === "GET") return await myListings(request, env);
    if (a === "listings" && !b && m === "GET") return await feed(request, env);
    if (a === "listings" && !b && m === "POST") return await createListing(request, env);
    if (a === "listings" && b && !c && m === "GET") return await getListing(request, env, b);
    if (a === "listings" && b && !c && m === "DELETE") return await deleteListing(request, env, b);
    if (a === "listings" && b && c === "status" && m === "POST") return await setStatus(request, env, b);

    return err("Not found", 404);
  } catch (e) {
    return err("Server error: " + e.message, 500);
  }
}

// ---------- auth ----------
async function signup(request, env) {
  const d = await body(request);
  const name = clean(d.name, 60);
  const phone = normPhone(d.phone);
  const city = clean(d.city, 40);
  const pw = String(d.password || "");
  if (!name) return err("Enter your name.");
  if (!phone) return err("Enter a valid Nigerian phone number, like 08012345678.");
  if (pw.length < 6) return err("Password must be at least 6 characters.");

  const exists = await env.DB.prepare("SELECT id FROM users WHERE phone = ?").bind(phone).first();
  if (exists) return err("This phone number already has an account. Log in instead.");

  const salt = randHex(16);
  const hash = await hashPassword(pw, salt);
  const r = await env.DB.prepare(
    "INSERT INTO users (name, phone, city, pass_hash, salt, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(name, phone, city, hash, salt, Date.now()).run();

  const cookie = await startSession(env, r.meta.last_row_id);
  return json({ ok: true }, 200, { "set-cookie": cookie });
}

async function login(request, env) {
  const d = await body(request);
  const phone = normPhone(d.phone);
  const pw = String(d.password || "");
  if (!phone || !pw) return err("Enter your phone number and password.");

  const u = await env.DB.prepare("SELECT id, pass_hash, salt FROM users WHERE phone = ?").bind(phone).first();
  if (!u || (await hashPassword(pw, u.salt)) !== u.pass_hash) {
    return err("Phone number or password is incorrect.", 401);
  }
  const cookie = await startSession(env, u.id);
  return json({ ok: true }, 200, { "set-cookie": cookie });
}

async function logout(request, env) {
  const t = getCookie(request, "sid");
  if (t) await env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(t).run();
  return json({ ok: true }, 200, { "set-cookie": "sid=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0" });
}

// ---------- images ----------
async function image(env, id) {
  const row = await env.DB.prepare("SELECT data FROM images WHERE id = ?").bind(parseInt(id) || 0).first();
  if (!row) return new Response("Not found", { status: 404 });
  const [, b64] = row.data.split(",");
  const bin = Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0));
  return new Response(bin, {
    headers: { "content-type": "image/jpeg", "cache-control": "public, max-age=31536000, immutable" },
  });
}

// ---------- listings ----------
const LIST_COLS = `l.id, l.title, l.price, l.item_condition AS condition, l.city, l.area, l.status,
  (SELECT i.id FROM images i WHERE i.listing_id = l.id ORDER BY i.pos LIMIT 1) AS cover`;

async function feed(request, env) {
  const url = new URL(request.url);
  const q = clean(url.searchParams.get("q"), 60);
  const cat = url.searchParams.get("category") || "";
  const city = url.searchParams.get("city") || "";
  const page = Math.max(0, parseInt(url.searchParams.get("page") || "0") || 0);

  let sql = `SELECT ${LIST_COLS} FROM listings l WHERE l.status = 'active'`;
  const binds = [];
  if (q) { sql += " AND (l.title LIKE ? OR l.description LIKE ?)"; binds.push(`%${q}%`, `%${q}%`); }
  if (cat) { sql += " AND l.category = ?"; binds.push(cat); }
  if (city) { sql += " AND l.city = ?"; binds.push(city); }
  sql += " ORDER BY l.created_at DESC LIMIT ? OFFSET ?";
  binds.push(PAGE_SIZE + 1, page * PAGE_SIZE);

  const { results } = await env.DB.prepare(sql).bind(...binds).all();
  return json({ items: results.slice(0, PAGE_SIZE), more: results.length > PAGE_SIZE });
}

async function myListings(request, env) {
  const me = await currentUser(env, request);
  if (!me) return err("Log in first.", 401);
  const { results } = await env.DB.prepare(
    `SELECT ${LIST_COLS} FROM listings l WHERE l.user_id = ? ORDER BY l.created_at DESC`
  ).bind(me.id).all();
  return json({ items: results });
}

async function getListing(request, env, id) {
  const l = await env.DB.prepare(
    `SELECT l.id, l.user_id, l.title, l.description, l.price, l.category, l.item_condition AS condition,
            l.size, l.city, l.area, l.status, l.created_at,
            u.name AS seller_name, u.phone AS seller_phone, u.created_at AS seller_since
     FROM listings l JOIN users u ON u.id = l.user_id WHERE l.id = ?`
  ).bind(parseInt(id) || 0).first();
  if (!l) return err("This item doesn't exist or was removed.", 404);

  const { results: imgs } = await env.DB.prepare(
    "SELECT id FROM images WHERE listing_id = ? ORDER BY pos"
  ).bind(l.id).all();

  const me = await currentUser(env, request);
  const mine = !!me && me.id === l.user_id;
  // Seller's phone is only shown to logged-in users
  if (!me) l.seller_phone = null;
  delete l.user_id;
  return json({ ...l, images: imgs.map((x) => x.id), mine, loggedIn: !!me });
}

async function createListing(request, env) {
  const me = await currentUser(env, request);
  if (!me) return err("Log in to sell an item.", 401);
  const d = await body(request);

  const title = clean(d.title, 80);
  const description = clean(d.description, 1500);
  const price = Math.round(Number(d.price));
  const category = d.category;
  const condition = d.condition;
  const size = clean(d.size, 20);
  const city = clean(d.city, 40);
  const area = clean(d.area, 40);
  const images = Array.isArray(d.images) ? d.images : [];

  if (title.length < 3) return err("Add a title for your item.");
  if (!Number.isFinite(price) || price < 100 || price > 100000000) return err("Enter a price of at least ₦100.");
  if (!CATEGORIES.includes(category)) return err("Pick a category.");
  if (!CONDITIONS.includes(condition)) return err("Pick the item's condition.");
  if (!city) return err("Pick your city.");
  if (images.length < 1) return err("Add at least one photo.");
  if (images.length > 5) return err("You can add up to 5 photos.");
  for (const img of images) {
    if (typeof img !== "string" || !img.startsWith("data:image/jpeg;base64,") || img.length > 900000) {
      return err("One of the photos is too large or not a valid image. Try a different photo.");
    }
  }

  const r = await env.DB.prepare(
    `INSERT INTO listings (user_id, title, description, price, category, item_condition, size, city, area, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`
  ).bind(me.id, title, description, price, category, condition, size, city, area, Date.now()).run();
  const listingId = r.meta.last_row_id;

  await env.DB.batch(
    images.map((data, i) =>
      env.DB.prepare("INSERT INTO images (listing_id, pos, data) VALUES (?, ?, ?)").bind(listingId, i, data)
    )
  );
  return json({ id: listingId });
}

async function ownListing(request, env, id) {
  const me = await currentUser(env, request);
  if (!me) return { error: err("Log in first.", 401) };
  const l = await env.DB.prepare("SELECT id, user_id FROM listings WHERE id = ?").bind(parseInt(id) || 0).first();
  if (!l) return { error: err("Item not found.", 404) };
  if (l.user_id !== me.id) return { error: err("You can only change your own items.", 403) };
  return { listing: l };
}

async function setStatus(request, env, id) {
  const { error, listing } = await ownListing(request, env, id);
  if (error) return error;
  const d = await body(request);
  const status = d.status === "sold" ? "sold" : "active";
  await env.DB.prepare("UPDATE listings SET status = ? WHERE id = ?").bind(status, listing.id).run();
  return json({ ok: true, status });
}

async function deleteListing(request, env, id) {
  const { error, listing } = await ownListing(request, env, id);
  if (error) return error;
  await env.DB.batch([
    env.DB.prepare("DELETE FROM images WHERE listing_id = ?").bind(listing.id),
    env.DB.prepare("DELETE FROM listings WHERE id = ?").bind(listing.id),
  ]);
  return json({ ok: true });
}
