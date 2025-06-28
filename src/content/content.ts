function extractIdsFromUrl(url: string) {
  const match = url.match(/groups\/(\d+)\/user\/(\d+)/);
  if (match) {
    return {
      groupId: match[1],
      userId: match[2],
    };
  }
  return null;
}

function sendIds() {
  const ids = extractIdsFromUrl(window.location.href);
  if (ids) {
    chrome.runtime.sendMessage({ type: "USER_AND_GROUP_ID", payload: ids });
  }
}

// Send initially
sendIds();

// And listen for URL changes
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    sendIds();
  }
}).observe(document, { subtree: true, childList: true });
