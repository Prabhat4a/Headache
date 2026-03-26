import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

export default function LoginForm({ onSwitchToRegister, onForgotPassword }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [success, setSuccess] = useState(null);
  const [successCount, setSuccessCount] = useState(3);

  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  useEffect(() => {
    if (countdown === 0) return;
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    if (!success) return;
    setSuccessCount(3);
    let count = 3;
    const t = setInterval(() => {
      count -= 1;
      setSuccessCount(count);
      if (count <= 0) {
        clearInterval(t);
        localStorage.setItem("token", "your-auth-token-here");
        setTimeout(() => {
          navigate("/explorer");
        }, 0);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [success, navigate]);

  const handlePhoneChange = (e) => {
    setPhone(e.target.value.replace(/[^0-9]/g, ""));
    setOtpSent(false);
    setOtp("");
    setPhoneError("");
    setOtpError("");
  };

  const handleSendOtp = () => {
    setPhoneError("");
    if (!/^\d{10}$/.test(phone)) {
      setPhoneError("Enter a valid 10-digit number");
      return;
    }
    setCountdown(20);
    setOtpSent(true);
  };

  const handleEmailLogin = (e) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    let valid = true;
    if (!email.trim()) {
      setEmailError("Please enter your email");
      valid = false;
    } else if (!validateEmail(email.trim())) {
      setEmailError("Please enter a valid email");
      valid = false;
    }
    if (!password) {
      setPasswordError("Please enter your password");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      valid = false;
    }
    if (valid) {
      setSuccess({
        title: "Logged In!",
        message: "You have successfully logged in. Welcome back!",
      });
    }
  };

  const handlePhoneLogin = (e) => {
    e.preventDefault();
    setPhoneError("");
    setOtpError("");
    let valid = true;
    if (!/^\d{10}$/.test(phone)) {
      setPhoneError("Please enter a valid phone number");
      valid = false;
    }
    if (!otpSent) {
      setOtpError("Please send the OTP first");
      valid = false;
    } else if (!otp.trim()) {
      setOtpError("Please enter the OTP");
      valid = false;
    } else if (otp.length !== 6) {
      setOtpError("OTP must be 6 digits");
      valid = false;
    }
    if (valid) {
      setSuccess({
        title: "Logged In!",
        message: "You have successfully logged in via phone. Welcome!",
      });
    }
  };

  const handleGoogleLogin = () => {
    navigate("/link-account", {
      state: {
        email: "aryankumarrajjak281@gmail.com",
        username: "@Aryan809krk",
      },
    });
  };

  return (
    <>
      {createPortal(
        <div className={`success-overlay${success ? " show" : ""}`}>
          <div
            className="success-card"
            key={success ? success.title : "hidden"}
          >
            <div className="success-icon-circle">
              <i className="bx bx-check"></i>
            </div>
            <h2>{success?.title}</h2>
            <p>{success?.message}</p>
            <div className="success-progress-bar">
              <div className="success-progress-fill"></div>
            </div>
            <p className="success-redirect-text">
              Redirecting in <span>{successCount}</span>s...
            </p>
          </div>
        </div>,
        document.body,
      )}

      <div className="objects">
        <div className="box-head">
          <h1>Log in</h1>
        </div>

        <div className="login-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === "email" ? "active" : ""}`}
            onClick={() => setActiveTab("email")}
          >
            Email
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "phone" ? "active" : ""}`}
            onClick={() => setActiveTab("phone")}
          >
            Ph no
          </button>
        </div>

        {activeTab === "email" && (
          <form onSubmit={handleEmailLogin}>
            <div className="input-box">
              <div className="input-wrapper">
                <i className="bx bx-envelope"></i>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  className={emailError ? "error" : ""}
                />
              </div>
              <div className={`error-message ${emailError ? "show" : ""}`}>
                {emailError}
              </div>
            </div>

            <div className="input-box">
              <div className="input-wrapper">
                <i className="bx bx-lock"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError("");
                  }}
                  className={passwordError ? "error" : ""}
                />
                <i
                  className={`bx ${showPassword ? "bx-show" : "bx-hide"} toggle-password`}
                  onClick={() => setShowPassword(!showPassword)}
                ></i>
              </div>
              <div className={`error-message ${passwordError ? "show" : ""}`}>
                {passwordError}
              </div>
            </div>

            <div className="remember-forgot">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (onForgotPassword) onForgotPassword();
                }}
              >
                Forgot password?
              </a>
            </div>

            <div className="login-button">
              <button type="submit">Log in</button>
            </div>
          </form>
        )}

        {activeTab === "phone" && (
          <form onSubmit={handlePhoneLogin}>
            <div className="input-box">
              <div className="input-wrapper-with-btn">
                <div className="phone-input-wrapper">
                  <span className="country-code">+91</span>
                  <input
                    type="tel"
                    placeholder="Phone number"
                    maxLength="10"
                    value={phone}
                    onChange={handlePhoneChange}
                  />
                </div>
                <button
                  type="button"
                  className="verify-small-btn"
                  onClick={handleSendOtp}
                  disabled={countdown > 0}
                >
                  {countdown > 0 ? `(${countdown}s)` : "Send OTP"}
                </button>
              </div>
              <div className={`error-message ${phoneError ? "show" : ""}`}>
                {phoneError}
              </div>
            </div>

            <div className="input-box">
              <div className="input-wrapper">
                <i className="bx bx-key"></i>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    setOtpError("");
                  }}
                />
              </div>
              <div className={`error-message ${otpError ? "show" : ""}`}>
                {otpError}
              </div>
            </div>

            <div className="remember-forgot">
              <label>
                <input type="checkbox" /> Remember me
              </label>
            </div>

            <div className="login-button">
              <button type="submit">Log in</button>
            </div>
          </form>
        )}

        <div className="divider">
          <span>OR</span>
        </div>

        <button
          type="button"
          className="google-login"
          onClick={handleGoogleLogin}
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="google-icon"
          />
          Continue with Google
        </button>

        <div className="account">
          <p>
            Don't have an account?{" "}
            <a
              href="#"
              className="creat-acc"
              onClick={(e) => {
                e.preventDefault();
                onSwitchToRegister();
              }}
            >
              Create an account
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
