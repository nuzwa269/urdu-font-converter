document.getElementById("open").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => { if (window.__NASTALEEQ_TOOL__) window.__NASTALEEQ_TOOL__.toggle(); },
  });
  window.close();
});
