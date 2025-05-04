import React from "react";

const Avtar = ({ profileImg, handleImageClick }) => {
  return (
    <img
      src={
        profileImg ||
        "https://res.cloudinary.com/djbqtwzyf/image/upload/v1744042607/default_img_gszetk.png"
      }
      alt="Profile"
      onClick={handleImageClick}
      className="w-24 h-24 sm:w-32 object-cover sm:h-32 rounded-full border-4 border-gray-300 mx-auto sm:mx-0 cursor-pointer mt-2"
    />
  );
};

export default Avtar;
