import React from "react";
import Feed from "../components/Feed";
import useThemeStyles from "../utils/themeStyles";

const Home = () => {
  const styles = useThemeStyles();
  return (
    <div className="max-w-6xl mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
        <div className="w-full md:w-2/3 lg:w-3/4">
          <Feed />
        </div>

        <div
          className={`hidden md:block md:w-1/3 lg:w-1/4 mt-6 md:mt-0 md:ml-4 p-4 rounded-lg shadow-sm ${styles.bg}`}
        >
          <h2 className="font-bold text-lg mb-4">Suggestions</h2>
          <div className="space-y-4">
            {/* Suggestion items would go here */}
            <div className={`flex items-center p-2 rounded-md ${styles.hover}`}>
              <div className="w-10 h-10 rounded-full bg-gray-300"></div>
              <div className="ml-3">
                <p className="font-medium text-sm">Gautam</p>
                <p className="text-xs text-gray-500">Suggested for you</p>
              </div>
              <button className="ml-auto text-blue-400 hover:text-blue-500 cursor-pointer text-xs font-semibold">
                Follow
              </button>
            </div>
            {/* More suggestion items */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
