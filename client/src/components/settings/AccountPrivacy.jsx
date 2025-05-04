import React, { useState, useEffect } from "react";
import PostTopBar from "../PostTopBar";
import { Icon } from "../../utils/icons";
import { useAuth } from "../../context/AuthContext";
import Modal from "../../components/Modal";
import useThemeStyles from "..//../utils/themeStyles.js";

const AccountAndPrivacy = () => {
  const { user, changeProfileVisibility } = useAuth();
  const styles = useThemeStyles();
  const [isPrivate, setIsPrivate] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    if (user?.profileVisibility === "private") {
      setIsPrivate(true);
    } else {
      setIsPrivate(false);
    }
  }, [user]);

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
    setShowModal(true);
  };

  const handleConfirmVisibilityChange = async () => {
    try {
      await changeProfileVisibility();
      setIsPrivate((prev) => !prev);
    } catch (error) {
      console.error("Failed to change profile visibility:", error);
    } finally {
      setShowModal(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="sm:px-6 lg:px-10 py-4">
      <PostTopBar title="Account Privacy" />

      <div className="flex flex-col px-4 gap-6 mt-6 max-w-4xl mx-auto">
        <div
          className="flex items-center justify-between rounded-2xl border border-gray-300 p-4 sm:p-6 shadow-sm cursor-pointer"
          onClick={handleToggle}
        >
          <p className="text-base sm:text-lg font-medium">
            {isPrivate ? "Private" : "Public"} Account
          </p>
          <Icon.toggleOn
            size={30}
            className={!isPrivate ? "rotate-180 text-gray-400" : ""}
          />
        </div>

        <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
          When your account is public, your profile and posts can be seen by
          anyone, even if they don't have an SnapLink account.
        </p>
        <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
          When your account is private, only the followers you approve can see
          what you share, including your photos or videos on hashtag and
          location pages, and your followers and following lists. Certain info
          on your profile, like your profile picture and username, is visible to
          everyone on and off SnapLink.{" "}
          <span className="text-indigo-600 cursor-pointer hover:underline">
            Learn more
          </span>
        </p>
      </div>

      {showModal && (
        <Modal onClose={handleCloseModal} styles={styles}>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-2">Privacy Update</h2>
            <p className="mb-4">{modalMessage}</p>
            <div className="flex flex-col gap-3 items-center justify-center">
              <button
                onClick={handleConfirmVisibilityChange}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 cursor-pointer w-full"
              >
                Got it
              </button>
              <button
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
  );
};

export default AccountAndPrivacy;
