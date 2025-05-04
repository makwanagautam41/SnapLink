import React from "react";

const LikedAvtars = ({ post }) => {
  return (
    <div className="flex gap-5 pb-2">
      {post.comments && post.comments.length > 0
        ? post.comments.slice(0, 3).map((comment, index) => (
            <div key={index} className="mb-4 flex items-start">
              <img
                src={
                  comment.postedBy?.profileImg ||
                  "https://res.cloudinary.com/djbqtwzyf/image/upload/v1744042607/default_img_gszetk.png"
                }
                alt="comment user"
                className={`object-cover object-center w-6 h-6 rounded-full absolute top-0 left-${
                  index * 4
                } z-${10 + index}`}
              />
            </div>
          ))
        : null}
      <p className="ml-2">Liked By gautam and other</p>
    </div>
  );
};

export default LikedAvtars;
