import React from "react";

const StorySkeletonLoader = () => {
  return (
    <div className="flex space-x-4 p-4 overflow-x-auto">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="flex flex-col items-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
          <div className="w-12 h-3 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
};

export default StorySkeletonLoader;
