import express from "express";
import authUser from "../middleware/auth.js";
import {
  getMessageUsers,
  getMessages,
  markMessageAsSeen,
  sendMessage,
} from "../controllers/messageController.js";
const messageRouter = express.Router();

messageRouter.get("/users-messages", authUser, getMessageUsers);
messageRouter.get("/:id", authUser, getMessages);
messageRouter.put("/mark/:id", authUser, markMessageAsSeen);
messageRouter.post("/send/:id", authUser, sendMessage);

export default messageRouter;
