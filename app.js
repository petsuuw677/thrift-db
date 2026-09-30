// ====== CHANGE YOUR BRAND NAME HERE ======
const APP_NAME = "Thrift";
// =========================================

const CATEGORIES = ["Women's clothes", "Men's clothes", "Shoes", "Bags", "Kids", "Phones & gadgets", "Home & kitchen", "Furniture", "Other"];
const CONDITIONS = ["New with tags", "Like new", "Good", "Fair"];
const CITIES = ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Benin City", "Enugu", "Kano", "Owerri", "Uyo", "Calabar", "Abeokuta", "Warri", "Kaduna", "Jos", "Ilorin", "Other"];

const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  sell: '<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M12 8v8M8 12h8"/>',
  wallet: '<path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"/><path d="M21 9h-5a3 3 0 0 0 0 6h5z"/><path d="M16 12h.01"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.8 7L3 21l2-6A8 8 0 1 1 21 12z"/>',
  back: '<path d="M15 18l-6-6 6-6"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  truck: '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
  cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
  chev: '<path d="m9 6 6 6-6 6"/>',
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
const initial = (name) => String(name || "?").trim()[0].toUpperCase();

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

// ---------- navigation (sidebar on desktop, tab bar on phones) ----------
const NAV = [
  ["home", "#/", "Home", "home"],
  ["sell", "#/sell", "Sell", "sell"],
  ["wallet", "#/wallet", "Wallet", "wallet"],
  ["me", "#/me", "Profile", "user"],
];

function renderChrome(section, query) {
  document.title = APP_NAME;
  $("#brand").innerHTML = `<span class="mark">${esc(initial(APP_NAME))}</span>${esc(APP_NAME)}`;
  $("#brandM").innerHTML = $("#brand").innerHTML;
  $("#searchInput").value = query.get("q") || "";

  const links = NAV.map(([key, href, label, icon]) =>
    `<a href="${href}" class="nav-item ${key === "sell" ? "is-sell" : ""}" ${section === key ? 'aria-current="page"' : ""}>${ic(icon)}<span>${label}</span></a>`
  ).join("");
  $("#sideNav").innerHTML = links;
  $("#tabbar").innerHTML = links;

  $("#sideFoot").innerHTML = ME
    ? `<a href="#/me" class="who"><span class="av">${esc(initial(ME.name))}</span><span><b>${esc(ME.name)}</b><small>${esc(ME.phone)}</small></span></a>`
    : `<a class="btn full" href="#/signup">Create account</a><a class="btn ghost full" href="#/login">Log in</a>`;
  $("#topRight").innerHTML = ME
    ? `<a href="#/me" class="av av-top" aria-label="Profile">${esc(initial(ME.name))}</a>`
    : `<a class="btn small" href="#/login">Log in</a>`;
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
  const p = parts[0] || "";
  const section = !p || p === "item" ? "home" : p === "sell" ? "sell" : p === "wallet" ? "wallet" : "me";
  renderChrome(section, query);
  document.body.dataset.page = p || "home";
  window.scrollTo(0, 0);
  app.innerHTML = `<p class="loading">Loading…</p>`;
  try {
    if (!p) return await feedPage(query);
    if (p === "item" && parts[1]) return await itemPage(parts[1]);
    if (p === "sell") return ME ? sellPage() : go("/login?next=/sell");
    if (p === "wallet") return ME ? await walletPage() : go("/login?next=/wallet");
    if (p === "login") return authPage("login", query.get("next"));
    if (p === "signup") return authPage("signup", query.get("next"));
    if (p === "me") return ME ? await mePage() : go("/login?next=/me");
    app.innerHTML = `<div class="empty"><h2>Page not found</h2><a class="btn" href="#/">Go home</a></div>`;
  } catch (e) {
    app.innerHTML = `<div class="empty"><h2>${esc(e.message)}</h2><a class="btn ghost" href="#/">Go home</a></div>`;
  }
}

