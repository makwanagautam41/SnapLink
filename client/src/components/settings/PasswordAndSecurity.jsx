import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import PostTopBar from "../../components/PostTopBar";
import Modal from "../Modal";
import toast from "react-hot-toast";
import { Icon } from "../../utils/icons";
import useThemeStyles from "../../utils/themeStyles";

const PasswordAndSecurity = () => {
  const { updatePassword } = useAuth();
  const styles = useThemeStyles();

  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const clearMessages = () => {
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 7000);
  };

  const resetForm = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowOld(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const openPasswordModal = () => {
    setShowPasswordModal(true);
    setError("");
    setSuccess("");
    resetForm();
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
      setLoading(true);
      const res = await updatePassword(oldPassword, newPassword);

      if (res.success) {
        toast.success(res.message);
        resetForm();
        setShowPasswordModal(false);
      } else {
        setError(res.message);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update password.";
      setError(msg);
    } finally {
      setLoading(false);
      clearMessages();
    }
  };

  return (
    <div>
      <PostTopBar title="Password & Security" />

      <section className="p-2">
        <header className="mb-2">
          <p className="text-md sm:text-base text-gray-500">Login & Recovery</p>
          <p className="text-xs sm:text-base text-gray-500">
            Manage your passwords, login preferences and recovery methods.
          </p>
        </header>

        <div className={`rounded-lg overflow-hidden shadow-md ${styles.bg}`}>
          <div
            role="button"
            onClick={openPasswordModal}
            className={`flex items-center justify-between p-4 ${styles.hover}`}
          >
            <p>Change Password</p>
            <Icon.ArrowRight />
          </div>
          <div
            role="button"
            onClick={() => setShowTwoFactorModal(true)}
            className={`flex items-center justify-between p-4 ${styles.hover}`}
          >
            <p>Two-factor Authentication</p>
            <Icon.ArrowRight />
          </div>
        </div>
      </section>

      <section className="p-2 mt-6">
        <header className="mb-2">
          <p className="text-md sm:text-base text-gray-500">Security Checks</p>
          <p className="text-xs sm:text-base text-gray-500">
            Review security issues by running checks across apps, devices and
            emails sent.
          </p>
        </header>

        <div className={`rounded-lg overflow-hidden shadow-md ${styles.bg}`}>
          {["Where you logged in", "Login alerts", "Recent emails"].map(
            (txt) => (
              <div
                key={txt}
                role="button"
                className={`flex items-center justify-between p-4 ${styles.hover}`}
              >
                <p>{txt}</p>
                <Icon.ArrowRight />
              </div>
            )
          )}
        </div>
      </section>

      {showPasswordModal && (
        <Modal onClose={() => setShowPasswordModal(false)} styles={styles}>
          <div className={`p-4 space-y-4 ${styles.bg}`}>
            <h2 className="text-lg font-semibold">Change Password</h2>
            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-green-500">{success}</p>}

            <PasswordInput
              placeholder="Old password"
              value={oldPassword}
              onChange={setOldPassword}
              visible={showOld}
              toggleVisible={() => setShowOld((v) => !v)}
            />
            <PasswordInput
              placeholder="New password"
              value={newPassword}
              onChange={setNewPassword}
              visible={showNew}
              toggleVisible={() => setShowNew((v) => !v)}
            />
            <PasswordInput
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              visible={showConfirm}
              toggleVisible={() => setShowConfirm((v) => !v)}
            />

            <button
              disabled={loading}
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
              onClick={handlePasswordUpdate}
            >
              {loading ? "Updating…" : "Update Password"}
            </button>
          </div>
        </Modal>
      )}

      {showTwoFactorModal && (
        <Modal onClose={() => setShowTwoFactorModal(false)} styles={styles}>
          <div className={`p-4 space-y-4 ${styles.bg}`}>
            <h2 className="text-lg font-semibold">Two-factor Authentication</h2>
            <p className="text-sm">Coming soon…</p>
          </div>
        </Modal>
      )}
    </div>
  );
};

const PasswordInput = ({
  placeholder,
  value,
  onChange,
  visible,
  toggleVisible,
}) => (
  <div className="relative">
    <input
      type={visible ? "text" : "password"}
      placeholder={placeholder}
      className="w-full p-2 pr-10 border rounded"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    <span
      className="absolute right-3 top-2.5 cursor-pointer"
      onClick={toggleVisible}
    >
      {visible ? <Icon.OnEye /> : <Icon.OffEye />}
    </span>
  </div>
);

export default PasswordAndSecurity;
