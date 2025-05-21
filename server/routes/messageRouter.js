import express from "express";
import authUser from "../middleware/auth.js";
import {
  getMessageUsers,
  getMessages,
  markMessageAsSeen,
  sendMessage,
  deleteMessage,
  deleteChat,
} from "../controllers/messageController.js";
import getUploadMiddleware from "../middleware/multer.js";
const chatImageUpload = getUploadMiddleware("chatImages");

const messageRouter = express.Router();

messageRouter.get("/users-messages", authUser, getMessageUsers);
messageRouter.get("/:id", authUser, getMessages);
messageRouter.put("/mark/:id", authUser, markMessageAsSeen);
messageRouter.post(
  "/send/:id",
  authUser,
  chatImageUpload.array("images", 10),
  sendMessage
);
messageRouter.delete("/:id", authUser, deleteMessage);
messageRouter.delete("/delete-chat/:id", authUser, deleteChat);

export default messageRouter;
