// src/context/FeedContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import type { FeedResponse } from "../navigation/types";

interface FeedContextValue {
  rssFeed: FeedResponse | null;
  pollFeed: FeedResponse | null;

  setRssFeed: React.Dispatch<React.SetStateAction<FeedResponse | null>>;
  setPollFeed: React.Dispatch<React.SetStateAction<FeedResponse | null>>;

  suppressGlobalReset: boolean;
  setSuppressGlobalReset: (v: boolean) => void;
}

export const FeedContext = createContext<FeedContextValue | null>(null);

interface FeedProviderProps {
  children: ReactNode;
}

export const FeedProvider: React.FC<FeedProviderProps> = ({ children }) => {
  const [rssFeed, setRssFeed] = useState<FeedResponse | null>(null);
  const [pollFeed, setPollFeed] = useState<FeedResponse | null>(null);

  const [suppressGlobalReset, setSuppressGlobalReset] = useState(false);

  return (
    <FeedContext.Provider
      value={{
        rssFeed,
        pollFeed,
        setRssFeed,
        setPollFeed,
        suppressGlobalReset,
        setSuppressGlobalReset,
      }}
    >
      {children}
    </FeedContext.Provider>
  );
};

export function useFeed() {
  const ctx = useContext(FeedContext);
  if (!ctx) throw new Error("useFeed must be used inside a FeedProvider");
  return ctx;
}
