import { useState, useRef } from "react";
import { useLocation } from "react-router-dom";

const styles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }

  .link-account-page {
    min-height: 100vh;
    background-color: #0d1117;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 20px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  }

  .link-account-container {
    width: 100%;
    max-width: 380px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    margin-bottom: 28px;
  }
  .logo-diamond {
    width: 52px;
    height: 52px;
    background: linear-gradient(135deg, #8b5cf6, #a78bfa);
    transform: rotate(45deg);
    border-radius: 10px;
    box-shadow: 0 8px 28px rgba(139,92,246,0.45);
  }
  .logo-name {
    font-size: 21px;
    font-weight: 800;
    letter-spacing: 0.08em;
    background: linear-gradient(135deg, #c4b5fd, #818cf8, #6ee7b7);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  h1 {
    color: #f0f6fc;
    font-size: 22px;
    font-weight: 400;
    margin-bottom: 6px;
    letter-spacing: -0.4px;
  }
  .subtitle {
    color: #8b949e;
    font-size: 13px;
    margin-bottom: 22px;
  }

  .info-card {
    width: 100%;
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 10px;
    padding: 14px 16px;
    margin-bottom: 20px;
    text-align: left;
  }
  .info-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  .info-row:last-child { margin-bottom: 0; }
  .info-icon {
    width: 30px;
    height: 30px;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
  }
  .gmail-bg { background: #2d1f1f; }
  .user-bg  { background: #1f2a2d; }
  .info-col {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .info-label {
    font-size: 10px;
    color: #555;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .info-value { font-size: 13px; color: #c9d1d9; }
  .badge {
    display: inline-block;
    background: #21262d;
    color: #8b949e;
    font-size: 10px;
    padding: 2px 7px;
    border-radius: 20px;
    border: 1px solid #30363d;
    margin-left: 6px;
    vertical-align: middle;
  }

  .notice {
    width: 100%;
    background: #0d1117;
    border: 1px solid #30363d;
    border-radius: 10px;
    padding: 13px 16px;
    margin-bottom: 22px;
    color: #8b949e;
    font-size: 13.5px;
    line-height: 1.65;
    text-align: left;
  }
  .notice strong { color: #e6edf3; }

  .pw-section { width: 100%; margin-bottom: 16px; }
  .pw-wrapper { width: 100%; position: relative; margin-bottom: 6px; }
  .pw-input {
    width: 100%;
    padding: 11px 40px 11px 14px;
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 7px;
    color: #f0f6fc;
    font-size: 14px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s;
  }
  .pw-input:focus { border-color: #58a6ff; }
  .pw-input.input-error   { border-color: #f85149; }
  .pw-input.input-success { border-color: #3fb950; }
  .pw-toggle {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #8b949e;
    cursor: pointer;
    font-size: 16px;
    padding: 2px;
  }
  .error-msg {
    color: #f85149;
    font-size: 12px;
    text-align: left;
    margin-top: 4px;
  }

  .btn {
    width: 100%;
    padding: 12px;
    border-radius: 7px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.18s;
    margin-bottom: 10px;
    border: 1px solid transparent;
  }
  .btn-green  { background: #238636; color: #fff; border-color: rgba(240,246,252,0.1); }
  .btn-green:hover  { background: #2ea043; }
  .btn-purple { background: linear-gradient(135deg, #6e40c9, #8b5cf6); color: #fff; }
  .btn-purple:hover { background: linear-gradient(135deg, #7c4de0, #9c6df8); transform: translateY(-1px); }
  .btn-outline { background: #21262d; color: #8b949e; border-color: #30363d; }
  .btn-outline:hover { color: #c9d1d9; background: #2d333b; }
  .btn-link {
    background: none;
    border: none;
    color: #58a6ff;
    font-size: 13px;
    cursor: pointer;
    font-family: inherit;
    padding: 4px;
    margin-bottom: 0;
  }
  .btn-link:hover { text-decoration: underline; }

  .success-box {
    width: 100%;
    background: #0f2a0f;
    border: 1px solid #3fb950;
    border-radius: 10px;
    padding: 24px 16px;
    text-align: center;
    margin-bottom: 16px;
  }
  .success-icon  { font-size: 44px; margin-bottom: 12px; }
  .success-title { color: #3fb950; font-size: 18px; font-weight: 600; margin-bottom: 6px; }
  .success-sub   { color: #8b949e; font-size: 13px; line-height: 1.5; }
  .success-sub strong { color: #c9d1d9; }

  .divider { color: #30363d; font-size: 11px; margin: 2px 0 10px; }

  .toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: #161b22;
    border: 1px solid #30363d;
    color: #f0f6fc;
    padding: 11px 20px;
    border-radius: 7px;
    font-size: 13px;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    white-space: nowrap;
    z-index: 999;
  }
  .toast.show { opacity: 1; }
`;

const CORRECT_PASSWORD = "aryan123";

export default function LinkAccount() {
  const { state } = useLocation();
  const email = state?.email || "unknown@gmail.com";
  const username = state?.username || "@user";

  const [step, setStep] = useState("main");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [inputState, setInputState] = useState("");
  const [toast, setToast] = useState({ show: false, msg: "" });
  const inputRef = useRef(null);

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 2500);
  };

  const handleEnterPassword = () => {
    setStep("password");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleBack = () => {
    setStep("main");
    setPassword("");
    setError("");
    setInputState("");
  };

  const handleSubmit = () => {
    if (!password.trim()) {
      setError("⚠️ Please enter your password.");
      setInputState("error");
      return;
    }
    if (password !== CORRECT_PASSWORD) {
      setError("❌ Incorrect password. Please try again.");
      setInputState("error");
      setPassword("");
      setTimeout(() => inputRef.current?.focus(), 50);
      return;
    }
    setInputState("success");
    setError("");
    setTimeout(() => setStep("success"), 400);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <>
      <style>{styles}</style>
      <div className="link-account-page">
        <div className="link-account-container">
          <div className="logo">
            <div className="logo-diamond" />
            <span className="logo-name">STUVO5</span>
          </div>

          {/* STEP 1: Main */}
          {step === "main" && (
            <>
              <h1>Add new sign in method</h1>
              <p className="subtitle">
                Link your Google account to this username
              </p>

              <div className="info-card">
                <div className="info-row">
                  <div className="info-icon gmail-bg">📧</div>
                  <div className="info-col">
                    <span className="info-label">Gmail</span>
                    <span className="info-value">
                      {email}
                      <span className="badge">existing</span>
                    </span>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-icon user-bg">👤</div>
                  <div className="info-col">
                    <span className="info-label">Username</span>
                    <span className="info-value">{username}</span>
                  </div>
                </div>
              </div>

              <div className="notice">
                <strong>{username}</strong> — enter your password to enable{" "}
                <strong>Google sign-in</strong> for this account.
              </div>

              <button className="btn btn-purple" onClick={handleEnterPassword}>
                🔑 Enter Password
              </button>
              <button
                className="btn btn-outline"
                onClick={() => showToast("↩ Returning to sign in...")}
              >
                Return to sign in
              </button>
            </>
          )}

          {/* STEP 2: Password */}
          {step === "password" && (
            <>
              <h1>Enter your password</h1>
              <p className="subtitle">
                Confirm your identity to link Google sign-in
              </p>

              <div className="info-card" style={{ marginBottom: 18 }}>
                <div className="info-row" style={{ marginBottom: 0 }}>
                  <div className="info-icon user-bg">👤</div>
                  <div className="info-col">
                    <span className="info-label">Linking as</span>
                    <span className="info-value">{username}</span>
                  </div>
                </div>
              </div>

              <div className="pw-section">
                <div className="pw-wrapper">
                  <input
                    ref={inputRef}
                    type={showPw ? "text" : "password"}
                    className={`pw-input ${inputState === "error" ? "input-error" : inputState === "success" ? "input-success" : ""}`}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                      setInputState("");
                    }}
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    className="pw-toggle"
                    onClick={() => setShowPw(!showPw)}
                  >
                    {showPw ? "🙈" : "👁"}
                  </button>
                </div>
                {error && <div className="error-msg">{error}</div>}
              </div>

              <button className="btn btn-green" onClick={handleSubmit}>
                Link Account
              </button>
              <div className="divider">──────────────────────</div>
              <button className="btn-link" onClick={handleBack}>
                ← Back
              </button>
            </>
          )}

          {/* STEP 3: Success */}
          {step === "success" && (
            <>
              <div className="success-box">
                <div className="success-icon">✅</div>
                <div className="success-title">Account Linked!</div>
                <div className="success-sub">
                  Google sign-in has been enabled for{" "}
                  <strong>{username}</strong>
                </div>
              </div>
              <button
                className="btn btn-green"
                onClick={() => showToast("Redirecting to dashboard...")}
              >
                Go to Dashboard
              </button>
            </>
          )}
        </div>
      </div>

      <div className={`toast ${toast.show ? "show" : ""}`}>{toast.msg}</div>
    </>
  );
}
