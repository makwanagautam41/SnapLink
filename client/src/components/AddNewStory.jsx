import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../utils/icons";
import { useStory } from "../context/StoryContext";
import toast from "react-hot-toast";
import useThemeStyles from "../utils/themeStyles";
import LoadingModal from "./LoadingModal";

const AddNewStory = ({ onClose, theme }) => {
  const [uploadingStory, setUploadingStory] = useState(false);
  const [mediaType, setMediaType] = useState("image");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);
  const styles = useThemeStyles();
  const navigate = useNavigate();
  const { fetchMyStories, uploadStory } = useStory();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const type = file.type.startsWith("image/") ? "image" : "video";
      const maxSizeMB = 10;
      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      if (type === "video" && file.size > maxSizeBytes) {
        toast(
          "This video is too large. It may take a long time or fail to upload.",
          {
            icon: "⚠️",
          }
        );
      }

      setSelectedFile(file);
      setMediaType(type);

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setShowPreview(true);
    }
  };

  const handleSaveStory = async () => {
    try {
      setUploadingStory(true);

      const response = await uploadStory({
        selectedFile,
      });

      if (response.message === "Story uploaded successfully!") {
        toast.success("Story uploaded successfully!");
        navigate(`/`);
        fetchMyStories();
      } else {
        toast.error("Error while uploading story!");
      }
    } catch (error) {
      console.error("Story upload error:", error);
      toast.error(
        error.response?.data?.error ||
          "Something went wrong while uploading the story!"
      );
    } finally {
      setUploadingStory(false);
      onClose();
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  if (uploadingStory) {
    return <LoadingModal text={"Uploading Story"} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50 bg-opacity-40">
      <div
        className={`rounded-xl shadow-2xl w-[400px] max-w-[90vw] relative flex flex-col items-center py-8 ${styles.bg}`}
      >
        <button
          className="absolute top-3 right-3 text-gray-400"
          onClick={onClose}
        >
          <Icon.Close size={30} className="cursor-pointer" />
        </button>

        <h2 className="text-lg font-bold mb-6 text-center w-full border-b border-gray-400 pb-4">
          Create new story
        </h2>

        <div className="flex flex-col items-center justify-center flex-1 mb-6">
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => {
                setMediaType("image");
                fileInputRef.current.click();
              }}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg ${styles.hover} cursor-pointer`}
            >
              <span>Photo</span>
            </button>
            <button
              onClick={() => {
                setMediaType("video");
                fileInputRef.current.click();
              }}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg ${styles.hover} cursor-pointer`}
            >
              <span>Video</span>
            </button>
          </div>

          <input
            type="file"
            accept={mediaType === "image" ? "image/*" : "video/*"}
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && previewUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center backdrop-brightness-50 bg-opacity-40">
          <div
            className={`rounded-xl shadow-2xl w-[400px] max-w-[90vw] relative flex flex-col items-center py-8 ${styles.bg}`}
          >
            <button
              className="absolute top-3 right-3 text-gray-400"
              onClick={handleClosePreview}
            >
              <Icon.Close size={30} className="cursor-pointer" />
            </button>

            <h2 className="text-lg font-bold mb-6 text-center w-full border-b border-gray-400 pb-4">
              Preview Story
            </h2>

            <div className="w-full max-h-[400px] overflow-hidden rounded-lg mb-4">
              {mediaType === "image" ? (
                <img
                  src={previewUrl}
                  alt="Story preview"
                  className="w-full h-full object-contain"
                />
              ) : (
                <video
                  src={previewUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            <div className="flex gap-4 w-full px-4">
              <button
                onClick={handleClosePreview}
                className={`px-4 py-2 rounded-lg bg-blue-500 cursor-pointer flex-1`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStory}
                className={`px-4 py-2 rounded-lg bg-blue-500 cursor-pointer flex-1`}
              >
                Upload Story
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddNewStory;
