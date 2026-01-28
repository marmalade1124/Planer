"use client";

import { useState, useEffect } from "react";
import { Plus, Flag, CheckCircle2, Circle, Clock } from "lucide-react";
import { Milestone, getMilestones, addMilestone, toggleMilestone } from "@/lib/db";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { useConfetti } from "@/hooks/useConfetti";
import { useHaptic } from "@/hooks/useHaptic";

export const ThesisView = () => {
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
            <div className="mb-8 p-6 bg-[#1A1A1A] rounded-3xl text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wider">Major Deadline</h2>
                    {nearest ? (
                        <>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-display font-bold">{getDaysLeft(nearest.deadline)}</span>
                                <span className="text-xl text-gray-400">days left</span>
                            </div>
                            <p className="mt-2 text-lg font-medium">{nearest.title}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {new Date(nearest.deadline).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </>
                    ) : (
                        <div className="py-4">
                            <p className="text-xl font-medium">No pending deadlines</p>
                            <p className="text-sm text-gray-500">You're free! Or you need to add one.</p>
                        </div>
                    )}
                </div>
                 {/* Decorative */}
                 <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-[#1A1A1A]">Thesis Progress</span>
                    <span className="text-gray-500">{progress}%</span>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-black transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Timeline */}
            <div className="relative pl-4 border-l-2 border-gray-100 space-y-8">
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
                            "absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 bg-white transition-colors",
                            milestone.completed ? "border-green-500 bg-green-500" : "border-gray-300"
                        )} />

                        <div 
                            onClick={() => handleToggle(milestone.id, milestone.completed)}
                            className={clsx(
                                "p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md active:scale-[0.98]",
                                milestone.completed ? "bg-gray-50 border-transparent opacity-60" : "bg-white border-gray-100 shadow-sm"
                            )}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className={clsx("font-medium text-lg", milestone.completed && "line-through text-gray-400")}>
                                        {milestone.title}
                                    </h3>
                                    <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                                        <Clock size={12} />
                                        {new Date(milestone.deadline).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className={clsx("text-gray-300", milestone.completed && "text-green-500")}>
                                    {milestone.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
                </AnimatePresence>

                {/* Add New Button */}
                <div className="relative">
                    <div className="absolute -left-[21px] top-3 h-3 w-3 rounded-full border-2 border-dashed border-gray-300 bg-white" />
                    
                    {!isAdding ? (
                         <button 
                            onClick={() => setIsAdding(true)}
                            className="flex items-center gap-2 text-gray-400 hover:text-[#1A1A1A] transition-colors py-2"
                         >
                             <Plus size={20} />
                             <span className="font-medium">Add Milestone</span>
                         </button>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-lg animate-in zoom-in-95">
                            <input 
                                autoFocus
                                type="text" 
                                placeholder="Milestone Title"
                                className="w-full text-lg font-medium outline-none mb-3 placeholder:text-gray-300"
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <input 
                                    type="date" 
                                    className="bg-gray-50 rounded-lg px-3 py-2 text-sm outline-none"
                                    value={newDate}
                                    onChange={e => setNewDate(e.target.value)}
                                />
                                <button 
                                    onClick={handleAdd}
                                    disabled={!newTitle || !newDate}
                                    className="bg-[#1A1A1A] text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
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
