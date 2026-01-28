"use client";

import { useState } from "react";
import IntroFlow from "@/components/IntroFlow";
import { Dashboard } from "@/components/Dashboard";

export default function Home() {
  const [userName, setUserName] = useState<string | null>(null);

  if (userName) {
    return <Dashboard userName={userName} />;
  }

  return (
    <IntroFlow 
        onComplete={(name) => setUserName(name)} 
    />
  );
}
