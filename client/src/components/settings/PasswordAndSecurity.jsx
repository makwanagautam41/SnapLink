import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import PostTopBar from "../../components/PostTopBar";
import { Icon } from "../../utils/icons";
import Modal from "../Modal";
import toast from "react-hot-toast";
import useThemeStyles from "..//../utils/themeStyles.js";

const PasswordAndSecurity = () => {
  const { user, updatePassword } = useAuth();
  const styles = useThemeStyles();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showTwoFectorAuthModal, setShowTwoFectorAuthModal] = useState(false);

  const togglePasswordChange = () => {
    setShowPasswordModal(true);
    setError("");
    setSuccess("");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handlePasswordUpdate = async () => {
    setError("");
    setSuccess("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    try {
      const response = await updatePassword(oldPassword, newPassword);
      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update password.");
      console.log(error);
    }
  };

  const toggleTwoFectorAuth = () => {
    setShowTwoFectorAuthModal(true);
  };

  return (
    <div>
      <PostTopBar title={"Password And Security"} />
      <div className="p-2">
        <div className="mb-2">
          <p className="text-md">Login & Recovery</p>
          <p className="text-xs">
            Manage your passwords, login preferences, and recovery methods.
          </p>
        </div>
        <div className={`rounded-lg overflow-hidden shadow-md ${styles.bg}`}>
          <div
            onClick={togglePasswordChange}
            className={`flex items-center justify-between p-4 cursor-pointer ${styles.hover}`}
          >
            <p className="mb-1">Change Password</p>
            <Icon.ArrowRight />
          </div>

          {showPasswordModal && (
            <Modal onClose={() => setShowPasswordModal(false)} styles={styles}>
              <div className={`p-4 space-y-4 ${styles.bg}`}>
                <h2 className="text-lg font-semibold">Change Password</h2>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-500 text-sm">{success}</p>}

                {/* Old Password */}
                <div className="relative">
                  <input
                    type={showOld ? "text" : "password"}
                    placeholder="Old Password"
                    className="w-full p-2 pr-10 border rounded"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                  <span
                    className="absolute right-3 top-2.5 cursor-pointer"
                    onClick={() => setShowOld(!showOld)}
                  >
                    {showOld ? <Icon.OnEye /> : <Icon.OffEye />}
                  </span>
                </div>

                {/* New Password */}
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    placeholder="New Password"
                    className="w-full p-2 pr-10 border rounded"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <span
                    className="absolute right-3 top-2.5 cursor-pointer"
                    onClick={() => setShowNew(!showNew)}
                  >
                    {showNew ? <Icon.OnEye /> : <Icon.OffEye />}
                  </span>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm New Password"
                    className="w-full p-2 pr-10 border rounded"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <span
                    className="absolute right-3 top-2.5 cursor-pointer"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <Icon.OnEye /> : <Icon.OffEye />}
                  </span>
                </div>

                <button
                  className={`w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 `}
                  onClick={handlePasswordUpdate}
                >
                  Update Password
                </button>
              </div>
            </Modal>
          )}

          <div
            onClick={toggleTwoFectorAuth}
            className={`flex items-center justify-between p-4 cursor-pointer ${styles.hover}`}
          >
            <p className="mb-1">Two-factor Authentication</p>
            <Icon.ArrowRight />
          </div>

          {showTwoFectorAuthModal && (
            <Modal
              onClose={() => setShowTwoFectorAuthModal(false)}
              styles={styles}
            >
              <div className="p-4 space-y-4">
                <h2 className="text-lg font-semibold">
                  Two Fector Authentication
                </h2>
                <div>
                  <p>Will be Soon...</p>
                </div>
              </div>
            </Modal>
          )}
        </div>

        <div className="mt-6 mb-2">
          <p className="text-md">Security Checks</p>
          <p className="text-xs">
            Review security issues by running checks across apps, devices, and
            emails sent.
          </p>
        </div>
        <div className={`rounded-lg overflow-hidden shadow-md ${styles.bg}`}>
          <div
            className={`flex items-center justify-between p-4 cursor-pointer ${styles.hover}`}
          >
            <p className="mb-1">Where you Logged in</p>
            <Icon.ArrowRight />
          </div>
          <div
            className={`flex items-center justify-between p-4 cursor-pointer ${styles.hover}`}
          >
            <p className="mb-1">Login Alerts</p>
            <Icon.ArrowRight />
          </div>
          <div
            className={`flex items-center justify-between p-4 cursor-pointer ${styles.hover}`}
          >
            <p className="mb-1">Recent Emails</p>
            <Icon.ArrowRight />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordAndSecurity;
