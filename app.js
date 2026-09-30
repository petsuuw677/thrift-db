// ====== CHANGE YOUR BRAND NAME HERE ======
const APP_NAME = "Thrift";
// =========================================

const CATEGORIES = ["Women's clothes", "Men's clothes", "Shoes", "Bags", "Kids", "Phones & gadgets", "Home & kitchen", "Furniture", "Other"];
const CONDITIONS = ["New with tags", "Like new", "Good", "Fair"];
const CITIES = ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Benin City", "Enugu", "Kano", "Owerri", "Uyo", "Calabar", "Abeokuta", "Warri", "Kaduna", "Jos", "Ilorin", "Other"];

// ---------- icons ----------
const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  dress: '<path d="M9 2h6l-1 5 5 14H5l5-14z"/>',
  shirt: '<path d="M20.4 3.5 16 2a4 4 0 0 1-8 0L3.6 3.5a2 2 0 0 0-1.3 2.2l.6 3.5a1 1 0 0 0 1 .8H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.1a1 1 0 0 0 1-.8l.6-3.5a2 2 0 0 0-1.3-2.2z"/>',
  shoe: '<path d="M3 17v-4l4-1 3-5 3 3 4 1 4 3v3z"/><path d="M3 17h18v2H3z"/>',
  bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>',
  kids: '<circle cx="12" cy="12" r="9"/><path d="M9 14.5c.8.9 1.8 1.4 3 1.4s2.2-.5 3-1.4M9 9.5h.01M15 9.5h.01"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>',
  cup: '<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/>',
  sofa: '<path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3"/><path d="M2 13a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v5H2z"/><path d="M5 18v2M19 18v2"/>',
  dots: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
  tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><path d="M7.5 7.5h.01"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  ruler: '<path d="M3 17 17 3l4 4L7 21z"/><path d="m7 13 2 2M10 10l2 2M13 7l2 2"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.8 7L3 21l2-6A8 8 0 1 1 21 12z"/>',
  call: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
};
const ic = (name) => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ""}</svg>`;

// icon, background tint, icon colour
const CAT_STYLE = {
  "Women's clothes": ["dress", "#FCE4EF", "#C2185B"],
  "Men's clothes": ["shirt", "#E3EEFB", "#2F6DB5"],
  "Shoes": ["shoe", "#FFEBDD", "#D2691E"],
  "Bags": ["bag", "#EFE6FD", "#6534DA"],
  "Kids": ["kids", "#FFF6CF", "#A07C00"],
  "Phones & gadgets": ["phone", "#E2F4EA", "#1F8A4C"],
  "Home & kitchen": ["cup", "#FDE8E4", "#C23A2B"],
  "Furniture": ["sofa", "#E6F3F5", "#1B7A86"],
  "Other": ["dots", "#EEEEF2", "#5E5A6E"],
};

const $ = (s, el = document) => el.querySelector(s);
const app = $("#app");
let ME = null;

const naira = (n) => "₦" + Number(n).toLocaleString("en-NG");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const options = (list, selected = "", placeholder = "") =>
  (placeholder ? `<option value="">${esc(placeholder)}</option>` : "") +
  list.map((x) => `<option ${x === selected ? "selected" : ""}>${esc(x)}</option>`).join("");
const firstName = () => (ME ? ME.name.split(" ")[0] : "");
const initial = () => (ME ? ME.name.trim()[0].toUpperCase() : "");
function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

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

// ---------- header + tabs ----------
function renderChrome(section) {
  document.title = APP_NAME;
  $("#brandName").textContent = APP_NAME;
  $("#logoMark").textContent = APP_NAME[0].toUpperCase();
  $("#topRight").innerHTML = ME
    ? `<a class="avatar-sm" href="#/me" aria-label="My profile">${esc(initial())}</a>`
    : `<a class="link" href="#/login">Log in</a><a class="btn dark small" href="#/signup">Sign up free</a>`;

  const tabs = [
    ["home", "#/", "Home", "home"],
    ["sell", "#/sell", "Sell", "plus"],
    ["me", ME ? "#/me" : "#/login", ME ? "Profile" : "Log in", "user"],
  ];
  $("#tabs").innerHTML = tabs
    .map(([key, href, label, icon]) =>
      `<a class="tab" href="${href}" ${section === key ? 'aria-current="page"' : ""}>${ic(icon)}<span>${label}</span></a>`)
    .join("");
}

// ---------- router ----------
async function route() {
  const { parts, query } = parseHash();
  const section = !parts.length || parts[0] === "item" ? "home" : parts[0] === "sell" ? "sell" : ["me", "login", "signup"].includes(parts[0]) ? "me" : "";
  renderChrome(section);
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
    <div class="card-body">
      <div class="title">${esc(l.title)}</div>
      <div class="meta">${esc(meta)}</div>
    </div>
  </a>`;
}

