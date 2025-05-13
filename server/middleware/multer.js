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
        ...(isVideo && {
          chunk_size: 6000000, // 6MB chunks
          resource_type: "video",
          eager: [
            { 
              format: "mp4", 
              quality: "auto",
              bit_rate: "1000k" // Limit video bitrate
            }
          ],
          eager_async: true
        })
      };
    },
  });

  // Adjust limits for Vercel's serverless environment
  const limits = {
    fileSize: 25 * 1024 * 1024, // 25MB limit (reduced from 50MB for Vercel)
    files: 5 // Maximum number of files
  };

  return multer({ 
    storage,
    limits,
    fileFilter: (req, file, cb) => {
      // Accept images and videos
      if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
      }
    }
  });
};

export default getUploadMiddleware;
