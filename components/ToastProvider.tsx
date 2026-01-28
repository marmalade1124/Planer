"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw } from "lucide-react";

interface ToastContextType {
  showToast: (message: string, onUndo?: () => void) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toast, setToast] = useState<{ message: string; onUndo?: () => void } | null>(null);

  const showToast = useCallback((message: string, onUndo?: () => void) => {
    setToast({ message, onUndo });
    
    // Auto dismiss after 4 seconds
    setTimeout(() => {
        setToast(curr => (curr?.message === message ? null : curr));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 left-6 right-6 mx-auto max-w-sm z-50 flex items-center justify-between bg-[#1A1A1A] text-white px-4 py-3 rounded-xl shadow-2xl"
          >
            <span className="text-sm font-medium">{toast.message}</span>
            <div className="flex items-center gap-3">
                {toast.onUndo && (
                    <button 
                        onClick={() => {
                            toast.onUndo?.();
                            setToast(null);
                        }}
                        className="text-yellow-400 text-sm font-bold hover:text-yellow-300 flex items-center gap-1"
                    >
                        <RotateCcw size={14} />
                        Undo
                    </button>
                )}
                <button 
                    onClick={() => setToast(null)}
                    className="text-gray-400 hover:text-white"
                >
                    <X size={18} />
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};
