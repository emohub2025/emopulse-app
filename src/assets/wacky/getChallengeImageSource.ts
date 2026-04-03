import type { Challenge } from "../../navigation/types.js"; // or wherever it lives

export const WACKY_IMAGES: Record<string, any> = {
  PiratesAndNauticalAbsurdity: require("../../assets/wacky/pirates.png"),
  FoodThatFightsBack: require("./food-fights-back.png"),
  FantasyCreaturesInModernJobs: require("./fantasy.png"),
  HauntedButInconvenient: require("./ghosts.png"),
  AlienTourists: require("./aliens.png"),
  OverlyLiteralGenies: require("./genie.png"),
  HistoricalFiguresGoneWrong: require("./famous.png"),
  SportsInImpossibleWorlds: require("../../assets/wacky/sports.png"),
};

export function getChallengeImageSource(challenge: Challenge | null | undefined) {
  if (!challenge) {
    return require("../../assets/images/home.png");
  }

  // ⭐ Wacky category → resolve by subgenre
  if (challenge.source?.startsWith("Wacky")) {
    // Option A: subgenre comes from challenge.source ("WackyPulse:FoodThatFightsBack")
    let subgenreKey: string | undefined;

    if (challenge.source?.includes(":")) {
      subgenreKey = challenge.source.split(":")[1];
    }

    // Option B: backend sends challenge.subgenre directly
    if (!subgenreKey && (challenge as any).subgenre) {
      subgenreKey = (challenge as any).subgenre;
    }

    // Lookup in your map
    if (subgenreKey && WACKY_IMAGES[subgenreKey]) {
      return WACKY_IMAGES[subgenreKey];
    }

    // Fallback for unknown subgenres
    return require("../../assets/wacky/food-fights-back.png");
  }

  // ⭐ Normal remote image
  if (challenge.image_url) {
    return { uri: challenge.image_url };
  }

  // ⭐ Final fallback
  return require("../../assets/images/home.png");
}
