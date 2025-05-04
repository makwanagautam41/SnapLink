import React, { useEffect } from "react";
import { usePost } from "../context/PostContext";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const Explore = () => {
  const location = useLocation();
  const { publicPosts, fetchAllPublicPosts } = usePost();

  useEffect(() => {
    fetchAllPublicPosts();
  }, []);

  const { theme } = useTheme();

  const firstPost = publicPosts[0];
  const secondPost = publicPosts[1];

  return (
    <section className="dark:bg-gray-100 dark:text-gray-900">
      <div
        className={`container grid grid-cols-2 gap-4 mx-auto md:grid-cols-4 ${
          theme === "light" ? "bg-white" : "bg-gray-800"
        }`}
      >
        {firstPost ? (
          <Link
            to={`/explore/${firstPost.postedBy?.username}/post/${firstPost._id}`}
            state={{
              exploreUserBackgroundLocation: { pathname: location.pathname },
            }}
            key={firstPost._id}
            className="col-span-2 row-span-2 md:col-start-3 md:row-start-1"
          >
            <img
              src={firstPost.images[0]?.url}
              alt="Featured Post"
              className="w-full h-full rounded shadow-sm min-h-96 object-cover aspect-square hover:brightness-50 transition-all duration-200 ease-in-out"
            />
          </Link>
        ) : (
          <img
            src="https://source.unsplash.com/random/301x301/"
            alt="Fallback"
            className="w-full h-full col-span-2 row-span-2 rounded shadow-sm min-h-96 md:col-start-3 md:row-start-1 dark:bg-gray-500 aspect-square"
          />
        )}

        {publicPosts.slice(2).map((post) => (
          <Link
            to={`/explore/${post.postedBy?.username}/post/${post._id}`}
            state={{
              exploreUserBackgroundLocation: { pathname: location.pathname },
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
        ))}

        {secondPost ? (
          <Link
            to={`/explore/${secondPost.postedBy?.username}/post/${secondPost._id}`}
            state={{
              exploreUserBackgroundLocation: { pathname: location.pathname },
            }}
            key={secondPost._id}
            className="col-span-2 row-span-2 md:col-start-1 md:row-start-3"
          >
            <img
              src={secondPost.images[0]?.url}
              alt="Featured Post 2"
              className="w-full h-full rounded shadow-sm min-h-96 object-cover aspect-square hover:brightness-50 transition-all duration-200 ease-in-out"
            />
          </Link>
        ) : (
          <img
            src="https://source.unsplash.com/random/302x302/"
            alt="Fallback"
            className="w-full h-full col-span-2 row-span-2 rounded shadow-sm min-h-96 md:col-start-1 md:row-start-3 dark:bg-gray-500 aspect-square"
          />
        )}
      </div>
    </section>
  );
};

export default Explore;
