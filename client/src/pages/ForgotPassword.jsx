import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Icon } from "../utils/icons.js";
import Title from "../components/Title";
import useThemeStyles from "../utils/themeStyles.js";

const ResetPassword = () => {
  const { BASE_URL, error, setError, success, setSuccess } = useAuth();
  const navigate = useNavigate();
  const styles = useThemeStyles();

  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (isEmailSent && !canResend) {
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            setCanResend(true);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isEmailSent, canResend]);

  const handleInput = (e, idx) => {
    if (e.target.value.length > 0 && idx < inputRefs.current.length - 1) {
      inputRefs.current[idx + 1].focus();
    }

    const otpArray = inputRefs.current.map((el) => el.value).join("");
    if (otpArray.length === 6) {
      onSubmitOtp();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && e.target.value === "" && idx > 0) {
      inputRefs.current[idx - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (pastedData.length === 6 && /^\d{6}$/.test(pastedData)) {
      pastedData.split("").forEach((char, idx) => {
        if (inputRefs.current[idx]) {
          inputRefs.current[idx].value = char;
        }
      });
      onSubmitOtp();
    } else {
      setError("Invalid OTP format. Paste a 6-digit number.");
    }
  };

  const onSubmitEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${BASE_URL}/users/send-password-rest-otp`,
        { email }
      );
      if (data.success) {
        setSuccess(data.message);
        setError("");
        setIsEmailSent(true);
        setCanResend(false);
        setResendTimer(30);
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitOtp = async () => {
    setLoading(true);
    const otpArray = inputRefs.current.map((el) => el.value);
    const enteredOtp = otpArray.join("");

    if (enteredOtp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      navigator.vibrate(200);
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(
        `${BASE_URL}/users/verify-password-reset-otp`,
        {
          email,
          otp: enteredOtp,
        }
      );

      if (data.success) {
        setSuccess("OTP verified successfully.");
        setError("");
        setOtp(enteredOtp);
        setIsOtpSubmitted(true);
      } else {
        setError(data.message || "Invalid OTP. Please try again.");
        navigator.vibrate(300);
      }
    } catch (error) {
      setError(error?.message);
      navigator.vibrate(300);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitNewPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`${BASE_URL}/users/reset-password`, {
        email,
        otp,
        newPassword,
      });
      if (data.success) {
        setSuccess("");
        setError("");
        toast.success(data.message);
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto mt-10 p-6 gap-4 text-gray-700 rounded-xl shadow-md">
      <div className="w-full flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className={`${styles.text} text-2xl font-bold cursor-pointer`}
        >
          <Icon.ArrowBack className="w-6 h-6" />
        </button>
        <h2 className={`${styles.text} text-2xl font-bold text-center flex-1`}>
          Reset Password
        </h2>
        <div className="w-6 h-6" />
      </div>

      {!isEmailSent && (
        <form onSubmit={onSubmitEmail}>
          <p className="mb-2">
            Enter your email and we'll send you a one time OTP to verify your
            account.
          </p>
          <Title text2="Enter Registered Email" />
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            className={`w-full px-3 py-2 border focus:outline-none focus:border-orange-700 ${styles.text}`}
            placeholder="Email"
            required
          />
          <button
            className="flex items-center justify-center w-full p-2 px-8 mt-4 font-light text-white bg-black disabled:opacity-50"
            disabled={loading || !email}
          >
            {loading ? <Icon.Loader className="animate-spin" /> : "Submit"}
          </button>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          {success && <p className="mt-2 text-sm text-green-500">{success}</p>}
        </form>
      )}
      {isEmailSent && !isOtpSubmitted && (
        <form onSubmit={(e) => e.preventDefault()}>
          <p className="mb-2">
            Enter sended OTP to your mail and verify it to reset your password.
          </p>
          <Title text2="Enter OTP Sent to Your Email" />
          <div className="flex justify-center gap-2 mb-4">
            {Array(6)
              .fill(0)
              .map((_, idx) => (
                <input
                  key={idx}
                  className="w-12 h-12 text-xl font-semibold text-center text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                  ref={(el) => (inputRefs.current[idx] = el)}
                  onInput={(e) => handleInput(e, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  onPaste={handlePaste}
                  type="tel"
                  maxLength="1"
                  pattern="\d"
                  required
                />
              ))}
          </div>
          <button
            className="flex items-center justify-center w-full p-2 px-8 mt-2 font-light text-white bg-black disabled:opacity-50"
            disabled={loading}
            onClick={onSubmitOtp}
          >
            {loading ? <Icon.Loader className="animate-spin" /> : "Verify OTP"}
          </button>
          <button
            className="w-full mt-2 text-sm text-blue-500"
            disabled={!canResend}
            onClick={onSubmitEmail}
          >
            {canResend ? "Resend OTP" : `Resend in ${resendTimer}s`}
          </button>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          {success && <p className="mt-2 text-sm text-green-500">{success}</p>}
        </form>
      )}
      {isOtpSubmitted && isEmailSent && (
        <form onSubmit={onSubmitNewPassword}>
          <p className="mb-2">
            Enter New Password to recover and get back to your Account.
          </p>
          <Title text2="Enter New Password" />
          <div className="relative">
            <input
              onChange={(e) => setNewPassword(e.target.value)}
              value={newPassword}
              type={showPassword ? "text" : "password"}
              className={`w-full px-3 py-2 border focus:outline-none focus:border-orange-700 ${styles.text}`}
              placeholder="Enter Password"
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
          <button
            className="flex items-center justify-center w-full p-2 px-8 mt-4 font-light text-white bg-black disabled:opacity-50"
            disabled={loading || !email}
          >
            {loading ? <Icon.Loader className="animate-spin" /> : "Submit"}
          </button>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          {success && <p className="mt-2 text-sm text-green-500">{success}</p>}
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
