import userModel from "../models/userModel.js";
import postModel from "../models/postModel.js";
import cloudinary from "../config/cloudinary.js";

const createPost = async (req, res) => {
  try {
    const { caption = "", location = "" } = req.body;
    const userId = req.userId;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "At least one image is required." });
    }

    const [user, imagePaths] = await Promise.all([
      userModel.findById(userId),
      Promise.all(
        req.files.map((file) => ({
          url: file.path,
          public_id: file.filename,
        }))
      ),
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const postVisibility =
      user.profileVisibility === "public" ? "public" : "private";

    const newPost = new postModel({
      caption,
      location,
      images: imagePaths,
      postedBy: userId,
      postVisibility,
    });
    await newPost.save();

    res.status(201).json({
      success: true,
      message: "Post created successfully!",
      post: newPost,
    });
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: "Server error while creating post." });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const userId = req.userId;

    const posts = await postModel
      .find({ postedBy: userId })
      .populate("postedBy", "username profileImg")
      .populate("comments.postedBy", "username profileImg")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, posts });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching posts",
      error: err.message,
    });
  }
};

const getSinglePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const currentUserId = req.userId;

    const post = await postModel
      .findById(postId)
      .populate("postedBy", "username profileImg isPrivate followers")
      .populate("comments.postedBy", "username profileImg");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const postOwner = post.postedBy;
    const isOwner = postOwner._id.toString() === currentUserId.toString();
    const isFollower = postOwner.followers?.some(
      (followerId) => followerId.toString() === currentUserId.toString()
    );

    if (postOwner.isPrivate && !isOwner && !isFollower) {
      return res.status(403).json({
        success: false,
        message:
          "This account is private. You are not authorized to view this post.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Post fetched successfully",
      post,
    });
  } catch (error) {
    console.error("Error fetching single post:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching single post.",
    });
  }
};

const getAllPublicPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const posts = await postModel.aggregate([
      { $match: { postVisibility: "public" } },
      { $sample: { size: limit } },
      { $skip: skip },
      {
        $lookup: {
          from: "users",
          localField: "postedBy",
          foreignField: "_id",
          as: "postedBy",
        },
      },
      {
        $unwind: "$postedBy",
      },
      {
        $lookup: {
          from: "users",
          localField: "comments.postedBy",
          foreignField: "_id",
          as: "comments.postedBy",
        },
      },
      {
        $unwind: "$comments",
      },
      {
        $project: {
          caption: 1,
          location: 1,
          images: 1,
          postedBy: { username: 1, profileImg: 1 },
          "comments.postedBy": { username: 1, profileImg: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error("Error fetching public posts:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching public posts.",
    });
  }
};

const getFollowedUserPosts = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const followedUserIds = user.following;

    const posts = await postModel
      .find({
        postedBy: { $in: followedUserIds },
      })
      .populate("postedBy", "username profileImg")
      .populate("comments.postedBy", "username profileImg")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error("Error fetching followed user posts:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching followed user posts.",
    });
  }
};

const likePost = async (req, res) => {
  try {
    const userId = req.userId;
    const postId = req.params.postId;

    const [post, currentUser] = await Promise.all([
      postModel.findById(postId).populate("postedBy", "profileVisibility"),
      userModel.findById(userId).select("username"),
    ]);

    if (!post || !currentUser) {
      return res.status(404).json({
        success: false,
        message: !post ? "Post not found" : "Current user not found",
      });
    }

    const postOwnerId = post.postedBy._id;
    const isPrivate = post.postedBy.profileVisibility === "private";

    if (isPrivate && userId.toString() !== postOwnerId.toString()) {
      const isFollower = await userModel.exists({
        _id: postOwnerId,
        followers: userId,
      });

      if (!isFollower) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to like this post.",
        });
      }
    }

    const alreadyLiked = post.likes.includes(userId);
    post.likes = alreadyLiked
      ? post.likes.filter((id) => id.toString() !== userId.toString())
      : [...post.likes, userId];

    const liked = !alreadyLiked;

    const saveOps = [post.save()];

    if (liked && userId.toString() !== postOwnerId.toString()) {
      saveOps.push(
        userModel.findByIdAndUpdate(postOwnerId, {
          $push: {
            notifications: {
              from: userId,
              message: `${currentUser.username} liked your post.`,
              createdAt: new Date(),
            },
          },
        })
      );
    }

    await Promise.all(saveOps);

    res.json({
      success: true,
      message: liked ? "Post liked" : "Post unliked",
      likesCount: post.likes.length,
      postId: post._id,
    });
  } catch (error) {
    console.error("Error liking the post:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while liking/unliking the post",
    });
  }
};

