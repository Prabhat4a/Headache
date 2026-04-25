import React, { useState } from "react";
import "../styles/AdminBus.css";

const INITIAL_BUSES = [
  {
    id: "BUS 12",
    route: "Hostel → College",
    departure: "08:15 AM",
    nextStop: "Gate 3",
    status: "ontime",
    driver: "Ramesh Kumar",
  },
  {
    id: "BUS 05",
    route: "Main Gate → Hostel",
    departure: "08:10 AM",
    nextStop: "Library",
    status: "ontime",
    driver: "Sunil Patel",
  },
  {
    id: "BUS 07",
    route: "City Center → College",
    departure: "08:00 AM",
    nextStop: "Block B",
    status: "delayed",
    driver: "Arvind Singh",
  },
  {
    id: "BUS 09",
    route: "Station → College",
    departure: "08:20 AM",
    nextStop: "Canteen",
    status: "ontime",
    driver: "Manoj Verma",
  },
  {
    id: "BUS 11",
    route: "College → City Center",
    departure: "05:00 PM",
    nextStop: "—",
    status: "notstarted",
    driver: "Deepak Rao",
  },
];

const STATUS_OPTIONS = [
  { key: "ontime", label: "On Time", color: "#4ade80" },
  { key: "delayed", label: "Delayed", color: "#fb923c" },
  { key: "notstarted", label: "Scheduled", color: "#64748b" },
  { key: "custom", label: "Custom", color: "#a78bfa" },
];

