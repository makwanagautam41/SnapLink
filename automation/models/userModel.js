import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    email: { type: String, required: true, unique: true, index: true },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other"],
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    profileImg: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    closeFriends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    profileVisibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    deactivationInfo: {
      isDeactivated: {
        type: Boolean,
        default: false,
      },
      message: {
        type: String,
        default: "",
      },
    },
    savedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    otp: {
      type: String,
      default: "",
    },
    otpExpiresAt: {
      type: Number,
      default: 0,
    },
    recentSearches: [
      {
        username: {
          type: String,
          required: true,
        },
      },
    ],
    deletionSchedule: {
      isScheduled: {
        type: Boolean,
        default: false,
      },
      scheduledAt: {
        type: Date,
        default: null,
      },
    },
    notifications: [
      {
        from: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        post: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Post",
          default: null,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { minimize: false }
);

const userModel = mongoose.models.user || mongoose.model("User", userSchema);

export default userModel;
