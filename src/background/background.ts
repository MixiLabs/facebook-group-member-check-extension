chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CHECK_MEMBERSHIP") {
    // Forward message to sidebar
    chrome.runtime.sendMessage(message);
  }
  if (message.type === "USER_AND_GROUP_ID") {
    // Forward message to sidebar
    chrome.runtime.sendMessage(message);
  }
});