const STATUS = {
  ontime: { label: "On Time", color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  delayed: { label: "Delayed", color: "#fb923c", bg: "rgba(251,146,60,0.12)" },
  notstarted: {
    label: "Scheduled",
    color: "#64748b",
    bg: "rgba(100,116,139,0.12)",
  },
};

export default function AdminBus() {
  const [buses, setBuses] = useState(INITIAL_BUSES);
  const [showForm, setShowForm] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    id: "",
    from: "",
    to: "",
    departure: "",
    nextStop: "",
    status: "ontime",
    customStatus: "",
    driver: "",
  });

  const resetForm = () => {
    setFormData({
      id: "",
      from: "",
      to: "",
      departure: "",
      nextStop: "",
      status: "ontime",
      customStatus: "",
      driver: "",
    });
    setEditingBus(null);
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (bus) => {
    const [from, to] = bus.route.split(" → ");
    const isCustom = !STATUS[bus.status];
    setFormData({
      id: bus.id,
      from: from || "",
      to: to || "",
      departure: bus.departure,
      nextStop: bus.nextStop,
      status: isCustom ? "custom" : bus.status,
      customStatus: isCustom ? bus.status : "",
      driver: bus.driver,
    });
    setEditingBus(bus.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setBuses((prev) => prev.filter((b) => b.id !== id));
    setDeleteConfirm(null);
    showToast("success", `Bus ${id} removed`);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.id || !formData.from || !formData.to || !formData.departure) {
      showToast("error", "Fill all required fields");
      return;
    }

    const finalStatus =
      formData.status === "custom" ? formData.customStatus : formData.status;
    if (formData.status === "custom" && !formData.customStatus.trim()) {
      showToast("error", "Enter custom status text");
      return;
    }

    const newBus = {
      id: formData.id,
      route: `${formData.from} → ${formData.to}`,
      departure: formData.departure,
      nextStop: formData.nextStop,
      status: finalStatus,
      driver: formData.driver,
    };

    if (editingBus) {
      setBuses((prev) => prev.map((b) => (b.id === editingBus ? newBus : b)));
      showToast("success", `Bus ${editingBus} updated`);
    } else {
      if (buses.find((b) => b.id === formData.id)) {
        showToast("error", "Bus ID already exists");
        return;
      }
      setBuses((prev) => [...prev, newBus]);
      showToast("success", `Bus ${formData.id} added`);
    }
    setShowForm(false);
    resetForm();
  };

  const getStatusStyle = (status) => {
    const known = STATUS[status];
    if (known) return known;
    return { label: status, color: "#a78bfa", bg: "rgba(167,139,250,0.12)" };
  };

  return (
    <div className="ad-root">
      <div className="ad-header">
        <button
          className="ad-header__back"
          onClick={() => window.history.back()}
        >
          <i className="bx bx-arrow-back" />
        </button>
        <div className="ad-header__center">
          <h1 className="ad-header__title">Bus Management</h1>
          <span className="ad-header__count">{buses.length} buses active</span>
        </div>
        <button className="ad-header__add" onClick={handleAdd}>
          <i className="bx bx-plus" />
        </button>
      </div>

      <div className="ad-list">
        {buses.map((bus) => {
          const st = getStatusStyle(bus.status);
          return (
            <div
              key={bus.id}
              className="ad-bus-card"
              style={{ "--sc": st.color }}
            >
              <div className="ad-bus-card__top">
                <div className="ad-bus-card__icon">
                  <i className="bx bxs-bus" />
                  <span>{bus.id}</span>
                </div>
                <div className="ad-bus-card__info">
                  <div className="ad-bus-card__route">{bus.route}</div>
                  <div className="ad-bus-card__meta">
                    <i className="bx bx-time" />
                    {bus.departure}
                    <span className="ad-dot">·</span>
                    <i className="bx bx-user" />
                    {bus.driver}
                  </div>
                </div>
                <div className="ad-bus-card__actions">
                  <button
                    className="ad-action-btn ad-action-btn--edit"
                    onClick={() => handleEdit(bus)}
                  >
                    <i className="bx bx-edit-alt" />
                  </button>
                  <button
                    className="ad-action-btn ad-action-btn--delete"
                    onClick={() => setDeleteConfirm(bus.id)}
                  >
                    <i className="bx bx-trash" />
                  </button>
                </div>
              </div>
              <div className="ad-bus-card__bottom">
                <span
                  className="ad-bus-card__badge"
                  style={{ color: st.color, background: st.bg }}
                >
                  {st.label}
                </span>
                <span className="ad-bus-card__next">
                  <i className="bx bx-map-pin" />
                  {bus.nextStop}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <>
          <div
            className="ad-sheet-backdrop"
            onClick={() => setShowForm(false)}
          />
          <div className="ad-sheet">
            <div className="ad-sheet__handle-zone">
              <div className="ad-sheet__handle" />
            </div>
            <div className="ad-sheet__header">
              <h2>{editingBus ? "Edit Bus" : "New Bus"}</h2>
              <button
                className="ad-sheet__close"
                onClick={() => setShowForm(false)}
              >
                <i className="bx bx-x" />
              </button>
            </div>
            <form className="ad-sheet__form" onSubmit={handleSave}>
              <div className="ad-form-group">
                <label className="ad-label">Bus ID</label>
                <input
                  type="text"
                  className="ad-input"
                  placeholder="e.g. BUS 12"
                  value={formData.id}
                  disabled={!!editingBus}
                  onChange={(e) =>
                    setFormData({ ...formData, id: e.target.value })
                  }
                />
              </div>

              <div className="ad-form-row">
                <div className="ad-form-group">
                  <label className="ad-label">From</label>
                  <input
                    type="text"
                    className="ad-input"
                    placeholder="Enter location"
                    value={formData.from}
                    onChange={(e) =>
                      setFormData({ ...formData, from: e.target.value })
                    }
                  />
                </div>
                <button
                  type="button"
                  className="ad-swap-btn"
                  onClick={() =>
                    setFormData((p) => ({ ...p, from: p.to, to: p.from }))
                  }
                >
                  <i className="bx bx-transfer-alt" />
                </button>
                <div className="ad-form-group">
                  <label className="ad-label">To</label>
                  <input
                    type="text"
                    className="ad-input"
                    placeholder="Enter location"
                    value={formData.to}
                    onChange={(e) =>
                      setFormData({ ...formData, to: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="ad-form-group">
                <label className="ad-label">Departure Time</label>
                <input
                  type="text"
                  className="ad-input"
                  placeholder="e.g. 08:15 AM"
                  value={formData.departure}
                  onChange={(e) =>
                    setFormData({ ...formData, departure: e.target.value })
                  }
                />
              </div>

              <div className="ad-form-group">
                <label className="ad-label">Next Stop</label>
                <input
                  type="text"
                  className="ad-input"
                  placeholder="Enter next stop"
                  value={formData.nextStop}
                  onChange={(e) =>
                    setFormData({ ...formData, nextStop: e.target.value })
                  }
                />
              </div>

              <div className="ad-form-group">
                <label className="ad-label">Status</label>
                <div className="ad-status-options">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      className={`ad-status-btn ${formData.status === s.key ? "ad-status-btn--active" : ""}`}
                      style={
                        formData.status === s.key
                          ? { borderColor: s.color, color: s.color }
                          : {}
                      }
                      onClick={() =>
                        setFormData({ ...formData, status: s.key })
                      }
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                {formData.status === "custom" && (
                  <input
                    type="text"
                    className="ad-input ad-input--custom"
                    placeholder="Enter custom status..."
                    value={formData.customStatus}
                    onChange={(e) =>
                      setFormData({ ...formData, customStatus: e.target.value })
                    }
                  />
                )}
              </div>

              <div className="ad-form-group">
                <label className="ad-label">Driver Name</label>
                <input
                  type="text"
                  className="ad-input"
                  placeholder="Driver name"
                  value={formData.driver}
                  onChange={(e) =>
                    setFormData({ ...formData, driver: e.target.value })
                  }
                />
              </div>

              <button type="submit" className="ad-submit-btn">
                {editingBus ? "Update Bus" : "Add Bus"}
              </button>
            </form>
          </div>
        </>
      )}

      {deleteConfirm && (
        <>
          <div
            className="ad-modal-backdrop"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="ad-modal">
            <div className="ad-modal__icon">
              <i className="bx bx-error-circle" />
            </div>
            <h3 className="ad-modal__title">Remove Bus?</h3>
            <p className="ad-modal__text">
              Are you sure you want to remove {deleteConfirm}? This cannot be
              undone.
            </p>
            <div className="ad-modal__actions">
              <button
                className="ad-modal__btn ad-modal__btn--cancel"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="ad-modal__btn ad-modal__btn--confirm"
                onClick={() => handleDelete(deleteConfirm)}
              >
                Remove
              </button>
            </div>
          </div>
        </>
      )}

      {toast && (
        <div className={`ad-toast ad-toast--${toast.type}`}>
          <i
            className={`bx ${toast.type === "success" ? "bx-check-circle" : "bx-error-circle"}`}
          />
          {toast.message}
        </div>
      )}
    </div>
  );
}
