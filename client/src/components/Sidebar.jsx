import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePost } from "../context/PostContext";
import SidebarNotifications from "./SidebarNotifications";
import { Icon } from "../utils/icons.js";
import AddNewPost from "./AddNewPost.jsx";
import { useTheme } from "../context/ThemeContext";
import useThemeStyles from "../utils/themeStyles.js";

const navItems = [
  { id: "", label: "Home", icon: <Icon.Home size={24} /> },
  { id: "search", label: "Search", icon: <Icon.Search size={24} /> },
  { id: "explore", label: "Explore", icon: <Icon.Explore size={24} /> },
  { id: "reels", label: "Reels", icon: <Icon.Reel size={24} /> },
  { id: "message", label: "Message", icon: <Icon.Message size={24} /> },
  {
    id: "notifications",
    label: "Notifications",
    icon: <Icon.HeartOutline size={24} />,
  },
  { id: "create", label: "Create", icon: <Icon.Plus size={24} /> },
  { id: "profile", label: "Profile", icon: <Icon.User size={24} /> },
];

const Sidebar = () => {
  const [scrollingUp, setScrollingUp] = useState(false);
  const [prevScrollY, setPrevScrollY] = useState(0);
  const [notificationsMenuOpen, setNotificationsMenuOpen] = useState(false);
  const [searchMenuOpen, setSearchMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [activeItem, setActiveItem] = useState("");
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { removeUserPosts } = usePost();
  const {
    BASE_URL,
    logout,
    user,
    token,
    getSearchedUserInfo,
    getNotifications,
    notifications,
    setNotifications,
    followRequests,
    setFollowRequests,
  } = useAuth();

  const { theme, toggleTheme } = useTheme();
  const styles = useThemeStyles();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollingUp(currentScrollY > prevScrollY);
      setPrevScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollY]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim()) {
        setLoading(true);
        axios
          .get(`${BASE_URL}/users/profile/${searchQuery}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((res) => {
            if (res.data.users && res.data.users.length > 0) {
              setSearchResult(res.data.users);
            } else {
              setSearchResult([]);
            }
          })
          .catch(() => {
            setSearchResult([]);
          })
          .finally(() => setLoading(false));
      } else {
        setSearchResult([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleNavigation = (id) => {
    setActiveItem(id);
    navigate(`/${id}`);
  };

  const toggleNotificationsMenu = async () => {
    if (!notificationsMenuOpen) {
      setMoreMenuOpen(false);
      setSearchMenuOpen(false);
      const data = await getNotifications();
      if (data.success) {
        setNotifications(data.notifications);
        setFollowRequests(data.followRequests);
      }
    }
    setNotificationsMenuOpen((prev) => !prev);
  };

  const toggleSearchMenu = () => {
    setSearchMenuOpen((prev) => {
      if (!prev) {
        setMoreMenuOpen(false);
        setNotificationsMenuOpen(false);
      }
      return !prev;
    });
  };

  const toggleMoreMenu = () => {
    setMoreMenuOpen((prev) => {
      if (!prev) {
        setNotificationsMenuOpen(false);
        setSearchMenuOpen(false);
      }
      return !prev;
    });
  };

  const toggleCreateMenu = () => {
    setCreateMenuOpen((prev) => !prev);
    setMoreMenuOpen(false);
    setNotificationsMenuOpen(false);
    setSearchMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    removeUserPosts();
    navigate("/signin");
  };

  useEffect(() => {
    const path = location.pathname.split("/")[1];
    if (path === user?.username) {
      setActiveItem("profile");
    } else if (path.includes("/explore/search")) {
      setActiveItem("search");
    } else {
      setActiveItem(path || "");
    }
  }, [location, user]);

  useEffect(() => {
    setSearchMenuOpen(false);
    setSearchQuery("");
  }, [location.pathname]);

  useEffect(() => {
    const handleRouteRedirect = () => {
      const path = location.pathname;
      const mediaQuery = window.matchMedia("(min-width: 1024px)");

      if (mediaQuery.matches && path === "/explore/search") {
        navigate("/explore", { replace: true });
      } else if (!mediaQuery.matches && path === "/explore") {
        navigate("/explore/search", { replace: true });
      }
    };

    handleRouteRedirect();

    const resizeListener = () => handleRouteRedirect();
    window.addEventListener("resize", resizeListener);

    return () => window.removeEventListener("resize", resizeListener);
  }, [location.pathname, navigate]);

  return (
    <>
      {/* Top Navbar (Mobile) */}
      {activeItem === "" || activeItem === "reels" ? (
        <div
          className={`lg:hidden fixed top-0 left-0 w-full shadow-md z-20 flex justify-between items-center p-4 transition-transform duration-300 ${
            scrollingUp ? "-translate-y-full" : "translate-y-0"
          } ${styles.bg}`}
        >
          <div className="text-2xl" style={{ fontFamily: "Lobster" }}>
            SnapLink
          </div>
          <div className="flex gap-4">
            <button onClick={toggleCreateMenu}>
              <Icon.Plus size={24} />
            </button>
            <button onClick={() => navigate("/notification")}>
              <Icon.Heart size={24} />
            </button>
          </div>
        </div>
      ) : null}

      {/* Sidebar (Desktop) */}
      <aside
        className={`lg:flex hidden flex-col w-64 h-screen px-4 py-8 fixed top-0 left-0 z-40 justify-between ${
          theme === "light"
            ? "shadow-lg"
            : "shadow-[4px_0_8px_rgba(255,255,255,0.1)]"
        }`}
      >
        <div>
          <div
            className="text-2xl mb-10 font-lobster"
            style={{ fontFamily: "Lobster" }}
          >
            SnapLink
          </div>
          <nav className="flex flex-col gap-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "search") {
                    toggleSearchMenu();
                  } else if (item.id === "notifications") {
                    toggleNotificationsMenu();
                  } else if (item.id === "profile") {
                    navigate(`/${user.username}`);
                  } else if (item.id === "search") {
                    navigate("/explore/search");
                  } else if (item.id === "create") {
                    toggleCreateMenu();
                  } else {
                    handleNavigation(item.id);
                  }
                }}
                className={`flex cursor-pointer items-center gap-3 p-2 rounded-md transition
                  ${styles.hover}
                  ${activeItem === item.id ? styles.bg2 : ""}
                `}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* More Menu */}
        <nav className="flex flex-col gap-6 relative">
          <button
            onClick={toggleMoreMenu}
            className={`flex cursor-pointer items-center gap-3 transition ${
              theme === "light" ? "text-gray-800" : "text-white"
            }`}
          >
            <Icon.Menu size={24} />
            More
          </button>

          {moreMenuOpen && (
            <div
              className={`absolute bottom-10 flex flex-col w-48 shadow-lg rounded-lg overflow-hidden z-50
              ${styles.bg}
            `}
            >
              <button
                onClick={() => {
                  navigate("/settings");
                  toggleMoreMenu(false);
                }}
                className={`px-4 py-3 text-left transition-colors
                ${styles.hover}
              `}
              >
                Settings
              </button>
              <button
                onClick={() => {
                  navigate("/saved");
                  toggleMoreMenu(false);
                }}
                className={`px-4 py-3 text-left transition-colors
                  ${styles.hover}
              `}
              >
                Saved
              </button>
              <button
                onClick={handleLogout}
                className={`px-4 py-3 text-left transition-colors
                  ${styles.hover}
              `}
              >
                Logout
              </button>
              <button
                onClick={toggleTheme}
                className={`px-4 py-3 text-left transition-colors
                  ${styles.hover}
              `}
              >
                <div className="flex items-center gap-2">
                  <Icon.toggleOn
                    size={35}
                    className={theme === "light" ? "rotate-180" : ""}
                  />
                  <p>{theme === "light" ? "Dark" : "Light"}</p>
                </div>
              </button>
            </div>
          )}
        </nav>
      </aside>

      {/* Bottom Navigation (Mobile) */}
      <nav
        className={`lg:hidden fixed bottom-0 left-0 w-full p-4 py-3 flex justify-around z-50 rounded-t-2xl ${
          theme === "light"
            ? "shadow-[0_-4px_8px_rgba(0,0,0,0.1)] bg-white"
            : "bg-gray-900 shadow-[0_-4px_12px_rgba(255,255,255,0.2)]"
        }`}
      >
        {navItems
          .filter(
            (item) => !["explore", "notifications", "create"].includes(item.id)
          )
          .map((item) => (
            <motion.button
              key={item.id}
              onClick={() => {
                if (item.id === "profile") {
                  navigate(`/${user.username}`);
                } else if (item.id === "search") {
                  navigate("/explore/search");
                } else {
                  handleNavigation(item.id);
                }
              }}
              className={`flex flex-col cursor-pointer items-center p-2 text-xs font-semibold relative ${
                activeItem === item.id
                  ? "text-[#009688]"
                  : "hover:text-[#009688]"
              }`}
              animate={{
                scale: activeItem === item.id ? 1.1 : 1,
                transition: { type: "spring", stiffness: 300, damping: 20 },
              }}
            >
              {item.icon}
              {activeItem === item.id && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#009688] rounded-md"></div>
              )}
            </motion.button>
          ))}
      </nav>

      {/* Notifications Panel */}
      <div
        className={`fixed top-0 left-0 w-80 h-full shadow-lg transform transition-all duration-300 ease-in-out ${
          notificationsMenuOpen ? "translate-x-0" : "-translate-x-full"
        } ${styles.bg}`}
        style={{ zIndex: 50 }}
      >
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Notifications</h2>
          <button
            onClick={toggleNotificationsMenu}
            className="text-gray-600 cursor-pointer"
          >
            <Icon.Close size={24} />
          </button>
        </div>
        <div
          className="p-4 overflow-y-auto "
          style={{ maxHeight: "calc(100vh - 80px)" }}
        >
          {followRequests.map((followRequest, index) => (
            <SidebarNotifications key={index} followRequest={followRequest} />
          ))}
          {notifications.map((notification, index) => (
            <SidebarNotifications key={index} notification={notification} />
          ))}
        </div>
      </div>

      {/* Search Panel */}
      <div
        className={`fixed top-0 left-0 w-80 h-full shadow-lg transform transition-all duration-300 ease-in-out ${
          searchMenuOpen ? "translate-x-0" : "-translate-x-full"
        } ${styles.bg} overflow-y-auto`}
        style={{ zIndex: 50 }}
      >
        <div className="p-4 flex justify-between items-center sticky top-0 z-20">
          <h2 className="text-2xl font-bold">Search</h2>
          <button
            onClick={toggleSearchMenu}
            className="text-gray-600 cursor-pointer"
          >
            <Icon.Close size={24} />
          </button>
        </div>

        <div className={`p-2 sticky top-[64px] z-10`}>
          <input
            type="text"
            placeholder="Search..."
            className={`p-2 w-full rounded focus:outline-none ${styles.input}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchMenuOpen && searchResult.length > 0 ? (
            <button
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
              onClick={() => {
                setSearchQuery("");
              }}
            >
              <Icon.CloseCircle size={16} />
            </button>
          ) : null}
        </div>

        {/* Search Results */}
        <div className="p-2">
          {loading ? (
            <p className="text-sm text-gray-500">Searching...</p>
          ) : searchResult && searchResult.length > 0 ? (
            searchResult.map((user) => (
              <div
                key={user.username}
                className={`flex items-center gap-3 p-2 cursor-pointer rounded ${styles.hover}`}
                onClick={() => {
                  navigate(`/profile/${user.username}`);
                  getSearchedUserInfo(user.username);
                  setSearchMenuOpen(false);
                  setSearchQuery("");
                }}
              >
                <img
                  src={
                    user.profileImg ||
                    "https://res.cloudinary.com/djbqtwzyf/image/upload/v1744042607/default_img_gszetk.png"
                  }
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-sm text-gray-400">{user.name}</p>
                </div>
              </div>
            ))
          ) : searchQuery.trim() !== "" ? (
            <p className="text-sm text-gray-500">No user found.</p>
          ) : null}
        </div>
      </div>

      {/* Create Modal */}
      {createMenuOpen && (
        <AddNewPost toggleCreateMenu={toggleCreateMenu} theme={theme} />
      )}
    </>
  );
};

export default Sidebar;
