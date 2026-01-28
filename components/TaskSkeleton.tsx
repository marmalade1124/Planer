import { motion } from "framer-motion";

export const TaskSkeleton = () => {
  return (
    <div className="w-full h-24 rounded-2xl bg-gray-50 border border-gray-100 p-4 mb-3 animate-pulse relative overflow-hidden">
      <div className="flex items-center gap-3 h-full">
        {/* Circle Skeleton */}
        <div className="h-6 w-6 rounded-full bg-gray-200 flex-shrink-0" />
        
        <div className="flex-grow space-y-2">
           {/* Title Skeleton */}
           <div className="h-4 w-3/4 bg-gray-200 rounded-full" />
           {/* Date Skeleton */}
           <div className="h-3 w-1/3 bg-gray-100 rounded-full" />
        </div>

        {/* Energy Pill Skeleton */}
        <div className="h-6 w-16 bg-gray-100 rounded-full flex-shrink-0" />
      </div>
      
      {/* Shimmer Effect Overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
    </div>
  );
};
