import userModel from "../models/userModel.js";
import postModel from "../models/postModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/nodemailer.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const signup = async (req, res) => {
  try {
    const { name, username, email, password, phone, gender } = req.body || {};

    if (!name || !username || !email || !password || !phone || !gender) {
      return res
        .status(400)
        .json({ success: false, message: "All fields required." });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Weak password. Use uppercase, lowercase, number & symbol",
      });
    }

    const userExist = await userModel
      .findOne({ $or: [{ email }, { username }] })
      .lean();
    if (userExist) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultAvatar =
      "https://res.cloudinary.com/djbqtwzyf/image/upload/v1744042607/default_img_gszetk.png";

    const user = await userModel.create({
      name,
      username,
      email,
      password: hashedPassword,
      phone,
      profileImg: defaultAvatar,
      gender,
    });

    const token = createToken(user._id);
    res.status(201).json({ success: true, token });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const signin = async (req, res) => {
  try {
    const { email, username, password } = req.body || {};

    if (!password || (!email && !username)) {
      return res.status(400).json({
        success: false,
        message: "Email/username and password required",
      });
    }

    const user = await userModel
      .findOne({ $or: [{ email }, { username }] })
      .lean();
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (user.deactivationInfo.isDeactivated) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is deactivated. Please reactivate your account before logging in.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password" });

    const token = createToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        profileImg: user.profileImg,
        bio: user.bio,
      },
    });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ success: false, message: "Login error" });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        {
          email: process.env.ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({
        success: true,
        token,
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const sendVerifyUserOtp = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist!",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiresAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: `"SnapLink" <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: "SnapLink - Email Verification OTP",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>Welcome to SnapLink! Please verify your email address using the OTP below:</p>
          <h2 style="color: #28a745;">${otp}</h2>
          <p>This OTP is valid for <strong>15 minutes</strong>.</p>
          <p>If you did not create an account, please ignore this email.</p>
          <br />
          <p>Thanks,</p>
          <p><strong>SnapLink Team</strong></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Verification OTP has been sent to your email address",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong, please try again later!",
    });
  }
};

const verifyUser = async (req, res) => {
  const userId = req.userId;
  const { otp } = req.body;

  if (!otp || !userId) {
    return res.status(400).json({
      success: false,
      message: "User ID and OTP are required!",
    });
  }

  try {
    const user = await userModel.findById(userId);

    if (!user || user.otp !== otp) {
      return res.status(401).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    if (user.otpExpiresAt < Date.now()) {
      return res.status(410).json({
        success: false,
        message: "OTP has expired.",
      });
    }

    user.otp = "";
    user.otpExpiresAt = null;
    user.isVerified = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email Verified Successfully",
    });
  } catch (error) {
    console.error("Error verifying user:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong, please try again later!",
    });
  }
};

const profile = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await userModel
      .findById(userId)
      .select(
        "name username email profileImg bio phone followers following profileVisibility followRequests savedPosts gender closeFriends"
      )
      .populate({
        path: "followers",
        select: "username profileImg name",
      })
      .populate({
        path: "following",
        select: "username profileImg name",
      })
      .populate({
        path: "blocked",
        select: "username profileImg name",
      })
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const postCount = await postModel.countDocuments({ postedBy: userId });

    return res.json({
      success: true,
      user: {
        ...user,
        postCount,
      },
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const searchQuery = req.params.username;
    if (!searchQuery) {
      return res
        .status(400)
        .json({ success: false, message: "Search query is required" });
    }

    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const currentUser = await userModel.findById(userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    currentUser.recentSearches.push({ username: searchQuery });
    if (currentUser.recentSearches.length > 7) {
      currentUser.recentSearches.shift();
    }
    await currentUser.save();

    const regex = new RegExp(searchQuery, "i");

    const users = await userModel
      .find({
        $or: [{ username: { $regex: regex } }, { name: { $regex: regex } }],
      })
      .select(
        "name username profileImg bio phone followers following profileVisibility followRequests"
      )
      .populate({
        path: "followers",
        select: "username profileImg",
      })
      .populate({
        path: "following",
        select: "username profileImg",
      })
      .limit(10)
      .lean();

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: "No users found matching the search",
      });
    }

    const usersWithPostCounts = await Promise.all(
      users.map(async (user) => {
        const postCount = await postModel.countDocuments({
          postedBy: user._id,
        });
        return {
          ...user,
          postCount,
        };
      })
    );

    return res.json({
      success: true,
      users: usersWithPostCounts,
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getPastSearchedUser = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.recentSearches.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No recent searches found",
        recentSearches: [],
      });
    }

    const recentUsernames = user.recentSearches.map(
      (search) => search.username
    );

    const users = await userModel
      .find({ username: { $in: recentUsernames } })
      .select("name username profileImg bio followers following")
      .lean();

    return res.status(200).json({
      success: true,
      message: "Recent searches fetched successfully",
      recentSearches: users,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const update = async (req, res) => {
  try {
    const userId = req.userId;
    const { bio, gender } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID required" });
    }

    // Prepare fields to update
    const updateFields = {};
    if (typeof gender === "string") updateFields.gender = gender;
    if (typeof bio === "string") updateFields.bio = bio;

    if (Object.keys(updateFields).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Nothing to update" });
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(
        userId,
        { $set: updateFields },
        { new: true, runValidators: true }
      )
      .lean();

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const { name, username, email, phone, bio: updatedBio } = updatedUser;

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: { name, username, email, phone, bio: updatedBio },
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ success: false, message: "Update error" });
  }
};

