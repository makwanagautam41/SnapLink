import userModal from "../models/userModel.js";
import messageModal from "../models/messageModel.js";
import { io, userSocketMap } from "../server.js";
import { v2 as cloudinary } from "cloudinary";

export const getMessageUsers = async (req, res) => {
  try {
    const userId = req.userId;

    const currentUser = await userModal
      .findById(userId)
      .select("following followers");

    if (!currentUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const contactIds = [
      ...new Set([
        ...currentUser.following.map((id) => id.toString()),
        ...currentUser.followers.map((id) => id.toString()),
      ]),
    ];

    const contacts = await userModal
      .find({ _id: { $in: contactIds } })
      .select("-password");

    const unSeenMessages = {};
    const enrichedUsers = await Promise.all(
      contacts.map(async (user) => {
        const unseen = await messageModal.countDocuments({
          senderId: user._id,
          receiverId: userId,
          seen: false,
        });
        if (unseen > 0) {
          unSeenMessages[user._id] = unseen;
        }

        const lastMessageDoc = await messageModal
          .findOne({
            $or: [
              { senderId: user._id, receiverId: userId },
              { senderId: userId, receiverId: user._id },
            ],
          })
          .sort({ createdAt: -1 });

        return {
          ...user.toObject(),
          lastMessage: lastMessageDoc?.text || "",
          lastMessageTime: lastMessageDoc?.createdAt || null,
        };
      })
    );

    res.json({ success: true, unSeenMessages, users: enrichedUsers });
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

    res.json({ success: true, messages });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    await messageModal.updateMany(
      { senderId: id, receiverId: req.userId, seen: false },
      { seen: true }
    );
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text = "" } = req.body;
    const receiverId = req.params.id;
    const senderId = req.userId;

    const imagePaths = Array.isArray(req.files)
      ? req.files.map((file) => ({
          url: file.path,
          public_id: file.filename,
        }))
      : [];

    if (!text.trim() && imagePaths.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message must contain text or at least one image.",
      });
    }

    const newMessage = await messageModal.create({
      senderId,
      receiverId,
      text: text.trim(),
      images: imagePaths,
    });

    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.json({ success: true, newMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.userId;

    const message = await messageModal.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (
      message.senderId.toString() !== userId &&
      message.receiverId.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this message",
      });
    }

    const imageDeletions = message.images.map((img) => {
      if (img.public_id) {
        return cloudinary.uploader.destroy(img.public_id);
      }
    });
    await Promise.all(imageDeletions);

    await messageModal.findByIdAndDelete(messageId);

    const receiverId =
      message.senderId.toString() === userId
        ? message.receiverId.toString()
        : message.senderId.toString();

    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", messageId);
    }

    res.json({
      success: true,
      message: "Message and associated images deleted successfully",
      messageId,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const userId = req.userId;
    const { id: otherUserId } = req.params;

    await messageModal.deleteMany({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    });

    // const receiverSocketId = userSocketMap[otherUserId];
    // if (receiverSocketId) {
    //   io.to(receiverSocketId).emit("chatDeleted", {
    //     deletedBy: userId,
    //     userId: otherUserId,
    //   });
    // }

    res.json({ success: true, message: "Chat deleted successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
