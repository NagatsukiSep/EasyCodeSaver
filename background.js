const MENU_ID = "save-selection";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: "デッキコードを保存",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== MENU_ID) return;
  if (!tab || !tab.id) return;

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      args: [info.selectionText || ""],
      func: (selectionText) => {
        const name = prompt("保存する名前を入力してください");
        if (!name) return null;
        return { name: name.trim(), text: selectionText };
      }
    },
    (results) => {
      const result = results && results[0] && results[0].result;
      if (!result || !result.name) return;

      const entry = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name: result.name,
        text: result.text,
        ts: Date.now()
      };

      chrome.storage.sync.get({ clips: [] }, (data) => {
        const clips = Array.isArray(data.clips) ? data.clips : [];
        clips.unshift(entry);
        chrome.storage.sync.set({ clips });
      });
    }
  );
});
