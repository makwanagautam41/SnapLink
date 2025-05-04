# User Routes for Full-Stack Instagram App

## Routes Overview

---

### 🧑‍💻 User Authentication

- **POST** `/signup`  
  Create a new user account.

- **POST** `/signin`  
  Sign in to an existing user account.

- **POST** `/admin`  
  Admin login.

- **GET** `/verify-admin`  
  Verifies if the admin is authenticated (requires `adminAuth` middleware).

---

### 👤 User Profile

- **GET** `/profile`  
  Get the current authenticated user's profile data.  
  _Requires user authentication via JWT._

- **GET** `/profile/:username`  
  Get the profile of a specific user by username.  
  _Requires user authentication via JWT._

- **PUT** `/update`  
  Update the current authenticated user's profile information (e.g., name, bio, etc.).  
  _Requires user authentication via JWT._

- **PUT** `/update-profile-img`  
  Update the profile image of the current authenticated user.  
  _Requires user authentication via JWT._

- **PUT** `/update-password`  
  Update the password of the current authenticated user.  
  _Requires user authentication via JWT._

---

### 🔑 Password Reset

- **POST** `/send-password-rest-otp`  
  Send an OTP for resetting the password (for the account).  
  _No authentication required._

- **POST** `/reset-password`  
  Reset the user's password with the OTP sent to the user's email.  
  _No authentication required._

- **POST** `/verify-password-reset-otp`  
  Verify the OTP for password reset.  
  _No authentication required._

---

### ✅ User Verification

- **POST** `/send-verify-user-otp`  
  Send an OTP to verify the user.  
  _Requires user authentication via JWT._

- **POST** `/verify-user`  
  Verify the user with the sent OTP.  
  _Requires user authentication via JWT._

---

### 🤝 Follow/Unfollow & Profile Visibility

- **POST** `/follow/:targetUsername`  
  Follow a target user by their username.  
  _Requires user authentication via JWT._

- **POST** `/unfollow/:targetUsername`  
  Unfollow a target user by their username.  
  _Requires user authentication via JWT._

- **POST** `/update-profile-visibility`  
  Update the visibility of the user's profile (e.g., public/private).  
  _Requires user authentication via JWT._

- **POST** `/follow/accept/:targetUsername`  
  Accept a follow request from a target user.  
  _Requires user authentication via JWT._

- **POST** `/follow/reject/:targetUsername`  
  Reject a follow request from a target user.  
  _Requires user authentication via JWT._

---

### 📴 Account Deactivation & Reactivation

- **POST** `/deactivate-account`  
  Deactivate the current authenticated user's account.  
  _Requires user authentication via JWT._

- **POST** `/send-reactivate-account-otp`  
  Send an OTP for reactivating a deactivated account.  
  _No authentication required._

- **POST** `/verify-otp-and-reactivate-account`  
  Verify the OTP and reactivate the deactivated account.  
  _No authentication required._

---

## 📸 Post Routes

> All post routes require user authentication via JWT (`authUser` middleware).  
> Image uploads are handled using `multer` middleware.

- **POST** `/posts/create`  
  Create a new post with optional multiple images (max 10).  
  _Requires `multipart/form-data` with field name `images[]`._

- **GET** `/posts/my-posts`  
  Get all posts created by the currently authenticated user.

- **GET** `/posts/:postId`  
  Get a single post by its ID.

- **GET** `/posts/explore`  
  Get all public posts from all users.

- **GET** `/posts/feed`  
  Get posts from users followed by the current user.

- **POST** `/posts/:postId/like`  
  Like or unlike a specific post.

- **POST** `/posts/:postId/comment`  
  Add a comment to a specific post.

# Posts Routes for Full-Stack Instagram App

## Routes Overview

## 📸 Post Routes

> All post routes require user authentication via JWT (`authUser` middleware).  
> Image uploads are handled using `multer` middleware.

---

### 📤 POST `/posts/create`

Create a new post with optional multiple images (max 10).  
**Request Type:** `multipart/form-data`  
**Field:** `images[]` (up to 10 files)

---

### 📂 GET `/posts/my-posts`

Get all posts created by the currently authenticated user.

---

### 🔍 GET `/posts/:postId`

Get a single post by its ID.

---

### 🌍 GET `/posts/explore`

Get all public posts from all users.

---

### 📰 GET `/posts/feed`

Get posts from users followed by the current user.

---

### ❤️ POST `/posts/:postId/like`

Like or unlike a specific post.

---

### 💬 POST `/posts/:postId/comment`

Add a comment to a specific post.

### SAVE `/posts/:postId/save`

save a post of others

# 📖 Story Routes - Full-Stack Instagram App

This document covers all the API endpoints related to Instagram-style story functionality in the app.

## 📤 POST `/story/upload`

Upload a new story (photo or video).

### Description:

Creates a new story. Supports multiple media files (images/videos). Each story will be auto-deleted after 24 hours unless archived.

### Middleware:

- `authUser` - Authenticate the user
- `storyUpload.array("media", 5)` - Accepts up to 5 media files

### Request:

- Content-Type: `multipart/form-data`
- Fields:
  - `media[]`: Image(s) or video(s)

### Response:

```json
{
  "success": true,
  "message": "Story uploaded successfully",
  "stories": [ ... ]
}
```
