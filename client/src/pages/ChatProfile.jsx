import React, { useEffect, useState } from "react";
import { Icon } from "../utils/icons";
import useThemeStyles from "../utils/themeStyles";
import { useChat } from "../context/ChatContext";
import PostTopBar from "../components/PostTopBar";
import Modal from "../components/Modal";

const ChatProfile = () => {
  const styles = useThemeStyles();
  const { selectedUser, chatImages, navigate, getChatImages } = useChat();
  const [showSelectedSendImage, setShowSelectedSendImage] = useState("");

  useEffect(() => {
    if (selectedUser === null) {
      navigate("/message");
    } else if (window.innerWidth > 1024) {
      navigate("/message");
    }
  }, [selectedUser, navigate]);

  useEffect(() => {
    getChatImages(selectedUser._id);
  }, [selectedUser]);

  if (!selectedUser) return null;

  return (
    <div className="h-screen w-full sm:max-w-md mx-auto flex flex-col">
      <PostTopBar title={selectedUser.name} />

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {/* Profile Info */}
        <div className="flex flex-col items-center mt-6">
          <img
            src={selectedUser.profileImg}
            alt={selectedUser.name}
            className="w-20 h-20 rounded-full shadow-md"
          />
          <h2 className="mt-2 text-lg font-semibold">{selectedUser.name}</h2>
          <p className="text-sm text-gray-500">@{selectedUser.username}</p>
        </div>

        {/* Action Icons */}
        <div className="flex justify-around mt-6 cursor-pointer">
          <div
            onClick={() => navigate(`/profile/${selectedUser.username}`)}
            className="flex flex-col items-center gap-2"
          >
            <Icon.User className="text-2xl" />
            <p className="text-sm">Profile</p>
          </div>
        </div>

        {/* Preferences */}
        <div className="mt-6 space-y-5"></div>
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

        {/* Chat Images */}
        <div className="mt-8">
          <h4 className="text-sm font-medium mb-3">Chat Images</h4>
          <div className="grid grid-cols-3 gap-2 mb-14">
            {chatImages.map((image) => (
              <div key={image.url} className="w-full">
                <img
                  onClick={() => setShowSelectedSendImage(image.url)}
                  src={image.url}
                  alt="chat"
                  className="w-full h-24 object-cover rounded-md"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatProfile;