function chip(label, value, active, icon, bg, fg) {
  return `<button class="chip" aria-pressed="${active}" data-cat="${esc(value)}">
    <span class="chip-ic" style="background:${bg};color:${fg}">${ic(icon)}</span>${esc(label)}</button>`;
}

// ---------- home / feed ----------
async function feedPage(query) {
  const q = query.get("q") || "";
  const category = query.get("category") || "";
  const city = query.get("city") || "";
  const isHome = !q && !category && !city;
  let page = 0;

  const setFilter = (key, val) => {
    const next = new URLSearchParams(query);
    if (val) next.set(key, val); else next.delete(key);
    go("/?" + next.toString());
  };

  const hero = isHome ? `
    ${ME ? `<h1 class="greet">${greeting()}, ${esc(firstName())}</h1>` : ""}
    <section class="hero">
      <div class="hero-dot"></div>
      <p class="hero-label">Pre-loved, priced to move</p>
      <h2 class="hero-title">Sell what you no longer use.</h2>
      <p class="hero-sub">Clothes, shoes, gadgets and home items from people near you. Chat the seller on WhatsApp.</p>
    </section>
    <div class="hero-actions">
      <a class="btn dark" href="#/sell">${ic("plus")} Sell an item</a>
      <a class="btn outline" href="${ME ? "#/me" : "#/signup"}">${ME ? "My items" : "Create free account"}</a>
    </div>` : "";

  const heading = q ? `Results for “${esc(q)}”` : category ? esc(category) : city ? `In ${esc(city)}` : "Just listed";

  app.innerHTML = `
    ${hero}
    <form class="search" id="searchForm" role="search">
      ${ic("search")}
      <input id="searchInput" type="search" value="${esc(q)}" placeholder="Search e.g. Zara dress, sneakers, blender" aria-label="Search items">
    </form>
    <p class="label">Shop by category</p>
    <div class="chips" id="chips">
      ${chip("All", "", !category, "grid", "#EFE6FD", "#6534DA")}
      ${CATEGORIES.map((c) => chip(c, c, c === category, ...CAT_STYLE[c])).join("")}
    </div>
    <div class="filter-row">
      <h1>${heading}</h1>
      <select class="select" id="cityFilter" aria-label="Filter by city">${options(CITIES, city, "All cities")}</select>
    </div>
    <div class="grid" id="grid"></div>
    <div id="feedFoot"></div>`;

  $("#searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    setFilter("q", $("#searchInput").value.trim());
  });
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
        <a class="btn" href="#/sell">${ic("plus")} Sell an item</a></div>`;
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

function factRow(icon, bg, fg, label, value) {
  return `<div class="row"><span class="row-ic" style="background:${bg};color:${fg}">${ic(icon)}</span>
    <span class="grow">${esc(label)}</span><span class="val">${esc(value)}</span></div>`;
}

async function itemPage(id) {
  const l = await api("listings/" + encodeURIComponent(id));
  const since = new Date(l.seller_since).toLocaleDateString("en-NG", { month: "long", year: "numeric" });
  const where = [l.area, l.city].filter(Boolean).join(", ");
  const [catIcon, catBg, catFg] = CAT_STYLE[l.category] || CAT_STYLE.Other;

  let contact;
  if (l.mine) {
    contact = `
      <button class="btn dark" id="toggleSold">${l.status === "sold" ? "Mark as available" : "Mark as sold"}</button>
      <button class="btn danger" id="deleteBtn">Delete item</button>`;
  } else if (l.status === "sold") {
    contact = `<p class="tip">This item has been sold.</p>`;
  } else if (l.loggedIn && l.seller_phone) {
    contact = `
      <a class="btn wa" href="${waLink(l.seller_phone, l.title)}" target="_blank" rel="noopener">${ic("chat")} Chat on WhatsApp</a>
      <a class="btn outline" href="tel:${esc(l.seller_phone)}">${ic("call")} Call ${esc(l.seller_phone)}</a>`;
  } else {
    contact = `<a class="btn" href="#/login?next=/item/${l.id}">Log in to contact seller</a>`;
  }

  app.innerHTML = `
    <article class="item">
      <div>
        <div class="gallery">${l.images.map((i) => `<img src="/api/img/${i}" alt="${esc(l.title)}">`).join("")}</div>
        ${l.images.length > 1 ? `<div class="gallery-count">${l.images.length} photos, swipe to see more</div>` : ""}
      </div>
      <div class="panel">
        <div class="price-big">${naira(l.price)}</div>
        <h1>${esc(l.title)}</h1>
        <div class="rows facts">
          ${factRow("star", "#EFE6FD", "#6534DA", "Condition", l.condition)}
          ${l.size ? factRow("ruler", "#E3EEFB", "#2F6DB5", "Size", l.size) : ""}
          ${factRow(catIcon, catBg, catFg, "Category", l.category)}
          ${factRow("pin", "#FFEBDD", "#D2691E", "Location", where)}
        </div>
        ${l.description ? `<p class="desc">${esc(l.description)}</p>` : ""}
        <div class="seller">
          <div class="avatar-sm">${esc((l.seller_name || "?")[0].toUpperCase())}</div>
          <div><strong>${esc(l.seller_name)}</strong><div class="meta">Selling on ${esc(APP_NAME)} since ${since}</div></div>
        </div>
        <div class="actions">${contact}</div>
        ${l.mine ? "" : `<p class="tip">Meet in a busy public place and check the item before you pay. Never send money in advance to someone you haven't met.</p>`}
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
    <form class="form panel" id="sellForm" novalidate>
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
      <button class="btn dark" id="postBtn">Post item</button>
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
    <form class="form panel" id="authForm" novalidate>
      <h1>${isSignup ? "Create your account" : "Welcome back"}</h1>
      ${isSignup ? `<label>Your name <input name="name" maxlength="60" autocomplete="name" required></label>` : ""}
      <label>Phone number ${isSignup ? `<span class="hint">Buyers will contact you on this number via WhatsApp</span>` : ""}
        <input name="phone" type="tel" inputmode="tel" placeholder="08012345678" autocomplete="tel" required></label>
      ${isSignup ? `<label>City <select name="city">${options(CITIES, "", "Choose")}</select></label>` : ""}
      <label>Password <input name="password" type="password" minlength="6" autocomplete="${isSignup ? "new-password" : "current-password"}" required></label>
      <p class="error" id="err"></p>
      <button class="btn dark" id="authBtn">${isSignup ? "Create account" : "Log in"}</button>
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

