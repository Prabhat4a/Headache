import { useState, useEffect, useRef, useCallback } from "react";
import "../styles/FacultyProfile.css";

const G = {
  bg: "#070d09",
  surface: "#0d1510",
  card: "#111a13",
  border: "#1a2b1d",
  borderLight: "#223326",
  emerald: "#10b981",
  emeraldLight: "#34d399",
  emeraldDim: "#0d7a56",
  emeraldGlow: "rgba(16,185,129,0.15)",
  emeraldGlow2: "rgba(16,185,129,0.07)",
  text: "#e4ede6",
  textMuted: "#7a9e82",
  textDim: "#2e4433",
  danger: "#ef4444",
  success: "#10b981",
  warn: "#f59e0b",
};

const Sk = ({ w, h, r = 8, style = {} }) => (
  <div
    className="fp-skeleton"
    style={{ width: w, height: h, borderRadius: r, ...style }}
  />
);

const btn = (v) => {
  const base = {
    flex: 1,
    padding: "11px 18px",
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    border: "none",
    fontFamily: "inherit",
    transition: "all 0.18s",
  };
  if (v === "green")
    return {
      ...base,
      background: `linear-gradient(135deg,${G.emerald},${G.emeraldLight})`,
      color: "#060d08",
    };
  if (v === "cancel")
    return {
      ...base,
      background: G.surface,
      border: `1px solid ${G.borderLight}`,
      color: G.textMuted,
    };
  if (v === "danger") return { ...base, background: G.danger, color: "#fff" };
  return base;
};

