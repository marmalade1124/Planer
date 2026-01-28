"use client";

import { Task } from "@/lib/db";
import { TaskCard } from "@/components/TaskCard";
import { Calendar, AlertCircle } from "lucide-react";
import clsx from "clsx";

interface DeadlinesViewProps {
    tasks: Task[];
    onToggle: (taskId: string, currentStatus: boolean) => void;
    onDelete: (taskId: string) => void;
}

export const DeadlinesView = ({ tasks, onToggle, onDelete }: DeadlinesViewProps) => { // Fixed: destructured props correctly
    // 1. Filter out completed tasks (Deadlines View is for what's coming up)
    const activeTasks = tasks.filter(t => !t.completed);

    // 2. Helper to group tasks
    const groupTasks = () => {
        const groups = {
            overdue: [] as Task[],
            today: [] as Task[],
            tomorrow: [] as Task[],
            thisWeek: [] as Task[],
            later: [] as Task[],
            noDeadline: [] as Task[]
        };

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const tomorrowStart = todayStart + 86400000;
        const nextWeekStart = todayStart + (86400000 * 7);

        activeTasks.forEach(task => {
             if (!task.deadline) {
                 groups.noDeadline.push(task);
                 return;
             }

             const date = new Date(task.deadline);
             const time = date.getTime();

             if (time < now.getTime()) {
                 groups.overdue.push(task);
             } else if (time < tomorrowStart + 86400000 && time >= todayStart) { // Fix: Today logic handles hours
                 if (date.getDate() === now.getDate()) {
                    groups.today.push(task);
                 } else {
                    // technically "tomorrow" if hours pushed it over, but let's be strict
                    groups.tomorrow.push(task); 
                 }
             } else if (date.getDate() === new Date(tomorrowStart).getDate()) { // Strict tomorrow check
                 groups.tomorrow.push(task);
             } else if (time < nextWeekStart) {
                 groups.thisWeek.push(task);
             } else {
                 groups.later.push(task);
             }
        });
        
        // Fix: simple "Today" check logic above was slightly flawed due to time comparisons. 
        // Let's re-do cleaner buckets.
        
        // Reset
        groups.overdue = [];
        groups.today = [];
        groups.tomorrow = [];
        groups.thisWeek = [];
        groups.later = [];

        activeTasks.forEach(task => {
            if (!task.deadline) {
                groups.noDeadline.push(task);
                return;
            }

            const d = new Date(task.deadline);
            d.setHours(0,0,0,0);
            const t = d.getTime();

            const n = new Date();
            n.setHours(0,0,0,0);
            const today = n.getTime();

            if (t < today) {
                groups.overdue.push(task);
            } else if (t === today) {
                groups.today.push(task);
            } else if (t === today + 86400000) {
                groups.tomorrow.push(task);
            } else if (t <= today + (86400000 * 7)) {
                groups.thisWeek.push(task);
            } else {
                groups.later.push(task);
            }
        });

        return groups;
    };

    const grouped = groupTasks();
    const hasAny = activeTasks.length > 0;

    const Section = ({ title, tasks, color = "text-zinc-500", icon: Icon }: { title: string, tasks: Task[], color?: string, icon?: any }) => {
        if (tasks.length === 0) return null;
        return (
            <div className="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h3 className={clsx("flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider", color)}>
                    {Icon && <Icon size={14} />}
                    {title} <span className="opacity-50 ml-1">({tasks.length})</span>
                </h3>
                <div className="space-y-2">
                    {tasks.map(task => (
                        <TaskCard key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
                    ))}
                </div>
            </div>
        )
    }

    if (!hasAny) {
        return (
             <div className="flex flex-col items-center justify-center flex-grow py-20 text-center animate-in fade-in">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-lg font-bold text-[#1A1A1A]">All Caught Up!</h2>
                <p className="text-[#71717A] max-w-xs mt-2">
                    You have no upcoming deadlines. Enjoy your free time.
                </p>
            </div>
        )
    }

    return (
        <div className="flex flex-col flex-grow pb-32">
             <Section title="Overdue" tasks={grouped.overdue} color="text-red-500" icon={AlertCircle} />
             <Section title="Today" tasks={grouped.today} color="text-[#1A1A1A]" />
             <Section title="Tomorrow" tasks={grouped.tomorrow} color="text-orange-600" />
             <Section title="This Week" tasks={grouped.thisWeek} color="text-blue-600" />
             <Section title="Later" tasks={grouped.later} color="text-gray-500" />
             <Section title="No Deadline" tasks={grouped.noDeadline} color="text-gray-400" />
        </div>
    );
};
