import { isExtensionContextValid, safeSendMessage } from "../../lib/messaging";
import { extractFacebookIdentifier } from "../../lib/extract-facebook-identifier";

let isContentScriptInitialized = false;

function sendIdOnUrlChange() {
  const identifier = extractFacebookIdentifier(window.location.href);

  if (identifier) {
    console.log("Detected user profile:", identifier);
    safeSendMessage({
      type: "USER_PROFILE_DETECTED",
      payload: { userName: identifier },
    });
  }
}

function initialize() {
  if (isContentScriptInitialized || !isExtensionContextValid()) {
    return;
  }
  isContentScriptInitialized = true;

  console.log("Facebook Group Checker content script initialized.");

  // Initial check
  sendIdOnUrlChange();

  // Listen for URL changes via MutationObserver
  let lastUrl = location.href;
  const observer = new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      sendIdOnUrlChange();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

initialize();
