import storyModel from "../models/storyModel.js";
import userModel from "../models/userModel.js";
import cloudinary from "../config/cloudinary.js";

const uploadStory = async (req, res) => {
  try {
    const userId = req.userId;
    const { caption } = req.body;

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one media file is required." });
    }

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    const stories = [];

    for (const file of req.files) {
      const mediaType = file.mimetype.startsWith("video") ? "video" : "image";

      const newStory = new storyModel({
        mediaUrl: file.path,
        mediaType,
        cloudinaryId: file.filename,
        caption,
        postedBy: userId,
      });

      await newStory.save();
      stories.push(newStory);
    }

    res.status(201).json({
      message: "Story uploaded successfully!",
      stories,
    });
  } catch (err) {
    console.error("Error uploading story:", err);
    res.status(500).json({ error: "Server error during story upload." });
  }
};

const deleteStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.userId;

    const story = await storyModel.findById(storyId);
    if (!story) return res.status(404).json({ error: "Story not found." });

    if (story.postedBy.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this story." });
    }

    await cloudinary.uploader.destroy(story.cloudinaryId, {
      resource_type: story.mediaType === "video" ? "video" : "image",
    });

    await storyModel.findByIdAndDelete(storyId);

    res.status(200).json({ message: "Story deleted successfully." });
  } catch (err) {
    console.error("Error deleting story:", err);
    res.status(500).json({ error: "Server error during story deletion." });
  }
};

const getUserStory = async (req, res) => {
  try {
    const userId = req.userId;

    const stories = await storyModel
      .find({
        postedBy: userId,
        isArchived: false,
      })
      .populate("postedBy", "username profileImg")
      .populate("viewers", "username profileImg") // 👉 include viewers' info
      .sort({ createdAt: -1 });

    const user = await userModel.findById(userId).select("username profileImg");
    if (!user) return res.status(404).json({ message: "User not found" });

    const groupedStories = [
      {
        user: {
          _id: user._id,
          username: user.username,
          profileImg: user.profileImg,
        },
        stories: stories,
      },
    ];

    res.status(200).json({
      success: true,
      stories: groupedStories,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching story",
      error: err.message,
    });
  }
};

const fetchStories = async (req, res) => {
  try {
    const userId = req.userId;

    // Get the list of users the current user is following
    const user = await userModel.findById(userId).select("following");
    if (!user) return res.status(404).json({ message: "User not found" });

    const followingUserIds = user.following;

    // Fetch non-archived stories posted by those users
    const stories = await storyModel
      .find({
        postedBy: { $in: followingUserIds },
        isArchived: false,
      })
      .populate("postedBy", "username profileImg")
      .sort({ createdAt: -1 });

    // Group stories by each unique user
    const grouped = {};

    for (const story of stories) {
      const userId = story.postedBy._id;

      if (!grouped[userId]) {
        grouped[userId] = {
          user: {
            _id: story.postedBy._id,
            username: story.postedBy.username,
            profileImg: story.postedBy.profileImg,
          },
          stories: [],
        };
      }

      grouped[userId].stories.push(story);
    }

    // Convert the grouped object into an array
    const groupedStories = Object.values(grouped);

    res.status(200).json({
      success: true,
      stories: groupedStories,
    });
  } catch (err) {
    console.error("Error fetching grouped stories:", err);
    res.status(500).json({ message: "Server error while fetching stories" });
  }
};

const viewStory = async (req, res) => {
  try {
    const userId = req.userId;
    const storyId = req.params.storyId;

    const story = await storyModel
      .findById(storyId)
      .populate("postedBy", "profileVisibility followers");

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    const storyOwner = story.postedBy;

    if (storyOwner.profileVisibility === "private") {
      if (!storyOwner.followers.includes(userId)) {
        return res.status(403).json({
          message:
            "You cannot view this story because the account is private and you're not a follower",
        });
      }
    }

    if (!story.viewers.includes(userId)) {
      story.viewers.push(userId);
      await story.save();
    }

    res.status(200).json({
      message: "Story viewed successfully",
      story,
    });
  } catch (error) {
    console.error("Error viewing the story:", error);
    res
      .status(500)
      .json({ message: "An error occurred while viewing the story" });
  }
};

const archiveStory = async (req, res) => {
  try {
    const storyId = req.params.storyId;
    const userId = req.userId;

    const story = await storyModel.findById(storyId);

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    if (story.postedBy.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized access to delete the story" });
    }

    story.isArchived = true;
    await story.save();

    res.status(200).json({
      message: "Story archived successfully.",
      story,
    });
  } catch (err) {
    console.error("Archive Story Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export {
  uploadStory,
  deleteStory,
  getUserStory,
  fetchStories,
  viewStory,
  archiveStory,
};
