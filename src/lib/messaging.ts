// Check if extension context is valid
export function isExtensionContextValid(): boolean {
  try {
    return !!(chrome && chrome.runtime && chrome.runtime.id);
  } catch (error) {
    return false;
  }
}

// Safe chrome.runtime.sendMessage wrapper
export function safeSendMessage(message: any): void {
  if (!isExtensionContextValid()) {
    console.log("Extension context invalid, skipping message:", message.type);
    return;
  }

  try {
    chrome.runtime.sendMessage(message).catch((error) => {
      if (error.message?.includes("Extension context invalidated")) {
        console.log("Extension context invalidated, ignoring error");
      } else {
        console.error("Error sending runtime message:", error);
      }
    });
  } catch (error) {
    console.log(
      "Failed to send runtime message, extension context may be invalid:",
      error
    );
  }
}
