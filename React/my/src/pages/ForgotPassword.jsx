import React from "react";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";
const ForgotPassword = ({ onBackToLogin }) => {
  return (
    <div className="forgot-section">
      <video autoPlay muted loop id="bg-video">
        <source src="/website.mp4" type="video/mp4" />
      </video>
      <div className="video-overlay"></div>

      <div className="logo">
        <img src="/logo.png" alt="STUVO" className="logo-icon" />
        <h1>STUVO5</h1>
      </div>

      <ForgotPasswordForm onBackToLogin={onBackToLogin} />
    </div>
  );
};

export default ForgotPassword;
