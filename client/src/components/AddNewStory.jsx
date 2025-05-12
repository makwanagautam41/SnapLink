import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../utils/icons";
import { useStory } from "../context/StoryContext";
import ImageEditorModal from "./ImageEditorModal";
import toast from "react-hot-toast";
import useThemeStyles from "../utils/themeStyles";
import LoadingModal from "./LoadingModal";

const AddNewStory = ({ onClose, theme }) => {
  const [mediaSrc, setMediaSrc] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [croppedMedia, setCroppedMedia] = useState(null);
  const [uploadingStory, setUploadingStory] = useState(false);
  const [mediaType, setMediaType] = useState("image");
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const styles = useThemeStyles();
  const navigate = useNavigate();
  const { fetchMyStories, uploadStory } = useStory();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const isSmallScreen = window.innerWidth <= 768;
      const type = file.type.startsWith("image/") ? "image" : "video";
      setSelectedFile(file);
      setMediaType(type);

      if (isSmallScreen || !isSmallScreen) {
        toast("Editing enabled!", { icon: "✂️" });

        const reader = new FileReader();
        reader.onload = () => {
          setMediaSrc(reader.result);
          setShowCropModal(true);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSaveStory = async () => {
    try {
      setUploadingStory(true);

      const response = await uploadStory({
        croppedMedia,
        selectedFile,
        caption,
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
              {/* <Icon.Image size={30} /> */}
              <span>Photo</span>
            </button>
            <button
              onClick={() => {
                setMediaType("video");
                fileInputRef.current.click();
              }}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg ${styles.hover} cursor-pointer`}
            >
              {/* <Icon.Video size={30} /> */}
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

          {showCropModal && (
            <div className="w-full mt-4">
              <textarea
                placeholder="Add a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className={`w-full p-2 rounded-lg border ${styles.input}`}
                rows={3}
              />
            </div>
          )}
        </div>
      </div>

      {showCropModal && mediaSrc && (
        <ImageEditorModal
          theme={theme}
          imageSrc={mediaSrc}
          type={mediaType}
          onClose={() => {
            setShowCropModal(false);
            onClose();
          }}
          onSave={async (editedMedia) => {
            setCroppedMedia(editedMedia);
            setShowCropModal(false);
            await handleSaveStory();
          }}
        />
      )}
    </div>
  );
};

export default AddNewStory;
