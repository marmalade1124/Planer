
"use client";

import { MessageSquare, Calendar, Clock, GraduationCap, User } from "lucide-react";
import clsx from "clsx";

export type Tab = "today" | "deadlines" | "thesis" | "profile";

interface BottomNavProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

import { useHaptic } from "@/hooks/useHaptic";
import { useAtmosphere } from "@/hooks/useAtmosphere";

export const BottomNav = ({ currentTab, onTabChange }: BottomNavProps) => {
  const haptic = useHaptic();
  const { isDark } = useAtmosphere();

  const handleTabChange = (tab: Tab) => {
      if (tab !== currentTab) {
          haptic.trigger('light');
          onTabChange(tab);
      }
  };

  return (
    <nav className={clsx(
        "fixed bottom-0 left-0 right-0 mx-auto w-full max-w-[430px] border-t px-8 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-4 backdrop-blur-xl transition-colors duration-500",
        isDark ? "border-white/10 bg-[#0F172A]/80" : "border-[#F1F1F1] bg-white/90"
    )}>
      <div className="flex items-center justify-between">
        <NavItem 
          icon={<Calendar className="h-6 w-6" />} 
          label="Today" 
          isActive={currentTab === "today"} 
          onClick={() => handleTabChange("today")}
          isDark={isDark}
        />
        <NavItem 
          icon={<Clock className="h-6 w-6" />} 
          label="Deadlines" 
          isActive={currentTab === "deadlines"} 
          onClick={() => handleTabChange("deadlines")}
          isDark={isDark}
        />
        <NavItem 
          icon={<GraduationCap className="h-6 w-6" />} 
          label="Thesis" 
          isActive={currentTab === "thesis"} 
          onClick={() => handleTabChange("thesis")}
          isDark={isDark}
        />
        <NavItem 
          icon={<User className="h-6 w-6" />} 
          label="Profile" 
          isActive={currentTab === "profile"} 
          onClick={() => handleTabChange("profile")}
          isDark={isDark}
        />
      </div>
    </nav>
  );
};

const NavItem = ({
  icon,
  label,
  isActive = false,
  onClick,
  isDark
}: {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  isDark: boolean;
}) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "flex min-h-[44px] min-w-[64px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl transition-all active:scale-95",
        isActive 
            ? isDark ? "text-white" : "text-[#1A1A1A]"
            : isDark ? "text-white/40 hover:bg-white/10 hover:text-white" : "text-[#A1A1AA] hover:bg-gray-50 hover:text-[#1A1A1A]"
      )}
    >
      <div className={clsx(isActive && "fill-current")}>{icon}</div>
      <span className={clsx("text-[10px] font-medium", isActive ? "font-semibold" : "")}>
        {label}
      </span>
    </div>
  );
};
