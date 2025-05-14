import React, { useState } from "react";
import PostTopBar from "../../components/PostTopBar";
import { useAuth } from "..//../context/AuthContext";
import Modal from "../Modal";
import { Icon } from "../../utils/icons";
import useThemeStyles from "..//../utils/themeStyles.js";
import { Link } from "react-router-dom";

const PersonalDetails = () => {
  const {
    user,
    updateEmail,
    updatePhone,
    error,
    setError,
    success,
    setSuccess,
  } = useAuth();
  const styles = useThemeStyles();

  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [showEmailUpdateModal, setShowEmailUpdateModal] = useState(false);
  const [showPhoneUpdateModal, setShowPhoneUpdateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [newPhone, setNewPhone] = useState(user?.phone || "");

  const toggle = () => {
    setShowPersonalInfo(!showPersonalInfo);
  };

  const toggleEmail = () => {
    if (!showEmailUpdateModal) {
      setShowPersonalInfo(false);
      setNewEmail(user?.email || "");
      setShowEmailUpdateModal(true);
    } else {
      setShowEmailUpdateModal(false);
      setShowPersonalInfo(true);
    }
  };

  const togglePhone = () => {
    if (!showPhoneUpdateModal) {
      setShowPersonalInfo(false);
      setNewPhone(user?.phone || "");
      setShowPhoneUpdateModal(true);
    } else {
      setShowPhoneUpdateModal(false);
      setShowPersonalInfo(true);
    }
  };

  const clearMessagesAfterDelay = () => {
    setTimeout(() => {
      setSuccess("");
      setError("");
    }, 5000);
  };

  const handleUpdate = async (updateFn, newValue) => {
    try {
      setLoading(true);
      const response = await updateFn(newValue);

      if (response.success) {
        setSuccess(response.message);
      } else {
        setError(response.message);
      }

      clearMessagesAfterDelay();
    } catch (error) {
      console.error("Update failed:", error);
      setError("Something went wrong. Please try again.");
      clearMessagesAfterDelay();
    } finally {
      setLoading(false);
    }
  };

  const handleEmailUpdate = () => handleUpdate(updateEmail, newEmail);
  const handlePhoneUpdate = () => handleUpdate(updatePhone, newPhone);

  return (
    <div>
      <PostTopBar title={"Personal Details"} />
      <div className={`p-2 text-sm`}>
        <p className="mb-4 sm:text-base text-gray-500">
          SnapLink uses this information to verify your identity and to keep our
          community safe. You decide what personal details you make visible to
          others.
        </p>

        <div
          className={`rounded-2xl shadow-sm cursor-pointer overflow-hidden ${styles.bg}`}
        >
          <div
            onClick={toggle}
            className={`flex items-center justify-between p-4 cursor-pointer ${styles.hover}`}
          >
            <div>
              <p className="mb-1">Contact info</p>
              <p>
                {user?.email}, +91{user?.phone}
              </p>
            </div>
            <div>
              <Icon.ArrowRight />
            </div>
          </div>
          {showPersonalInfo && (
            <Modal onClose={() => setShowPersonalInfo(false)}>
              <div className="rounded-2xl font-sans mt-6 p-4">
                <p className="text-left font-semibold mb-2">
                  Contact information
                </p>
                <p className="text-left mb-6">
                  Manage your mobile numbers and emails to make sure your
                  contact info is accurate and up to date.
                </p>

                <div className={`rounded-2xl shadow-md overflow-hidden`}>
                  <div
                    onClick={toggleEmail}
                    className={`flex items-center justify-between p-4 cursor-pointer ${styles.hover}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon.Email size={20} />
                      <span>{user.email}</span>
                    </div>
                    <Icon.ArrowRight />
                  </div>
                  <div
                    onClick={togglePhone}
                    className={`flex items-center justify-between p-4 cursor-pointer ${styles.hover}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon.Call size={20} />
                      <span>+91{user.phone}</span>
                    </div>
                    <Icon.ArrowRight />
                  </div>
                  <div
                    className={`flex items-center gap-3 p-4 text-blue-500 cursor-pointer ${styles.hover}`}
                  >
                    <a href="#">Add new contact</a>
                  </div>
                </div>
              </div>
            </Modal>
          )}

          {showEmailUpdateModal && (
            <Modal onClose={toggleEmail}>
              <div className={`rounded-2xl font-sans p-4 space-y-4`}>
                <p className="text-xl text-left font-semibold">Update Email</p>

                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className={`w-full p-2 rounded shadow-sm focus:outline-none ${styles.input}`}
                  placeholder="Enter new email"
                />

                <button
                  onClick={handleEmailUpdate}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update Email"}
                </button>
                {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                {success && (
                  <p className="mt-2 text-sm text-green-500">{success}</p>
                )}
              </div>
            </Modal>
          )}

          {showPhoneUpdateModal && (
            <Modal onClose={togglePhone}>
              <div className={`rounded-2xl font-sans p-4 space-y-4`}>
                <p className="text-xl text-left font-semibold">Update Phone</p>

                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className={`w-full p-2 rounded shadow-sm focus:outline-none ${styles.input}`}
                  placeholder="Enter new phone number"
                />

                <button
                  onClick={handlePhoneUpdate}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update Phone"}
                </button>
                {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                {success && (
                  <p className="mt-2 text-sm text-green-500">{success}</p>
                )}
              </div>
            </Modal>
          )}

          <Link to={"/settings/change-username"}>
            <div
              className={`flex items-center justify-between p-4 cursor-pointer ${styles.hover}`}
            >
              <div>
                <p className="mb-1">Change Username</p>
                <p>{user?.username}</p>
              </div>
              <Icon.ArrowRight />
            </div>
          </Link>

          <div
            className={`flex items-center justify-between p-4 cursor-pointer ${styles.hover}`}
          >
            <div>
              <p className="mb-1">Birthday</p>
              <p>January 4, 2004</p>
            </div>
            <Icon.ArrowRight />
          </div>

          <div
            className={`flex items-center justify-between p-4 cursor-pointer ${styles.hover}`}
          >
            <Link to={"/settings/account-ownership"}>
              <div>
                <p className="mb-1 font-medium">
                  Account ownership and control
                </p>
                <p>
                  Manage your data, modify your legacy contact, deactivate or
                  delete your accounts and profiles.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetails;
