import React, { useState, useRef, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/* ═══════════════════════════════════════════════════════════
   CROP MODAL
═══════════════════════════════════════════════════════════ */
function CropModal({ isOpen, onClose, onApply, imageUrl }) {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const stateRef = useRef({ offsetX: 0, offsetY: 0, isDragging: false, lastX: 0, lastY: 0, image: null });

  const drawCrop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !stateRef.current.image) return;
    const ctx = canvas.getContext("2d");
    const { image, offsetX, offsetY } = stateRef.current;
    const cw = canvas.width, ch = canvas.height;
    const baseScale = Math.max(cw / image.width, ch / image.height);
    const totalScale = baseScale * zoom;
    const drawW = image.width * totalScale;
    const drawH = image.height * totalScale;
    const minX = cw - drawW, minY = ch - drawH;
    const clampedX = Math.min(0, Math.max(offsetX, minX));
    const clampedY = Math.min(0, Math.max(offsetY, minY));
    stateRef.current.offsetX = clampedX;
    stateRef.current.offsetY = clampedY;
    ctx.clearRect(0, 0, cw, ch);

    // Draw dimmed background
    ctx.save(); ctx.globalAlpha = 0.35;
    ctx.drawImage(image, clampedX, clampedY, drawW, drawH);
    ctx.restore();

    // Draw circle clip
    const cx = cw / 2, cy = ch / 2;
    const radius = Math.min(cw, ch) * 0.44;
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.clip();
    ctx.drawImage(image, clampedX, clampedY, drawW, drawH); ctx.restore();

    // Draw circle border
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
  }, [zoom]);

  useEffect(() => {
    if (!isOpen || !imageUrl || !canvasRef.current) return;
    const img = new Image();
    img.onload = () => {
      stateRef.current.image = img;
      stateRef.current.offsetX = 0;
      stateRef.current.offsetY = 0;
      const container = canvasRef.current.parentElement;
      const rect = container.getBoundingClientRect();
      canvasRef.current.width = rect.width;
      canvasRef.current.height = rect.height;
      drawCrop();
    };
    img.src = imageUrl;
  }, [isOpen, imageUrl, drawCrop]);

  useEffect(() => { if (isOpen) drawCrop(); }, [zoom, isOpen, drawCrop]);

  const handleMouseDown = (e) => {
    stateRef.current.isDragging = true;
    stateRef.current.lastX = e.clientX;
    stateRef.current.lastY = e.clientY;
  };

  const handleTouchStart = (e) => {
    stateRef.current.isDragging = true;
    stateRef.current.lastX = e.touches[0].clientX;
    stateRef.current.lastY = e.touches[0].clientY;
  };

  const handleMouseMove = useCallback((e) => {
    if (!stateRef.current.isDragging) return;
    stateRef.current.offsetX += e.clientX - stateRef.current.lastX;
    stateRef.current.offsetY += e.clientY - stateRef.current.lastY;
    stateRef.current.lastX = e.clientX;
    stateRef.current.lastY = e.clientY;
    drawCrop();
  }, [drawCrop]);

  const handleTouchMove = useCallback((e) => {
    if (!stateRef.current.isDragging) return;
    stateRef.current.offsetX += e.touches[0].clientX - stateRef.current.lastX;
    stateRef.current.offsetY += e.touches[0].clientY - stateRef.current.lastY;
    stateRef.current.lastX = e.touches[0].clientX;
    stateRef.current.lastY = e.touches[0].clientY;
    drawCrop();
  }, [drawCrop]);

  const handleMouseUp = useCallback(() => { stateRef.current.isDragging = false; }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchend", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleApply = () => {
    const canvas = canvasRef.current;
    if (!canvas || !stateRef.current.image) return;
    const { image, offsetX, offsetY } = stateRef.current;
    const cw = canvas.width, ch = canvas.height;
    const outW = 500, outH = 500;
    const scaleX = outW / cw, scaleY = outH / ch;
    const offscreen = document.createElement("canvas");
    offscreen.width = outW; offscreen.height = outH;
    const octx = offscreen.getContext("2d");
    const baseScale = Math.max(cw / image.width, ch / image.height);
    const totalScale = baseScale * zoom;
    const drawW = image.width * totalScale, drawH = image.height * totalScale;
    const minX = cw - drawW, minY = ch - drawH;
    const clampedX = Math.min(0, Math.max(offsetX, minX));
    const clampedY = Math.min(0, Math.max(offsetY, minY));
    octx.beginPath();
    octx.arc(outW / 2, outH / 2, Math.min(outW, outH) / 2, 0, Math.PI * 2);
    octx.clip();
    octx.drawImage(image, clampedX * scaleX, clampedY * scaleY, drawW * scaleX, drawH * scaleY);
    onApply(offscreen.toDataURL("image/png", 1.0));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="vf-crop-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="vf-crop-modal">
        <div className="vf-crop-header">
          <h3>Crop Profile Photo</h3>
          <i className="bx bx-x" onClick={onClose} style={{ fontSize: 28, cursor: "pointer", color: "#888" }} />
        </div>
        <div className="vf-crop-canvas-wrap">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            style={{ width: "100%", height: "100%", cursor: "grab", display: "block" }}
          />
        </div>
        <div className="vf-crop-zoom">
          <label>Zoom</label>
          <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} />
        </div>
        <div className="vf-crop-actions">
          <button className="vf-crop-cancel" onClick={onClose}>Cancel</button>
          <button className="vf-crop-apply" onClick={handleApply}>Apply</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   VERIFICATION FORM
