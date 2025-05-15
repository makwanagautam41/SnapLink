import express from "express";
import "dotenv/config.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import connectDB from "./config/mongoDB.js";

import userRoutes from "./routes/userRouter.js";
import postRouter from "./routes/postRouter.js";
import storyRouter from "./routes/storyRouter.js";

// dotenv.config();
const app = express();
connectDB();

// middlewares
app.use(helmet());
app.use(compression());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
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

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
