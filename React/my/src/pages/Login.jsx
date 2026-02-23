import React, { useState } from "react";
import AuthContainer from "../components/auth/AuthContainer";
import PrivacyModal from "../components/auth/PrivacyModal";
import ContactModal from "../components/auth/ContactModal";
import Footer from "../components/Footer";

import "../styles/auth.css";

const Login = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showContact, setShowContact] = useState(false);

  return (
    <>
      <div className="login-page">
        <AuthContainer />
      </div>

      <footer className="site-footer">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setShowPrivacy(true);
          }}
        >
          Privacy
        </a>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setShowContact(true);
          }}
        >
          Contact with STUVO5
        </a>
        <span>© 2026 STUVO5. All rights reserved.</span>
      </footer>

      <PrivacyModal
        isOpen={showPrivacy}
        onClose={() => setShowPrivacy(false)}
      />
      <ContactModal
        isOpen={showContact}
        onClose={() => setShowContact(false)}
      />
    </>
  );
};

export default Login;
