const grid = document.getElementById("grid");
const search = document.getElementById("search");
const count = document.getElementById("count");
const modal = document.getElementById("modal");
const modalBody = modal.querySelector(".modal-body");
const modalClose = document.getElementById("modal-close");

let movies = [];

async function load() {
  const res = await fetch("movies-data.json");
  movies = await res.json();
  render(movies);
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
  const poster = m.poster_path
    ? `<img src="${m.poster_path}" alt="" />`
    : "";
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
  const q = search.value.trim().toLowerCase();
  if (!q) return render(movies);
  const filtered = movies.filter((m) =>
    [m.title, m.query, m.original_title].some((s) => s && s.toLowerCase().includes(q))
  );
  render(filtered);
});

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

load();
