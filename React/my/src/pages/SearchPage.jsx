import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════ */
const MOCK = [
  // Students
  {
    id: 1,
    type: "student",
    name: "Jitu Grandu",
    username: "@jitu_samapati",
    branch: "BCA",
    year: "3rd year",
    initials: "JG",
    connected: false,
  },
  {
    id: 2,
    type: "student",
    name: "Priya Sahoo",
    username: "@priya_s",
    branch: "B.Tech CSE",
    year: "2nd year",
    initials: "PS",
    connected: true,
  },
  {
    id: 3,
    type: "student",
    name: "Rohit Dash",
    username: "@rohit_d",
    branch: "MCA",
    year: "1st year",
    initials: "RD",
    connected: false,
  },
  {
    id: 4,
    type: "student",
    name: "Sneha Pattnaik",
    username: "@sneha_p",
    branch: "B.Sc IT",
    year: "4th year",
    initials: "SP",
    connected: false,
  },
  {
    id: 5,
    type: "student",
    name: "Aman Verma",
    username: "@aman_v",
    branch: "MBA",
    year: "2nd year",
    initials: "AV",
    connected: true,
  },
  // Faculty
  {
    id: 6,
    type: "faculty",
    name: "Dr. Arjun Mahapatra",
    username: "@dr.arjun",
    dept: "Computer Science",
    designation: "Associate Professor",
    initials: "AM",
    connected: false,
  },
  {
    id: 7,
    type: "faculty",
    name: "Prof. Sunita Rath",
    username: "@prof.sunita",
    dept: "Mathematics",
    designation: "Professor",
    initials: "SR",
    connected: true,
  },
  {
    id: 8,
    type: "faculty",
    name: "Dr. Bikash Mohanty",
    username: "@dr.bikash",
    dept: "Physics",
    designation: "Assistant Professor",
    initials: "BM",
    connected: false,
  },
  // Events
  {
    id: 9,
    type: "event",
    name: "Tech Fest 2025",
    date: "Apr 12",
    tag: "Technical",
    desc: "Annual inter-college tech competition",
    initials: "TF",
  },
  {
    id: 10,
    type: "event",
    name: "Cultural Night",
    date: "Apr 20",
    tag: "Cultural",
    desc: "Music, dance and drama performances",
    initials: "CN",
  },
  {
    id: 11,
    type: "event",
    name: "Hackathon 3.0",
    date: "May 2",
    tag: "Technical",
    desc: "24-hour coding marathon open to all",
    initials: "H3",
  },
  // Notices
  {
    id: 12,
    type: "notice",
    name: "Exam Schedule Released",
    date: "Mar 22",
    dept: "Examination Cell",
    desc: "End semester exam timetable is now available on the portal.",
  },
  {
    id: 13,
    type: "notice",
    name: "Fee Payment Deadline",
    date: "Mar 28",
    dept: "Accounts",
    desc: "Last date to pay semester fees without late fine.",
  },
  {
    id: 14,
    type: "notice",
    name: "Library Timing Change",
    date: "Mar 20",
    dept: "Library",
    desc: "Library will remain open until 9 PM from April onwards.",
  },
  // Chat / Groups
  {
    id: 15,
    type: "chat",
    name: "BCA 3rd Year",
    members: "128 members",
    desc: "Official group for BCA 3rd year students",
    initials: "B3",
  },
  {
    id: 16,
    type: "chat",
    name: "Coding Club",
    members: "64 members",
    desc: "Discuss DSA, projects and hackathons",
    initials: "CC",
  },
  {
    id: 17,
    type: "chat",
    name: "Placement Cell",
    members: "210 members",
    desc: "Jobs, internships and interview tips",
    initials: "PC",
  },
];

const TABS = [
  { key: "all", label: "All" },
  { key: "student", label: "Students" },
  { key: "faculty", label: "Faculty" },
  { key: "event", label: "Events" },
  { key: "notice", label: "Notice" },
  { key: "chat", label: "Chat" },
];

