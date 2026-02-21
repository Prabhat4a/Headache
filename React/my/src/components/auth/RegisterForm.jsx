// src/components/auth/RegisterForm.jsx
import React, { useState } from "react";
import VerificationModal from "./VerificationModal";

const RegisterForm = ({ onSwitchToLogin, onShowTerms, onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [verified, setVerified] = useState({ email: false, phone: false });
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationType, setVerificationType] = useState(null);
  const [blinkError, setBlinkError] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\d{10}$/.test(phone);
  const validateUsername = (username) => {
    if (!username) return { valid: false, message: "Please enter a username" };
    if (!/^[a-zA-Z]/.test(username))
      return { valid: false, message: "Username must start with a letter" };
    if (/\s/.test(username))
      return { valid: false, message: "Username cannot contain spaces" };
    if (username.length > 9)
      return { valid: false, message: "Username max 9 characters" };
    return { valid: true };
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "email" && verified.email) {
      setVerified((prev) => ({ ...prev, email: false }));
    }
    if (field === "phone" && verified.phone) {
      setVerified((prev) => ({ ...prev, phone: false }));
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handlePhoneInput = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    handleInputChange("phone", value);
  };

  const openVerification = (type) => {
    if (type === "email" && !validateEmail(formData.email.trim())) {
      setErrors((prev) => ({ ...prev, email: "Enter a valid email first" }));
      return;
    }
    if (type === "phone" && !validatePhone(formData.phone.trim())) {
      setErrors((prev) => ({
        ...prev,
        phone: "Enter a valid 10-digit number first",
      }));
      return;
    }

    setVerificationType(type);
    setShowVerificationModal(true);
  };

  const handleVerificationSuccess = (type) => {
    setVerified((prev) => ({ ...prev, [type]: true }));
    setShowVerificationModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    const userCheck = validateUsername(formData.username.trim());
    if (!userCheck.valid) {
      newErrors.username = userCheck.message;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email";
    } else if (!validateEmail(formData.email.trim())) {
      newErrors.email = "Please enter a valid email";
    } else if (!verified.email) {
      newErrors.email = "Please verify your email first";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Please enter your phone number";
    } else if (!validatePhone(formData.phone.trim())) {
      newErrors.phone = "Please enter a valid 10-digit number";
    } else if (!verified.phone) {
      newErrors.phone = "Please verify your phone number first";
    }

    if (!formData.password) {
      newErrors.password = "Please enter your password";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!termsAccepted) {
      setBlinkError(true);
      setTimeout(() => setBlinkError(false), 1600);
    }

    if (Object.keys(newErrors).length > 0 || !termsAccepted) {
      setErrors(newErrors);
      return;
    }

    onRegisterSuccess({
      email: formData.email,
      password: formData.password,
      username: formData.username,
      phone: formData.phone,
    });
  };

  return (
    <>
      <div className="box-head-2">
        <h1>Register</h1>
      </div>
      <form id="registerForm" onSubmit={handleSubmit}>
        {/* Username - Full width */}
        <div className="input-box">
          <div className="input-wrapper">
            <i className="bx bx-user"></i>
            <input
              type="text"
              id="registerUsername"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              className={errors.username ? "error" : ""}
            />
          </div>
          <div className={`error-message ${errors.username ? "show" : ""}`}>
            {errors.username}
          </div>
        </div>

        {/* Email with Verify Button */}
        <div className="input-box verify-box">
          <div className="input-wrapper-with-btn">
            <div className="input-wrapper">
              <i className="bx bx-envelope"></i>
              <input
                type="email"
                id="registerEmail"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={errors.email ? "error" : ""}
              />
            </div>
            <button
              type="button"
              className="verify-small-btn"
              id="verifyEmailBtn"
              onClick={() => openVerification("email")}
              disabled={verified.email}
            >
              {verified.email ? "Verified ✓" : "Verify"}
            </button>
          </div>
          <div className={`error-message ${errors.email ? "show" : ""}`}>
            {errors.email}
          </div>
        </div>

        {/* Phone with +91 and Verify Button */}
        <div className="input-box verify-box">
          <div className="input-wrapper-with-btn">
            <div className="input-wrapper phone-input-wrapper">
              <span className="country-code">+91</span>
              <input
                type="tel"
                id="registerPhone"
                placeholder="Phone number"
                maxLength="10"
                value={formData.phone}
                onChange={handlePhoneInput}
                className={errors.phone ? "error" : ""}
              />
            </div>
            <button
              type="button"
              className="verify-small-btn"
              id="verifyPhoneBtn"
              onClick={() => openVerification("phone")}
              disabled={verified.phone}
            >
              {verified.phone ? "Verified ✓" : "Verify"}
            </button>
          </div>
          <div className={`error-message ${errors.phone ? "show" : ""}`}>
            {errors.phone}
          </div>
        </div>

        {/* Password */}
        <div className="input-box">
          <div className="input-wrapper">
            <i className="bx bx-lock"></i>
            <input
              type={showPassword ? "text" : "password"}
              id="registerPassword"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className={errors.password ? "error" : ""}
            />
            <i
              className={`bx ${showPassword ? "bx-show" : "bx-hide"} toggle-password`}
              id="toggleRegisterPassword"
              onClick={() => setShowPassword(!showPassword)}
            ></i>
          </div>
          <div className={`error-message ${errors.password ? "show" : ""}`}>
            {errors.password}
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className={`remember ${blinkError ? "blink-error" : ""}`}>
          <label>
            <input
              type="checkbox"
              id="termsCheckbox"
              checked={termsAccepted}
              onChange={(e) => {
                setTermsAccepted(e.target.checked);
                setBlinkError(false);
              }}
            />{" "}
            I agree with{" "}
            <a
              href="#"
              className="terms-link"
              onClick={(e) => {
                e.preventDefault();
                onShowTerms();
              }}
            >
              terms and conditions
            </a>
          </label>
        </div>

        {/* Register Button */}
        <div className="Register-button">
          <button type="submit">Register</button>
        </div>

        <div className="divider">
          <span>OR</span>
        </div>

        {/* Google Button */}
        <button type="button" className="google-login">
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="google-icon"
          />
          Continue with Google
        </button>

        {/* Already have account */}
        <div className="have-account">
          <p>
            Already have an account?{" "}
            <a href="#" className="Login-acc" onClick={onSwitchToLogin}>
              Login
            </a>
          </p>
        </div>
      </form>

      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        type={verificationType}
        targetValue={
          verificationType === "email"
            ? formData.email
            : `+91 ${formData.phone}`
        }
        onVerify={handleVerificationSuccess}
      />
    </>
  );
};

export default RegisterForm;