═══════════════════════════════════════════════════════════ */
const VerificationForm = ({ registeredData: propData, onBackToLogin }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const registeredData = location.state?.registeredData || propData || {};

  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [nameError, setNameError] = useState("");
  const [rollError, setRollError] = useState("");
  const [branchError, setBranchError] = useState("");
  const [yearError, setYearError] = useState("");

  // Crop modal state
  const [cropOpen, setCropOpen] = useState(false);
  const [rawImageUrl, setRawImageUrl] = useState(null);
  const fileInputRef = useRef(null);

  const existingUsers = [
    { name: "John Doe",      roll: "CS2024001", email: "john@gmail.com",  phone: "9876543210" },
    { name: "Jane Smith",    roll: "EC2024002", email: "jane@gmail.com",  phone: "8765432109" },
    { name: "Mike Johnson",  roll: "EE2024003", email: "mike@yahoo.com",  phone: "7654321098" },
  ];

  const handleBackToLogin = () => {
    if (onBackToLogin) onBackToLogin();
    else navigate("/login");
  };

  // ── Open file picker ──
  const handlePhotoClick = () => fileInputRef.current.click();

  // ── File selected → open crop modal ──
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("File size must be less than 5MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setRawImageUrl(ev.target.result);
      setCropOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ── Crop applied → set preview ──
  const handleCropApply = (croppedDataUrl) => {
    setPhotoPreview(croppedDataUrl);
  };

  const checkDuplicates = (name, roll, email, phone) => {
    const duplicates = [];
    for (let user of existingUsers) {
      if (user.name.toLowerCase() === name.toLowerCase()) duplicates.push("Name");
      if (roll && user.roll.toLowerCase() === roll.toLowerCase()) duplicates.push("Roll Number");
      if (user.email.toLowerCase() === email.toLowerCase()) duplicates.push("Email");
      if (user.phone === phone) duplicates.push("Phone Number");
    }
    return duplicates;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setNameError(""); setRollError(""); setBranchError(""); setYearError("");
    let isValid = true;

    if (!name.trim()) { setNameError("Please enter your full name"); isValid = false; }
    else if (name.trim().length < 3) { setNameError("Name must be at least 3 characters"); isValid = false; }
    if (roll.trim() && roll.trim().length < 5) { setRollError("Roll number must be at least 5 characters"); isValid = false; }
    if (!branch) { setBranchError("Please select your branch"); isValid = false; }
    if (!year) { setYearError("Please select your year"); isValid = false; }

    if (isValid) {
      const duplicates = checkDuplicates(name.trim(), roll.trim(), registeredData.email || "", registeredData.phone || "");
      if (duplicates.length > 0) {
        alert("⚠️ Registration Failed!\n\nThe following data already exists:\n" + duplicates.join(", ") + "\n\nPlease use different information.");
        if (duplicates.includes("Name")) setNameError("This name is already registered");
        if (duplicates.includes("Roll Number")) setRollError("This roll number is already registered");
        isValid = false;
      }
    }

    if (isValid) {
      alert("✅ Registration Successful!\n\nYour account has been created. Please login with your credentials.");
      handleBackToLogin();
    }
  };

  return (
    <>
      {/* Crop Modal */}
      <CropModal
        isOpen={cropOpen}
        imageUrl={rawImageUrl}
        onClose={() => setCropOpen(false)}
        onApply={handleCropApply}
      />

      <div className="verification-section" id="verificationSection" style={{ display: "flex" }}>
        <video autoPlay muted loop id="bg-video-verify">
          <source src="website.mp4" type="video/mp4" />
        </video>
        <div className="video-overlay"></div>

        <div className="logo">
          <img src="logo.png" alt="STRUVO" className="logo-icon" />
          <h1>STUVO5</h1>
        </div>

        <div className="verification-box">
          <div className="box-head-verify">
            <h1>Complete Your Profile</h1>
            <p className="subtitle">Just a few more details to get started</p>
          </div>

          <form id="verificationForm" onSubmit={handleSubmit}>
            {/* AVATAR UPLOAD */}
            <div className="avatar-upload-section">
              <div className="avatar-circle" id="avatarCircle" onClick={handlePhotoClick}>
                <div className="avatar-placeholder" id="avatarPlaceholder" style={{ display: photoPreview ? "none" : "flex" }}>
                  <i className="bx bx-user-circle"></i>
                </div>
                <img
                  src={photoPreview}
                  alt="Profile"
                  className="avatar-preview-img"
                  id="avatarPreviewImg"
                  style={{ display: photoPreview ? "block" : "none" }}
                />
                <div className="avatar-overlay" id="avatarOverlay">
                  <i className="bx bx-camera"></i>
                  <span>{photoPreview ? "Change" : "Upload"}</span>
                </div>
              </div>
              <p className="avatar-label">
                Profile Photo <span className="optional">· Optional</span>
              </p>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                hidden
                onChange={handlePhotoChange}
              />
            </div>

            <div className="form-row">
              <div className="input-box">
                <label>Full Name</label>
                <div className="input-wrapper">
                  <i className="bx bx-user"></i>
                  <input type="text" placeholder="Enter your full name" value={name} onChange={(e) => { setName(e.target.value); setNameError(""); }} className={nameError ? "error" : ""} />
                </div>
                <div className={`error-message ${nameError ? "show" : ""}`}>{nameError}</div>
              </div>

              <div className="input-box">
                <label>Roll Number <span className="optional-label">· Optional</span></label>
                <div className="input-wrapper">
                  <i className="bx bx-id-card"></i>
                  <input type="text" placeholder="Enter roll number (optional)" value={roll} onChange={(e) => { setRoll(e.target.value); setRollError(""); }} className={rollError ? "error" : ""} />
                </div>
                <div className={`error-message ${rollError ? "show" : ""}`}>{rollError}</div>
              </div>
            </div>

            <div className="form-row">
              <div className="input-box">
                <label>Branch</label>
                <div className="input-wrapper">
                  <i className="bx bx-book"></i>
                  <select value={branch} onChange={(e) => { setBranch(e.target.value); setBranchError(""); }} className={branchError ? "error" : ""}>
                    <option value="">Select Branch</option>
                    <option value="CSE">Computer Science Engineering</option>
                    <option value="ECE">Electronics & Communication</option>
                    <option value="EEE">Electrical & Electronics</option>
                    <option value="MECH">Mechanical Engineering</option>
                    <option value="CIVIL">Civil Engineering</option>
                    <option value="IT">Information Technology</option>
                    <option value="AI-ML">AI & Machine Learning</option>
                    <option value="DS">Data Science</option>
                  </select>
                </div>
                <div className={`error-message ${branchError ? "show" : ""}`}>{branchError}</div>
              </div>

              <div className="input-box">
                <label>Year</label>
                <div className="input-wrapper">
                  <i className="bx bx-calendar"></i>
                  <select value={year} onChange={(e) => { setYear(e.target.value); setYearError(""); }} className={yearError ? "error" : ""}>
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                    <option value="5">5th Year</option>
                    <option value="6">6th Year</option>
                  </select>
                </div>
                <div className={`error-message ${yearError ? "show" : ""}`}>{yearError}</div>
              </div>
            </div>

            <div className="verify-button">
              <button type="submit">Complete Registration</button>
            </div>

            <div className="back-to-login">
              <a href="#" onClick={(e) => { e.preventDefault(); handleBackToLogin(); }}>
                ← Back to Registration
              </a>
            </div>
          </form>
        </div>
      </div>

      {/* Crop Modal CSS — injected inline so no extra file needed */}
      <style>{`
        .vf-crop-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.92);
          z-index: 9999; display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(8px);
        }
        .vf-crop-modal {
          background: #1a1a1a; padding: 20px; border-radius: 20px;
          width: 92%; max-width: 420px; border: 1px solid #333;
        }
        .vf-crop-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #333;
        }
        .vf-crop-header h3 { font-size: 18px; color: #fff; margin: 0; }
        .vf-crop-canvas-wrap {
          width: 100%; aspect-ratio: 1; max-width: 380px;
          margin: 0 auto; overflow: hidden; border-radius: 12px;
          background: #111; touch-action: none; cursor: grab;
        }
        .vf-crop-zoom {
          display: flex; align-items: center; gap: 12px;
          margin: 14px 0; max-width: 380px; margin-left: auto; margin-right: auto;
        }
        .vf-crop-zoom label { font-size: 13px; color: #888; flex-shrink: 0; }
        .vf-crop-zoom input[type="range"] { flex: 1; accent-color: #a78bfa; cursor: pointer; }
        .vf-crop-actions {
          display: flex; gap: 12px; margin-top: 16px;
          padding-top: 16px; border-top: 1px solid #333;
        }
        .vf-crop-cancel {
          flex: 1; background: #2a2a2a; border: 1px solid #444; color: white;
          padding: 12px; border-radius: 10px; cursor: pointer; font-weight: 600;
          font-size: 15px; transition: all 0.2s; font-family: inherit;
        }
        .vf-crop-cancel:hover { background: #333; }
        .vf-crop-apply {
          flex: 1; background: #a78bfa; border: none; color: white;
          padding: 12px; border-radius: 10px; cursor: pointer; font-weight: 600;
          font-size: 15px; transition: all 0.2s; font-family: inherit;
        }
        .vf-crop-apply:hover { background: #9270f5; transform: translateY(-1px); }
      `}</style>
    </>
  );
};

export default VerificationForm;