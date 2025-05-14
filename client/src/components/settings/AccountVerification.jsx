import React, { useState, useEffect } from "react";
import { useRef } from "react";
import PostTopBar from "../PostTopBar";
import { useAuth } from "../../context/AuthContext";
import useThemeStyles from "../../utils/themeStyles";
import { Icon } from "../../utils/icons";

const AccountVerification = () => {
  const {
    user,
    sendOtp,
    verifyUser,
    error,
    setError,
    success,
    setSuccess,
    getLoggedInUserInfor,
  } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [otp, setOtp] = useState("");

  const inputRefs = useRef([]);
  const styles = useThemeStyles();
  let path = "/users/send-verify-user-otp";

  const handleVerify = async () => {
    setLoading(true);
    const res = await sendOtp(path);
    if (res.success) {
      setShowOtpBox(true);
      setLoading(false);
      setTimer(60);
    }
  };

  const handleInput = (e, idx) => {
    const val = e.target.value;
    if (val.length > 0 && idx < inputRefs.current.length - 1) {
      inputRefs.current[idx + 1].focus();
    }

    const otpValue = inputRefs.current.map((input) => input.value).join("");
    setOtp(otpValue);
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && e.target.value === "" && idx > 0) {
      inputRefs.current[idx - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasted)) {
      pasted.split("").forEach((char, i) => {
        if (inputRefs.current[i]) inputRefs.current[i].value = char;
      });
      setOtp(pasted);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setError("");
    setSuccess("");
    setLoading(true);
    const res = await sendOtp(path);
    if (res.success) {
      setTimer(60);
      setLoading(false);
      setSuccess("OTP resent successfully!");
    } else {
      setError("Failed to resend OTP. Try again.");
    }
  };

  const handleSubmitOtp = async () => {
    if (otp.length !== 6) return setError("Enter a valid 6-digit OTP");
    setError("");
    setOtpLoading(true);

    try {
      const res = await verifyUser(otp);

      if (res?.success) {
        await getLoggedInUserInfor();
        setShowOtpBox(false);
        setSuccess(res.message || "Verification successful!");
        setTimeout(() => {
          setSuccess("");
        }, 10000);
        inputRefs.current.forEach((input) => (input.value = ""));
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setOtpLoading(false);
    }
  };

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  return (
    <div>
      <PostTopBar title={"Account Verification"} />
      <div className="p-2">
        <p className="text-sm sm:text-base text-gray-500 leading-relaxed mb-3">
          Get verified to help people know that your profile is authentic
        </p>
        <div
          className={`flex items-center justify-between rounded-3xl p-2 ${styles.bg2}`}
        >
          <div className="flex items-center gap-1">
            {!user ? (
              <div className="flex items-center justify-center">
                <Icon.Loader className="animate-spin text-gray-500 w-8 h-8" />
              </div>
            ) : (
              <img
                src={user?.profileImg}
                alt={user?.username}
                className="h-20 w-20 rounded-3xl object-cover"
              />
            )}
            <p className="text-base font-medium">{user?.username}</p>
          </div>
          {showOtpBox ? null : (
            <div
              className={`text-sm px-4 py-2 rounded-lg transition border border-gray-200 shadow-md ${styles.bg}`}
            >
              {user?.isVerified ? (
                <div className="flex items-center gap-1">
                  <Icon.VerifiedUser />
                  Verified
                </div>
              ) : (
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleVerify}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Icon.Loader className="animate-spin text-white w-5 h-5" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    "Verify Now"
                  )}
                </button>
              )}
            </div>
          )}
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        {success && <p className="mt-2 text-sm text-green-500">{success}</p>}

        {showOtpBox && (
          <div className="mt-6">
            <p className="mb-2 text-gray-600">
              Enter the 6-digit OTP sent to your email
            </p>
            <div className="flex justify-center gap-2 mb-4">
              {Array(6)
                .fill(0)
                .map((_, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    onInput={(e) => handleInput(e, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    onPaste={handlePaste}
                    type="tel"
                    maxLength="1"
                    className="w-12 h-12 text-xl font-semibold text-center border border-gray-300 rounded-md focus:outline-none"
                    pattern="\d"
                    required
                  />
                ))}
            </div>
            <button
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-white rounded-md disabled:opacity-50 ${styles.bg2}`}
              onClick={handleSubmitOtp}
              disabled={otpLoading}
            >
              {otpLoading ? (
                <>
                  <Icon.Loader className="animate-spin text-white w-5 h-5" />
                  <span>Verifying OTP...</span>
                </>
              ) : (
                "Submit OTP"
              )}
            </button>
            <div className="text-center mt-4">
              <button
                onClick={handleResendOtp}
                disabled={timer > 0}
                className={`text-sm font-medium underline ${
                  timer > 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-500"
                }`}
              >
                {loading
                  ? "sending..."
                  : timer > 0
                  ? `Resend OTP in ${timer}s`
                  : "Resend OTP"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountVerification;
