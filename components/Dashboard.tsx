"use client";

import { useState, useEffect } from "react";
import { BottomNav, Tab } from "@/components/BottomNav";
import { TaskCard } from "@/components/TaskCard";
import { Plus, Settings } from "lucide-react";
import clsx from "clsx";
import { AddTaskDrawer } from "@/components/AddTaskDrawer";
import { SettingsDrawer } from "@/components/SettingsDrawer";
import { subscribeToTasks, addTask, toggleTaskCompletion, deleteTask, Task, EnergyLevel } from "@/lib/db";
import { TaskSkeleton } from "@/components/TaskSkeleton";
import { OnboardingOverlay } from "@/components/OnboardingOverlay";
import { useToast } from "@/components/ToastProvider";

// Views
import { DeadlinesView } from "./views/DeadlinesView";
import { ThesisView } from "./views/ThesisView";
import { ProfileView } from "./views/ProfileView";

interface DashboardProps {
  userName: string;
}

export const Dashboard = ({ userName }: DashboardProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true); // New loading state
  const { showToast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<Tab>("today");
  const [filterEnergy, setFilterEnergy] = useState<EnergyLevel | null>(null);

  useEffect(() => {
    // Generate a simple persistent ID for this user if standard Auth isn't fully implemented yet
    const userId = localStorage.getItem("planer_userId") || crypto.randomUUID();
    localStorage.setItem("planer_userId", userId);

    const unsubscribe = subscribeToTasks(userId, (newTasks) => {
      setTasks(newTasks);
      setIsLoading(false); // Disable loading once data arrives
    });

    return () => unsubscribe();
  }, []);

  const handleAddTask = async (title: string, deadline: string, energy: EnergyLevel) => {
    // ... existing ...
  };
  
  // ... existing handlers ...

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
      await toggleTaskCompletion(taskId, currentStatus);
  };

  const handleDeleteTask = async (taskId: string) => {
      const taskToDelete = tasks.find(t => t.id === taskId);
      if (!taskToDelete) return;

      // Optimistic delete
      setTasks(prev => prev.filter(t => t.id !== taskId));
      
      // Clear focused task if needed
      if (focusedTask && focusedTask.id === taskId) {
          setFocusedTask(null);
          setIsRealityMode(false);
      }

      // Show Undo Toast
      showToast("Task deleted", async () => {
          // UNDO ACTION: Add it back immediately
          setTasks(prev => [...prev, taskToDelete].sort((a,b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()));
          // We don't need to call API because we haven't deleted it yet?
          // WAIT. If we want true undo, we should delay the API call OR revert the API call.
          // Easiest "Safe" Undo: Don't call API delete until toast expires? No, that's complex state.
          // Better Undo: Call API delete, if Undo -> Call API add. 
          // Re-adding a deleted task might lose ID (new ID).
          // BEST UX: Mark as deleted in state, wait X seconds ?? 
          // Let's go with: Call Delete API. If Undo -> Call Add API (re-create). It might have a new ID but that's fine for MVP.
          await addTask(taskToDelete.userId, taskToDelete.title, new Date(taskToDelete.deadline), taskToDelete.energy);
      });

      // Execute API delete
      await deleteTask(taskId);
  };

  /* Reality Mode Logic */
  const [isRealityMode, setIsRealityMode] = useState(false);
  const [realityLoading, setRealityLoading] = useState(false);
  const [focusedTask, setFocusedTask] = useState<Task | null>(null);

  const handleRealityMode = () => {
    // ... existing ...
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
                        <h3 className="font-display text-[11px] font-bold uppercase tracking-[0.15em] text-[#71717A]">
                            {isRealityMode ? "Top Priority" : "Today's Focus"}
                        </h3>
                        {!isRealityMode && tasks.length > 0 && (
                            <button 
                            onClick={() => setIsAddModalOpen(true)}
                            className="p-1 rounded-full hover:bg-gray-100 text-[#1A1A1A]"
                            >
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
                             <p className="text-center text-sm text-[#71717A] max-w-xs mx-auto">
                                 This is your single most important task right now based on deadlines and energy.
                             </p>
                             <button 
                                onClick={exitRealityMode}
                                className="w-full py-3 rounded-xl border border-[#F1F1F1] text-sm font-medium text-[#1A1A1A] hover:bg-[#FAFAFA] transition-colors"
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
                            <div className="flex flex-col items-center justify-center flex-grow py-12 text-center border-2 border-dashed border-[#F1F1F1] rounded-2xl bg-[#FAFAFA]">
                                <p className="text-sm text-[#71717A] mb-4">No tasks planned yet.</p>
                                <button 
                                onClick={() => setIsAddModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1A1A1A] rounded-full hover:bg-black transition-colors"
                                >
                                <Plus size={16} />
                                HtmlTaskCardAddFirst Task
                                </button>
                            </div>
                            )}

                            {tasks.length > 0 && (
                            <div className="mt-4 mb-8 text-center">
                                <button 
                                    onClick={handleRealityMode}
                                    className="text-xs font-medium text-[#71717A] transition-colors hover:text-[#1A1A1A]"
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
    <div className="flex flex-col h-full px-6 pb-32 bg-white min-h-dvh">
      {/* Header */}
      <header className="pt-16 pb-8 sticky top-0 bg-white/90 backdrop-blur-md z-10 flex items-start justify-between">
        <h1 className="font-display text-3xl font-semibold leading-[1.2] tracking-tight text-[#1A1A1A]">
          {currentTab === 'today' 
            ? `${(new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening")}, ${userName}. How are we feeling today?` 
            : currentTab === 'deadlines' ? 'Deadlines' 
            : currentTab === 'thesis' ? 'Thesis Manager' 
            : 'Your Profile'}
        </h1>
        
        {/* Settings Button - Only on Today tab for now to keep it clean, or always? Always is better. */}
        {/* Settings Button Moved to Profile View */}
      </header>

      {renderContent()}

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
