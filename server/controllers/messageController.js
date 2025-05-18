import userModal from "../models/userModel.js";
import messageModal from "../models/messageModel.js";
import { io, userSocketMap } from "../server.js";

export const getMessageUsers = async (req, res) => {
  try {
    const userId = req.userId;

    const currentUser = await userModal.findById(userId).select("following");

    if (!currentUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const filteredUsers = await userModal
      .find({ _id: { $in: currentUser.following } })
      .select("-password");

    const unSeenMessages = {};
    const promises = filteredUsers.map(async (user) => {
      const messages = await messageModal.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });
      if (messages.length > 0) {
        unSeenMessages[user._id] = messages.length;
      }
    });
    await Promise.all(promises);

    res.json({ success: true, unSeenMessages, users: filteredUsers });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.userId;

    const messages = await messageModal.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    });

    await messageModal.updateMany(
      { senderId: selectedUserId, receiverId: myId },
      { seen: true }
    );

    res.json({ succes: true, messages });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    await messageModal.updateMany(id, { seen: true });
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const receiverId = req.params.id;
    const senderId = req.userId;

    const newMessage = await messageModal.create({
      senderId,
      receiverId,
      text,
    });

    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.json({ success: true, newMessage });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
