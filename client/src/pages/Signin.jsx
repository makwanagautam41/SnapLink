import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Icon } from "../utils/icons.js";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import useThemeStyles from "../utils/themeStyles.js";

const Signin = () => {
  const { signin, error, setError, token } = useAuth();
  const navigate = useNavigate();
  const styles = useThemeStyles();
  const location = useLocation();
  const [input, setInput] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const response = await signin(input);
    if (response.success) {
      const redirectTo =
        new URLSearchParams(location.search).get("redirect") || "/";
      navigate(redirectTo);
    } else {
      setError(response.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) {
      const redirectTo =
        new URLSearchParams(location.search).get("redirect") || "/";
      navigate(redirectTo);
    }
  }, [token, navigate]);

  const inputClass = `${styles.input} w-full px-4 py-3 rounded-md focus:outline-none`;

  const buttonClass = `bg-blue-600 text-white hover:bg-blue-700 block w-full p-3 text-center rounded-sm`;

  return (
    <div className={`w-full max-w-md p-8 space-y-3 rounded-xl mx-auto`}>
      <h1 className="text-2xl font-bold text-center">Login</h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1 text-sm">
          <label htmlFor="email" className="block dark:text-gray-600">
            Email or Username
          </label>
          <input
            type="text"
            name="email"
            id="email"
            placeholder="Email or Username"
            value={input.email}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>
        <div className="space-y-1 text-sm">
          <label htmlFor="password" className="block dark:text-gray-600">
            Password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Password"
            value={input.password}
            onChange={handleChange}
            required
            className={inputClass}
          />
          <div className="flex justify-end text-xs dark:text-gray-600">
            <NavLink to="/forgot-password">Forgot Password?</NavLink>
          </div>
        </div>
        <button type="submit" disabled={loading} className={buttonClass}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <div className="flex items-center pt-4 space-x-1">
        <div className="flex-1 h-px sm:w-16 dark:bg-gray-300"></div>
        <p className="px-3 text-sm dark:text-gray-600">
          Login with social accounts
        </p>
        <div className="flex-1 h-px sm:w-16 dark:bg-gray-300"></div>
      </div>
      <div className="flex justify-center space-x-4">
        <button aria-label="Log in with Google" className="p-3 rounded-sm">
          <Icon.Google size={24} />
        </button>
        <button aria-label="Log in with Twitter" className="p-3 rounded-sm">
          <Icon.Facebook size={24} />
        </button>
        <button aria-label="Log in with GitHub" className="p-3 rounded-sm">
          <Icon.Twitter size={24} />
        </button>
      </div>
      <p className="text-xs text-center sm:px-6 dark:text-gray-600">
        Don't have an account?{" "}
        <NavLink to="/signup" className="underline dark:text-gray-800">
          Sign up
        </NavLink>
      </p>
    </div>
  );
};

export default Signin;
