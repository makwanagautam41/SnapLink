import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const useUserSearch = (searchQuery, isSearchMenuOpen) => {
  const { BASE_URL, token } = useAuth();
  const [searchResult, setSearchResult] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchedUser, setSearchedUser] = useState(null);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery?.trim()) {
        setLoading(true);
        axios
          .get(`${BASE_URL}/users/profile/${searchQuery}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((res) => {
            setSearchResult(res.data.users || []);
          })
          .catch(() => {
            setSearchResult([]);
          })
          .finally(() => setLoading(false));
      } else {
        setSearchResult(null);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, token]);

  useEffect(() => {
    if (isSearchMenuOpen && !searchQuery.trim()) {
      axios
        .get(`${BASE_URL}/users/past-searched-user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setRecentSearches(res.data.recentSearches || []);
        })
        .catch(() => {
          setRecentSearches([]);
        });
    }
  }, [isSearchMenuOpen, searchQuery, token]);

  const searchUserProfileData = async (username) => {
    try {
      const response = await axios.get(`${BASE_URL}/users/profile/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSearchedUser(response.data.users?.[0]);
      return response.data.users?.[0];
    } catch (error) {
      return error;
    }
  };

  return {
    searchResult,
    recentSearches,
    loading,
    searchUserProfileData,
    searchedUser,
    setSearchedUser,
  };
};

export default useUserSearch;
