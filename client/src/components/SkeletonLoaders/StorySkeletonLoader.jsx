import React, { useEffect, useState } from "react";

const StorySkeletonLoader = () => {
  const [count, setCount] = useState(4);

  useEffect(() => {
    const updateCount = () => {
      setCount(window.innerWidth < 640 ? 4 : 8);
    };

    updateCount();
    window.addEventListener("resize", updateCount);

    return () => window.removeEventListener("resize", updateCount);
  }, []);

  return (
    <div
      className="flex space-x-4 p-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col items-center space-y-2 flex-shrink-0"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
          <div className="w-12 sm:w-16 h-3 sm:h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
};

export default StorySkeletonLoader;
