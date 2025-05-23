import React, { useEffect, useState, useRef } from "react";
import Story from "./Story";
import Modal from "../Modal";
import { useStory } from "../../context/StoryContext";
import StorySkeletonLoader from "..//../components/SkeletonLoaders/StorySkeletonLoader";

const StoryContainer = React.forwardRef((props, ref) => {
  const {
    stories,
    fetchOtherUsersStories,
    myStories,
    fetchMyStories,
    loading,
  } = useStory();
  const [activeUserIndex, setActiveUserIndex] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchOtherUsersStories();
    fetchMyStories();
  }, []);

  useEffect(() => {
    if (activeUserIndex !== null) {
      const currentUserStories = stories[activeUserIndex]?.stories || [];
      const currentStory = currentUserStories[currentStoryIndex];

      clearTimeout(timerRef.current);

      if (currentStory) {
        if (currentStory.mediaType === "video") {
          timerRef.current = setTimeout(
            nextStory,
            currentStory?.duration || 5000
          );
        } else {
          timerRef.current = setTimeout(nextStory, 5000);
        }
      }
    }

    return () => clearTimeout(timerRef.current);
  }, [activeUserIndex, currentStoryIndex]);

  const openStoryModal = (userIndex) => {
    setActiveUserIndex(userIndex);
    setCurrentStoryIndex(0);
  };

  const closeModal = () => {
    clearTimeout(timerRef.current);
    setActiveUserIndex(null);
    setCurrentStoryIndex(0);
  };

  const nextStory = () => {
    const currentUserStories = stories[activeUserIndex]?.stories || [];
    if (currentStoryIndex < currentUserStories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
    } else if (activeUserIndex < stories.length - 1) {
      setActiveUserIndex((prev) => prev + 1);
      setCurrentStoryIndex(0);
    } else {
      closeModal();
    }
  };

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
    } else if (activeUserIndex > 0) {
      const prevUserStories = stories[activeUserIndex - 1]?.stories || [];
      setActiveUserIndex((prev) => prev - 1);
      setCurrentStoryIndex(prevUserStories.length - 1);
    }
  };

  return (
    <div className="relative w-full">
      <div
        ref={ref}
        className="flex space-x-4 overflow-x-auto px-2 py-4 scrollbar-hide"
      >
        {loading ? (
          <StorySkeletonLoader />
        ) : (
          myStories.length > 0 && (
            <Story
              key="my-story"
              username={myStories[0]?.user?.username}
              profileImg={myStories[0]?.user?.profileImg}
              onClick={() => openStoryModal(0)}
              stories={myStories[0]?.stories}
              isMyStory={true}
            />
          )
        )}
        {stories.map((storyGroup, index) => (
          <Story
            key={index}
            username={storyGroup.user.username}
            profileImg={storyGroup.user.profileImg}
            onClick={() =>
              openStoryModal(index + (myStories.length > 0 ? 1 : 0))
            }
            stories={storyGroup.stories}
            isMyStory={false}
          />
        ))}
      </div>
    </div>
  );
});

StoryContainer.displayName = "StoryContainer";
export default StoryContainer;
