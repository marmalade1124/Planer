
"use client";

import { motion } from "framer-motion";
import { Bell, Search, Menu } from "lucide-react";

export const Header = () => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-zinc-100 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-zinc-800 dark:bg-black/80">
      <div className="flex items-center gap-4">
        <button className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 lg:hidden">
          <Menu className="h-6 w-6" />
        </button>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Planer
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{currentDate}</p>
        </motion.div>
      </div>

      <div className="flex items-center gap-2">
        <button className="rounded-full p-2.5 text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
          <Search className="h-5 w-5" />
        </button>
        <button className="relative rounded-full p-2.5 text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-energy-low ring-2 ring-white dark:ring-black" />
        </button>
        
        {/* User Avatar Mock */}
        <div className="ml-2 h-9 w-9 overflow-hidden rounded-full ring-2 ring-zinc-100 dark:ring-zinc-800">
            <div className="flex h-full w-full items-center justify-center bg-indigo-500 text-sm font-medium text-white">
                R
            </div>
        </div>
      </div>
    </header>
  );
};
