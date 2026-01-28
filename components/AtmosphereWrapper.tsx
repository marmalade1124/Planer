"use client";

import { useAtmosphere } from "@/hooks/useAtmosphere";

export const AtmosphereWrapper = ({ children }: { children: React.ReactNode }) => {
  const atmosphere = useAtmosphere();

  return (
    <div
      className={`relative flex min-h-dvh w-full max-w-[430px] flex-col shadow-2xl transition-all duration-1000 ${atmosphere.gradient}`}
    >
      {children}
    </div>
  );
};
