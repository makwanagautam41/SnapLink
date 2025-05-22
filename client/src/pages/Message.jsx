import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Icon } from "../utils/icons";
import useThemeStyles from "../utils/themeStyles";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";

const Message = ({ isVisible }) => {
  const navigate = useNavigate();
  const styles = useThemeStyles();
  const { user, onlineUsers } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const {
    users,
    unSeenMessages,
    setSelectedUser,
    getUsersMessages,
    deleteChat,
  } = useChat();

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

  const handleChatDelete = (otherUserId) => {};

  return (
    <div className="flex h-screen">
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
          <Icon.DotsHorizontal className="rotate-90 cursor-pointer" />
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
          <div className="flex -space-x-2 overflow-x-auto">
            {onlineUsers.map((user, i) => (
              <Link to={`/message/${user.username}/chat`} key={user._id}>
                <img
                  key={user._id}
                  src={user.profileImg}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800"
                />
              </Link>
            ))}
          </div>
        </div>
        <div className="mb-2">
          <input
            type="text"
            placeholder="Search chat..."
            className={`w-full px-3 py-2 rounded ${styles.input} focus:outline-none`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
          />
        </div>
        {/* Chats */}
        <div className="flex-1 overflow-y-auto mb-10">
          <div className="h-[calc(100vh-200px)] overflow-y-auto space-y-2">
            {users
              .filter(
                (chatUser) =>
                  chatUser.name.toLowerCase().includes(searchQuery) &&
                  chatUser.lastMessage &&
                  chatUser.lastMessage.trim().length > 0
              )
              .sort(
                (a, b) =>
                  new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
              )
              .map((chatUser) => (
                <div
                  key={chatUser._id}
                  className={`flex items-center justify-between p-2 rounded ${styles.hover} overflow-hidden cursor-pointer`}
                  onClick={() => handleUserSelect(chatUser)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={chatUser.profileImg}
                        alt={chatUser.name}
                        className="w-12 h-12 rounded-full"
                      />

                      {onlineUsers.some(
                        (onlineUser) => onlineUser._id === chatUser._id
                      ) && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold">{chatUser.name}</div>
                      <div className="text-xs truncate text-gray-500 max-w-[150px]">
                        {chatUser.lastMessage || "No messages yet"}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <div className="text-xs text-green-400">
                      {getLastMessageTime(chatUser.lastMessageTime)}
                    </div>
                    {unSeenMessages[chatUser._id] && (
                      <div className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
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
          className={`hidden lg:flex flex-col items-center justify-center flex-1 ${styles.bg}`}
        >
          <div className="flex flex-col items-center">
            <div
              className={`w-16 h-16 flex items-center justify-center border-2 rounded-full mb-4`}
              style={{ borderColor: styles.bg }}
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
