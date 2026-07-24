// /src/constants/emotions.ts

export type EmotionSlot = 1 | 2 | 3 | 4;

export const emotionSlotMap: Record<string, 1 | 2 | 3 | 4> = {
  happy: 1,
  sad: 2,
  anxious: 3,
  angry: 4,
};

export const emotionFeelingText: Record<string, string> = {
  happy: "Feeling good about this",
  anxious: "Something feels wrong",
  angry: "Not convinced by this",
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
    Sports: 'Excited',
    Entertainment: 'Happy',
    Music: 'Happy',
    Tech: 'Curious',
    Finance: 'Bullish',
    Health: 'Relieved',
    Gaming: 'Excited',
    Wacky: 'LOL',
  },
  2: {
    Politics: 'Sad',
    Sports: 'Sad',
    Entertainment: 'Sad',
    Music: 'Melancholy',
    Tech: 'Skeptical',
    Finance: 'Bearish',
    Health: 'Sad',
    Gaming: 'Frustrated',
    Wacky: 'WTF',
  },
  3: {
    Politics: 'Anxious',
    Sports: 'Tense',
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
    Sports: 'Angry',
    Entertainment: 'Cringe',
    Music: 'Angry',
    Tech: 'Frustrated',
    Finance: 'Skeptical',
    Health: 'Angry',
    Gaming: 'Salty',
    Wacky: 'Stupid',
  },
};
