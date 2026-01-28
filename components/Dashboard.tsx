"use client";

import { useState, useEffect } from "react";
import { BottomNav, Tab } from "@/components/BottomNav";
import { TaskCard } from "@/components/TaskCard";
import { Plus, Settings } from "lucide-react";
import clsx from "clsx";
import dynamic from "next/dynamic";
// Dynamic Drawers (Load on interaction)
const AddTaskDrawer = dynamic(() => import("@/components/AddTaskDrawer").then(mod => mod.AddTaskDrawer), { ssr: false });
const SettingsDrawer = dynamic(() => import("@/components/SettingsDrawer").then(mod => mod.SettingsDrawer), { ssr: false });
import { subscribeToTasks, addTask, toggleTaskCompletion, deleteTask, Task, EnergyLevel } from "@/lib/db";
import { OnboardingOverlay } from "@/components/OnboardingOverlay";
import { TaskSkeleton } from "@/components/TaskSkeleton";
import { useToast } from "@/components/ToastProvider";
import { motion, useScroll, useTransform } from "framer-motion";
import { useAtmosphere } from "@/hooks/useAtmosphere";

// Dynamic Views (Code Splitting)
const DeadlinesView = dynamic(() => import("./views/DeadlinesView").then(mod => mod.DeadlinesView), {
  loading: () => <div className="h-64 animate-pulse bg-gray-100 rounded-3xl" />,
});
const ThesisView = dynamic(() => import("./views/ThesisView").then(mod => mod.ThesisView), {
  loading: () => <div className="h-64 animate-pulse bg-gray-100 rounded-3xl" />,
});
const ProfileView = dynamic(() => import("./views/ProfileView").then(mod => mod.ProfileView), {
  loading: () => <div className="h-64 animate-pulse bg-gray-100 rounded-3xl" />,
});

interface DashboardProps {
  userName: string;
}