/* ═══════════════════════════════════════════════════
   COLOUR TOKENS  (match app dark theme)
═══════════════════════════════════════════════════ */
const C = {
  bg: "#0a0a0a",
  surface: "#111111",
  card: "#141414",
  border: "#1e1e1e",
  borderLight: "#2a2a2a",
  purple: "#a78bfa",
  purpleGlow: "rgba(167,139,250,0.15)",
  purpleDim: "rgba(167,139,250,0.35)",
  text: "#f0f0f0",
  textMuted: "#888888",
  textDim: "#3a3a3a",
  success: "#10b981",
  warn: "#f59e0b",
  blue: "#3b82f6",
};

/* type → accent colour */
const TYPE_COLOR = {
  student: "#a78bfa",
  faculty: "#10b981",
  event: "#f59e0b",
  notice: "#3b82f6",
  chat: "#ec4899",
};

const TYPE_BG = {
  student: "rgba(167,139,250,0.12)",
  faculty: "rgba(16,185,129,0.12)",
  event: "rgba(245,158,11,0.12)",
  notice: "rgba(59,130,246,0.12)",
  chat: "rgba(236,72,153,0.12)",
};

/* ── keyframes injected once ── */
const KF = `
@keyframes fadeUp   { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
@keyframes shimmer  { 0%   { background-position:200% 0 }           100% { background-position:-200% 0 } }
@keyframes pulse    { 0%,100% { opacity:1 } 50% { opacity:0.5 } }
`;

/* ═══════════════════════════════════════════════════
   SKELETON CARD
═══════════════════════════════════════════════════ */
function SkeletonCard() {
  const sh = (w, h, r = 8) => (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: r,
        background: `linear-gradient(90deg,#1a1a1a 25%,#242424 50%,#1a1a1a 75%)`,
        backgroundSize: "600px 100%",
        animation: "shimmer 1.4s infinite linear",
        flexShrink: 0,
      }}
    />
  );
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 16px",
        background: C.card,
        borderRadius: 14,
        border: `1px solid ${C.border}`,
        marginBottom: 10,
      }}
    >
      {sh(48, 48, "50%")}
      <div style={{ flex: 1 }}>
        {sh("55%", 14, 6)}
        <div style={{ height: 8 }} />
        {sh("35%", 11, 6)}
        <div style={{ height: 8 }} />
        <div style={{ display: "flex", gap: 6 }}>
          {sh(52, 20, 20)}
          {sh(60, 20, 20)}
        </div>
      </div>
      {sh(72, 32, 8)}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   RESULT CARDS
═══════════════════════════════════════════════════ */
function StudentCard({ item, onConnect }) {
  const accent = TYPE_COLOR.student;
  return (
    <div style={cardWrap()}>
      {/* avatar */}
      <div style={avatarStyle(accent)}>{item.initials}</div>
      {/* info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 2,
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: 15,
              color: C.text,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {item.name}
          </span>
        </div>
        <div
          style={{
            fontSize: 12,
            color: accent,
            marginBottom: 6,
            fontWeight: 600,
          }}
        >
          {item.username}
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {item.branch && <Chip label={item.branch} color={accent} />}
          {item.year && <Chip label={item.year} color={C.textMuted} />}
        </div>
      </div>
      {/* action */}
      <ConnectBtn
        connected={item.connected}
        accent={accent}
        onClick={() => onConnect(item.id)}
      />
    </div>
  );
}

function FacultyCard({ item, onConnect }) {
  const accent = TYPE_COLOR.faculty;
  return (
    <div style={cardWrap()}>
      <div style={avatarStyle(accent)}>{item.initials}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: C.text,
            display: "block",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item.name}
        </span>
        <div
          style={{
            fontSize: 12,
            color: accent,
            marginBottom: 6,
            fontWeight: 600,
          }}
        >
          {item.username}
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {item.designation && <Chip label={item.designation} color={accent} />}
          {item.dept && <Chip label={item.dept} color={C.textMuted} />}
        </div>
      </div>
      <ConnectBtn
        connected={item.connected}
        accent={accent}
        onClick={() => onConnect(item.id)}
      />
    </div>
  );
}

