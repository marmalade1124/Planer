"use client";

import { useState, useEffect, useRef } from "react";
import { Award, Zap, TrendingUp, Calendar, Settings, Camera } from "lucide-react";
import Image from "next/image";
import { getUserStats, uploadAvatar } from "@/lib/db";
import { EnergyChart } from "@/components/EnergyChart";
import { useAtmosphere } from "@/hooks/useAtmosphere";
import clsx from "clsx";

interface ProfileViewProps {
    userName: string;
    onOpenSettings: () => void;
}

export const ProfileView = ({ userName, onOpenSettings }: ProfileViewProps) => {
    const { isDark } = useAtmosphere();
    const [stats, setStats] = useState({
        tasksCompleted: 0,
        focusScore: 0,
        streakDays: 0,
        level: "Novice"
    });
    const [avatar, setAvatar] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Load stats
        const fetchStats = async () => {
             const userId = localStorage.getItem("planer_userId");
             if (userId) {
                 const data = await getUserStats(userId);
                 let level = "Novice";
                 if (data.tasksCompleted > 5) level = "Apprentice";
                 if (data.tasksCompleted > 20) level = "Scholar";
                 if (data.tasksCompleted > 50) level = "Master";
                 if (data.tasksCompleted > 100) level = "Grandmaster";
                 setStats({ ...data, level });
             }
        };
        fetchStats();

        // Load avatar
        const savedAvatar = localStorage.getItem("planer_avatar");
        if (savedAvatar) setAvatar(savedAvatar);
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            alert("Image too large. Please choose an image under 2MB.");
            return;
        }

        const userId = localStorage.getItem("planer_userId");
        if (!userId) {
             alert("User ID missing. Try refreshing.");
             return;
        }

        try {
            setUploading(true);
            const publicUrl = await uploadAvatar(userId, file);
            
            // Add cache buster to force visual update since URL structure matches
            const urlWithCache = `${publicUrl}?t=${Date.now()}`;
            
            setAvatar(urlWithCache);
            localStorage.setItem("planer_avatar", urlWithCache);
        } catch (error: any) {
            console.error("Upload failed", error);
            alert(`Upload failed: ${error.message || "Unknown error"}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-500 pb-32 relative">
            {/* Settings Button (Top Right) */}
            <button 
                onClick={onOpenSettings}
                className={clsx(
                    "absolute top-0 right-0 p-2 transition-colors rounded-full",
                    isDark 
                        ? "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white" 
                        : "bg-gray-50 text-gray-400 hover:text-[#1A1A1A] hover:bg-gray-100"
                )}
            >
                <Settings size={20} />
            </button>

            {/* User Header */}
            <div className="flex items-center gap-4 mb-8 pt-2">
                <div className="relative group">
                    <div className={clsx(
                        "h-20 w-20 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg overflow-hidden border-4",
                        isDark ? "bg-white/10 text-white border-white/10" : "bg-[#1A1A1A] text-white border-white"
                    )}>
                        {avatar ? (
                            <Image 
                                src={avatar} 
                                alt="Profile" 
                                fill
                                sizes="80px"
                                className="object-cover"
                                priority
                            />
                        ) : (
                            userName.charAt(0).toUpperCase()
                        )}
                    </div>
                    
                    {/* Hover Overlay */}
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                    >
                         {uploading ? (
                             <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                         ) : (
                             <Camera className="text-white" size={24} />
                         )}
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                </div>
                
                <div>
                    <h2 className={clsx("text-xl font-bold transition-colors", isDark ? "text-white" : "text-[#1A1A1A]")}>{userName}</h2>
                    <p className={clsx("text-sm flex items-center gap-1", isDark ? "text-white/60" : "text-gray-500")}>
                        <Award size={14} className="text-yellow-600" /> 
                        {stats.level}
                    </p>
                </div>
            </div>

            {/* Stats Grid - Glassmorphism */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={clsx(
                    "backdrop-blur-md rounded-2xl p-5 flex flex-col justify-between h-32 border shadow-sm transition-colors",
                    isDark ? "bg-white/5 border-white/10" : "bg-white/60 border-white/40"
                )}>
                    <Zap className="text-yellow-500" size={24} />
                    <div>
                        <p className={clsx("text-3xl font-display font-bold", isDark ? "text-white" : "text-[#1A1A1A]")}>{stats.tasksCompleted}</p>
                        <p className={clsx("text-xs font-semibold uppercase tracking-wider", isDark ? "text-white/40" : "text-gray-500")}>Tasks Done</p>
                    </div>
                </div>

                <div className={clsx(
                    "backdrop-blur-md rounded-2xl p-5 flex flex-col justify-between h-32 border shadow-sm transition-colors",
                    isDark ? "bg-white/5 border-white/10" : "bg-white/60 border-white/40"
                )}>
                    <TrendingUp className="text-green-500" size={24} />
                    <div>
                        <p className="text-3xl font-display font-bold text-green-500">{stats.focusScore}%</p>
                        <p className={clsx("text-xs font-semibold uppercase tracking-wider", isDark ? "text-green-500/60" : "text-green-600/60")}>Focus Score</p>
                    </div>
                </div>
            </div>

            {/* Energy Chart Section */}
            <div className={clsx(
                "mb-6 backdrop-blur-md rounded-3xl p-6 border shadow-sm transition-colors",
                isDark ? "bg-white/5 border-white/10" : "bg-white/60 border-white/40"
            )}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className={clsx("text-sm font-semibold", isDark ? "text-white" : "text-[#1A1A1A]")}>Energy Flow</h3>
                    <span className={clsx("text-xs", isDark ? "text-white/40" : "text-gray-400")}>Last 7 Days</span>
                </div>
                <EnergyChart isDark={isDark} />
            </div>

            {/* Streak Section */}
            <div className={clsx(
                "rounded-3xl p-6 text-white shadow-xl relative overflow-hidden",
                isDark ? "bg-gradient-to-br from-indigo-900 to-slate-900" : "bg-gradient-to-br from-[#1A1A1A] to-[#333]"
            )}>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="text-white/60" size={18} />
                        <span className="text-sm font-medium text-white/80">Current Streak</span>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-5xl font-display font-bold">{stats.streakDays}</span>
                        <span className="text-lg font-medium text-white/60 mb-1">days</span>
                    </div>
                    <p className="text-xs text-white/60 mt-4">
                        You've been consistent! Keep hitting your deadlines.
                    </p>
                </div>
                
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl mr-4 mb-4"></div>
            </div>
        </div>
    );
}
