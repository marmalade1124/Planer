"use client";

import { useState, useEffect, useRef } from "react";
import { Award, Zap, TrendingUp, Calendar, Settings, Camera } from "lucide-react";
import { getUserStats, uploadAvatar } from "@/lib/db";

interface ProfileViewProps {
    userName: string;
    onOpenSettings: () => void;
}

export const ProfileView = ({ userName, onOpenSettings }: ProfileViewProps) => {
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
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload image. Please check your internet connection.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-500 pb-20 relative">
            {/* Settings Button (Top Right) */}
            <button 
                onClick={onOpenSettings}
                className="absolute top-0 right-0 p-2 text-gray-400 hover:text-[#1A1A1A] transition-colors bg-gray-50 rounded-full hover:bg-gray-100"
            >
                <Settings size={20} />
            </button>

            {/* User Header */}
            <div className="flex items-center gap-4 mb-8 pt-2">
                <div className="relative group">
                    <div className="h-20 w-20 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden border-4 border-white">
                        {avatar ? (
                            <img src={avatar} alt="Profile" className="h-full w-full object-cover" />
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
                    <h2 className="text-xl font-bold text-[#1A1A1A]">{userName}</h2>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Award size={14} className="text-yellow-600" /> 
                        {stats.level}
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-[#F4F4F5] rounded-2xl p-5 flex flex-col justify-between h-32">
                    <Zap className="text-yellow-500" size={24} />
                    <div>
                        <p className="text-3xl font-display font-bold text-[#1A1A1A]">{stats.tasksCompleted}</p>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Tasks Done</p>
                    </div>
                </div>

                <div className="bg-[#F0FDF4] rounded-2xl p-5 flex flex-col justify-between h-32">
                    <TrendingUp className="text-green-600" size={24} />
                    <div>
                        <p className="text-3xl font-display font-bold text-green-700">{stats.focusScore}%</p>
                        <p className="text-xs font-semibold uppercase tracking-wider text-green-600/60">Focus Score</p>
                    </div>
                </div>
            </div>

            {/* Streak Section */}
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#333] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="text-gray-400" size={18} />
                        <span className="text-sm font-medium text-gray-300">Current Streak</span>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-5xl font-display font-bold">{stats.streakDays}</span>
                        <span className="text-lg font-medium text-gray-400 mb-1">days</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">
                        You've been consistent! Keep hitting your deadlines.
                    </p>
                </div>
                
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl mr-4 mb-4"></div>
            </div>

            <div className="mt-8 text-center">
                 <p className="text-sm text-gray-400">
                    More insights coming soon...
                 </p>
            </div>
        </div>
    );
}
