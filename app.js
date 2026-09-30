// ====== CHANGE YOUR BRAND NAME HERE ======
const APP_NAME = "Thrift";
// =========================================

const CATEGORIES = ["Women's clothes", "Men's clothes", "Shoes", "Bags", "Kids", "Phones & gadgets", "Home & kitchen", "Furniture", "Other"];
const CONDITIONS = ["New with tags", "Like new", "Good", "Fair"];
const CITIES = ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Benin City", "Enugu", "Kano", "Owerri", "Uyo", "Calabar", "Abeokuta", "Warri", "Kaduna", "Jos", "Ilorin", "Other"];

const $ = (s, el = document) => el.querySelector(s);
const app = $("#app");
let ME = null;

const naira = (n) => "₦" + Number(n).toLocaleString("en-NG");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const options = (list, selected = "", placeholder = "") =>
  (placeholder ? `<option value="">${esc(placeholder)}</option>` : "") +
  list.map((x) => `<option ${x === selected ? "selected" : ""}>${esc(x)}</option>`).join("");

async function api(path, opts = {}) {
  const res = await fetch("/api/" + path, {
    method: opts.method || "GET",
    headers: { "content-type": "application/json" },
    credentials: "same-origin",
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({ error: "The server sent an unexpected response. Try again." }));
  if (!res.ok) throw new Error(data.error || "Something went wrong. Try again.");
  return data;
}

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("show"), 2600);
}

const go = (path) => (location.hash = "#" + path);

function parseHash() {
  const h = location.hash.slice(1) || "/";
  const [p, qs] = h.split("?");
  return { parts: p.split("/").filter(Boolean), query: new URLSearchParams(qs || "") };
}

// ---------- header ----------
function renderHeader() {
  document.title = APP_NAME;
  $("#brand").textContent = APP_NAME;
  $("#nav").innerHTML = ME
    ? `<a href="#/me">My items</a>`
    : `<a href="#/login">Log in</a><a href="#/signup">Sign up</a>`;
  const { query } = parseHash();
  $("#searchInput").value = query.get("q") || "";
}

$("#searchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const q = $("#searchInput").value.trim();
  const { query } = parseHash();
  query.set("q", q);
  if (!q) query.delete("q");
  query.delete("page");
  go("/?" + query.toString());
  $("#searchInput").blur();
});

// ---------- router ----------
async function route() {
  const { parts, query } = parseHash();
  renderHeader();
  $("#sellFab").style.display = parts[0] === "sell" ? "none" : "";
  window.scrollTo(0, 0);
  app.innerHTML = `<p class="loading">Loading…</p>`;
  try {
    if (!parts.length) return await feedPage(query);
    if (parts[0] === "item" && parts[1]) return await itemPage(parts[1]);
    if (parts[0] === "sell") return ME ? sellPage() : go("/login?next=/sell");
    if (parts[0] === "login") return authPage("login", query.get("next"));
    if (parts[0] === "signup") return authPage("signup", query.get("next"));
    if (parts[0] === "me") return ME ? await mePage() : go("/login?next=/me");
    app.innerHTML = `<div class="empty"><p>This page doesn't exist.</p><a class="btn" href="#/">Browse items</a></div>`;
  } catch (e) {
    app.innerHTML = `<div class="empty"><p>${esc(e.message)}</p><a class="btn ghost" href="#/">Back to items</a></div>`;
  }
}

// ---------- cards ----------
function card(l) {
  const meta = [l.condition, l.area || l.city].filter(Boolean).join(", ");
  return `<a class="card" href="#/item/${l.id}">
    <div class="ph">
      ${l.cover ? `<img loading="lazy" src="/api/img/${l.cover}" alt="">` : ""}
      <span class="tag">${naira(l.price)}</span>
      ${l.status === "sold" ? `<div class="sold-mark">Sold</div>` : ""}
    </div>
    <div class="title">${esc(l.title)}</div>
    <div class="meta">${esc(meta)}</div>
  </a>`;
}

// ---------- feed ----------
async function feedPage(query) {
  const q = query.get("q") || "";
  const category = query.get("category") || "";
  const city = query.get("city") || "";
  let page = 0;

  const setFilter = (key, val) => {
    const next = new URLSearchParams(query);
    if (val) next.set(key, val); else next.delete(key);
    go("/?" + next.toString());
  };

  const heading = q ? `Results for “${esc(q)}”` : category ? esc(category) : "Just listed";
  app.innerHTML = `
    <div class="chips" id="chips">
      <button class="chip" aria-pressed="${!category}" data-cat="">All</button>
      ${CATEGORIES.map((c) => `<button class="chip" aria-pressed="${c === category}" data-cat="${esc(c)}">${esc(c)}</button>`).join("")}
    </div>
    <div class="filter-row">
      <h1>${heading}</h1>
      <select id="cityFilter" aria-label="Filter by city">${options(CITIES, city, "All cities")}</select>
    </div>
    <div class="grid" id="grid"></div>
    <div id="feedFoot"></div>`;

  $("#chips").addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (b) setFilter("category", b.dataset.cat);
  });
  $("#cityFilter").addEventListener("change", (e) => setFilter("city", e.target.value));

  async function load() {
    const params = new URLSearchParams({ q, category, city, page });
    const data = await api("listings?" + params.toString());
    $("#grid").insertAdjacentHTML("beforeend", data.items.map(card).join(""));
    const foot = $("#feedFoot");
    if (page === 0 && !data.items.length) {
      foot.innerHTML = `<div class="empty"><p>${q || category || city ? "No items match that yet." : "Nothing listed yet. Be the first to sell something."}</p>
        <a class="btn" href="#/sell">Sell an item</a></div>`;
    } else if (data.more) {
      foot.innerHTML = `<button class="btn ghost more" id="moreBtn">Show more</button>`;
      $("#moreBtn").onclick = async (e) => {
        e.target.disabled = true;
        page++;
        await load();
      };
    } else {
      foot.innerHTML = "";
    }
  }
  await load();
}

