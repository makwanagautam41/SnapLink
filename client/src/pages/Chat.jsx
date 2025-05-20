import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import PostTopBar from "../components/PostTopBar";
import useThemeStyles from "../utils/themeStyles";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import Modal from "../components/Modal";
import { Icon } from "../utils/icons";
import { motion } from "framer-motion";

const Chat = () => {
  const bounceTransition = {
    y: {
      duration: 0.6,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
    },
  };
  const { username } = useParams();
  const { user, onlineUsers } = useAuth();
  const styles = useThemeStyles();
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const [messageText, setMessageText] = useState("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const {
    messages,
    selectedUser,
    setSelectedUser,
    getMessages,
    sendMessage,
    users,
    isTyping,
  } = useChat();

  useEffect(() => {
    if (users.length > 0 && username) {
      const foundUser = users.find((u) => u.username === username);
      if (foundUser) {
        setSelectedUser(foundUser);
        getMessages(foundUser._id);
      }
    }
  }, [username, users]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageText.trim() && selectedUser) {
      sendMessage(messageText);
      setMessageText("");
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!selectedUser) {
    return (
      <div className={`flex items-center justify-center h-screen ${styles.bg}`}>
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">User not found</h2>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => navigate("/message")}
          >
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col md:flex-row h-full min-h-screen ${styles.bg}`}
    >
      <PostTopBar title={selectedUser ? selectedUser.name : "Chat"} />
      {/* Chat Section */}
      <div
        className={`flex-1 flex flex-col max-w-full md:max-w-2xl ${styles.bg} rounded-lg shadow-md md:shadow-none md:rounded-none`}
      >
        {/* Chat Header */}
        {selectedUser ? (
          <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800">
            <div
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setShowDetailsModal(true);
                }
              }}
              className="flex items-center cursor-pointer"
            >
              <img
                src={selectedUser.profileImg}
                alt={selectedUser.name}
                className="w-12 h-12 rounded-full mr-3"
              />
              <div>
                <div className="font-semibold">{selectedUser.name}</div>
                <div
                  className={`text-xs ${
                    onlineUsers.some(
                      (onlineUser) =>
                        onlineUser._id === selectedUser._id.toString()
                    )
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {onlineUsers.some(
                    (onlineUser) =>
                      onlineUser._id === selectedUser._id.toString()
                  )
                    ? "Online"
                    : "Offline"}
                </div>
              </div>
            </div>
            <div className="ml-auto text-gray-400 text-sm">
              {new Date().toLocaleDateString()}
            </div>
          </div>
        ) : (
          <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="font-semibold">User not found</div>
          </div>
        )}
        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-4"
          style={{ minHeight: 0, maxHeight: "calc(100vh - 220px)" }}
        >
          {messages && messages.length > 0 ? (
            messages.map((msg, i) => {
              const isSender = msg.senderId === user._id;
              return (
                <div
                  key={i}
                  className={`flex ${
                    isSender ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 text-sm shadow ${styles.messageBubble(
                      isSender
                    )}`}
                  >
                    {msg.text}
                    <div className="text-[10px] text-gray-400 text-right mt-1">
                      {formatMessageTime(msg.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-400">No messages yet</div>
          )}
          <div ref={messagesEndRef} />
          {isTyping && selectedUser && (
            <div className="flex justify-start">
              <div
                className={`max-w-[75%] px-4 py-2 text-sm shadow ${styles.messageBubble(
                  false
                )}`}
              >
                <div className="flex items-center space-x-1 h-4">
                  <motion.span
                    className="w-2 h-2 rounded-full bg-gray-400"
                    animate={{ y: ["100%", "-100%"] }}
                    transition={{
                      ...bounceTransition.y,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: 0,
                    }}
                  />
                  <motion.span
                    className="w-2 h-2 rounded-full bg-gray-400"
                    animate={{ y: ["100%", "-100%"] }}
                    transition={{
                      ...bounceTransition.y,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: 0.2,
                    }}
                  />
                  <motion.span
                    className="w-2 h-2 rounded-full bg-gray-400"
                    animate={{ y: ["100%", "-100%"] }}
                    transition={{
                      ...bounceTransition.y,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: 0.4,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {showDetailsModal && (
          <Modal onClose={() => setShowDetailsModal(false)}>
            <div className="w-full h-screen sm:max-w-md sm:h-auto sm:rounded-lg">
              <div className="flex flex-col items-center mt-4">
                <img
                  src={selectedUser.profileImg}
                  alt={selectedUser.name}
                  className="w-20 h-20 rounded-full shadow-md"
                />
                <h2 className="mt-2 text-lg font-semibold">
                  {selectedUser.name}
                </h2>
                <div className="text-sm text-gray-500 mt-1">
                  @{selectedUser.username}
                </div>
              </div>
              <div className="flex space-x-6 justify-center items-center mt-5">
                <div className="flex flex-col p-4 items-center">
                  <Icon.User className="text-2xl" />
                  <p className="text-sm">Profile</p>
                </div>
                <div className="flex flex-col p-2 items-center">
                  <Icon.Search className="text-2xl" />
                  <p className="text-sm">Search</p>
                </div>
                <div className="flex flex-col p-2 items-center">
                  <Icon.Mute className="text-2xl" />
                  <p className="text-sm">Mute</p>
                </div>
                <div className="flex flex-col p-2 items-center">
                  <Icon.DotsHorizontal className="text-2xl" />
                  <p className="text-sm">Options</p>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <img
                    src={selectedUser.profileImg}
                    alt={selectedUser.name}
                    className="w-9 h-9 rounded-full"
                  />
                  <div className="flex flex-col items-start">
                    <p className="text-sm font-semibold">Theme</p>
                    <p className="text-xs text-gray-400">Default</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Icon.Clock size={35} className="text-gray-400" />
                  <div className="flex flex-col items-start">
                    <p className="text-sm font-semibold">Theme</p>
                    <p className="text-xs text-gray-400">Default</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Icon.Lock size={35} className="text-gray-400" />
                  <p>Privacy & safety</p>
                </div>
              </div>
            </div>
          </Modal>
        )}

        {/* Message Input */}
        <form
          onSubmit={handleSendMessage}
          className={`p-4 border-t border-gray-200 dark:border-gray-800 ${styles.bg} flex items-center`}
        >
          <div className="flex items-center gap-2">
            <Icon.Image className="text-2xl" />
            <Icon.Link className="text-2xl" />
          </div>
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message"
            className={`flex-1 min-w-0 px-4 py-2 rounded-full ${styles.input} focus:outline-none transition-all duration-200`}
          />

          <motion.button
            type="submit"
            className="hidden lg:block ml-2 bg-blue-500 text-white rounded-full p-3 cursor-pointer"
            whileHover={{ rotate: 45, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <svg
              className="button__icon"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M14.2199 21.9352C13.0399 21.9352 11.3699 21.1052 10.0499 17.1352L9.32988 14.9752L7.16988 14.2552C3.20988 12.9352 2.37988 11.2652 2.37988 10.0852C2.37988 8.91525 3.20988 7.23525 7.16988 5.90525L15.6599 3.07525C17.7799 2.36525 19.5499 2.57525 20.6399 3.65525C21.7299 4.73525 21.9399 6.51525 21.2299 8.63525L18.3999 17.1252C17.0699 21.1052 15.3999 21.9352 14.2199 21.9352ZM7.63988 7.33525C4.85988 8.26525 3.86988 9.36525 3.86988 10.0852C3.86988 10.8052 4.85988 11.9052 7.63988 12.8252L10.1599 13.6652C10.3799 13.7352 10.5599 13.9152 10.6299 14.1352L11.4699 16.6552C12.3899 19.4352 13.4999 20.4252 14.2199 20.4252C14.9399 20.4252 16.0399 19.4352 16.9699 16.6552L19.7999 8.16525C20.3099 6.62525 20.2199 5.36525 19.5699 4.71525C18.9199 4.06525 17.6599 3.98525 16.1299 4.49525L7.63988 7.33525Z"
                fill="#fff"
              ></path>
              <path
                d="M10.11 14.7052C9.92005 14.7052 9.73005 14.6352 9.58005 14.4852C9.29005 14.1952 9.29005 13.7152 9.58005 13.4252L13.16 9.83518C13.45 9.54518 13.93 9.54518 14.22 9.83518C14.51 10.1252 14.51 10.6052 14.22 10.8952L10.64 14.4852C10.5 14.6352 10.3 14.7052 10.11 14.7052Z"
                fill="#fff"
              ></path>
            </svg>
          </motion.button>
        </form>
      </div>
      {/* Right Sidebar (User Info & Shared Files) */}
      <div
        className={`hidden lg:flex flex-col w-80 ${styles.bg} border-l border-gray-200 dark:border-gray-800 p-4`}
      >
        {selectedUser && (
          <>
            <div className="flex flex-col items-center mb-6">
              <img
                src={selectedUser.profileImg}
                alt={selectedUser.name}
                className="w-20 h-20 rounded-full shadow-md"
              />
              <h2 className="mt-2 text-lg font-semibold">
                {selectedUser.name}
              </h2>
              <div className="text-sm text-gray-500 mt-1">
                @{selectedUser.username}
              </div>
            </div>
            {selectedUser.bio && (
              <div className="mb-6">
                <div className="font-semibold mb-2">About</div>
                <p className="text-sm text-gray-600">{selectedUser.bio}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
