import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const commentSchema = new mongoose.Schema(
  {
    commentId: {
      type: String,
      default: () => uuidv4(),
    },
    text: {
      type: String,
      required: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    caption: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    postVisibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    comments: [commentSchema],
  },
  { timestamps: true }
);

const postModel = mongoose.models.Post || mongoose.model("Post", postSchema);
export default postModel;
