import React, { useEffect, useRef, useState } from "react";
import StoryContainer from "../components/Stories/StoryContainer";
import { usePost } from "../context/PostContext";
import { Icon } from "../utils/icons";
import useThemeStyles from "../utils/themeStyles";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Modal from "./Modal";
import EmojiPicker from "emoji-picker-react";
import { toast } from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";
import CommentOptions from "./CommentOptions";

const Feed = () => {
  const containerRef = useRef(null);
  const {
    fetchMyFeed,
    feed,
    setFeed,
    likePost,
    fetchAllPublicPosts,
    publicPosts,
    postComment,
    deleteComment,
  } = usePost();
  const { user } = useAuth();
  const styles = useThemeStyles();
  const [likedPosts, setLikedPosts] = useState({});
  const [isLiking, setIsLiking] = useState({});
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const { theme } = useTheme();
  const [newComment, setNewComment] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [showCommentOptionsModal, setShowCommentOptionsModal] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const emojiPickerRef = useRef(null);
  const inputRef = useRef(null);

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchMyFeed();
      if (!feed || feed.length === 0) {
        await fetchAllPublicPosts();
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (feed && user) {
      const initialLikedState = {};
      feed.forEach((post) => {
        initialLikedState[post._id] = post.likes?.some((like) =>
          typeof like === "object" ? like._id === user._id : like === user._id
        );
      });
      setLikedPosts(initialLikedState);
    }
  }, [feed, user]);

  const handleLike = async (postId) => {
    if (isLiking[postId]) return;

    try {
      setIsLiking((prev) => ({ ...prev, [postId]: true }));

      const newLikeState = !likedPosts[postId];
      setLikedPosts((prev) => ({ ...prev, [postId]: newLikeState }));

      const result = await likePost(postId);

      if (!result || !result.success) {
        throw new Error("API call failed");
      }
      await fetchMyFeed();
    } catch (error) {
      setLikedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
      console.error("Like error:", error);
    } finally {
      setIsLiking((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    setNewComment((prev) => prev + emoji);
    inputRef.current.focus();
  };

  const handlePostComment = async (postId) => {
    if (newComment.trim()) {
      try {
        setIsCommenting(true);
        await postComment(newComment, postId);

        setFeed((prevFeed) => {
          return prevFeed.map((post) => {
            if (post._id === postId) {
              const newCommentObj = {
                text: newComment,
                postedBy: {
                  username: user.username,
                  profileImg: user.profileImg,
                },
                createdAt: new Date().toISOString(),
                _id: Date.now().toString(),
              };
              return {
                ...post,
                comments: [newCommentObj, ...(post.comments || [])],
              };
            }
            return post;
          });
        });

        setNewComment("");
        toast.success("Comment added");
      } catch (error) {
        toast.error("Failed to add comment");
        console.log(error);
      } finally {
        setIsCommenting(false);
      }
    }
  };

  const handleCommentDelet = async (postId, commentId) => {
    setShowCommentOptionsModal(false);
    try {
      await deleteComment(postId, commentId);
      await fetchMyFeed();
      fetchAllPublicPosts();
      toast.success("Comment Deleted");
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        if (
          event.target.closest('button[aria-label="emoji-picker"]') === null
        ) {
          setShowEmojiPicker(false);
        }
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  return (
    <div className="w-full">
      {/* Stories section */}
      <div className="relative">
        <div className="flex items-center">
          <button
            onClick={scrollLeft}
            className="hidden md:flex absolute left-0 z-10 cursor-pointer bg-white text-gray-700 p-1 rounded-full shadow-md hover:bg-gray-100"
            aria-label="Scroll left"
          >
            <Icon.ArrowBack size={20} />
          </button>

          <div className="w-full mt-4  overflow-hidden">
            <StoryContainer ref={containerRef} />
          </div>

          <button
            onClick={scrollRight}
            className="hidden md:flex absolute right-0 z-10 cursor-pointer bg-white text-gray-700 p-1 rounded-full shadow-md hover:bg-gray-100"
            aria-label="Scroll right"
          >
            <Icon.ArrowRight size={20} />
          </button>
        </div>
      </div>

      <div className="space-y-4 mb-10">
        {feed && feed.length > 0
          ? feed.map((post) => (
              <div
                key={post._id}
                className={`rounded-lg shadow-md ${styles.bg}`}
              >
                <div className="p-4 border-b border-gray-200">
                  <Link to={`/profile/${post.postedBy?.username}`}>
                    <div className="flex items-center">
                      <img
                        src={post.postedBy?.profileImg}
                        alt={post.postedBy?.username}
                        className="w-8 h-8 rounded-full bg-gray-300 object-cover"
                      />
                      <div className="ml-3">
                        <p className="font-medium text-sm">
                          {post.postedBy?.username}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
                <div className="bg-gray-100 aspect-square w-full flex items-center justify-center">
                  {post.images && post.images.length > 0 ? (
                    <img
                      src={post.images[0]?.url}
                      alt="Post"
                      className="object-cover w-full h-full rounded-b-lg"
                    />
                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex space-x-4 mb-2">
                    <button
                      onClick={() => handleLike(post._id)}
                      className="flex items-center"
                      disabled={isLiking[post._id]}
                    >
                      {likedPosts[post._id] ? (
                        <Icon.HeartFilled size={30} className="text-red-500" />
                      ) : (
                        <Icon.Heart size={30} />
                      )}
                      <span className="ml-1 text-xs">
                        {post.likes?.length || 0}
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveCommentPost(post._id)}
                      className="flex items-center cursor-pointer"
                    >
                      <Icon.Comment size={25} />
                      <span className="ml-1 text-xs">
                        {post.comments?.length || 0}
                      </span>
                    </button>
                  </div>
                  <p className="text-sm">{post.caption || "No caption"}</p>
                </div>

                {activeCommentPost === post._id && (
                  <Modal onClose={() => setActiveCommentPost(null)}>
                    <h2 className="text-md mt-2">Comments</h2>
                    <div
                      className={`relative h-[calc(100vh-2rem)] p-4 md:h-auto ${
                        theme === "dark" ? "bg-gray-800 text-white" : "bg-white"
                      }`}
                    >
                      <div className="h-[calc(100vh-10rem)] md:max-h-[400px] overflow-y-auto mb-4">
                        {post.comments?.length > 0 ? (
                          [...post.comments].map((comment, index) => (
                            <div
                              key={index}
                              className="mb-4 flex gap-3 items-start"
                            >
                              <img
                                src={
                                  comment.postedBy?.profileImg ||
                                  "https://res.cloudinary.com/djbqtwzyf/image/upload/v1744042607/default_img_gszetk.png"
                                }
                                alt="comment user"
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div>
                                <p className="text-sm">
                                  <span className="font-semibold mr-2">
                                    <Link
                                      to={`/profile/${comment.postedBy?.username}`}
                                      className="hover:underline"
                                    >
                                      {comment.postedBy?.username || "Unknown"}
                                    </Link>
                                  </span>
                                  {comment.text}
                                </p>
                                <div className="flex items-center gap-2">
                                  <p className="text-xs text-gray-500">
                                    {new Date(
                                      comment.createdAt
                                    ).toLocaleDateString()}
                                  </p>
                                  {[
                                    comment.postedBy?.username,
                                    post.postedBy?.username,
                                  ].includes(user.username) && (
                                    <Icon.DotsHorizontal
                                      onClick={() => {
                                        setSelectedCommentId(comment.commentId);
                                        setShowCommentOptionsModal(true);
                                      }}
                                      className="cursor-pointer"
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">
                            No comments yet.
                          </p>
                        )}
                      </div>

                      <div className="border-t pt-4 px-4">
                        <div className="flex items-center gap-2 relative">
                          <button
                            type="button"
                            aria-label="emoji-picker"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-6 h-6"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
                              />
                            </svg>
                          </button>

                          {showEmojiPicker && (
                            <div
                              ref={emojiPickerRef}
                              className="absolute bottom-14 left-0 z-10"
                            >
                              <EmojiPicker onEmojiClick={handleEmojiClick} />
                            </div>
                          )}

                          <input
                            type="text"
                            ref={inputRef}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 p-2 rounded-md focus:outline-none border"
                          />
                          <button
                            onClick={() => handlePostComment(post._id)}
                            disabled={
                              newComment.trim().length <= 1 || isCommenting
                            }
                            className={`px-4 py-2 rounded-md ${
                              newComment.trim().length > 1 && !isCommenting
                                ? "text-blue-500"
                                : "text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            {isCommenting ? (
                              <Icon.Loader className="animate-spin w-6 h-6" />
                            ) : (
                              "Post"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    {showCommentOptionsModal && (
                      <CommentOptions
                        setShowCommentOptionsModal={setShowCommentOptionsModal}
                        handleCommentDelet={handleCommentDelet}
                        postId={post._id}
                        commentId={selectedCommentId}
                      />
                    )}
                  </Modal>
                )}
              </div>
            ))
          : publicPosts.map((post) => (
              <div
                key={post._id}
                className={`rounded-lg shadow-md ${styles.bg}`}
              >
                <div className="p-4 border-b border-gray-200">
                  <Link to={`/profile/${post.postedBy?.username}`}>
                    <div className="flex items-center">
                      <img
                        src={post.postedBy?.profileImg}
                        alt={post.postedBy?.username}
                        className="w-8 h-8 rounded-full bg-gray-300 object-cover"
                      />
                      <div className="ml-3">
                        <p className="font-medium text-sm">
                          {post.postedBy?.username}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
                <div className="bg-gray-100 aspect-square w-full flex items-center justify-center">
                  {post.images && post.images.length > 0 ? (
                    <img
                      src={post.images[0]?.url}
                      alt="Post"
                      className="object-cover w-full h-full rounded-b-lg"
                    />
                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex space-x-4 mb-2">
                    <button
                      onClick={() => handleLike(post._id)}
                      className="flex items-center"
                      disabled={isLiking[post._id]}
                    >
                      {likedPosts[post._id] ? (
                        <Icon.HeartFilled size={30} className="text-red-500" />
                      ) : (
                        <Icon.Heart size={30} />
                      )}
                      <span className="ml-1 text-xs">
                        {post.likes?.length || 0}
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveCommentPost(post._id)}
                      className="flex items-center cursor-pointer"
                    >
                      <Icon.Comment size={25} />
                      <span className="ml-1 text-xs">
                        {post.comments?.length || 0}
                      </span>
                    </button>
                  </div>
                  <p className="text-sm">{post.caption || "No caption"}</p>
                </div>

                {activeCommentPost === post._id && (
                  <Modal onClose={() => setActiveCommentPost(null)}>
                    <div
                      className={`relative h-[calc(100vh-2rem)] md:h-auto ${
                        theme === "dark" ? "bg-gray-800 text-white" : "bg-white"
                      }`}
                    >
                      <h2 className="text-xl font-semibold mb-4 md:hidden px-4">
                        Comments
                      </h2>

                      <div className="h-[calc(100vh-10rem)] md:max-h-[400px] overflow-y-auto mb-4 px-4">
                        {post.comments?.length > 0 ? (
                          [...post.comments].map((comment, index) => (
                            <div
                              key={index}
                              className="mb-4 flex gap-3 items-start"
                            >
                              <img
                                src={
                                  comment.postedBy?.profileImg ||
                                  "https://res.cloudinary.com/djbqtwzyf/image/upload/v1744042607/default_img_gszetk.png"
                                }
                                alt="comment user"
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div>
                                <p className="text-sm">
                                  <span className="font-semibold mr-2">
                                    <Link
                                      to={`/profile/${comment.postedBy?.username}`}
                                      className="hover:underline"
                                    >
                                      {comment.postedBy?.username || "Unknown"}
                                    </Link>
                                  </span>
                                  {comment.text}
                                </p>
                                <div className="flex items-center gap-2">
                                  <p className="text-xs text-gray-500">
                                    {new Date(
                                      comment.createdAt
                                    ).toLocaleDateString()}
                                  </p>
                                  {[
                                    comment.postedBy?.username,
                                    post.postedBy?.username,
                                  ].includes(user.username) && (
                                    <Icon.DotsHorizontal
                                      onClick={() => {
                                        setSelectedCommentId(comment.commentId);
                                        setShowCommentOptionsModal(true);
                                      }}
                                      className="cursor-pointer"
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">
                            No comments yet.
                          </p>
                        )}
                      </div>

                      <div className="border-t pt-4 px-4">
                        <div className="flex items-center gap-2 relative">
                          <button
                            type="button"
                            aria-label="emoji-picker"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-6 h-6"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
                              />
                            </svg>
                          </button>

                          {showEmojiPicker && (
                            <div
                              ref={emojiPickerRef}
                              className="absolute bottom-14 left-0 z-10"
                            >
                              <EmojiPicker onEmojiClick={handleEmojiClick} />
                            </div>
                          )}

                          <input
                            type="text"
                            ref={inputRef}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 p-2 rounded-md focus:outline-none border"
                          />
                          <button
                            onClick={() => handlePostComment(post._id)}
                            disabled={
                              newComment.trim().length <= 1 || isCommenting
                            }
                            className={`px-4 py-2 rounded-md ${
                              newComment.trim().length > 1 && !isCommenting
                                ? "text-blue-500"
                                : "text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            {isCommenting ? (
                              <Icon.Loader className="animate-spin w-6 h-6" />
                            ) : (
                              "Post"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    {showCommentOptionsModal && (
                      <CommentOptions
                        setShowCommentOptionsModal={setShowCommentOptionsModal}
                        handleCommentDelet={handleCommentDelet}
                        postId={post._id}
                        commentId={selectedCommentId}
                      />
                    )}
                  </Modal>
                )}
              </div>
            ))}
      </div>
    </div>
  );
};

export default Feed;
