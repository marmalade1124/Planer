
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Battery } from "lucide-react";
import clsx from "clsx";
import { EnergyLevel } from "@/lib/db";

interface AddTaskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, deadline: string, energy: EnergyLevel) => Promise<void>;
}

export const AddTaskDrawer = ({ isOpen, onClose, onAdd }: AddTaskDrawerProps) => {
  const [title, setTitle] = useState("");
  // Default deadline to tomorrow at 5pm
  const [deadline, setDeadline] = useState("");
  const [energy, setEnergy] = useState<EnergyLevel>("Medium");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      // Default: Tomorrow at 9AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      setDeadline(tomorrow.toISOString().slice(0, 16)); // Format for datetime-local
      setEnergy("Medium");
      setIsSubmitting(false); // Reset loading state
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !deadline || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Race against a timeout to prevent hanging on ad-blockers
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Network timeout")), 800)
      );

      await Promise.race([
        onAdd(title, deadline, energy),
        timeoutPromise
      ]);

      setTitle(""); 
      onClose(); 
    } catch (error: any) {
      if (error.message === "Network timeout") {
        console.warn("Task addition timed out (likely ad-blocker). Closing optimistically.");
        setTitle(""); 
        onClose(); 
      } else {
        console.error("Failed to add task:", error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-[430px] rounded-t-3xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1A1A1A]">New Task</h2>
              <button
                onClick={onClose}
                className="rounded-full bg-[#F5F5F5] p-2 text-[#71717A] hover:bg-[#E5E5E5]"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Title Input */}
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="What needs to be done?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                  className="w-full border-b border-[#F1F1F1] pb-2 text-lg font-medium text-[#1A1A1A] placeholder:text-[#D4D4D8] focus:border-[#1A1A1A] focus:outline-none"
                />
              </div>

              {/* Deadline Input */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-[#71717A]">
                  <Calendar size={16} /> Deadline
                </label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-xl border border-[#F1F1F1] bg-[#FAFAFA] px-4 py-3 text-[#1A1A1A] outline-none focus:border-[#1A1A1A]"
                />
              </div>

               {/* Energy Selector */}
               <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-[#71717A]">
                  <Battery size={16} /> Required Energy
                </label>
                <div className="flex gap-2">
                  {(["Low", "Medium", "High"] as EnergyLevel[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setEnergy(level)}
                      className={clsx(
                        "flex-1 rounded-xl border py-3 text-sm font-medium transition-all active:scale-95",
                        energy === level
                          ? level === "Low" ? "border-blue-200 bg-blue-50 text-blue-700 ring-2 ring-blue-200 ring-offset-1"
                          : level === "Medium" ? "border-yellow-200 bg-yellow-50 text-yellow-700 ring-2 ring-yellow-200 ring-offset-1"
                          : "border-green-200 bg-green-50 text-green-700 ring-2 ring-green-200 ring-offset-1"
                          : "border-zinc-100 bg-white text-zinc-400 hover:bg-zinc-50"
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!title || isSubmitting}
                className="mt-4 w-full rounded-xl bg-[#1A1A1A] py-4 text-center font-bold text-white transition-opacity active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? "Adding..." : "Add to Plan"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
