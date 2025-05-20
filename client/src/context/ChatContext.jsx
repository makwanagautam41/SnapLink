import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const backEndUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backEndUrl;

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unSeenMessages, setUnSeenMessages] = useState({});
  const [isTyping, setIsTyping] = useState(false);

  const { socket, token, user } = useAuth();

  const getUsersMessages = async () => {
    try {
      const response = await axios.get("/api/messages/users-messages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setUsers(response.data.users);
        setUnSeenMessages(response.data.unSeenMessages);
      }
    } catch (error) {
      console.log("Error fetching users and messages:", error.message);
    }
  };

  const getMessages = async (userId) => {
    try {
      const response = await axios.get(`/api/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.log("Error fetching messages:", error.message);
    }
  };

  const sendMessage = async (text) => {
    try {
      const response = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        { text },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        setMessages((prev) => [...prev, response.data.newMessage]);
        socket.emit("sendMessage", response.data.newMessage);
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      console.log("Error sending message:", error.message);
    }
  };

  const markAsSeen = async (messageId) => {
    try {
      await axios.put(`/api/messages/mark/${messageId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.log("Error marking message as seen:", error.message);
    }
  };

  const subscribeToMessages = () => {
    if (!socket) return;

    socket.off("newMessage");

    socket.on("newMessage", (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);
        markAsSeen(newMessage._id);
      } else {
        setUnSeenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: prev[newMessage.senderId]
            ? prev[newMessage.senderId] + 1
            : 1,
        }));
      }
    });
  };

  useEffect(() => {
    if (socket) subscribeToMessages();
    return () => {
      if (socket) socket.off("newMessage");
    };
  }, [socket, selectedUser]);

  useEffect(() => {
    if (token) getUsersMessages();
  }, [token]);

  return (
    <ChatContext.Provider
      value={{
        axios,
        messages,
        users,
        selectedUser,
        setSelectedUser,
        getMessages,
        sendMessage,
        unSeenMessages,
        setUnSeenMessages,
        getUsersMessages,
        markAsSeen,
        isTyping,
        setIsTyping,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
