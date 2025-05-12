import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../../utils/icons";
import AddNewStory from "../AddNewStory";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

const Story = ({ profileImg, username, onClick, stories, isMyStory }) => {
  const firstStory = stories?.[0];
  const { user } = useAuth();

  const hasUnseenStories = stories?.some(
    (story) => !story.viewers.some((viewer) => viewer._id === user?._id)
  );

  const [showStoryModal, setShowStoryModal] = useState(false);
  const { theme } = useTheme();

  const handlePlusClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowStoryModal(true);
  };

  return (
    <>
      <div className="flex-shrink-0 cursor-pointer group" onClick={onClick}>
        <div className="relative">
          {firstStory ? (
            <Link to={`/stories/${username}/${firstStory._id}`}>
              <div
                className={`w-16 h-16 md:w-20 md:h-20 rounded-full p-[2px] ${
                  hasUnseenStories
                    ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600"
                    : "bg-gray-300"
                }`}
              >
                <div className="w-full h-full rounded-full bg-white p-0.5 relative">
                  <img
                    src={profileImg}
                    alt={username}
                    className="w-full h-full rounded-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </Link>
          ) : (
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full p-[2px] bg-gray-300">
              <div
                onClick={handlePlusClick}
                className="w-full h-full rounded-full bg-white p-0.5 relative"
              >
                <img
                  src={profileImg}
                  alt={username}
                  className="w-full h-full rounded-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          )}
          {isMyStory && (
            <button
              onClick={handlePlusClick}
              className="absolute -bottom-0 -right-0 bg-gray-500 z-[100] rounded-full cursor-pointer hover:bg-gray-600 transition-colors"
            >
              <Icon.Plus2 size={20} className="text-white" />
            </button>
          )}
        </div>
        <p className="text-xs mt-1 text-center truncate max-w-16 md:max-w-20">
          {isMyStory ? "Your Story" : username}
        </p>
      </div>

      {showStoryModal && (
        <AddNewStory onClose={() => setShowStoryModal(false)} theme={theme} />
      )}
    </>
  );
};

export default Story;
