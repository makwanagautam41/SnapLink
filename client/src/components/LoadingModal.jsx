import React from "react";
import { Icon } from "../utils/icons";
import { useTheme } from "../context/ThemeContext";

const LoadingModal = ({ text }) => {
  const { theme } = useTheme();

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-[9999] backdrop-blur-sm ${
        theme === "light" ? "bg-black/30" : "bg-white/10"
      }`}
    >
      <div
        className={`rounded-xl shadow-xl w-full max-w-xs overflow-hidden animate-fade-in ${
          theme === "light" ? "bg-white" : "bg-gray-800"
        }`}
      >
        <div className="flex flex-col items-center p-6">
          <Icon.Loader
            className={`animate-spin w-6 h-6 ${
              theme === "light" ? "text-black" : "text-white"
            }`}
          />
          <h3
            className={`text-lg font-medium mb-1 ${
              theme === "light" ? "text-gray-900" : "text-white"
            }`}
          >
            {text}
          </h3>
          <p
            className={`text-sm text-center ${
              theme === "light" ? "text-gray-500" : "text-gray-400"
            }`}
          >
            Please wait while we process your request...
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingModal;