function EventCard({ item }) {
  const accent = TYPE_COLOR.event;
  return (
    <div style={cardWrap()}>
      <div style={{ ...avatarStyle(accent), fontSize: 16, borderRadius: 12 }}>
        {item.initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: C.text,
            display: "block",
            marginBottom: 3,
          }}
        >
          {item.name}
        </span>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>
          {item.desc}
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          <Chip label={`📅 ${item.date}`} color={accent} />
          <Chip label={item.tag} color={C.textMuted} />
        </div>
      </div>
      <button
        style={{
          padding: "6px 12px",
          background: accent,
          border: "none",
          borderRadius: 8,
          color: "#000",
          fontWeight: 700,
          fontSize: 12,
          cursor: "pointer",
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
      >
        View
      </button>
    </div>
  );
}

function NoticeCard({ item }) {
  const accent = TYPE_COLOR.notice;
  return (
    <div
      style={{
        ...cardWrap(),
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "100%",
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: `rgba(59,130,246,0.15)`,
            border: `1px solid rgba(59,130,246,0.3)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          📋
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: C.text,
              display: "block",
            }}
          >
            {item.name}
          </span>
          <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
            <Chip label={item.dept} color={accent} />
            <Chip label={item.date} color={C.textMuted} />
          </div>
        </div>
      </div>
      <p
        style={{
          fontSize: 13,
          color: C.textMuted,
          lineHeight: 1.6,
          margin: 0,
          paddingLeft: 48,
        }}
      >
        {item.desc}
      </p>
    </div>
  );
}

function ChatCard({ item }) {
  const accent = TYPE_COLOR.chat;
  return (
    <div style={cardWrap()}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: `rgba(236,72,153,0.15)`,
          border: `1px solid rgba(236,72,153,0.3)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: 16,
          color: accent,
          flexShrink: 0,
        }}
      >
        {item.initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: C.text,
            display: "block",
            marginBottom: 2,
          }}
        >
          {item.name}
        </span>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 5 }}>
          {item.members}
        </div>
        <div
          style={{
            fontSize: 12,
            color: C.textMuted,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item.desc}
        </div>
      </div>
      <button
        style={{
          padding: "6px 12px",
          background: `rgba(236,72,153,0.15)`,
          border: `1px solid rgba(236,72,153,0.35)`,
          borderRadius: 8,
          color: accent,
          fontWeight: 700,
          fontSize: 12,
          cursor: "pointer",
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
      >
        Join
      </button>
    </div>
  );
}

/* ── helpers ── */
const cardWrap = () => ({
  display: "flex",
  alignItems: "center",
  gap: 14,
  padding: "14px 16px",
  background: C.card,
  borderRadius: 14,
  border: `1px solid ${C.border}`,
  marginBottom: 10,
  animation: "fadeUp 0.3s ease both",
  transition: "border-color 0.2s, transform 0.18s",
  cursor: "default",
});

const avatarStyle = (accent) => ({
  width: 48,
  height: 48,
  borderRadius: "50%",
  background: `linear-gradient(135deg,${accent}33,${accent}18)`,
  border: `1.5px solid ${accent}55`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 800,
  fontSize: 17,
  color: accent,
  flexShrink: 0,
  letterSpacing: 0.5,
});

function Chip({ label, color }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 9px",
        borderRadius: 20,
        background: `${color}18`,
        border: `1px solid ${color}35`,
        color,
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function ConnectBtn({ connected, accent, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "7px 13px",
        background: connected ? `${accent}18` : accent,
        border: `1px solid ${connected ? accent + "55" : accent}`,
        borderRadius: 9,
        color: connected ? accent : "#08090d",
        fontWeight: 700,
        fontSize: 12,
        cursor: "pointer",
        flexShrink: 0,
        whiteSpace: "nowrap",
        transition: "all 0.18s",
        opacity: hover && connected ? 0.8 : 1,
      }}
    >
      {connected ? "✓ Connected" : "+ Connect"}
    </button>
  );
}

