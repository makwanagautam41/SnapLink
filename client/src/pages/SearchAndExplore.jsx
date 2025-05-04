import React, { useState, useEffect } from "react";
import { Icon } from "../utils/icons.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useUserSearch from "../hooks/useUserSearch";
import Explore from "./Explore";
import { useTheme } from "../context/ThemeContext";

const SearchAndExplore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMenuOpen, setSearchMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const navigate = useNavigate();
  const { token } = useAuth();

  const { searchResult, recentSearches, loading } = useUserSearch(
    searchQuery,
    token,
    searchMenuOpen
  );
  const { theme } = useTheme();
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div>
      <div
        className={`${
          isSticky
            ? "fixed top-0 left-0 w-full px-4 py-2 z-50 mt-[2px]"
            : "relative"
        } transition-all duration-300 ease-in-out`}
      >
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            className={`w-full px-4 py-2 pr-12 rounded-lg shadow-sm border focus:outline-none transition
    ${
      theme === "light"
        ? "bg-gray-100 text-gray-700 border-gray-300 placeholder-gray-500"
        : "bg-gray-900 text-white border-gray-600 placeholder-gray-300"
    }
  `}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchMenuOpen(true)}
          />

          {searchMenuOpen && (
            <button
              className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
              onClick={() => {
                setSearchQuery("");
                setSearchMenuOpen(false);
              }}
            >
              <Icon.CloseCircle size={20} />
            </button>
          )}
        </div>
      </div>

      {searchMenuOpen ? (
        <div className="fixed top-[90px] left-0 w-full h-[calc(100%-6rem)] shadow-lg overflow-y-auto transition-all duration-300 ease-in-out z-40">
          <div className="p-2">
            {recentSearches.length > 0 ? <p className="mb-4">Recent</p> : null}
            {loading ? (
              <p className="text-sm text-gray-500">Searching...</p>
            ) : searchResult !== null ? (
              searchResult.length > 0 ? (
                searchResult.map((user) => (
                  <div
                    key={user.username}
                    className={`flex items-center gap-3 p-2 hover:bg-gray-100 cursor-pointer rounded ${
                      theme === "light"
                        ? "hover:bg-gray-200 hover:text-gray-900"
                        : "hover:bg-gray-900 hover:text-white"
                    }`}
                    onClick={() => {
                      navigate(`/profile/${user.username}`);
                      setSearchMenuOpen(false);
                      setSearchQuery("");
                    }}
                  >
                    <img
                      src={user.profileImg || "https://via.placeholder.com/50"}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold">{user.username}</p>
                      <p className="text-sm text-gray-600">{user.name}</p>
                    </div>
                  </div>
                ))
              ) : (
                searchQuery.trim() !== "" && (
                  <p className="text-sm text-gray-500">No user found.</p>
                )
              )
            ) : recentSearches.length > 0 ? (
              recentSearches.map((user) => (
                <div
                  key={user.username}
                  className={`flex items-center gap-3 p-2 cursor-pointer rounded ${
                    theme === "light"
                      ? "hover:bg-gray-200"
                      : "hover:bg-gray-800"
                  }`}
                  onClick={() => {
                    navigate(`/profile/${user.username}`);
                    setSearchMenuOpen(false);
                    setSearchQuery("");
                  }}
                >
                  <img
                    src={user.profileImg || "https://via.placeholder.com/50"}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{user.username}</p>
                    <p className="text-sm text-gray-500">{user.name}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No recent searches.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="top-[90px] left-0 w-full h-[calc(100%-6rem)] overflow-y-auto transition-all duration-300 ease-in-out z-30 mt-2">
          <Explore />
        </div>
      )}
    </div>
  );
};

export default SearchAndExplore;
