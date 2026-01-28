import { supabase } from "./supabase";

export type EnergyLevel = "High" | "Medium" | "Low";

export interface Task {
  id: string;
  userId: string;
  title: string;
  deadline: Date;
  energy: EnergyLevel;
  createdAt: Date;
  completed: boolean;
}

export const addTask = async (userId: string, title: string, deadline: Date, energy: EnergyLevel) => {
  const { data, error } = await supabase.from('tasks').insert({
    user_id: userId,
    title,
    deadline: deadline.toISOString(),
    energy,
    completed: false,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) {
    console.error("Error adding task:", error);
    throw error;
  }
  
  return {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    deadline: new Date(data.deadline),
    energy: data.energy,
    completed: data.completed,
    createdAt: new Date(data.created_at)
  } as Task;
};

export const subscribeToTasks = (userId: string, callback: (tasks: Task[]) => void) => {
  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('deadline', { ascending: true });
    
    if (error) {
        console.error("Error fetching tasks:", error);
        return;
    }

    const tasks = (data || []).map((d) => ({
        id: d.id,
        userId: d.user_id,
        title: d.title,
        deadline: new Date(d.deadline),
        energy: d.energy as EnergyLevel,
        completed: d.completed,
        createdAt: new Date(d.created_at)
    })) as Task[];
    
    callback(tasks);
  };

  // Initial fetch
  fetchTasks();

  // Realtime subscription
  const channel = supabase
    .channel('tasks-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` },
      () => {
        fetchTasks();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const toggleTaskCompletion = async (taskId: string, currentStatus: boolean) => {
  const { error } = await supabase
    .from('tasks')
    .update({ completed: !currentStatus })
    .eq('id', taskId);
    
  if (error) console.error("Error toggling task:", error);
};

export const deleteTask = async (taskId: string) => {
    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

    if (error) console.error("Error deleting task:", error);
}

export const getUserStats = async (userId: string) => {
    // 1. Get completion counts
    const { data: allTasks, error } = await supabase
        .from('tasks')
        .select('created_at, completed, deadline')
        .eq('user_id', userId);

    if (error) {
        console.error("Error fetching stats:", error);
        return { tasksCompleted: 0, focusScore: 0, streakDays: 0 };
    }

    const total = allTasks.length;
    const completed = allTasks.filter(t => t.completed).length;
    const tasksCompleted = completed;

    // 2. Calculate Focus Score (Simple: Completed / Total)
    // A better metric might be: (Completed On Time) / (Total Due)
    // For now: Completion Rate * 100
    const focusScore = total > 0 ? Math.round((completed / total) * 100) : 100;

    // 3. Calculate Streak (Consecutive days with at least one completion)
    // This is expensive to calc perfectly from just task list, so we'll estimate:
    // "Days active in the last 7 days" or similar.
    // For MVP: Let's just return a mock "Streak" or implement a simple check if we have "completed_at" dates.
    // Since we don't track "completed_at" yet in the interface (just boolean), 
    // we can't accurately calculate streak days. 
    // -> NOTE: We should update schema to track completed_at.
    // Schema update is out of scope for this quick fix, so we will assume 
    // if you have tasks completed today, streak += 1? 
    // Let's stick to a simple placeholder or "Active Tasks" count for now 
    // OR we can infer "created_at" of completed tasks as a proxy (weak).
    
    // Fallback: Just randomizing streak for MVP feel or keeping static 3 until schema update?
    // Better: Return "0" if strict, or mock "3" if we want to be nice.
    // Let's return 0 to be honest.
    const streakDays = 0; 

    return { tasksCompleted, focusScore, streakDays };
};

export const uploadAvatar = async (userId: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/profile.${fileExt}`;
    const filePath = fileName; // Simple path

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

    if (uploadError) {
        throw uploadError;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
};

// --- Thesis Manager (Milestones) ---

export interface Milestone {
    id: string;
    userId: string;
    title: string;
    deadline: Date;
    completed: boolean;
    progress: number;
}

export const addMilestone = async (userId: string, title: string, deadline: Date) => {
    const { data, error } = await supabase.from('milestones').insert({
        user_id: userId,
        title,
        deadline: deadline.toISOString(),
        completed: false,
        progress: 0
    }).select().single();

    if (error) throw error;
    
    return {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        deadline: new Date(data.deadline),
        completed: data.completed,
        progress: data.progress
    } as Milestone;
};

export const getMilestones = async (userId: string) => {
    const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('user_id', userId)
        .order('deadline', { ascending: true });

    if (error) {
        console.error("Error fetching milestones:", error);
        return [];
    }

    return (data || []).map(d => ({
        id: d.id,
        userId: d.user_id,
        title: d.title,
        deadline: new Date(d.deadline),
        completed: d.completed,
        progress: d.progress
    })) as Milestone[];
};

export const toggleMilestone = async (id: string, current: boolean) => {
    const { error } = await supabase.from('milestones').update({ completed: !current }).eq('id', id);
    if (error) console.error(error);
};
