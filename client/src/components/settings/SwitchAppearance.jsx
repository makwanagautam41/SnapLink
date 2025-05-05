import React from "react";
import PostTopBar from "../PostTopBar";
import { Icon } from "../../utils/icons";
import { useTheme } from "..//../context/ThemeContext";

const SwitchAppearance = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <PostTopBar title={"Switch Appearance"} />
      <div className="flex flex-col px-4 gap-6 mt-6 max-w-4xl mx-auto">
        <div
          className="flex items-center justify-between rounded-2xl border border-gray-300 p-4 sm:p-6 shadow-sm cursor-pointer"
          onClick={toggleTheme}
        >
          <p className="text-base sm:text-lg font-medium">
            Switch To {theme === "light" ? "Dark" : "Light"}
          </p>
          <Icon.toggleOn
            size={35}
            className={theme === "light" ? "rotate-180" : ""}
          />
        </div>
      </div>
    </div>
  );
};

export default SwitchAppearance;
