import React from "react";
import useThemeStyles from "../../utils/themeStyles";

const PostSkeletonLoader = ({ count = 3 }) => {
  const styles = useThemeStyles();
  return (
    <div className="grid grid-cols-3 gap-1 mb-12">
      {Array.from({ length: count }).map((_, index) => (
        <div
          className={`flex m-8 rounded shadow-md w-60 sm:w-80 animate-pulse h-96 ${styles.bg2}`}
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
