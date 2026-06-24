// src/context/FeedContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import type { FeedResponse } from "../navigation/types"; // adjust path if needed
import eventBus from "../components/EventBus";
import { navigationRef } from "../navigation/navigationRef";

// ⭐ 1. Define the shape of the context
interface FeedContextValue {
  feed: FeedResponse | null;
  setFeed: React.Dispatch<React.SetStateAction<FeedResponse | null>>;
  suppressGlobalReset: boolean;
  setSuppressGlobalReset: (v: boolean) => void;
}

// ⭐ 2. Create the context with proper typing
export const FeedContext = createContext<FeedContextValue | null>(null);

// ⭐ 3. Provider component
interface FeedProviderProps {
  children: ReactNode;
}

export const FeedProvider: React.FC<FeedProviderProps> = ({ children }) => {
  const [feed, setFeed] = useState<FeedResponse | null>(null);

  // ⭐ Allow screens to temporarily disable global reset behavior
  const [suppressGlobalReset, setSuppressGlobalReset] = useState(false);

  useEffect(() => {
    const handler = () => {
      console.log("Cycle expired → clearing feed");

      // 1. Reset navigation stack (unless suppressed)
      if (!suppressGlobalReset && navigationRef.isReady()) {
        console.log("Global reset → CategoryList");
        navigationRef.reset({
          index: 0,
          routes: [{ name: "CategoryList" }],
        });
      }

      // 2. Clear feed
      setFeed(null);
    };

    eventBus.on("cycleExpired", handler);
    return () => {
      eventBus.off("cycleExpired", handler); // returns void now
    };
  }, [suppressGlobalReset]);

  return (
    <FeedContext.Provider 
      value={{ 
        feed, 
        setFeed,
        suppressGlobalReset,
        setSuppressGlobalReset 
      }}
    >
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
