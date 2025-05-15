import express from "express";
const userRouter = express.Router();

import {
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
  changeUsername,
  changeDateOfBirth,
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
  deleteAccount,
  cancelAccountDeletion,
  getNotifications,
  addCloseFriends,
  blockUser,
} from "../controllers/userController.js";
import authUser from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";
import getUploadMiddleware from "../middleware/multer.js";
const profileUpload = getUploadMiddleware("profile");

userRouter.post("/signup", signup);
userRouter.post("/signin", signin);
userRouter.post("/admin", loginAdmin);
userRouter.get("/verify-admin", adminAuth, (req, res) => {
  res.status(200).json({ message: "Admin Authenticated" });
});
userRouter.get("/profile", authUser, profile);
userRouter.get("/profile/:username", authUser, getUserProfile);
userRouter.get("/past-searched-user", authUser, getPastSearchedUser);
userRouter.put("/update", authUser, update);
userRouter.put("/update-email", authUser, updateEmail);
userRouter.put("/update-phone", authUser, updatePhone);
userRouter.put("/change-username", authUser, changeUsername);
userRouter.put("/change-date-of-birth", authUser, changeDateOfBirth);
userRouter.put(
  "/update-profile-img",
  authUser,
  profileUpload.single("image"),
  updateProfileImg
);
userRouter.put("/remove-profile-img", authUser, removeProfileImg);

userRouter.put("/update-password", authUser, updatePassword);
userRouter.post("/send-password-rest-otp", sendPasswordResetOtp);
userRouter.post("/reset-password", resetPassword);
userRouter.post("/verify-password-reset-otp", verifyPasswordResetOtp);
userRouter.post("/send-verify-user-otp", authUser, sendVerifyUserOtp);
userRouter.post("/verify-user", authUser, verifyUser);
userRouter.post("/follow/:targetUsername", authUser, followUser);
userRouter.post("/unfollow/:targetUsername", authUser, unfollowUser);
userRouter.post(
  "/update-profile-visibility",
  authUser,
  updateProfileVisibility
);
userRouter.post(
  "/follow/accept/:targetUsername",
  authUser,
  acceptFollowRequest
);
userRouter.post(
  "/follow/reject/:targetUsername",
  authUser,
  rejectFollowRequest
);
userRouter.post("/deactivate-account", authUser, deactivateAccount);
userRouter.post("/send-reactivate-account-otp", sendReactivateAccountOtp);
userRouter.post(
  "/verify-otp-and-reactivate-account",
  verifyOtpAndReactivateAccount
);
userRouter.post("/delete-account", authUser, deleteAccount);
userRouter.post("/cancel-account-deletion", cancelAccountDeletion);
userRouter.get("/notifications", authUser, getNotifications);
userRouter.put("/add-close-friend/:targetUsername", authUser, addCloseFriends);
userRouter.put("/block/:targetUsername", authUser, blockUser);

export default userRouter;
