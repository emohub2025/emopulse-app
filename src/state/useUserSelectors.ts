// src/state/useUserSelectors.ts
import { useUserStore } from './useUserStore';

export const useCurrentUser = () =>
  useUserStore(state => state.user);

export const useCurrentUserId = () =>
  useUserStore(state => state.user?.id ?? null);

export const useSetUser = () =>
  useUserStore(state => state.setUser);

export const useClearUser = () =>
  useUserStore(state => state.clearUser);