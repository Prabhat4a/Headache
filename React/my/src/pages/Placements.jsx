import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "boxicons/css/boxicons.min.css";
import "../styles/Placements.css";

const STATS = [
  { label: "Companies", value: "48", icon: "bx-buildings" },
  { label: "Placed", value: "312", icon: "bx-user-check" },
  { label: "Avg Package", value: "6.2L", icon: "bx-rupee" },
  { label: "Highest", value: "42L", icon: "bx-trending-up" },
];

const COMPANIES = [
  // ── Ongoing ──
  {
    id: 1,
    name: "Google",
    logo: "bx-search-alt",
    role: "SWE Intern",
    package: "80,000/mo",
    status: "ongoing",
    type: "Dream",
    branch: ["CSE", "IT"],
    date: "Mar 29, 2026",
    rounds: ["Online Test", "Technical", "HR"],
    currentRound: 1,
    color: "#4285F4",
  },
  {
    id: 2,
    name: "Microsoft",
    logo: "bxl-microsoft",
    role: "Software Engineer",
    package: "45 LPA",
    status: "ongoing",
    type: "Dream",
    branch: ["CSE", "IT", "ECE"],
    date: "Mar 30, 2026",
    rounds: ["Aptitude", "Coding", "Technical", "HR"],
    currentRound: 2,
    color: "#00A4EF",
  },
  // ── Upcoming ──
  {
    id: 3,
    name: "Amazon",
    logo: "bxl-amazon",
    role: "SDE-1",
    package: "32 LPA",
    status: "upcoming",
    type: "Dream",
    branch: ["CSE", "IT"],
    date: "Apr 5, 2026",
    rounds: ["Online Test", "Technical x2", "Bar Raiser", "HR"],
    currentRound: null,
    color: "#FF9900",
  },
  {
    id: 4,
    name: "Infosys",
    logo: "bx-code-block",
    role: "Systems Engineer",
    package: "4.5 LPA",
    status: "upcoming",
    type: "Mass",
    branch: ["CSE", "IT", "ECE", "MECH", "CIVIL", "EEE"],
    date: "Apr 8, 2026",
    rounds: ["Aptitude", "TR", "HR"],
    currentRound: null,
    color: "#007CC3",
  },
  {
    id: 5,
    name: "TCS",
    logo: "bx-server",
    role: "Assistant System Engineer",
    package: "3.6 LPA",
    status: "upcoming",
    type: "Mass",
    branch: ["CSE", "IT", "ECE", "MECH", "CIVIL", "EEE"],
    date: "Apr 12, 2026",
    rounds: ["TCS NQT", "HR"],
    currentRound: null,
    color: "#6E2B8B",
  },
  {
    id: 6,
    name: "Wipro",
    logo: "bx-chip",
    role: "Project Engineer",
    package: "3.5 LPA",
    status: "upcoming",
    type: "Mass",
    branch: ["CSE", "IT", "ECE", "EEE"],
    date: "Apr 15, 2026",
    rounds: ["Online Test", "TR", "HR"],
    currentRound: null,
    color: "#341C75",
  },
  {
    id: 7,
    name: "Deloitte",
    logo: "bx-bar-chart-alt-2",
    role: "Analyst",
    package: "7.5 LPA",
    status: "upcoming",
    type: "Good",
    branch: ["CSE", "IT", "ECE"],
    date: "Apr 18, 2026",
    rounds: ["Aptitude", "Case Study", "HR"],
    currentRound: null,
    color: "#86BC25",
  },
  {
    id: 8,
    name: "Accenture",
    logo: "bx-globe",
    role: "Associate Software Eng",
    package: "4.5 LPA",
    status: "upcoming",
    type: "Mass",
    branch: ["CSE", "IT", "ECE", "MECH"],
    date: "Apr 20, 2026",
    rounds: ["Cognitive Test", "TR", "HR"],
    currentRound: null,
    color: "#A100FF",
  },
  // ── Past ──
  {
    id: 9,
    name: "Cognizant",
    logo: "bx-code-alt",
    role: "Programmer Analyst",
    package: "4 LPA",
    status: "past",
    type: "Mass",
    branch: ["CSE", "IT", "ECE"],
    date: "Mar 10, 2026",
    placed: 34,
    appeared: 120,
    rounds: ["GAME", "TR", "HR"],
    currentRound: null,
    color: "#1B75BB",
  },
  {
    id: 10,
    name: "HCL",
    logo: "bx-terminal",
    role: "Graduate Engineer Trainee",
    package: "3.8 LPA",
    status: "past",
    type: "Mass",
    branch: ["CSE", "IT", "ECE", "EEE"],
    date: "Mar 5, 2026",
    placed: 28,
    appeared: 98,
    rounds: ["Aptitude", "TR", "HR"],
    currentRound: null,
    color: "#E2001A",
  },
  {
    id: 11,
    name: "Samsung",
    logo: "bx-mobile-alt",
    role: "Software Dev",
    package: "15 LPA",
    status: "past",
    type: "Good",
    branch: ["CSE", "IT", "ECE"],
    date: "Feb 28, 2026",
    placed: 8,
    appeared: 45,
    rounds: ["SCPC Test", "Technical", "HR"],
    currentRound: null,
    color: "#1428A0",
  },
];

