// ====== CHANGE YOUR BRAND NAME HERE ======
const APP_NAME = "Thrift";
// =========================================

const CATEGORIES = ["Women's clothes", "Men's clothes", "Shoes", "Bags", "Kids", "Phones & gadgets", "Home & kitchen", "Furniture", "Other"];
const CONDITIONS = ["New with tags", "Like new", "Good", "Fair"];
const CITIES = ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Benin City", "Enugu", "Kano", "Owerri", "Uyo", "Calabar", "Abeokuta", "Warri", "Kaduna", "Jos", "Ilorin", "Other"];

const ICONS = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.8 7L3 21l2-6A8 8 0 1 1 21 12z"/>',
  back: '<path d="M15 18l-6-6 6-6"/>',
};
const ic = (name) => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ""}</svg>`;

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
function renderHeader(query) {
  document.title = APP_NAME;
  $("#brand").textContent = APP_NAME;
  $("#searchInput").value = query.get("q") || "";
  $("#topRight").innerHTML = `
    <a class="btn sell" href="#/sell">${ic("plus")}<span>Sell</span></a>
    ${ME
      ? `<a class="account" href="#/me" aria-label="My account">${ic("user")}<span>${esc(ME.name.split(" ")[0])}</span></a>`
      : `<a class="account" href="#/login">${ic("user")}<span>Log in</span></a>`}`;
}

$("#searchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const q = $("#searchInput").value.trim();
  const { parts, query } = parseHash();
  const next = parts.length ? new URLSearchParams() : query;
  if (q) next.set("q", q); else next.delete("q");
  go("/?" + next.toString());
  $("#searchInput").blur();
});

// ---------- router ----------
async function route() {
  const { parts, query } = parseHash();
  renderHeader(query);
  window.scrollTo(0, 0);
  app.innerHTML = `<p class="loading">Loading…</p>`;
  try {
    if (!parts.length) return await feedPage(query);
    if (parts[0] === "item" && parts[1]) return await itemPage(parts[1]);
    if (parts[0] === "sell") return ME ? sellPage() : go("/login?next=/sell");
    if (parts[0] === "login") return authPage("login", query.get("next"));
    if (parts[0] === "signup") return authPage("signup", query.get("next"));
    if (parts[0] === "me") return ME ? await mePage() : go("/login?next=/me");
    app.innerHTML = `<div class="empty"><p>This page doesn't exist.</p><a class="text-link" href="#/">Browse items</a></div>`;
  } catch (e) {
    app.innerHTML = `<div class="empty"><p>${esc(e.message)}</p><a class="text-link" href="#/">Back to items</a></div>`;
  }
}

// ---------- listing tile (no card box: photo + caption) ----------
function tile(l) {
  const meta = [l.condition, l.area || l.city].filter(Boolean).join(", ");
  return `<a class="tile ${l.status === "sold" ? "is-sold" : ""}" href="#/item/${l.id}">
    ${l.cover ? `<img loading="lazy" src="/api/img/${l.cover}" alt="">` : `<div class="noimg"></div>`}
    <div class="cap">
      <span class="price">${l.status === "sold" ? "Sold" : naira(l.price)}</span>
      <span class="title">${esc(l.title)}</span>
      <span class="meta">${esc(meta)}</span>
    </div>
  </a>`;
}

