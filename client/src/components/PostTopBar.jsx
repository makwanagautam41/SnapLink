// import React from "react";
// import { Icon } from "../utils/icons.js";
// import { useNavigate } from "react-router-dom";
// import useThemeStyles from "../utils/themeStyles.js";

// const PostTopBar = ({ title }) => {
//   const styles = useThemeStyles();
//   const navigate = useNavigate();
//   return (
//     <div
//       className={`relative w-full flex items-center justify-center p-2 sm:hidden shadow-md ${styles.bg}`}
//     >
//       <button className="absolute left-2" onClick={() => navigate(-1)}>
//         <Icon.ArrowBack size={30} />
//       </button>
//       <p className="text-lg font-semibold">{title}</p>
//     </div>
//   );
// };

// export default PostTopBar;

import React, { useState, useEffect } from "react";
import { Icon } from "../utils/icons.js";
import { useNavigate } from "react-router-dom";
import useThemeStyles from "../utils/themeStyles.js";

const PostTopBar = ({ title }) => {
  const styles = useThemeStyles();
  const navigate = useNavigate();
  const [scrollingUp, setScrollingUp] = useState(false);
  const [prevScrollY, setPrevScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollingUp(currentScrollY > prevScrollY);
      setPrevScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollY]);

  return (
    <div
      className={`lg:hidden sticky top-0 left-0 w-full shadow-md z-20 flex justify-between items-center p-2 transition-transform duration-300 ${
        scrollingUp ? "-translate-y-full" : "translate-y-0"
      } ${styles.bg}`}
    >
      <button
        className="flex items-center cursor-pointer"
        onClick={() => navigate(-1)}
      >
        <Icon.ArrowBack size={24} />
      </button>
      <p className="text-lg font-semibold">{title}</p>
      <div className="w-6" />
    </div>
  );
};

export default PostTopBar;
