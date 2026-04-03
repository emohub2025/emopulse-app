// src/state/useUser.ts
import { useMemo } from 'react';
import { useUserStore } from './useUserStore';

export const useUser = (userId?: string | null) => {
  const user = useUserStore(state => state.user);

  const resolved = useMemo(() => {
    if (!userId) return user;              // if no id passed, assume current user
    if (!user) return null;
    return user.id === userId ? user : null;
  }, [user, userId]);

  return resolved;
};