/* ═══════════════════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════════════════ */
function EmptyState({ query, tab }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        color: C.textMuted,
        textAlign: "center",
        animation: "fadeUp 0.3s ease",
      }}
    >
      <div style={{ fontSize: 54, marginBottom: 16, opacity: 0.4 }}>🔍</div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: C.text,
          marginBottom: 8,
        }}
      >
        {query
          ? `No results for "${query}"`
          : `No ${tab === "all" ? "results" : tab + "s"} yet`}
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 260 }}>
        {query
          ? "Try a different keyword or change the filter tab."
          : "Start typing to search across students, faculty, events and more."}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN SEARCH PAGE
═══════════════════════════════════════════════════ */
export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(MOCK);
  const inputRef = useRef(null);
  const tabsRef = useRef(null);

  /* auto-focus on mount */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /* search logic with debounce */
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(
      () => {
        const q = query.trim().toLowerCase();
        let filtered = data;

        /* filter by tab */
        if (activeTab !== "all") {
          filtered = filtered.filter((r) => r.type === activeTab);
        }

        /* filter by query */
        if (q) {
          filtered = filtered.filter((r) => {
            const fields = [
              r.name,
              r.username,
              r.branch,
              r.year,
              r.dept,
              r.designation,
              r.tag,
              r.desc,
              r.members,
            ].filter(Boolean);
            return fields.some((f) => f.toLowerCase().includes(q));
          });
        }

        setResults(filtered);
        setLoading(false);
      },
      (q) => q,
      280,
    );

    // Actually debounce properly
    const id = setTimeout(() => {
      const q = query.trim().toLowerCase();
      let filtered = data;
      if (activeTab !== "all")
        filtered = filtered.filter((r) => r.type === activeTab);
      if (q) {
        filtered = filtered.filter((r) => {
          const fields = [
            r.name,
            r.username,
            r.branch,
            r.year,
            r.dept,
            r.designation,
            r.tag,
            r.desc,
            r.members,
          ].filter(Boolean);
          return fields.some((f) => f.toLowerCase().includes(q));
        });
      }
      setResults(filtered);
      setLoading(false);
    }, 280);
    clearTimeout(timer);
    return () => clearTimeout(id);
  }, [query, activeTab, data]);

  const handleConnect = (id) => {
    setData((prev) =>
      prev.map((r) => (r.id === id ? { ...r, connected: !r.connected } : r)),
    );
  };

  /* scroll active tab into view */
  useEffect(() => {
    const activeEl = tabsRef.current?.querySelector(".tab-active");
    if (activeEl)
      activeEl.scrollIntoView({
        inline: "center",
        behavior: "smooth",
        block: "nearest",
      });
  }, [activeTab]);

  const renderCard = (item) => {
    switch (item.type) {
      case "student":
        return (
          <StudentCard key={item.id} item={item} onConnect={handleConnect} />
        );
      case "faculty":
        return (
          <FacultyCard key={item.id} item={item} onConnect={handleConnect} />
        );
      case "event":
        return <EventCard key={item.id} item={item} />;
      case "notice":
        return <NoticeCard key={item.id} item={item} />;
      case "chat":
        return <ChatCard key={item.id} item={item} />;
      default:
        return null;
    }
  };

  /* counts per tab */
  const counts = {};
  TABS.forEach((t) => {
    counts[t.key] =
      t.key === "all"
        ? data.length
        : data.filter((r) => r.type === t.key).length;
  });

  return (
    <div
      style={{
        background: C.bg,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      <style>
        {KF}
        {`
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px }
        ::-webkit-scrollbar-track { background:transparent }
        ::-webkit-scrollbar-thumb { background:#222; border-radius:4px }
        .search-input:focus { outline:none; border-color:${C.purple} !important; box-shadow:0 0 0 3px ${C.purpleGlow} !important; }
        .tab-pill { cursor:pointer; transition:all 0.18s; white-space:nowrap; }
        .tab-pill:hover { opacity:0.85; }
        .tab-pill.tab-active { background:${C.purple} !important; color:#08090a !important; border-color:${C.purple} !important; }
        .result-card:hover { border-color:${C.borderLight} !important; transform:translateY(-1px); }
        `}
      </style>

      {/* ── STICKY SEARCH HEADER ── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: C.bg,
          borderBottom: `1px solid ${C.border}`,
          paddingBottom: 0,
        }}
      >
        {/* Search bar row */}
        <div style={{ padding: "14px 16px 12px" }}>
          <div style={{ position: "relative" }}>
            {/* search icon */}
            <span
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 19,
                color: C.textMuted,
                pointerEvents: "none",
                display: "flex",
              }}
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </span>

            <input
              ref={inputRef}
              className="search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search in specific area…"
              style={{
                width: "100%",
                padding: "13px 42px 13px 46px",
                background: C.surface,
                border: `1.5px solid ${C.border}`,
                borderRadius: 14,
                fontSize: 15,
                color: C.text,
                caretColor: C.purple,
                fontFamily: "inherit",
                transition: "all 0.2s",
              }}
            />

            {/* clear button */}
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: `${C.borderLight}`,
                  border: "none",
                  borderRadius: "50%",
                  width: 22,
                  height: 22,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: C.textMuted,
                  fontSize: 14,
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div
          ref={tabsRef}
          style={{
            display: "flex",
            gap: 7,
            padding: "0 16px 12px",
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
          onScroll={(e) => e.stopPropagation()}
        >
          <style>{`.tab-scroll::-webkit-scrollbar{display:none}`}</style>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = query
              ? tab.key === "all"
                ? results.length
                : results.filter((r) => r.type === tab.key).length
              : counts[tab.key];
            return (
              <button
                key={tab.key}
                className={`tab-pill${isActive ? " tab-active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  background: isActive ? C.purple : C.surface,
                  border: `1px solid ${isActive ? C.purple : C.borderLight}`,
                  color: isActive ? "#08090a" : C.textMuted,
                  fontSize: 13,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  flexShrink: 0,
                }}
              >
                {tab.label}
                <span style={{ fontSize: 11, fontWeight: 800, opacity: 0.8 }}>
                  {count > 0 ? count : ""}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── RESULTS ── */}
      <div style={{ flex: 1, padding: "14px 14px 100px", overflowY: "auto" }}>
        {/* section label */}
        {!loading && results.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                height: 1,
                flex: 1,
                background: `linear-gradient(to right,${C.borderLight},transparent)`,
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: C.textMuted,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              {results.length} result{results.length !== 1 ? "s" : ""}
            </span>
            <div
              style={{
                height: 1,
                flex: 1,
                background: `linear-gradient(to left,${C.borderLight},transparent)`,
              }}
            />
          </div>
        )}

        {/* loading skeletons */}
        {loading && [1, 2, 3].map((i) => <SkeletonCard key={i} />)}

        {/* group results by type when "all" tab */}
        {!loading &&
          results.length > 0 &&
          activeTab === "all" &&
          (() => {
            const groups = {};
            results.forEach((r) => {
              if (!groups[r.type]) groups[r.type] = [];
              groups[r.type].push(r);
            });
            return Object.entries(groups).map(([type, items]) => (
              <div key={type} style={{ marginBottom: 6 }}>
                {/* group header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 9,
                    marginTop: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: TYPE_COLOR[type],
                      letterSpacing: 2.5,
                      textTransform: "uppercase",
                    }}
                  >
                    {type}s
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background: `${TYPE_COLOR[type]}22`,
                    }}
                  />
                </div>
                {items.map(renderCard)}
              </div>
            ));
          })()}

        {/* flat list for specific tab */}
        {!loading &&
          results.length > 0 &&
          activeTab !== "all" &&
          results.map(renderCard)}

        {/* empty */}
        {!loading && results.length === 0 && (
          <EmptyState query={query} tab={activeTab} />
        )}
      </div>
    </div>
  );
}
