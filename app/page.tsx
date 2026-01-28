"use client";

import { useState, useEffect } from "react";
import IntroFlow from "@/components/IntroFlow";
import { Dashboard } from "@/components/Dashboard";
import { PinEntryView } from "@/components/PinEntryView";

export default function Home() {
  const [authState, setAuthState] = useState<'loading' | 'setup' | 'locked' | 'unlocked'>('loading');
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    // Check storage on mount
    const savedName = localStorage.getItem("planer_userName");
    const savedPin = localStorage.getItem("planer_pin");

    if (savedName && savedPin) {
        setUserName(savedName);
        setAuthState('locked');
    } else {
        setAuthState('setup');
    }
  }, []);

  const handleUnlock = () => {
      setAuthState('unlocked');
  };

  const handleSetupComplete = (name: string) => {
      setUserName(name);
      setAuthState('unlocked');
  };

  const handleReset = () => {
      if (confirm("Resetting will clear all local data. Are you sure?")) {
          localStorage.clear();
          window.location.reload();
      }
  }

  if (authState === 'loading') return null; // Or a splash screen

  if (authState === 'locked') {
      return <PinEntryView onCorrect={handleUnlock} onForgot={handleReset} />;
  }

  if (authState === 'setup') {
      return <IntroFlow onComplete={handleSetupComplete} />;
  }

  return <Dashboard userName={userName!} />;
}
