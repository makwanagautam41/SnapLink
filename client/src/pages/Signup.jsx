import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, NavLink } from "react-router-dom";
import { Icon } from "../utils/icons.js";
import useThemeStyles from "../utils/themeStyles.js";
import { toast } from "react-hot-toast";

const Signup = () => {
  const { signup, error, setError, token } = useAuth();
  const navigate = useNavigate();
  const styles = useThemeStyles();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [input, setInput] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    gender: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "username" && /\s/.test(value)) {
      return;
    }

    setInput({ ...input, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (/\s/.test(input.username)) {
      setError("Username cannot contain spaces.");
      return;
    }

    setLoading(true);
    const response = await signup(input);
    if (response.success) {
      navigate("/");
    } else {
      setError(response.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  const inputClass = `${styles.input} w-full px-4 py-3 rounded-md focus:outline-none`;

  const buttonClass = `w-full flex items-center justify-center px-8 py-3 mt-4 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50`;

  return (
    <div className="w-full max-w-md mx-auto p-8 space-y-3 rounded-xl">
      <h1 className="text-2xl font-bold text-center">Signup</h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      {/\s/.test(input.username) && (
        <p className="text-red-500 text-sm">Username cannot contain spaces.</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={input.name}
          onChange={handleChange}
          className={inputClass}
          required
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={input.username}
          onChange={handleChange}
          className={inputClass}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={input.email}
          onChange={handleChange}
          className={inputClass}
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={input.phone}
          onChange={handleChange}
          className={inputClass}
        />
        <select
          name="gender"
          value={input.gender}
          onChange={handleChange}
          className={inputClass}
          required
        >
          <option value="" disabled>
            Select Gender
          </option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={input.password}
            onChange={handleChange}
            className={inputClass}
            required
          />
          <span
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-3.5 cursor-pointer text-gray-500"
          >
            {showPassword ? (
              <Icon.OffEye size={20} />
            ) : (
              <Icon.OnEye size={20} />
            )}
          </span>
        </div>

        <button type="submit" disabled={loading} className={buttonClass}>
          {loading ? (
            <Icon.Loader3 className="animate-spin" size={24} />
          ) : (
            "Sign up"
          )}
        </button>
      </form>
      <div className="flex items-center pt-4 space-x-1">
        <div className="flex-1 h-px sm:w-16 dark:bg-gray-300"></div>
        <p className="px-3 text-sm dark:text-gray-600">
          Register with social accounts
        </p>
        <div className="flex-1 h-px sm:w-16 dark:bg-gray-300"></div>
      </div>
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => toast.error("Currently Unavailable")}
          aria-label="Log in with Google"
          className="p-3 rounded-sm"
        >
          <Icon.Google size={24} />
        </button>
        <button
          onClick={() => toast.error("Currently Unavailable")}
          aria-label="Log in with Twitter"
          className="p-3 rounded-sm"
        >
          <Icon.Facebook size={24} />
        </button>
        <button
          onClick={() => toast.error("Currently Unavailable")}
          aria-label="Log in with GitHub"
          className="p-3 rounded-sm"
        >
          <Icon.Twitter size={24} />
        </button>
      </div>

      <p className="text-xs text-center sm:px-6 dark:text-gray-600">
        Already have an account?{" "}
        <NavLink to="/signin" className="underline dark:text-gray-800">
          Sign in
        </NavLink>
      </p>
    </div>
  );
};

export default Signup;
