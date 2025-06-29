const EXCLUDED_SLUGS = [
  "groups",
  "pages",
  "watch",
  "marketplace",
  "friends",
  "events",
  "gaming",
  "login",
  "help",
  "settings",
  "photo",
  "photo.php",
  "story.php",
  "videos",
  "reels",
];

export function extractFacebookIdentifier(input: string): string {
  const trimmedInput = input.trim();

  try {
    // Treat the input as a potential URL
    const url = new URL(
      trimmedInput.startsWith("http") ? trimmedInput : `https://${trimmedInput}`
    );

    if (url.hostname.includes("facebook.com")) {
      // Pattern: /groups/{groupId}/user/{userId}
      const groupUserMatch = url.pathname.match(/\/groups\/\d+\/user\/(\d+)/);
      if (groupUserMatch && groupUserMatch[1]) return groupUserMatch[1];

      // Pattern: /profile.php?id={userId}
      if (url.pathname === "/profile.php") {
        const userId = url.searchParams.get("id");
        if (userId) return userId;
      }

      // Pattern: /{username}
      const pathParts = url.pathname.split("/").filter((p) => p);
      if (pathParts.length > 0) {
        const potentialId = pathParts[0];
        if (
          !EXCLUDED_SLUGS.includes(potentialId) &&
          !potentialId.includes(".php")
        ) {
          return potentialId;
        }
      }
    }
  } catch (e) {
    // It's not a valid URL, so we assume it's a raw ID/username.
  }

  // If all else fails, return the original trimmed input.
  return trimmedInput;
}
