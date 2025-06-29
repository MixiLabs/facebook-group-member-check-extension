import { originFetch } from "./origin-fetch";
import { MembershipRole } from "./types";

export async function getMembershipRole({
  userId,
  groupId,
}: {
  userId: string;
  groupId: string;
}): Promise<MembershipRole> {
  const url = `https://www.facebook.com/groups/${groupId}/user/${userId}/`;
  const fbPage = await originFetch(url, {
    headers: {},
  });
  const html = await fbPage.text();

  const profileIntroCardMatch = html.match(
    /"profile_intro_card":\s*\{[\s\S]*?"context_items":\s*\{[\s\S]*?"nodes":\s*\[[\s\S]*?\][\s\S]*?\}/
  );

  if (profileIntroCardMatch) {
    const introCardData = profileIntroCardMatch[0];

    const isNotMember =
      introCardData.includes(
        "kh\\u00f4ng ph\\u1ea3i l\\u00e0 th\\u00e0nh vi\\u00ean c\\u1ee7a"
      ) || introCardData.includes("không phải là thành viên của");

    if (isNotMember) {
      return "NOT_MEMBER";
    }

    const isAdmin =
      introCardData.includes("Qu\\u1ea3n tr\\u1ecb vi\\u00ean c\\u1ee7a") ||
      introCardData.includes("Quản trị viên của");
    if (isAdmin) {
      return "ADMIN";
    }

    const isModerator =
      introCardData.includes(
        "Ng\\u01b0\\u1eddi ki\\u1ec3m duy\\u1ec7t c\\u1ee7a"
      ) || introCardData.includes("Người kiểm duyệt của");
    if (isModerator) {
      return "MODERATOR";
    }

    const isMember =
      introCardData.includes("Th\\u00e0nh vi\\u00ean c\\u1ee7a") ||
      introCardData.includes("Thành viên của");
    if (isMember) {
      return "MEMBER";
    }
  }

  const membershipMatch = html.match(
    /"membership":\s*\{[\s\S]*?"added_time":\s*\d+[\s\S]*?\}/
  );

  if (membershipMatch) {
    return "MEMBER";
  }

  return "NOT_MEMBER";
}
