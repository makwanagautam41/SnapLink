import React, {
  createContext,
  use,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const PostContext = createContext();
const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

export const PostProvider = ({ children }) => {
  const { token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [userPosts, setUserPosts] = useState([]);
  const [publicPosts, setPublicPost] = useState([]);
  const [feed, setFeed] = useState([]);
  const [isPostDeleting, setIsPostDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  // image croping
  const [showModal, setShowModal] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);

  const removePosts = () => {
    setPosts([]);
    setLoadingPosts(false);
    setNewComment("");
  };

  const fetchUserPosts = async () => {
    try {
      setLoadingPosts(true);
      const response = await axios.get(`${BASE_URL}/posts/my-posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setPosts(response.data.posts);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error.message);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchPostsByUsername = async (username) => {
    try {
      setLoadingPosts(true);
      const response = await axios.get(
        `${BASE_URL}/posts/searched-user/${username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setUserPosts(response.data.posts);
      } else {
        console.error("Failed to fetch posts:", response.data.message);
        return [];
      }
    } catch (error) {
      console.error(
        "Error fetching posts by username:",
        error.response?.data?.message || error.message
      );
      return [];
    } finally {
      setLoadingPosts(false);
    }
  };

  const postComment = async (comment, postId) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/posts/${postId}/comment`,
        { comment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        return response.data;
      } else {
        console.error("Failed to post comment:", response.data.message);
        return [];
      }
    } catch (error) {
      console.error(
        "Error while posting comment:",
        error.response?.data?.message || error.message
      );
      return [];
    }
  };

  const fetchAllPublicPosts = useCallback(async () => {
    try {
      setLoadingPosts(true);
      const response = await axios.get(`${BASE_URL}/posts/explore`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setPublicPost(response.data.posts);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingPosts(false);
    }
  }, [token]);

  const fetchMyFeed = async () => {
    try {
      setLoadingPosts(true);
      const response = await axios.get(`${BASE_URL}/posts/feed`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setFeed(response.data.posts);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const AddNewPost = async (croppedImage, caption) => {
    try {
      setLoadingPosts(true);
      const postData = new FormData();
      postData.append("images", croppedImage);
      postData.append("caption", caption || "");

      const response = await axios.post(`${BASE_URL}/posts/create`, postData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchUserPosts();
      return response.data;
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const deletePost = async (postId) => {
    try {
      setIsPostDeleting(true);
      const response = await axios.delete(`${BASE_URL}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchUserPosts();
      return response.data;
    } catch (error) {
      console.log(error);
    } finally {
      setIsPostDeleting(false);
    }
  };

  const deleteComment = async (postId, commentId) => {
    try {
      setLoadingPosts(true);
      const response = await axios.delete(
        `${BASE_URL}/posts/${postId}/comment/${commentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const likePost = async (postId) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/posts/${postId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    if (token) {
      fetchUserPosts();
    }
  }, [token]);

  return (
    <PostContext.Provider
      value={{
        token,
        removePosts,
        posts,
        setPosts,
        fetchUserPosts,
        loadingPosts,
        setLoadingPosts,
        isPostDeleting,
        setIsPostDeleting,
        fetchPostsByUsername,
        userPosts,
        setUserPosts,
        newComment,
        setNewComment,
        postComment,
        publicPosts,
        fetchAllPublicPosts,
        AddNewPost,
        deletePost,
        deleteComment,
        likePost,
        handleCopy,
        copied,
        fetchMyFeed,
        feed,
        setFeed,
        // image croping
        showModal,
        setShowModal,
        imageSrc,
        setImageSrc,
        showCropModal,
        setShowCropModal,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const usePost = () => useContext(PostContext);
