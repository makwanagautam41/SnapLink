import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";
import useThemeStyles from "../utils/themeStyles.js";

const SidebarNotifications = ({ notification, followRequest }) => {
  const {
    acceptFollowRequest,
    rejectFollowRequest,
    getNotifications,
    setNotifications,
    setFollowRequests,
    getRelativeTime,
  } = useAuth();
  const { theme } = useTheme();
  const styles = useThemeStyles();

  const handleAcceptFollowRequest = async () => {
    const res = await acceptFollowRequest(followRequest.username);
    if (res.success) {
      toast.success(res.message);
      const data = await getNotifications();
      if (data.success) {
        setNotifications(data.notifications);
        setFollowRequests(data.followRequests);
      }
    } else {
      toast.error(`Error: ${res.message}`);
    }
  };

  const handleRejectFollowRequest = async () => {
    const res = await rejectFollowRequest(followRequest.username);
    if (res.success) {
      toast.success(res.message);
      const data = await getNotifications();
      if (data.success) {
        setNotifications(data.notifications);
        setFollowRequests(data.followRequests);
      }
    } else {
      toast.error(`Error: ${res.message}`);
    }
  };

  return (
    <div className="md:mt-0 shadow-lg rounded-md hover:shadow-xl transition-shadow duration-300">
      {notification && (
        <div
          className={`flex items-center justify-between gap-3 p-2 rounded-md transition-colors duration-200 ${styles.hover}`}
        >
          <img
            src={
              notification.from.profileImg ||
              "https://res.cloudinary.com/djbqtwzyf/image/upload/v1744042607/default_img_gszetk.png"
            }
            alt="Profile"
            className="object-cover w-10 h-10 rounded-full shadow-sm dark:bg-gray-500 dark:border-gray-300"
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-600 truncate">
              <Link to={`/profile/${notification.from.username}`}>
                {notification.from.username}
              </Link>
            </h2>
            <span className="block text-xs text-gray-700 dark:text-gray-500 truncate">
              {notification.message}
            </span>
            <span className="block text-xs text-gray-500 dark:text-gray-500">
              {getRelativeTime(notification.createdAt)}
            </span>
          </div>
        </div>
      )}

      {followRequest && (
        <div
          className={`flex items-center justify-between gap-3 mt-1 p-2 rounded-md transition-colors duration-200 ${styles.hover}`}
        >
          <img
            src={
              followRequest.profileImg ||
              "https://res.cloudinary.com/djbqtwzyf/image/upload/v1744042607/default_img_gszetk.png"
            }
            alt="Profile"
            className="object-cover w-10 h-10 rounded-full shadow-sm dark:bg-gray-500 dark:border-gray-300"
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-700 truncate">
              <Link to={`/profile/${followRequest.username}`}>
                {followRequest.username}
              </Link>
            </h2>
            <span className="block text-xs text-gray-500 dark:text-gray-500 truncate">
              requested to follow you.
            </span>
            <span className="block text-xs text-gray-500 dark:text-gray-500">
              15min
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAcceptFollowRequest}
              className="px-3 py-1 bg-[#1877f2] text-white text-xs rounded-md hover:bg-blue-600 focus:outline-none dark:bg-[#1877f2] dark:hover:bg-blue-500"
            >
              Confirm
            </button>
            <button
              onClick={handleRejectFollowRequest}
              className="px-3 py-1 bg-gray-300 text-black text-xs rounded-md hover:bg-gray-400 focus:outline-none dark:bg-[#dbdbdb]"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarNotifications;
