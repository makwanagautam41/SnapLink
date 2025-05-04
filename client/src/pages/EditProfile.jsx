import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import PostTopBar from "../components/PostTopBar";
import { useAuth } from "../context/AuthContext";
import { usePost } from "../context/PostContext";
import { Icon } from "../utils/icons.js";
import { toast } from "react-hot-toast";
import ImageEditorModal from "../components/ImageEditorModal";
import useThemeStyles from "../utils/themeStyles.js";

const EditProfile = () => {
  const { user, updateProfileData, changeProfileImage } = useAuth();
  const {
    showModal,
    setShowModal,
    imageSrc,
    setImageSrc,
    showCropModal,
    setShowCropModal,
  } = usePost();
  const fileInputRef = useRef(null);
  const styles = useThemeStyles();
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isToggled, setIsToggled] = useState(false);
  const [bio, setBio] = useState(user?.bio || "");
  const [gender, setGender] = useState(user?.gender);

  const toggleDropdown = () => setIsGenderOpen(!isGenderOpen);
  const handleSelection = (value) => {
    setGender(value);
    setIsGenderOpen(false);
  };
  const handleToggle = () => setIsToggled(!isToggled);

  const isChanged = bio !== (user?.bio || "") || gender !== user?.gender;

  const handleSubmit = async () => {
    try {
      const profileData = { bio, gender };
      const response = await updateProfileData(profileData);

      if (response?.success) {
        toast.success("Profile Updated Successfully!");
      } else {
        toast.error(response?.message || "Error while updating profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Something went wrong.");
    }
  };

  // Image cropping
  const changeImage = () => {
    fileInputRef.current.click();
  };
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const isSmallScreen = window.innerWidth <= 768;

      if (isSmallScreen) {
        toast("Cropping enabled!", { icon: "✂️" });

        const reader = new FileReader();
        reader.onload = () => {
          setImageSrc(reader.result);
          setShowCropModal(true);
        };
        reader.readAsDataURL(file);
      } else {
        toast("Uploading image directly!", { icon: "🚀" });

        const response = await changeProfileImage(file);
        if (response) {
          toast.success("Profile Updated Successfully!");
        } else {
          toast.error("Error While Updating Profile Image!");
        }
      }
    }
  };

  const formatGender = (g) =>
    g ? g.charAt(0).toUpperCase() + g.slice(1) : "Select Gender";

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Icon.Loader className="animate-spin text-gray-700 w-8 h-8" />
      </div>
    );
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {showCropModal && imageSrc && (
        <ImageEditorModal
          imageSrc={imageSrc}
          onClose={() => setShowCropModal(false)}
          onSave={async (croppedImage) => {
            const response = await changeProfileImage(croppedImage);
            if (response) {
              toast.success("Profile Updated Successfully!");
            } else {
              toast.error("Error While Updating Profile Image!");
            }
            setShowCropModal(false);
          }}
        />
      )}

      <PostTopBar title="Edit Profile" />

      <div className="p-2 h-[calc(100vh-80px)] overflow-y-auto">
        <div className={`rounded-3xl p-4 flex gap-4 ${styles.bg2}`}>
          <img
            src={user.profileImg}
            alt="profile"
            className="object-cover h-20 w-20 rounded-full"
          />
          <div className="flex flex-col justify-center">
            <Link to={`/${user.username}`}>
              <p className="font-bold">{user.username}</p>
            </Link>
            <p
              onClick={changeImage}
              className="text-blue-500 cursor-pointer hover:underline"
            >
              Change Photo
            </p>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mt-4">
          <b>Bio</b>
          <div className="mt-2 relative">
            <textarea
              className={`text-sm outline-none border border-gray-400 w-full rounded-3xl p-3 resize-none pr-10 pb-8 ${styles.bg}`}
              rows="4"
              value={bio}
              maxLength={60}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write your bio..."
            />
            <span className="absolute bottom-3 right-4 text-xs text-gray-400">
              {bio.length}/60
            </span>
          </div>
        </div>

        {/* Gender Section */}
        <div className="mt-6">
          <b>Gender</b>
          <div className="relative mt-2">
            <button
              className={`flex items-center justify-between w-full border border-gray-300  text-sm rounded-3xl pl-4 pr-10 py-3 text-left ${styles.bg}`}
              onClick={toggleDropdown}
            >
              {formatGender(gender)}
              <Icon.ArrowDown />
            </button>
            {isGenderOpen && (
              <ul className="absolute w-full z-50 border border-gray-300 rounded-3xl mt-2 overflow-hidden">
                {["male", "female", "other"].map((g) => (
                  <li
                    key={g}
                    className={`px-4 py-2 cursor-pointer ${styles.bg}`}
                    onClick={() => handleSelection(g)}
                  >
                    {formatGender(g)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Suggestions Toggle */}
        <div className="relative mt-6">
          <b>Show account suggestions on profiles</b>
          <div className="flex border border-gray-300 p-4 rounded-3xl items-center justify-between mt-2">
            <div>
              <h4 className="text-sm">Show account suggestions on profiles</h4>
              <p className="text-xs text-gray-600">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              </p>
            </div>
            <div onClick={handleToggle} className="cursor-pointer">
              {isToggled ? (
                <Icon.toggleOn size={40} />
              ) : (
                <Icon.toggleOn size={40} className="rotate-180" />
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!isChanged}
          className={`p-3 mt-6 mb-6 lg:mb-0 w-full rounded-3xl transition ${
            isChanged
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default EditProfile;
