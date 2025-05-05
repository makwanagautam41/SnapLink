import React, { useState } from "react";
import { Icon } from "../../utils/icons.js";
import { Link, useNavigate, useLocation } from "react-router-dom";
import PostTopBar from "../PostTopBar.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useAuth } from "..//../context/AuthContext.jsx";
import useThemeStyles from "..//../utils/themeStyles.js";

const SettingMenu = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const styles = useThemeStyles();
  const location = useLocation();
  const { theme } = useTheme();
  const { logout } = useAuth();

  const settingMenuItems = [
    {
      name: "Personal Details",
      path: "personal-details",
      icon: <Icon.User size={24} />,
    },
    {
      name: "Password And Security",
      path: "password-and-security",
      icon: <Icon.Security size={24} />,
    },
    {
      name: "Edit Profile",
      path: "edit-profile",
      icon: <Icon.EditUser size={25} />,
    },
    {
      name: "Account Privacy",
      path: "account-privacy",
      icon: <Icon.Lock size={24} />,
    },
    {
      name: "Account Verification",
      path: "account-verification",
      icon: <Icon.Lock size={24} />,
    },
    {
      name: "Close Friend",
      path: "close-friend",
      icon: <Icon.Star size={24} />,
    },
    { name: "Blocked", path: "blocked", icon: <Icon.Block size={23} /> },
    {
      name: "Switch Appearance",
      path: "switch-appearance",
      icon: <Icon.Theme size={24} />,
    },
    {
      name: "Report Problem",
      path: "report-problem",
      icon: <Icon.Report size={24} />,
    },
    {
      name: "Logout",
      path: "logout",
      icon: <Icon.Logout size={24} />,
    },
  ];

  const filteredItems = settingMenuItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  return (
    <div>
      <PostTopBar title={"Settings"} />
      <div
        className={`flex flex-col h-full w-[400px] shadow-md p-2 flex-grow ${
          theme === "light"
            ? "bg-gray-50 text-gray-800"
            : "text-gray-100 border-r border-gray-800"
        }`}
      >
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center py-4">
              <button type="submit" className="p-2 focus:outline-none">
                <Icon.Search size={24} />
              </button>
            </span>
            <input
              type="search"
              name="Search"
              placeholder="Search..."
              autoComplete="off"
              className={`w-full py-2 pl-10 text-sm rounded-md shadow-md focus:outline-none ${styles.input}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Navigation Items */}
          <div className="flex-1">
            <ul className="pb-4 space-y-1 text-sm">
              {filteredItems.map((item, index) => {
                const isActive = location.pathname.includes(item.path);

                if (item.name === "Logout") {
                  return (
                    <li
                      key={index}
                      onClick={handleLogout}
                      className="flex items-center p-2 space-x-3 rounded-md cursor-pointer text-red-600 lg:hidden"
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </li>
                  );
                }

                return (
                  <Link
                    to={item.path}
                    key={index}
                    className={`flex items-center p-2 space-x-3 rounded-md ${styles.acitve} ${styles.hover}`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingMenu;
