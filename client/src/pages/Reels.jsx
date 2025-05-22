import React from "react";
import { FaVideo } from "react-icons/fa";

const Reels = () => {
  return (
    <div className="mt-20 flex flex-col items-center justify-center text-center px-4">
      <FaVideo className="text-5xl text-red-500 mb-4 animate-pulse" />
      <h2 className="text-2xl font-semibold mb-2">Reels are Coming Soon!</h2>
      <p className="max-w-md text-sm">
        We’re working on something exciting. Reels will be available here soon —
        stay tuned for short, fun, and creative video content just like your
        favorite platforms!
      </p>
    </div>
  );
};

export default Reels;
