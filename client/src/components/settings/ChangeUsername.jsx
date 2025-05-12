import React, { useState } from "react";
import PostTopBar from "../PostTopBar";
import { useAuth } from "../../context/AuthContext";
import { Icon } from "../../utils/icons";

const ChangeUsername = () => {
  const { changeUsername, error, setError, success, setSuccess } = useAuth();
  const [newUsername, setNewUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUsernameChange = async () => {
    const trimmedUsername = newUsername.trim();

    if (!trimmedUsername) {
      setError("Username cannot be empty.");
      return;
    }

    if (/\s/.test(trimmedUsername)) {
      setError("Username cannot contain spaces.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await changeUsername(trimmedUsername);
      if (res) {
        setNewUsername("");
        setSuccess("Username updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PostTopBar title={"Change Username"} />
      <div className="p-4 text-sm">
        <label className="block mb-2 font-medium">Enter New Username</label>
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="w-full md:w-auto flex-1 p-2 border border-gray-300 rounded mb-3 md:mb-0"
            placeholder="Enter new username"
          />
          <button
            onClick={handleUsernameChange}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <Icon.Loader className="animate-spin w-5 h-5" />
            ) : (
              "Update"
            )}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        {success && <p className="mt-2 text-sm text-green-500">{success}</p>}
        <p className="text-xs text-gray-500 mt-2">
          In most cases, you’ll be able to change your username back within 14
          days.
        </p>
      </div>
    </div>
  );
};

export default ChangeUsername;
