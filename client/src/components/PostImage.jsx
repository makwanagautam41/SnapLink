import React, { useState } from "react";
import { Icon } from "../utils/icons";

const PostImage = ({ postImg = [] }) => {
  const [curr, setCurr] = useState(0);
  const total = postImg.length;

  const prev = () => setCurr((curr) => (curr === 0 ? total - 1 : curr - 1));
  const next = () => setCurr((curr) => (curr === total - 1 ? 0 : curr + 1));

  if (total === 0) return null;

  return (
    <div className="relative w-full sm:w-1/2 h-[100vh] sm:h-full overflow-hidden">
      <div
        className="flex transition-transform ease-out duration-500 snap-x snap-mandatory"
        style={{ transform: `translateX(-${curr * 100}%)` }}
      >
        {postImg.map((img, index) => (
          <img
            key={index}
            src={img.url || "..."}
            alt={`Post ${index + 1}`}
            className="object-cover w-full h-full flex-shrink-0 snap-center"
          />
        ))}
      </div>

      {total > 1 && (
        <>
          <div className="absolute inset-0 flex items-center justify-between p-4">
            <button
              onClick={prev}
              className="p-1 rounded-full shadow bg-white text-gray-800 hover:bg-gray-200 cursor-pointer"
            >
              <Icon.ArrowBack size={20} />
            </button>
            <button
              onClick={next}
              className="p-1 rounded-full shadow bg-white text-gray-800 hover:bg-gray-200 cursor-pointer"
            >
              <Icon.ArrowRight size={20} />
            </button>
          </div>

          <div className="absolute bottom-4 right-0 left-0">
            <div className="flex items-center justify-center gap-2">
              {postImg.map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    curr === i ? "bg-white" : "bg-white opacity-50"
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PostImage;
