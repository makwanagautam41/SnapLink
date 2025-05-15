import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import Feed from "../components/Feed";
import useThemeStyles from "../utils/themeStyles";
import Modal from "../components/Modal";
import PostTopBar from "../components/PostTopBar";
import { useAuth } from "../context/AuthContext";
import { Icon } from "../utils/icons";
import toast from "react-hot-toast";
import ImageEditorModal from "../components/ImageEditorModal";
import { usePost } from "../context/PostContext";
import { useTheme } from "../context/ThemeContext";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Home = () => {
  const slideVariants = {
    initial: { opacity: 0, x: 50 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { opacity: 0, x: -50, transition: { duration: 0.2, ease: "easeIn" } },
  };

  const styles = useThemeStyles();
  const {
    user,
    changeProfileImage,
    changeDateOfBirth,
    updateProfileData,
    changeProfileVisibility,
    error,
    setError,
  } = useAuth();
  const {
    setShowModal,
    imageSrc,
    setImageSrc,
    showCropModal,
    setShowCropModal,
  } = usePost();
  const { theme, toggleTheme } = useTheme();

  const [showSetupPopup, setShowSetupPopup] = useState(false);
  const [loading, setLoading] = useState({ status: false, method: "" });
  const [profileImgUpdated, setProfileImgUpdated] = useState(false);
  const [selectedDOB, setSelectedDOB] = useState("");
  const [dateOfBirthUpdate, setDateOfBirthUpdated] = useState(false);
  const [bio, setBio] = useState(user?.bio || "");
  const [bioUpdated, setBioUpdated] = useState(false);
  const [showDiv, setShowdiv] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const fileInputRef = useRef(null);

  const closeModal = () => setShowModal(false);

  const triggerFileInput = () => {
    fileInputRef.current.click();
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
        setLoading({ status: true, method: "uploadingProfileImg" });
        toast("Uploading image directly!", { icon: "🚀" });

        const result = await changeProfileImage(file);
        setLoading({ status: false, method: "" });

        if (result?.success) {
          toast.success("Profile image updated successfully");
          setError("");
          setProfileImgUpdated(true);
        } else {
          setError("Error While Updating Profile Image!");
        }
      }
    }
  };

  const handleDateOfBirthChange = async () => {
    if (!selectedDOB) {
      setError("Please select a date of birth.");
      return;
    }

    const isValidDate = !isNaN(new Date(selectedDOB).getTime());
    if (!isValidDate) {
      setError("Invalid date format.");
      return;
    }
    setLoading({ status: true, method: "dateOfBithUpdating" });
    const response = await changeDateOfBirth(selectedDOB);
    if (response?.success) {
      setLoading({ status: false, method: "" });
      toast.success("Date of birth updated successfully");
      setError("");
      setDateOfBirthUpdated(true);
    } else {
      setError(response?.message || "Failed to update DOB");
    }
  };

  const handleBioUpdate = async () => {
    if (!bio.trim()) {
      setError("Bio cannot be empty.");
      return;
    }
    setLoading({ status: true, method: "updatingBio" });
    const response = await updateProfileData({ bio });
    if (response?.success) {
      setLoading({ status: false, method: "" });
      toast.success("Bio updated successfully!");
      setError("");
      setBioUpdated(true);
    } else {
      setError(response?.message || "Failed to update bio");
    }
  };

  const handleToggle = () => {
    const newState = !isPrivate;

    if (newState) {
      setModalMessage(
        "Your account is now private. Only approved followers can see your posts and profile details."
      );
    } else {
      setModalMessage(
        "Your account is now public. Anyone can view your posts and profile details."
      );
    }
    setShowVisibilityModal(true);
  };

  const handleConfirmVisibilityChange = async () => {
    try {
      setLoading({ status: true, method: "updatingProfileVisibility" });
      await changeProfileVisibility();
      setIsPrivate((prev) => !prev);
    } catch (error) {
      console.error("Failed to change profile visibility:", error);
    } finally {
      setLoading({ status: false, method: "" });
      setShowVisibilityModal(false);
    }
  };
  const handleCloseModal = () => {
    setShowVisibilityModal(false);
  };

  useEffect(() => {
    if (user?.dateOfBirth) {
      setSelectedDOB(new Date(user.dateOfBirth).toISOString().split("T")[0]);
    }
    if (user?.profileVisibility === "private") {
      setIsPrivate(true);
    } else {
      setIsPrivate(false);
    }
  }, [user]);

  useEffect(() => {
    const isNewUser = localStorage.getItem("isNewUser");
    if (isNewUser === "true") {
      setShowSetupPopup(true);
      localStorage.removeItem("isNewUser");
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
        {showSetupPopup && (
          <Modal onClose={() => setShowSetupPopup(false)}>
            <div className="overflow-hidden max-h-[100vh]">
              <div className="p-2">
                <h2 className="text-xl">Setup Profile</h2>
              </div>

              <p className="text-xs">
                *You’ll be able to change everything later from the settings.
              </p>

              <AnimatePresence mode="wait">
                {showDiv && showSetupPopup && (
                  <motion.div
                    key="setupStep1"
                    variants={slideVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-6 overflow-y-auto max-h-[calc(100vh-64px)]"
                  >
                    <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-64px)]">
                      {/* Profile Image Section */}
                      <div
                        className={`rounded-xl p-4 transition-all hover:shadow-md ${
                          styles.bg3
                        } ${theme == "dark" ? "border border-gray-50" : ""}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {profileImgUpdated && (
                              <Icon.Checked
                                size={20}
                                className="text-green-500"
                              />
                            )}
                            <div className="flex items-center gap-3">
                              <div className="relative h-14 w-14">
                                <img
                                  src={user?.profileImg}
                                  alt={user?.username}
                                  className="h-14 w-14 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm"
                                />
                                {loading.status &&
                                  loading.method === "uploadingProfileImg" && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                                      <Icon.Loader
                                        className="animate-spin text-white"
                                        size={20}
                                      />
                                    </div>
                                  )}
                              </div>
                              <div>
                                <p className="font-medium">{user?.name}</p>
                                <p className="text-sm text-gray-500">
                                  @{user?.username}
                                </p>
                              </div>
                            </div>
                          </div>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                          />
                          <button
                            onClick={triggerFileInput}
                            className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition flex items-center justify-center"
                            disabled={
                              loading.status &&
                              loading.method === "uploadingProfileImg"
                            }
                          >
                            {loading.status &&
                            loading.method === "uploadingProfileImg" ? (
                              <Icon.Loader className="animate-spin" size={16} />
                            ) : (
                              "Change Photo"
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Date of Birth Section */}
                      <div
                        className={`rounded-xl p-4 transition-all hover:shadow-md ${
                          styles.bg3
                        } ${theme == "dark" ? "border border-gray-50" : ""}`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            {dateOfBirthUpdate && (
                              <Icon.Checked
                                size={20}
                                className="text-green-500"
                              />
                            )}
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                Date of Birth
                              </span>
                              <span className="text-sm text-gray-500">
                                {user?.dateOfBirth
                                  ? new Date(
                                      user.dateOfBirth
                                    ).toLocaleDateString(undefined, {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })
                                  : "Not set"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 w-full md:w-auto">
                            <input
                              type="date"
                              value={selectedDOB}
                              onChange={(e) => setSelectedDOB(e.target.value)}
                              className="border border-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-auto"
                            />
                            <button
                              onClick={handleDateOfBirthChange}
                              className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition flex items-center justify-center"
                              disabled={
                                !selectedDOB ||
                                (loading.status &&
                                  loading.method === "dateOfBirthUpdating")
                              }
                            >
                              {loading.status &&
                              loading.method === "dateOfBirthUpdating" ? (
                                <Icon.Loader
                                  className="animate-spin"
                                  size={16}
                                />
                              ) : (
                                "Update"
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Bio Section */}
                      <div
                        className={`rounded-xl p-4 transition-all hover:shadow-md ${
                          styles.bg3
                        } ${theme == "dark" ? "border border-gray-50" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-3">
                                {bioUpdated && (
                                  <Icon.Checked
                                    size={20}
                                    className="text-green-500"
                                  />
                                )}
                                <p className="text-sm font-medium">Bio</p>
                              </div>
                              <button
                                onClick={handleBioUpdate}
                                className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition flex items-center justify-center"
                                disabled={
                                  loading.status &&
                                  loading.method === "updatingBio"
                                }
                              >
                                {loading.status &&
                                loading.method === "updatingBio" ? (
                                  <Icon.Loader
                                    className="animate-spin"
                                    size={16}
                                  />
                                ) : (
                                  "Update"
                                )}
                              </button>
                            </div>
                            <textarea
                              value={bio}
                              onChange={(e) => setBio(e.target.value)}
                              placeholder="Write your bio here..."
                              className={`text-sm outline-none border border-gray-200 p-3 rounded-lg w-full resize-none focus:ring-2 focus:ring-blue-500 ${
                                theme === "light" ? "bg-white" : ""
                              }`}
                              rows={4}
                            />
                            <p className="text-xs text-gray-500 mt-1 text-right">
                              {bio.length}/160 characters
                            </p>
                          </div>
                        </div>
                      </div>
                      {error && (
                        <p className="mt-2 text-sm text-red-500">{error}</p>
                      )}
                      <div className="flex justify-end">
                        <button
                          className="cursor-pointer"
                          onClick={() => setShowdiv(false)}
                        >
                          <Icon.ArrowRight size={28} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {!showDiv && (
                  <motion.div
                    key="setupStep2"
                    variants={slideVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-6 overflow-y-auto max-h-[calc(100vh-64px)]"
                  >
                    <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-64px)]">
                      {/* profile visibility */}
                      <div className="rounded-xl p-4 transition-all hover:shadow-md">
                        <div
                          className="flex items-center justify-between rounded-2xl border border-gray-300 p-4 sm:p-6 shadow-sm cursor-pointer"
                          onClick={handleToggle}
                        >
                          <p className="text-base sm:text-lg font-medium">
                            {isPrivate ? "Private" : "Public"} Account
                          </p>
                          <Icon.toggleOn
                            size={30}
                            className={
                              !isPrivate ? "rotate-180 text-gray-400" : ""
                            }
                          />
                        </div>
                        {showVisibilityModal && (
                          <Modal onClose={handleCloseModal} styles={styles}>
                            <div className="p-4">
                              <h2 className="text-lg font-semibold mb-2">
                                Privacy Update
                              </h2>
                              <p className="mb-4">{modalMessage}</p>
                              <div className="flex flex-col gap-3 items-center justify-center">
                                <button
                                  type="button"
                                  onClick={handleConfirmVisibilityChange}
                                  disabled={loading.status}
                                  aria-busy={loading.status}
                                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 cursor-pointer w-full disabled:opacity-50"
                                >
                                  {loading.status &&
                                  loading.method ===
                                    "updatingProfileVisibility" ? (
                                    <div className="flex items-center justify-center">
                                      <Icon.Loader className="animate-spin w-5 h-5" />
                                    </div>
                                  ) : (
                                    "Got it"
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCloseModal}
                                  className="px-4 py-2 border border-gray-300 rounded cursor-pointer hover:border-red-400 hover:text-red-400 w-full"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </Modal>
                        )}
                      </div>

                      {/* apperance visibility */}
                      <div className="rounded-xl p-4 transition-all hover:shadow-md">
                        <div
                          className="flex items-center justify-between rounded-2xl border border-gray-300 p-4 sm:p-6 shadow-sm cursor-pointer"
                          onClick={toggleTheme}
                        >
                          <p className="text-base sm:text-lg font-medium">
                            Switch To {theme === "light" ? "Dark" : "Light"}
                          </p>
                          <Icon.toggleOn
                            size={35}
                            className={theme === "light" ? "rotate-180" : ""}
                          />
                        </div>
                      </div>

                      {/* verify profile */}
                      <div className="bg-gray-50 dark:bg-gray-100 rounded-xl p-4 transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                          <p className="text-gray-800 dark:text-gray-900 text-sm sm:text-base">
                            You need to verify your profile.{" "}
                            <Link
                              to="/settings/account-verification"
                              className="text-blue-600 hover:underline font-medium"
                            >
                              Click here to verify
                            </Link>
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-start">
                        <button
                          className="cursor-pointer"
                          onClick={() => setShowdiv(true)}
                        >
                          <Icon.ArrowRight size={28} className="rotate-180" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Image Crop Modal */}
            {showCropModal && imageSrc && (
              <ImageEditorModal
                imageSrc={imageSrc}
                onClose={() => setShowCropModal(false)}
                onSave={async (croppedImage) => {
                  setLoading({ status: true, method: "uploadingProfileImg" });
                  setShowCropModal(false);
                  const response = await changeProfileImage(croppedImage);
                  setLoading({ status: false, method: "" });
                  if (response?.success) {
                    toast.success("Profile image updated successfully");
                    setError("");
                    setProfileImgUpdated(true);
                  } else {
                    setError("Error While Updating Profile Image!");
                  }
                }}
              />
            )}
          </Modal>
        )}

        <div className="w-full md:w-2/3 lg:w-3/4">
          <Feed />
        </div>

        <div
          className={`hidden md:block md:w-1/3 lg:w-1/4 mt-6 md:mt-0 md:ml-4 p-4 rounded-lg shadow-sm ${styles.bg}`}
        >
          <h2 className="font-bold text-lg mb-4">Suggestions</h2>
          <div className="space-y-4">
            {/* Suggestion items would go here */}
            <div className={`flex items-center p-2 rounded-md ${styles.hover}`}>
              <div className="w-10 h-10 rounded-full bg-gray-300"></div>
              <div className="ml-3">
                <p className="font-medium text-sm">Gautam</p>
                <p className="text-xs text-gray-500">Suggested for you</p>
              </div>
              <button className="ml-auto text-blue-400 hover:text-blue-500 cursor-pointer text-xs font-semibold">
                Follow
              </button>
            </div>
            {/* More suggestion items */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
