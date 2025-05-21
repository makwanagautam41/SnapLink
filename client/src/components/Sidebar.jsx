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
  { id: "create", label: "Create", icon: <Icon.Plus size={24} /> },
  { id: "reels", label: "Reels", icon: <Icon.Reel size={24} /> },
  { id: "message", label: "Message", icon: <Icon.Message size={24} /> },
  {
    id: "notifications",
    label: "Notifications",
    icon: <Icon.HeartOutline size={24} />,
  },

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
  const hideComponent = location.pathname.endsWith("/chat");

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
            <button onClick={() => navigate("/notification")}>
              <Icon.Heart size={27} className="cursor-pointer" />
            </button>
            <button onClick={() => navigate("/message")} className="relative">
              <svg
                className={`button__icon ${styles.text} cursor-pointer hover:rotate-40 transition-all duration-300`}
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M14.2199 21.9352C13.0399 21.9352 11.3699 21.1052 10.0499 17.1352L9.32988 14.9752L7.16988 14.2552C3.20988 12.9352 2.37988 11.2652 2.37988 10.0852C2.37988 8.91525 3.20988 7.23525 7.16988 5.90525L15.6599 3.07525C17.7799 2.36525 19.5499 2.57525 20.6399 3.65525C21.7299 4.73525 21.9399 6.51525 21.2299 8.63525L18.3999 17.1252C17.0699 21.1052 15.3999 21.9352 14.2199 21.9352ZM7.63988 7.33525C4.85988 8.26525 3.86988 9.36525 3.86988 10.0852C3.86988 10.8052 4.85988 11.9052 7.63988 12.8252L10.1599 13.6652C10.3799 13.7352 10.5599 13.9152 10.6299 14.1352L11.4699 16.6552C12.3899 19.4352 13.4999 20.4252 14.2199 20.4252C14.9399 20.4252 16.0399 19.4352 16.9699 16.6552L19.7999 8.16525C20.3099 6.62525 20.2199 5.36525 19.5699 4.71525C18.9199 4.06525 17.6599 3.98525 16.1299 4.49525L7.63988 7.33525Z"
                  fill="currentColor"
                ></path>
                <path
                  d="M10.11 14.7052C9.92005 14.7052 9.73005 14.6352 9.58005 14.4852C9.29005 14.1952 9.29005 13.7152 9.58005 13.4252L13.16 9.83518C13.45 9.54518 13.93 9.54518 14.22 9.83518C14.51 10.1252 14.51 10.6052 14.22 10.8952L10.64 14.4852C10.5 14.6352 10.3 14.7052 10.11 14.7052Z"
                  fill="currentColor"
                ></path>
              </svg>
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
      {!hideComponent && (
        <nav
          className={`lg:hidden fixed bottom-0 left-0 w-full p-4 py-3 flex justify-around z-50 rounded-t-2xl ${
            styles.bg
          } ${
            theme === "light"
              ? "shadow-[0_-4px_8px_rgba(0,0,0,0.1)]"
              : "shadow-[0_-4px_12px_rgba(255,255,255,0.2)]"
          }`}
        >
          {navItems
            .filter(
              (item) =>
                !["explore", "notifications", "message"].includes(item.id)
            )
            .map((item) => (
              <motion.button
                key={item.id}
                onClick={() => {
                  if (item.id === "profile") {
                    navigate(`/${user.username}`);
                  } else if (item.id === "search") {
                    navigate("/explore/search");
                  } else if (item.id === "create") {
                    toggleCreateMenu(true);
                  } else {
                    handleNavigation(item.id);
                  }
                }}
                className={`flex flex-col cursor-pointer items-center p-2 text-xs font-semibold relative ${
                  activeItem === item.id
                    ? "text-[#795238]"
                    : "hover:text-[#795238]"
                }`}
                animate={{
                  scale: activeItem === item.id ? 1.1 : 1,
                  transition: { type: "spring", stiffness: 300, damping: 20 },
                }}
              >
                {item.icon}
                {activeItem === item.id && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#795238] rounded-md"></div>
                )}
              </motion.button>
            ))}
        </nav>
      )}

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
          {notifications.length === 0 && followRequests.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 mt-10 text-sm">
              No notifications
            </p>
          ) : (
            followRequests.map((followRequest, index) => (
              <SidebarNotifications key={index} followRequest={followRequest} />
            ))
          )}
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
