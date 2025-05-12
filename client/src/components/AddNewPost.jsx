import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../utils/icons";
import { usePost } from "../context/PostContext";
import { useAuth } from "../context/AuthContext";
import ImageEditorModal from "../components/ImageEditorModal";
import toast from "react-hot-toast";
import CaptionModal from "../components/CaptionModal";
import useThemeStyles from "../utils/themeStyles";
import LoadingModal from "./LoadingModal";

const AddNewPost = ({ toggleCreateMenu, theme }) => {
  const { imageSrc, setImageSrc, showCropModal, setShowCropModal, AddNewPost } =
    usePost();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const styles = useThemeStyles();
  const navigate = useNavigate();
  const [croppedImage, setCroppedImage] = useState(null);
  const [uploadingPost, setUploadingPost] = useState(false);
  const [showCaptionModal, setShowCaptionModal] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const isSmallScreen = window.innerWidth <= 768;

      if (isSmallScreen || !isSmallScreen) {
        toast("Cropping enabled!", { icon: "✂️" });

        const reader = new FileReader();
        reader.onload = () => {
          setImageSrc(reader.result);
          setShowCropModal(true);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleBackToEdit = () => {
    setShowCaptionModal(false);
    setShowCropModal(true);
  };

  const handleSaveWithCaption = async (caption) => {
    try {
      setUploadingPost(true);
      const response = await AddNewPost(croppedImage, caption);

      if (response) {
        toast.success("Post uploaded successfully!");
        navigate(`/${user.username}`);
      } else {
        toast.error("Error while posting image!");
      }
    } catch (error) {
      console.error("Post upload error:", error);
      toast.error("Something went wrong while uploading the post!");
    } finally {
      setUploadingPost(false);
      setShowCaptionModal(false);
      toggleCreateMenu();
    }
  };

  if (uploadingPost) {
    return <LoadingModal text={"Uploading Post"} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50 bg-opacity-40">
      <div
        className={`rounded-xl shadow-2xl w-[400px] max-w-[90vw] relative flex flex-col items-center py-8 ${styles.bg}`}
      >
        <button
          className="absolute top-3 right-3 text-gray-400"
          onClick={() => {
            toggleCreateMenu();
          }}
        >
          <Icon.Close size={30} className="cursor-pointer" />
        </button>

        <h2 className="text-lg font-bold mb-6 text-center w-full border-b border-gray-400 pb-4">
          Create new post
        </h2>

        <div className="flex flex-col items-center justify-center flex-1 mb-6">
          <Icon.Post size={50} className="mb-4" />
          <p className="text-lg text-gray-500 mb-2 text-center">
            Select Your Photo
          </p>

          <label className="mt-2">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <span className="inline-block bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold px-6 py-2 rounded-lg cursor-pointer transition">
              Select from Device
            </span>
          </label>
        </div>
      </div>

      {showCropModal && imageSrc && (
        <ImageEditorModal
          theme={theme}
          imageSrc={imageSrc}
          onClose={() => {
            setShowCropModal(false);
            toggleCreateMenu();
          }}
          onSave={async (croppedImage) => {
            setCroppedImage(croppedImage);
            setShowCropModal(false);
            setShowCaptionModal(true);
          }}
        />
      )}

      {showCaptionModal && croppedImage && (
        <CaptionModal
          imageSrc={croppedImage}
          styles={styles}
          onClose={() => {
            setShowCaptionModal(false);
            toggleCreateMenu();
          }}
          onSave={handleSaveWithCaption}
          onBack={handleBackToEdit}
        />
      )}
    </div>
  );
};

export default AddNewPost;