// ---------- profile ----------
async function mePage() {
  const { items } = await api("my-listings");
  const active = items.filter((i) => i.status === "active").length;
  const sold = items.length - active;

  app.innerHTML = `
    <section class="panel profile">
      <div class="avatar">${esc(initial())}</div>
      <div>
        <h1>${esc(ME.name)}</h1>
        <p>${esc(ME.phone)}</p>
        ${ME.city ? `<span class="pill">${esc(ME.city)}</span>` : ""}
      </div>
    </section>
    <div class="stats">
      <div class="stat"><b>${items.length}</b><span>Listed</span></div>
      <div class="stat"><b>${active}</b><span>Active</span></div>
      <div class="stat"><b>${sold}</b><span>Sold</span></div>
    </div>

    <p class="label">Your items</p>
    ${items.length
      ? `<div class="grid">${items.map(card).join("")}</div>`
      : `<div class="empty"><p>You haven't listed anything yet.</p><a class="btn" href="#/sell">${ic("plus")} Sell an item</a></div>`}

    <p class="label">Account</p>
    <div class="rows">
      <a class="row" href="#/sell"><span class="row-ic" style="background:#EFE6FD;color:#6534DA">${ic("tag")}</span><span class="grow">Sell an item</span><span class="chev">›</span></a>
      <button class="row" id="logoutBtn"><span class="row-ic" style="background:#FDE8E4;color:#C23A2B">${ic("logout")}</span><span class="grow">Log out</span><span class="chev">›</span></button>
    </div>`;

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
