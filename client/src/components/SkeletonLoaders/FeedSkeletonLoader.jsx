import React from "react";

const FeedSkeleton = () => {
  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 mb-6 md:mb-10 max-w-2xl mx-auto px-0 sm:px-6 lg:px-8">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-lg shadow-md animate-pulse bg-white dark:bg-[#1f1f1f]"
        >
          {/* Header Skeleton */}
          <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 dark:bg-gray-700"></div>
            <div className="ml-3 w-24 sm:w-32 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>

          {/* Image Skeleton */}
          <div className="relative w-full">
            <div className="aspect-square w-full bg-gray-300 dark:bg-gray-700"></div>
          </div>

          {/* Like/Comment Row Skeleton */}
          <div className="p-3 sm:p-4">
            <div className="flex space-x-4 mb-2">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="w-full h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="w-3/4 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeedSkeleton;
