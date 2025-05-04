import React, { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import ReactDOM from "react-dom";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePost } from "../context/PostContext";
import useUserSearch from "../hooks/useUserSearch.js";
import { Icon } from "../utils/icons.js";
import LikedAvtars from "./LikedAvtars";
import AllComments from "./AllComments";
import { toast } from "react-hot-toast";
import PostTopBar from "./PostTopBar.jsx";
import PostImage from "./PostImage.jsx";
import CommentOptions from "./CommentOptions.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import useThemeStyles from "../utils/themeStyles.js";

const PostModal = () => {
  const navigate = useNavigate();
  const { username, postId } = useParams();
  const { seachedUser, setSearchedUser, searchUserProfileData } =
    useUserSearch();
  const { user, getRelativeTime } = useAuth();
  const { theme } = useTheme();
  const styles = useThemeStyles();
  const {
    newComment,
    setNewComment,
    postComment,
    fetchPostsByUsername,
    userPosts,
    deleteComment,
    likePost,
    handleCopy,
    copied,
  } = usePost();

  const bgAndText =
    theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black";

  const [post, setPost] = useState(null);
  const [showAllComments, setShowAllComments] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showCommentOptionsModal, setShowCommentOptionsModal] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    const fetchAndSelectPost = async () => {
      if (!seachedUser || seachedUser.username !== username) {
        try {
          const data = await searchUserProfileData(username);
          setSearchedUser(data);
          await fetchPostsByUsername(username);
        } catch (error) {
          console.error("Error fetching user or posts:", error);
        }
      }
    };
    fetchAndSelectPost();
  }, [username]);

  // Set post and initial like state when userPosts or postId changes
  useEffect(() => {
    const foundPost = userPosts.find((p) => p._id === postId);
    setPost(foundPost || null);

    // Set initial like state properly
    if (foundPost && user) {
      const liked = foundPost.likes?.some((like) =>
        // Check if like is an object with _id or a string
        typeof like === "object" ? like._id === user._id : like === user._id
      );
      setHasLiked(liked);
    }
  }, [userPosts, postId, user]);

  const handlePostComment = async () => {
    if (newComment.trim()) {
      try {
        setIsCommenting(true);
        await postComment(newComment, postId);

        const newCommentObj = {
          text: newComment,
          postedBy: {
            username: user.username,
            profileImg: user.profileImg,
          },
          createdAt: new Date().toISOString(),
          _id: Date.now().toString(),
        };

        setPost((prevPost) => ({
          ...prevPost,
          comments: [newCommentObj, ...prevPost.comments],
        }));

        setNewComment("");
        toast.success("Comment added");

        const updatedPosts = await fetchPostsByUsername(username);
        const updatedPost = updatedPosts.find((p) => p._id === postId);
        if (updatedPost) {
          setPost(updatedPost);
        }
      } catch (error) {
        setPost((prevPost) => ({
          ...prevPost,
          comments: prevPost.comments.filter(
            (c) => c._id !== Date.now().toString()
          ),
        }));
      } finally {
        setIsCommenting(false);
      }
    }
  };

  const closeModal = () => {
    // navigate(`/profile/${username}`, { replace: true });
    navigate(-1);
    setShowAllComments(false);
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

  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    setNewComment((prev) => prev + emoji);
    inputRef.current.focus();
  };

  const handleCommentDelet = async (postId, commentId) => {
    setShowCommentOptionsModal(false);
    try {
      await deleteComment(postId, commentId);
      toast.success("Comment Deleted");
      const updatedPosts = await fetchPostsByUsername(username);
      const updatedPost = updatedPosts.find((p) => p._id === postId);
      if (updatedPost) {
        setPost(updatedPost);
      }
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  const handleLike = async (postId) => {
    // Prevent multiple simultaneous like requests
    if (isLiking) return;

    try {
      setIsLiking(true);

      // Update UI optimistically
      const newLikeState = !hasLiked;
      setHasLiked(newLikeState);

      // Update local post state optimistically
      setPost((prevPost) => {
        if (!prevPost) return prevPost;

        const updatedLikes = newLikeState
          ? [...(prevPost.likes || []), { _id: user._id }]
          : (prevPost.likes || []).filter((like) =>
              typeof like === "object"
                ? like._id !== user._id
                : like !== user._id
            );

        return {
          ...prevPost,
          likes: updatedLikes,
        };
      });

      // Make API call
      const result = await likePost(postId);

      // If API call fails, revert the optimistic update
      if (!result || !result.success) {
        throw new Error("API call failed");
      }

      // Fetch the latest data to ensure consistency
      const updatedPosts = await fetchPostsByUsername(username);
      const updatedPost = updatedPosts.find((p) => p._id === postId);

      if (updatedPost) {
        setPost(updatedPost);

        // Update like state based on the fresh data
        const liked = updatedPost.likes?.some((like) =>
          typeof like === "object" ? like._id === user._id : like === user._id
        );
        setHasLiked(liked);
      }
    } catch (error) {
      // Revert optimistic update on error
      setHasLiked(!hasLiked);
      console.error("Like error:", error);
    } finally {
      setIsLiking(false);
    }
  };

  if (!post) return null;

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 backdrop-brightness-50 flex items-center justify-center z-[9999]">
        <div
          className={`${bgAndText} overflow-hidden w-full h-full sm:w-11/21 sm:h-[95vh] flex flex-col sm:flex-row`}
        >
          {/* Topbar for small screens */}
          <PostTopBar closeModal={closeModal} title={"Post"} />

          {/* User info mobile */}
          <div className="flex lg:hidden items-center space-x-2 justify-between p-2">
            <div className="flex items-center gap-2">
              <img
                src={
                  seachedUser?.profileImg ||
                  "https://res.cloudinary.com/djbqtwzyf/image/upload/v1744042607/default_img_gszetk.png"
                }
                alt=""
                className="object-cover object-center w-8 h-8 rounded-full"
              />
              <div className="-space-y-1">
                <h2 className="text-sm font-semibold leading-none">
                  <Link to={`/profile/${username}`}>{username}</Link>
                </h2>
              </div>
            </div>
            <button title="Open options" type="button">
              <Icon.DotsHorizontal
                onClick={() => setShowOptionsModal(true)}
                className="w-5 h-5 cursor-pointer"
              />
            </button>
          </div>

          {post.images?.length > 0 && <PostImage postImg={post.images} />}

          <div className="w-full sm:w-1/2 h-1/2 sm:h-full overflow-y-auto flex flex-col justify-between">
            <div>
              {/* User header large screen */}
              <div
                className={`hidden lg:flex items-center space-x-2 justify-between border-b border-gray-300 p-2 sticky top-0 z-10 ${bgAndText}`}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={
                      seachedUser?.profileImg ||
                      "https://res.cloudinary.com/djbqtwzyf/image/upload/v1744042607/default_img_gszetk.png"
                    }
                    alt=""
                    className="object-cover object-center w-8 h-8 rounded-full"
                  />
                  <div className="-space-y-1">
                    <h2 className="text-sm font-semibold leading-none">
                      <Link to={`/profile/${username}`}>{username}</Link>
                    </h2>
                  </div>
                </div>
                <button title="Open options" type="button">
                  <Icon.DotsHorizontal
                    onClick={() => setShowOptionsModal(true)}
                    className="w-5 h-5 cursor-pointer"
                  />
                </button>
              </div>

              {showOptionsModal && (
                <div className="fixed inset-0 flex items-center justify-center z-[99999] backdrop-brightness-50 bg-opacity-50">
                  <div className={`${bgAndText} rounded-lg w-80`}>
                    <button className="w-full py-3 px-4 cursor-pointer text-center text-red-500 font-semibold border-b border-gray-200">
                      Report
                    </button>
                    {username !== user.username ? (
                      <button className="w-full py-3 px-4 cursor-pointer text-center text-red-500 font-semibold border-b border-gray-200">
                        Unfollow
                      </button>
                    ) : null}
                    <button
                      onClick={handleCopy}
                      className="w-full py-3 px-4 cursor-pointer text-center border-b border-gray-200"
                    >
                      {copied ? "Copied" : "Copy Link"}
                    </button>
                    <button className="w-full py-3 px-4 cursor-pointer text-center border-b border-gray-200">
                      Share
                    </button>
                    <button className="w-full py-3 px-4 cursor-pointer text-center border-b border-gray-200">
                      About this Account
                    </button>
                    <button
                      className="w-full py-3 px-4 text-center"
                      onClick={() => setShowOptionsModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Small screen comment summary */}
              <div className="sm:hidden p-3">
                <div className="flex items-center space-x-2 justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {hasLiked ? (
                      <Icon.HeartFilled
                        size={24}
                        onClick={() => handleLike(post._id)}
                        className="text-red-500 cursor-pointer"
                      />
                    ) : (
                      <Icon.HeartOutline
                        size={24}
                        onClick={() => handleLike(post._id)}
                        className="cursor-pointer"
                      />
                    )}
                    <Icon.Comment
                      size={24}
                      onClick={() => setShowAllComments(true)}
                      className="cursor-pointer"
                    />
                  </div>

                  <Icon.Bookmark size={24} />
                </div>
                <div className="relative">
                  <LikedAvtars post={post} />
                </div>
                {post.comments?.length > 0 ? (
                  <>
                    <div className="mb-2 mt-2 flex gap-3 items-start">
                      <img
                        src={
                          post.comments[0]?.postedBy?.profileImg ||
                          "https://res.cloudinary.com/djbqtwzyf/image/upload/v1744042607/default_img_gszetk.png"
                        }
                        alt="comment user"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm">
                          <span className="font-semibold mr-2">
                            <Link
                              to={`/profile/${post.comments[0]?.postedBy?.username}`}
                            >
                              {post.comments[0]?.postedBy?.username}
                            </Link>
                          </span>
                          {post.comments[0]?.text}
                        </p>
                        <div className="flex items-center gap-4">
                          <p className="text-sm">
                            {getRelativeTime(post.comments[0]?.createdAt)}
                          </p>
                          <Icon.DotsHorizontal className="cursor-pointer" />
                        </div>
                      </div>
                    </div>
                    {post.comments.length > 1 && (
                      <>
                        <p
                          className="text-gray-500 text-sm cursor-pointer"
                          onClick={() => setShowAllComments(true)}
                        >
                          View all {post.comments.length} comments
                        </p>
                        <p className="text-gray-500 text-sm cursor-pointer">
                          {new Date(post.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">No comments yet.</p>
                )}
              </div>

              {/* Large screen comments */}
              <div className="hidden sm:block p-2">
                {post.comments?.length > 0 ? (
                  post.comments
                    .slice()
                    .reverse()
                    .map((comment, index) => (
                      <div key={index} className="mb-2 flex gap-3 items-start">
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
                            <span className="font-semibold mr-2 cursor-pointer">
                              <Link
                                to={`/profile/${comment.postedBy?.username}`}
                              >
                                {comment.postedBy?.username}
                              </Link>
                            </span>

                            {comment.text}
                          </p>
                          <div className="flex items-center gap-4">
                            <p className="text-sm text-gray-500">
                              {getRelativeTime(comment.createdAt)}
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
                  <p className="text-gray-500 text-sm">No comments yet.</p>
                )}
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

            {/* Comment input */}
            <div className={`sticky bottom-0 p-3 ${bgAndText}`}>
              <div className="hidden lg:flex items-center space-x-2 justify-between border-t border-gray-300">
                <div className="flex items-center gap-4 mt-2">
                  {hasLiked ? (
                    <Icon.HeartFilled
                      size={24}
                      onClick={() => handleLike(post._id)}
                      className="text-red-500 cursor-pointer"
                    />
                  ) : (
                    <Icon.HeartOutline
                      size={24}
                      onClick={() => handleLike(post._id)}
                      className="cursor-pointer"
                    />
                  )}
                  <Icon.Comment size={24} className="cursor-pointer" />
                </div>
                <Icon.Bookmark size={24} className="mt-2" />
              </div>
              <div className="hidden lg:block mt-2 relative">
                <LikedAvtars post={post} />
                <p className="text-gray-400 text-sm">
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="hidden lg:flex items-center border-t border-gray-300 mt-2 pt-2">
                <button
                  type="button"
                  aria-label="emoji-picker"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none mr-2"
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
                    className="absolute bottom-16 left-4 z-10"
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
                  className="flex-1 p-2 rounded-md focus:outline-none"
                />
                <button
                  onClick={() => {
                    handlePostComment(post._id);
                    setShowEmojiPicker(false);
                  }}
                  disabled={newComment.trim().length <= 1 || isCommenting}
                  className={`ml-2 px-4 py-2 rounded-md cursor-pointer ${
                    newComment.trim().length > 1 && !isCommenting
                      ? theme === "dark"
                        ? "text-white"
                        : "text-gray-800"
                      : "cursor-not-allowed text-gray-400"
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
        </div>

        <button
          onClick={closeModal}
          className="hidden sm:inline absolute top-4 right-4 text-white text-5xl cursor-pointer"
        >
          &times;
        </button>
      </div>

      {showAllComments &&
        ReactDOM.createPortal(
          <AllComments
            searchedUser={username}
            post={post}
            setShowAllComments={setShowAllComments}
            getRelativeTime={getRelativeTime}
            setShowCommentOptionsModal={setShowCommentOptionsModal}
            showCommentOptionsModal={showCommentOptionsModal}
          />,
          document.body
        )}
    </>,
    document.body
  );
};

export default PostModal;