// ---------- item ----------
function waLink(phone, title) {
  const intl = "234" + phone.replace(/^0/, "");
  const text = `Hi, I'm interested in your "${title}" on ${APP_NAME}: ${location.href}`;
  return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
}

async function itemPage(id) {
  const l = await api("listings/" + encodeURIComponent(id));
  const since = new Date(l.seller_since).toLocaleDateString("en-NG", { month: "short", year: "numeric" });
  const where = [l.area, l.city].filter(Boolean).join(", ");

  let contact;
  if (l.mine) {
    contact = `
      <button class="btn" id="toggleSold">${l.status === "sold" ? "Mark as available" : "Mark as sold"}</button>
      <button class="btn danger" id="deleteBtn">Delete item</button>`;
  } else if (l.status === "sold") {
    contact = `<p><strong>This item has been sold.</strong></p>`;
  } else if (l.loggedIn && l.seller_phone) {
    contact = `
      <a class="btn wa" href="${waLink(l.seller_phone, l.title)}" target="_blank" rel="noopener">Chat on WhatsApp</a>
      <a class="btn ghost" href="tel:${esc(l.seller_phone)}">Call ${esc(l.seller_phone)}</a>`;
  } else {
    contact = `<a class="btn" href="#/login?next=/item/${l.id}">Log in to contact seller</a>`;
  }

  app.innerHTML = `
    <article class="item">
      <div>
        <div class="gallery">${l.images.map((i) => `<img src="/api/img/${i}" alt="${esc(l.title)}">`).join("")}</div>
        ${l.images.length > 1 ? `<div class="gallery-count">${l.images.length} photos, swipe to see more</div>` : ""}
      </div>
      <div>
        <span class="tag big">${naira(l.price)}</span>
        <h1>${esc(l.title)}</h1>
        <dl class="facts">
          <dt>Condition</dt><dd>${esc(l.condition)}</dd>
          ${l.size ? `<dt>Size</dt><dd>${esc(l.size)}</dd>` : ""}
          <dt>Category</dt><dd>${esc(l.category)}</dd>
          <dt>Location</dt><dd>${esc(where)}</dd>
        </dl>
        ${l.description ? `<p class="desc">${esc(l.description)}</p>` : ""}
        <div class="seller">
          <strong>${esc(l.seller_name)}</strong>
          <div class="meta" style="color:var(--muted)">Selling on ${esc(APP_NAME)} since ${since}</div>
          <div class="actions">${contact}</div>
          ${l.mine ? "" : `<p class="tip">Meet in a busy public place and check the item before you pay. Never send money in advance to someone you haven't met.</p>`}
        </div>
      </div>
    </article>`;

  if (l.mine) {
    $("#toggleSold").onclick = async (e) => {
      e.target.disabled = true;
      try {
        await api(`listings/${l.id}/status`, { method: "POST", body: { status: l.status === "sold" ? "active" : "sold" } });
        toast(l.status === "sold" ? "Marked as available" : "Marked as sold");
        route();
      } catch (x) { toast(x.message); e.target.disabled = false; }
    };
    $("#deleteBtn").onclick = async (e) => {
      if (!confirm("Delete this item? This can't be undone.")) return;
      e.target.disabled = true;
      try {
        await api(`listings/${l.id}`, { method: "DELETE" });
        toast("Item deleted");
        go("/me");
      } catch (x) { toast(x.message); e.target.disabled = false; }
    };
  }
}

// ---------- sell ----------
function compress(file, max = 1000, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * s);
      c.height = Math.round(img.height * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => reject(new Error("Couldn't read one of the photos. Try a JPG or PNG."));
    img.src = url;
  });
}

function sellPage() {
  const photos = [];
  app.innerHTML = `
    <form class="form" id="sellForm" novalidate>
      <h1>Sell an item</h1>
      <div>
        <label>Photos <span class="hint">Up to 5. The first photo is the cover.</span></label>
        <div class="photos" id="photos"></div>
      </div>
      <label>Title <input name="title" maxlength="80" placeholder="e.g. Zara floral midi dress" required></label>
      <div class="two">
        <label>Price (₦) <input name="price" type="number" inputmode="numeric" min="100" placeholder="8000" required></label>
        <label>Size <span class="hint">Optional</span><input name="size" maxlength="20" placeholder="M, 42, 12…"></label>
      </div>
      <div class="two">
        <label>Category <select name="category" required>${options(CATEGORIES, "", "Choose")}</select></label>
        <label>Condition <select name="condition" required>${options(CONDITIONS, "", "Choose")}</select></label>
      </div>
      <div class="two">
        <label>City <select name="city" required>${options(CITIES, ME.city, "Choose")}</select></label>
        <label>Area <span class="hint">Optional</span><input name="area" maxlength="40" placeholder="e.g. Yaba"></label>
      </div>
      <label>Description <span class="hint">Brand, fit, any marks or flaws</span>
        <textarea name="description" maxlength="1500"></textarea></label>
      <p class="error" id="err"></p>
      <button class="btn" id="postBtn">Post item</button>
    </form>`;

  const drawPhotos = () => {
    $("#photos").innerHTML =
      photos.map((p, i) => `<div class="thumb"><img src="${p}" alt="Photo ${i + 1}"><button type="button" data-i="${i}" aria-label="Remove photo ${i + 1}">×</button></div>`).join("") +
      (photos.length < 5 ? `<label class="add-photo">+ Add photo<input type="file" accept="image/*" multiple id="fileIn"></label>` : "");
    const fi = $("#fileIn");
    if (fi) fi.onchange = async () => {
      const files = [...fi.files].slice(0, 5 - photos.length);
      $("#err").textContent = "";
      try {
        for (const f of files) photos.push(await compress(f));
      } catch (x) { $("#err").textContent = x.message; }
      drawPhotos();
    };
  };
  $("#photos").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-i]");
    if (b) { photos.splice(+b.dataset.i, 1); drawPhotos(); }
  });
  drawPhotos();

  $("#sellForm").onsubmit = async (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const btn = $("#postBtn");
    $("#err").textContent = "";
    if (!photos.length) return ($("#err").textContent = "Add at least one photo.");
    btn.disabled = true;
    btn.textContent = "Posting…";
    try {
      const r = await api("listings", { method: "POST", body: { ...f, images: photos } });
      toast("Item posted");
      go("/item/" + r.id);
    } catch (x) {
      $("#err").textContent = x.message;
      btn.disabled = false;
      btn.textContent = "Post item";
    }
  };
}

// ---------- login / signup ----------
function authPage(mode, next) {
  const isSignup = mode === "signup";
  const nextQs = next ? "?next=" + encodeURIComponent(next) : "";
  app.innerHTML = `
    <form class="form" id="authForm" novalidate>
      <h1>${isSignup ? "Create your account" : "Log in"}</h1>
      ${isSignup ? `<label>Your name <input name="name" maxlength="60" autocomplete="name" required></label>` : ""}
      <label>Phone number <span class="hint">${isSignup ? "Buyers will contact you on this number via WhatsApp" : ""}</span>
        <input name="phone" type="tel" inputmode="tel" placeholder="08012345678" autocomplete="tel" required></label>
      ${isSignup ? `<label>City <select name="city">${options(CITIES, "", "Choose")}</select></label>` : ""}
      <label>Password <input name="password" type="password" minlength="6" autocomplete="${isSignup ? "new-password" : "current-password"}" required></label>
      <p class="error" id="err"></p>
      <button class="btn" id="authBtn">${isSignup ? "Create account" : "Log in"}</button>
      <p class="switch">${isSignup
        ? `Already have an account? <a href="#/login${nextQs}">Log in</a>`
        : `New here? <a href="#/signup${nextQs}">Create an account</a>`}</p>
    </form>`;

  $("#authForm").onsubmit = async (e) => {
    e.preventDefault();
    const btn = $("#authBtn");
    btn.disabled = true;
    $("#err").textContent = "";
    try {
      await api(mode, { method: "POST", body: Object.fromEntries(new FormData(e.target)) });
      ME = (await api("me")).user;
      toast(isSignup ? "Account created" : "Logged in");
      go(next || "/");
    } catch (x) {
      $("#err").textContent = x.message;
      btn.disabled = false;
    }
  };
}

// ---------- my account ----------
async function mePage() {
  const data = await api("my-listings");
  app.innerHTML = `
    <div class="filter-row">
      <h1>Hi, ${esc(ME.name.split(" ")[0])}</h1>
      <button class="btn ghost" id="logoutBtn">Log out</button>
    </div>
    <h2 class="section-title">Your items</h2>
    ${data.items.length
      ? `<div class="grid">${data.items.map(card).join("")}</div>`
      : `<div class="empty"><p>You haven't listed anything yet.</p><a class="btn" href="#/sell">Sell an item</a></div>`}`;
  $("#logoutBtn").onclick = async () => {
    await api("logout", { method: "POST" }).catch(() => {});
    ME = null;
    toast("Logged out");
    go("/");
  };
}

// ---------- start ----------
(async () => {
  try { ME = (await api("me")).user; } catch { ME = null; }
  window.addEventListener("hashchange", route);
  route();
})();
