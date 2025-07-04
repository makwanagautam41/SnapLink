import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const AuthContext = createContext();
const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;
const backEndUrl = `${import.meta.env.VITE_BACKEND_URL}`;

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [followRequests, setFollowRequests] = useState([]);

  const getLoggedInUserInfor = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.message);
        console.log("Signin error:", error.response.data.message);
        return { success: false, message: error.response.data.message };
      } else {
        setError(error.message);
        console.log("Signin error:", error.message);
        return { success: false, message: error.message };
      }
    }
  };

  const signin = async (input) => {
    try {
      const response = await axios.post(`${BASE_URL}/users/signin`, input);
      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        setToken(response.data.token);
        connectSocket(response.data.user);
        setError("");
        return { success: true };
      }
      return { success: false, message: "Signin failed" };
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.message);
        return { success: false, message: error.response.data.message };
      } else {
        setError(error.message);
        return { success: false, message: error.message };
      }
    }
  };

  const signup = async (input) => {
    try {
      const response = await axios.post(`${BASE_URL}/users/signup`, input);
      if (response.data.success) {
        localStorage.setItem("isNewUser", "true");
        localStorage.setItem("token", response.data.token);
        connectSocket(response.data.user);
        setToken(response.data.token);
        setError("");
        return { success: true };
      }
      return { success: false, message: "Signup failed" };
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.message);
        console.log("Signup error:", error.response.data.message);
        return { success: false, message: error.response.data.message };
      } else {
        setError(error.message);
        console.log("Signup error:", error.message);
        return { success: false, message: error.message };
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setError("");
    setUser("");
  };

  const sendFollowRequest = async (targetUsername) => {
    try {
      const res = await fetch(`${BASE_URL}/users/follow/${targetUsername}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error sending follow request:", err);
      return { success: false, message: err.message };
    }
  };

  const unfollowUser = async (username) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/users/unfollow/${username}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.data;
    } catch (error) {
      console.error(
        "Error unfollowing user:",
        error.response?.data || error.message
      );
      return { success: false, message: error.message };
    }
  };

  const getNotifications = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/users/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (error) {
      console.error(
        "Error notification:",
        error.response?.data || error.message
      );
      return { success: false, message: error.message };
    }
  };

  const acceptFollowRequest = async (username) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/users/follow/accept/${username}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      getLoggedInUserInfor();
      return response.data;
    } catch (error) {
      console.error(
        "Error accepting follow request:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message:
          error.response?.data.message ||
          "Something went wrong accepting request",
      };
    }
  };

  const rejectFollowRequest = async (username) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/users/follow/reject/${username}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      getLoggedInUserInfor();
      return response.data;
    } catch (error) {
      console.error(
        "Error rejecting follow request:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message:
          error.response?.data.message ||
          "Something went wrong rejecting request",
      };
    }
  };

  const changeProfileImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.put(
        `${BASE_URL}/users/update-profile-img`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await getLoggedInUserInfor();
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  const updateProfileData = async (profileData) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/users/update`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await getLoggedInUserInfor();
      return response.data;
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: error?.response?.data?.message || "Update failed",
      };
    }
  };

  const removeProfileImg = async () => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${BASE_URL}/users/remove-profile-img`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const updateEmail = async (email) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/users/update-email`,
        { email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await getLoggedInUserInfor();
      return response.data;
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: error?.response?.data?.message || "Update failed",
      };
    }
  };

  const updatePhone = async (phone) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/users/update-phone`,
        { phone },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await getLoggedInUserInfor();
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || "Update failed",
      };
    }
  };

  const updatePassword = async (oldPassword, newPassword) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/users/update-password`,
        { oldPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
      localStorage.setItem("token", response.data.token);
      setToken(response.data.token);
      return response.data;
    } catch (error) {
      return error.response?.data;
    }
  };

  const changeProfileVisibility = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/users/update-profile-visibility`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return error.response?.data;
    }
  };

  const manageCloseFriend = async (addToCloseFriendTargetUsername) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/users/add-close-friend/${addToCloseFriendTargetUsername}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  const manageUserBlocking = async (blockUsername) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/users/block/${blockUsername}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  const changeUsername = async (newUsername) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/users/change-username`,
        {
          newUsername,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setError("");
        setSuccess(response.data.message);
        return response.data;
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const changeDateOfBirth = async (newDateOfBirth) => {
    try {
      const res = await axios.put(
        `${BASE_URL}/users/change-date-of-birth`,
        { newDateOfBirth },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await getLoggedInUserInfor();
      return res.data;
    } catch (err) {
      console.error("Error updating DOB:", err);
      return { success: false, message: "Server error" };
    }
  };

  const sendOtp = async (path) => {
    try {
      const response = await axios.post(
        `${BASE_URL}${path}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setError("");
        setSuccess(response.data.message);
        return response.data;
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const verifyUser = async (otp) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/users/verify-user`,
        { otp },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setError("");
        setSuccess(response.data.message);
        return response.data;
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deactivateAccount = async (message = "") => {
    try {
      const response = await axios.post(
        `${BASE_URL}/users/deactivate-account`,
        message.trim() ? { message } : {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        localStorage.removeItem("token");
        setToken("");
        setUser(null);
        setError("");
      }

      return response.data;
    } catch (error) {
      console.error("Deactivation API error:", error);
      return {
        success: false,
        message: "Something went wrong. Please try again later.",
      };
    }
  };

  const sendReactivateAccountOtp = async ({ email, username, password }) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/users/send-reactivate-account-otp`,
        {
          email,
          username,
          password,
        }
      );
      return res.data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to send OTP",
      };
    }
  };

  const verifyOtpAndReactivateAccount = async ({ email, otp }) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/users/verify-otp-and-reactivate-account`,
        {
          email,
          otp,
        }
      );
      if (res.data.success) {
        setError("");
        setSuccess("");
      }
      return res.data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "OTP verification failed",
      };
    }
  };

  const deleteAccount = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/users/delete-account`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.success) {
        localStorage.removeItem("token");
        setToken("");
        setError(res.data.message);
        setSuccess("");
      } else {
        setError(res.data.message);
        setSuccess("");
      }
      return res.data;
    } catch (err) {
      console.log(err);
      return {
        success: false,
        message: err.response?.data?.message || "failed",
      };
    }
  };

  const cancelAccountDeletion = async ({
    email,
    username,
    password,
    confirmCancel,
  }) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/users/cancel-account-deletion`,
        {
          email,
          username,
          password,
          confirmCancel,
        }
      );
      setSuccess(res.data.message);
      setError(null);
      return { success: true, message: res.data.message };
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to cancel account deletion";
      setError(message);
      console.log(err);
      setSuccess(null);
      return { success: false, message };
    }
  };

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const created = new Date(dateString);
    const secondsAgo = Math.floor((now - created) / 1000);

    const units = [
      { label: "week", seconds: 604800 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
      { label: "second", seconds: 1 },
    ];

    for (let unit of units) {
      const interval = Math.floor(secondsAgo / unit.seconds);
      if (interval >= 1) {
        return `${interval} ${unit.label}${interval > 1 ? "s" : ""} ago`;
      }
    }
    return "just now";
  };

  const connectSocket = (user) => {
    if (!user || socket?.connected) return;
    const newSocket = io(backEndUrl, {
      query: {
        userId: user._id,
      },
    });

    newSocket.connect();
    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });
  };

  useEffect(() => {
    const tempToken = localStorage.getItem("token");
    if (tempToken) {
      setToken(tempToken);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (token) {
      getLoggedInUserInfor();
    }
  }, [token]);

  useEffect(() => {
    if (token && user) {
      connectSocket(user);
    }
  }, [token, user]);

  return (
    <AuthContext.Provider
      value={{
        BASE_URL,
        token,
        signin,
        signup,
        logout,
        error,
        setError,
        success,
        setSuccess,
        user,
        setUser,
        loading,
        setLoading,
        getLoggedInUserInfor,
        sendFollowRequest,
        unfollowUser,
        getNotifications,
        notifications,
        setNotifications,
        followRequests,
        setFollowRequests,
        acceptFollowRequest,
        rejectFollowRequest,
        getRelativeTime,
        changeProfileImage,
        removeProfileImg,
        updateProfileData,
        updateEmail,
        updatePhone,
        updatePassword,
        changeProfileVisibility,
        manageCloseFriend,
        manageUserBlocking,
        changeUsername,
        changeDateOfBirth,
        sendOtp,
        verifyUser,
        deactivateAccount,
        sendReactivateAccountOtp,
        verifyOtpAndReactivateAccount,
        deleteAccount,
        cancelAccountDeletion,
        onlineUsers,
        setOnlineUsers,
        socket,
        setSocket,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
