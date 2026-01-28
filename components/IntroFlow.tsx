"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Lock, User, Loader2 } from "lucide-react";
import { Dashboard } from "@/components/Dashboard";

type Step = 1 | 2 | 3;

interface IntroFlowProps {
    onComplete: (name: string) => void;
}

export default function IntroFlow({ onComplete }: IntroFlowProps) {
  const [step, setStep] = useState<Step>(1); 
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");

  useEffect(() => {
    // Only verify we are in setup mode, do nothing else
  }, []);

  const handleNext = () => {
    if (step === 1 && name.trim()) {
      setStep(2);
    } else if (step === 2 && pin.length === 4) {
      setStep(3); // Loading step
      
      // Save data
      localStorage.setItem("planer_userName", name);
      localStorage.setItem("planer_pin", pin); 
      
      // Simulate loading/setup
      setTimeout(() => {
          onComplete(name);
      }, 1500);
    }
  };

  if (step === 3) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-white px-6">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="h-16 w-16 rounded-2xl bg-black flex items-center justify-center mb-6 shadow-xl">
                    <span className="text-white font-bold text-2xl">P</span>
                </div>
            </motion.div>
            <h2 className="text-2xl font-display font-bold text-[#1A1A1A] mb-2">Planer</h2>
            <p className="text-gray-400 text-sm">Setting up your space...</p>
        </div>
      )
  }

  return (
    <div className="flex h-screen w-full flex-col bg-white px-6 pt-20 pb-10">
      {/* Progress Bar */}
      <div className="mb-12 flex gap-2">
        <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 1 ? "bg-black" : "bg-gray-100"}`} />
        <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 2 ? "bg-black" : "bg-gray-100"}`} />
      </div>

      <AnimatePresence mode="wait">
        
        {/* STEP 1: NAME INPUT */}
        {step === 1 && (
          <motion.div
            key="name-step"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col flex-grow"
          >
            <div className="flex-grow">
                <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center mb-6 text-black">
                    <User size={24} />
                </div>
                <h1 className="text-3xl font-display font-bold text-[#1A1A1A] mb-3">
                    What should we call you?
                </h1>
                <p className="text-gray-500 mb-8">
                    Your name will be displayed on your personalized dashboard.
                </p>
                <input
                    autoFocus
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full border-b-2 border-gray-100 py-4 text-2xl font-medium text-[#1A1A1A] placeholder:text-gray-300 focus:border-black focus:outline-none transition-colors"
                />
            </div>
            
            <button
                onClick={handleNext}
                disabled={!name.trim()}
                className="w-full rounded-2xl bg-black py-4 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
            >
                Continue <ArrowRight size={20} />
            </button>
          </motion.div>
        )}

        {/* STEP 2: PIN CREATION */}
        {step === 2 && (
          <motion.div
            key="pin-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col flex-grow"
          >
            <div className="flex-grow">
                <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center mb-6 text-black">
                    <Lock size={24} />
                </div>
                <h1 className="text-3xl font-display font-bold text-[#1A1A1A] mb-3">
                    Set a quick PIN
                </h1>
                <p className="text-gray-500 mb-8">
                    Keep your tasks private with a simple 4-digit code.
                </p>
                <input
                    autoFocus
                    type="tel"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="0000"
                    className="w-full border-b-2 border-gray-100 py-4 text-2xl font-medium text-[#1A1A1A] placeholder:text-gray-300 focus:border-black focus:outline-none transition-colors tracking-[1em] text-center"
                />
            </div>

            <button
                onClick={handleNext}
                disabled={pin.length !== 4}
                className="w-full rounded-2xl bg-black py-4 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
            >
                Finish Setup <ArrowRight size={20} />
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
