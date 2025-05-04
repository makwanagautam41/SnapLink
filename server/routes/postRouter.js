import express from "express";
const postRouter = express.Router();
import {
  createPost,
  getUserPosts,
  getSinglePost,
  getAllPublicPosts,
  getFollowedUserPosts,
  likePost,
  commentOnPost,
  deletePost,
  updatePost,
  deleteComment,
  savePost,
  getSearchedUserPost,
} from "../controllers/postController.js";
import authUser from "../middleware/auth.js";
import getUploadMiddleware from "../middleware/multer.js";
const postUpload = getUploadMiddleware("posts");

postRouter.post(
  "/create",
  authUser,
  postUpload.array("images", 10),
  createPost
);
postRouter.get("/my-posts", authUser, getUserPosts);
postRouter.get("/feed", authUser, getFollowedUserPosts);
postRouter.get("/explore", authUser, getAllPublicPosts);
postRouter.post("/:postId/like", authUser, likePost);
postRouter.post("/:postId/comment", authUser, commentOnPost);
postRouter.delete("/:postId/comment/:commentId", authUser, deleteComment);
postRouter.delete("/:postId", authUser, deletePost);
postRouter.put("/:postId", authUser, updatePost);
postRouter.put("/:postId/save", authUser, savePost);
postRouter.get("/searched-user/:username", authUser, getSearchedUserPost);
postRouter.get("/:postId", authUser, getSinglePost);

export default postRouter;
