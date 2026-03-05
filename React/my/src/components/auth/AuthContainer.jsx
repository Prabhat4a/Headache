import React, { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import VerificationForm from "./VerificationForm";
import TermsModal from "./TermsModal";
import VerificationModal from "./VerificationModal";
import ForgotPasswordForm from "./ForgotPasswordForm";

import logo from "../../assets/logo.png";
import bgVideo from "../../assets/website.mp4";

import "../../styles/auth.css";

const AuthContainer = ({ initialView = "login" }) => {
  const [currentView, setCurrentView] = useState(initialView);
  const [showVerification, setShowVerification] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const [verifyType, setVerifyType] = useState(null);
  const [verifyTarget, setVerifyTarget] = useState("");

  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  const [generatedCode, setGeneratedCode] = useState("");
  const [registeredData, setRegisteredData] = useState({});

  const handleSwitchToRegister = () => setCurrentView("register");

  const handleSwitchToLogin = () => setCurrentView("login");

  const handleSwitchToForgotPassword = () => setCurrentView("forgot-password");

  const handleShowTerms = () => setShowTerms(true);

  const handleCloseTerms = () => setShowTerms(false);

  const handleAcceptTerms = () => setShowTerms(false);

  const handleOpenVerifyModal = (type, value) => {
    setVerifyType(type);
    setVerifyTarget(value);
    setGeneratedCode("123456"); // demo OTP
    setShowVerifyModal(true);
  };

  const handleCloseVerifyModal = () => setShowVerifyModal(false);

  const handleVerifyCode = (code) => {
    if (code === generatedCode) {
      if (verifyType === "email") setEmailVerified(true);

      if (verifyType === "phone") setPhoneVerified(true);

      setShowVerifyModal(false);

      return true;
    }

    return false;
  };

  const handleRegisterSuccess = (data) => {
    setRegisteredData(data);
    setShowVerification(true);
  };

  const handleBackToLogin = () => {
    setShowVerification(false);
    setCurrentView("login");
    setEmailVerified(false);
    setPhoneVerified(false);
  };

  const resetVerification = () => {
    setEmailVerified(false);
    setPhoneVerified(false);
  };

  if (showVerification) {
    return (
      <VerificationForm
        registeredData={registeredData}
        onBackToLogin={handleBackToLogin}
      />
    );
  }

  return (
    <div className="auth-section" id="authSection">
      <video autoPlay muted loop id="bg-video">
        <source src={bgVideo} type="video/mp4" />
      </video>

      <div className="video-overlay"></div>

      <div className="logo">
        <img src={logo} alt="STUVO" className="logo-icon" />
        <h1>STUVO5</h1>
      </div>

      <div className="login-box">
        {currentView === "login" && (
          <div className="objects">
            <LoginForm
              onSwitchToRegister={handleSwitchToRegister}
              onForgotPassword={handleSwitchToForgotPassword}
            />
          </div>
        )}

        {currentView === "register" && (
          <div className="objects-register">
            <RegisterForm
              onSwitchToLogin={handleSwitchToLogin}
              onShowTerms={handleShowTerms}
              onOpenVerifyModal={handleOpenVerifyModal}
              emailVerified={emailVerified}
              phoneVerified={phoneVerified}
              resetVerification={resetVerification}
              onRegisterSuccess={handleRegisterSuccess}
            />
          </div>
        )}

        {currentView === "forgot-password" && (
          <div className="objects-forgot">
            <ForgotPasswordForm onBackToLogin={handleSwitchToLogin} />
          </div>
        )}
      </div>

      <TermsModal
        show={showTerms}
        onClose={handleCloseTerms}
        onAccept={handleAcceptTerms}
      />

      <VerificationModal
        show={showVerifyModal}
        onClose={handleCloseVerifyModal}
        onVerify={handleVerifyCode}
        type={verifyType}
        target={verifyTarget}
      />
    </div>
  );
};

export default AuthContainer;
