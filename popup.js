const listEl = document.getElementById("list");
const emptyEl = document.getElementById("empty");
const template = document.getElementById("item-template");

function formatTime(ts) {
  const date = new Date(ts);
  return date.toLocaleString("ja-JP", { hour12: false });
}

function render(clips) {
  listEl.innerHTML = "";
  if (!clips.length) {
    emptyEl.hidden = false;
    return;
  }

  emptyEl.hidden = true;
  for (const clip of clips) {
    const node = template.content.cloneNode(true);
    node.querySelector(".name").textContent = clip.name || "(無名)";
    node.querySelector(".time").textContent = clip.ts ? formatTime(clip.ts) : "";
    node.querySelector(".text").textContent = clip.text || "";

    node.querySelector(".copy").addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(clip.text || "");
      } catch (err) {
        console.warn("Copy failed", err);
      }
    });

    node.querySelector(".open").addEventListener("click", () => {
      const deckId = (clip.text || "").trim();
      if (!deckId) return;
      const url = `https://www.pokemon-card.com/deck/deck.html?deckID=${encodeURIComponent(
        deckId
      )}`;
      chrome.tabs.create({ url });
    });

    node.querySelector(".rename").addEventListener("click", () => {
      const nextName = prompt("新しい名前を入力してください", clip.name || "");
      if (!nextName) return;
      const trimmed = nextName.trim();
      if (!trimmed || trimmed === clip.name) return;
      renameClip(clip.id, trimmed);
    });

    node.querySelector(".remove").addEventListener("click", () => {
      if (!confirm("削除してもよろしいですか？")) return;
      removeClip(clip.id);
    });

    listEl.appendChild(node);
  }
}

function renameClip(id, name) {
  chrome.storage.sync.get({ clips: [] }, (data) => {
    const clips = Array.isArray(data.clips) ? data.clips : [];
    const next = clips.map((clip) =>
      clip.id === id ? { ...clip, name } : clip
    );
    chrome.storage.sync.set({ clips: next }, () => {
      render(next);
    });
  });
}

function removeClip(id) {
  chrome.storage.sync.get({ clips: [] }, (data) => {
    const clips = Array.isArray(data.clips) ? data.clips : [];
    const next = clips.filter((clip) => clip.id !== id);
    chrome.storage.sync.set({ clips: next }, () => {
      render(next);
    });
  });
}

chrome.storage.sync.get({ clips: [] }, (data) => {
  const clips = Array.isArray(data.clips) ? data.clips : [];
  render(clips);
});