const updateEmail = async (req, res) => {
  try {
    const userId = req.userId;
    const { email } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID required" });
    }

    if (typeof email !== "string") {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({
        success: false,
        message: "Use Another Email!",
      });
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(
        userId,
        { $set: { email } },
        { new: true, runValidators: true }
      )
      .lean();

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "Email updated successfully",
      user: { email: updatedUser.email },
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ success: false, message: "Update error" });
  }
};

const updatePhone = async (req, res) => {
  try {
    const userId = req.userId;
    const { phone } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID required" });
    }

    if (typeof phone !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid phone number" });
    }

    const existingUser = await userModel.findOne({ phone });
    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({
        success: false,
        message: "Use another number",
      });
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(
        userId,
        { $set: { phone } },
        { new: true, runValidators: true }
      )
      .lean();

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "Phone updated successfully",
      user: { phone: updatedUser.phone },
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ success: false, message: "Update error" });
  }
};

const updateProfileImg = async (req, res) => {
  const userId = req.userId;
  const imageUrl = req.file?.path;

  if (!userId || !imageUrl) {
    return res.status(400).json({
      success: false,
      message: !userId ? "User ID is required" : "No image uploaded",
    });
  }

  try {
    const updatedUser = await userModel.updateOne(
      { _id: userId },
      { $set: { profileImg: imageUrl } }
    );

    if (updatedUser.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found or image already set",
      });
    }

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl,
    });
  } catch (error) {
    console.error("Update profile image error:", error.message);
    res.status(500).json({
      success: false,
      message: "Image upload failed",
      error: error.message,
    });
  }
};

const removeProfileImg = async (req, res) => {
  const DEFAULT_IMG_URL =
    "https://res.cloudinary.com/djbqtwzyf/image/upload/v1744042607/default_img_gszetk.png";
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const updatedUser = await userModel
      .findOneAndUpdate(
        { _id: userId },
        { profileImg: DEFAULT_IMG_URL },
        { new: true, upsert: false, fields: { profileImg: 1 } }
      )
      .lean();

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      DEFAULT_IMG_URL,
    });
  } catch (error) {
    console.error("Update profile image error:", error);
    res.status(500).json({
      success: false,
      message: "Image upload failed",
      error: error.message,
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required",
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    if (!validator.isStrongPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Weak password. Use uppercase, lowercase, number & symbol",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    const token = createToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
      token,
    });
  } catch (err) {
    console.error("Update error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while updating password",
    });
  }
};

const sendPasswordResetOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiresAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: `"SnapLink" <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: "SnapLink - Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>You have requested to reset your password. Please use the OTP below to proceed:</p>
          <h2 style="color: #007bff;">${otp}</h2>
          <p>This OTP is valid for <strong>15 minutes</strong>.</p>
          <p>If you did not request this, please ignore this email.</p>
          <br />
          <p>Thanks,</p>
          <p><strong>SnapLink Team</strong></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "OTP has been sent to your email address",
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

const verifyPasswordResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Email and OTP are required.",
    });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user || user.otp !== otp) {
      return res.status(401).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    if (user.otpExpiresAt < Date.now()) {
      return res.status(410).json({
        success: false,
        message: "OTP has expired.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP is valid.",
    });
  } catch (error) {
    console.error("OTP validation error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Try again.",
    });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Email, OTP, and new password are required.",
    });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired OTP.",
      });
    }

    if (user.otpExpiresAt < Date.now()) {
      return res.status(410).json({
        success: false,
        message: "OTP has expired.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = "";
    user.otpExpiresAt = null;

    await user.save();

    const mailOptions = {
      from: `"SnapLink" <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: "Your Password Has Been Reset Successfully",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>Your password has been successfully reset. You can now log in with your new password.</p>
          <p>If you did not request this change, please contact our support team immediately.</p>
          <br />
          <p>Best regards,</p>
          <p><strong>SnapLink Team</strong></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully.",
    });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

const followUser = async (req, res) => {
  try {
    const { targetUsername } = req.params;
    const userId = req.userId;

    const currentUser = await userModel.findById(userId);
    if (!currentUser) {
      return res
        .status(404)
        .json({ success: false, message: "Current user not found" });
    }

    if (currentUser.username.toLowerCase() === targetUsername.toLowerCase()) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot follow yourself" });
    }

    const targetUser = await userModel.findOne({
      username: targetUsername.toLowerCase(),
    });
    if (!targetUser) {
      return res
        .status(404)
        .json({ success: false, message: "Target user not found" });
    }

    const isAlreadyFollower = targetUser.followers?.some(
      (id) => id.toString() === userId.toString()
    );
    const isAlreadyRequested = targetUser.followRequests?.some(
      (id) => id.toString() === userId.toString()
    );

    if (isAlreadyFollower) {
      return res.status(200).json({
        success: true,
        message: "You are already following this user",
      });
    }

    if (targetUser.profileVisibility === "private") {
      if (isAlreadyRequested) {
        return res.status(400).json({
          success: false,
          message: "Follow request already pending or accepted",
        });
      }

      targetUser.followRequests = targetUser.followRequests || [];
      targetUser.followRequests.push(userId);
      await targetUser.save();

      return res.json({
        success: true,
        message: `Follow request sent to ${targetUsername}. Awaiting approval.`,
      });
    }

    // Public profile - follow directly
    if (!currentUser.following.includes(targetUser._id)) {
      currentUser.following.push(targetUser._id);
      await currentUser.save();
    }

    targetUser.followers = targetUser.followers || [];
    if (!targetUser.followers.includes(userId)) {
      targetUser.followers.push(userId);
      targetUser.notifications = targetUser.notifications || [];
      targetUser.notifications.push({
        from: userId,
        type: "following-you",
        message: `${currentUser.username} started following you.`,
        createdAt: new Date(),
      });
      await targetUser.save();
    }

    res.json({
      success: true,
      message: `You are now following ${targetUsername}`,
    });
  } catch (error) {
    console.error("Follow error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while following the user",
    });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const { targetUsername } = req.params;
    const userId = req.userId;

    const currentUser = await userModel.findById(userId);
    if (!currentUser) {
      return res
        .status(404)
        .json({ success: false, message: "Current user not found" });
    }

    if (currentUser.username.toLowerCase() === targetUsername.toLowerCase()) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot unfollow yourself" });
    }

    const targetUser = await userModel.findOne({
      username: targetUsername.toLowerCase(),
    });
    if (!targetUser) {
      return res
        .status(404)
        .json({ success: false, message: "Target user not found" });
    }

    // Cancel follow request if pending
    const wasRequested = targetUser.followRequests?.some(
      (id) => id.toString() === userId.toString()
    );
    if (targetUser.profileVisibility === "private" && wasRequested) {
      targetUser.followRequests = targetUser.followRequests.filter(
        (id) => id.toString() !== userId.toString()
      );
      await targetUser.save();
      return res.json({
        success: true,
        message: `Follow request to ${targetUsername} has been canceled.`,
      });
    }

    // Remove related notifications
    currentUser.notifications = currentUser.notifications.filter(
      (notification) =>
        notification.from.toString() !== targetUser._id.toString()
    );
    await currentUser.save();

    targetUser.notifications = targetUser.notifications.filter(
      (notification) =>
        notification.from.toString() !== currentUser._id.toString()
    );
    await targetUser.save();

    // Unfollow
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== targetUser._id.toString()
    );
    await currentUser.save();

    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== userId.toString()
    );
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: `You have unfollowed ${targetUsername}`,
    });
  } catch (error) {
    console.error("Unfollow error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while unfollowing the user",
    });
  }
};

