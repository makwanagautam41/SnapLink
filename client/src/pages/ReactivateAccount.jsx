import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Icon } from "../utils/icons";
import Title from "../components/Title";
import toast from "react-hot-toast";
import useThemeStyles from "../utils/themeStyles";

const ReactivateAccount = () => {
  const navigate = useNavigate();
  const {
    sendReactivateAccountOtp,
    verifyOtpAndReactivateAccount,
    error,
    setError,
    success,
    setSuccess,
  } = useAuth();

  const styles = useThemeStyles();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [resendTimer, setResendTimer] = useState(60);

  const inputRefs = Array(6)
    .fill(0)
    .map(() => React.createRef());

  const handleInput = (e, idx) => {
    const val = e.target.value;
    if (/^\d$/.test(val)) {
      const newOtp = [...otp];
      newOtp[idx] = val;
      setOtp(newOtp);
      if (idx < 5 && inputRefs[idx + 1].current) {
        inputRefs[idx + 1].current.focus();
      }
    } else if (val === "") {
      const newOtp = [...otp];
      newOtp[idx] = "";
      setOtp(newOtp);
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && otp[idx] === "") {
      if (idx > 0 && inputRefs[idx - 1].current) {
        inputRefs[idx - 1].current.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim().slice(0, 6);
    if (/^\d{6}$/.test(pasteData)) {
      const newOtp = pasteData.split("");
      setOtp(newOtp);
      newOtp.forEach((digit, i) => {
        if (inputRefs[i].current) {
          inputRefs[i].current.value = digit;
        }
      });
      if (inputRefs[5].current) inputRefs[5].current.focus();
    }
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
          <button
            className="flex items-center justify-center border w-full p-2 px-8 mt-4 font-light text-white bg-black disabled:opacity-50"
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
          <div className="flex justify-center gap-2 mb-4" onPaste={handlePaste}>
            {Array(6)
              .fill(0)
              .map((_, idx) => (
                <input
                  key={idx}
                  ref={inputRefs[idx]}
                  className="w-12 h-12 text-xl font-semibold text-center border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                  value={otp[idx]}
                  onChange={(e) => handleInput(e, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  maxLength="1"
                  type="tel"
                  inputMode="numeric"
                  required
                />
              ))}
          </div>

          <button
            className="flex items-center justify-center border w-full p-2 px-8 mt-2 font-light text-white bg-black disabled:opacity-50"
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
