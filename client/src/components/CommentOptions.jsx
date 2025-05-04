import React from "react";
import { useTheme } from "../context/ThemeContext";

const CommentOptions = ({
  setShowCommentOptionsModal,
  handleCommentDelet,
  postId,
  commentId,
}) => {
  const { theme } = useTheme();
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[5099999] backdrop-brightness-50 bg-opacity-50">
      <div
        className={`rounded-lg w-80 ${
          theme === "light" ? "bg-white" : "bg-gray-800"
        }`}
      >
        <button className="w-full py-3 px-4 cursor-pointer text-center text-red-500 font-semibold border-b border-gray-200">
          Report
        </button>

        <button
          onClick={() => handleCommentDelet(postId, commentId)}
          className="w-full py-3 px-4 cursor-pointer text-center text-red-500 font-semibold border-b border-gray-200"
        >
          Delete
        </button>
        <button
          className="w-full py-3 px-4 cursor-pointer text-center"
          onClick={() => setShowCommentOptionsModal(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CommentOptions;
