import React, { useState, useEffect } from "react";

const ForgotPasswordForm = ({ onBackToLogin }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userContact, setUserContact] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [emailPhoneError, setEmailPhoneError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const validateEmail = (email) => {
    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com)$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const maskEmail = (email) => {
    const [username, domain] = email.split("@");
    const masked = username.substring(0, 2) + "***" + username.slice(-1);
    return masked + "@" + domain;
  };

  const maskPhone = (phone) => {
    return "******" + phone.slice(-4);
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setEmailPhoneError("");

    const input = emailOrPhone.trim();

    if (!input) {
      setEmailPhoneError("Please enter your email or phone number");
      return;
    }

    const isEmail = input.includes("@");
    const isValid = isEmail ? validateEmail(input) : validatePhone(input);

    if (!isValid) {
      setEmailPhoneError(
        isEmail
          ? "Please enter a valid email address"
          : "Please enter a valid 10-digit phone number",
      );
      return;
    }

    setUserContact(input);
    setSentTo(isEmail ? maskEmail(input) : maskPhone(input));

    setCurrentStep(2);

    setTimer(20);

    console.log("Verification code sent");
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();

    const code = otpCode.trim();

    if (!code) {
      setOtpError("Please enter the verification code");
      return;
    }

    if (!/^[0-9]{6}$/.test(code)) {
      setOtpError("Please enter a valid 6-digit code");
      return;
    }

    setCurrentStep(3);
  };

  const handleResendCode = (e) => {
    e.preventDefault();

    if (timer > 0) return;

    setTimer(20);

    console.log("OTP resent");
  };

  const handleNewPasswordSubmit = (e) => {
    e.preventDefault();

    let valid = true;

    setNewPasswordError("");
    setConfirmPasswordError("");

    if (!newPassword.trim()) {
      setNewPasswordError("Please enter a new password");
      valid = false;
    } else if (newPassword.length < 6) {
      setNewPasswordError("Password must be at least 6 characters");
      valid = false;
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError("Please re-enter your password");
      valid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      valid = false;
    }

    if (valid) {
      setShowSuccess(true);

      setTimeout(() => {
        if (onBackToLogin) onBackToLogin();
      }, 2000);
    }
  };

  const handleBackToStep1 = (e) => {
    e.preventDefault();

    setOtpCode("");
    setOtpError("");
    setCurrentStep(1);
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");

    setOtpCode(value);

    setOtpError("");
  };

  return (
    <div className="forgot-password-content">
      <div className={`success-notification ${showSuccess ? "show" : ""}`}>
        <i className="bx bx-check-circle"></i>
        <span>Password changed successfully!</span>
      </div>

      {currentStep === 1 && (
        <div className="step-container">
          <div className="box-head">
            <h1>Forgot Password?</h1>
            <p className="subtitle">
              Enter your registered email or phone number
            </p>
          </div>

          <form onSubmit={handleEmailSubmit}>
            <div className="input-box">
              <div className="input-wrapper-verify">
                <div className="input-with-icon">
                  <i className="bx bx-envelope"></i>

                  <input
                    type="text"
                    placeholder="Email or Phone Number"
                    value={emailOrPhone}
                    onChange={(e) => {
                      setEmailOrPhone(e.target.value);
                      setEmailPhoneError("");
                    }}
                  />
                </div>

                <button type="submit" className="verify-btn">
                  Verify
                </button>
              </div>

              <div className={`error-message ${emailPhoneError ? "show" : ""}`}>
                {emailPhoneError}
              </div>
            </div>
          </form>

          <div className="back-to-login">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onBackToLogin?.();
              }}
            >
              <i className="bx bx-arrow-back"></i> Back to Login
            </a>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="step-container">
          <div className="box-head">
            <h1>Verify Code</h1>
            <p className="subtitle">
              Enter the verification code sent to {sentTo}
            </p>
          </div>

          <form onSubmit={handleOtpSubmit}>
            <div className="input-box">
              <div className="input-wrapper">
                <i className="bx bx-lock-open"></i>

                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  value={otpCode}
                  onChange={handleOtpChange}
                />
              </div>

              <div className={`error-message ${otpError ? "show" : ""}`}>
                {otpError}
              </div>
            </div>

            <div className="verify-button">
              <button type="submit">Verify Code</button>
            </div>

            <div className="resend-code">
              <p>
                Didn't receive code?
                <a
                  href="#"
                  onClick={handleResendCode}
                  style={{ pointerEvents: timer > 0 ? "none" : "auto" }}
                >
                  {timer > 0 ? `Resend (${timer}s)` : "Resend"}
                </a>
              </p>
            </div>
          </form>

          <div className="back-to-login">
            <a href="#" onClick={handleBackToStep1}>
              <i className="bx bx-arrow-back"></i> Back
            </a>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="step-container">
          <div className="box-head">
            <h1>Create New Password</h1>
          </div>

          <form onSubmit={handleNewPasswordSubmit}>
            <div className="input-box">
              <div className="input-wrapper">
                <i className="bx bx-lock"></i>

                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setNewPasswordError("");
                  }}
                />

                <i
                  className={`bx ${showNewPassword ? "bx-show" : "bx-hide"} toggle-password`}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                ></i>
              </div>

              <div
                className={`error-message ${newPasswordError ? "show" : ""}`}
              >
                {newPasswordError}
              </div>
            </div>

            <div className="input-box">
              <div className="input-wrapper">
                <i className="bx bx-lock"></i>

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setConfirmPasswordError("");
                  }}
                />

                <i
                  className={`bx ${showConfirmPassword ? "bx-show" : "bx-hide"} toggle-password`}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                ></i>
              </div>

              <div
                className={`error-message ${confirmPasswordError ? "show" : ""}`}
              >
                {confirmPasswordError}
              </div>
            </div>

            <div className="confirm-button">
              <button type="submit">Confirm</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordForm;
