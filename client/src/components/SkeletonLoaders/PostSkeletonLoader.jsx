import React from "react";
import useThemeStyles from "../../utils/themeStyles";

const PostSkeletonLoader = ({ count = 3 }) => {
  const styles = useThemeStyles();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-12 px-4 sm:px-8">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`flex flex-col rounded shadow-md animate-pulse w-full max-w-sm mx-auto sm:mx-0 h-auto sm:h-[24rem] ${styles.bg2}`}
        >
          <div className={`h-48 rounded-t ${styles.bg2}`}></div>
          <div className={`flex-1 px-4 py-8 space-y-4 sm:p-8 dark:bg-gray-500`}>
            <div className={`w-full h-6 rounded ${styles.bg2}`}></div>
            <div className={`w-full h-6 rounded ${styles.bg2}`}></div>
            <div className={`w-3/4 h-6 rounded ${styles.bg2}`}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostSkeletonLoader;
