import React from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../utils/icons";
import useThemeStyles from "../utils/themeStyles";
import { useAuth } from "../context/AuthContext";

const chatUsers = {
  johnshinoda: {
    name: "John Shinoda",
    profileImg: "https://randomuser.me/api/portraits/men/37.jpg",
    lastMessage: "All good here!",
    lastMessageTime: "08:32",
    online: true,
  },
  dinaharrison: {
    name: "Dina Harrison",
    profileImg: "https://randomuser.me/api/portraits/women/38.jpg",
    lastMessage: "See ya 😊",
    lastMessageTime: "20:28",
    online: false,
  },
  mandyguoles: {
    name: "Mandy Guoles",
    profileImg: "https://randomuser.me/api/portraits/women/39.jpg",
    lastMessage: "Let me be alone, please...",
    lastMessageTime: "16:43",
    online: true,
  },
  sampettersen: {
    name: "Sam Pettersen",
    profileImg: "https://randomuser.me/api/portraits/men/40.jpg",
    lastMessage: "Your what? 😅",
    lastMessageTime: "18:30",
    online: false,
  },
};

const Message = ({ isVisible }) => {
  const navigate = useNavigate();
  const styles = useThemeStyles();
  const { user } = useAuth();

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
            <span className="text-xs">
              {Object.values(chatUsers).filter((u) => u.online).length}
            </span>
          </div>
          <div className="flex -space-x-2">
            {Object.values(chatUsers)
              .filter((u) => u.online)
              .map((user, i) => (
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
            />
          </div>
          <div className="h-[calc(100vh-200px)] overflow-y-auto">
            {Object.entries(chatUsers).map(([username, chatUser]) => (
              <div
                key={username}
                className={`flex items-center p-2 rounded ${styles.hover} overflow-hidden cursor-pointer mb-2`}
                onClick={() => navigate(`/message/${username}/chat`)}
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
                    {chatUser.lastMessage}
                  </div>
                </div>
                <div className="text-xs ml-2 text-gray-400">
                  {chatUser.lastMessageTime}
                </div>
              </div>
            ))}
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
