import { originFetch } from "./origin-fetch";

export async function findFacebookId(userName: string) {
  // Extract account from URL to build the mobile about page URL, similar to facebook-scraper
  const profileUrl = `https://www.facebook.com/${userName}/`;

  const fbPage = await originFetch(profileUrl);
  const html = await fbPage.text();

  // --- Fallback Patterns ---

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

  console.log("No match found");
  return null;
}
