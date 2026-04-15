const grid = document.getElementById("grid");
const search = document.getElementById("search");
const count = document.getElementById("count");
const sortKeyEl = document.getElementById("sort-key");
const sortDirEl = document.getElementById("sort-dir");
const sizeEl = document.getElementById("size");
const sizeValEl = document.getElementById("size-val");
const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");
const backdrop = document.getElementById("backdrop");
const modal = document.getElementById("modal");
const modalBody = modal.querySelector(".modal-body");
const modalClose = document.getElementById("modal-close");

let movies = [];
const state = {
  q: "",
  sortKey: "year",
  sortDir: "desc",
  size: 150,
};

const STORAGE_KEY = "mwm-state";

function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    Object.assign(state, s);
  } catch {}
  sortKeyEl.value = state.sortKey;
  sortDirEl.textContent = state.sortDir === "desc" ? "↓" : "↑";
  sizeEl.value = state.size;
  applySize();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function applySize() {
  document.documentElement.style.setProperty("--card-w", `${state.size}px`);
  if (sizeValEl) sizeValEl.textContent = state.size;
}

function setSidebar(open) {
  sidebar.classList.toggle("open", open);
  backdrop.hidden = !open;
  menuToggle.setAttribute("aria-expanded", String(open));
}

menuToggle.addEventListener("click", () => setSidebar(!sidebar.classList.contains("open")));
backdrop.addEventListener("click", () => setSidebar(false));

async function load() {
  loadState();
  const res = await fetch("movies-data.json");
  movies = await res.json();
  update();
}

function update() {
  let list = movies;
  if (state.q) {
    const q = state.q.toLowerCase();
    list = list.filter((m) =>
      [m.title, m.query, m.original_title].some((s) => s && s.toLowerCase().includes(q))
    );
  }
  list = [...list].sort(compare);
  render(list);
}

function compare(a, b) {
  const dir = state.sortDir === "asc" ? 1 : -1;
  if (state.sortKey === "year") {
    const ay = a.year ? parseInt(a.year, 10) : -Infinity;
    const by = b.year ? parseInt(b.year, 10) : -Infinity;
    if (ay !== by) return (ay - by) * dir;
    return (a.title || a.query).localeCompare(b.title || b.query, "ja");
  }
  return (a.title || a.query).localeCompare(b.title || b.query, "ja") * dir;
}

function render(list) {
  grid.innerHTML = "";
  count.textContent = `${list.length}件`;
  for (const m of list) {
    const card = document.createElement("div");
    card.className = "card";
    const posterHtml = m.poster_path
      ? `<img src="${m.poster_path}" alt="" loading="lazy" />`
      : `<div>画像なし</div>`;
    card.innerHTML = `
      <div class="poster">${posterHtml}</div>
      <div class="meta">
        <div class="title">${escapeHtml(m.title || m.query)}</div>
        <div class="year">${m.year || ""}</div>
      </div>
    `;
    card.addEventListener("click", () => openModal(m));
    grid.appendChild(card);
  }
}

function openModal(m) {
  const poster = m.poster_path ? `<img src="${m.poster_path}" alt="" />` : "";
  modalBody.innerHTML = `
    ${poster}
    <div class="info">
      <h2>${escapeHtml(m.title || m.query)}</h2>
      <div class="sub">${m.year || ""}${m.original_title ? " / " + escapeHtml(m.original_title) : ""}</div>
      <p>${escapeHtml(m.overview || "あらすじ情報がありません。")}</p>
    </div>
  `;
  modal.hidden = false;
}

function closeModal() { modal.hidden = true; }
modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

search.addEventListener("input", () => {
  state.q = search.value.trim();
  update();
});

sortKeyEl.addEventListener("change", () => {
  state.sortKey = sortKeyEl.value;
  saveState();
  update();
});

sortDirEl.addEventListener("click", () => {
  state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
  sortDirEl.textContent = state.sortDir === "desc" ? "↓" : "↑";
  saveState();
  update();
});

sizeEl.addEventListener("input", () => {
  state.size = parseInt(sizeEl.value, 10);
  applySize();
  saveState();
});

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

load();