const commentOnPost = async (req, res) => {
  try {
    const userId = req.userId;
    const postId = req.params.postId;
    const { comment } = req.body;

    const post = await postModel
      .findById(postId)
      .populate("postedBy", "profileVisibility");
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const postOwner = post.postedBy;

    // Check private profile access
    if (postOwner.profileVisibility === "private") {
      const ownerData = await userModel.findById(postOwner._id);
      const isFollower = ownerData.followers.includes(userId);

      if (!isFollower && userId.toString() !== postOwner._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to comment on this post.",
        });
      }
    }

    post.comments.push({
      text: comment,
      postedBy: userId,
    });

    await post.save();

    res.json({
      success: true,
      message: "Comment added successfully",
      comments: post.comments,
    });
  } catch (error) {
    console.error("Error commenting on post:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while commenting on the post",
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const userId = req.userId;
    const postId = req.params.postId;
    const commentId = req.params.commentId;

    const post = await postModel.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comment = post.comments.find((c) => c.commentId === commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.postedBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this comment",
      });
    }

    post.comments = post.comments.filter((c) => c.commentId !== commentId);

    await post.save();

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the comment",
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const userId = req.userId;
    const postId = req.params.postId;

    const post = await postModel.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.postedBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own posts",
      });
    }

    for (const image of post.images) {
      try {
        await cloudinary.uploader.destroy(image.public_id, {
          resource_type: "image",
        });
      } catch (err) {
        console.error("Error deleting from Cloudinary:", err);
      }
    }

    await postModel.findByIdAndDelete(postId);

    res.json({
      success: true,
      message: "Post and associated media deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting the post:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the post",
    });
  }
};

const updatePost = async (req, res) => {
  try {
    const userId = req.userId;
    const postId = req.params.postId;
    const { caption } = req.body;

    const post = await postModel.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.postedBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own posts",
      });
    }

    post.caption = caption || post.caption;

    const updatedPost = await post.save();

    res.json({
      success: true,
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Error updating the post:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the post",
    });
  }
};

const savePost = async (req, res) => {
  try {
    const userId = req.userId;
    const postId = req.params.postId;

    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const post = await postModel
      .findById(postId)
      .populate("postedBy", "profileVisibility followers");
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const postOwner = post.postedBy;

    if (postOwner.profileVisibility === "private") {
      const isFollower = postOwner.followers.some(
        (followerId) => followerId.toString() === userId.toString()
      );

      if (!isFollower && userId.toString() !== postOwner._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to save this post.",
        });
      }
    }

    const isSaved = user.savedPosts.some(
      (savedId) => savedId.toString() === postId.toString()
    );

    if (isSaved) {
      user.savedPosts.pull(postId);
      await user.save();
      return res.status(200).json({ message: "Post unsaved." });
    } else {
      user.savedPosts.push(postId);
      await user.save();
      return res.status(200).json({ message: "Post saved." });
    }
  } catch (error) {
    console.error("Save post error:", error);
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while saving the post. Please try again later!",
    });
  }
};

const getSearchedUserPost = async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.userId;

    const searchedUser = await userModel.findOne({ username });

    if (!searchedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (
      searchedUser.profileVisibility === "private" &&
      searchedUser._id.toString() !== currentUserId.toString() &&
      !searchedUser.followers.includes(currentUserId)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this user's posts.",
      });
    }
    const posts = await postModel
      .find({ postedBy: searchedUser._id })
      .sort({ createdAt: -1 })
      .populate("postedBy", "username profileImg")
      .populate("comments.postedBy", "username profileImg");

    res.status(200).json({
      success: true,
      message: "Posts fetched successfully",
      posts,
    });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching posts",
    });
  }
};

export {
  createPost,
  getUserPosts,
  getSinglePost,
  getAllPublicPosts,
  getFollowedUserPosts,
  likePost,
  commentOnPost,
  deleteComment,
  deletePost,
  updatePost,
  savePost,
  getSearchedUserPost,
};
