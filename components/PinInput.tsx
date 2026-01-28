
"use client";

import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

interface PinInputProps {
  length?: number;
  onComplete: (pin: string) => void;
  label: string;
  error?: string;
}

export const PinInput = ({ length = 4, onComplete, label, error }: PinInputProps) => {
  const [pin, setPin] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
            className={clsx(
              "h-14 w-12 rounded-xl border-2 bg-transparent text-center text-2xl font-bold outline-none transition-all",
              "focus:border-[#1A1A1A] focus:scale-110",
              error ? "border-red-400 text-red-500" : "border-[#E5E5E5] text-[#1A1A1A]"
            )}
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
