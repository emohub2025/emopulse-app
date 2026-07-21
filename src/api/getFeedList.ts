import type { FeedResponse, FeedCategory, Challenge } from '../navigation/types';
import { apiGet } from "./engineClient";
import { decodeHtmlEntities } from "../utils/decodeHtmlEntities";

export async function getFeedList(source: "all" | "rss" | "polling" | "sponsor" = "all") {
  const url = source === "all"
    ? `/feed`
    : `/feed?source=${source}`;

  const response = await apiGet<FeedResponse>(url);

  const cleanedCategories: FeedCategory[] = response.categories.map(cat => ({
    ...cat,
    active: cat.active.map(ch => ({
      ...cleanChallenge(ch),
      category: cat.name
    })),
    recent: cat.recent.map(ch => ({
      ...cleanChallenge(ch),
      category: cat.name
    }))
  }));

  //console.log("📦 FULL FEED JSON:", JSON.stringify({ ...response, categories: cleanedCategories }, null, 2));

  return {
    ...response,
    categories: cleanedCategories,
  };
}

function cleanChallenge(ch: Challenge): Challenge {
  return {
    ...ch, // ⭐ keep everything (including poll fields)
    topic: decodeHtmlEntities(ch.topic),
    snippet: decodeHtmlEntities(ch.snippet),
    source: decodeHtmlEntities(ch.source),
    quote: decodeHtmlEntities(ch.quote),
    stat: decodeHtmlEntities(ch.stat),
  };
}
