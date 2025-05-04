import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/mongoDB.js";
import startStoryCleaner from "./utils/storyCleaner.js";

dotenv.config();
const app = express();
connectDB();
startStoryCleaner();

// middlewares
app.use(helmet());
app.use(compression());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

app.get("/", (req, res) => res.send("Automation API is running..."));

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
  console.log(`Automation Server running on port ${process.env.PORT}`);
});
