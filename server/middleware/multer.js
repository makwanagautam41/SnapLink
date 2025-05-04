import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const getUploadMiddleware = (folderType = "general") => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      const userId = req.userId || "unknown-user";
      const baseFolder = "SnapLinkUsers";
      const folder = `${baseFolder}/${userId}/${folderType}`;

      const isVideo = file.mimetype.startsWith("video");

      return {
        folder: folder,
        allowed_formats: ["jpg", "jpeg", "png", "mp4", "webm"],
        public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
        resource_type: isVideo ? "video" : "image",
      };
    },
  });

  return multer({ storage });
};

export default getUploadMiddleware;
