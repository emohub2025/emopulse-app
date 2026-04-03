// src/state/useUserStore.ts
import { create } from 'zustand';
import type { MobileUser } from "../navigation/types";

interface UserState {
  user: MobileUser | null;
  setUser: (user: MobileUser | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>(set => ({
  user: null,
  setUser: user => set({ user }),
  clearUser: () => set({ user: null }),
}));