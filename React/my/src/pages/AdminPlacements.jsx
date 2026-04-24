import React, { useState } from "react";
import "../styles/Placements.css";

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

const EMPTY_FORM = {
  name: "",
  role: "",
  date: "",
  status: "ongoing",
  link: "",
};

function AdminPlacements() {
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState("ongoing");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setModal(true);
  };
  const openEdit = (item) => {
    setForm({
      name: item.name,
      role: item.role,
      date: item.date,
      status: item.status,
      link: item.link || "",
    });
    setEditId(item.id);
    setModal(true);
  };
  const closeModal = () => {
    setModal(false);
    setForm(EMPTY_FORM);
    setEditId(null);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.role.trim()) return;
    if (editId) {
      setData((d) =>
        d.map((item) => (item.id === editId ? { ...item, ...form } : item)),
      );
    } else {
      setData((d) => [...d, { id: Date.now(), ...form }]);
    }
    closeModal();
  };

  const handleDelete = (id) =>
    setData((d) => d.filter((item) => item.id !== id));
  const visible = data.filter((d) => d.status === activeTab);
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="pl-root">
      <div className="pl-header">
        <span className="pl-title">Placements</span>
        <span className="pl-admin-badge">
          <i className="bx bx-shield-alt-2" />
          Admin
        </span>
      </div>
      <div className="pl-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`pl-tab${activeTab === tab.key ? " pl-tab--active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <i className={`bx ${tab.icon}`} />
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pl-pull-handle">
        <span />
      </div>
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
                    {item.link && (
                      <div className="pl-card-link">
                        <i className="bx bx-link" />
                        <span className="pl-link-text">{item.link}</span>
                      </div>
                    )}
                  </div>
                  <div className="pl-card-actions">
                    <button
                      className="pl-action-btn pl-action-btn--edit"
                      onClick={() => openEdit(item)}
                    >
                      <i className="bx bx-edit" />
                    </button>
                    <button
                      className="pl-action-btn pl-action-btn--del"
                      onClick={() => handleDelete(item.id)}
                    >
                      <i className="bx bx-trash" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <button className="pl-add-btn" onClick={openAdd}>
          <i className="bx bx-plus" />
          Add Company
        </button>
      </div>

      {modal && (
        <div className="pl-modal-overlay" onClick={closeModal}>
          <div className="pl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pl-modal-header">
              <span className="pl-modal-title">
                {editId ? "Edit Company" : "Add Company"}
              </span>
              <button className="pl-modal-close" onClick={closeModal}>
                <i className="bx bx-x" />
              </button>
            </div>
            <div className="pl-modal-body">
              <div className="pl-field">
                <label className="pl-label">Company Name</label>
                <input
                  className="pl-input"
                  placeholder="e.g. Google"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div className="pl-field">
                <label className="pl-label">Role</label>
                <input
                  className="pl-input"
                  placeholder="e.g. Software Engineer"
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, role: e.target.value }))
                  }
                />
              </div>
              <div className="pl-field">
                <label className="pl-label">Date</label>
                <input
                  className="pl-input"
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                />
              </div>
              <div className="pl-field">
                <label className="pl-label">Status</label>
                <select
                  className="pl-input pl-select"
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value }))
                  }
                >
                  <option value="ongoing">Ongoing</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="finished">Finished</option>
                </select>
              </div>
              <div className="pl-field">
                <label className="pl-label">Registration Link</label>
                <input
                  className="pl-input"
                  placeholder="https://company.com/apply"
                  value={form.link}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, link: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="pl-modal-footer">
              <button className="pl-btn pl-btn--cancel" onClick={closeModal}>
                Cancel
              </button>
              <button className="pl-btn pl-btn--save" onClick={handleSave}>
                <i className="bx bx-check" />
                {editId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPlacements;
