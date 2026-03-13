import type { Challenge } from "../../navigation/types.ts"; // or wherever it lives

export const WACKY_IMAGES: Record<string, any> = {
  FoodThatFightsBack: require("./food-fights-back.png"),
  FantasyCreaturesInModernJobs: require("./fantasy-creatures-in-modern-jobs.png"),
  HauntedButInconvenient: require("./food-fights-back.png"),
  SportsInImpossibleWorlds: require("./food-fights-back.png"),
  AlienTourists: require("./food-fights-back.png"),
  UnboundedAbsurdity: require("./food-fights-back.png"),
};

export function getChallengeImageSource(challenge: Challenge | null | undefined) {
  console.log("🔍 getChallengeImageSource received challenge:", {
    id: challenge?.id,
    topic: challenge?.topic,
    category: challenge?.category,
    source: challenge?.source,
    image_url: challenge?.image_url,
  });
  if (!challenge) return null;

  // Wacky override
  if (challenge.category === "Wacky" && challenge.source?.startsWith("WackyPulse:")) {
    const subgenreKey = challenge.source.split(":")[1];
    const wackyImage = WACKY_IMAGES[subgenreKey];
    if (wackyImage) return wackyImage;
  }

  // Normal image
  if (challenge.image_url) {
    return { uri: challenge.image_url };
  }

  return null;
}
