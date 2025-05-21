import React, { useState } from "react";
import PostTopBar from "../PostTopBar";
import { Icon } from "../../utils/icons";
import { useAuth } from "../../context/AuthContext";
import useThemeStyles from "../../utils/themeStyles";
import Modal from "../Modal";
import LoadingModal from "..//../components/LoadingModal";
import toast from "react-hot-toast";

const AccountOwnerShip = () => {
  const {
    user,
    deactivateAccount,
    setError,
    error,
    setSuccess,
    deleteAccount,
  } = useAuth();
  const styles = useThemeStyles();
  const [showAccountDeactivation, setShowAccountDeactivation] = useState(false);
  const [showAccountDeletion, setShowAccountDeletion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [deactivationMessage, setDeactivationMessage] = useState("");

  const toggle = ({ type }) => {
    if (type === "deactivate") {
      setShowAccountDeactivation(!showAccountDeactivation);
    } else {
      setShowAccountDeletion(!showAccountDeletion);
    }
  };

  const handleDeactivate = async () => {
    try {
      setShowAccountDeactivation(false);
      setLoadingMessage("Deactivating your account...");
      setLoading(true);

      const res = await deactivateAccount(deactivationMessage);

      if (res.success) {
        setLoading(false);
        toast.success("Account Deactivated Successfully!");
      } else {
        setLoading(false);
        setError(res.message || "Failed to deactivate account");
      }
    } catch (err) {
      setLoading(false);
      console.error("Error deactivating account:", err);
      setError("An unexpected error occurred.");
    }
  };

  const handleDeletion = async () => {
    try {
      setShowAccountDeletion(false);
      setLoadingMessage("Processing to Delete account");
      setLoading(true);

      const res = await deleteAccount();

      if (res.success) {
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.error("Error deleting account:", err);
      setError("An unexpected error occurred.");
    }
  };

  return (
    <div>
      <PostTopBar title={"Account OwnerShip"} />
      <div className={`p-2 text-sm`}>
        {loading && <LoadingModal text={loadingMessage} />}
        <p className="mb-4 sm:text-base text-gray-500">
          SnapLink uses this information to verify your identity and to keep our
          community safe. You decide what personal details you make visible to
          others.
        </p>

        <div
          className={`rounded-2xl shadow-sm cursor-pointer overflow-hidden ${styles.bg}`}
        >
          <div
            onClick={() => toggle({ type: "deactivate" })}
            className={`flex items-center justify-between p-4 cursor-pointer ${styles.hover}`}
          >
            <div>
              <p className="mb-1">Account Deactivation</p>
            </div>
            <div>
              <Icon.ArrowRight />
            </div>
          </div>

          {showAccountDeactivation && (
            <Modal onClose={() => setShowAccountDeactivation(false)}>
              <div className="rounded-2xl font-sans mt-6 p-6 shadow-md">
                <p className="text-left text-lg font-semibold mb-2">
                  Account Deactivation
                </p>
                <p className="text-left mb-6">
                  Deactivating your account is temporary, and it means your
                  profile will be hidden on SnapLink until you reactivate it
                  through Accounts Center or by logging in to your account.
                </p>

                <label
                  className="block mb-2 text-sm"
                  htmlFor="deactivationReason"
                >
                  Reason (optional)
                </label>
                <input
                  type="text"
                  id="deactivationReason"
                  value={deactivationMessage}
                  onChange={(e) => setDeactivationMessage(e.target.value)}
                  placeholder="Why are you deactivating?"
                  className={`${styles.input} w-full mb-4 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400`}
                />

                <div className="flex justify-start gap-4">
                  <button
                    onClick={() => setShowAccountDeactivation(false)}
                    className="px-4 py-2 rounded-lg border border-gray-400 hover:border-red-500 hover:text-red-500 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeactivate}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                  >
                    Confirm
                  </button>
                </div>

                {error && (
                  <p className="mt-4 text-sm text-left text-red-500">{error}</p>
                )}
              </div>
            </Modal>
          )}

          <div
            onClick={() => toggle({ type: "delete" })}
            className={`flex items-center justify-between p-4 cursor-pointer ${styles.hover}`}
          >
            <div>
              <p className="mb-1">Account Deletion</p>
            </div>
            <div>
              <Icon.ArrowRight />
            </div>
          </div>

          {showAccountDeletion && (
            <Modal onClose={() => setShowAccountDeletion(false)}>
              <div className="rounded-2xl font-sans mt-6 p-6 shadow-md">
                <p className="text-left text-lg font-semibold mb-2 ">
                  Account Deletion
                </p>
                <p className="text-left mb-6">
                  Deleting your account is permanent. When you delete your
                  SnapLink account, your profile, photos, videos, comments,
                  likes, and followers will be permanently removed. If you’d
                  just like to take a break, you can temporarily deactivate your
                  account.
                </p>
                <div className="flex justify-start gap-4">
                  <button
                    onClick={() => setShowAccountDeletion(false)}
                    className="px-4 py-2 cursor-pointer rounded-lg border border-gray-400 hover:border-red-500 hover:text-red-500 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeletion}
                    className="px-4 py-2 cursor-pointer rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountOwnerShip;