const acceptFollowRequest = async (req, res) => {
  try {
    const { targetUsername } = req.params;
    const userId = req.userId;

    const currentUser = await userModel.findById(userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "Current user not found",
      });
    }

    const targetUser = await userModel.findOne({
      username: targetUsername.toLowerCase(),
    });
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "Requested user not found",
      });
    }

    const isRequested = currentUser.followRequests?.some(
      (id) => id.toString() === targetUser._id.toString()
    );
    if (!isRequested) {
      return res.status(400).json({
        success: false,
        message: "No follow request from this user",
      });
    }

    currentUser.followRequests = currentUser.followRequests.filter(
      (id) => id.toString() !== targetUser._id.toString()
    );

    // Update followers/following
    if (!currentUser.followers.includes(targetUser._id)) {
      currentUser.followers.push(targetUser._id);
    }

    if (!targetUser.following.includes(currentUser._id)) {
      targetUser.following.push(currentUser._id);
    }

    const now = new Date();
    targetUser.notifications.push({
      from: userId,
      message: `${currentUser.username} accepted your follow request.`,
      createdAt: now,
    });

    currentUser.notifications.push({
      from: targetUser._id,
      message: `${targetUser.username} Started Following you.`,
      createdAt: now,
    });

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.json({
      success: true,
      message: `You have accepted ${targetUsername}'s follow request.`,
    });
  } catch (error) {
    console.error("Accept follow request error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while accepting the follow request",
    });
  }
};

const rejectFollowRequest = async (req, res) => {
  try {
    const { targetUsername } = req.params;
    const userId = req.userId;

    const currentUser = await userModel.findById(userId);
    if (!currentUser) {
      return res
        .status(404)
        .json({ success: false, message: "Current user not found" });
    }

    const targetUser = await userModel.findOne({
      username: targetUsername.toLowerCase(),
    });
    if (!targetUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isRequested = currentUser.followRequests?.some(
      (id) => id.toString() === targetUser._id.toString()
    );
    if (!isRequested) {
      return res
        .status(400)
        .json({ success: false, message: "No follow request from this user" });
    }

    currentUser.followRequests = currentUser.followRequests.filter(
      (id) => id.toString() !== targetUser._id.toString()
    );
    await currentUser.save();

    res.json({
      success: true,
      message: `You have rejected the follow request from ${targetUsername}`,
    });
  } catch (error) {
    console.error("Reject follow request error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while rejecting the follow request",
    });
  }
};

const updateProfileVisibility = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await userModel.findById(userId).select("profileVisibility");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const currentVisibility = user.profileVisibility;
    if (!["public", "private"].includes(currentVisibility)) {
      return res.status(400).json({
        success: false,
        message: "Invalid current visibility setting.",
      });
    }

    const newVisibility =
      currentVisibility === "private" ? "public" : "private";

    const updatePosts = postModel.updateMany(
      { postedBy: userId },
      { $set: { postVisibility: newVisibility } }
    );

    const updateUser = userModel.findByIdAndUpdate(userId, {
      $set: { profileVisibility: newVisibility },
    });

    await Promise.all([updatePosts, updateUser]);

    res.status(200).json({
      success: true,
      message: `Profile visibility set to ${newVisibility}`,
    });
  } catch (error) {
    console.error("Update profile visibility error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating profile visibility",
    });
  }
};

const deactivateAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Deactivation message is required",
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.deactivationInfo = {
      isDeactivated: true,
      message,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: "Account deactivated successfully",
    });
  } catch (error) {
    console.error("Error deactivating account:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later!",
    });
  }
};

