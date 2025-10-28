# 📸 Mini Instagram Clone — MERN Stack Project

A **feature-rich Instagram-style social media web app** built using the **MERN Stack (MongoDB, Express.js, React.js, Node.js)** with **automated background tasks** powered by **Node.js cron jobs**.  
This project brings together the essential features of a modern social app — stories, posts, interactions, notifications, and automation — all wrapped in a clean, responsive UI.

---

## 🌟 Features

### 👤 User Management

- OTP-based **Email Authentication**
- **Profile setup** on first signup
- **Account verification** via email
- **Follow / Unfollow** users with follow requests
- Accept or reject follow requests easily

### 🖼️ Posts & Stories

- Upload and view posts with captions
- Edit or delete posts anytime
- Like and comment on posts
- Upload and view **stories** (auto-expire after 24 hours)
- Edit or delete stories before they expire

### 🔔 Notifications

- Real-time notifications for:
  - Likes
  - Comments
  - Follows
  - Follow request approvals

### 🧭 Explore & Search

- Search for users by name or username
- View other users’ profiles and posts
- Explore suggested users

### ⚙️ Settings

- Update profile picture, name, username, and bio
- Edit uploaded post captions or replace images
- Manage account preferences
- Toggle **Dark / Light Theme**

### 🛡️ Authentication

- Secure OTP-based email verification
- JWT-based user sessions
- Password hashing using **bcrypt**

---

## 🤖 Automation (Node.js Cron Jobs)

To ensure efficient background processes, a **separate Node.js + Express server** is used exclusively for automation:

- 🕒 **Automatic Story Deletion:**  
  Stories are automatically deleted after 24 hours using `node-cron`.

- 💀 **Account Deletion Scheduler:**  
  When a user requests account deletion:
  - Their account is **scheduled for deletion after 24 hours**.
  - Within that 24-hour window, users can **cancel the deletion request** if they change their mind.
  - A cron job checks pending deletions periodically and removes eligible accounts.

This approach keeps the main server lightweight and ensures a **production-grade, modular microservice structure**.

---

## 🧰 Tech Stack

| Layer            | Technology                           |
| ---------------- | ------------------------------------ |
| Frontend         | React.js,Framer-motion, Tailwind CSS |
| Backend          | Node.js, Express.js                  |
| Database         | MongoDB, Mongoose                    |
| Authentication   | JWT, bcrypt, Nodemailer              |
| File Storage     | Cloudinary                           |
| Automation       | Node-cron (separate server)          |
| State Management | Context file                         |
| Routing          | React Router DOM                     |

---

## 🚀 Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/Sanplink.git
cd Sanplink
cd server - npm install (backend)
cd client - npm install (frontend)
cd automation - npm install (automation-backend)
```

## ⚙️ Environment Example (.env)

```markdown
# Server

PORT=4000
MONGODB_URI=your_mongodb_database_url
JWT_SECRET=your_jwt_secret_key
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass (as per your smtp provider in this project i have used BREVO SMTP Service)
SENDER_EMAIL=your_sender_email
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key

# Client

VITE_BACKEND_URL=http://localhost:5000

# Automation

PORT=5000
MONGODB_URI=your_mongodb_database_url
JWT_SECRET=your_jwt_secret_key
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass (as per your smtp provider in this project i have used BREVO SMTP Service)
SENDER_EMAIL=your_sender_email
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key
```

## 🗂️ Folder Structure

```
project/
├── client/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/
│   ├── config/
│   │   ├── cloudinary.js
│   │   ├── mongodb.js
│   │   └── nodemailer.js
│   ├── controllers/
│   │   ├── messageController.js
│   │   ├── postController.js
│   │   ├── storyController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── adminAuth.js
│   │   ├── auth.js
│   │   └── multer.js
│   ├── models/
│   │   ├── messageModel.js
│   │   ├── postModel.js
│   │   ├── storyModel.js
│   │   └── userModel.js
│   ├── node_modules/
│   ├── routes/
│   │   ├── messageRouter.js
│   │   ├── postRouter.js
│   │   ├── storyRouter.js
│   │   └── userRouter.js
│   ├── testing/
│   │   ├── initializeData.js
│   │   ├── SendFollowRequestToMe.js
│   │   └── sendFollowRequestToOther.js
│   ├── utils/
│   │   └── responses.js
│   ├── .env
│   ├── .gitignore
│   ├── package-lock.json
│   ├── package.json
│   ├── railway.json
│   ├── README.md
│   ├── server.js
│   └── vercel.json
├── automation/
│   ├── config/
│   │   ├── cloudinary.js
│   │   ├── mongodb.js
│   │   └── nodemailer.js
│   ├── models/
│   │   ├── storyModel.js
│   │   └── userModel.js
│   ├── node_modules/
│   ├── utils/
│   │   ├── accountDeletion.js
│   │   └── storyCleaner.js
│   ├── .env
│   ├── package-lock.json
│   ├── package.json
│   └── server.js
└── README.md
```
