import type { FeedResponse, FeedCategory, Challenge } from '../navigation/types';
import { apiGet } from "./engineClient";
import { decodeHtmlEntities } from "../utils/decodeHtmlEntities";

export async function getFeedList() {
  const response = await apiGet<FeedResponse>(`/feed`);

  // ⭐ Clean all HTML entities in all challenges
  const cleanedCategories: FeedCategory[] = response.categories.map(cat => ({
    ...cat,
    active: cat.active.map(ch => cleanChallenge(ch)),
    recent: cat.recent.map(ch => cleanChallenge(ch)),
  }));

  const cleanedResponse: FeedResponse = {
    ...response,
    categories: cleanedCategories,
  };

  //console.log("📦 FULL FEED JSON:", JSON.stringify(cleanedResponse, null, 2));

  return cleanedResponse;
}

function cleanChallenge(ch: Challenge): Challenge {
  return {
    ...ch,
    topic: decodeHtmlEntities(ch.topic),
    snippet: decodeHtmlEntities(ch.snippet),
    quote: decodeHtmlEntities(ch.quote),
    stat: decodeHtmlEntities(ch.stat),
  };
}
