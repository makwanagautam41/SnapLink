import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const StoryContext = createContext();
const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

export const StoryProvider = ({ children }) => {
  const { token } = useAuth();
  const [stories, setStories] = useState([]);
  const [myStories, setMyStories] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOtherUsersStories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/story/fetch-stories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setStories(response.data.stories);
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch posts:", error.message);
    }
  };

  const fetchMyStories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/story/my-story`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setMyStories(response.data.stories);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error.message);
    }
  };

  const uploadStory = async ({ croppedMedia, selectedFile, caption }) => {
    try {
      const formData = new FormData();

      if (croppedMedia) {
        const response = await fetch(croppedMedia);
        const blob = await response.blob();
        formData.append("media", blob, selectedFile.name);
      } else {
        formData.append("media", selectedFile);
      }

      if (caption) {
        formData.append("caption", caption);
      }

      const uploadResponse = await axios.post(
        `${BASE_URL}/story/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return uploadResponse.data;
    } catch (error) {
      throw error;
    }
  };

  const deleteStory = async (storyId) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/story/delete/${storyId}`,
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

  const addToViewStory = async (storyId) => {
    try {
      const response = await axios.get(`${BASE_URL}/story/view/${storyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOtherUsersStories();
    }
  }, [token]);

  return (
    <StoryContext.Provider
      value={{
        token,
        fetchOtherUsersStories,
        stories,
        setStories,
        fetchMyStories,
        myStories,
        setMyStories,
        deleteStory,
        uploadStory,
        addToViewStory,
        loading,
        setLoading,
      }}
    >
      {children}
    </StoryContext.Provider>
  );
};

export const useStory = () => useContext(StoryContext);
