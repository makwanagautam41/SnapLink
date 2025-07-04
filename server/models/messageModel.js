import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    images: [
      {
        url: String,
        public_id: String,
      },
    ],
    seen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const messageModal = mongoose.model("Message", messageSchema);

export default messageModal;
