"use client";

import { useCallback } from "react";

type HapticType = "success" | "error" | "light" | "medium" | "heavy";

export const useHaptic = () => {
  const trigger = useCallback((type: HapticType = "light") => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      switch (type) {
        case "success":
          // Short double vibration
          navigator.vibrate([10, 30, 10]); 
          break;
        case "error":
           // Long heavy vibration
          navigator.vibrate([50, 50, 50]);
          break;
        case "light":
          navigator.vibrate(5);
          break;
        case "medium":
          navigator.vibrate(15);
          break;
        case "heavy":
          navigator.vibrate(30);
          break;
      }
    }
  }, []);

  return { trigger };
};
