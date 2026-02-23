import React, { useState } from "react";

const Footer = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [contactStep, setContactStep] = useState(1);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [refId, setRefId] = useState("");

  const contactTopics = [
    { emoji: "🔐", text: "Unable to Login" },
    { emoji: "📝", text: "Account Creation / Registration Issue" },
    { emoji: "🔑", text: "Unable to Change Password" },
    { emoji: "📧", text: "Email Verification Issue" },
    { emoji: "👤", text: "Profile Update Problem" },
    { emoji: "📊", text: "Marks / Attendance Not Showing" },
    { emoji: "🔔", text: "Not Receiving Notifications" },
    { emoji: "🚫", text: "Unable to Access Features" },
    { emoji: "🐛", text: "Bug / Technical Error" },
    { emoji: "💡", text: "Suggestion or Feedback" },
    { emoji: "⛔", text: "Account Suspended or Blocked" },
    { emoji: "❓", text: "Other / General Query" },
  ];

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setContactStep(2);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateContactForm = () => {
    const newErrors = {};
    if (!contactForm.name.trim() || contactForm.name.trim().length < 2) {
      newErrors.name = "Please enter your name";
    }
    if (
      !contactForm.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email)
    ) {
      newErrors.email = "Please enter a valid email";
    }
    if (!contactForm.message.trim() || contactForm.message.trim().length < 10) {
      newErrors.message = "Please describe your issue (at least 10 characters)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendMessage = () => {
    if (validateContactForm()) {
      const newRefId = "STU-" + Date.now().toString(36).toUpperCase().slice(-6);
      setRefId(newRefId);
      setContactStep(3);
    }
  };

  const resetContact = () => {
    setContactStep(1);
    setSelectedTopic("");
    setContactForm({ name: "", email: "", message: "" });
    setErrors({});
  };

  const closeContact = () => {
    setShowContact(false);
    setTimeout(resetContact, 300);
  };

  return (
    <>
      <footer className="site-footer">
        <div className="footer-links">
          <button className="footer-link" onClick={() => setShowPrivacy(true)}>
            Privacy
          </button>
          <button className="footer-link" onClick={() => setShowContact(true)}>
            Contact with STUVO5
          </button>
        </div>
        <span className="footer-divider">|</span>
        <span className="footer-copyright">
          © 2026 STUVO5. All rights reserved.
        </span>
      </footer>

      {/* Privacy Modal */}
      <div
        className={`modal-overlay ${showPrivacy ? "show" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setShowPrivacy(false);
        }}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h2>Privacy Policy – STUVO5</h2>
            <button className="close-btn" onClick={() => setShowPrivacy(false)}>
              ×
            </button>
          </div>
          <div className="modal-body">
            <h3>1. Introduction</h3>
            <p>
              Your privacy is important to us. This Privacy Policy explains how
              STUVO5 collects, uses, and protects your personal information when
              you use our platform.
            </p>

            <h3>2. Data We Collect</h3>
            <p>
              We collect your name, email address, username, roll number,
              branch, year, profile photo (optional), and general usage activity
              within the platform.
            </p>

            <h3>3. How We Use Your Data</h3>
            <p>
              Your data is used solely to provide and improve our student
              services. We do not use your data for advertising or any
              commercial purpose.
            </p>

            <h3>4. Data Storage & Security</h3>
            <p>
              We take reasonable measures to protect your information. However,
              as STUVO5 is an academic project, we cannot guarantee absolute
              security.
            </p>

            <h3>5. Cookies & Sessions</h3>
            <p>
              STUVO5 may use session data to keep you logged in and remember
              your preferences. No third-party tracking cookies are used.
            </p>

            <h3>6. Third-Party Services</h3>
            <p>
              If you choose to sign in with Google, your basic Google profile
              information may be shared with us as permitted by Google's OAuth
              policy. We do not store your Google password.
            </p>

            <h3>7. Data Sharing</h3>
            <p>
              We do not sell, trade, or share your personal data with any
              external parties.
            </p>

            <h3>8. Your Rights</h3>
            <p>
              You have the right to request access to, correction of, or
              deletion of your personal data at any time.
            </p>

            <h3>9. Minors</h3>
            <p>
              STUVO5 is intended for college students aged 17 or older. We do
              not knowingly collect data from minors under this age.
            </p>

            <h3>10. Policy Updates</h3>
            <p>
              This policy may be updated as the platform evolves. Continued use
              after updates implies acceptance of the revised policy.
            </p>

            <h3>11. Contact Regarding Privacy</h3>
            <p>
              For any privacy-related concerns, please reach us through the
              Contact page. We aim to respond within 48 hours.
            </p>
          </div>
          <div className="modal-footer">
            <button className="modal-btn" onClick={() => setShowPrivacy(false)}>
              Got it
            </button>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <div
        className={`modal-overlay ${showContact ? "show" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeContact();
        }}
      >
        <div className="modal-content contact-modal-content">
          <div className="modal-header">
            <h2>Contact STUVO5 Support</h2>
            <button className="close-btn" onClick={closeContact}>
              ×
            </button>
          </div>

          <div className="modal-body">
            {/* Step 1: Select Topic */}
            {contactStep === 1 && (
              <div className="contact-step">
                <p className="contact-subtitle">What do you need help with?</p>
                <div className="topic-grid">
                  {contactTopics.map((topic, index) => (
                    <button
                      key={index}
                      className="topic-btn"
                      onClick={() => handleTopicSelect(topic.text)}
                    >
                      {topic.emoji} {topic.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Contact Form */}
            {contactStep === 2 && (
              <div className="contact-step">
                <button
                  className="contact-back-btn"
                  onClick={() => setContactStep(1)}
                >
                  ← Back
                </button>
                <div className="selected-topic-badge">📌 {selectedTopic}</div>

                <div className="contact-form-group">
                  <label>Your Name</label>
                  <div className="contact-input-wrapper">
                    <i className="bx bx-user"></i>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      value={contactForm.name}
                      onChange={handleInputChange}
                      style={{ borderColor: errors.name ? "#ef4444" : "" }}
                    />
                  </div>
                  <div className={`contact-error ${errors.name ? "show" : ""}`}>
                    {errors.name}
                  </div>
                </div>

                <div className="contact-form-group">
                  <label>Email Address</label>
                  <div className="contact-input-wrapper">
                    <i className="bx bx-envelope"></i>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={contactForm.email}
                      onChange={handleInputChange}
                      style={{ borderColor: errors.email ? "#ef4444" : "" }}
                    />
                  </div>
                  <div
                    className={`contact-error ${errors.email ? "show" : ""}`}
                  >
                    {errors.email}
                  </div>
                </div>

                <div className="contact-form-group">
                  <label>Describe Your Issue</label>
                  <div className="contact-input-wrapper">
                    <i className="bx bx-message-detail textarea-icon"></i>
                    <textarea
                      name="message"
                      placeholder="Tell us more about your issue..."
                      rows="4"
                      value={contactForm.message}
                      onChange={handleInputChange}
                      style={{ borderColor: errors.message ? "#ef4444" : "" }}
                    ></textarea>
                  </div>
                  <div
                    className={`contact-error ${errors.message ? "show" : ""}`}
                  >
                    {errors.message}
                  </div>
                </div>

                <button
                  className="send-message-btn"
                  onClick={handleSendMessage}
                >
                  <i className="bx bx-send"></i> Send Message
                </button>
              </div>
            )}

            {/* Step 3: Success */}
            {contactStep === 3 && (
              <div className="contact-step">
                <div className="contact-success-body">
                  <div className="success-icon-wrap">
                    <i className="bx bx-check-circle"></i>
                  </div>
                  <h3 className="success-title">Message Sent!</h3>
                  <p className="success-msg">
                    Thank you for reaching out. Our team will get back to you
                    within <strong>24 hours</strong> on your registered email.
                  </p>
                  <p className="success-ref">
                    Reference ID: <span>{refId}</span>
                  </p>
                  <button
                    className="modal-btn"
                    onClick={closeContact}
                    style={{ marginTop: "24px", width: "100%" }}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
