import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useParams, Link } from "react-router-dom";
import useUserSearch from "../hooks/useUserSearch.js";
import { usePost } from "../context/PostContext.jsx";
import { useAuth } from "../context/AuthContext";
import { Icon } from "../utils/icons.js";
import toast from "react-hot-toast";
import Avtar from "../components/Avtar.jsx";
import UserProfileDetails from "../components/UserProfileDetails.jsx";
import PostTopBar from "../components/PostTopBar.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import useThemeStyles from "../utils/themeStyles.js";

const SearchedUserProfile = () => {
  const { username } = useParams();
  const styles = useThemeStyles();
  const { searchUserProfileData, searchedUser, setSearchedUser } =
    useUserSearch();
  const { fetchPostsByUsername, loadingPosts, userPosts } = usePost();
  const { user, sendFollowRequest, unfollowUser, manageUserBlocking } =
    useAuth();
  const [followStatus, setFollowStatus] = useState("Follow");
  const [showModal, setShowModal] = useState(false);
  const [showOptionModal, setShowOptionModal] = useState(false);

  const { theme } = useTheme();

  const fetchUser = async () => {
    try {
      const userData = await searchUserProfileData(username);
      const normalizedUser = normalizeUserData(userData);
      setSearchedUser(normalizedUser);

      if (normalizedUser.followRequests.includes(user._id)) {
        setFollowStatus("Requested");
      } else if (normalizedUser.followers.some((f) => f._id === user._id)) {
        setFollowStatus("Following");
      } else {
        setFollowStatus("Follow");
      }

      if (
        normalizedUser.profileVisibility === "public" ||
        normalizedUser.followers.some((f) => f._id === user._id)
      ) {
        await fetchPostsByUsername(username);
      }
    } catch (error) {
      console.error("Error fetching searched user data:", error);
    }
  };

  useEffect(() => {
    if (username && user) fetchUser();
  }, [username, user]);

  const normalizeUserData = (userData) => ({
    ...userData,
    followers: userData.followers || [],
    following: userData.following || [],
    followRequests: userData.followRequests || [],
  });

  const handleFollowRequest = async () => {
    try {
      const data = await sendFollowRequest(username);
      if (data.success) {
        const updatedUser = {
          ...searchedUser,
          followers:
            searchedUser.profileVisibility === "public"
              ? [...(searchedUser.followers || []), { _id: user._id }]
              : searchedUser.followers || [],
          followRequests:
            searchedUser.profileVisibility === "private"
              ? [...(searchedUser.followRequests || []), user._id]
              : searchedUser.followRequests || [],
        };
        setSearchedUser(updatedUser);

        if (searchedUser.profileVisibility === "private") {
          toast.success("Follow Request Sent");
          setFollowStatus("Requested");
        } else {
          setFollowStatus("Following");
        }
      } else {
        console.error("Follow failed:", data.message);
      }
    } catch (error) {
      console.error("Error sending follow request:", error);
    }
  };

  const handleUnfollow = async () => {
    try {
      const data = await unfollowUser(username);
      if (data.success) {
        const updatedUser = {
          ...searchedUser,
          followers: searchedUser.followers.filter((f) => f._id !== user._id),
        };
        setSearchedUser(updatedUser);
        setFollowStatus("Follow");
        setShowModal(false);
      } else {
        console.error("Unfollow failed:", data.message);
      }
    } catch (error) {
      console.error("Error unfollowing:", error);
    }
  };

  const isPrivate =
    searchedUser?.profileVisibility === "private" &&
    !searchedUser.followers.some((f) => f._id === user._id);

  const isBlocked = user?.blocked?.some((f) => f._id === searchedUser?._id);

  const handleFollowingClick = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleBlockUser = async (targetUsername) => {
    try {
      const res = await manageUserBlocking(targetUsername);
      if (res) {
        await fetchUser();
        toast.success(res.message);
      }
      setShowOptionModal(false);
    } catch (error) {
      console.error("Error blocking/unblocking user:", error);
    }
  };

  if (!searchedUser)
    return (
      <div
        className={`flex items-center justify-center h-screen w-full ${
          theme === "light" ? "bg-white" : null
        }`}
      >
        <Icon.Loader className="animate-spin text-gray-500 w-8 h-8" />
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto">
      <PostTopBar title={user.username} />
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8 lg:gap-10 border-b pb-6 mt-4">
        <Avtar profileImg={searchedUser.profileImg} />
        <div className="flex flex-col items-center sm:items-start mt-4 sm:mt-0 space-y-3 sm:space-y-4">
          <UserProfileDetails
            posts={searchedUser.postCount}
            username={searchedUser.username}
            name={searchedUser.name}
            followers={searchedUser.followers?.length || 0}
            following={searchedUser.following?.length || 0}
            bio={searchedUser.bio}
            searchUserProfileData={searchedUser}
            isPrivate={isPrivate}
            isBlocked={isBlocked}
            styles={styles}
          />

          {/* Follow / Following Button */}
          {isBlocked ? (
            <div
              onClick={() => handleBlockUser(username)}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer"
            >
              unblock
            </div>
          ) : (
            searchedUser.username !== user.username &&
            (followStatus === "Follow" || followStatus === "Requested" ? (
              <button
                onClick={handleFollowRequest}
                disabled={followStatus !== "Follow"}
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
              >
                {followStatus}
              </button>
            ) : (
              <div className="flex gap-4 items-center">
                <button
                  onClick={handleFollowingClick}
                  className={`px-6 py-2 rounded-md flex items-center gap-2 cursor-pointer ${styles.bg2}`}
                >
                  Following
                  <Icon.ArrowDown />
                </button>
                <button
                  className={`px-6 py-2 rounded-md flex items-center gap-2 cursor-pointer ${styles.bg2}`}
                >
                  Message
                </button>
                <Icon.DotsHorizontal
                  onClick={() => setShowOptionModal(true)}
                  size={24}
                  className="cursor-pointer"
                />
              </div>
            ))
          )}
        </div>
      </div>

      {showOptionModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[5099999] backdrop-brightness-50 bg-opacity-50">
          <div className={`rounded-lg w-80 ${styles.bg}`}>
            <button
              onClick={() => handleBlockUser(username)}
              className="w-full py-3 px-4 cursor-pointer text-center text-red-500 font-semibold border-b border-gray-200"
            >
              Block
            </button>

            <button className="w-full py-3 px-4 cursor-pointer text-center text-red-500 font-semibold border-b border-gray-200">
              Restrict
            </button>
            <button className="w-full py-3 px-4 cursor-pointer text-center text-red-500 font-semibold border-b border-gray-200">
              Report
            </button>
            <button className="w-full py-3 px-4 cursor-pointer text-center font-semibold border-b border-gray-200">
              Share
            </button>
            <button className="w-full py-3 px-4 cursor-pointer text-center font-semibold border-b border-gray-200">
              About this account
            </button>
            <button
              className="w-full py-3 px-4 cursor-pointer text-center"
              onClick={() => setShowOptionModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Posts Section or Private Message */}
      {isPrivate && isBlocked ? (
        <div className="text-center mt-10 text-gray-500">
          <p className="text-lg font-semibold">
            This Account is Private and Blocked
          </p>
          <p className="text-sm">
            You cannot follow, message, or interact with this account.
          </p>
        </div>
      ) : isPrivate ? (
        <div className="text-center mt-10 text-gray-500">
          <p className="text-lg font-semibold">This Account is Private</p>
          <p className="text-sm">Follow to see their photos and videos.</p>
        </div>
      ) : isBlocked ? (
        <div className="text-center mt-10 text-gray-500">
          <p className="text-lg font-semibold">You blocked This Account</p>
          <p className="text-sm">
            You cannot message, or interact with this account.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-1 mt-6 mb-12">
          {loadingPosts ? (
            <div className="col-span-full text-center text-gray-500">
              Loading posts...
            </div>
          ) : userPosts.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">
              No posts found.
            </p>
          ) : (
            userPosts.map((post) => (
              <Link
                to={`/profile/${searchedUser.username}/post/${post._id}`}
                state={{
                  searchedUserbackgroundLocation: {
                    pathname: location.pathname,
                  },
                }}
                key={post._id}
              >
                <div className="overflow-hidden cursor-pointer">
                  <img
                    src={
                      post.images[0]?.url ||
                      "https://res.cloudinary.com/djbqtwzyf/image/upload/v1744042607/default_img_gszetk.png"
                    }
                    alt="Post"
                    className="object-cover w-full aspect-16/21 transition-all duration-200 ease-in-out hover:brightness-50"
                  />
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {showModal &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 backdrop-brightness-50 flex items-center justify-center z-[9999]">
            <div
              className={`rounded-xl w-full sm:w-100 py-4 px-2 relative ${styles.bg}`}
            >
              <button
                onClick={closeModal}
                className="absolute top-3 right-4 text-2xl text-gray-400 cursor-pointer"
              >
                <Icon.Close />
              </button>

              <div className="flex flex-col items-center border-b border-gray-400 gap-1 pt-2 pb-4">
                <img
                  src={
                    searchedUser.profileImg ||
                    "https://res.cloudinary.com/djbqtwzyf/image/upload/v1744042607/default_img_gszetk.png"
                  }
                  alt="Profile"
                  className="w-14 h-14 rounded-full object-cover"
                />
                <p className="font-semibold text-sm">{searchedUser.username}</p>
              </div>

              <ul className="text-sm text-center space-y-3 pb-2">
                <li className=" py-2 cursor-pointer flex items-center justify-between px-4">
                  <span>Add to close friends list</span>
                  <span className="text-lg">
                    <Icon.Star />
                  </span>
                </li>
                <li className=" py-2 cursor-pointer flex items-center justify-between px-4">
                  <span>Add to favorites</span>
                  <span className="text-lg font text-xl">☆</span>
                </li>
                <li className=" py-2 cursor-pointer flex items-center justify-between px-4">
                  <span>Mute</span>
                  <span className="text-lg">
                    <Icon.ArrowRight />
                  </span>
                </li>
                <li className=" py-2 cursor-pointer flex items-center justify-between px-4">
                  <span>Restrict</span>
                  <span className="text-lg">
                    <Icon.ArrowRight />
                  </span>
                </li>
                <li
                  onClick={handleUnfollow}
                  className={`py-2 cursor-pointer px-4 text-left text-red-600 font-medium ${styles.hover}`}
                >
                  Unfollow
                </li>
              </ul>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default SearchedUserProfile;
