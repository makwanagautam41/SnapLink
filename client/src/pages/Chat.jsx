import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import PostTopBar from "../components/PostTopBar";
import useThemeStyles from "../utils/themeStyles";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import Modal from "../components/Modal";
import { Icon } from "../utils/icons";
import { motion, AnimatePresence } from "framer-motion";

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
  const { user, onlineUsers, socket } = useAuth();
  const styles = useThemeStyles();
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const [messageText, setMessageText] = useState("");
  const [optionModalFor, setOptionModalFor] = useState(null);
  const [showSelectedSendImage, setShowSelectedSendImage] = useState("");
  const [selectedImages, setSelectedImages] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const {
    messages,
    selectedUser,
    setSelectedUser,
    getMessages,
    sendMessage,
    users,
    deleteMessage,
    chatImages,
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

  useEffect(() => {
    if (socket) {
      socket.on("user-typing", ({ userId, isTyping }) => {
        if (selectedUser && userId === selectedUser._id) {
          setIsTyping(isTyping);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off("user-typing");
      }
    };
  }, [socket, selectedUser]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setMessageText(newValue);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Emit typing event
    if (selectedUser && newValue.trim()) {
      socket.emit("user-typing", {
        id: selectedUser._id,
      });
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      if (selectedUser) {
        socket.emit("user-stop-typing", {
          id: selectedUser._id,
        });
      }
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if ((messageText.trim() || selectedImages.length > 0) && selectedUser) {
        await sendMessage(messageText, selectedImages);
        setMessageText("");
        setSelectedImages([]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
    setLoading(false);
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages((prev) => [...prev, ...files]);
  };

  const removeSelectedImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleDelete = async (msgId) => {
    try {
      setOptionModalFor(null);
      await deleteMessage(msgId);
      getMessages(selectedUser._id);
    } catch (error) {
      console.error("Failed to delete message", error);
    }
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
                  navigate(`/message/${username}/chat/profile`);
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
                  } group items-center relative`}
                >
                  {isSender && (
                    <Icon.DotsHorizontal
                      onClick={() => setOptionModalFor(msg._id)}
                      className="mr-1 hidden group-hover:block text-gray-500 cursor-pointer"
                    />
                  )}
                  <div
                    className={`max-w-[75%] break-words px-4 py-2 text-sm shadow ${styles.messageBubble(
                      isSender
                    )}`}
                  >
                    {msg.text}
                    {msg.images.map((image, index) => {
                      return (
                        <img
                          onClick={() => setShowSelectedSendImage(image.url)}
                          key={index}
                          src={image.url}
                          alt="chat-image"
                          className="h-20 w-20 mt-2 rounded-lg cursor-pointer"
                        />
                      );
                    })}
                    <div className="text-[10px] text-gray-400 text-right mt-1">
                      {formatMessageTime(msg.createdAt)}
                    </div>
                  </div>
                  {optionModalFor === msg._id && (
                    <Modal onClose={() => setOptionModalFor(null)}>
                      <div className="w-full rounded-xl shadow-lg overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-200">
                          <h4 className="font-semibold text-lg">Options</h4>
                        </div>

                        <button className="w-full cursor-pointer py-3 px-4 text-center text-red-500 font-medium border-b border-gray-200 transition">
                          Report
                        </button>

                        <button
                          onClick={() => handleDelete(msg._id)}
                          className="w-full cursor-pointer py-3 px-4 text-center text-red-500 font-medium border-b border-gray-200 transition"
                        >
                          Delete
                        </button>

                        <button
                          onClick={() => setOptionModalFor(null)}
                          className="w-full cursor-pointer py-3 px-4 text-center font-medium transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </Modal>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-400">No messages yet</div>
          )}
          <div ref={messagesEndRef} />
          <AnimatePresence>
            {isTyping && selectedUser && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  duration: 0.3,
                }}
                className="flex justify-start"
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {showSelectedSendImage && (
          <Modal onClose={() => setShowSelectedSendImage(false)}>
            <div className="flex justify-center items-center">
              <img
                src={showSelectedSendImage}
                alt="Selected"
                className="max-h-[100vh]"
              />
            </div>
          </Modal>
        )}

        <div className="flex items-center gap-2 px-4">
          {selectedImages.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto">
              {selectedImages.map((image, index) => (
                <div key={index} className="relative">
                  <Icon.CloseCircle
                    size={20}
                    className="text-2xl absolute top-0 right-0 cursor-pointer z-10"
                    onClick={() => removeSelectedImage(index)}
                  />
                  <img
                    onClick={() =>
                      setShowSelectedSendImage(URL.createObjectURL(image))
                    }
                    src={URL.createObjectURL(image)}
                    alt={`Selected ${index + 1}`}
                    className="h-10 w-10 object-cover rounded"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Input */}
        <form
          onSubmit={handleSendMessage}
          className={`p-4 border-t border-gray-200 dark:border-gray-800 ${styles.bg} flex items-center`}
        >
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              multiple
              accept="image/*"
              className="hidden"
            />
            <Icon.Image
              className="text-2xl cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            />
          </div>

          <input
            type="text"
            value={messageText}
            onChange={handleInputChange}
            placeholder="Type your message"
            className={`flex-1 min-w-0 px-4 py-2 rounded-full ${styles.input} focus:outline-none transition-all duration-200`}
          />

          <motion.button
            type="submit"
            className="ml-2 bg-blue-500 text-white rounded-full p-2 cursor-pointer"
            whileHover={{ rotate: 45, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {loading ? (
              <Icon.Loader className="animate-spin w-5 h-5" />
            ) : (
              <svg
                className="button__icon"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
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
            )}
          </motion.button>
        </form>
      </div>
      {/* Right Sidebar (User Info & Shared Files) */}
      <div
        className={`hidden lg:flex flex-col w-80 ${styles.bg} border-l border-gray-200 dark:border-gray-800 h-[calc(100vh-0px)]`}
      >
        {selectedUser && (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex flex-col items-center p-6 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
              <img
                src={selectedUser.profileImg}
                alt={selectedUser.name}
                className="w-20 h-20 rounded-full shadow-md object-cover"
              />
              <h2 className="mt-2 text-lg font-semibold text-center">
                {selectedUser.name}
              </h2>
              <div className="text-sm text-gray-500 mt-1">
                @{selectedUser.username}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <h3
                className={`text-sm font-semibold mb-3 sticky top-0 ${styles.bg} py-2`}
              >
                Shared Media
              </h3>

              <div className="p-4">
                {chatImages.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {chatImages.map((image) => (
                      <div
                        key={image.url}
                        className="aspect-square rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                      >
                        <img
                          src={image.url}
                          alt="Shared media"
                          onClick={() => setShowSelectedSendImage(image.url)}
                          className="w-full h-full object-cover cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No shared media yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
