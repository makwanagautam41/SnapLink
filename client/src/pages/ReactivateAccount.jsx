import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Icon } from "../utils/icons";
import Title from "../components/Title";
import toast from "react-hot-toast";
import useThemeStyles from "../utils/themeStyles";

const ReactivateAccount = () => {
  const navigate = useNavigate();
  const { sendReactivateAccountOtp, verifyOtpAndReactivateAccount } = useAuth();

  const styles = useThemeStyles();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [resendTimer, setResendTimer] = useState(60);

  const handleInput = (e, idx) => {
    const newOtp = [...otp];
    newOtp[idx] = e.target.value;
    setOtp(newOtp);
  };

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const response = await sendReactivateAccountOtp({
      email,
      username,
      password,
    });
    if (response.success) {
      setIsEmailSent(true);
      startResendTimer();
      setSuccess("OTP sent to your email");
    } else {
      setError(response.message || "Failed to send OTP");
    }
    setLoading(false);
  };

  const handleSubmitOtp = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    const otpCode = otp.join("");
    const response = await verifyOtpAndReactivateAccount({
      email,
      username,
      password,
      otp: otpCode,
    });
    if (response.success) {
      setIsOtpSubmitted(true);
      toast.success("Account reactivated Successfully!");
      navigate("/");
    } else {
      setError(response.message || "OTP verification failed");
    }
    setLoading(false);
  };

  const startResendTimer = () => {
    const interval = setInterval(() => {
      if (resendTimer > 0) {
        setResendTimer(resendTimer - 1);
      } else {
        clearInterval(interval);
        setCanResend(true);
      }
    }, 1000);
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
          Reactivate Account
        </h2>
        <div className="w-6 h-6" />
      </div>

      {!isEmailSent && !isOtpSubmitted && (
        <form onSubmit={handleSubmitEmail}>
          <p className="mb-2">
            Enter your username, email, and password, and we'll send you a
            one-time OTP to verify your account.
          </p>
          <Title text2="Enter Registered Username, Email, and Password" />

          <div className="pb-2">
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
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              className={`w-full p-3 border-b focus:outline-none ${styles.input}`}
              placeholder="Email"
              required
            />
          </div>
          <div className="pb-2">
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              className={`w-full p-3 border-b focus:outline-none ${styles.input}`}
              placeholder="Password"
              required
            />
          </div>
          <button
            className="flex items-center justify-center w-full p-2 px-8 mt-4 font-light text-white bg-black disabled:opacity-50"
            disabled={loading || !email || !username || !password}
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
            Enter the OTP sent to your email and verify it to reactivate your
            account.
          </p>
          <Title text2="Enter OTP Sent to Your Email" />
          <div className="flex justify-center gap-2 mb-4">
            {Array(6)
              .fill(0)
              .map((_, idx) => (
                <input
                  key={idx}
                  className="w-12 h-12 text-xl font-semibold text-center border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                  value={otp[idx]}
                  onChange={(e) => handleInput(e, idx)}
                  maxLength="1"
                  type="tel"
                  required
                />
              ))}
          </div>
          <button
            className="flex items-center justify-center w-full p-2 px-8 mt-2 font-light text-white bg-black disabled:opacity-50"
            disabled={loading}
            onClick={handleSubmitOtp}
          >
            {loading ? <Icon.Loader className="animate-spin" /> : "Verify OTP"}
          </button>
          <button
            className="w-full mt-2 text-sm text-blue-500"
            disabled={!canResend}
            onClick={handleSubmitEmail}
          >
            {canResend ? "Resend OTP" : `Resend in ${resendTimer}s`}
          </button>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          {success && <p className="mt-2 text-sm text-green-500">{success}</p>}
        </form>
      )}
    </div>
  );
};

export default ReactivateAccount;
