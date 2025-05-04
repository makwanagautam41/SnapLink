import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PostTopBar from "../components/PostTopBar";

const NotFound = () => {
  return (
    <>
      <PostTopBar title={"Page Not Found"} />
      <motion.div
        className="flex flex-col items-center justify-center h-screen bg-white text-gray-800 px-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          className="flex items-center space-x-2 mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 120, delay: 0.2 }}
        >
          <h1 className="text-2xl font-semibold">SnapLink</h1>
        </motion.div>

        <motion.h2
          className="text-4xl font-bold mb-2 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Sorry, this page isn't available.
        </motion.h2>

        <motion.p
          className="text-center max-w-md text-gray-600 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          The link you followed may be broken, or the page may have been
          removed.
        </motion.p>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
          <Link
            to="/"
            className="text-blue-500 hover:underline font-medium text-lg"
          >
            Go back to SnapLink
          </Link>
        </motion.div>
      </motion.div>
    </>
  );
};

export default NotFound;
