import React from "react";

const FeedSkeleton = () => {
  return (
    <div className="space-y-4 mb-10">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-lg shadow-md animate-pulse bg-white dark:bg-[#1f1f1f]"
        >
          {/* Header Skeleton */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700"></div>
            <div className="ml-3 w-24 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>

          {/* Image Skeleton */}
          <div className="aspect-square w-full bg-gray-300 dark:bg-gray-700 rounded-b-lg"></div>

          {/* Like/Comment Row Skeleton */}
          <div className="p-4">
            <div className="flex space-x-4 mb-2">
              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>

            {/* Caption Skeleton */}
            <div className="w-full h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
            <div className="w-3/4 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeedSkeleton;
