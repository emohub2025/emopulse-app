// src/context/FeedContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import type { FeedResponse } from "../navigation/types"; // adjust path if needed
import eventBus from "../components/EventBus";

// ⭐ 1. Define the shape of the context
interface FeedContextValue {
  feed: FeedResponse | null;
  setFeed: React.Dispatch<React.SetStateAction<FeedResponse | null>>;
}

// ⭐ 2. Create the context with proper typing
export const FeedContext = createContext<FeedContextValue | null>(null);

// ⭐ 3. Provider component
interface FeedProviderProps {
  children: ReactNode;
}

export const FeedProvider: React.FC<FeedProviderProps> = ({ children }) => {
  const [feed, setFeed] = useState<FeedResponse | null>(null);

  useEffect(() => {
    const handler = () => {
      // Clear stale feed globally when cycle expires
      //console.log("Clearing stale feed globally when cycle expires");
      setFeed(null);
    };

    eventBus.on('cycleExpired', handler);

    return () => {
      eventBus.off('cycleExpired', handler); // returns void now
    };
  }, []);

  return (
    <FeedContext.Provider value={{ feed, setFeed }}>
      {children}
    </FeedContext.Provider>
  );
};

// ⭐ 4. Hook to access the feed
export function useFeed() {
  const ctx = useContext(FeedContext);
  if (!ctx) {
    throw new Error("useFeed must be used inside a FeedProvider");
  }
  return ctx;
}