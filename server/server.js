import express from "express";
import "dotenv/config.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { Server } from "socket.io";
import http from "http";
import connectDB from "./config/mongoDB.js";
import userModal from "./models/userModel.js";

import userRoutes from "./routes/userRouter.js";
import postRouter from "./routes/postRouter.js";
import storyRouter from "./routes/storyRouter.js";
import messageRouter from "./routes/messageRouter.js";

// dotenv.config();
const app = express();
const server = http.createServer(app);
connectDB();
const allowedOrigins = [
  "http://localhost:5173",
  "https://snaplink-gilt.vercel.app",
];

export const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS (Socket.IO)"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// store online users with full data
export const userSocketMap = {};
export const onlineUsersData = {};

// socket connection
io.on("connection", async (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User Connected : ", userId);

  if (userId) {
    userSocketMap[userId] = socket.id;

    try {
      const userData = await userModal
        .findById(userId)
        .select("username profileImg name");
      if (userData) {
        onlineUsersData[userId] = {
          _id: userId,
          username: userData.username,
          profileImg: userData.profileImg,
          name: userData.name,
        };
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  }

  io.emit("getOnlineUsers", Object.values(onlineUsersData));

  socket.on("disconnect", () => {
    console.log("User Disconnected :", userId);
    delete userSocketMap[userId];
    delete onlineUsersData[userId];
    io.emit("getOnlineUsers", Object.values(onlineUsersData));
  });
});

// middlewares
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS (Express)"));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "20mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

app.use("/api/users", userRoutes);
app.use("/api/posts", postRouter);
app.use("/api/story", storyRouter);
app.use("/api/messages", messageRouter);

app.get("/", (req, res) => res.send("API is running..."));

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: "API route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong!" });
});

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