// ---------- feed ----------
async function feedPage(query) {
  const q = query.get("q") || "";
  const category = query.get("category") || "";
  const city = query.get("city") || "";
  let page = 0;

  const link = (key, val) => {
    const next = new URLSearchParams(query);
    if (val) next.set(key, val); else next.delete(key);
    return "#/?" + next.toString();
  };

  const heading = q ? `Results for “${esc(q)}”` : category ? esc(category) : "Just listed";

  app.innerHTML = `
    ${!q && !category && !city ? `<p class="intro">Second-hand clothes, shoes, gadgets and home things, sold by people near you. Found something? Message the seller on WhatsApp.</p>` : ""}
    <div class="bar">
      <nav class="cats" aria-label="Categories">
        <a href="${link("category", "")}" ${!category ? 'aria-current="true"' : ""}>Everything</a>
        ${CATEGORIES.map((c) => `<a href="${link("category", c)}" ${c === category ? 'aria-current="true"' : ""}>${esc(c)}</a>`).join("")}
      </nav>
      <label class="city">Near <select id="cityFilter">${options(CITIES, city, "anywhere")}</select></label>
    </div>
    <h1 class="feed-title">${heading}</h1>
    <div class="masonry" id="grid"></div>
    <div id="feedFoot"></div>`;

  $("#cityFilter").addEventListener("change", (e) => (location.hash = link("city", e.target.value)));

  async function load() {
    const params = new URLSearchParams({ q, category, city, page });
    const data = await api("listings?" + params.toString());
    $("#grid").insertAdjacentHTML("beforeend", data.items.map(tile).join(""));
    const foot = $("#feedFoot");
    if (page === 0 && !data.items.length) {
      foot.innerHTML = `<div class="empty"><p>${q || category || city ? "Nothing matches that yet." : "Nothing listed yet."}</p><a class="text-link" href="#/sell">List the first item</a></div>`;
    } else if (data.more) {
      foot.innerHTML = `<button class="text-link more" id="moreBtn">Show more</button>`;
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
  const since = new Date(l.seller_since).toLocaleDateString("en-NG", { month: "long", year: "numeric" });
  const where = [l.area, l.city].filter(Boolean).join(", ");

  let contact;
  if (l.mine) {
    contact = `
      <button class="btn" id="toggleSold">${l.status === "sold" ? "Mark as available" : "Mark as sold"}</button>
      <button class="text-link danger" id="deleteBtn">Delete this item</button>`;
  } else if (l.status === "sold") {
    contact = `<p class="note">This item has been sold.</p>`;
  } else if (l.loggedIn && l.seller_phone) {
    contact = `
      <a class="btn wa" href="${waLink(l.seller_phone, l.title)}" target="_blank" rel="noopener">${ic("chat")} Message on WhatsApp</a>
      <a class="text-link" href="tel:${esc(l.seller_phone)}">Or call ${esc(l.seller_phone)}</a>`;
  } else {
    contact = `<a class="btn" href="#/login?next=/item/${l.id}">Log in to contact the seller</a>`;
  }

  app.innerHTML = `
    <a class="back" href="#/">${ic("back")} All items</a>
    <article class="item">
      <div class="gallery">${l.images.map((i) => `<img src="/api/img/${i}" alt="${esc(l.title)}">`).join("")}</div>
      <div class="info">
        <h1>${esc(l.title)}</h1>
        <p class="item-price">${l.status === "sold" ? "Sold" : naira(l.price)}</p>
        <dl class="facts">
          <div><dt>Condition</dt><dd>${esc(l.condition)}</dd></div>
          ${l.size ? `<div><dt>Size</dt><dd>${esc(l.size)}</dd></div>` : ""}
          <div><dt>Category</dt><dd>${esc(l.category)}</dd></div>
          <div><dt>Location</dt><dd>${esc(where)}</dd></div>
        </dl>
        ${l.description ? `<p class="desc">${esc(l.description)}</p>` : ""}
        <p class="seller">Sold by <strong>${esc(l.seller_name)}</strong>, on ${esc(APP_NAME)} since ${since}</p>
        <div class="actions">${contact}</div>
        ${l.mine ? "" : `<p class="note">Meet somewhere busy and check the item before paying. Never send money to someone you haven't met.</p>`}
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
      <h1>List an item</h1>
      <p class="lead">Good photos in daylight sell faster. Add up to 5; the first one is the cover.</p>
      <div class="photos" id="photos"></div>
      <label>Title <input name="title" maxlength="80" placeholder="e.g. Zara floral midi dress" required></label>
      <div class="two">
        <label>Price (₦) <input name="price" type="number" inputmode="numeric" min="100" placeholder="8000" required></label>
        <label>Size <span class="hint">optional</span><input name="size" maxlength="20" placeholder="M, 42, 12…"></label>
      </div>
      <div class="two">
        <label>Category <select name="category" required>${options(CATEGORIES, "", "Choose")}</select></label>
        <label>Condition <select name="condition" required>${options(CONDITIONS, "", "Choose")}</select></label>
      </div>
      <div class="two">
        <label>City <select name="city" required>${options(CITIES, ME.city, "Choose")}</select></label>
        <label>Area <span class="hint">optional</span><input name="area" maxlength="40" placeholder="e.g. Yaba"></label>
      </div>
      <label>Description <span class="hint">brand, fit, any marks or flaws</span>
        <textarea name="description" maxlength="1500"></textarea></label>
      <p class="error" id="err"></p>
      <button class="btn" id="postBtn">Post item</button>
    </form>`;

  const drawPhotos = () => {
    $("#photos").innerHTML =
      photos.map((p, i) => `<div class="thumb"><img src="${p}" alt="Photo ${i + 1}"><button type="button" data-i="${i}" aria-label="Remove photo ${i + 1}">Remove</button></div>`).join("") +
      (photos.length < 5 ? `<label class="add-photo">${ic("plus")}<span>Add photo</span><input type="file" accept="image/*" multiple id="fileIn"></label>` : "");
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
    <form class="form narrow" id="authForm" novalidate>
      <h1>${isSignup ? "Create an account" : "Log in"}</h1>
      ${isSignup ? `<label>Your name <input name="name" maxlength="60" autocomplete="name" required></label>` : ""}
      <label>Phone number ${isSignup ? `<span class="hint">buyers reach you here on WhatsApp</span>` : ""}
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

// ---------- account ----------
async function mePage() {
  const { items } = await api("my-listings");
  const active = items.filter((i) => i.status === "active").length;
  const sold = items.length - active;

  app.innerHTML = `
    <header class="me-head">
      <div>
        <h1>${esc(ME.name)}</h1>
        <p class="lead">${esc(ME.phone)}${ME.city ? `, ${esc(ME.city)}` : ""}</p>
        <p class="counts"><b>${items.length}</b> listed <b>${active}</b> for sale <b>${sold}</b> sold</p>
      </div>
      <button class="text-link" id="logoutBtn">Log out</button>
    </header>
    <h2 class="feed-title">Your items</h2>
    ${items.length
      ? `<div class="masonry">${items.map(tile).join("")}</div>`
      : `<div class="empty"><p>You haven't listed anything yet.</p><a class="text-link" href="#/sell">List your first item</a></div>`}`;

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
