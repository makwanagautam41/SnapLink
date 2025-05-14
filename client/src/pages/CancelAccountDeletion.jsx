import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Icon } from "../utils/icons";
import { useNavigate } from "react-router-dom";
import useThemeStyles from "../utils/themeStyles";
import Title from "../components/Title";
import toast from "react-hot-toast";

const CancelAccountDeletion = () => {
  const { cancelAccountDeletion, error, success } = useAuth();
  const styles = useThemeStyles();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const response = await cancelAccountDeletion({
      email,
      username,
      password,
      confirmCancel,
    });

    if (response.success) {
      navigate("/");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto mt-10 p-6 gap-4 text-gray-700 rounded-xl shadow-md">
      <div className="w-full flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-2xl font-bold cursor-pointer"
        >
          <Icon.ArrowBack className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-center flex-1">
          Cancel Account Deletion
        </h2>
        <div className="w-6 h-6" />
      </div>

      <form onSubmit={handleSubmit}>
        <p className="mb-2">
          Enter your username, email, and password to cancel account deletion
          proccess.
        </p>
        <Title text2="Enter Registered Username, Email, and Password" />

        <div className="pb-2">
          <label htmlFor="password" className="block dark:text-gray-600">
            Username
          </label>
          <input
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            type="text"
            className={`w-full p-3 border-b focus:outline-none ${styles.input}`}
            placeholder="Username"
            required
          />
        </div>
        <div className="pb-2">
          <label htmlFor="password" className="block dark:text-gray-600">
            Email
          </label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            className={`w-full p-3 border-b focus:outline-none ${styles.input}`}
            placeholder="Email"
            required
          />
        </div>
        <div className="space-y-1 text-sm relative">
          <label htmlFor="password" className="block dark:text-gray-600">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            className={`w-full p-3 border-b focus:outline-none ${styles.input}`}
            required
          />
          <span
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-9 cursor-pointer text-gray-500"
          >
            {showPassword ? (
              <Icon.OffEye size={20} />
            ) : (
              <Icon.OnEye size={20} />
            )}
          </span>
        </div>

        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            id="confirmCancel"
            checked={confirmCancel}
            onChange={(e) => setConfirmCancel(e.target.checked)}
            className="mr-2"
            required
          />
          <label htmlFor="confirmCancel" className="text-sm">
            I confirm that I want to cancel the account deletion process.
          </label>
        </div>

        <button
          className="flex items-center justify-center border w-full p-2 px-8 mt-4 font-light text-white bg-black disabled:opacity-50"
          disabled={loading || !email || !username || !password}
        >
          {loading ? <Icon.Loader className="animate-spin" /> : "Submit"}
        </button>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        {success && <p className="mt-2 text-sm text-green-500">{success}</p>}
      </form>
    </div>
  );
};

export default CancelAccountDeletion;
