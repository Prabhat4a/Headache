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

  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);

  // ---------------- VALIDATION ----------------
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

  // ---------------- CLEAR ERRORS ON STEP CHANGE (NEW) ----------------
  useEffect(() => {
    setErrors({});
  }, [step]);

  // ---------------- RESEND TIMER ----------------
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

  // ---------------- STEP 1 ----------------
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

  // ---------------- STEP 2 ----------------
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

  // ---------------- STEP 3 ----------------
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

    const timeout = setTimeout(() => {
      resetForm(); // NEW (clean reset before leaving)
      onBackToLogin();
    }, 2000);

    return () => clearTimeout(timeout);
  };

  // ---------------- RESET FORM FUNCTION (NEW) ----------------
  const resetForm = () => {
    setStep(1);
    setContact("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setErrors({});
    setShowSuccess(false);
    setMaskedContact("");
    setResendTimer(0);
    setCanResend(true);
  };

  const handleResendCode = (e) => {
    e.preventDefault();
    if (!canResend) return;

    setCanResend(false);
    setResendTimer(20);
    console.log("Verification code resent to", contact);
  };

  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

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

      {/* KEEP YOUR EXISTING JSX UI BELOW EXACTLY SAME */}
    </>
  );
};

export default ForgotPasswordForm;
