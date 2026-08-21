// /src/constants/emotions.ts

export type EmotionSlot = 1 | 2 | 3 | 4;

export const emotionSlotMap: Record<string, 1 | 2 | 3 | 4> = {
  happy: 1,
  sad: 2,
  anxious: 3,
  angry: 4,
};

export function getEmotionLabel(raw: string | null, category: string) {
  if (!raw) return null;
  const slot = emotionSlotMap[raw];   // happy → 1, sad → 2, anxious → 3, angry → 4
  return emotionLookup[slot][category];
}

export const emotionFeelingText: Record<string, string> = {
  happy: "Feeling good about this",
  anxious: "Something feels wrong",
  angry: "Not buying by this",
  sad: "Feeling bad about this",
};

export const emotionFeelingTextWacky: Record<string, string> = {
  happy: "This is hilarious",
  anxious: "Uhhh, what did I just read?",
  angry: "Nope.",
  sad: "My brain hurts",
};

export function getFeelingSentence(emotion: string, category: string) {
  if (category === "Wacky") {
    return emotionFeelingTextWacky[emotion] || null;
  }
  return emotionFeelingText[emotion] || null;
}

export const emotionLookup: Record<EmotionSlot, Record<string, string>> = {
  1: {
    Politics: 'Hopeful',
    Sports: 'Let\'s Go!',
    Entertainment: 'Loving it!',
    Music: 'Feeling It!',
    Tech: 'Curious',
    Finance: 'Bullish',
    Health: 'Good News!',
    Gaming: 'Let\'s Go!',
    Wacky: 'LOL',
  },
  2: {
    Politics: 'Sad',
    Sports: 'That Hurts',
    Entertainment: 'This Hurts',
    Music: 'Hits Hard',
    Tech: 'Skeptical',
    Finance: 'Bearish',
    Health: 'Sad',
    Gaming: 'Bummed',
    Wacky: 'WTF',
  },
  3: {
    Politics: 'Anxious',
    Sports: 'On Edge',
    Entertainment: 'Nervous',
    Music: 'Torn',
    Tech: 'Concerned',
    Finance: 'Nervous',
    Health: 'Concerned',
    Gaming: 'Tilted',
    Wacky: 'Confused',
  },
  4: {
    Politics: 'Angry',
    Sports: 'Pissed',
    Entertainment: 'Yikes!',
    Music: 'Angry',
    Tech: 'Frustrated',
    Finance: 'Skeptical',
    Health: 'Angry',
    Gaming: 'Salty',
    Wacky: 'Stupid',
  },
};
