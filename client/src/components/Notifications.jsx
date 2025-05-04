import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import SidebarNotifications from "../components/SidebarNotifications";
import PostTopBar from "./PostTopBar";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const {
    getNotifications,
    notifications,
    setNotifications,
    followRequests,
    setFollowRequests,
  } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        if (data.success) {
          setNotifications(data.notifications);
          setFollowRequests(data.followRequests);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    if (notifications.length === 0 && followRequests.length === 0) {
      fetchNotifications();
    }
  }, [
    getNotifications,
    notifications.length,
    followRequests.length,
    setNotifications,
    setFollowRequests,
  ]);

  return (
    <div>
      <PostTopBar title={"Notifications"} />
      <div className="flex-1 lg:ml-64 p-2 z-10 lg:px-8 mb-15">
        <div className="space-y-3 lg:space-y-5">
          {followRequests.map((followRequest, index) => (
            <SidebarNotifications key={index} followRequest={followRequest} />
          ))}
          {notifications.map((notification, index) => (
            <SidebarNotifications key={index} notification={notification} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
