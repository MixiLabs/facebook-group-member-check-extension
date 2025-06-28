import { originFetch } from "./origin-fetch";

type UserInfo = {
  id: string;
  name: string | null;
  alternateName: string | null;
  gender: string | null;
  url: string | null;
  images: {
    cover: string | null;
    avatar: string | null;
  };
};

async function findFacebookIdFallback(html: string): Promise<string | null> {
  // Pattern 1: Look for userID within a props object
  let match = html.match(/"props":\{[^{}]*?"userID":"(\d+)"/);
  if (match && match[1] && match[1] !== "0" && match[1]?.length > 5) {
    console.log("Match by props");
    return match[1];
  }

  // Pattern 2: Look for a generic userID
  match = html.match(/"userID":"(\d+)"/);
  if (match && match[1] && match[1] !== "0" && match[1]?.length > 5) {
    console.log("Match by userID");
    return match[1];
  }

  // Pattern 3: Look for "actorID"
  match = html.match(/"actorID":"(\d+)"/);
  if (match && match[1] && match[1] !== "0" && match[1]?.length > 5) {
    console.log("Match by actorID");
    return match[1];
  }

  console.log("No match found in fallback");
  return null;
}

export async function findFacebookInfo(
  userName: string
): Promise<UserInfo | null> {
  // Extract account from URL to build the mobile about page URL, similar to facebook-scraper
  const profileUrl = `https://www.facebook.com/${userName}/`;

  const fbPage = await originFetch(profileUrl);
  const html = await fbPage.text();

  const rendererKey = '"XFBProfileEntityConvergenceHeaderRenderer"';
  const rendererIndex = html.indexOf(rendererKey);

  if (rendererIndex !== -1) {
    // The user object we want to extract is a sibling of the __typename.
    // Let's find the start of the renderer object.
    let rendererStartIndex = html.lastIndexOf("{", rendererIndex);

    if (rendererStartIndex !== -1) {
      const userKey = '"user":';
      const userKeyIndex = html.indexOf(userKey, rendererStartIndex);
      const userStartIndex = html.indexOf("{", userKeyIndex);

      if (userStartIndex !== -1) {
        let braceCount = 1;
        let i = userStartIndex + 1;
        while (i < html.length && braceCount > 0) {
          if (html[i] === "{") {
            braceCount++;
          } else if (html[i] === "}") {
            braceCount--;
          }
          i++;
        }

        if (braceCount === 0) {
          const userJson = html.substring(userStartIndex, i);
          try {
            const userInfoRaw = JSON.parse(userJson);
            if (userInfoRaw && userInfoRaw.id) {
              console.log("Found user info by __typename");
              const userInfo: UserInfo = {
                id: userInfoRaw.id,
                name: userInfoRaw.name || null,
                alternateName: userInfoRaw.alternate_name || null,
                gender: userInfoRaw.gender || null,
                url: userInfoRaw.url || null,
                images: {
                  cover: userInfoRaw.cover_photo?.photo?.image?.uri || null,
                  avatar: userInfoRaw.profilePicLarge?.uri || null,
                },
              };
              return userInfo;
            }
          } catch (e) {
            console.error("Failed to parse user info JSON", e);
          }
        }
      }
    }
  }

  // Fallback to just getting the ID and returning a partial object
  const fallbackId = await findFacebookIdFallback(html);
  if (fallbackId) {
    console.log("Using fallback to get ID");
    // We don't have the full user info, but we can return what we have.
    // The type assertion is partial, but better than nothing.
    return {
      id: fallbackId,
      name: null,
      alternateName: null,
      gender: null,
      url: null,
      images: {
        cover: null,
        avatar: null,
      },
    };
  }

  console.log("No user information found");
  return null;
}
