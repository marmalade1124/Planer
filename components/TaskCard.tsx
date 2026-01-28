
"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Trash2 } from "lucide-react";
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      layout
      className={clsx(
        "mb-3 flex gap-3 rounded-2xl border bg-white p-5 shadow-sm transition-all relative group",
        task.completed ? "border-[#F1F1F1] opacity-60" : "border-[#F1F1F1]"
      )}
    >
      <button 
        onClick={handleToggle}
        className="flex-shrink-0 pt-1 text-[#E5E5E5] hover:text-[#1A1A1A] transition-colors"
      >
        {task.completed ? (
            <CheckCircle2 className="h-6 w-6 text-[#10B981]" />
        ) : (
            <Circle className="h-6 w-6" />
        )}
      </button>

      <div className="flex flex-col w-full">
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
            
            {/* Delete Button - Visible on hover or if completed (mobile friendliness: always visible if completed) */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                }}
                className={clsx(
                    "p-1.5 -mr-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100",
                    task.completed && "opacity-100" // Always show if completed
                )}
                title="Delete Task"
            >
                <Trash2 size={16} />
            </button>
        </div>
      </div>
    </motion.div>
  );
};
