import { originFetch } from "./origin-fetch";

export async function isMemberOfGroup({
  userId,
  groupId,
}: {
  userId: string;
  groupId: string;
}): Promise<boolean> {
  const url = `https://www.facebook.com/groups/${groupId}/user/${userId}/`;
  const fbPage = await originFetch(url, {
    headers: {},
  });
  const html = await fbPage.text();

  // First, try to find the profile_intro_card section
  const profileIntroCardMatch = html.match(
    /"profile_intro_card":\s*\{[\s\S]*?"context_items":\s*\{[\s\S]*?"nodes":\s*\[[\s\S]*?\][\s\S]*?\}/
  );

  console.log(
    "Profile intro card match:",
    profileIntroCardMatch ? "Found" : "Not found"
  );

  if (profileIntroCardMatch) {
    const introCardData = profileIntroCardMatch[0];
    console.log("Intro card data length:", introCardData.length);

    // Check for non-member text (both Unicode-escaped and plain text Vietnamese)
    const isNotMemberUnicode = introCardData.includes(
      "kh\\u00f4ng ph\\u1ea3i l\\u00e0 th\\u00e0nh vi\\u00ean c\\u1ee7a"
    );
    const isNotMemberPlainText = introCardData.includes(
      "không phải là thành viên của"
    );

    if (isNotMemberUnicode || isNotMemberPlainText) {
      console.log("Not member");
      return false;
    }

    // Check for member text (both Unicode-escaped and plain text Vietnamese)
    const isMemberUnicode =
      introCardData.includes("Th\\u00e0nh vi\\u00ean c\\u1ee7a") ||
      introCardData.includes("Qu\\u1ea3n tr\\u1ecb vi\\u00ean c\\u1ee7a") ||
      introCardData.includes(
        "Ng\\u01b0\\u1eddi ki\\u1ec3m duy\\u1ec7t c\\u1ee7a"
      );

    const isMemberPlainText =
      introCardData.includes("Thành viên của") ||
      introCardData.includes("Quản trị viên của") ||
      introCardData.includes("Người kiểm duyệt của");

    if (isMemberUnicode || isMemberPlainText) {
      console.log("Member found in intro card");
      return true;
    }
  }

  // Alternative approach: look for membership data in the broader context
  const membershipMatch = html.match(
    /"membership":\s*\{[\s\S]*?"added_time":\s*\d+[\s\S]*?\}/
  );

  if (membershipMatch) {
    console.log("Membership object found");
    return true;
  }

  console.log("No membership indicators found");
  return false;
}
