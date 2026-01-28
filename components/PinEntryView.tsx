"use client";

import { useState, useEffect } from "react";
import { PinInput } from "@/components/PinInput";
import { Lock } from "lucide-react";

interface PinEntryViewProps {
  onCorrect: () => void;
  onForgot?: () => void;
}

export const PinEntryView = ({ onCorrect, onForgot }: PinEntryViewProps) => {
  const [error, setError] = useState<string | undefined>();
  const [resetKey, setResetKey] = useState(0);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    // Get name for greeting
    const name = localStorage.getItem("planer_userName") || "there";
    setUserName(name);
  }, []);

  const handlePinComplete = (enteredPin: string) => {
    const storedPin = localStorage.getItem("planer_pin");
    
    // Fallback if no pin stored (shouldn't happen if we are here)
    if (!storedPin) {
        onCorrect(); 
        return;
    }

    if (enteredPin === storedPin) {
        onCorrect();
    } else {
        setError("Incorrect PIN");
        setResetKey(prev => prev + 1); // Trigger clear
        // Clear error after 2s
        setTimeout(() => setError(undefined), 2000);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-white px-6">
       <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-[#1A1A1A] shadow-sm">
         <Lock size={28} />
       </div>

       <h1 className="mb-2 text-2xl font-display font-bold text-[#1A1A1A]">
         Welcome back, {userName}
       </h1>
       <p className="mb-12 text-center text-gray-400">
         Enter your PIN to access your reality.
       </p>

       <PinInput 
         label="" 
         onComplete={handlePinComplete} 
         error={error}
         resetKey={resetKey}
       />
       
       <button 
         onClick={onForgot} 
         className="mt-12 text-sm font-medium text-gray-400 hover:text-red-500 transition-colors"
       >
         Reset App Data
       </button>
    </div>
  );
};
