const BUTTON_ID = "deck-register-button";
const SRC_REGEX = /\/assets\/images\/card_images\/[^/]+/i;
const INJECT_HTML = `<a class="Button Button-texture" id="${BUTTON_ID}">
  <span class="bebel">ECSに登録する(拡張機能)&nbsp;&nbsp;</span>
</a>`;

function findTarget() {
  const grids = document.querySelectorAll(".Grid.DeckTablesGrid.bm0");
  const grid = grids.length >= 2 ? grids[1] : null;
  if (!grid) return null;
  const candidates = grid.querySelectorAll(".Grid_item");
  for (const node of candidates) {
    if (node.childElementCount > 0) continue;
    const html = node.innerHTML.trim();
    const text = node.textContent.replace(/\u00a0/g, " ").trim();
    if (!(html === "&nbsp;" || html === "\u00a0" || text === "")) continue;
    if (html === "&nbsp;" || html === "\u00a0") {
      node.innerHTML = "";
    }
    return node;
  }
  return null;
}

function inject() {
  const target = findTarget();
  if (!target) return;
  if (target.dataset.injected === "true") return;
  if (!INJECT_HTML.trim()) return;

  target.insertAdjacentHTML("beforeend", INJECT_HTML);
  target.dataset.injected = "true";

  const button = target.querySelector(`#${BUTTON_ID}`);
  if (button) {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      registerDeckId();
    });
  }
}

function registerDeckId() {
  const match = window.location.pathname.match(/\/deckID\/([^/]+)\/?$/);
  const deckId = match ? decodeURIComponent(match[1]) : "";
  if (!deckId) return;

  const defaultName = getDefaultNameFromAlt();
  const name = prompt("保存する名前を入力してください", defaultName);
  if (!name) return;

  const entry = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: name.trim(),
    text: deckId,
    ts: Date.now()
  };

  chrome.storage.sync.get({ clips: [] }, (data) => {
    const clips = Array.isArray(data.clips) ? data.clips : [];
    clips.unshift(entry);
  chrome.storage.sync.set({ clips });
  });
}

function getDefaultNameFromAlt() {
  const images = document.querySelectorAll("img[src]");
  for (const img of images) {
    if (!SRC_REGEX.test(img.getAttribute("src") || "")) continue;
    const alt = (img.getAttribute("alt") || "").trim();
    if (alt) return alt;
  }
  return "";
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inject, { once: true });
} else {
  inject();
}
