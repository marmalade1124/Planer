"use client";

import { useState, useEffect } from "react";

export type AtmosphereType = "dawn" | "day" | "sunset" | "night";

interface Atmosphere {
  type: AtmosphereType;
  label: string;
  gradient: string;
  isDark: boolean;
}

const THEMES: Record<AtmosphereType, Atmosphere> = {
  dawn: {
    type: "dawn",
    label: "Dawn",
    gradient: "bg-gradient-to-b from-[#FFEFD5] to-[#FFFFFF]", // Soft Peach to White
    isDark: false,
  },
  day: {
    type: "day",
    label: "Daylight",
    gradient: "bg-[#FFFFFF]", // Clean White
    isDark: false,
  },
  sunset: {
    type: "sunset",
    label: "Sunset",
    gradient: "bg-gradient-to-b from-[#FFF0F5] to-[#E6E6FA]", // Lavender/Pinkish
    isDark: false, // Keeping it light for text readability for now
  },
  night: {
    type: "night",
    label: "Midnight",
    gradient: "bg-gradient-to-b from-[#0F172A] to-[#1E293B]", // Slate 900 to Slate 800
    isDark: true,
  },
};

export const useAtmosphere = () => {
  const [atmosphere, setAtmosphere] = useState<Atmosphere>(THEMES.day);

  useEffect(() => {
    const updateAtmosphere = () => {
      const hour = new Date().getHours();
      
      if (hour >= 5 && hour < 11) {
        setAtmosphere(THEMES.dawn);
      } else if (hour >= 11 && hour < 17) {
        setAtmosphere(THEMES.day);
      } else if (hour >= 17 && hour < 20) {
        setAtmosphere(THEMES.sunset);
      } else {
        setAtmosphere(THEMES.night);
      }
    };

    updateAtmosphere();
    const interval = setInterval(updateAtmosphere, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return atmosphere;
};
