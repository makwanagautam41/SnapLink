  import mongoose from "mongoose";

  const connectDB = async () => {
    try {
      await mongoose.connect(`${process.env.MONGODB_URI}/snaplink`);
      console.log("✅ Connected to MongoDB");
    } catch (error) {
      console.error("❌ MongoDB Connection Failed:", error.message);
      process.exit(1);
    }

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB Disconnected. Reconnecting...");
      connectDB();
    });
  };

  export default connectDB;
