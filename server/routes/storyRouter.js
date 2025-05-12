import express from "express";
const storyRouter = express.Router();
import {
  uploadStory,
  deleteStory,
  getUserStory,
  fetchStories,
  viewStory,
  archiveStory,
} from "../controllers/storyController.js";
import authUser from "../middleware/auth.js";
import getUploadMiddleware from "../middleware/multer.js";

const storyUpload = getUploadMiddleware("stories");

storyRouter.post(
  "/upload",
  authUser,
  storyUpload.array("media", 5),
  uploadStory
);
storyRouter.delete("/delete/:storyId", authUser, deleteStory);
storyRouter.get("/my-story", authUser, getUserStory);
storyRouter.get("/fetch-stories", authUser, fetchStories);
storyRouter.get("/view/:storyId", authUser, viewStory);
storyRouter.put("/archive/:storyId", authUser, archiveStory);

export default storyRouter;
