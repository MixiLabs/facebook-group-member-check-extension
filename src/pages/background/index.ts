import { useAppStore } from "../../store/app-store";
import { isExtensionContextValid, safeSendMessage } from "../../lib/messaging";

// Safe chrome.tabs.sendMessage wrapper with retry logic
async function safeSendTabMessage(
  tabId: number,
  message: any,
  retries: number = 3
): Promise<boolean> {
  if (!isExtensionContextValid()) {
    console.log(
      "Extension context invalid, skipping tab message:",
      message.type
    );
    return false;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await chrome.tabs.sendMessage(tabId, message);
      console.log(
        `Successfully sent message to tab ${tabId} on attempt ${attempt}`
      );
      return true;
    } catch (error) {
      console.log(
        `Failed to send message to tab ${tabId} (attempt ${attempt}/${retries}):`,
        error
      );

      if (attempt < retries) {
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Check if tab still exists and is ready
        try {
          const tab = await chrome.tabs.get(tabId);
          if (tab.status !== "complete") {
            console.log(`Tab ${tabId} not ready, waiting...`);
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } catch (tabError) {
          console.log(`Tab ${tabId} no longer exists`);
          return false;
        }
      }
    }
  }

  console.log(
    `Failed to send message to tab ${tabId} after ${retries} attempts`
  );
  return false;
}

// Set up side panel behavior
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// Handle messages between different parts of the extension
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log("Background received message:", message);

  if (message.type === "USER_PROFILE_DETECTED") {
    const { userName } = message.payload;
    const { autoDetectEnabled, addToQueue } = useAppStore.getState();

    if (userName && autoDetectEnabled) {
      console.log(`Auto-queuing checks for user: ${userName}`);
      await addToQueue(userName);
    }
    return;
  }

  if (message.type === "PROCESS_QUEUE") {
    // This can be triggered from the UI, for example
    useAppStore.getState().processQueue();
  }

  if (message.type === "NOTIFICATION") {
    // Show system notification
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon-48.png",
      title: message.title || "FB Group Checker",
      message: message.message,
    });
  }
});

// Set up periodic queue processing with alarms
chrome.alarms.create("periodic-queue-check", {
  periodInMinutes: 1, // Check every minute for pending items
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "periodic-queue-check") {
    console.log("Periodic queue check triggered by alarm.");
    useAppStore.getState().processQueue();
  }
});

// Initialize extension
console.log("Facebook Group Checker background script loaded");

// On startup, process any items that might be left in the queue
useAppStore.getState().processQueue();