const TYPE_COLOR = {
  Dream: {
    bg: "rgba(167,139,250,0.12)",
    border: "rgba(167,139,250,0.4)",
    color: "#a78bfa",
  },
  Good: {
    bg: "rgba(56,189,248,0.12)",
    border: "rgba(56,189,248,0.4)",
    color: "#38bdf8",
  },
  Mass: {
    bg: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.4)",
    color: "#22c55e",
  },
};

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "ongoing", label: "Ongoing" },
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
];

export default function Placements() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);

  const filtered = COMPANIES.filter((c) => {
    const matchTab = tab === "all" || c.status === tab;
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const ongoing = filtered.filter((c) => c.status === "ongoing");
  const upcoming = filtered.filter((c) => c.status === "upcoming");
  const past = filtered.filter((c) => c.status === "past");

  return (
    <div className="pl-wrapper">
      {/* ── Header ── */}
      <div className="pl-header">
        <button className="pl-back-btn" onClick={() => navigate(-1)}>
          <i className="bx bx-arrow-back" />
        </button>
        <div className="pl-header-text">
          <h1 className="pl-title">Placements</h1>
          <p className="pl-subtitle">2025–26 Placement Drive</p>
        </div>
        <div className="pl-header-icon">
          <i className="bx bx-briefcase" />
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="pl-stats">
        {STATS.map((s, i) => (
          <div className="pl-stat-card" key={i}>
            <i className={`bx ${s.icon} pl-stat-icon`} />
            <span className="pl-stat-value">{s.value}</span>
            <span className="pl-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="pl-search-wrap">
        <i className="bx bx-search pl-search-icon" />
        <input
          className="pl-search-input"
          placeholder="Search company or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <i
            className="bx bx-x pl-search-clear"
            onClick={() => setSearch("")}
          />
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="pl-tabs">
        {STATUS_TABS.map((t) => (
          <button
            key={t.id}
            className={`pl-tab${tab === t.id ? " pl-tab--active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            <span className="pl-tab-count">
              {t.id === "all"
                ? COMPANIES.length
                : COMPANIES.filter((c) => c.status === t.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* ── Lists ── */}
      <div className="pl-content">
        {/* Ongoing */}
        {ongoing.length > 0 && (
          <div className="pl-section">
            <div className="pl-section-header">
              <span className="pl-section-dot pl-section-dot--ongoing" />
              <span className="pl-section-title">Ongoing</span>
              <span className="pl-section-count">{ongoing.length}</span>
            </div>
            {ongoing.map((c) => (
              <CompanyCard
                key={c.id}
                company={c}
                expanded={expanded === c.id}
                onToggle={() => setExpanded(expanded === c.id ? null : c.id)}
              />
            ))}
          </div>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div className="pl-section">
            <div className="pl-section-header">
              <span className="pl-section-dot pl-section-dot--upcoming" />
              <span className="pl-section-title">Upcoming</span>
              <span className="pl-section-count">{upcoming.length}</span>
            </div>
            {upcoming.map((c) => (
              <CompanyCard
                key={c.id}
                company={c}
                expanded={expanded === c.id}
                onToggle={() => setExpanded(expanded === c.id ? null : c.id)}
              />
            ))}
          </div>
        )}

        {/* Past */}
        {past.length > 0 && (
          <div className="pl-section">
            <div className="pl-section-header">
              <span className="pl-section-dot pl-section-dot--past" />
              <span className="pl-section-title">Past</span>
              <span className="pl-section-count">{past.length}</span>
            </div>
            {past.map((c) => (
              <CompanyCard
                key={c.id}
                company={c}
                expanded={expanded === c.id}
                onToggle={() => setExpanded(expanded === c.id ? null : c.id)}
              />
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="pl-empty">
            <i className="bx bx-search-alt" />
            <p>No results found</p>
            <span>Try a different search or filter</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CompanyCard({ company: c, expanded, onToggle }) {
  const typeStyle = TYPE_COLOR[c.type];

  return (
    <div
      className={`pl-card${expanded ? " pl-card--expanded" : ""}`}
      onClick={onToggle}
    >
      {/* ── Top row ── */}
      <div className="pl-card-top">
        <div
          className="pl-company-logo"
          style={{
            background: `${c.color}18`,
            border: `1px solid ${c.color}40`,
          }}
        >
          <i className={`bx ${c.logo}`} style={{ color: c.color }} />
        </div>

        <div className="pl-card-info">
          <div className="pl-card-name-row">
            <span className="pl-company-name">{c.name}</span>
            <span
              className="pl-type-tag"
              style={{
                background: typeStyle.bg,
                border: `1px solid ${typeStyle.border}`,
                color: typeStyle.color,
              }}
            >
              {c.type}
            </span>
          </div>
          <span className="pl-role">{c.role}</span>
          <div className="pl-card-meta">
            <span className="pl-package">
              <i className="bx bx-rupee" />
              {c.package}
            </span>
            <span className="pl-date">
              <i className="bx bx-calendar" />
              {c.date}
            </span>
          </div>
        </div>

        <div className="pl-card-right">
          <StatusBadge status={c.status} />
          <i
            className={`bx ${expanded ? "bx-chevron-up" : "bx-chevron-down"} pl-chevron`}
          />
        </div>
      </div>

      {/* ── Expanded details ── */}
      {expanded && (
        <div className="pl-card-details" onClick={(e) => e.stopPropagation()}>
          <div className="pl-divider" />

          {/* Eligible branches */}
          <div className="pl-detail-section">
            <span className="pl-detail-label">Eligible Branches</span>
            <div className="pl-branch-chips">
              {c.branch.map((b) => (
                <span key={b} className="pl-branch-chip">
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Rounds */}
          <div className="pl-detail-section">
            <span className="pl-detail-label">Selection Rounds</span>
            <div className="pl-rounds">
              {c.rounds.map((r, i) => (
                <div key={i} className="pl-round-row">
                  <div
                    className={`pl-round-circle${c.currentRound !== null && i < c.currentRound ? " pl-round-circle--done" : ""}${c.currentRound === i ? " pl-round-circle--active" : ""}`}
                  >
                    {c.currentRound !== null && i < c.currentRound ? (
                      <i className="bx bx-check" />
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </div>
                  {i < c.rounds.length - 1 && (
                    <div
                      className={`pl-round-line${c.currentRound !== null && i < c.currentRound ? " pl-round-line--done" : ""}`}
                    />
                  )}
                  <span
                    className={`pl-round-label${c.currentRound === i ? " pl-round-label--active" : ""}`}
                  >
                    {r}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Past stats */}
          {c.status === "past" && (
            <div className="pl-detail-section">
              <span className="pl-detail-label">Results</span>
              <div className="pl-result-row">
                <div className="pl-result-item">
                  <span className="pl-result-num" style={{ color: "#22c55e" }}>
                    {c.placed}
                  </span>
                  <span className="pl-result-sub">Placed</span>
                </div>
                <div className="pl-result-item">
                  <span className="pl-result-num">{c.appeared}</span>
                  <span className="pl-result-sub">Appeared</span>
                </div>
                <div className="pl-result-item">
                  <span className="pl-result-num" style={{ color: "#a78bfa" }}>
                    {Math.round((c.placed / c.appeared) * 100)}%
                  </span>
                  <span className="pl-result-sub">Success</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    ongoing: { label: "Live", cls: "pl-badge--ongoing" },
    upcoming: { label: "Soon", cls: "pl-badge--upcoming" },
    past: { label: "Closed", cls: "pl-badge--past" },
  };
  const { label, cls } = map[status];
  return <span className={`pl-badge ${cls}`}>{label}</span>;
}
