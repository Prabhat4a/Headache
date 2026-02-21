import React from "react";

const PrivacyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="privacy-modal show">
      <div className="terms-content">
        <div className="terms-header">
          <h2>Privacy Policy – STUVO5</h2>
          <span className="close-terms" onClick={onClose}>
            &times;
          </span>
        </div>
        <div className="terms-body">
          <h3>1. Introduction</h3>
          <p>
            Your privacy is important to us. This Privacy Policy explains how
            STUVO5 collects, uses, and protects your personal information.
          </p>

          <h3>2. Data We Collect</h3>
          <p>
            We collect your name, email address, username, roll number, branch,
            year, profile photo (optional), and general usage activity.
          </p>

          <h3>3. How We Use Your Data</h3>
          <p>
            Your data is used solely to provide and improve our student
            services. We do not use your data for advertising.
          </p>

          <h3>4. Data Storage & Security</h3>
          <p>
            We take reasonable measures to protect your information. However, as
            STUVO5 is an academic project, we cannot guarantee absolute
            security.
          </p>

          <h3>5. Cookies & Sessions</h3>
          <p>
            STUVO5 may use session data to keep you logged in. No third-party
            tracking cookies are used.
          </p>

          <h3>6. Third-Party Services</h3>
          <p>
            If you choose to sign in with Google, your basic Google profile
            information may be shared with us.
          </p>

          <h3>7. Data Sharing</h3>
          <p>
            We do not sell, trade, or share your personal data with any external
            parties.
          </p>

          <h3>8. Your Rights</h3>
          <p>
            You have the right to request access to, correction of, or deletion
            of your personal data at any time.
          </p>

          <h3>9. Minors</h3>
          <p>STUVO5 is intended for college students aged 17 or older.</p>

          <h3>10. Policy Updates</h3>
          <p>This policy may be updated as the platform evolves.</p>

          <h3>11. Contact Regarding Privacy</h3>
          <p>
            For any privacy-related concerns, please reach us through the
            Contact page.
          </p>
        </div>
        <div className="terms-footer">
          <button className="accept-terms" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyModal;
