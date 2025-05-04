import React, { useState } from "react";
import PostTopBar from "..//../components/PostTopBar";
import { useAuth } from "..//../context/AuthContext";
import { Icon } from "../../utils/icons";
import { Link } from "react-router-dom";
import useThemeStyles from "..//../utils/themeStyles.js";

const CloseFriends = () => {
  const { user, manageCloseFriend, getLoggedInUserInfor } = useAuth();
  const styles = useThemeStyles();
  const [searchTerm, setSearchTerm] = useState("");

  const combinedUsers = [
    ...(user?.followers || []),
    ...(user?.following || []),
  ];

  const uniqueUsersMap = new Map();
  combinedUsers.forEach((u) => uniqueUsersMap.set(u._id, u));
  const uniqueUsers = Array.from(uniqueUsersMap.values());

  const filteredUsers = uniqueUsers.filter((u) =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const closeFriends = user?.closeFriends || [];

  const handleCloseFriend = async (targetUsername) => {
    try {
      await manageCloseFriend(targetUsername);
      await getLoggedInUserInfor();
    } catch (error) {
      console.error("Error updating close friends:", error);
    }
  };

  return (
    <div>
      <PostTopBar title={"Close Friends"} />
      <div className="flex flex-col items-center justify-center p-2">
        <p className="text-xs mb-4">
          We don't send notifications when you edit your close friends list.
        </p>

        <div className="relative w-full max-w-md mb-4">
          <span className="absolute inset-y-0 left-0 flex items-center py-4">
            <button type="submit" className="p-2 focus:outline-none">
              <Icon.Search size={24} />
            </button>
          </span>
          <input
            type="search"
            name="Search"
            placeholder="Search..."
            autoComplete="off"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full py-2 pl-10 text-sm rounded-md shadow-md focus:outline-none ${styles.input}`}
          />
        </div>

        <div className="w-full max-w-md space-y-2">
          {filteredUsers.length === 0 ? (
            <p className="text-center text-sm text-gray-500">
              No matching users found.
            </p>
          ) : (
            filteredUsers.map((u) => (
              <div
                key={u._id}
                className={`flex items-center justify-between p-2 rounded-md shadow-sm ${styles.hover}`}
              >
                <Link
                  to={`/profile/${u.username}`}
                  className="flex items-center space-x-2 flex-1"
                  aria-label={`Go to ${u.username}'s profile`}
                >
                  <img
                    src={u.profileImg || "/default-avatar.png"}
                    alt={u.username}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => (e.target.src = "/default-avatar.png")}
                  />
                  <div className="flex flex-col">
                    <span className="text-md font-medium">{u.username}</span>
                    <span className="text-xs font-medium">{u.name}</span>
                  </div>
                </Link>
                <div>
                  {closeFriends.includes(u._id) ? (
                    <Icon.Checked
                      className="cursor-pointer"
                      size={21}
                      onClick={() => handleCloseFriend(u.username)}
                    />
                  ) : (
                    <Icon.Circle
                      className="cursor-pointer"
                      size={19}
                      onClick={() => handleCloseFriend(u.username)}
                    />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CloseFriends;
