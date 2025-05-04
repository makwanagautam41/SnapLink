import React, { useState } from "react";
import { Icon } from "../utils/icons";

const CaptionModal = ({ imageSrc, onSave, styles, onBack }) => {
  const [caption, setCaption] = useState("");
  const imageUrl =
    typeof imageSrc === "string" ? imageSrc : URL.createObjectURL(imageSrc);

  return (
    <div className="fixed inset-0 z-50 flex backdrop-brightness-50 bg-opacity-40 sm:items-center sm:justify-center">
      <div
        className={`
        relative flex flex-col items-center py-3
        ${styles.bg}
        w-full h-full rounded-none
        sm:rounded-xl sm:shadow-2xl sm:w-[400px] sm:max-w-[90vw] sm:h-auto
      `}
      >
        <div className="flex items-center justify-between w-full px-4 mb-6 border-b border-gray-400 pb-4">
          <button className="text-gray-400" onClick={onBack}>
            <Icon.ArrowBack size={28} className="cursor-pointer" />
          </button>
          <h2 className="text-lg font-bold text-center">New Post</h2>
          <button
            onClick={() => onSave(caption)}
            className="bg-blue-500 text-white px-4 py-1 rounded-md"
          >
            Share
          </button>
        </div>
        <div className="w-full px-6 mb-6">
          <div className="w-full h-48 mb-4 rounded-lg overflow-hidden">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          </div>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            className={`w-full h-24 p-2 rounded-lg border ${styles.input}`}
          />
        </div>
      </div>
    </div>
  );
};

export default CaptionModal;
