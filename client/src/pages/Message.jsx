import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../utils/icons";
import useThemeStyles from "../utils/themeStyles";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";

const Message = ({ isVisible }) => {
  const navigate = useNavigate();
  const styles = useThemeStyles();
  const { user, onlineUsers } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const { users, unSeenMessages, setSelectedUser, getUsersMessages } =
    useChat();

  useEffect(() => {
    getUsersMessages();
  }, []);

  const handleUserSelect = (selectedUser) => {
    setSelectedUser(selectedUser);
    navigate(`/message/${selectedUser.username}/chat`);
  };

  const getLastMessageTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex">
      <div
        className={`w-full md:w-80 ${styles.bg} border-r border-gray-200 dark:border-gray-800 flex flex-col h-full min-h-screen p-4`}
      >
        {/* User Info */}
        <div className="flex flex-row justify-between items-center mb-6">
          <img
            src={user?.profileImg}
            alt={user?.username}
            className="w-20 h-20 rounded-full border-4 border-white shadow-md"
          />
          <h2 className="mt-2 text-lg font-semibold">{user?.name}</h2>
          <div className="flex space-x-2 mt-2">
            <span className={`text-gray-400 ${styles.hover} cursor-pointer`}>
              <i className="fab fa-instagram"></i>
            </span>
            <span className={`text-gray-400 ${styles.hover} cursor-pointer`}>
              <i className="fab fa-twitter"></i>
            </span>
          </div>
        </div>
        {/* Friends Online */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Friends Online</span>
            <span className="text-xs">{onlineUsers.length}</span>
          </div>
          <div className="flex -space-x-2">
            {onlineUsers.map((user, i) => (
              <img
                key={i}
                src={user.profileImg}
                alt={user.name}
                className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800"
              />
            ))}
          </div>
        </div>
        {/* Chats */}
        <div className="flex-1 overflow-y-auto mb-10">
          <div className="mb-2">
            <input
              type="text"
              placeholder="Search chat..."
              className={`w-full px-3 py-2 rounded ${styles.input} focus:outline-none`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
            />
          </div>
          <div className="h-[calc(100vh-200px)] overflow-y-auto">
            {users
              .filter((chatUser) =>
                chatUser.name.toLowerCase().includes(searchQuery)
              )
              .map((chatUser) => (
                <div
                  key={chatUser._id}
                  className={`flex items-center p-2 rounded ${styles.hover} overflow-hidden cursor-pointer mb-2`}
                  onClick={() => handleUserSelect(chatUser)}
                >
                  <div className="relative">
                    <img
                      src={chatUser.profileImg}
                      alt={chatUser.name}
                      className="w-12 h-12 rounded-full mr-3"
                    />
                    {chatUser.online && (
                      <div className="absolute bottom-0 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{chatUser.name}</div>
                    <div className="text-xs truncate text-gray-500">
                      {chatUser.lastMessage || "No messages yet"}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-xs ml-2 text-gray-400">
                      {getLastMessageTime(chatUser.lastMessageTime)}
                    </div>
                    {unSeenMessages[chatUser._id] && (
                      <div className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mt-1">
                        {unSeenMessages[chatUser._id]}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            {users.filter((chatUser) =>
              chatUser.name.toLowerCase().includes(searchQuery)
            ).length === 0 && (
              <div className="text-center text-gray-500 mt-4">
                No users found.
              </div>
            )}
          </div>
        </div>
      </div>
      {isVisible && (
        <div
          className={`hidden lg:flex flex-col items-center justify-center flex-1 h-screen ${styles.bg}`}
        >
          <div className="flex flex-col items-center">
            <div
              className={`w-16 h-16 flex items-center justify-center border-2 border-[${styles.bg}] rounded-full mb-4`}
            >
              <Icon.Chat size={30} />
            </div>
            <h2 className="text-xl font-semibold">Your messages</h2>
            <p className="text-sm text-gray-600 mb-4">
              Select a message to start a chat.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;
