import { isMemberOfGroup } from "../utils/is-member-of-groups";

const form = document.getElementById("check-form") as HTMLFormElement;
const groupIdInput = document.getElementById("group-id") as HTMLInputElement;
const userIdInput = document.getElementById("user-id") as HTMLInputElement;
const resultDiv = document.getElementById("result") as HTMLDivElement;
const checkButton = document.getElementById(
  "check-button"
) as HTMLButtonElement;

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const groupId = groupIdInput.value;
  const userId = userIdInput.value;

  if (!groupId || !userId) {
    return;
  }

  resultDiv.style.display = "none";
  checkButton.disabled = true;
  checkButton.textContent = "Checking...";

  try {
    const isMember = await isMemberOfGroup({ userId, groupId });
    resultDiv.textContent = isMember
      ? "This user is a member of the group."
      : "This user is NOT a member of the group.";
    resultDiv.className = isMember ? "success" : "error";
  } catch (error) {
    resultDiv.textContent = "An error occurred while checking.";
    resultDiv.className = "error";
    console.error(error);
  } finally {
    resultDiv.style.display = "block";
    checkButton.disabled = false;
    checkButton.textContent = "Check Membership";
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "USER_AND_GROUP_ID") {
    groupIdInput.value = message.payload.groupId;
    userIdInput.value = message.payload.userId;
  }
});
