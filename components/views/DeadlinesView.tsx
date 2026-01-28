"use client";

import { Task } from "@/lib/db";
import { TaskCard } from "@/components/TaskCard";
import { Calendar, AlertCircle } from "lucide-react";
import clsx from "clsx";
import { useAtmosphere } from "@/hooks/useAtmosphere";

interface DeadlinesViewProps {
    tasks: Task[];
    onToggle: (taskId: string, currentStatus: boolean) => void;
    onDelete: (taskId: string) => void;
}

export const DeadlinesView = ({ tasks, onToggle, onDelete }: DeadlinesViewProps) => {
    const { isDark } = useAtmosphere();
    // 1. Filter out completed tasks (Deadlines View is for what's coming up)
    const activeTasks = tasks.filter(t => !t.completed);

    // ... helper logic ...
    const groupTasks = () => {
        // ... (keep existing logic exactly as is, just collapsed for brevity in this replace block if possible, but replace tool needs context. I will assume the logic is unchanged and just target the render part if possible. 
        // Actually, to be safe, I'll keep the logic but I need to be careful with line counts. 
        // The logic is long. I will target the Section component and the return statement primarily.
        
        // RE-INSERTING THE GROUP LOGIC TO BE SAFE
        const groups = {
            overdue: [] as Task[],
            today: [] as Task[],
            tomorrow: [] as Task[],
            thisWeek: [] as Task[],
            later: [] as Task[],
            noDeadline: [] as Task[]
        };

        const now = new Date();
        const activeTasks = tasks.filter(t => !t.completed);

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
                <div className={clsx("w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors", isDark ? "bg-white/10" : "bg-green-50")}>
                    <Calendar className={clsx("w-8 h-8", isDark ? "text-white/60" : "text-green-600")} />
                </div>
                <h2 className={clsx("text-lg font-bold", isDark ? "text-white" : "text-[#1A1A1A]")}>All Caught Up!</h2>
                <p className={clsx("max-w-xs mt-2", isDark ? "text-white/60" : "text-[#71717A]")}>
                    You have no upcoming deadlines. Enjoy your free time.
                </p>
            </div>
        )
    }

    return (
        <div className="flex flex-col flex-grow pb-32">
             <Section title="Overdue" tasks={grouped.overdue} color="text-red-500" icon={AlertCircle} />
             <Section title="Today" tasks={grouped.today} color={isDark ? "text-white" : "text-[#1A1A1A]"} />
             <Section title="Tomorrow" tasks={grouped.tomorrow} color="text-orange-600" />
             <Section title="This Week" tasks={grouped.thisWeek} color="text-blue-600" />
             <Section title="Later" tasks={grouped.later} color={isDark ? "text-white/40" : "text-gray-500"} />
             <Section title="No Deadline" tasks={grouped.noDeadline} color={isDark ? "text-white/30" : "text-gray-400"} />
        </div>
    );
};
