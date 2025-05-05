import React, { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import { Icon } from "../utils/icons.js";
import { Link } from "react-router-dom";
import { usePost } from "../context/PostContext";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";
import CommentOptions from "./CommentOptions.jsx";
import useThemeStyles from "../utils/themeStyles.js";

const AllComments = ({
  searchedUser,
  post,
  setShowAllComments,
  getRelativeTime,
  setShowCommentOptionsModal,
  showCommentOptionsModal,
}) => {
  const {
    newComment,
    setNewComment,
    postComment,
    fetchUserPosts,
    fetchPostsByUsername,
    deleteComment,
  } = usePost();
  const { user } = useAuth();
  const styles = useThemeStyles();
  const [isCommenting, setIsCommenting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const handlePostComment = async (postId) => {
    if (newComment.trim()) {
      try {
        setIsCommenting(true);
        await postComment(newComment, postId);
        fetchUserPosts();
        await fetchPostsByUsername(searchedUser);
        setShowAllComments(true);
        toast.success("Comment added");
        setNewComment("");
      } catch (err) {
        toast.error("Failed to post comment");
      } finally {
        setIsCommenting(false);
      }
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

  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    setNewComment((prev) => prev + emoji);
    inputRef.current.focus();
  };

  const handleCommentDelet = async (postId, commentId) => {
    setShowCommentOptionsModal(false);
    try {
      await deleteComment(postId, commentId);
      await fetchUserPosts();
      await fetchPostsByUsername(searchedUser);
      setShowAllComments(true);
      toast.success("Comment Deleted");
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };
  return (
    <div className="fixed inset-0 backdrop-brightness-50 flex items-center justify-center z-[9999]">
      <div
        className={`rounded-lg overflow-hidden w-full h-full sm:w-11/12 sm:h-5/6 flex flex-col sm:flex-row ${styles.bg}`}
      >
        {/* Top Bar (Mobile only) */}
        <div className="relative w-full flex items-center justify-center p-2 sm:hidden shadow-md">
          <button className="absolute left-0">
            <Icon.ArrowBack
              size={30}
              onClick={() => setShowAllComments(false)}
            />
          </button>
          <p className="text-lg font-semibold">Comments</p>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          {post.comments && post.comments.length > 0 ? (
            post.comments
              .slice()
              .reverse()
              .map((comment, index) => (
                <div key={index} className="mb-2 flex gap-3 items-start p-2">
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
                        <Link to={`/profile/${comment.postedBy?.username}`}>
                          {comment.postedBy?.username}
                        </Link>
                      </span>
                      <span>{comment.text}</span>
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
            <p className="mt-10 text-center text-gray-500">No comments yet.</p>
          )}
        </div>

        {showCommentOptionsModal && (
          <CommentOptions
            setShowCommentOptionsModal={setShowCommentOptionsModal}
            handleCommentDelet={handleCommentDelet}
            postId={post._id}
            commentId={selectedCommentId}
          />
        )}

        {/* Sticky Comment Input Section */}
        <div
          className={`flex items-center gap-3 p-2 border-t sm:relative sm:bottom-0 sm:w-full sm:px-4 sm:py-2 sticky bottom-0 relative ${styles.bg}${styles.text}`}
        >
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
            className={`ml-2 px-4 py-2 rounded-md font-medium transition duration-200 ${
              newComment.trim().length > 1 && !isCommenting
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isCommenting ? (
              <Icon.Loader className="animate-spin w-5 h-5 mx-auto" />
            ) : (
              "Post"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllComments;
