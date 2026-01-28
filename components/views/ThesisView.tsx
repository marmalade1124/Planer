"use client";

import { useState, useEffect } from "react";
import { Plus, Flag, CheckCircle2, Circle, Clock } from "lucide-react";
import { Milestone, getMilestones, addMilestone, toggleMilestone } from "@/lib/db";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { useConfetti } from "@/hooks/useConfetti";
import { useHaptic } from "@/hooks/useHaptic";
import { useAtmosphere } from "@/hooks/useAtmosphere";

export const ThesisView = () => {
    const { isDark } = useAtmosphere();
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [newTitle, setNewTitle] = useState("");
    const [newDate, setNewDate] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    
    const confetti = useConfetti();
    const haptic = useHaptic();

    useEffect(() => {
        const userId = localStorage.getItem("planer_userId");
        if (userId) {
            getMilestones(userId).then(setMilestones);
        }
    }, []);

    const handleAdd = async () => {
        if (!newTitle || !newDate) return;
        const userId = localStorage.getItem("planer_userId");
        if (!userId) return;

        haptic.trigger('medium');
        const newItem = await addMilestone(userId, newTitle, new Date(newDate));
        setMilestones([...milestones, newItem]); // Optimistic update (sort later)
        setNewTitle("");
        setNewDate("");
        setIsAdding(false);
    };

    const handleToggle = async (id: string, current: boolean) => {
        const userId = localStorage.getItem("planer_userId");
        // Optimistic
        setMilestones(prev => prev.map(m => m.id === id ? { ...m, completed: !current } : m));
        
        if (!current) {
            confetti.trigger();
            haptic.trigger('success');
        } else {
            haptic.trigger('light');
        }

        await toggleMilestone(id, current);
    };

    // Calculate generic progress
    const completedCount = milestones.filter(m => m.completed).length;
    const progress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

    // Find nearest deadline
    const nearest = milestones
        .filter(m => !m.completed && new Date(m.deadline) > new Date())
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0];

    const getDaysLeft = (date: Date) => {
        const diff = new Date(date).getTime() - new Date().getTime();
        return Math.ceil(diff / (1000 * 3600 * 24));
    };

    return (
        <div className="pb-24 animate-in fade-in duration-500">
            {/* Header / Countdown */}
            <div className={clsx(
                "mb-8 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden transition-colors",
                isDark ? "bg-white/10" : "bg-[#1A1A1A]"
            )}>
                <div className="relative z-10">
                    <h2 className="text-white/60 text-sm font-medium mb-1 uppercase tracking-wider">Major Deadline</h2>
                    {nearest ? (
                        <>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-display font-bold">{getDaysLeft(nearest.deadline)}</span>
                                <span className="text-xl text-white/50">days left</span>
                            </div>
                            <p className="mt-2 text-lg font-medium">{nearest.title}</p>
                            <p className="text-xs text-white/50 mt-1">
                                {new Date(nearest.deadline).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </>
                    ) : (
                        <div className="py-4">
                            <p className="text-xl font-medium">No pending deadlines</p>
                            <p className="text-sm text-white/50">You're free! Or you need to add one.</p>
                        </div>
                    )}
                </div>
                 {/* Decorative */}
                 <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-sm mb-2">
                    <span className={clsx("font-medium", isDark ? "text-white" : "text-[#1A1A1A]")}>Thesis Progress</span>
                    <span className={clsx(isDark ? "text-white/60" : "text-gray-500")}>{progress}%</span>
                </div>
                <div className={clsx("h-3 w-full rounded-full overflow-hidden", isDark ? "bg-white/10" : "bg-gray-100")}>
                    <div 
                        className={clsx("h-full transition-all duration-1000 ease-out", isDark ? "bg-white" : "bg-black")}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Timeline */}
            <div className={clsx("relative pl-4 border-l-2 space-y-8", isDark ? "border-white/10" : "border-gray-100")}>
                <AnimatePresence>
                {milestones.map((milestone) => (
                    <motion.div 
                        key={milestone.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative"
                    >
                        {/* Dot on timeline */}
                        <div className={clsx(
                            "absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 transition-colors",
                            milestone.completed 
                                ? "border-green-500 bg-green-500" 
                                : isDark ? "border-white/40 bg-[#0F172A]" : "border-gray-300 bg-white"
                        )} />

                        <div 
                            onClick={() => handleToggle(milestone.id, milestone.completed)}
                            className={clsx(
                                "p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md active:scale-[0.98]",
                                milestone.completed 
                                    ? isDark ? "bg-white/5 border-transparent opacity-60" : "bg-gray-50 border-transparent opacity-60"
                                    : isDark ? "bg-white/10 border-white/10 hover:bg-white/15" : "bg-white border-gray-100 shadow-sm"
                            )}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className={clsx(
                                        "font-medium text-lg",
                                        milestone.completed 
                                            ? "line-through text-gray-400" 
                                            : isDark ? "text-white" : "text-[#1A1A1A]"
                                    )}>
                                        {milestone.title}
                                    </h3>
                                    <p className={clsx("text-sm flex items-center gap-1 mt-1", isDark ? "text-white/40" : "text-gray-400")}>
                                        <Clock size={12} />
                                        {new Date(milestone.deadline).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className={clsx(milestone.completed ? "text-green-500" : isDark ? "text-white/30" : "text-gray-300")}>
                                    {milestone.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
                </AnimatePresence>

                {/* Add New Button */}
                <div className="relative">
                    <div className={clsx(
                        "absolute -left-[21px] top-3 h-3 w-3 rounded-full border-2 border-dashed",
                        isDark ? "border-white/20 bg-[#0F172A]" : "border-gray-300 bg-white"
                    )} />
                    
                    {!isAdding ? (
                         <button 
                            onClick={() => setIsAdding(true)}
                            className={clsx(
                                "flex items-center gap-2 transition-colors py-2",
                                isDark ? "text-white/40 hover:text-white" : "text-gray-400 hover:text-[#1A1A1A]"
                            )}
                         >
                             <Plus size={20} />
                             <span className="font-medium">Add Milestone</span>
                         </button>
                    ) : (
                        <div className={clsx(
                            "rounded-2xl border p-4 shadow-lg animate-in zoom-in-95",
                            isDark ? "bg-[#1E293B] border-white/10" : "bg-white border-gray-200"
                        )}>
                            <input 
                                autoFocus
                                type="text" 
                                placeholder="Milestone Title"
                                className={clsx(
                                    "w-full text-lg font-medium outline-none mb-3 bg-transparent",
                                    isDark ? "text-white placeholder:text-white/20" : "text-[#1A1A1A] placeholder:text-gray-300"
                                )}
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <input 
                                    type="date" 
                                    className={clsx(
                                        "rounded-lg px-3 py-2 text-sm outline-none",
                                        isDark ? "bg-white/10 text-white" : "bg-gray-50 text-[#1A1A1A]"
                                    )}
                                    value={newDate}
                                    onChange={e => setNewDate(e.target.value)}
                                />
                                <button 
                                    onClick={handleAdd}
                                    disabled={!newTitle || !newDate}
                                    className={clsx(
                                        "px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50",
                                        isDark ? "bg-white text-[#1A1A1A]" : "bg-[#1A1A1A] text-white"
                                    )}
                                >
                                    Add
                                </button>
                                <button 
                                    onClick={() => setIsAdding(false)}
                                    className="px-3 py-2 text-sm text-gray-400 hover:text-red-500"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
