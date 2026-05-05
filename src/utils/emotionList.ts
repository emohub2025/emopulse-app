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

export const emotionLookup: Record<EmotionSlot, Record<string, string>> = {
  1: {
    Politics: 'Hopeful',
    Sports: 'Excited',
    Entertainment: 'Happy',
    Music: 'Happy',
    Tech: 'Curious',
    Finance: 'Confident',
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
    Finance: 'Worried',
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
    Finance: 'Anxious',
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
    Finance: 'Angry',
    Health: 'Angry',
    Gaming: 'Salty',
    Wacky: 'Stupid',
  },
};
