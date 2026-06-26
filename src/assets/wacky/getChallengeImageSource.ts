import type { Challenge } from "../../navigation/types.js"; // or wherever it lives

export const WACKY_IMAGES: Record<string, any> = {
  PiratesAndNauticalAbsurdity: require("../../assets/wacky/pirates.png"),
  VegetonPrime: require("./vegeton-prime.png"),
  WhenDogsTakeOver: require("./dogs-take-over.png"),
  WhenCatsTakeOver: require("./cats-take-over.png"),
  AliensVisitEarth: require("./aliens-visit-earth.png"),
  FloridaBecomesIndependent: require("./florida-becomes-independent.png"),
  CavemanBecomesPotus: require("./caveman-becomes-potus.png"),
  AfterlifeOfLivingSystems: require("./afterlife-of-living-systems.png"),
};

export function getChallengeImageSource(challenge: Challenge | null | undefined) {
  if (!challenge) {
    return require("../../assets/images/home.png");
  }

  // ⭐ Wacky category → resolve by subgenre
  if (challenge.source?.startsWith("Wacky")) {
    // Option A: subgenre comes from challenge.source ("WackyPulse:VegetonPrime")
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
    return require("../../assets/wacky/aliens-visit-earth.png");
  }

  // ⭐ Normal remote image
  if (challenge.image_url) {
    return { uri: challenge.image_url };
    
  }

  // ⭐ Final fallback
  return require("../../assets/images/home.png");
}
