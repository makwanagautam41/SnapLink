import React from "react";
import { Icon } from "../utils/icons";

const Avtar = ({ profileImg, handleImageClick }) => {
  return (
    <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto sm:mx-0 mt-2">
      <img
        src={
          profileImg ||
          "https://res.cloudinary.com/djbqtwzyf/image/upload/v1744042607/default_img_gszetk.png"
        }
        alt="Profile"
        onClick={handleImageClick}
        className="w-full h-full object-cover rounded-full border-4 border-gray-300 cursor-pointer"
      />
    </div>
  );
};

export default Avtar;
