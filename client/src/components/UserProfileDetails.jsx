import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../utils/icons";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";

const UserProfileDetails = ({
  posts = 0,
  username,
  followers = 0,
  following = 0,
  bio = "",
  isCurrentUser = false,
  searchUserProfileData,
  isPrivate,
  name,
  styles,
}) => {
  const { user } = useAuth();
  const [openModalFollow, setOpenModalFollow] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const userData = isCurrentUser ? user : searchUserProfileData;

  const isPersonFollowedByMe = (personId) =>
    user.following?.some((f) => f._id === personId);

  return (
    <div
      className={`flex flex-col items-center justify-center sm:items-start sm:mt-0 space-y-3 sm:space-y-4`}
    >
      <div className="flex flex-col mt-5 sm:flex-row sm:items-center sm:space-x-4 text-center sm:text-left w-full">
        <p className="text-xl sm:text-2xl font-semibold">{username}</p>

        {isCurrentUser && (
          <div className="flex justify-center items-center sm:justify-start space-x-3 mt-2 sm:mt-0">
            <Link
              to="/edit-profile"
              className={`text-sm px-4 py-2 rounded-lg transition ${styles.bg2}`}
            >
              Edit Profile
            </Link>
            <Link
              to="/view-archive"
              className={`text-sm px-4 py-2 rounded-lg transition ${styles.bg2}`}
            >
              View Archive
            </Link>
            <Link
              to="/settings"
              className={`hidden sm:inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition ${styles.bg2}`}
            >
              <Icon.Setting size={20} />
            </Link>
          </div>
        )}
      </div>

      <div
        className={`flex justify-center sm:justify-start space-x-4 text-sm w-full`}
      >
        <p>
          <span className="font-semibold">{posts}</span> posts
        </p>
        <p
          onClick={() => setOpenModalFollow("followers")}
          className="cursor-pointer"
        >
          <span className="font-semibold">{followers}</span> followers
        </p>
        <p
          onClick={() => setOpenModalFollow("following")}
          className="cursor-pointer"
        >
          <span className="font-semibold">{following}</span> following
        </p>
      </div>

      {!isPrivate && openModalFollow && (
        <Modal onClose={() => setOpenModalFollow(null)} styles={styles}>
          <div className="p-4">
            <h2 className="text-lg font-semibold capitalize border-b border-gray-400 pb-2">
              {openModalFollow}
            </h2>
            <input
              type="text"
              placeholder="Search..."
              className={`p-2 w-full rounded focus:outline-none transition ${styles.input}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="space-y-4 max-h-70 overflow-y-auto">
              {(userData?.[openModalFollow] || [])
                .filter((person) =>
                  person.username
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
                )
                .map((person) => {
                  const isFollowedByMe = isPersonFollowedByMe(person._id);

                  let buttonLabel = "";
                  if (isCurrentUser) {
                    buttonLabel =
                      openModalFollow === "followers" ? "Remove" : "Following";
                  } else {
                    buttonLabel = isFollowedByMe ? "Following" : "Follow";
                  }

                  return (
                    <div
                      key={person._id}
                      className={`flex justify-between items-center space-x-4 p-2 rounded-lg ${styles.hover}`}
                    >
                      <Link to={`/profile/${person.username}`}>
                        <div className="flex items-center gap-2">
                          <img
                            src={person.profileImg || "/default-avatar.png"}
                            alt={person.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <p className="font-medium">{person.username}</p>
                        </div>
                      </Link>

                      <button
                        className={`px-3 py-1 rounded-md text-sm ${
                          buttonLabel === "Follow"
                            ? "bg-blue-500 text-white"
                            : `text-black bg-gray-400`
                        }`}
                      >
                        {buttonLabel}
                      </button>
                    </div>
                  );
                })}
              {(!userData?.[openModalFollow] ||
                userData[openModalFollow].filter((person) =>
                  person.username
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
                ).length === 0) && (
                <p className="text-gray-500 text-center">No users found</p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {bio && (
        <div className="justify-center overflow-y-auto max-h-36 sm:max-h-48 w-full">
          <p className="text-center md:text-left">{name}</p>
          <textarea
            className={`text-sm outline-none cursor-pointer border-none resize-none text-center sm:text-left w-full bg-transparent`}
            rows="4"
            value={bio}
            readOnly
          />
        </div>
      )}
    </div>
  );
};

export default UserProfileDetails;
