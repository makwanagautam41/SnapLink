import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Icon } from "../utils/icons.js";
import LikedAvtars from "./LikedAvtars";
import AllComments from "./AllComments";
import { useAuth } from "../context/AuthContext";
import { usePost } from "../context/PostContext";
import toast from "react-hot-toast";

const Post = ({ post, user }) => {
  const { getRelativeTime } = useAuth();
  const { postComment, newComment, setNewComment, fetchPostsByUsername } =
    usePost();
  const [selectedImage, setSelectedImage] = useState(null);
  const [showAllComments, setShowAllComments] = useState(false);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setShowAllComments(false);
  };

  const handlePostComment = async (postId) => {
    if (newComment.trim()) {
      await postComment(newComment, postId);
      await fetchPostsByUsername(user);
      toast.success("Comment added");
      setNewComment("");
    }
  };
  return (
    <>
      <div
        className="overflow-hidden cursor-pointer"
        onClick={() => handleImageClick(post.images[0])}
      >
        <img
          src={
            post.images[0]?.url ||
            "https://res.cloudinary.com/djbqtwzyf/image/upload/v1744042607/default_img_gszetk.png"
          }
          alt="Post"
          className="object-cover w-full aspect-square transition-all duration-200 ease-in-out hover:brightness-50"
        />
      </div>

      {selectedImage &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 backdrop-brightness-50 flex items-center justify-center z-[9999]">
            <div className="bg-white overflow-hidden w-full h-full sm:w-11/12 sm:h-5/6 flex flex-col sm:flex-row">
              <div className="relative w-full flex items-center justify-center p-2 sm:hidden shadow-md">
                <button className="absolute left-0">
                  <Icon.ArrowBack size={30} onClick={closeModal} />
                </button>
                <p className="text-lg font-semibold">Post</p>
              </div>

              <div className="flex lg:hidden items-center space-x-2 justify-between p-2">
                <div className="flex items-center gap-2">
                  <img
                    src={
                      post.postedBy?.profileImg ||
                      "https://res.cloudinary.com/djbqtwzyf/image/upload/v1744042607/default_img_gszetk.png"
                    }
                    alt="User"
                    className="object-cover object-center w-8 h-8 rounded-full shadow-sm"
                  />
                  <div className="-space-y-1">
                    <h2 className="text-sm font-semibold leading-none">
                      {post.postedBy?.username || "Unknown"}
                    </h2>
                  </div>
                </div>
                <button title="Open options" type="button">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    className="w-5 h-5 fill-current cursor-pointer"
                  >
                    <path d="M256,144a64,64,0,1,0-64-64A64.072,64.072,0,0,0,256,144Zm0-96a32,32,0,1,1-32,32A32.036,32.036,0,0,1,256,48Z"></path>
                    <path d="M256,368a64,64,0,1,0,64,64A64.072,64.072,0,0,0,256,368Zm0,96a32,32,0,1,1,32-32A32.036,32.036,0,0,1,256,464Z"></path>
                    <path d="M256,192a64,64,0,1,0,64,64A64.072,64.072,0,0,0,256,192Zm0,96a32,32,0,1,1,32-32A32.036,32.036,0,0,1,256,288Z"></path>
                  </svg>
                </button>
              </div>

              <div className="w-full sm:w-1/2 h-1/2 sm:h-full">
                <img
                  src={
                    selectedImage.url ||
                    "https://res.cloudinary.com/djbqtwzyf/image/upload/v1744042607/default_img_gszetk.png"
                  }
                  alt="Selected"
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="w-full sm:w-1/2 h-1/2 sm:h-full p-4 overflow-y-auto flex flex-col justify-between">
                <div>
                  <div className="hidden lg:flex items-center space-x-2 mb-4 justify-between border-b border-gray-300 p-1">
                    <div className="flex items-center gap-2">
                      <img
                        src={
                          user.profileImg ||
                          "https://res.cloudinary.com/djbqtwzyf/image/upload/v1744042607/default_img_gszetk.png"
                        }
                        alt={user.username}
                        className="object-cover object-center w-8 h-8 rounded-full"
                      />
                      <div className="-space-y-1">
                        <h2 className="text-sm font-semibold leading-none">
                          {user.username}
                        </h2>
                      </div>
                    </div>
                    <button title="Open options" type="button">
                      <Icon.DotsHorizontal className="w-5 h-5 cursor-pointer" />
                    </button>
                  </div>
                  {/* Small screens]*/}
                  <div className="sm:hidden">
                    <div className="flex items-center space-x-2 justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <Icon.HeartOutline size={24} />
                        <Icon.Comment
                          size={24}
                          onClick={() => setShowAllComments(true)}
                        />
                      </div>
                      <Icon.Bookmark size={24} />
                    </div>
                    <div className="relative">
                      <LikedAvtars post={post} />
                    </div>
                    {post.comments && post.comments.length > 0 ? (
                      <>
                        {/* First comment */}
                        <div className="mb-2 mt-2 flex gap-3 items-start">
                          <img
                            src={
                              post.comments[0].postedBy?.profileImg ||
                              "https://via.placeholder.com/40"
                            }
                            alt="comment user"
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-sm">
                              <span className="font-semibold mr-2">
                                {post.comments[0].postedBy?.username}
                              </span>
                              <span>{post.comments[0].text}</span>
                            </p>
                            <div className="flex items-center gap-4">
                              <p className="text-sm">
                                {getRelativeTime(post.comments[0].createdAt)}
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
                            <p className="text-gray-400 text-sm">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                          </>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-500 text-sm">No comments yet.</p>
                    )}
                  </div>

                  {/* Large screens: show all comments */}
                  <div className="hidden sm:block">
                    {post.comments && post.comments.length > 0 ? (
                      post.comments
                        .slice()
                        .reverse()
                        .map((comment, index) => (
                          <div
                            key={index}
                            className="mb-4 flex gap-3 items-start pb-2"
                          >
                            <img
                              src={
                                comment.postedBy?.profileImg ||
                                "https://via.placeholder.com/40"
                              }
                              alt="comment user"
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                              <p className="text-sm">
                                <span className="font-semibold mr-2">
                                  {comment.postedBy?.username}
                                </span>
                                <span>{comment.text}</span>
                              </p>
                              <div className="flex items-center gap-4">
                                <p className="text-sm text-gray-500">
                                  {getRelativeTime(comment.createdAt)}
                                </p>
                                <Icon.DotsHorizontal className="cursor-pointer" />
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <p className="text-gray-500 text-sm">No comments yet.</p>
                    )}
                  </div>
                </div>  
                <div>
                  <div className="hidden lg:flex items-center space-x-2 justify-between border-t border-gray-300">
                    <div className="flex items-center gap-4 mt-2">
                      <Icon.HeartOutline size={24} />
                      <Icon.Comment size={24} />
                    </div>
                    <Icon.Bookmark size={24} />
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
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 p-2 rounded-md focus:outline-none"
                    />
                    <button
                      onClick={() => handlePostComment(post._id)}
                      disabled={newComment.trim().length <= 1}
                      className={`ml-2 px-4 py-2 rounded-md cursor-pointer ${
                        newComment.trim().length > 1
                          ? "text-black"
                          : "cursor-not-allowed"
                      }`}
                    >
                      Post
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
          </div>,
          document.body
        )}
      {showAllComments &&
        ReactDOM.createPortal(
          <AllComments
            post={post}
            setShowAllComments={setShowAllComments}
            getRelativeTime={getRelativeTime}
          />,
          document.body
        )}
    </>
  );
};

export default Post;
