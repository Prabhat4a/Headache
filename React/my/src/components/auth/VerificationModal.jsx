import React, { useState, useEffect, useRef } from "react";

const VerificationModal = ({
  isOpen,
  onClose,
  type,
  targetValue,
  onVerify,
}) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  const GENERATED_CODE = "123456"; // Demo code

  useEffect(() => {
    if (isOpen) {
      setCode("");
      setError("");
      setShake(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleVerify = () => {
    if (!code.trim()) {
      setError("Please enter the code");
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    if (code !== GENERATED_CODE) {
      setError("Incorrect code. Try: 123456");
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    onVerify(type);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleVerify();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="verify-modal show">
      <div className="verify-modal-content">
        <div className="verify-modal-header">
          <h3>Verify {type === "email" ? "Email" : "Phone"}</h3>
          <span className="close-verify" onClick={onClose}>
            &times;
          </span>
        </div>
        <div className="verify-modal-body">
          <p className="verify-text">
            Enter the 6-digit code sent to your <span>{targetValue}</span>
          </p>
          <div className="code-input-wrapper">
            <input
              type="text"
              id="verifyCodeInput"
              placeholder="000000"
              maxLength="6"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError("");
              }}
              onKeyPress={handleKeyPress}
              ref={inputRef}
              className={shake ? "error" : ""}
            />
          </div>
          <div
            className={`error-message ${error ? "show" : ""}`}
            id="verifyCodeError"
          >
            {error}
          </div>
          <button
            type="button"
            className="verify-submit-btn"
            onClick={handleVerify}
          >
            Verify Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
