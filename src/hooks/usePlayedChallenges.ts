import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const PLAYED_KEY = "playedChallenges";

export async function markChallengePlayed(id: string) {
  const raw = await AsyncStorage.getItem(PLAYED_KEY);
  const arr = raw ? JSON.parse(raw) : [];
  if (!arr.includes(id)) {
    arr.push(id);
    await AsyncStorage.setItem(PLAYED_KEY, JSON.stringify(arr));
  }
}

export async function getPlayedChallenges(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(PLAYED_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function usePlayedChallenges() {
  const [played, setPlayed] = useState<string[]>([]);

  useEffect(() => {
    getPlayedChallenges().then(setPlayed);
  }, []);

  return played;
}