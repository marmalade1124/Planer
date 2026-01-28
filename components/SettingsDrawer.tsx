"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, LogOut, User, RefreshCcw } from "lucide-react";
import { useState, useEffect } from "react";

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

export const SettingsDrawer = ({ isOpen, onClose, userName }: SettingsDrawerProps) => {
  const [localName, setLocalName] = useState(userName);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
        setLocalName(userName);
        setUserId(localStorage.getItem("planer_userId") || "Unknown");
    }
  }, [isOpen, userName]);

  const handleSaveName = () => {
      localStorage.setItem("planer_userName", localName);
      window.location.reload(); // Simple reload to apply name change globally
  }

  const handleSignOut = () => {
    if (confirm("This will clear your local session. Ensure you have your User ID backed up if you want to recover tasks later.")) {
        localStorage.removeItem("planer_userId");
        localStorage.removeItem("planer_userName");
        localStorage.removeItem("planer_pin"); // Clear PIN if used
        window.location.reload();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto h-[85vh] w-full max-w-[430px] rounded-t-[32px] bg-white px-6 pb-8 shadow-2xl"
          >
            {/* Handle Bar */}
            <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-[#E5E5E5]" />

            <div className="mt-6 flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold text-[#1A1A1A]">
                Settings
              </h2>
              <button
                onClick={onClose}
                className="rounded-full bg-[#F5F5F5] p-2 text-[#1A1A1A] transition-colors hover:bg-[#E5E5E5]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-8 space-y-8">
              {/* Profile Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#71717A]">
                    Profile
                </h3>
                <div className="space-y-2">
                    <label className="text-xs font-medium text-[#71717A]">Your Name</label>
                    <div className="flex gap-2">
                        <input 
                            value={localName}
                            onChange={(e) => setLocalName(e.target.value)}
                            className="flex-1 rounded-xl bg-[#F4F4F5] px-4 py-3 text-[#1A1A1A] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/5"
                        />
                        <button 
                            onClick={handleSaveName}
                            disabled={localName === userName}
                            className="px-4 py-2 rounded-xl bg-black text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Save
                        </button>
                    </div>
                </div>
              </div>

              {/* Data Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#71717A]">
                    Data & Account
                </h3>
                
                <div className="rounded-2xl border border-[#F1F1F1] p-4 bg-[#FAFAFA]">
                    <p className="text-xs text-[#71717A] mb-2">Device ID (Keep this safe to recover tasks)</p>
                    <code className="block bg-[#F1F1F1] p-2 rounded text-xs break-all select-all font-mono text-[#1A1A1A]">
                        {userId}
                    </code>
                </div>

                <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 py-3.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
                >
                    <LogOut size={18} />
                    Sign Out / Reset App
                </button>
                <p className="text-center text-left text-[10px] text-[#A1A1AA]">
                    Version 1.0.0 • Planer
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
