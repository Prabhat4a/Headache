import { useState, useEffect, useRef, useCallback } from "react";
import "boxicons/css/boxicons.min.css";
import "../styles/Profile.css";

/* ═══════════════════════════════════════════════════════════
   PROFILE SKELETON
═══════════════════════════════════════════════════════════ */
function ProfileSkeleton() {
  return (
    <div className="profile-skeleton">
      {/* Cover */}
      <div className="ps-cover" />

      {/* Avatar overlapping cover */}
      <div className="ps-avatar-wrap">
        <div className="ps-avatar" />
      </div>

      {/* Name / username / bio */}
      <div className="ps-info">
        <div className="ps-text ps-name" />
        <div className="ps-text ps-username" />
        <div className="ps-text ps-bio" />
        <div className="ps-text ps-bio-short" />
        {/* Buttons */}
        <div className="ps-buttons">
          <div className="ps-btn ps-btn-main" />
          <div className="ps-btn ps-btn-small" />
        </div>
      </div>

      {/* Social links */}
      <div className="ps-social">
        <div className="ps-social-title" />
        <div className="ps-social-card">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="ps-social-item">
              <div className="ps-social-icon" />
              <div className="ps-social-info">
                <div className="ps-text ps-social-label" />
                <div className="ps-text ps-social-value" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CROP MODAL - WITH DRAG FUNCTIONALITY
═══════════════════════════════════════════════════════════ */
function CropModal({ isOpen, onClose, onApply, imageUrl, type }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const stateRef = useRef({
    offsetX: 0,
    offsetY: 0,
    startX: 0,
    startY: 0,
    image: null,
  });

  const drawCrop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !stateRef.current.image) return;
    const ctx = canvas.getContext("2d");
    const { image, offsetX, offsetY } = stateRef.current;
    const cw = canvas.width,
      ch = canvas.height;
    const baseScale = Math.max(cw / image.width, ch / image.height);
    const totalScale = baseScale * zoom;
    const drawW = image.width * totalScale,
      drawH = image.height * totalScale;
    const minX = cw - drawW,
      minY = ch - drawH;
    const clampedX = Math.min(0, Math.max(offsetX, minX));
    const clampedY = Math.min(0, Math.max(offsetY, minY));
    stateRef.current.offsetX = clampedX;
    stateRef.current.offsetY = clampedY;
    ctx.clearRect(0, 0, cw, ch);
    if (type === "avatar") {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.drawImage(image, clampedX, clampedY, drawW, drawH);
      ctx.restore();
      const cx = cw / 2,
        cy = ch / 2;
      const radius = Math.min(cw, ch) * 0.44;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(image, clampedX, clampedY, drawW, drawH);
      ctx.restore();
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.drawImage(image, clampedX, clampedY, drawW, drawH);
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, cw - 2, ch - 2);
      ctx.restore();
    }
  }, [zoom, type]);

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

  useEffect(() => {
    if (isOpen) drawCrop();
  }, [zoom, isOpen, drawCrop]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    stateRef.current.startX = e.clientX - stateRef.current.offsetX;
    stateRef.current.startY = e.clientY - stateRef.current.offsetY;
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    stateRef.current.startX = touch.clientX - stateRef.current.offsetX;
    stateRef.current.startY = touch.clientY - stateRef.current.offsetY;
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      e.preventDefault();
      stateRef.current.offsetX = e.clientX - stateRef.current.startX;
      stateRef.current.offsetY = e.clientY - stateRef.current.startY;
      drawCrop();
    },
    [isDragging, drawCrop],
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      stateRef.current.offsetX = touch.clientX - stateRef.current.startX;
      stateRef.current.offsetY = touch.clientY - stateRef.current.startY;
      drawCrop();
    },
    [isDragging, drawCrop],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleTouchEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    isDragging,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
  ]);

  const handleApply = () => {
    const canvas = canvasRef.current;
    if (!canvas || !stateRef.current.image) return;
    const { image, offsetX, offsetY } = stateRef.current;
    const cw = canvas.width,
      ch = canvas.height;
    const outW = type === "cover" ? 1400 : 500;
    const outH = type === "cover" ? 700 : 500;
    const scaleX = outW / cw,
      scaleY = outH / ch;
    const offscreen = document.createElement("canvas");
    offscreen.width = outW;
    offscreen.height = outH;
    const octx = offscreen.getContext("2d");
    const baseScale = Math.max(cw / image.width, ch / image.height);
    const totalScale = baseScale * zoom;
    const drawW = image.width * totalScale,
      drawH = image.height * totalScale;
    const minX = cw - drawW,
      minY = ch - drawH;
    const clampedX = Math.min(0, Math.max(offsetX, minX));
    const clampedY = Math.min(0, Math.max(offsetY, minY));
    if (type === "avatar") {
      octx.beginPath();
      octx.arc(outW / 2, outH / 2, Math.min(outW, outH) / 2, 0, Math.PI * 2);
      octx.clip();
    }
    octx.drawImage(
      image,
      clampedX * scaleX,
      clampedY * scaleY,
      drawW * scaleX,
      drawH * scaleY,
    );
    onApply(offscreen.toDataURL("image/png", 1.0));
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div
      className="crop-modal-overlay active"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="crop-modal">
        <div className="crop-modal-header">
          <h3>
            {type === "avatar" ? "Crop Profile Photo" : "Crop Cover Photo"}
          </h3>
          <i className="bx bx-x" onClick={onClose} />
        </div>
        <div className="crop-area-wrapper">
          <div
            className="crop-canvas-container"
            ref={containerRef}
            style={{ aspectRatio: type === "avatar" ? "1" : "2/1" }}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              style={{
                width: "100%",
                height: "100%",
                cursor: isDragging ? "grabbing" : "grab",
                touchAction: "none",
              }}
            />
          </div>
          <div
            style={{
              textAlign: "center",
              color: "#888",
              fontSize: "12px",
              marginTop: "8px",
            }}
          >
            Drag to move • Use slider to zoom
          </div>
          <div className="crop-controls">
            <label>Zoom</label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="save-btn" onClick={handleApply}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════ */
function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="toast-notification active">
      <i className="bx bx-check-circle" />
      <span>{message}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SOCIAL MODAL
═══════════════════════════════════════════════════════════ */
function SocialModal({ isOpen, type, value, onClose, onSave }) {
  const [val, setVal] = useState(value || "");
  useEffect(() => {
    setVal(value || "");
  }, [value, isOpen]);
  if (!isOpen) return null;
  const labels = {
    instagram: "Instagram URL",
    linkedin: "LinkedIn URL",
    github: "GitHub URL",
    email: "Email Address",
  };
  const placeholders = {
    instagram: "https://instagram.com/yourhandle",
    linkedin: "https://linkedin.com/in/yourname",
    github: "https://github.com/yourname",
    email: "yourname@example.com",
  };
  return (
    <div
      className="social-modal-overlay active"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="social-modal">
        <div className="social-modal-header">
          <h3>Edit {type?.charAt(0).toUpperCase() + type?.slice(1)}</h3>
          <i className="bx bx-x close-social-modal" onClick={onClose} />
        </div>
        <div className="form-group">
          <label>{labels[type]}</label>
          <input
            type="text"
            value={val}
            placeholder={placeholders[type]}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSave(val);
            }}
          />
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="save-btn" onClick={() => onSave(val)}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   EDIT PROFILE MODAL
═══════════════════════════════════════════════════════════ */
function EditProfileModal({ isOpen, onClose, profile, onSave }) {
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  useEffect(() => {
    setName(profile.name);
    setUsername(profile.username);
    setBio(profile.bio);
  }, [profile, isOpen]);
  if (!isOpen) return null;
  return (
    <div
      className="edit-modal active"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="edit-modal-content">
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <i
            className="bx bx-x"
            onClick={onClose}
            style={{ fontSize: 28, cursor: "pointer" }}
          />
        </div>
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="@username"
          />
        </div>
        <div className="form-group">
          <label>Bio</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself..."
          />
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="save-btn"
            onClick={() => onSave({ name, username, bio })}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SHARE MODAL
═══════════════════════════════════════════════════════════ */
function ShareModal({ isOpen, onClose, onToast, profile }) {
  if (!isOpen) return null;
  const profileUrl = `https://stuvo.app/profile/${profile.username.replace("@", "")}`;
  const message = `Check out ${profile.name}'s profile on STUVO!`;
  const handleShare = (type) => {
    switch (type) {
      case "copy":
        navigator.clipboard.writeText(profileUrl);
        onToast("Profile link copied!");
        onClose();
        break;
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(message + " " + profileUrl)}`,
          "_blank",
        );
        onClose();
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`,
          "_blank",
        );
        onClose();
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(profileUrl)}`,
          "_blank",
        );
        onClose();
        break;
      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`,
          "_blank",
        );
        onClose();
        break;
      case "email":
        window.location.href = `mailto:?subject=${encodeURIComponent("Check out this STUVO profile")}&body=${encodeURIComponent(message + "\n\n" + profileUrl)}`;
        onClose();
        break;
      default:
        break;
    }
  };
  const options = [
    {
      type: "copy",
      label: "Copy Link",
      bg: "linear-gradient(135deg,#667eea,#764ba2)",
      icon: <i className="bx bx-link" />,
    },
    {
      type: "whatsapp",
      label: "WhatsApp",
      bg: "#25D366",
      icon: <i className="bx bxl-whatsapp" />,
    },
    {
      type: "facebook",
      label: "Facebook",
      bg: "#1877F2",
      icon: <i className="bx bxl-facebook" />,
    },
    {
      type: "twitter",
      label: "X",
      bg: "#000",
      icon: (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      type: "linkedin",
      label: "LinkedIn",
      bg: "#0A66C2",
      icon: <i className="bx bxl-linkedin" />,
    },
    {
      type: "email",
      label: "Gmail",
      bg: "#fff",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          width="36"
          height="36"
        >
          <path
            fill="#4caf50"
            d="M45 16.2l-5 2.75-5 4.75L35 40h7c1.657 0 3-1.343 3-3V16.2z"
          />
          <path
            fill="#1e88e5"
            d="M3 16.2l3.614 1.71L13 23.7V40H6c-1.657 0-3-1.343-3-3V16.2z"
          />
          <polygon
            fill="#e53935"
            points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17"
          />
          <path
            fill="#c62828"
            d="M3 12.298V16.2l10 7.5V11.2L9.876 8.859C9.132 8.301 8.228 8 7.298 8 4.924 8 3 9.924 3 12.298z"
          />
          <path
            fill="#fbc02d"
            d="M45 12.298V16.2l-10 7.5V11.2l3.124-2.341C38.868 8.301 39.772 8 40.702 8 43.076 8 45 9.924 45 12.298z"
          />
        </svg>
      ),
    },
  ];
  return (
    <div
      className="share-modal-overlay active"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="share-modal">
        <div className="share-modal-header">
          <h3>Share Profile</h3>
          <i className="bx bx-x close-share-modal" onClick={onClose} />
        </div>
        <div className="share-options">
          {options.map((o) => (
            <div
              className="share-option"
              key={o.type}
              onClick={() => handleShare(o.type)}
            >
              <div
                className="share-icon"
                style={{
                  background: o.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {o.icon}
              </div>
              <span>{o.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   BLOCK MODAL
═══════════════════════════════════════════════════════════ */
function BlockModal({ isOpen, onClose, onConfirm, name }) {
  if (!isOpen) return null;
  return (
    <div
      className="action-modal-overlay active"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="action-modal">
        <div className="action-modal-icon block-icon">
          <i className="bx bx-block" />
        </div>
        <h3>Block {name}?</h3>
        <p>
          They won't be able to see your profile, posts, or send you messages.
          You can unblock them anytime.
        </p>
        <div className="action-modal-buttons">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="danger-btn" onClick={onConfirm}>
            Block User
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   REPORT MODAL
═══════════════════════════════════════════════════════════ */
function ReportModal({ isOpen, onClose, onSubmit, name }) {
  const [selectedReason, setSelectedReason] = useState(null);
  const [otherText, setOtherText] = useState("");
  useEffect(() => {
    if (!isOpen) {
      setSelectedReason(null);
      setOtherText("");
    }
  }, [isOpen]);
  if (!isOpen) return null;
  const reasons = [
    { key: "fake", icon: "bx-user-x", label: "Fake Profile" },
    {
      key: "inappropriate",
      icon: "bx-error-circle",
      label: "Inappropriate Content",
    },
    { key: "harassment", icon: "bx-angry", label: "Harassment or Bullying" },
    { key: "spam", icon: "bx-message-error", label: "Spam" },
    { key: "other", icon: "bx-question-mark", label: "Other" },
  ];
  const canSubmit =
    selectedReason &&
    (selectedReason !== "other" || otherText.trim().length > 0);
  return (
    <div
      className="action-modal-overlay active"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="action-modal">
        <div className="action-modal-icon report-icon">
          <i className="bx bx-flag" />
        </div>
        <h3>Report Profile</h3>
        <p>Why are you reporting this profile?</p>
        <div className="report-reasons">
          {reasons.map((r) => (
            <div
              key={r.key}
              className={`report-reason${selectedReason === r.key ? " selected" : ""}`}
              onClick={() => setSelectedReason(r.key)}
            >
              <i className={`bx ${r.icon}`} />
              <span>{r.label}</span>
            </div>
          ))}
        </div>
        {selectedReason === "other" && (
          <div className="report-other-input">
            <textarea
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              placeholder="Please describe the issue..."
              rows={3}
            />
          </div>
        )}
        <div className="action-modal-buttons">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="danger-btn"
            disabled={!canSubmit}
            onClick={onSubmit}
            style={{
              background: canSubmit ? "" : "#3a3a3a",
              color: canSubmit ? "" : "#666",
              cursor: canSubmit ? "pointer" : "not-allowed",
            }}
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PHOTO VIEWER
═══════════════════════════════════════════════════════════ */
function PhotoViewer({ isOpen, onClose, avatarUrl, initials }) {
  if (!isOpen) return null;
  return (
    <div
      className="photo-viewer-overlay active"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="photo-viewer-close" onClick={onClose}>
        <i className="bx bx-x" />
      </div>
      <div className="photo-viewer-content">
        {avatarUrl ? (
          <img
            id="photoViewerImg"
            src={avatarUrl}
            alt="Profile"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "50%",
              border: "3px solid rgba(255,255,255,0.15)",
            }}
          />
        ) : (
          <div
            id="photoViewerAvatar"
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 100,
              fontWeight: "bold",
              color: "white",
              border: "3px solid rgba(255,255,255,0.15)",
            }}
          >
            {initials}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FRIEND REQUEST POPUP
═══════════════════════════════════════════════════════════ */
function FriendRequestPopup({ isOpen, name, initials, onAccept, onDecline }) {
  if (!isOpen) return null;
  return (
    <div
      className="friend-request-popup"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <div
        className="friend-req-top"
        style={{ display: "flex", alignItems: "center", gap: 12 }}
      >
        <div className="friend-req-avatar">{initials}</div>
        <div className="friend-req-info">
          <strong>{name}</strong>
          <p>sent you a friend request</p>
        </div>
      </div>
      <div className="friend-req-actions">
        <button className="friend-req-accept" onClick={onAccept}>
          ✓ Accept
        </button>
        <button className="friend-req-decline" onClick={onDecline}>
          ✗ Decline
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MORE DROPDOWN - POSITIONED NEAR 3-DOT BUTTON
═══════════════════════════════════════════════════════════ */
function MoreDropdown({ isOpen, onBlock, onReport, buttonRef }) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 160;
      const dropdownHeight = 90;
      const spaceBelow = window.innerHeight - rect.bottom;
      let top = rect.bottom + 8;
      if (spaceBelow < dropdownHeight + 100)
        top = rect.top - dropdownHeight - 8;
      let left = rect.right - dropdownWidth;
      if (left < 10) left = 10;
      setPosition({ top, left });
    }
  }, [isOpen, buttonRef]);
  if (!isOpen) return null;
  return (
    <>
      <div
        style={{ position: "fixed", inset: 0, zIndex: 999 }}
        onClick={() => {}}
      />
      <div
        className="more-dropdown active"
        style={{
          position: "fixed",
          top: position.top,
          left: position.left,
          zIndex: 1000,
          width: "160px",
        }}
      >
        <div className="more-dropdown-item block-item" onClick={onBlock}>
          <i className="bx bx-block" />
          <span>Block User</span>
        </div>
        <div className="more-dropdown-item report-item" onClick={onReport}>
          <i className="bx bx-flag" />
          <span>Report User</span>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   BLOCKED CARD
═══════════════════════════════════════════════════════════ */
function BlockedCard({ onUnblock }) {
  return (
    <div
      className="blocked-card"
      style={{
        background: "#111",
        border: "1px solid #1e1e1e",
        borderRadius: "16px",
        padding: "24px 20px",
        margin: "0 20px 20px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "48px", color: "#666", marginBottom: "16px" }}>
        <i className="bx bx-block" />
      </div>
      <h3
        style={{
          color: "#fff",
          marginBottom: "8px",
          fontSize: "16px",
          fontWeight: 600,
        }}
      >
        You've blocked this account
      </h3>
      <p
        style={{
          color: "#888",
          fontSize: "13px",
          marginBottom: "16px",
          lineHeight: 1.5,
        }}
      >
        You can't see their social links or send messages until you unblock
        them.
      </p>
      <button
        onClick={onUnblock}
        style={{
          padding: "10px 24px",
          background: "#a78bfa",
          border: "none",
          borderRadius: "20px",
          color: "#000",
          fontWeight: 600,
          fontSize: "14px",
          cursor: "pointer",
        }}
      >
        Unblock
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PROFILE COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: "Prabhat Behera",
    username: "@Prabhat4a",
    bio: "Computer Science Student | Tech Enthusiast | Coffee Lover ☕",
  });
  const [coverUrl, setCoverUrl] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [socialValues, setSocialValues] = useState({
    instagram: "",
    linkedin: "",
    github: "",
    email: "",
  });
  const [cropModal, setCropModal] = useState({
    open: false,
    type: null,
    imageUrl: null,
  });
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [socialModal, setSocialModal] = useState({ open: false, type: null });
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [viewingOwnProfile, setViewingOwnProfile] = useState(true);
  const [isFriends, setIsFriends] = useState(false);
  const [requestPending, setRequestPending] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [hasReported, setHasReported] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [friendRequestPopupOpen, setFriendRequestPopupOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const coverFileRef = useRef(null);
  const avatarFileRef = useRef(null);
  const moreButtonRef = useRef(null);
  const toastKey = useRef(0);

  /* Show skeleton for 1.5s — replace with real API call when backend is ready */
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const blockedUsers = JSON.parse(
      localStorage.getItem("blockedUsers") || "[]",
    );
    if (blockedUsers.includes(profile.username)) setIsBlocked(true);
  }, [profile.username]);

  const showToast = (msg) => {
    toastKey.current++;
    setToast({ msg, key: toastKey.current });
  };

  const saveBlockedState = (blocked) => {
    const blockedUsers = JSON.parse(
      localStorage.getItem("blockedUsers") || "[]",
    );
    if (blocked) {
      if (!blockedUsers.includes(profile.username))
        blockedUsers.push(profile.username);
    } else {
      const i = blockedUsers.indexOf(profile.username);
      if (i > -1) blockedUsers.splice(i, 1);
    }
    localStorage.setItem("blockedUsers", JSON.stringify(blockedUsers));
  };

  useEffect(() => {
    if (!moreDropdownOpen) return;
    const handler = (e) => {
      if (!moreButtonRef.current?.contains(e.target))
        setMoreDropdownOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [moreDropdownOpen]);

  useEffect(() => {
    if (!viewingOwnProfile) {
      const t = setTimeout(() => {
        if (requestPending) setFriendRequestPopupOpen(true);
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [requestPending, viewingOwnProfile]);

  const handleFileRead = (file, type) => {
    const r = new FileReader();
    r.onload = (e) =>
      setCropModal({ open: true, type, imageUrl: e.target.result });
    r.readAsDataURL(file);
  };
  const handleCoverFile = (e) => {
    if (e.target.files[0]) handleFileRead(e.target.files[0], "cover");
    e.target.value = "";
  };
  const handleAvatarFile = (e) => {
    if (e.target.files[0]) handleFileRead(e.target.files[0], "avatar");
    e.target.value = "";
  };
  const handleCropApply = (dataUrl) => {
    if (cropModal.type === "cover") setCoverUrl(dataUrl);
    else setAvatarUrl(dataUrl);
  };
  const handleSaveProfile = (data) => {
    setProfile(data);
    setEditProfileOpen(false);
    showToast("Profile updated successfully!");
  };
  const handleSaveSocial = (val) => {
    setSocialValues((prev) => ({ ...prev, [socialModal.type]: val }));
    setSocialModal({ open: false, type: null });
    showToast("Link saved!");
  };
  const handleAddFriend = () => {
    if (isFriends) {
      if (window.confirm(`Unfriend ${profile.name}?`)) {
        setIsFriends(false);
        setRequestPending(false);
        showToast("Unfriended successfully");
      }
      return;
    }
    if (requestPending) return;
    setRequestPending(true);
    showToast("Friend request sent!");
    setTimeout(() => setFriendRequestPopupOpen(true), 3000);
  };
  const handleAcceptFriend = () => {
    setIsFriends(true);
    setRequestPending(false);
    setFriendRequestPopupOpen(false);
    showToast("You are now friends!");
  };
  const handleDeclineFriend = () => {
    setIsFriends(false);
    setRequestPending(false);
    setFriendRequestPopupOpen(false);
  };
  const handleConfirmBlock = () => {
    setIsBlocked(true);
    saveBlockedState(true);
    setBlockModalOpen(false);
    setMoreDropdownOpen(false);
    showToast("User blocked");
  };
  const handleUnblock = () => {
    setIsBlocked(false);
    saveBlockedState(false);
    showToast("User unblocked");
  };
  const handleSubmitReport = () => {
    setHasReported(true);
    setReportModalOpen(false);
    showToast("Report submitted. We'll review this profile within 24 hours.");
  };

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const socialMeta = [
    {
      key: "instagram",
      label: "Instagram",
      iconClass: "bxl-instagram",
      wrapClass: "instagram",
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      iconClass: "bxl-linkedin",
      wrapClass: "linkedin",
    },
    {
      key: "github",
      label: "GitHub",
      iconClass: "bxl-github",
      wrapClass: "github",
    },
  ];

  /* Show skeleton while loading */
  if (loading) return <ProfileSkeleton />;

  return (
    <div className="profile-page">
      <input
        ref={coverFileRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleCoverFile}
      />
      <input
        ref={avatarFileRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleAvatarFile}
      />

      {/* Demo toggle */}
      <div
        style={{
          padding: "8px 16px",
          background: "#111",
          borderBottom: "1px solid #222",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <button
          onClick={() => {
            setViewingOwnProfile(!viewingOwnProfile);
            setIsFriends(false);
            setRequestPending(false);
          }}
          style={{
            padding: "5px 12px",
            background: "#a78bfa",
            border: "none",
            borderRadius: 6,
            color: "white",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          {viewingOwnProfile ? "View as Others" : "View as Me"}
        </button>
      </div>

      {/* COVER PHOTO */}
      <div className="cover-photo-section">
        <div
          className="cover-photo-container"
          onClick={() => viewingOwnProfile && coverFileRef.current.click()}
        >
          {!coverUrl && (
            <div className="cover-photo-placeholder">
              <i className="bx bx-image-add" />
              <span>Add Cover Photo</span>
            </div>
          )}
          {coverUrl && (
            <img src={coverUrl} alt="Cover" className="cover-photo-img" />
          )}
          <div className="cover-gradient-overlay" />
          {viewingOwnProfile && (
            <div className="cover-photo-overlay">
              <button
                className="cover-photo-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  coverFileRef.current.click();
                }}
              >
                <i className="bx bx-camera" />{" "}
                {coverUrl ? "Change Cover" : "Add Cover Photo"}
              </button>
            </div>
          )}
        </div>
        <div className="profile-avatar-wrapper">
          <div
            className="profile-avatar-ring"
            onClick={() => setPhotoViewerOpen(true)}
          >
            {!avatarUrl && (
              <div className="profile-avatar-inner">{initials}</div>
            )}
            {avatarUrl && (
              <img
                src={avatarUrl}
                alt="Profile"
                className="profile-avatar-photo"
              />
            )}
          </div>
          <div className="status-dot" title="Online" />
          {viewingOwnProfile && (
            <div
              className="avatar-edit-btn"
              onClick={(e) => {
                e.stopPropagation();
                avatarFileRef.current.click();
              }}
              title="Change profile photo"
            >
              <i className="bx bx-camera" />
            </div>
          )}
        </div>
      </div>

      {/* PROFILE INFO */}
      <div className="profile-header-section">
        <div className="profile-info">
          <h2 className="profile-name-main">{profile.name}</h2>
          <p className="profile-username">{profile.username}</p>
          <p className={`profile-bio${bioExpanded ? " expanded" : ""}`}>
            {profile.bio}
          </p>
          <button
            className="bio-toggle-btn"
            style={{ display: "block" }}
            onClick={() => setBioExpanded(!bioExpanded)}
          >
            {bioExpanded ? "less" : "more"}
          </button>
        </div>

        {viewingOwnProfile && (
          <div className="profile-buttons">
            <button
              className="edit-profile-btn-main"
              onClick={() => setEditProfileOpen(true)}
            >
              <i className="bx bx-edit" /> Edit Profile
            </button>
            <button
              className="share-profile-btn"
              onClick={() => setShareModalOpen(true)}
            >
              <i className="bx bx-share-alt" />
            </button>
          </div>
        )}

        {!viewingOwnProfile && (
          <div className="profile-buttons">
            <button
              className={`add-friend-btn${requestPending ? " pending" : ""}${isFriends ? " friends" : ""}`}
              onClick={handleAddFriend}
            >
              <i
                className={`bx ${isFriends ? "bx-user-minus" : requestPending ? "bx-time" : "bx-user-plus"}`}
              />
              {isFriends
                ? "Unfriend"
                : requestPending
                  ? "Pending..."
                  : "Add Friend"}
            </button>
            <button
              className="message-btn"
              disabled={!isFriends}
              style={{
                opacity: isFriends ? 1 : 0.5,
                cursor: isFriends ? "pointer" : "not-allowed",
              }}
              onClick={() =>
                !isFriends
                  ? showToast(
                      "Send a friend request first to message this person",
                    )
                  : showToast("Chat coming soon!")
              }
            >
              <i className="bx bx-message-rounded" /> Message
            </button>
            <button
              ref={moreButtonRef}
              className="more-btn"
              onClick={(e) => {
                e.stopPropagation();
                setMoreDropdownOpen(!moreDropdownOpen);
              }}
            >
              <i className="bx bx-dots-horizontal-rounded" />
            </button>
          </div>
        )}
      </div>

      {/* SOCIAL LINKS */}
      {!viewingOwnProfile && isBlocked ? (
        <BlockedCard onUnblock={handleUnblock} />
      ) : (
        <div className="info-section">
          <h3 className="section-title">Connect With Me</h3>
          <div className="social-links-card">
            {socialMeta.map(({ key, label, iconClass, wrapClass }) => (
              <div className="social-link-item" key={key}>
                <div className={`social-icon-wrap ${wrapClass}`}>
                  <i className={`bx ${iconClass}`} />
                </div>
                <div className="social-link-info">
                  <span className="social-label">{label}</span>
                  <span
                    className={`social-value${!socialValues[key] ? " not-linked" : ""}`}
                  >
                    {socialValues[key] || "Not linked"}
                  </span>
                </div>
                {viewingOwnProfile && (
                  <button
                    className="social-edit-btn"
                    onClick={() => setSocialModal({ open: true, type: key })}
                  >
                    <i className="bx bx-pencil" />
                  </button>
                )}
                {socialValues[key] && (
                  <a
                    className="social-go-btn"
                    href={socialValues[key]}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <i className="bx bx-link-external" />
                  </a>
                )}
              </div>
            ))}
            <div className="social-link-item">
              <div
                className="social-icon-wrap"
                style={{ background: "#fff", padding: "6px" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  width="32"
                  height="32"
                >
                  <path
                    fill="#4caf50"
                    d="M45 16.2l-5 2.75-5 4.75L35 40h7c1.657 0 3-1.343 3-3V16.2z"
                  />
                  <path
                    fill="#1e88e5"
                    d="M3 16.2l3.614 1.71L13 23.7V40H6c-1.657 0-3-1.343-3-3V16.2z"
                  />
                  <polygon
                    fill="#e53935"
                    points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17"
                  />
                  <path
                    fill="#c62828"
                    d="M3 12.298V16.2l10 7.5V11.2L9.876 8.859C9.132 8.301 8.228 8 7.298 8 4.924 8 3 9.924 3 12.298z"
                  />
                  <path
                    fill="#fbc02d"
                    d="M45 12.298V16.2l-10 7.5V11.2l3.124-2.341C38.868 8.301 39.772 8 40.702 8 43.076 8 45 9.924 45 12.298z"
                  />
                </svg>
              </div>
              <div className="social-link-info">
                <span className="social-label">Email</span>
                <span
                  className={`social-value${!socialValues.email ? " not-linked" : ""}`}
                >
                  {socialValues.email || "Not linked"}
                </span>
              </div>
              {viewingOwnProfile && (
                <button
                  className="social-edit-btn"
                  onClick={() => setSocialModal({ open: true, type: "email" })}
                >
                  <i className="bx bx-pencil" />
                </button>
              )}
              {socialValues.email && (
                <a
                  className="social-go-btn"
                  href={`mailto:${socialValues.email}`}
                >
                  <i className="bx bx-link-external" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <MoreDropdown
        isOpen={moreDropdownOpen}
        onBlock={() => {
          setMoreDropdownOpen(false);
          setBlockModalOpen(true);
        }}
        onReport={() => {
          if (hasReported) {
            showToast("You have already reported this profile");
            setMoreDropdownOpen(false);
            return;
          }
          setMoreDropdownOpen(false);
          setReportModalOpen(true);
        }}
        buttonRef={moreButtonRef}
      />
      <FriendRequestPopup
        isOpen={friendRequestPopupOpen}
        name={profile.name}
        initials={initials}
        onAccept={handleAcceptFriend}
        onDecline={handleDeclineFriend}
      />

      <CropModal
        isOpen={cropModal.open}
        type={cropModal.type}
        imageUrl={cropModal.imageUrl}
        onClose={() =>
          setCropModal({ open: false, type: null, imageUrl: null })
        }
        onApply={handleCropApply}
      />
      <EditProfileModal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />
      <SocialModal
        isOpen={socialModal.open}
        type={socialModal.type}
        value={socialValues[socialModal.type]}
        onClose={() => setSocialModal({ open: false, type: null })}
        onSave={handleSaveSocial}
      />
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        onToast={showToast}
        profile={profile}
      />
      <BlockModal
        isOpen={blockModalOpen}
        onClose={() => setBlockModalOpen(false)}
        onConfirm={handleConfirmBlock}
        name={profile.name}
      />
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onSubmit={handleSubmitReport}
        name={profile.name}
      />
      <PhotoViewer
        isOpen={photoViewerOpen}
        onClose={() => setPhotoViewerOpen(false)}
        avatarUrl={avatarUrl}
        initials={initials}
      />

      {toast && (
        <Toast
          key={toast.key}
          message={toast.msg}
          onDone={() => setToast(null)}
        />
      )}
    </div>
  );
}
