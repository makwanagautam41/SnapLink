import React from "react";
import useThemeStyles from "../utils/themeStyles";

const Title = ({ text1, text2 }) => {
  const styles = useThemeStyles();
  return (
    <div className="inline-flex gap-2 items-center mb-3">
      <p className={`${styles.text}`}>
        {text1} <span className="font-medium">{text2}</span>
      </p>
      <p className={`w-8 sm:w-12 h-[1px] sm:h-[2px] bg-gray-500`}></p>
    </div>
  );
};

export default Title;
