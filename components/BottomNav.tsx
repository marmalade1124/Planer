
"use client";

import { MessageSquare, Calendar, Clock, GraduationCap, User } from "lucide-react";
import clsx from "clsx";

export type Tab = "today" | "deadlines" | "thesis" | "profile";

interface BottomNavProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const BottomNav = ({ currentTab, onTabChange }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-[430px] border-t border-[#F1F1F1] bg-white/90 px-8 pb-8 pt-4 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <NavItem 
          icon={<Calendar className="h-6 w-6" />} 
          label="Today" 
          isActive={currentTab === "today"} 
          onClick={() => onTabChange("today")}
        />
        <NavItem 
          icon={<Clock className="h-6 w-6" />} 
          label="Deadlines" 
          isActive={currentTab === "deadlines"} 
          onClick={() => onTabChange("deadlines")}
        />
        <NavItem 
          icon={<GraduationCap className="h-6 w-6" />} 
          label="Thesis" 
          isActive={currentTab === "thesis"} 
          onClick={() => onTabChange("thesis")}
        />
        <NavItem 
          icon={<User className="h-6 w-6" />} 
          label="Profile" 
          isActive={currentTab === "profile"} 
          onClick={() => onTabChange("profile")}
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
}: {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "flex cursor-pointer flex-col items-center gap-1 transition-colors",
        isActive ? "text-[#1A1A1A]" : "text-[#71717A] hover:text-[#1A1A1A]"
      )}
    >
      <div className={clsx(isActive && "fill-current")}>{icon}</div>
      <span className={clsx("text-[10px] font-medium", isActive ? "font-semibold" : "")}>
        {label}
      </span>
    </div>
  );
};
