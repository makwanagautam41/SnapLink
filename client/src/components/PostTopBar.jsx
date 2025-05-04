import React from "react";
import { Icon } from "../utils/icons.js";
import { useNavigate } from "react-router-dom";

const PostTopBar = ({ title, styles }) => {
  const navigate = useNavigate();
  return (
    <div
      className={`relative w-full flex items-center justify-center p-2 sm:hidden shadow-md`}
    >
      <button className="absolute left-0">
        <Icon.ArrowBack size={30} onClick={() => navigate(-1)} />
      </button>
      <p className="text-lg font-semibold">{title}</p>
    </div>
  );
};

export default PostTopBar;
