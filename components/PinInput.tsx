
"use client";

import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

interface PinInputProps {
  length?: number;
  onComplete: (pin: string) => void;
  label: string;
  error?: string;
  resetKey?: number; // Change this to trigger reset
}

export const PinInput = ({ length = 4, onComplete, label, error, resetKey }: PinInputProps) => {
  const [pin, setPin] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Clear pin when resetKey changes
  useEffect(() => {
      if (resetKey !== undefined) {
          setPin(new Array(length).fill(""));
          inputRefs.current[0]?.focus();
      }
  }, [resetKey, length]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto-advance
    if (value !== "" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check complete
    if (newPin.every((digit) => digit !== "")) {
      onComplete(newPin.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <h2 className="mb-8 text-xl font-medium text-[#1A1A1A] text-center">{label}</h2>
      
      <div className="flex gap-4">
        {pin.map((digit, idx) => (
          <motion.input
            key={idx}
            ref={(el) => { inputRefs.current[idx] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            
            // Mask the input logic if needed, but for now we keep visible digits as per user preference or "modern" usage?
            // Actually modern apps often mask. Let's stick to visible for now unless requested.
            
            className={clsx(
              "h-16 w-14 rounded-2xl border-2 bg-gray-50 text-center text-3xl font-bold outline-none transition-all duration-200",
              "focus:border-black focus:bg-white focus:scale-110 focus:shadow-lg",
              error 
                ? "border-red-400 text-red-500 bg-red-50 animate-shake" 
                : "border-transparent text-[#1A1A1A]"
            )}
            style={{
                boxShadow: error ? "none" : "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)"
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          />
        ))}
      </div>
      
      {error && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-sm text-red-500 font-medium"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};
