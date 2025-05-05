import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import SidebarNotifications from "../components/SidebarNotifications";
import PostTopBar from "./PostTopBar";
import { useNavigate } from "react-router-dom";
import { Icon } from "../utils/icons";

const Notifications = () => {
  const {
    getNotifications,
    notifications,
    setNotifications,
    followRequests,
    setFollowRequests,
  } = useAuth();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const data = await getNotifications();
        if (data.success) {
          setNotifications(data.notifications);
          setFollowRequests(data.followRequests);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
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
          {loading ? (
            <div className="flex items-center justify-center h-screen w-full">
              <Icon.Loader className="animate-spin text-gray-500 w-8 h-8" />
            </div>
          ) : (
            <>
              {followRequests.map((followRequest, index) => (
                <SidebarNotifications
                  key={index}
                  followRequest={followRequest}
                />
              ))}
              {notifications.map((notification, index) => (
                <SidebarNotifications key={index} notification={notification} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