const sendReactivateAccountOtp = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!email && !username) {
      return res.status(400).json({
        success: false,
        message: "Email or username is required",
      });
    }

    const user = await userModel.findOne({
      $or: [{ email }, { username }],
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (email !== user.email || username !== user.username) {
      return res.json("Wrong email or username");
    }

    if (!user.deactivationInfo.isDeactivated) {
      return res.status(400).json({
        success: false,
        message: "Your account is already active.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiresAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: `"SnapLink" <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: "SnapLink - Reactivate Account OTP",
      html: `
        <div>
          <p>Hi ${user.name},</p>
          <p>Please use the OTP below to reactivate your account:</p>
          <h2>${otp}</h2>
          <p>This OTP will expire in 15 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please check and verify.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

const verifyOtpAndReactivateAccount = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.otp !== otp) {
      return res.status(401).json({
        success: false,
        message: "Invalid OTP",
      });
    }
    if (user.otpExpiresAt < Date.now()) {
      return res.status(410).json({
        success: false,
        message: "OTP has expired",
      });
    }

    user.deactivationInfo = { isDeactivated: false, message: "" };
    user.otp = "";
    user.otpExpiresAt = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Account reactivated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

const getNotifications = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await userModel
      .findById(userId)
      .populate("notifications.from", "username profileImg")
      .populate("followRequests", "username fullName profileImg")
      .select("notifications followRequests");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const sortedNotifications = user.notifications
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      notifications: sortedNotifications,
      followRequests: user.followRequests,
    });
  } catch (error) {
    console.error("Notification error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while getting user notifications.",
    });
  }
};

const addCloseFriends = async (req, res) => {
  try {
    const userId = req.userId;
    const { targetUsername } = req.params;

    if (!userId || !targetUsername) {
      return res.status(400).json({
        success: false,
        message: "User ID and target username are required",
      });
    }

    // Fetch current user and target user in one query
    const [targetUser, currentUser] = await Promise.all([
      userModel.findOne({ username: targetUsername }),
      userModel.findById(userId),
    ]);

    if (!targetUser) {
      return res.status(404).json({ message: "Target user not found" });
    }

    if (userId === targetUser._id.toString()) {
      return res.status(400).json({ message: "You cannot add yourself" });
    }

    const isConnected =
      currentUser.followers.includes(targetUser._id) ||
      currentUser.following.includes(targetUser._id);

    if (!isConnected) {
      return res.status(403).json({
        message: "User must be in your followers or following list",
      });
    }

    // Use $pull and $addToSet for efficient array updates
    const isAlreadyCloseFriend = currentUser.closeFriends.includes(
      targetUser._id
    );
    if (isAlreadyCloseFriend) {
      await userModel.updateOne(
        { _id: userId },
        { $pull: { closeFriends: targetUser._id } }
      );
      return res
        .status(200)
        .json({ message: `${targetUsername} removed from close friends` });
    } else {
      await userModel.updateOne(
        { _id: userId },
        { $addToSet: { closeFriends: targetUser._id } }
      );
      return res
        .status(200)
        .json({ message: `${targetUsername} added to close friends` });
    }
  } catch (error) {
    console.error("Toggle Close Friend Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const blockUser = async (req, res) => {
  try {
    const userId = req.userId;
    const { targetUsername } = req.params;

    if (!userId || !targetUsername) {
      return res.status(400).json({
        success: false,
        message: "User ID and target username are required",
      });
    }

    const [targetUser, currentUser] = await Promise.all([
      userModel.findOne({ username: targetUsername }),
      userModel.findById(userId),
    ]);

    if (!targetUser) {
      return res.status(404).json({ message: "Target user not found" });
    }

    if (userId === targetUser._id.toString()) {
      return res.status(400).json({ message: "You cannot block yourself" });
    }

    const isBlocked = currentUser.blocked.includes(targetUser._id);

    if (isBlocked) {
      await userModel.updateOne(
        { _id: userId },
        { $pull: { blocked: targetUser._id } }
      );
      return res
        .status(200)
        .json({ message: `${targetUsername} has been unblocked` });
    } else {
      await userModel.updateOne(
        { _id: userId },
        { $addToSet: { blocked: targetUser._id } }
      );
      return res
        .status(200)
        .json({ message: `${targetUsername} has been blocked` });
    }
  } catch (error) {
    console.error("Block/Unblock User Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export {
  signup,
  signin,
  loginAdmin,
  sendVerifyUserOtp,
  verifyUser,
  profile,
  getUserProfile,
  getPastSearchedUser,
  update,
  updateEmail,
  updatePhone,
  updateProfileImg,
  removeProfileImg,
  updatePassword,
  sendPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPassword,
  followUser,
  unfollowUser,
  updateProfileVisibility,
  acceptFollowRequest,
  rejectFollowRequest,
  deactivateAccount,
  sendReactivateAccountOtp,
  verifyOtpAndReactivateAccount,
  getNotifications,
  addCloseFriends,
  blockUser,
};
