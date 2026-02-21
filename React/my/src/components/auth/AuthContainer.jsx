import React, { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import TermsModal from "./TermsModal";
import VerificationForm from "./VerificationForm";

const AuthContainer = () => {
  const [currentView, setCurrentView] = useState("login"); // 'login', 'register', 'verification'
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [registeredData, setRegisteredData] = useState(null);

  const switchToRegister = (e) => {
    e.preventDefault();
    setCurrentView("register");
  };

  const switchToLogin = (e) => {
    e.preventDefault();
    setCurrentView("login");
  };

  const handleRegisterSuccess = (userData) => {
    setRegisteredData(userData);
    setCurrentView("verification");
  };

  const handleVerificationComplete = () => {
    setCurrentView("login");
    setRegisteredData(null);
  };

  const handleBackToLogin = () => {
    setCurrentView("login");
  };

  // VERIFICATION PAGE VIEW
  if (currentView === "verification") {
    return (
      <div className="verification-section" style={{ display: "flex" }}>
        <video autoPlay muted loop id="bg-video-verify">
          <source src="/website.mp4" type="video/mp4" />
        </video>
        <div className="video-overlay"></div>

        <div className="logo">
          <img src="/logo.png" alt="STRUVO" className="logo-icon" />
          <h1>STUVO5</h1>
        </div>

        <VerificationForm
          userData={registeredData}
          onComplete={handleVerificationComplete}
          onBack={handleBackToLogin}
        />
      </div>
    );
  }

  // LOGIN/REGISTER VIEW
  return (
    <div className="auth-section" id="authSection">
      <video autoPlay muted loop id="bg-video">
        <source src="/website.mp4" type="video/mp4" />
      </video>
      <div className="video-overlay"></div>

      <div className="logo">
        <img src="/logo.png" alt="STRUVO" className="logo-icon" />
        <h1>STUVO5</h1>
      </div>

      <div className="login-box">
        {currentView === "login" ? (
          <div className="objects" style={{ display: "block" }}>
            <LoginForm onSwitchToRegister={switchToRegister} />
          </div>
        ) : (
          <div className="objects-register" style={{ display: "block" }}>
            <RegisterForm
              onSwitchToLogin={switchToLogin}
              onShowTerms={() => setShowTerms(true)}
              onRegisterSuccess={handleRegisterSuccess}
            />
          </div>
        )}
      </div>

      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
};

export default AuthContainer;
