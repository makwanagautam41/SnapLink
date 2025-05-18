import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { useAuth } from "../context/AuthContext";
import { usePost } from "../context/PostContext";
import { Icon } from "../utils/icons.js";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LoadingModal from "../components/LoadingModal";
import useThemeStyles from "../utils/themeStyles.js";
import UserProfileDetails from "../components/UserProfileDetails";
import Avtar from "../components/Avtar";
import ImageEditorModal from "../components/ImageEditorModal";
import { useTheme } from "../context/ThemeContext";

const Profile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const styles = useThemeStyles();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [filterType, setFilterType] = useState("myposts");
  const {
    user,
    token,
    getLoggedInUserInfor,
    changeProfileImage,
    removeProfileImg,
  } = useAuth();
  const {
    posts,
    loadingPosts,
    fetchUserPosts,
    // image croping
    showModal,
    setShowModal,
    imageSrc,
    setImageSrc,
    showCropModal,
    setShowCropModal,
  } = usePost();

  const fileInputRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    getLoggedInUserInfor();
    const timer = setTimeout(() => {
      if (token) {
        fetchUserPosts();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [token]);

  useEffect(() => {
    const isFullScreen = window.innerWidth <= 768;
    if (showModal && isFullScreen && user) {
      setShowCropModal(false);
      navigate(`/${user.username}`);
    }
  }, [showModal, navigate, user]);

  const filteredPosts = filterType === "saved" ? user.savedPosts || [] : posts;

  const handleImageClick = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const changeImage = () => {
    fileInputRef.current.click();
    closeModal();
  };

  const removeImage = async () => {
    setUploadingImage(true);
    const response = await removeProfileImg();
    if (response) {
      setUploadingImage(false);
      toast.success("Profile Removed Successfully!");
    } else {
      toast.error("Error While Removing Profile!");
    }
    closeModal();
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
        setUploadingImage(true);
        toast("Uploading image directly!", { icon: "🚀" });

        const response = await changeProfileImage(file);
        setUploadingImage(false);

        if (response) {
          toast.success("Profile Updated Successfully!");
        } else {
          toast.error("Error While Updating Profile Image!");
        }
      }
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Icon.Loader className="animate-spin text-gray-500 w-8 h-8" />
      </div>
    );
  }

  if (uploadingImage) {
    return <LoadingModal text={"Uploading Profile"} />;
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Top bar for small screens */}
      <div
        className={`sm:hidden sticky top-0 z-50 flex items-center justify-between px-4 py-3 shadow-md ${
          theme === "light"
            ? "shadow-md"
            : "shadow-[0_4px_6px_-1px_rgba(255,255,255,0.1)]"
        } ${styles.bg}
        }`}
      >
        <Link to={"/settings"}>
          <Icon.Setting size={22} className="cursor-pointer" />
        </Link>
        <div className="flex items-center gap-1">
          <span className="text-base font-semibold">{user.username}</span>
          <Icon.ArrowDown className="text-sm cursor-pointer" />
        </div>
        <div className="flex gap-2">
          <Icon.DotsHorizontal
            size={22}
            className="cursor-pointer"
            style={{ visibility: "hidden" }}
          />
        </div>
      </div>

      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8 lg:gap-10 pb-4">
        <Avtar
          profileImg={user.profileImg}
          handleImageClick={handleImageClick}
        />
        <UserProfileDetails
          posts={user.postCount}
          username={user.username}
          name={user.name}
          followers={user.followers.length}
          following={user.following.length}
          bio={user.bio}
          isCurrentUser={true}
          styles={styles}
        />
      </div>
      <div className="flex justify-center gap-4 mt-4 mb-6">
        <button
          onClick={() => setFilterType("myposts")}
          className={`px-4 py-2 rounded font-semibold ${
            filterType === "myposts"
              ? "bg-blue-500 text-white"
              : `${styles.bg} text-gray-500`
          }`}
        >
          My Posts
        </button>
        <button
          onClick={() => setFilterType("saved")}
          className={`px-4 py-2 rounded font-semibold ${
            filterType === "saved"
              ? "bg-blue-500 text-white"
              : `${styles.bg} text-gray-500`
          }`}
        >
          Saved
        </button>
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {/* Change Profile Modal */}
      {showModal &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 backdrop-brightness-50 flex items-center justify-center z-[9999]">
            <div
              className={`rounded-lg shadow-lg w-80 p-6 space-y-4 text-center ${styles.bg}`}
            >
              <h2 className="text-lg font-semibold">Change Profile Image</h2>
              <button
                onClick={changeImage}
                className={`w-full py-2 text-blue-600 font-medium rounded ${
                  theme === "light"
                    ? "bg-white hover:bg-gray-200"
                    : "hover:bg-gray-700"
                }`}
              >
                Upload Image
              </button>
              <button
                onClick={removeImage}
                className={`w-full py-2 text-red-600 font-medium rounded ${
                  theme === "light"
                    ? "bg-white hover:bg-gray-200"
                    : "hover:bg-gray-700"
                }`}
              >
                Remove Current Image
              </button>
              <button
                onClick={closeModal}
                className={`w-full py-2 text-gray-700 font-medium rounded ${
                  theme === "light"
                    ? "bg-white hover:bg-gray-200"
                    : "hover:bg-gray-700 text-white"
                }`}
              >
                Cancel
              </button>
            </div>
          </div>,
          document.body
        )}

      {/* Posts grid */}
      <div className="grid grid-cols-3 gap-1 mb-12">
        {loadingPosts ? (
          <div className="col-span-full text-center text-gray-500">
            Loading posts...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="col-span-full text-center text-gray-500">
            {filterType === "saved" ? "No saved posts yet." : "No posts yet."}
          </div>
        ) : (
          filteredPosts.map((post) => (
            <Link
              to={`/${user.username}/post/${post._id}`}
              state={{ backgroundLocation: location }}
              key={post._id}
            >
              <div className="overflow-hidden cursor-pointer">
                <img
                  src={
                    post.images[0]?.url ||
                    "https://res.cloudinary.com/djbqtwzyf/image/upload/v1744042607/default_img_gszetk.png"
                  }
                  alt="Post"
                  className="object-cover w-full aspect-16/21 transition-all duration-200 ease-in-out hover:brightness-50"
                />
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Crop Modal */}
      {showCropModal && imageSrc && (
        <ImageEditorModal
          theme={theme}
          imageSrc={imageSrc}
          onClose={() => setShowCropModal(false)}
          onSave={async (croppedImage) => {
            setUploadingImage(true);
            const response = await changeProfileImage(croppedImage);
            setUploadingImage(false);
            if (response) {
              toast.success("Profile Updated Successfully!");
            } else {
              toast.error("Error While Updating Profile Image!");
            }
            setShowCropModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Profile;
