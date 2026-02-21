import React, { useState } from "react";
import ForgotPasswordForm from "./ForgotPasswordForm";

const LoginForm = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Please enter your email";
    } else if (!validateEmail(email.trim())) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Please enter your password";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    window.location.href = "app.html";
  };

  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Show Forgot Password Form
  if (showForgotPassword) {
    return (
      <ForgotPasswordForm onBackToLogin={() => setShowForgotPassword(false)} />
    );
  }

  return (
    <>
      <div className="box-head">
        <h1>Log in</h1>
      </div>
      <form id="loginForm" onSubmit={handleSubmit} noValidate>
        <div className="input-box">
          <div className="input-wrapper">
            <i className="bx bx-envelope"></i>
            <input
              type="email"
              id="loginEmail"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError("email");
              }}
              className={errors.email ? "error" : ""}
            />
          </div>
          <div className={`error-message ${errors.email ? "show" : ""}`}>
            {errors.email}
          </div>
        </div>

        <div className="input-box">
          <div className="input-wrapper">
            <i className="bx bx-lock"></i>
            <input
              type={showPassword ? "text" : "password"}
              id="loginPassword"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError("password");
              }}
              className={errors.password ? "error" : ""}
            />
            <i
              className={`bx ${showPassword ? "bx-show" : "bx-hide"} toggle-password`}
              id="toggleLoginPassword"
              onClick={() => setShowPassword(!showPassword)}
            ></i>
          </div>
          <div className={`error-message ${errors.password ? "show" : ""}`}>
            {errors.password}
          </div>
        </div>

        <div className="remember-forgot">
          <label>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />{" "}
            Remember me
          </label>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setShowForgotPassword(true);
            }}
          >
            Forgot password?
          </a>
        </div>

        <div className="login-button">
          <button type="submit" id="loginBtn">
            Log in
          </button>
        </div>

        <div className="divider">
          <span>OR</span>
        </div>

        <button type="button" className="google-login">
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="google-icon"
          />
          Continue with Google
        </button>

        <div className="account">
          <p>
            Don't have an account?
            <a href="#" className="creat-acc" onClick={onSwitchToRegister}>
              Create an account
            </a>
          </p>
        </div>
      </form>
    </>
  );
};

export default LoginForm;
