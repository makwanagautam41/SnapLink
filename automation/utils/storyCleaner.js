import cron from "node-cron";
import storyModel from "../models/storyModel.js";
import cloudinary from "../config/cloudinary.js";

const cleanExpiredStories = async () => {
  const now = new Date();
  const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const expiredStories = await storyModel.find({
    createdAt: { $lt: cutoff },
    isArchived: false,
  });

  for (const story of expiredStories) {
    try {
      await cloudinary.uploader.destroy(story.cloudinaryId, {
        resource_type: story.mediaType === "video" ? "video" : "image",
      });
      await storyModel.findByIdAndDelete(story._id);
      console.log(`✅ Deleted story ${story._id}`);
    } catch (err) {
      console.error(`❌ Error deleting story ${story._id}:`, err.message);
    }
  }
};

const startStoryCleaner = () => {
  cron.schedule("0 * * * *", () => {
    console.log("🧹 Cleaning expired stories...");
    cleanExpiredStories();
  });
};

export default startStoryCleaner;