// ---------- product tile ----------
function tile(l) {
  const place = l.area || l.city || "";
  return `<a class="tile" href="#/item/${l.id}">
    <div class="ph">
      ${l.cover ? `<img loading="lazy" src="/api/img/${l.cover}" alt="">` : ""}
      ${l.status === "sold" ? `<span class="badge sold">Sold</span>` : `<span class="badge">${esc(l.condition)}</span>`}
    </div>
    <div class="t-price">${naira(l.price)}</div>
    <div class="t-title">${esc(l.title)}</div>
    <div class="t-meta">${esc(place)}</div>
  </a>`;
}

// ---------- home ----------
async function feedPage(query) {
  const q = query.get("q") || "";
  const category = query.get("category") || "";
  const city = query.get("city") || "";
  const isHome = !q && !category && !city;
  let page = 0;

  const link = (key, val) => {
    const next = new URLSearchParams(query);
    if (val) next.set(key, val); else next.delete(key);
    return "#/?" + next.toString();
  };
  const heading = q ? `Results for “${esc(q)}”` : category ? esc(category) : "Just listed";

  app.innerHTML = `
    ${isHome ? `
    <section class="promo">
      <div>
        <h1>Turn what you don't use into cash.</h1>
        <p>List it in a minute. Buyers near you message you on WhatsApp.</p>
      </div>
      <a class="btn accent" href="#/sell">${ic("camera")} Start selling</a>
    </section>` : ""}
    <div class="pills" role="list">
      <a role="listitem" class="pill" href="${link("category", "")}" ${!category ? 'aria-current="true"' : ""}>All</a>
      ${CATEGORIES.map((c) => `<a role="listitem" class="pill" href="${link("category", c)}" ${c === category ? 'aria-current="true"' : ""}>${esc(c)}</a>`).join("")}
    </div>
    <div class="sec-head">
      <h2>${heading}</h2>
      <select class="select" id="cityFilter" aria-label="Filter by city">${options(CITIES, city, "All cities")}</select>
    </div>
    <div class="grid" id="grid"></div>
    <div id="feedFoot"></div>`;

  $("#cityFilter").addEventListener("change", (e) => (location.hash = link("city", e.target.value)));

  async function load() {
    const params = new URLSearchParams({ q, category, city, page });
    const data = await api("listings?" + params.toString());
    $("#grid").insertAdjacentHTML("beforeend", data.items.map(tile).join(""));
    const foot = $("#feedFoot");
    if (page === 0 && !data.items.length) {
      foot.innerHTML = `<div class="empty"><h2>${isHome ? "Nothing listed yet" : "No items match that"}</h2><p>${isHome ? "Be the first to list something." : "Try another category or city."}</p><a class="btn" href="#/sell">Sell an item</a></div>`;
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
  const since = new Date(l.seller_since).toLocaleDateString("en-NG", { month: "long", year: "numeric" });
  const where = [l.area, l.city].filter(Boolean).join(", ");

  let contact;
  if (l.mine) {
    contact = `
      <button class="btn" id="toggleSold">${l.status === "sold" ? "Mark as available" : "Mark as sold"}</button>
      <button class="btn ghost danger" id="deleteBtn">Delete item</button>`;
  } else if (l.status === "sold") {
    contact = `<p class="notice">This item has been sold.</p>`;
  } else if (l.loggedIn && l.seller_phone) {
    contact = `
      <a class="btn wa" href="${waLink(l.seller_phone, l.title)}" target="_blank" rel="noopener">${ic("chat")} Message on WhatsApp</a>
      <a class="btn ghost" href="tel:${esc(l.seller_phone)}">Call ${esc(l.seller_phone)}</a>`;
  } else {
    contact = `<a class="btn" href="#/login?next=/item/${l.id}">Log in to contact seller</a>`;
  }

  app.innerHTML = `
    <a class="back" href="#/">${ic("back")} Back</a>
    <article class="item">
      <div>
        <div class="gallery">${l.images.map((i) => `<img src="/api/img/${i}" alt="${esc(l.title)}">`).join("")}</div>
        ${l.images.length > 1 ? `<p class="gallery-hint">${l.images.length} photos, swipe to see all</p>` : ""}
      </div>
      <div class="info">
        <span class="badge static ${l.status === "sold" ? "sold" : ""}">${l.status === "sold" ? "Sold" : esc(l.condition)}</span>
        <h1>${esc(l.title)}</h1>
        <p class="price-lg">${naira(l.price)}</p>
        <div class="specs">
          ${l.size ? `<div><span>Size</span><b>${esc(l.size)}</b></div>` : ""}
          <div><span>Category</span><b>${esc(l.category)}</b></div>
          <div><span>Location</span><b>${esc(where)}</b></div>
        </div>
        ${l.description ? `<p class="desc">${esc(l.description)}</p>` : ""}
        <div class="seller">
          <span class="av">${esc(initial(l.seller_name))}</span>
          <div><b>${esc(l.seller_name)}</b><small>On ${esc(APP_NAME)} since ${since}</small></div>
        </div>
        <div class="actions">${contact}</div>
        ${l.mine ? "" : `<p class="notice">${ic("shield")} Meet in a busy place and check the item before you pay.</p>`}
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
    <div class="page-head"><h1>Sell an item</h1><p>Clear daylight photos sell faster.</p></div>
    <form class="form" id="sellForm" novalidate>
      <div class="field">
        <span class="lbl">Photos <small>up to 5, first is the cover</small></span>
        <div class="photos" id="photos"></div>
      </div>
      <label class="field"><span class="lbl">Title</span><input name="title" maxlength="80" placeholder="e.g. Zara floral midi dress" required></label>
      <div class="two">
        <label class="field"><span class="lbl">Price (₦)</span><input name="price" type="number" inputmode="numeric" min="100" placeholder="8000" required></label>
        <label class="field"><span class="lbl">Size <small>optional</small></span><input name="size" maxlength="20" placeholder="M, 42, 12…"></label>
      </div>
      <div class="two">
        <label class="field"><span class="lbl">Category</span><select name="category" required>${options(CATEGORIES, "", "Choose")}</select></label>
        <label class="field"><span class="lbl">Condition</span><select name="condition" required>${options(CONDITIONS, "", "Choose")}</select></label>
      </div>
      <div class="two">
        <label class="field"><span class="lbl">City</span><select name="city" required>${options(CITIES, ME.city, "Choose")}</select></label>
        <label class="field"><span class="lbl">Area <small>optional</small></span><input name="area" maxlength="40" placeholder="e.g. Yaba"></label>
      </div>
      <label class="field"><span class="lbl">Description <small>brand, fit, any flaws</small></span><textarea name="description" maxlength="1500"></textarea></label>
      <p class="error" id="err"></p>
      <button class="btn accent big" id="postBtn">Post item</button>
    </form>`;

  const drawPhotos = () => {
    $("#photos").innerHTML =
      photos.map((p, i) => `<div class="thumb"><img src="${p}" alt="Photo ${i + 1}">${i === 0 ? `<span class="cover">Cover</span>` : ""}<button type="button" data-i="${i}" aria-label="Remove photo ${i + 1}">×</button></div>`).join("") +
      (photos.length < 5 ? `<label class="add-photo">${ic("camera")}<span>Add photo</span><input type="file" accept="image/*" multiple id="fileIn"></label>` : "");
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

// ---------- wallet (payments not connected yet) ----------
async function walletPage() {
  app.innerHTML = `
    <div class="page-head"><h1>Wallet</h1><p>Money from items you sell through ${esc(APP_NAME)} will show here.</p></div>
    <section class="balance">
      <div class="bal-main">
        <span>Available balance</span>
        <strong>${naira(0)}</strong>
      </div>
      <div class="bal-row">
        <div><span>Pending</span><b>${naira(0)}</b></div>
        <div><span>Total earned</span><b>${naira(0)}</b></div>
      </div>
      <button class="btn light" disabled>Withdraw to bank</button>
    </section>
    <div class="soon">
      <b>In-app payments are coming soon.</b>
      <p>For now, buyers pay you directly when you meet. Once payments go live, this is how it will work:</p>
    </div>
    <ol class="steps">
      <li>${ic("cash")}<div><b>Buyer pays in the app</b><span>The money is held safely, not sent straight to the seller.</span></div></li>
      <li>${ic("truck")}<div><b>You hand over the item</b><span>Meet up or send it with a rider.</span></div></li>
      <li>${ic("shield")}<div><b>Buyer confirms, you get paid</b><span>The money moves to your balance and you can withdraw it.</span></div></li>
    </ol>
    <h2 class="sub">Transactions</h2>
    <div class="empty slim"><p>No transactions yet.</p></div>`;
}

// ---------- login / signup ----------
function authPage(mode, next) {
  const isSignup = mode === "signup";
  const nextQs = next ? "?next=" + encodeURIComponent(next) : "";
  app.innerHTML = `
    <div class="auth">
      <div class="page-head"><h1>${isSignup ? "Create your account" : "Welcome back"}</h1><p>${isSignup ? "Buy and sell pre-loved items near you." : "Log in with your phone number."}</p></div>
      <form class="form" id="authForm" novalidate>
        ${isSignup ? `<label class="field"><span class="lbl">Your name</span><input name="name" maxlength="60" autocomplete="name" required></label>` : ""}
        <label class="field"><span class="lbl">Phone number ${isSignup ? `<small>buyers reach you here on WhatsApp</small>` : ""}</span>
          <input name="phone" type="tel" inputmode="tel" placeholder="08012345678" autocomplete="tel" required></label>
        ${isSignup ? `<label class="field"><span class="lbl">City</span><select name="city">${options(CITIES, "", "Choose")}</select></label>` : ""}
        <label class="field"><span class="lbl">Password</span><input name="password" type="password" minlength="6" autocomplete="${isSignup ? "new-password" : "current-password"}" required></label>
        <p class="error" id="err"></p>
        <button class="btn big" id="authBtn">${isSignup ? "Create account" : "Log in"}</button>
        <p class="switch">${isSignup
          ? `Already have an account? <a href="#/login${nextQs}">Log in</a>`
          : `New here? <a href="#/signup${nextQs}">Create an account</a>`}</p>
      </form>
    </div>`;

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
  const active = items.filter((i) => i.status === "active");
  const sold = items.filter((i) => i.status === "sold");
  let tab = "active";

  app.innerHTML = `
    <section class="me">
      <span class="av av-lg">${esc(initial(ME.name))}</span>
      <div class="me-text">
        <h1>${esc(ME.name)}</h1>
        <p>${esc(ME.phone)}${ME.city ? `, ${esc(ME.city)}` : ""}</p>
      </div>
    </section>
    <div class="nums">
      <div><b>${items.length}</b><span>Listed</span></div>
      <div><b>${active.length}</b><span>For sale</span></div>
      <div><b>${sold.length}</b><span>Sold</span></div>
    </div>
    <div class="seg" role="tablist">
      <button role="tab" data-tab="active">For sale</button>
      <button role="tab" data-tab="sold">Sold</button>
    </div>
    <div id="myGrid"></div>
    <h2 class="sub">Account</h2>
    <div class="menu">
      <a href="#/wallet">${ic("wallet")}<span>Wallet</span>${ic("chev")}</a>
      <a href="#/sell">${ic("sell")}<span>Sell an item</span>${ic("chev")}</a>
      <button id="logoutBtn">${ic("logout")}<span>Log out</span>${ic("chev")}</button>
    </div>`;

  const draw = () => {
    document.querySelectorAll(".seg button").forEach((b) => b.setAttribute("aria-selected", b.dataset.tab === tab));
    const list = tab === "active" ? active : sold;
    $("#myGrid").innerHTML = list.length
      ? `<div class="grid">${list.map(tile).join("")}</div>`
      : `<div class="empty slim"><p>${tab === "active" ? "Nothing for sale right now." : "No sold items yet."}</p>${tab === "active" ? `<a class="btn" href="#/sell">Sell an item</a>` : ""}</div>`;
  };
  document.querySelector(".seg").onclick = (e) => {
    const b = e.target.closest("button[data-tab]");
    if (b) { tab = b.dataset.tab; draw(); }
  };
  draw();

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
