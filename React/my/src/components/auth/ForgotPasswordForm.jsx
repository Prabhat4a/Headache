import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const ForgotPasswordForm = ({ onBackToLogin }) => {
  const [step, setStep] = useState(1);
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [maskedContact, setMaskedContact] = useState("");

  // Resend timer state
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);

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

  // Countdown timer effect
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleStep1Submit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!contact.trim()) {
      newErrors.contact = "Please enter your email or phone number";
    } else {
      const isEmail = contact.includes("@");
      const isValid = isEmail ? validateEmail(contact) : validatePhone(contact);

      if (!isValid) {
        newErrors.contact = isEmail
          ? "Please enter a valid email address"
          : "Please enter a valid 10-digit phone number";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const isEmail = contact.includes("@");
    setMaskedContact(isEmail ? maskEmail(contact) : maskPhone(contact));
    setStep(2);
  };

  const handleStep2Submit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!otp.trim()) {
      newErrors.otp = "Please enter the verification code";
    } else if (otp.length !== 6 || !/^[0-9]{6}$/.test(otp)) {
      newErrors.otp = "Please enter a valid 6-digit code";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setStep(3);
  };

  const handleStep3Submit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!newPassword.trim()) {
      newErrors.newPassword = "Please enter a new password";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please re-enter your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setShowSuccess(true);

    setTimeout(() => {
      onBackToLogin();
    }, 2000);
  };

  const handleResendCode = (e) => {
    e.preventDefault();

    if (!canResend) return;

    // Start 20 second countdown
    setCanResend(false);
    setResendTimer(20);

    console.log("Verification code resent to", contact);
  };

  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Success Notification Component rendered via Portal
  const SuccessNotification = () => {
    if (!showSuccess) return null;

    return createPortal(
      <div className="success-notification show">
        <i className="bx bx-check-circle"></i>
        <span>Password changed successfully!</span>
      </div>,
      document.body,
    );
  };

  return (
    <>
      <SuccessNotification />

      {step === 1 && (
        <>
          <div className="box-head">
            <h1>Forgot Password?</h1>
            <p className="subtitle">
              Enter your registered email or phone number
            </p>
          </div>
          <form onSubmit={handleStep1Submit}>
            <div className="input-box">
              <div className="input-wrapper-with-btn">
                <div className="input-wrapper" style={{ flex: 1 }}>
                  <i className="bx bx-envelope"></i>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => {
                      setContact(e.target.value);
                      clearError("contact");
                    }}
                    placeholder="Email or Phone Number"
                    className={errors.contact ? "error" : ""}
                  />
                </div>
                <button
                  type="submit"
                  className="verify-small-btn"
                  style={{ height: "45px", padding: "0 20px" }}
                >
                  Verify
                </button>
              </div>
              <div className={`error-message ${errors.contact ? "show" : ""}`}>
                {errors.contact}
              </div>
            </div>
          </form>
          <div className="back-to-login">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onBackToLogin();
              }}
            >
              <i className="bx bx-arrow-back"></i> Back to Login
            </a>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="box-head">
            <h1>Verify Code</h1>
            <p className="subtitle">
              Enter the verification code sent to{" "}
              <span style={{ color: "#a78bfa", fontWeight: 600 }}>
                {maskedContact}
              </span>
            </p>
          </div>
          <form onSubmit={handleStep2Submit}>
            <div className="input-box">
              <div className="input-wrapper">
                <i className="bx bx-lock-open"></i>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/[^0-9]/g, ""));
                    clearError("otp");
                  }}
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  className={errors.otp ? "error" : ""}
                />
              </div>
              <div className={`error-message ${errors.otp ? "show" : ""}`}>
                {errors.otp}
              </div>
            </div>
            <div className="verify-button">
              <button type="submit">Verify Code</button>
            </div>
            <div className="resend-code">
              {canResend ? (
                <p>
                  Didn't receive code?{" "}
                  <a href="#" onClick={handleResendCode}>
                    Resend
                  </a>
                </p>
              ) : (
                <p className="resend-timer">
                  Resend available in <span>{resendTimer}s</span>
                </p>
              )}
            </div>
          </form>
        </>
      )}

      {step === 3 && (
        <>
          <div className="box-head">
            <h1>Create New Password</h1>
            <p className="subtitle">
              Your new password must be different from previous passwords
            </p>
          </div>
          <form onSubmit={handleStep3Submit}>
            <div className="input-box">
              <div className="input-wrapper">
                <i className="bx bx-lock"></i>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    clearError("newPassword");
                  }}
                  placeholder="New Password"
                  className={errors.newPassword ? "error" : ""}
                />
                <i
                  className={`bx ${showNewPassword ? "bx-show" : "bx-hide"} toggle-password`}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                ></i>
              </div>
              <div
                className={`error-message ${errors.newPassword ? "show" : ""}`}
              >
                {errors.newPassword}
              </div>
            </div>
            <div className="input-box">
              <div className="input-wrapper">
                <i className="bx bx-lock"></i>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearError("confirmPassword");
                  }}
                  placeholder="Re-enter Password"
                  className={errors.confirmPassword ? "error" : ""}
                />
                <i
                  className={`bx ${showConfirmPassword ? "bx-show" : "bx-hide"} toggle-password`}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                ></i>
              </div>
              <div
                className={`error-message ${errors.confirmPassword ? "show" : ""}`}
              >
                {errors.confirmPassword}
              </div>
            </div>
            <div className="Register-button">
              <button type="submit">Confirm</button>
            </div>
          </form>
        </>
      )}
    </>
  );
};

export default ForgotPasswordForm;
