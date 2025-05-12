import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useStory } from "../context/StoryContext";
import { Icon } from "../utils/icons.js";
import Modal from "../components/Modal.jsx";
import LoadingModal from "../components/LoadingModal";
import useThemeStyles from "../utils/themeStyles.js";

const ViewStories = () => {
  const { username, storyId } = useParams();
  const navigate = useNavigate();
  const { stories, myStories, deleteStory, addToViewStory } = useStory();
  const [currentUserStories, setCurrentUserStories] = useState([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isMyStory, setIsMyStory] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showStoryOptionModal, setShowStoryOptionModal] = useState(false);
  const [showStoryViewsModal, setShowStoryViewsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const styles = useThemeStyles();

  useEffect(() => {
    // Reset state when parameters change
    setCurrentUserStories([]);
    setCurrentStoryIndex(0);

    // Check if it's the user's own story or someone else's
    if (myStories.length > 0 && myStories[0].user.username === username) {
      setIsMyStory(true);
      const index = myStories[0].stories.findIndex((s) => s._id === storyId);
      setCurrentUserStories(myStories[0].stories);
      setCurrentStoryIndex(index >= 0 ? index : 0);
    } else {
      const user = stories.find((s) => s.user.username === username);
      if (user) {
        setIsMyStory(false);
        const index = user.stories.findIndex((s) => s._id === storyId);
        setCurrentUserStories(user.stories);
        setCurrentStoryIndex(index >= 0 ? index : 0);

        if (storyId) {
          addToViewStory(storyId);
        }
      }
    }

    // Reset video mute state when changing stories
    setIsMuted(true);
  }, [username, storyId, stories, myStories, addToViewStory]);

  // Add effect to track views when navigating between stories
  useEffect(() => {
    // Only call addToViewStory when viewing someone else's story
    if (!isMyStory && currentUserStories[currentStoryIndex]) {
      const currentStoryId = currentUserStories[currentStoryIndex]._id;
      addToViewStory(currentStoryId);
    }
  }, [currentStoryIndex, isMyStory, currentUserStories, addToViewStory]);

  const currentStory = currentUserStories[currentStoryIndex];

  // Add new useEffect for handling video end
  useEffect(() => {
    if (currentStory?.mediaType === "video" && videoRef.current) {
      const handleVideoEnd = () => {
        goToNextStory();
      };

      videoRef.current.addEventListener("ended", handleVideoEnd);
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener("ended", handleVideoEnd);
        }
      };
    }
  }, [currentStory, currentStoryIndex]);

  if (!currentStory) return <div className="bg-black h-screen"></div>;

  // Find current user index in stories array
  const currentUserIndex = isMyStory
    ? -1 // Special index for my stories
    : stories.findIndex((user) => user.user.username === username);

  // Helper to get side user previews
  const getSideUser = (offset) => {
    if (isMyStory) return null;
    const idx = currentUserIndex + offset;
    if (idx >= 0 && idx < stories.length) {
      return stories[idx];
    }
    return null;
  };

  // Navigation handlers
  const goToNextStory = () => {
    if (currentStoryIndex < currentUserStories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else if (!isMyStory) {
      if (currentUserIndex < stories.length - 1) {
        const nextUser = stories[currentUserIndex + 1];
        if (nextUser.stories && nextUser.stories.length > 0) {
          // Force a state reset before navigation to ensure clean state
          setCurrentUserStories([]);
          setCurrentStoryIndex(0);
          navigate(
            `/stories/${nextUser.user.username}/${nextUser.stories[0]._id}`
          );
        }
      }
    }
  };

  const goToPreviousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    } else if (!isMyStory) {
      if (currentUserIndex > 0) {
        const prevUser = stories[currentUserIndex - 1];
        if (prevUser.stories && prevUser.stories.length > 0) {
          // Force a state reset before navigation to ensure clean state
          setCurrentUserStories([]);
          setCurrentStoryIndex(0);
          navigate(
            `/stories/${prevUser.user.username}/${
              prevUser.stories[prevUser.stories.length - 1]._id
            }`
          );
        }
      }
    }
  };

  // UI for side user preview
  const SideUserPreview = ({ user, side }) => {
    if (!user) return <div className="w-24 h-64" />;
    return (
      <div
        className={`flex flex-col items-center justify-center cursor-pointer transition-transform duration-200 ${
          side === "left" ? "-rotate-3" : "rotate-3"
        } opacity-80 hover:opacity-100`}
        onClick={(e) => {
          e.stopPropagation();
          if (user.stories && user.stories.length > 0) {
            // Force a state reset before navigation to ensure clean state
            setCurrentUserStories([]);
            setCurrentStoryIndex(0);
            navigate(`/stories/${user.user.username}/${user.stories[0]._id}`);
          }
        }}
      >
        <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 mb-2">
          <img
            src={user.user.profileImg}
            alt={user.user.username}
            className="w-full h-full rounded-full object-cover border-2 border-black"
          />
        </div>
        <div className="bg-black bg-opacity-60 px-2 py-1 rounded text-white text-xs font-semibold">
          {user.user.username}
        </div>
      </div>
    );
  };

  const handleStoryDeletion = async (storyId) => {
    try {
      setLoading(true);
      await deleteStory(storyId);
      setShowStoryOptionModal(false);
      navigate("/");
    } catch (error) {
      console.error("Error deleting story:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentStory) {
    return (
      <div className="bg-black h-screen flex items-center justify-center text-white">
        Story not found.
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
      {/* Close Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-0 right-5 bg-black text-white cursor-pointer text-2xl hover:text-gray-300 z-50"
      >
        <Icon.Close size={40} />
      </button>

      {/* Main Story Layout */}
      <div className="flex items-center justify-center w-full h-full">
        {/* Left User Preview (desktop only) */}
        {!isMyStory && (
          <div className="hidden md:block absolute z-10 left-4 md:left-8 lg:left-16">
            <SideUserPreview user={getSideUser(-1)} side="left" />
          </div>
        )}

        {/* Main Story Card */}
        <div className="relative flex flex-col items-center justify-between w-[350px] md:w-[400px] h-[700px] max-w-full shadow-2xl mx-2 md:mx-6 bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-600 overflow-hidden z-20">
          {/* Progress Bar */}
          <div className="h-1 w-full bg-white bg-opacity-30">
            <div className="h-full bg-white transition-all duration-5000 ease-linear w-full animate-progress" />
          </div>

          {/* Overlay: All users bar (top, mobile only) */}
          {!isMyStory && (
            <div className="absolute top-6 left-0 w-full flex md:hidden z-20 px-2">
              <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
                {stories.map((storyUser) => (
                  <div
                    key={storyUser.user.username}
                    className={`flex flex-col items-center cursor-pointer ${
                      storyUser.user.username === username
                        ? "opacity-100"
                        : "opacity-60"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent event bubbling
                      // Ensure storyUser has stories before navigating
                      if (storyUser.stories && storyUser.stories.length > 0) {
                        navigate(
                          `/stories/${storyUser.user.username}/${storyUser.stories[0]._id}`
                        );
                      }
                    }}
                  >
                    <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                      <img
                        src={storyUser.user.profileImg}
                        alt={storyUser.user.username}
                        className="w-full h-full rounded-full object-cover border-2 border-black"
                      />
                    </div>
                    <span className="text-white text-xs mt-1 truncate max-w-[60px]">
                      {storyUser.user.username}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Story Media with overlays */}
          <div className="relative w-full flex-1 flex items-center justify-center">
            {/* Left click area for previous story */}
            <div
              className="absolute left-0 top-0 w-1/2 h-full cursor-pointer z-20"
              onClick={goToPreviousStory}
            />

            {/* Right click area for next story */}
            <div
              className="absolute right-0 top-0 w-1/2 h-full cursor-pointer z-20"
              onClick={goToNextStory}
            />

            {currentStory.mediaType === "video" ? (
              <>
                <video
                  ref={videoRef}
                  src={currentStory.mediaUrl}
                  autoPlay
                  muted={isMuted}
                  controls={false}
                  className="w-full h-full object-cover md:h-[100%] md:object-cover rounded-b-xl"
                  style={{ maxHeight: "100vh", minHeight: "300px" }}
                />

                {/* Controls: Mute/Unmute + Dots */}
                <div className="absolute bottom-5 right-5 flex gap-3 z-30">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="bg-black bg-opacity-50 cursor-pointer text-white p-2 rounded-full"
                  >
                    {isMuted ? (
                      <Icon.VolumeOff size={24} />
                    ) : (
                      <Icon.VolumeUp size={24} />
                    )}
                  </button>
                  <button
                    onClick={() => setShowStoryOptionModal(true)}
                    className="bg-black bg-opacity-50 text-white p-2 cursor-pointer rounded-full"
                  >
                    <Icon.DotsHorizontal size={24} />
                  </button>
                  {isMyStory && (
                    <button
                      onClick={() => setShowStoryViewsModal(true)}
                      className="flex items-center gap-1 bg-black bg-opacity-50 text-white p-2 rounded-full cursor-pointer"
                    >
                      <Icon.OnEye size={24} />
                      <span>{currentStory.viewers.length}</span>
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <img
                  src={currentStory.mediaUrl}
                  alt="story"
                  className="w-full h-full object-cover md:h-[700px] md:object-cover rounded-b-xl"
                  style={{ maxHeight: "100vh", minHeight: "300px" }}
                />
                <div className="absolute bottom-5 right-5 flex gap-2 z-30">
                  <button
                    onClick={() => setShowStoryOptionModal(true)}
                    className="bg-black bg-opacity-50 text-white p-2 cursor-pointer rounded-full"
                  >
                    <Icon.DotsHorizontal size={24} />
                  </button>
                  {isMyStory && (
                    <button
                      onClick={() => setShowStoryViewsModal(true)}
                      className="flex items-center gap-1 bg-black bg-opacity-50 text-white p-2 rounded-full cursor-pointer"
                    >
                      <Icon.OnEye size={24} />
                      <span>{currentStory.viewers.length}</span>
                    </button>
                  )}
                </div>
              </>
            )}

            {showStoryOptionModal && (
              <Modal onClose={() => setShowStoryOptionModal(false)}>
                <div className="p-4">
                  {loading && <LoadingModal text={"Deleting Story"} />}
                  <h3 className="text-lg font-semibold mb-4">Story Options</h3>
                  <div className="flex flex-col gap-2">
                    {isMyStory ? (
                      <>
                        <button
                          className={`text-red-500 ${styles.hover} p-2 rounded-lg text-left`}
                          onClick={() => {
                            handleStoryDeletion(currentStory._id);
                          }}
                        >
                          Delete Story
                        </button>
                        <button
                          className={`text-red-500 ${styles.hover} p-2 rounded-lg text-left`}
                          onClick={() => {
                            setShowStoryOptionModal(false);
                          }}
                        >
                          Report
                        </button>
                        <button
                          className={`text-gray-700 ${styles.hover} p-2 rounded-lg text-left`}
                          onClick={() => {
                            setShowStoryOptionModal(false);
                          }}
                        >
                          Share
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className={`text-red-500 ${styles.hover} p-2 rounded-lg text-left`}
                          onClick={() => {
                            setShowStoryOptionModal(false);
                          }}
                        >
                          Report
                        </button>
                        <button
                          className={`text-gray-700 ${styles.hover} p-2 rounded-lg text-left`}
                          onClick={() => {
                            setShowStoryOptionModal(false);
                          }}
                        >
                          Share
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </Modal>
            )}

            {showStoryViewsModal && (
              <Modal
                onClose={() => setShowStoryViewsModal(false)}
                styles={styles}
              >
                <div className="p-4">
                  <h2 className="text-lg font-semibold capitalize border-b border-gray-400 pb-2">
                    Story Viewers
                  </h2>

                  <div
                    className="space-y-4 max-h-70 overflow-y-auto"
                    style={{ height: "400px" }}
                  >
                    {currentStory.viewers.map((user) => (
                      <div
                        key={user._id}
                        className={`flex justify-between items-center space-x-4 p-2 rounded-lg ${styles.hover}`}
                      >
                        <Link to={`/profile/${user.username}`}>
                          <div className="flex items-center gap-2">
                            <img
                              src={user.profileImg || "/default-avatar.png"}
                              alt={user.username}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <p className="font-medium">{user.username}</p>
                          </div>
                        </Link>
                      </div>
                    ))}
                    {currentStory.viewers.length === 0 && (
                      <p className="text-gray-500 text-center">
                        No viewers found
                      </p>
                    )}
                  </div>
                </div>
              </Modal>
            )}

            {/* Overlay: User info (top left, desktop only) */}
            {!isMyStory && (
              <Link to={`/profile/${stories[currentUserIndex].user.username}`}>
                <div className="absolute top-4 left-4 items-center bg-opacity-50 rounded-full px-3 hidden md:flex">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[2px] mr-2">
                    <img
                      src={stories[currentUserIndex].user.profileImg}
                      alt={stories[currentUserIndex].user.username}
                      className="w-full h-full rounded-full object-cover border-2"
                    />
                  </div>
                  <span className="text-white font-semibold text-base">
                    {stories[currentUserIndex].user.username}
                  </span>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Right User Preview (desktop only) */}
        {!isMyStory && (
          <div className="hidden md:block absolute z-10 right-4 md:right-8 lg:right-16">
            <SideUserPreview user={getSideUser(1)} side="right" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewStories;