// Container variants for staggered entry
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const Dashboard = ({ userName }: DashboardProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<Tab>("today");
  const [filterEnergy, setFilterEnergy] = useState<EnergyLevel | null>(null);

  // Reality Mode State
  const [isRealityMode, setIsRealityMode] = useState(false);
  const [realityLoading, setRealityLoading] = useState(false);
  const [focusedTask, setFocusedTask] = useState<Task | null>(null);

  // Atmosphere State
  const { isDark } = useAtmosphere();

  // Scroll Hooks for Parallax
  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 200], [0, 50]); // Moves slower than scroll
  const headerOpacity = useTransform(scrollY, [0, 200], [1, 0.8]);

  useEffect(() => {
    const userId = localStorage.getItem("planer_userId") || crypto.randomUUID();
    localStorage.setItem("planer_userId", userId);

    const unsubscribe = subscribeToTasks(userId, (newTasks) => {
      setTasks(newTasks);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddTask = async (title: string, deadline: string, energy: EnergyLevel) => {
      const userId = localStorage.getItem("planer_userId");
      if (!userId) return;

      try {
          await addTask(userId, title, new Date(deadline), energy);
          setIsAddModalOpen(false);
      } catch (error) {
          console.error(error);
          alert("Failed to add task");
      }
  };

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
      await toggleTaskCompletion(taskId, currentStatus);
  };

  const handleDeleteTask = async (taskId: string) => {
      const taskToDelete = tasks.find(t => t.id === taskId);
      if (!taskToDelete) return;

      // Optimistic delete
      setTasks(prev => prev.filter(t => t.id !== taskId));
      
      if (focusedTask && focusedTask.id === taskId) {
          setFocusedTask(null);
          setIsRealityMode(false);
      }

      showToast("Task deleted", async () => {
          // UNDO
          await addTask(taskToDelete.userId, taskToDelete.title, new Date(taskToDelete.deadline), taskToDelete.energy);
      });

      await deleteTask(taskId);
  };

  const handleRealityMode = () => {
    if (tasks.filter(t => !t.completed).length === 0) return;

    setRealityLoading(true);
    
    setTimeout(() => {
        const pending = tasks.filter(t => !t.completed);
        const sorted = [...pending].sort((a, b) => {
             const scoreA = (a.energy === 'High' ? 3 : a.energy === 'Medium' ? 2 : 1) + (new Date(a.deadline).getTime() < Date.now() + 86400000 ? 5 : 0);
             const scoreB = (b.energy === 'High' ? 3 : b.energy === 'Medium' ? 2 : 1) + (new Date(b.deadline).getTime() < Date.now() + 86400000 ? 5 : 0);
             return scoreB - scoreA;
        });

        setFocusedTask(sorted[0]);
        setRealityLoading(false);
        setIsRealityMode(true);
    }, 1500);
  };

  const exitRealityMode = () => {
      setIsRealityMode(false);
      setFocusedTask(null);
  }

  const renderContent = () => {
      switch (currentTab) {
          case "deadlines":
              return (
                <DeadlinesView 
                    tasks={tasks} 
                    onToggle={handleToggleTask} 
                    onDelete={handleDeleteTask} 
                />
              );
          case "thesis":
              return <ThesisView />;
          case "profile":
              return <ProfileView userName={userName} onOpenSettings={() => setIsSettingsOpen(true)} />;
          case "today":
          default:
              return (
                <>
                 {/* Reality Mode Overlay */}
                 {realityLoading && (
                     <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm animate-in fade-in">
                         <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#F1F1F1] border-t-[#1A1A1A]"></div>
                         <p className="mt-4 text-sm font-medium text-[#1A1A1A] animate-pulse">Analyzing priorities...</p>
                     </div>
                 )}

                 {/* Energy Pills (Filter) */}
                 {!isRealityMode && (
                    <section className="mb-10 animate-in fade-in duration-500 slide-in-from-bottom-2">
                        <div className="flex gap-3">
                        {(["Low", "Medium", "High"] as EnergyLevel[]).map((level) => {
                            const isSelected = filterEnergy === level;
                            return (
                                <button 
                                    key={level}
                                    onClick={() => setFilterEnergy(isSelected ? null : level)}
                                    className={clsx(
                                        "flex-1 rounded-full border py-3 text-center text-sm font-medium transition-all duration-200 active:scale-95 touch-manipulation",
                                        isSelected 
                                            ? level === "Low" ? "border-blue-200 bg-blue-50 text-blue-700 ring-2 ring-blue-200 ring-offset-1 shadow-sm"
                                            : level === "Medium" ? "border-yellow-200 bg-yellow-50 text-yellow-700 ring-2 ring-yellow-200 ring-offset-1 shadow-sm"
                                            : "border-green-200 bg-green-50 text-green-700 ring-2 ring-green-200 ring-offset-1 shadow-sm"
                                            : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300"
                                    )}
                                >
                                    {level}
                                </button>
                            )
                        })}
                        </div>
                    </section>
                 )}

                {/* Task List */}
                <section className="flex-grow flex flex-col animate-in fade-in duration-700 slide-in-from-bottom-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className={clsx(
                            "font-display text-[11px] font-bold uppercase tracking-[0.15em]",
                            isDark ? "text-white/60" : "text-[#71717A]"
                        )}>
                            {isRealityMode ? "Top Priority" : "Today's Focus"}
                        </h3>
                        {!isRealityMode && tasks.length > 0 && (
                            <button 
                            onClick={() => setIsAddModalOpen(true)}
                            className={clsx(
                                "p-1 rounded-full hover:bg-white/10 text-[#1A1A1A]",
                                isDark ? "text-white hover:bg-white/20" : "text-[#1A1A1A] hover:bg-gray-100"
                            )}>
                            <Plus size={18} />
                            </button>
                        )}
                    </div>

                    {isLoading ? (
                         <div className="space-y-4">
                             {[...Array(3)].map((_, i) => <TaskSkeleton key={i} />)}
                         </div>
                    ) : isRealityMode && focusedTask ? (
                         <div className="space-y-4">
                             <div className="relative">
                                 <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 opacity-20 blur"></div>
                                 <div className="relative">
                                    <TaskCard task={focusedTask} onToggle={handleToggleTask} onDelete={handleDeleteTask} />
                                 </div>
                             </div>
                             <p className={clsx("text-center text-sm max-w-xs mx-auto", isDark ? "text-white/70" : "text-[#71717A]")}>
                                 This is your single most important task right now based on deadlines and energy.
                             </p>
                             <button 
                                onClick={exitRealityMode}
                                className={clsx(
                                    "w-full py-3 rounded-xl border text-sm font-medium transition-colors",
                                    isDark 
                                      ? "border-white/20 text-white hover:bg-white/10" 
                                      : "border-[#F1F1F1] text-[#1A1A1A] hover:bg-[#FAFAFA]"
                                )}
                             >
                                 Return to Full List
                             </button>
                         </div>
                    ) : (
                        <>
                            {tasks.length > 0 ? (
                            <div className="space-y-3 pb-8">
                                {tasks
                                    .filter(t => !filterEnergy || t.energy === filterEnergy)
                                    .map((task) => (
                                <TaskCard 
                                    key={task.id} 
                                    task={task} 
                                    onToggle={handleToggleTask}
                                    onDelete={handleDeleteTask}
                                />
                                ))}
                            </div>
                            ) : (
                            <div className={clsx(
                                "flex flex-col items-center justify-center flex-grow py-12 text-center border-2 border-dashed rounded-2xl transition-colors",
                                isDark 
                                    ? "border-white/10 bg-white/5" 
                                    : "border-[#F1F1F1] bg-[#FAFAFA]"
                            )}>
                                <p className={clsx("text-sm mb-4", isDark ? "text-white/60" : "text-[#71717A]")}>No tasks planned yet.</p>
                                <button 
                                onClick={() => setIsAddModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1A1A1A] rounded-full hover:bg-black transition-colors ring-1 ring-white/20"
                                >
                                <Plus size={16} />
                                Add First Task
                                </button>
                            </div>
                            )}

                            {tasks.length > 0 && (
                            <div className="mt-4 mb-8 text-center">
                                <button 
                                    onClick={handleRealityMode}
                                    className={clsx(
                                        "text-xs font-medium transition-colors",
                                        isDark ? "text-white/50 hover:text-white" : "text-[#71717A] hover:text-[#1A1A1A]"
                                    )}
                                >
                                Need to adjust today?{" "}
                                <span className="underline decoration-gray-300 underline-offset-4">
                                    Trigger Reality Mode
                                </span>
                                </button>
                            </div>
                            )}
                        </>
                    )}
                </section>
                </>
              );
      }
  }

  return (
    <div className="flex flex-col h-full px-6 pb-32 min-h-dvh">
      {/* Parallax Header */}
      <motion.header 
        style={{ y: headerY, opacity: headerOpacity }}
        className="pt-16 pb-8 sticky top-0 bg-transparent z-10 flex items-start justify-between"
      >
        <h1 className={clsx(
            "font-display text-3xl font-semibold leading-[1.2] tracking-tight transition-colors duration-500",
            isDark ? "text-white" : "text-[#1A1A1A]"
        )}>
          {currentTab === 'today' 
            ? `${(new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening")}, ${userName}. How are we feeling today?` 
            : currentTab === 'deadlines' ? 'Deadlines' 
            : currentTab === 'thesis' ? 'Thesis Manager' 
            : 'Your Profile'}
        </h1>
      </motion.header>
      
      {/* ... rest of the wrapper ... */}
      {currentTab === 'today' && !isRealityMode ? (
        <motion.div
           variants={containerVariants}
           initial="hidden"
           animate="show"
           className="relative z-0"
        >
             {renderContent()}
        </motion.div>
      ) : (
         renderContent()
      )}

      {/* Bottom Navigation */}
      <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Add Task Drawer */}
      <AddTaskDrawer 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddTask} 
      />

       {/* Settings Drawer */}
       <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userName={userName}
      />

      {/* Onboarding Overlay */}
      <OnboardingOverlay />
    </div>
  );
};
