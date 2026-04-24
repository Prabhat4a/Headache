import React, { useState } from "react";
import "../styles/Placements.css";

// ── When Firebase is added, replace this with Firestore getDocs ──
const initialData = [
  {
    id: 1,
    name: "TCS",
    role: "Software Engineer",
    date: "2026-03-30",
    status: "ongoing",
    link: "https://www.tcs.com/careers",
  },
  {
    id: 2,
    name: "Infosys",
    role: "System Engineer",
    date: "2026-03-28",
    status: "ongoing",
    link: "https://www.infosys.com/careers",
  },
  {
    id: 3,
    name: "Wipro",
    role: "Project Engineer",
    date: "2026-04-05",
    status: "upcoming",
    link: "",
  },
];

const TABS = [
  { key: "ongoing", label: "Ongoing", icon: "bx-building-house" },
  { key: "upcoming", label: "Upcoming", icon: "bx-calendar" },
  { key: "finished", label: "Finished", icon: "bx-check-circle" },
];

const STATUS_CONFIG = {
  ongoing: { color: "#4ade80", bg: "rgba(74,222,128,0.12)", label: "Ongoing" },
  upcoming: {
    color: "#fb923c",
    bg: "rgba(251,146,60,0.12)",
    label: "Upcoming",
  },
  finished: {
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.12)",
    label: "Finished",
  },
};

export default function Placements() {
  const [data] = useState(initialData);
  const [activeTab, setActiveTab] = useState("ongoing");

  const visible = data.filter((d) => d.status === activeTab);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="pl-root">
      {/* Header */}
      <div className="pl-header">
        <span className="pl-title">Placements</span>
      </div>

      {/* Tabs */}
      <div className="pl-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`pl-tab${activeTab === tab.key ? " pl-tab--active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <i className={`bx ${tab.icon}`} />
            {tab.label}
            {tab.key === "upcoming" && <span className="pl-tab-arrow">›</span>}
          </button>
        ))}
      </div>

      {/* Pull handle */}
      <div className="pl-pull-handle">
        <span />
      </div>

      {/* List */}
      <div className="pl-list-section">
        <div className="pl-list-header">
          <span className="pl-list-title">
            {TABS.find((t) => t.key === activeTab)?.label} Companies
          </span>
          <span className="pl-count-badge">{visible.length}</span>
        </div>

        {visible.length === 0 ? (
          <div className="pl-empty">
            <i className="bx bx-inbox" />
            <span>No companies here yet</span>
          </div>
        ) : (
          <div className="pl-cards">
            {visible.map((item) => {
              const st = STATUS_CONFIG[item.status];
              return (
                <div key={item.id} className="pl-card">
                  <div className="pl-company-badge">
                    <i className="bx bx-buildings" />
                    <span>{item.name.slice(0, 3).toUpperCase()}</span>
                  </div>

                  <div className="pl-card-info">
                    <div className="pl-card-top">
                      <span className="pl-company-name">{item.name}</span>
                      <span
                        className="pl-status"
                        style={{ color: st.color, background: st.bg }}
                      >
                        {st.label}
                      </span>
                    </div>
                    <div className="pl-card-role">
                      <i className="bx bx-briefcase" />
                      {item.role}
                    </div>
                    <div className="pl-card-meta">
                      <i className="bx bx-calendar" />
                      {formatDate(item.date)}
                    </div>

                    {/* Register link — only shown if link exists */}
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pl-register-btn"
                      >
                        <i className="bx bx-link-external" />
                        Register
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
