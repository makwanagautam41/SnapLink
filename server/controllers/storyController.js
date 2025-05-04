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
    const story = await storyModel
      .find({ postedBy: userId })
      .populate("postedBy", "username profileImg")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, story });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching story",
      error: err.message,
    });
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

export { uploadStory, deleteStory, getUserStory, viewStory, archiveStory };