/* ══ SKELETON ══ */
function Skeleton() {
  return (
    <div
      className="fp-root"
      style={{ paddingBottom: 40, background: G.bg, minHeight: "100vh" }}
    >
      <Sk w="100%" h={240} r={0} />
      <div
        style={{
          position: "relative",
          marginTop: -58,
          paddingLeft: 22,
          marginBottom: 68,
        }}
      >
        <Sk w={112} h={112} r="50%" style={{ border: `4px solid ${G.bg}` }} />
      </div>
      <div
        style={{
          padding: "0 22px 20px",
          borderBottom: `1px solid ${G.border}`,
        }}
      >
        <Sk w="48%" h={24} style={{ marginBottom: 10 }} />
        <Sk w="26%" h={14} style={{ marginBottom: 8 }} />
        <Sk w="36%" h={14} style={{ marginBottom: 16 }} />
        <Sk w="88%" h={12} style={{ marginBottom: 8 }} />
        <Sk w="62%" h={12} style={{ marginBottom: 20 }} />
        <div style={{ display: "flex", gap: 10 }}>
          <Sk w="100%" h={40} r={10} style={{ flex: 1 }} />
          <Sk w={44} h={40} r={10} />
        </div>
      </div>
      <div style={{ padding: 22 }}>
        <Sk w={180} h={12} style={{ marginBottom: 18 }} />
        <div
          style={{
            background: G.card,
            borderRadius: 16,
            border: `1px solid ${G.border}`,
            overflow: "hidden",
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "15px 18px",
                borderBottom: i < 3 ? `1px solid ${G.border}` : "none",
              }}
            >
              <Sk w={44} h={44} r={12} />
              <div style={{ flex: 1 }}>
                <Sk w="34%" h={10} style={{ marginBottom: 8 }} />
                <Sk w="58%" h={12} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══ CROP MODAL ══ */
function CropModal({ isOpen, onClose, onApply, imageUrl, type }) {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const s = useRef({
    offsetX: 0,
    offsetY: 0,
    startX: 0,
    startY: 0,
    image: null,
  });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !s.current.image) return;
    const ctx = canvas.getContext("2d");
    const { image, offsetX, offsetY } = s.current;
    const cw = canvas.width,
      ch = canvas.height;
    const base = Math.max(cw / image.width, ch / image.height);
    const total = base * zoom;
    const dw = image.width * total,
      dh = image.height * total;
    const cx = Math.min(0, Math.max(offsetX, cw - dw));
    const cy = Math.min(0, Math.max(offsetY, ch - dh));
    s.current.offsetX = cx;
    s.current.offsetY = cy;
    ctx.clearRect(0, 0, cw, ch);
    if (type === "avatar") {
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.drawImage(image, cx, cy, dw, dh);
      ctx.restore();
      const r = Math.min(cw, ch) * 0.44;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cw / 2, ch / 2, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(image, cx, cy, dw, dh);
      ctx.restore();
      ctx.save();
      ctx.beginPath();
      ctx.arc(cw / 2, ch / 2, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(52,211,153,0.8)`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.drawImage(image, cx, cy, dw, dh);
      ctx.save();
      ctx.strokeStyle = `rgba(52,211,153,0.5)`;
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, cw - 2, ch - 2);
      ctx.restore();
    }
  }, [zoom, type]);

  useEffect(() => {
    if (!isOpen || !imageUrl || !canvasRef.current) return;
    const img = new Image();
    img.onload = () => {
      s.current.image = img;
      s.current.offsetX = 0;
      s.current.offsetY = 0;
      const rect = canvasRef.current.parentElement.getBoundingClientRect();
      canvasRef.current.width = rect.width;
      canvasRef.current.height = rect.height;
      draw();
    };
    img.src = imageUrl;
  }, [isOpen, imageUrl, draw]);

  useEffect(() => {
    if (isOpen) draw();
  }, [zoom, isOpen, draw]);

  const mdown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    s.current.startX = e.clientX - s.current.offsetX;
    s.current.startY = e.clientY - s.current.offsetY;
  };
  const tstart = (e) => {
    const t = e.touches[0];
    setIsDragging(true);
    s.current.startX = t.clientX - s.current.offsetX;
    s.current.startY = t.clientY - s.current.offsetY;
  };
  const mmove = useCallback(
    (e) => {
      if (!isDragging) return;
      e.preventDefault();
      s.current.offsetX = e.clientX - s.current.startX;
      s.current.offsetY = e.clientY - s.current.startY;
      draw();
    },
    [isDragging, draw],
  );
  const tmove = useCallback(
    (e) => {
      if (!isDragging) return;
      const t = e.touches[0];
      s.current.offsetX = t.clientX - s.current.startX;
      s.current.offsetY = t.clientY - s.current.startY;
      draw();
    },
    [isDragging, draw],
  );
  const mup = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", mmove);
      window.addEventListener("mouseup", mup);
      window.addEventListener("touchmove", tmove);
      window.addEventListener("touchend", mup);
    }
    return () => {
      window.removeEventListener("mousemove", mmove);
      window.removeEventListener("mouseup", mup);
      window.removeEventListener("touchmove", tmove);
      window.removeEventListener("touchend", mup);
    };
  }, [isDragging, mmove, mup, tmove]);

  const apply = () => {
    const canvas = canvasRef.current;
    if (!canvas || !s.current.image) return;
    const { image, offsetX, offsetY } = s.current;
    const cw = canvas.width,
      ch = canvas.height;
    const outW = type === "cover" ? 1400 : 500,
      outH = type === "cover" ? 700 : 500;
    const sx = outW / cw,
      sy = outH / ch;
    const off = document.createElement("canvas");
    off.width = outW;
    off.height = outH;
    const octx = off.getContext("2d");
    const base = Math.max(cw / image.width, ch / image.height);
    const total = base * zoom;
    const dw = image.width * total,
      dh = image.height * total;
    const cx = Math.min(0, Math.max(offsetX, cw - dw));
    const cy = Math.min(0, Math.max(offsetY, ch - dh));
    if (type === "avatar") {
      octx.beginPath();
      octx.arc(outW / 2, outH / 2, Math.min(outW, outH) / 2, 0, Math.PI * 2);
      octx.clip();
    }
    octx.drawImage(image, cx * sx, cy * sy, dw * sx, dh * sy);
    onApply(off.toDataURL("image/png", 1.0));
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div
      className="fp-overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.94)",
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(10px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="fp-modal-panel"
        style={{
          background: G.card,
          padding: 22,
          borderRadius: 20,
          width: "92%",
          maxWidth: 480,
          border: `1px solid ${G.borderLight}`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            paddingBottom: 14,
            borderBottom: `1px solid ${G.border}`,
          }}
        >
          <span style={{ fontSize: 17, fontWeight: 700, color: G.text }}>
            {type === "avatar" ? "Crop Profile Photo" : "Crop Banner"}
          </span>
          <span
            style={{ fontSize: 24, cursor: "pointer", color: G.textMuted }}
            onClick={onClose}
          >
            ✕
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 380,
              aspectRatio: type === "avatar" ? "1" : "2/1",
              overflow: "hidden",
              borderRadius: 12,
              background: "#050906",
              touchAction: "none",
            }}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={mdown}
              onTouchStart={tstart}
              style={{
                width: "100%",
                height: "100%",
                cursor: isDragging ? "grabbing" : "grab",
                touchAction: "none",
              }}
            />
          </div>
          <div style={{ color: G.textMuted, fontSize: 11 }}>
            Drag to reposition · Zoom to fit
          </div>
          <div
            style={{
              width: "100%",
              maxWidth: 380,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 12, color: G.textMuted, flexShrink: 0 }}>
              Zoom
            </span>
            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              style={{ flex: 1 }}
            />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 20,
            paddingTop: 18,
            borderTop: `1px solid ${G.border}`,
          }}
        >
          <button onClick={onClose} style={btn("cancel")}>
            Cancel
          </button>
          <button onClick={apply} style={btn("green")}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══ TOAST ══ */
function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      className="fp-toast"
      style={{
        position: "fixed",
        bottom: 90,
        left: "50%",
        transform: "translateX(-50%)",
        background: G.card,
        border: `1px solid ${G.emerald}`,
        padding: "11px 22px",
        borderRadius: 30,
        display: "flex",
        alignItems: "center",
        gap: 10,
        color: G.text,
        zIndex: 1200,
        whiteSpace: "nowrap",
        boxShadow: `0 4px 24px ${G.emeraldGlow}`,
      }}
    >
      <span style={{ color: G.emerald, fontSize: 17 }}>✓</span>
      <span style={{ fontSize: 14, fontWeight: 500 }}>{message}</span>
    </div>
  );
}

/* ══ SOCIAL MODAL ══ */
function SocialModal({ isOpen, type, value, onClose, onSave }) {
  const [val, setVal] = useState(value || "");
  useEffect(() => {
    setVal(value || "");
  }, [value, isOpen]);
  if (!isOpen) return null;
  const meta = {
    instagram: {
      label: "Instagram URL",
      ph: "https://instagram.com/yourhandle",
    },
    linkedin: { label: "LinkedIn URL", ph: "https://linkedin.com/in/yourname" },
    email: { label: "Email Address", ph: "prof@university.edu" },
    github: { label: "GitHub URL", ph: "https://github.com/yourname" },
  };
  const { label, ph } = meta[type] || { label: "URL", ph: "" };
  return (
    <div
      className="fp-overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.88)",
        zIndex: 1060,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(8px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="fp-modal-panel"
        style={{
          background: G.card,
          padding: 26,
          borderRadius: 20,
          width: "90%",
          maxWidth: 420,
          border: `1px solid ${G.borderLight}`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            paddingBottom: 14,
            borderBottom: `1px solid ${G.border}`,
          }}
        >
          <span style={{ fontSize: 17, fontWeight: 700, color: G.text }}>
            Edit {type?.charAt(0).toUpperCase() + type?.slice(1)}
          </span>
          <span
            style={{ fontSize: 24, cursor: "pointer", color: G.textMuted }}
            onClick={onClose}
          >
            ✕
          </span>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              marginBottom: 8,
              color: G.textMuted,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {label}
          </label>
          <input
            type="text"
            value={val}
            placeholder={ph}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSave(val);
            }}
            style={{
              width: "100%",
              padding: "12px 14px",
              background: G.surface,
              border: `1px solid ${G.borderLight}`,
              borderRadius: 10,
              fontSize: 14,
              outline: "none",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onClose} style={btn("cancel")}>
            Cancel
          </button>
          <button onClick={() => onSave(val)} style={btn("green")}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══ EDIT PROFILE MODAL ══ */
function EditProfileModal({ isOpen, onClose, profile, onSave }) {
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [department, setDepartment] = useState(profile.department || "");
  const [joinYear, setJoinYear] = useState(profile.joinYear || "");
  const [designation, setDesignation] = useState(profile.designation || "");
  const [specialization, setSpecialization] = useState(
    profile.specialization || "",
  );

  useEffect(() => {
    setName(profile.name);
    setUsername(profile.username);
    setBio(profile.bio);
    setDepartment(profile.department || "");
    setJoinYear(profile.joinYear || "");
    setDesignation(profile.designation || "");
    setSpecialization(profile.specialization || "");
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const DESIGS = [
    "Professor",
    "Associate Professor",
    "Assistant Professor",
    "Lecturer",
    "Senior Lecturer",
    "Reader",
    "Visiting Faculty",
    "Adjunct Professor",
    "Professor Emeritus",
  ];
  const YEARS = Array.from({ length: 40 }, (_, i) =>
    String(new Date().getFullYear() - i),
  );

  const inp = {
    width: "100%",
    padding: "11px 14px",
    background: G.surface,
    border: `1px solid ${G.borderLight}`,
    borderRadius: 10,
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };
  const lbl = {
    display: "block",
    marginBottom: 7,
    color: G.textMuted,
    fontSize: 13,
    fontWeight: 600,
  };

  return (
    <div
      className="fp-overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.9)",
        zIndex: 1050,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(8px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="fp-modal-panel"
        style={{
          background: G.card,
          padding: 26,
          borderRadius: 22,
          width: "90%",
          maxWidth: 500,
          maxHeight: "88vh",
          overflowY: "auto",
          border: `1px solid ${G.borderLight}`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 22,
            paddingBottom: 16,
            borderBottom: `1px solid ${G.border}`,
          }}
        >
          <span style={{ fontSize: 19, fontWeight: 800, color: G.text }}>
            Edit Faculty Profile
          </span>
          <span
            style={{ fontSize: 26, cursor: "pointer", color: G.textMuted }}
            onClick={onClose}
          >
            ✕
          </span>
        </div>
        {[
          {
            label: "Full Name",
            val: name,
            set: setName,
            ph: "Prof. Dr. Full Name",
          },
          {
            label: "Username",
            val: username,
            set: setUsername,
            ph: "@username",
          },
          {
            label: "Department / School",
            val: department,
            set: setDepartment,
            ph: "e.g. Computer Science, MBA…",
          },
          {
            label: "Subject Specialization",
            val: specialization,
            set: setSpecialization,
            ph: "e.g. Machine Learning, Data Systems…",
          },
        ].map(({ label, val, set, ph }) => (
          <div key={label} style={{ marginBottom: 16 }}>
            <label style={lbl}>{label}</label>
            <input
              type="text"
              value={val}
              onChange={(e) => set(e.target.value)}
              placeholder={ph}
              style={inp}
            />
          </div>
        ))}
        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>Designation</label>
          <select
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            style={{ ...inp, cursor: "pointer" }}
          >
            <option value="" disabled>
              Select designation
            </option>
            {DESIGS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>Joined Since (Year)</label>
          <select
            value={joinYear}
            onChange={(e) => setJoinYear(e.target.value)}
            style={{ ...inp, cursor: "pointer" }}
          >
            <option value="" disabled>
              Select year
            </option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>Bio / About</label>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Brief academic biography, research interests…"
            style={{ ...inp, resize: "vertical" }}
          />
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 22,
            paddingTop: 16,
            borderTop: `1px solid ${G.border}`,
          }}
        >
          <button onClick={onClose} style={btn("cancel")}>
            Cancel
          </button>
          <button
            onClick={() =>
              onSave({
                name,
                username,
                bio,
                department,
                joinYear,
                designation,
                specialization,
              })
            }
            style={btn("green")}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══ SHARE MODAL ══ */
function ShareModal({ isOpen, onClose, onToast, profile }) {
  if (!isOpen) return null;
  const url = `https://stuvo.app/faculty/${profile.username.replace("@", "")}`;
  const msg = `Connect with ${profile.name} on STUVO!`;
  const go = (type) => {
    const acts = {
      copy: () => {
        navigator.clipboard.writeText(url);
        onToast("Link copied!");
      },
      whatsapp: () =>
        window.open(
          `https://wa.me/?text=${encodeURIComponent(msg + " " + url)}`,
          "_blank",
        ),
      facebook: () =>
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          "_blank",
        ),
      twitter: () =>
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(msg)}&url=${encodeURIComponent(url)}`,
          "_blank",
        ),
      linkedin: () =>
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          "_blank",
        ),
      email: () => {
        window.location.href = `mailto:?subject=${encodeURIComponent("Faculty Profile – STUVO")}&body=${encodeURIComponent(msg + "\n\n" + url)}`;
      },
    };
    acts[type]?.();
    onClose();
  };
  const opts = [
    {
      type: "copy",
      label: "Copy Link",
      bg: `linear-gradient(135deg,${G.emerald},${G.emeraldLight})`,
      tc: "#060d08",
      icon: "🔗",
    },
    {
      type: "whatsapp",
      label: "WhatsApp",
      bg: "#25D366",
      tc: "#fff",
      icon: "💬",
    },
    {
      type: "facebook",
      label: "Facebook",
      bg: "#1877F2",
      tc: "#fff",
      icon: "f",
    },
    { type: "twitter", label: "X", bg: "#000", tc: "#fff", icon: "𝕏" },
    {
      type: "linkedin",
      label: "LinkedIn",
      bg: "#0A66C2",
      tc: "#fff",
      icon: "in",
    },
    { type: "email", label: "Email", bg: "#fff", tc: "#c62828", icon: "✉" },
  ];
  return (
    <div
      className="fp-overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.88)",
        zIndex: 1070,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(8px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="fp-modal-panel"
        style={{
          background: G.card,
          padding: 26,
          borderRadius: 22,
          width: "90%",
          maxWidth: 440,
          border: `1px solid ${G.borderLight}`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <span style={{ fontSize: 18, fontWeight: 800, color: G.text }}>
            Share Profile
          </span>
          <span
            style={{ fontSize: 24, cursor: "pointer", color: G.textMuted }}
            onClick={onClose}
          >
            ✕
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 18,
          }}
        >
          {opts.map((o) => (
            <div
              key={o.type}
              className="fp-share-item"
              onClick={() => go(o.type)}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: o.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 800,
                  color: o.tc,
                  boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
                }}
              >
                {o.icon}
              </div>
              <span style={{ fontSize: 12, color: G.textMuted }}>
                {o.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══ BLOCK MODAL ══ */
function BlockModal({ isOpen, onClose, onConfirm, name }) {
  if (!isOpen) return null;
  return (
    <div
      className="fp-overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.9)",
        zIndex: 1080,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(8px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="fp-modal-panel"
        style={{
          background: G.card,
          padding: 30,
          borderRadius: 20,
          width: "90%",
          maxWidth: 360,
          border: `1px solid ${G.borderLight}`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 62,
            height: 62,
            borderRadius: "50%",
            background: "rgba(239,68,68,0.1)",
            border: "2px solid rgba(239,68,68,0.28)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: 26,
          }}
        >
          🚫
        </div>
        <div
          style={{
            fontSize: 17,
            fontWeight: 800,
            color: G.text,
            marginBottom: 9,
          }}
        >
          Block {name}?
        </div>
        <div
          style={{
            fontSize: 14,
            color: G.textMuted,
            lineHeight: 1.7,
            marginBottom: 22,
          }}
        >
          They won't be able to see your profile or send messages. You can
          unblock anytime.
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onClose} style={btn("cancel")}>
            Cancel
          </button>
          <button onClick={onConfirm} style={btn("danger")}>
            Block
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══ REPORT MODAL ══ */
function ReportModal({ isOpen, onClose, onSubmit }) {
  const [sel, setSel] = useState(null);
  const [other, setOther] = useState("");
  useEffect(() => {
    if (!isOpen) {
      setSel(null);
      setOther("");
    }
  }, [isOpen]);
  if (!isOpen) return null;
  const reasons = [
    { key: "fake", icon: "👤", label: "Fake Profile" },
    { key: "inappropriate", icon: "⚠️", label: "Inappropriate Content" },
    { key: "harassment", icon: "😠", label: "Harassment or Bullying" },
    { key: "spam", icon: "📧", label: "Spam" },
    { key: "other", icon: "❓", label: "Other" },
  ];
  const ok = sel && (sel !== "other" || other.trim().length > 0);
  return (
    <div
      className="fp-overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.9)",
        zIndex: 1080,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(8px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="fp-modal-panel"
        style={{
          background: G.card,
          padding: 28,
          borderRadius: 20,
          width: "90%",
          maxWidth: 370,
          border: `1px solid ${G.borderLight}`,
          textAlign: "center",
          maxHeight: "88vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            width: 62,
            height: 62,
            borderRadius: "50%",
            background: "rgba(245,158,11,0.1)",
            border: "2px solid rgba(245,158,11,0.28)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: 26,
          }}
        >
          🚩
        </div>
        <div
          style={{
            fontSize: 17,
            fontWeight: 800,
            color: G.text,
            marginBottom: 8,
          }}
        >
          Report Profile
        </div>
        <div style={{ fontSize: 14, color: G.textMuted, marginBottom: 18 }}>
          Why are you reporting this profile?
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 7,
            marginBottom: 18,
            textAlign: "left",
          }}
        >
          {reasons.map((r) => (
            <div
              key={r.key}
              onClick={() => setSel(r.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "11px 14px",
                borderRadius: 10,
                border: `1px solid ${sel === r.key ? G.warn : G.border}`,
                background: sel === r.key ? "rgba(245,158,11,0.07)" : G.surface,
                cursor: "pointer",
                color: G.text,
                fontSize: 14,
                transition: "all 0.18s",
              }}
            >
              <span>{r.icon}</span>
              <span>{r.label}</span>
            </div>
          ))}
        </div>
        {sel === "other" && (
          <textarea
            value={other}
            onChange={(e) => setOther(e.target.value)}
            placeholder="Describe the issue…"
            rows={3}
            style={{
              width: "100%",
              background: G.surface,
              border: `1px solid ${G.borderLight}`,
              borderRadius: 10,
              padding: "11px 14px",
              fontSize: 14,
              fontFamily: "inherit",
              resize: "none",
              outline: "none",
              boxSizing: "border-box",
              marginBottom: 14,
            }}
          />
        )}
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onClose} style={btn("cancel")}>
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!ok}
            style={{
              ...btn("danger"),
              opacity: ok ? 1 : 0.4,
              cursor: ok ? "pointer" : "not-allowed",
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══ PHOTO VIEWER ══ */
function PhotoViewer({ isOpen, onClose, avatarUrl, initials }) {
  if (!isOpen) return null;
  return (
    <div
      className="fp-photo-viewer"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.97)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          top: 18,
          right: 18,
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: 20,
          color: "#fff",
        }}
      >
        ✕
      </div>
      <div
        style={{ width: "86vw", height: "86vw", maxWidth: 400, maxHeight: 400 }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Profile"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "50%",
              border: `3px solid ${G.emerald}`,
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: `linear-gradient(135deg,#0a1f12,#071209)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 96,
              fontWeight: 800,
              color: G.emerald,
              border: `3px solid ${G.emerald}`,
            }}
          >
            {initials}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══ CONNECT POPUP ══ */
function ConnectPopup({ isOpen, name, initials, onAccept, onDecline }) {
  if (!isOpen) return null;
  return (
    <div
      className="fp-connect-popup"
      style={{
        position: "fixed",
        top: 78,
        right: 16,
        width: 294,
        background: G.card,
        border: `1px solid ${G.emerald}`,
        borderRadius: 18,
        padding: 18,
        zIndex: 1050,
        boxShadow: `0 8px 40px ${G.emeraldGlow}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: `linear-gradient(135deg,#0a1f12,#071209)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 15,
            color: G.emerald,
            border: `2px solid ${G.emeraldDim}`,
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div>
          <div style={{ fontWeight: 700, color: G.text, fontSize: 14 }}>
            {name}
          </div>
          <div style={{ fontSize: 12, color: G.textMuted }}>
            wants to connect with you
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={onAccept}
          style={{
            flex: 1,
            padding: "9px 0",
            background: `linear-gradient(135deg,${G.emerald},${G.emeraldLight})`,
            border: "none",
            borderRadius: 9,
            color: "#060d08",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          ✓ Accept
        </button>
        <button
          onClick={onDecline}
          style={{
            flex: 1,
            padding: "9px 0",
            background: G.surface,
            border: `1px solid ${G.borderLight}`,
            borderRadius: 9,
            color: G.textMuted,
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          ✗ Decline
        </button>
      </div>
    </div>
  );
}

/* ══ MORE DROPDOWN ══ */
function MoreDropdown({ isOpen, onBlock, onReport, buttonRef }) {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const r = buttonRef.current.getBoundingClientRect();
      const dW = 160,
        dH = 88;
      let top = r.bottom + 8;
      if (window.innerHeight - r.bottom < dH + 50) top = r.top - dH - 8;
      let left = r.right - dW;
      if (left < 10) left = 10;
      setPos({ top, left });
    }
  }, [isOpen, buttonRef]);
  if (!isOpen) return null;
  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 999 }} />
      <div
        className="fp-more-dropdown"
        style={{
          position: "fixed",
          top: pos.top,
          left: pos.left,
          zIndex: 1000,
          width: 162,
          background: "#090f0a",
          border: `1px solid ${G.borderLight}`,
          borderRadius: 13,
          padding: 6,
          boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
        }}
      >
        <div className="fp-drop-item fp-drop-item-block" onClick={onBlock}>
          🚫 <span>Block User</span>
        </div>
        <div className="fp-drop-item fp-drop-item-report" onClick={onReport}>
          🚩 <span>Report User</span>
        </div>
      </div>
    </>
  );
}

/* ══ BLOCKED CARD ══ */
function BlockedCard({ onUnblock }) {
  return (
    <div
      style={{
        background: G.card,
        border: `1px solid ${G.border}`,
        borderRadius: 18,
        padding: "26px 22px",
        margin: "0 20px 20px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 44, color: G.textDim, marginBottom: 14 }}>🚫</div>
      <div
        style={{
          color: G.text,
          marginBottom: 7,
          fontSize: 15,
          fontWeight: 700,
        }}
      >
        You've blocked this account
      </div>
      <div
        style={{
          color: G.textMuted,
          fontSize: 13,
          marginBottom: 18,
          lineHeight: 1.6,
        }}
      >
        Unblock to see their links and send messages.
      </div>
      <button onClick={onUnblock} className="fp-unblock-btn">
        Unblock
      </button>
    </div>
  );
}

/* ══ SOCIAL ICONS ══ */
const IgIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);
const LiIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
const GhIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);
const GmailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="26"
    height="26"
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
);

const SOCIAL_META = [
  {
    key: "instagram",
    label: "Instagram",
    bg: "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
    Icon: IgIcon,
  },
  { key: "linkedin", label: "LinkedIn", bg: "#0A66C2", Icon: LiIcon },
  { key: "github", label: "GitHub", bg: "#24292e", Icon: GhIcon },
  { key: "email", label: "Email", bg: "#fff", Icon: GmailIcon },
];

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function FacultyProfile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: "Dr. Arjun Mahapatra",
    username: "@dr.arjun",
    bio: "Passionate educator and researcher with over a decade of experience. Focused on Artificial Intelligence, Data Systems, and mentoring the next generation of engineers.",
    department: "Computer Science & Engineering",
    joinYear: "2013",
    designation: "Associate Professor",
    specialization: "Artificial Intelligence & Machine Learning",
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
  const [editOpen, setEditOpen] = useState(false);
  const [socialModal, setSocialModal] = useState({ open: false, type: null });
  const [shareOpen, setShareOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [ownProfile, setOwnProfile] = useState(true);
  const [connected, setConnected] = useState(false);
  const [pending, setPending] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [reported, setReported] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const coverRef = useRef(null);
  const avatarRef = useRef(null);
  const moreRef = useRef(null);
  const toastKey = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  const showToast = (msg) => {
    toastKey.current++;
    setToast({ msg, key: toastKey.current });
  };

  useEffect(() => {
    if (!moreOpen) return;
    const h = (e) => {
      if (!moreRef.current?.contains(e.target)) setMoreOpen(false);
    };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, [moreOpen]);

  useEffect(() => {
    if (!ownProfile && pending) {
      const t = setTimeout(() => setPopupOpen(true), 3000);
      return () => clearTimeout(t);
    }
  }, [pending, ownProfile]);

  const fileRead = (file, type) => {
    const r = new FileReader();
    r.onload = (e) =>
      setCropModal({ open: true, type, imageUrl: e.target.result });
    r.readAsDataURL(file);
  };

  const initials = profile.name
    .replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s*/i, "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const yearsIn = profile.joinYear
    ? new Date().getFullYear() - parseInt(profile.joinYear)
    : null;

  const bannerBg = coverUrl
    ? `url(${coverUrl}) center/cover no-repeat`
    : `radial-gradient(ellipse at 15% 60%, rgba(16,185,129,0.11) 0%, transparent 55%), radial-gradient(ellipse at 85% 20%, rgba(5,100,55,0.13) 0%, transparent 52%), linear-gradient(140deg, #060d08 0%, #0a1a0c 45%, #060d08 100%)`;

  if (loading) return <Skeleton />;

  return (
    <div
      className="fp-root"
      style={{
        background: G.bg,
        minHeight: "100vh",
        color: G.text,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      <input
        ref={coverRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files[0]) fileRead(e.target.files[0], "cover");
          e.target.value = "";
        }}
      />
      <input
        ref={avatarRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files[0]) fileRead(e.target.files[0], "avatar");
          e.target.value = "";
        }}
      />

      {/* ─── Toggle bar ─── */}
      <div className="fp-toggle-bar">
        <button
          className="fp-toggle-btn"
          onClick={() => {
            setOwnProfile(!ownProfile);
            setConnected(false);
            setPending(false);
          }}
        >
          {ownProfile ? "👁 View as Others" : "← View as Me"}
        </button>
      </div>

      {/* ─── Banner ─── */}
      <div
        className="fp-bwrap"
        style={{ position: "relative", marginBottom: 68 }}
      >
        <div
          style={{
            width: "100%",
            height: 240,
            background: bannerBg,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {!coverUrl && (
            <>
              <div className="fp-banner-grid" />
              <div
                style={{
                  position: "absolute",
                  bottom: 20,
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: `${G.emerald}35`,
                }}
              >
                <div
                  style={{
                    height: 1,
                    width: 55,
                    background: `linear-gradient(to right,transparent,${G.emeraldDim})`,
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: 3.5,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  Faculty Profile
                </span>
                <div
                  style={{
                    height: 1,
                    width: 55,
                    background: `linear-gradient(to left,transparent,${G.emeraldDim})`,
                  }}
                />
              </div>
            </>
          )}
          <div className="fp-banner-fade" />
          {ownProfile && (
            <div style={{ position: "absolute", bottom: 14, right: 14 }}>
              <button
                className="fp-banner-cam-btn"
                onClick={() => coverRef.current.click()}
              >
                📷 {coverUrl ? "Change Banner" : "Add Banner"}
              </button>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div
          className="fp-avatar-wrap"
          style={{ position: "absolute", bottom: -60, left: 22 }}
        >
          <div
            className="fp-aring"
            onClick={() => setPhotoOpen(true)}
            style={{
              width: 114,
              height: 114,
              borderRadius: "50%",
              border: `4px solid ${G.bg}`,
              background: `linear-gradient(135deg,#0a1f12,#071209)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              fontWeight: 800,
              color: G.emerald,
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              boxShadow: `0 0 0 2px ${G.emeraldDim},0 6px 26px rgba(0,0,0,0.6)`,
            }}
          >
            {!avatarUrl && initials}
            {avatarUrl && (
              <img
                src={avatarUrl}
                alt="Avatar"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
            )}
          </div>
          <div
            className="fp-status-dot"
            style={{
              position: "absolute",
              bottom: 5,
              left: 5,
              width: 15,
              height: 15,
              borderRadius: "50%",
              background: G.success,
              border: `3px solid ${G.bg}`,
            }}
          />
          {ownProfile && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                avatarRef.current.click();
              }}
              style={{
                position: "absolute",
                bottom: 2,
                right: -4,
                width: 30,
                height: 30,
                background: `linear-gradient(135deg,${G.emerald},${G.emeraldLight})`,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                border: `2px solid ${G.bg}`,
                fontSize: 13,
              }}
            >
              ✏️
            </div>
          )}
        </div>
      </div>

      {/* ─── Header ─── */}
      <div
        className="fp-hwrap"
        style={{
          padding: "10px 22px 20px",
          borderBottom: `1px solid ${G.border}`,
        }}
      >
        <h1
          style={{
            fontSize: 25,
            fontWeight: 800,
            color: G.text,
            letterSpacing: "-0.2px",
            lineHeight: 1.2,
            marginBottom: 4,
          }}
        >
          {profile.name}
        </h1>
        <div
          style={{
            fontSize: 13,
            color: G.emerald,
            marginBottom: 11,
            fontWeight: 600,
            letterSpacing: 0.3,
          }}
        >
          {profile.username}
        </div>

        {/* Chips */}
        {(profile.designation ||
          profile.department ||
          profile.specialization ||
          profile.joinYear) && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 7,
              marginBottom: 14,
            }}
          >
            {profile.designation && (
              <span className="fp-chip fp-chip-accent">
                🎓 {profile.designation}
              </span>
            )}
            {profile.department && (
              <span className="fp-chip fp-chip-muted">
                🏛️ {profile.department}
              </span>
            )}
            {profile.specialization && (
              <span className="fp-chip fp-chip-muted">
                🔬 {profile.specialization}
              </span>
            )}
            {yearsIn !== null && (
              <span className="fp-chip fp-chip-muted">
                📅 Since {profile.joinYear} · {yearsIn} yr
                {yearsIn !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        {/* Bio */}
        <p
          style={{
            fontSize: 14,
            color: G.textMuted,
            lineHeight: 1.75,
            overflow: "hidden",
            maxHeight: bioExpanded ? "2000px" : "calc(1.75em * 3)",
            transition: "max-height 0.35s ease",
            marginBottom: 4,
          }}
        >
          {profile.bio}
        </p>
        <button
          onClick={() => setBioExpanded(!bioExpanded)}
          style={{
            background: "none",
            border: "none",
            color: G.emerald,
            fontSize: 13,
            cursor: "pointer",
            padding: "3px 0 14px",
            fontFamily: "inherit",
            fontWeight: 600,
          }}
        >
          {bioExpanded ? "Show less ↑" : "Read more ↓"}
        </button>

        {/* Own-profile buttons */}
        {ownProfile && (
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="fp-header-btn"
              style={{ flex: 1 }}
              onClick={() => setEditOpen(true)}
            >
              ✏️ Edit Profile
            </button>
            <button
              className="fp-icon-btn"
              onClick={() => setShareOpen(true)}
              style={{ fontSize: 18 }}
            >
              ↗
            </button>
          </div>
        )}

        {/* Visitor buttons */}
        {!ownProfile && (
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => {
                if (connected) {
                  if (window.confirm(`Disconnect from ${profile.name}?`)) {
                    setConnected(false);
                    setPending(false);
                    showToast("Disconnected");
                  }
                  return;
                }
                if (pending) return;
                setPending(true);
                showToast("Connection request sent!");
                setTimeout(() => setPopupOpen(true), 3000);
              }}
              style={{
                flex: 1,
                padding: "10px 16px",
                background: connected
                  ? G.surface
                  : `linear-gradient(135deg,${G.emerald},${G.emeraldLight})`,
                border: connected ? `1px solid ${G.borderLight}` : "none",
                color: connected ? G.textMuted : "#060d08",
                borderRadius: 10,
                cursor: pending ? "default" : "pointer",
                fontSize: 14,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                opacity: pending ? 0.72 : 1,
                transition: "all 0.2s",
                fontFamily: "inherit",
              }}
            >
              {connected
                ? "✓ Connected"
                : pending
                  ? "⏳ Pending…"
                  : "+ Connect"}
            </button>
            <button
              onClick={() =>
                showToast(
                  connected
                    ? "Chat coming soon!"
                    : "Connect first to send a message",
                )
              }
              style={{
                flex: 1,
                padding: "10px 16px",
                background: G.surface,
                border: `1px solid ${G.borderLight}`,
                color: connected ? G.text : G.textDim,
                borderRadius: 10,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                opacity: connected ? 1 : 0.5,
                transition: "all 0.2s",
                fontFamily: "inherit",
              }}
            >
              💬 Message
            </button>
            <button
              ref={moreRef}
              onClick={(e) => {
                e.stopPropagation();
                setMoreOpen(!moreOpen);
              }}
              className="fp-icon-btn"
              style={{ fontSize: 20 }}
            >
              ⋯
            </button>
          </div>
        )}
      </div>

      {/* ─── Social Section ─── */}
      {!ownProfile && blocked ? (
        <BlockedCard
          onUnblock={() => {
            setBlocked(false);
            showToast("User unblocked");
          }}
        />
      ) : (
        <div className="fp-swrap" style={{ padding: 22 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <div style={{ height: 1, width: 12, background: G.emeraldDim }} />
            <span className="fp-section-label">Connect With Me</span>
            <div
              style={{
                flex: 1,
                height: 1,
                background: `linear-gradient(to right,${G.emeraldDim},transparent)`,
              }}
            />
          </div>

          <div
            style={{
              background: G.card,
              borderRadius: 18,
              border: `1px solid ${G.border}`,
              overflow: "hidden",
            }}
          >
            {SOCIAL_META.map(({ key, label, bg, Icon }, idx) => (
              <div
                key={key}
                className="fp-srow"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "15px 18px",
                  borderBottom:
                    idx < SOCIAL_META.length - 1
                      ? `1px solid ${G.border}`
                      : "none",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 3px 12px rgba(0,0,0,0.35)",
                  }}
                >
                  <Icon />
                </div>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: G.textMuted,
                      fontWeight: 600,
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      color: socialValues[key] ? G.text : G.textDim,
                      fontStyle: socialValues[key] ? "normal" : "italic",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {socialValues[key] || "Not linked"}
                  </span>
                </div>
                {ownProfile && (
                  <button
                    className="fp-social-edit-btn"
                    onClick={() => setSocialModal({ open: true, type: key })}
                  >
                    ✏️
                  </button>
                )}
                {socialValues[key] && (
                  <a
                    href={
                      key === "email"
                        ? `mailto:${socialValues[key]}`
                        : socialValues[key]
                    }
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      width: 34,
                      height: 34,
                      background: `rgba(16,185,129,0.07)`,
                      border: `1px solid ${G.emeraldDim}`,
                      borderRadius: 9,
                      color: G.emerald,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 15,
                      textDecoration: "none",
                      transition: "all 0.18s",
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = `rgba(16,185,129,0.16)`)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = `rgba(16,185,129,0.07)`)
                    }
                  >
                    ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Modals ─── */}
      <MoreDropdown
        isOpen={moreOpen}
        onBlock={() => {
          setMoreOpen(false);
          setBlockOpen(true);
        }}
        onReport={() => {
          if (reported) {
            showToast("Already reported");
            setMoreOpen(false);
            return;
          }
          setMoreOpen(false);
          setReportOpen(true);
        }}
        buttonRef={moreRef}
      />
      <ConnectPopup
        isOpen={popupOpen}
        name={profile.name}
        initials={initials}
        onAccept={() => {
          setConnected(true);
          setPending(false);
          setPopupOpen(false);
          showToast("You are now connected!");
        }}
        onDecline={() => {
          setConnected(false);
          setPending(false);
          setPopupOpen(false);
        }}
      />
      <CropModal
        isOpen={cropModal.open}
        type={cropModal.type}
        imageUrl={cropModal.imageUrl}
        onClose={() =>
          setCropModal({ open: false, type: null, imageUrl: null })
        }
        onApply={(d) => {
          if (cropModal.type === "cover") setCoverUrl(d);
          else setAvatarUrl(d);
        }}
      />
      <EditProfileModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        profile={profile}
        onSave={(d) => {
          setProfile(d);
          setEditOpen(false);
          showToast("Profile updated!");
        }}
      />
      <SocialModal
        isOpen={socialModal.open}
        type={socialModal.type}
        value={socialValues[socialModal.type]}
        onClose={() => setSocialModal({ open: false, type: null })}
        onSave={(v) => {
          setSocialValues((p) => ({ ...p, [socialModal.type]: v }));
          setSocialModal({ open: false, type: null });
          showToast("Link saved!");
        }}
      />
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        onToast={showToast}
        profile={profile}
      />
      <BlockModal
        isOpen={blockOpen}
        onClose={() => setBlockOpen(false)}
        name={profile.name}
        onConfirm={() => {
          setBlocked(true);
          setBlockOpen(false);
          setMoreOpen(false);
          showToast("User blocked");
        }}
      />
      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={() => {
          setReported(true);
          setReportOpen(false);
          showToast("Report submitted. We'll review within 24 hours.");
        }}
      />
      <PhotoViewer
        isOpen={photoOpen}
        onClose={() => setPhotoOpen(false)}
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
