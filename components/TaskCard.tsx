
"use client";

import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { CheckCircle2, Circle, Trash2, Check, X } from "lucide-react";
import { Task } from "@/lib/db";
import clsx from "clsx";
import { useHaptic } from "@/hooks/useHaptic";
import { useConfetti } from "@/hooks/useConfetti";

interface TaskCardProps {
  task: Task;
  onToggle: (taskId: string, currentStatus: boolean) => void;
  onDelete: (taskId: string) => void;
}

const energyStyles = {
  High: "bg-[#F2F6F2] text-[#4A5D4A]",
  Medium: "bg-[#FEF9EC] text-[#856404]",
  Low: "bg-[#F0F4F8] text-[#506680]",
};

export const TaskCard = ({ task, onToggle, onDelete }: TaskCardProps) => {
  const haptic = useHaptic();
  const confetti = useConfetti();
  
  // Motion values for dynamic background styling
  const x = useMotionValue(0);
  const opacityRight = useTransform(x, [50, 100], [0, 1]); // Complete (Green)
  const opacityLeft = useTransform(x, [-50, -100], [0, 1]); // Delete (Red)
  
  // Dynamic scale for the icons behind
  const scaleRight = useTransform(x, [50, 100], [0.8, 1.2]);
  const scaleLeft = useTransform(x, [-50, -100], [0.8, 1.2]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
        // Swiped Right -> Complete
        handleToggle();
    } else if (info.offset.x < -100) {
        // Swiped Left -> Delete
        haptic.trigger('medium');
        onDelete(task.id);
    }
  };

  const handleToggle = () => {
      // Logic: If checking (completing), trigger rewards
      if (!task.completed) { 
          haptic.trigger('success'); // Double vibration
          confetti.trigger();        // Visual explosion
      } else {
          haptic.trigger('light');   // Light feedback when unchecking
      }
      onToggle(task.id, task.completed);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      layout
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="mb-3 relative group"
    >
        {/* Background Actions Layer */}
        <div className="absolute inset-0 rounded-2xl flex items-center justify-between px-6 z-0 overflow-hidden">
            {/* Left Side: Complete (Green) */}
            <motion.div style={{ opacity: opacityRight, scale: scaleRight }} className="flex items-center gap-2 text-green-600 font-bold">
                 <CheckCircle2 size={24} />
                 <span>Complete</span>
            </motion.div>
            
            {/* Right Side: Delete (Red) */}
            <motion.div style={{ opacity: opacityLeft, scale: scaleLeft }} className="flex items-center gap-2 text-red-500 font-bold">
                 <span>Delete</span>
                 <Trash2 size={24} />
            </motion.div>
        </div>

        {/* Foreground Card Layer */}
        <motion.div
            style={{ x, touchAction: "none" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            dragSnapToOrigin // Snaps back if not committed
            className={clsx(
                "rounded-2xl border bg-white p-5 shadow-sm transition-shadow relative z-10",
                task.completed ? "border-[#F1F1F1] opacity-60" : "border-[#F1F1F1]",
                "active:shadow-md cursor-grab active:cursor-grabbing"
            )}
        >
            <div className="flex gap-3">
                <button 
                    onClick={(e) => {
                        e.stopPropagation(); // prevent drag interference if needed, but click works normally
                        handleToggle();
                    }}
                    // Touch target optimization
                    className="flex-shrink-0 pt-1 -ml-1 p-2 text-[#E5E5E5] hover:text-[#1A1A1A] transition-colors"
                >
                    {task.completed ? (
                        <CheckCircle2 className="h-6 w-6 text-[#10B981]" />
                    ) : (
                        <Circle className="h-6 w-6" />
                    )}
                </button>

                <div className="flex flex-col w-full pointer-events-none select-none"> {/* Disable text selection during drag */}
                    <div className="flex items-start justify-between">
                        <span className={clsx(
                            "text-[15px] font-medium transition-all pr-2",
                            task.completed ? "text-[#A1A1AA] line-through" : "text-[#1A1A1A]"
                        )}>
                            {task.title}
                        </span>
                        <span
                        className={`flex-shrink-0 inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${energyStyles[task.energy]}`}
                        >
                        {task.energy}
                        </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-[#A1A1AA]">
                            {task.deadline ? new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No deadline'}
                        </p>
                        
                        {/* Alternative Delete (Visible on Desktop Hover) */}
                         <div className="pointer-events-auto">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(task.id);
                                }}
                                className={clsx(
                                    "p-1.5 -mr-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100",
                                    task.completed && "opacity-100" 
                                )}
                                title="Delete Task"
                            >
                                <Trash2 size={16} />
                            </button>
                         </div>
                    </div>
                </div>
            </div>
        </motion.div>
    </motion.div>
  );
};
