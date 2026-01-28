"use client";

import { useState, useEffect } from "react";
import { GraduationCap, CheckCircle2, Circle, BookOpen, PenTool, Presentation, Pencil, Trash2, Plus, GripVertical, Check, X } from "lucide-react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

interface Milestone {
    id: string;
    title: string;
    category: "Writing" | "Research" | "Defense";
}

const DEFAULT_MILESTONES: Milestone[] = [
    { id: "topic", title: "Topic Approval", category: "Research" },
    { id: "proposal", title: "Thesis Proposal Defense", category: "Defense" },
    { id: "ch1", title: "Chapter 1: Introduction", category: "Writing" },
    { id: "ch2", title: "Chapter 2: Literature Review", category: "Writing" },
    { id: "ch3", title: "Chapter 3: Methodology", category: "Writing" },
    { id: "data", title: "Data Collection", category: "Research" },
    { id: "ch4", title: "Chapter 4: Results & Discussion", category: "Writing" },
    { id: "ch5", title: "Chapter 5: Conclusion", category: "Writing" },
    { id: "final_defense", title: "Final Oral Defense", category: "Defense" },
    { id: "binding", title: "Final Revision & Binding", category: "Writing" },
];

export const ThesisView = () => {
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [completed, setCompleted] = useState<string[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    
    // Load data
    useEffect(() => {
        const savedProgress = localStorage.getItem("planer_thesis_progress");
        const savedMilestones = localStorage.getItem("planer_thesis_milestones");

        if (savedProgress) setCompleted(JSON.parse(savedProgress));
        
        if (savedMilestones) {
            setMilestones(JSON.parse(savedMilestones));
        } else {
            setMilestones(DEFAULT_MILESTONES);
        }
    }, []);

    // Save Milestones whenever they change
    const saveMilestones = (newMilestones: Milestone[]) => {
        setMilestones(newMilestones);
        localStorage.setItem("planer_thesis_milestones", JSON.stringify(newMilestones));
    };

    const toggleMilestone = (id: string) => {
        if (isEditing) return; // Disable toggling in edit mode
        setCompleted(prev => {
            const newSet = prev.includes(id) 
                ? prev.filter(i => i !== id)
                : [...prev, id];
            
            localStorage.setItem("planer_thesis_progress", JSON.stringify(newSet));
            return newSet;
        });
    };

    const handleAddMilestone = () => {
        const newId = `custom-${Date.now()}`;
        const newMilestone: Milestone = {
            id: newId,
            title: "New Chapter",
            category: "Writing"
        };
        saveMilestones([...milestones, newMilestone]);
    };

    const handleDeleteMilestone = (id: string) => {
        saveMilestones(milestones.filter(m => m.id !== id));
        // Also remove from completed if needed
        if (completed.includes(id)) {
            const newCompleted = completed.filter(c => c !== id);
            setCompleted(newCompleted);
            localStorage.setItem("planer_thesis_progress", JSON.stringify(newCompleted));
        }
    };

    const handleUpdateMilestone = (id: string, updates: Partial<Milestone>) => {
        const updated = milestones.map(m => m.id === id ? { ...m, ...updates } : m);
        saveMilestones(updated);
    };

    const progress = milestones.length > 0 ? Math.round((completed.length / milestones.length) * 100) : 0;

    return (
        <div className="flex flex-col flex-grow pb-24 animate-in fade-in duration-500">
             {/* Header Card */}
             <div className="bg-[#1A1A1A] rounded-3xl p-6 text-white mb-8 shadow-xl relative overflow-hidden transition-all duration-300">
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-display font-bold mb-1">Thesis Tracker</h2>
                        <p className="text-gray-400 text-sm">
                            {isEditing ? "Customize your roadmap." : "Keep your eyes on the prize."}
                        </p>
                    </div>
                    <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className={clsx(
                            "h-10 px-4 rounded-full flex items-center gap-2 text-sm font-medium transition-colors z-20",
                            isEditing ? "bg-white text-black hover:bg-gray-200" : "bg-white/10 text-white hover:bg-white/20"
                        )}
                    >
                        {isEditing ? <Check size={16} /> : <Pencil size={16} />}
                        {isEditing ? "Done" : "Edit"}
                    </button>
                </div>
                
                {/* Progress Bar (Hide in edit mode to reduce noise) */}
                {!isEditing && (
                    <div className="mt-6 relative z-10 animate-in fade-in">
                        <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                            <span>Progress</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-white transition-all duration-1000 ease-out" 
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl -ml-4 -mb-4"></div>
            </div>

            {/* Milestones List */}
            <div className="space-y-4">
                <AnimatePresence initial={false}>
                    {milestones.map((item, index) => {
                        const isCompleted = completed.includes(item.id);
                        const Icon = item.category === "Writing" ? PenTool 
                            : item.category === "Research" ? BookOpen 
                            : Presentation;

                        return (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                            >
                                {isEditing ? (
                                    // EDIT MODE ROW
                                    <div className="w-full flex items-center gap-3 p-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50/50">
                                        <GripVertical className="text-gray-300 cursor-move" size={20} />
                                        
                                        <div className="flex-grow flex flex-col gap-2">
                                            <input 
                                                type="text" 
                                                value={item.title}
                                                onChange={(e) => handleUpdateMilestone(item.id, { title: e.target.value })}
                                                className="bg-transparent border-b border-gray-300 focus:border-black outline-none font-medium text-[#1A1A1A] py-1"
                                                placeholder="Milestone Title"
                                            />
                                            <select 
                                                value={item.category}
                                                onChange={(e) => handleUpdateMilestone(item.id, { category: e.target.value as any })}
                                                className="bg-transparent text-xs text-gray-500 outline-none w-fit cursor-pointer hover:text-black"
                                            >
                                                <option value="Writing">Writing</option>
                                                <option value="Research">Research</option>
                                                <option value="Defense">Defense</option>
                                            </select>
                                        </div>

                                        <button 
                                            onClick={() => handleDeleteMilestone(item.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    // VIEW MODE ROW
                                    <button
                                        onClick={() => toggleMilestone(item.id)}
                                        className={clsx(
                                            "w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all active:scale-[0.98]",
                                            isCompleted 
                                                ? "bg-[#F0FDF4] border-green-100 shadow-sm" 
                                                : "bg-white border-[#F1F1F1] hover:border-gray-300 hover:shadow-sm"
                                        )}
                                    >
                                        <div className={clsx(
                                            "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center transition-colors",
                                            isCompleted ? "bg-green-100 text-green-600" : "bg-gray-50 text-gray-400"
                                        )}>
                                            <Icon size={18} />
                                        </div>
                                        
                                        <div className="flex-grow">
                                            <h4 className={clsx(
                                                "font-medium transition-colors",
                                                isCompleted ? "text-green-800 line-through opacity-70" : "text-[#1A1A1A]"
                                            )}>
                                                {item.title}
                                            </h4>
                                            <p className="text-xs text-gray-500">{item.category}</p>
                                        </div>

                                        <div className={clsx(
                                            "flex-shrink-0 transition-colors",
                                            isCompleted ? "text-green-500" : "text-gray-300"
                                        )}>
                                            {isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                        </div>
                                    </button>
                                )}
                            </motion.div>
                        )
                    })}
                </AnimatePresence>

                {/* Add Button (Edit Mode Only) */}
                {isEditing && (
                    <motion.button
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={handleAddMilestone}
                        className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-medium flex items-center justify-center gap-2 hover:border-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <Plus size={20} />
                        Add Milestone
                    </motion.button>
                )}
            </div>
        </div>
    );
};
