import React, { useState, useEffect, useRef, useCallback } from "react";
import "../styles/Bus.css";

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

const COLLEGE_CENTER = [19.2304, 82.5483];
const USER_LOC = [19.2295, 82.5478];

const BUS_DATA = [
  {
    id: "BUS 12",
    route: "Hostel → College",
    departure: "08:15 AM",
    nextStop: "Gate 3",
    eta: 5,
    status: "ontime",
    driver: "Ramesh Kumar",
    coords: [19.2318, 82.5501],
    progress: 72,
  },
  {
    id: "BUS 05",
    route: "Main Gate → Hostel",
    departure: "08:10 AM",
    nextStop: "Library",
    eta: 8,
    status: "ontime",
    driver: "Sunil Patel",
    coords: [19.229, 82.5462],
    progress: 55,
  },
  {
    id: "BUS 07",
    route: "City Center → College",
    departure: "08:00 AM",
    nextStop: "Block B",
    eta: 12,
    status: "delayed",
    driver: "Arvind Singh",
    coords: [19.2275, 82.551],
    progress: 30,
  },
  {
    id: "BUS 09",
    route: "Station → College",
    departure: "08:20 AM",
    nextStop: "Canteen",
    eta: 15,
    status: "ontime",
    driver: "Manoj Verma",
    coords: [19.2335, 82.547],
    progress: 40,
  },
  {
    id: "BUS 11",
    route: "College → City Center",
    departure: "05:00 PM",
    nextStop: "—",
    eta: null,
    status: "notstarted",
    driver: "Deepak Rao",
    coords: [19.2298, 82.549],
    progress: 0,
  },
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

const TABS = [
  { key: "all", label: "All" },
  { key: "ontime", label: "Ongoing" },
  { key: "delayed", label: "Delayed" },
  { key: "notstarted", label: "Upcoming" },
];

function km(lat1, lon1, lat2, lon2) {
  const R = 6371,
    d2r = Math.PI / 180;
  const dLat = (lat2 - lat1) * d2r,
    dLon = (lon2 - lon1) * d2r;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * d2r) * Math.cos(lat2 * d2r) * Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

function useLeaflet() {
  const [ready, setReady] = useState(!!window.L);
  useEffect(() => {
    if (window.L) {
      setReady(true);
      return;
    }
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = LEAFLET_CSS;
      document.head.appendChild(l);
    }
    const s = document.createElement("script");
    s.src = LEAFLET_JS;
    s.onload = () => setReady(true);
    document.head.appendChild(s);
  }, []);
  return ready;
}

/* ─── MAP ─── */
function BusMap({ selectedId, selectedBus, onBusClick, mapRef, polylineRef }) {
  const divRef = useRef(null);
  const markersRef = useRef({});
  const leaflet = useLeaflet();

  const icon = useCallback((bus, sel) => {
    const c = (STATUS[bus.status] || STATUS.notstarted).color;
    return window.L.divIcon({
      className: "",
      html: `<div class="btm-pin${sel ? " btm-pin--sel" : ""}" style="--c:${c}">
               <i class='bx bxs-bus'></i><span>${bus.id}</span>
             </div>`,
      iconSize: [52, 46],
      iconAnchor: [26, 46],
    });
  }, []);

  useEffect(() => {
    if (!leaflet || !divRef.current || mapRef.current) return;
    const L = window.L;
    const map = L.map(divRef.current, {
      center: COLLEGE_CENTER,
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
    });
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      { maxZoom: 19 },
    ).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    BUS_DATA.forEach((bus) => {
      const m = L.marker(bus.coords, { icon: icon(bus, false) }).addTo(map);
      m.on("click", () => onBusClick(bus.id));
      markersRef.current[bus.id] = m;
    });
    L.marker(USER_LOC, {
      zIndexOffset: 1000,
      icon: L.divIcon({
        className: "",
        html: `<div class="btm-user"><div class="btm-user__pulse"></div><div class="btm-user__dot"></div></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      }),
    }).addTo(map);
    mapRef.current = map;
  }, [leaflet]);

  useEffect(() => {
    if (!leaflet || !mapRef.current) return;
    const L = window.L,
      map = mapRef.current;
    BUS_DATA.forEach((bus) => {
      const m = markersRef.current[bus.id];
      if (!m) return;
      m.setIcon(icon(bus, bus.id === selectedId));
      m.setOpacity(selectedId && bus.id !== selectedId ? 0.25 : 1);
    });
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }
    if (selectedId && selectedBus) {
      polylineRef.current = L.polyline([selectedBus.coords, USER_LOC], {
        color: "#6366f1",
        weight: 4,
        dashArray: "10 8",
        lineCap: "round",
        opacity: 0.85,
      }).addTo(map);
      map.flyToBounds(L.latLngBounds([selectedBus.coords, USER_LOC]), {
        padding: [70, 70],
        duration: 0.8,
        maxZoom: 16,
      });
    } else {
      map.flyTo(COLLEGE_CENTER, 15, { duration: 0.6 });
    }
    map.invalidateSize();
  }, [selectedId, leaflet, selectedBus]);

  return <div ref={divRef} className="btm-map" />;
}

/* ─── MAIN ─── */
export default function BusTracking() {
  const [selected, setSelected] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState("all");
  const [tick, setTick] = useState(0);
  const [time, setTime] = useState(new Date());

  const mapRef = useRef(null);
  const polylineRef = useRef(null);
  const sheetRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => {
      setTime(new Date());
      setTick((n) => n + 1);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const selBus = BUS_DATA.find((b) => b.id === selected) || null;
  const selSt = selBus ? STATUS[selBus.status] : null;
  const selDist = selBus
    ? km(selBus.coords[0], selBus.coords[1], USER_LOC[0], USER_LOC[1])
    : null;
  const selEtaSec =
    selBus?.eta != null ? Math.max(0, selBus.eta * 60 - tick) : null;
  const fmtEta = (s) =>
    `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;

  const filteredBuses =
    tab === "all" ? BUS_DATA : BUS_DATA.filter((b) => b.status === tab);

  const handleBusClick = (id) => {
    if (selected === id) {
      setSelected(null);
      setExpanded(false);
    } else {
      setSelected(id);
      setExpanded(true);
    }
  };

  // ── Drag ──
  const onMouseDown = (e) => {
    e.preventDefault();
    const startY = e.clientY,
      startExp = expanded;
    const move = (ev) => {
      const diff = startY - ev.clientY;
      if (diff > 70 && !startExp) {
        setExpanded(true);
        cleanup();
      }
      if (diff < -70 && startExp) {
        setExpanded(false);
        cleanup();
      }
    };
    const cleanup = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", cleanup);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", cleanup);
  };

  const onTouchStart = (e) => {
    const startY = e.touches[0].clientY,
      startExp = expanded;
    const move = (ev) => {
      const diff = startY - ev.touches[0].clientY;
      if (diff > 70 && !startExp) {
        setExpanded(true);
        cleanup();
      }
      if (diff < -70 && startExp) {
        setExpanded(false);
        cleanup();
      }
    };
    const cleanup = () => {
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", cleanup);
    };
    window.addEventListener("touchmove", move, { passive: true });
    window.addEventListener("touchend", cleanup);
  };

  const sheetClass = selected
    ? "bt-sheet--sel"
    : expanded
      ? "bt-sheet--exp"
      : "bt-sheet--col";

  return (
    <div className="bt-root">
      <BusMap
        selectedId={selected}
        selectedBus={selBus}
        onBusClick={handleBusClick}
        mapRef={mapRef}
        polylineRef={polylineRef}
      />

      {/* HEADER */}
      <div className="bt-header">
        <div className="bt-header__left">
          <div className="bt-header__icon">
            <i className="bx bxs-bus" />
          </div>
          <div>
            <div className="bt-header__title">Bus Tracking</div>
            <div className="bt-header__sub">{BUS_DATA.length} buses active</div>
          </div>
        </div>
        <div className="bt-header__live">
          <span className="bt-header__dot" />
          LIVE
        </div>
      </div>

      {/* BOTTOM SHEET */}
      <div ref={sheetRef} className={`bt-sheet ${sheetClass}`}>
        {/* Drag handle */}
        <div
          className="bt-sheet__handle-zone"
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
        >
          <div className="bt-sheet__handle" />
        </div>

        {/* Sheet header */}
        <div className="bt-sheet__header">
          <div>
            <div className="bt-sheet__title">All Buses</div>
            <div className="bt-sheet__sub">
              {BUS_DATA.filter((b) => b.status !== "notstarted").length} running
              now
            </div>
          </div>
          <div className="bt-sheet__clock">
            {time.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </div>
        </div>

        {/* Category tabs — only show when no bus selected */}
        {!selected && (
          <div className="bt-tabs">
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`bt-tab ${tab === t.key ? "bt-tab--active" : ""}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
                <span className="bt-tab__count">
                  {t.key === "all"
                    ? BUS_DATA.length
                    : BUS_DATA.filter((b) => b.status === t.key).length}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Scrollable area */}
        <div className="bt-sheet__scroll">
          {/* Selected bus detail card */}
          {selBus && selSt && (
            <div className="bt-card" style={{ "--sc": selSt.color }}>
              <div className="bt-card__accent" />
              <div className="bt-card__body">
                <div className="bt-card__row">
                  <div className="bt-card__icon">
                    <i className="bx bxs-bus" />
                    <span>{selBus.id}</span>
                  </div>
                  <div className="bt-card__info">
                    <div className="bt-card__route">{selBus.route}</div>
                    <div className="bt-card__driver">
                      <i className="bx bx-user" />
                      {selBus.driver}
                    </div>
                  </div>
                  <button
                    className="bt-card__close"
                    onClick={() => {
                      setSelected(null);
                      setExpanded(false);
                    }}
                  >
                    <i className="bx bx-x" />
                  </button>
                </div>
                <div className="bt-card__stats">
                  <div className="bt-card__stat">
                    <div
                      className="bt-card__stat-val"
                      style={{ color: selSt.color }}
                    >
                      {selEtaSec != null ? fmtEta(selEtaSec) : "—"}
                    </div>
                    <div className="bt-card__stat-lbl">ETA</div>
                  </div>
                  <div className="bt-card__divider" />
                  <div className="bt-card__stat">
                    <div className="bt-card__stat-val">{selDist} km</div>
                    <div className="bt-card__stat-lbl">Distance</div>
                  </div>
                  <div className="bt-card__divider" />
                  <div className="bt-card__stat">
                    <div
                      className="bt-card__stat-val"
                      style={{ color: selSt.color, fontSize: 11 }}
                    >
                      {selSt.label}
                    </div>
                    <div className="bt-card__stat-lbl">Status</div>
                  </div>
                </div>
                {selBus.status !== "notstarted" && (
                  <div className="bt-card__track">
                    <span className="bt-card__dot" />
                    <div className="bt-card__bar-wrap">
                      <div className="bt-card__bar">
                        <div
                          className="bt-card__fill"
                          style={{ width: `${selBus.progress}%` }}
                        />
                      </div>
                      <div className="bt-card__stops">
                        <span>Origin</span>
                        <span style={{ color: selSt.color }}>
                          ▶ {selBus.nextStop}
                        </span>
                        <span>College</span>
                      </div>
                    </div>
                    <span className="bt-card__dot bt-card__dot--dim" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bus list */}
          {!selected &&
            filteredBuses.map((bus) => {
              const st = STATUS[bus.status] || STATUS.notstarted;
              const dist = km(
                bus.coords[0],
                bus.coords[1],
                USER_LOC[0],
                USER_LOC[1],
              );
              const etaS =
                bus.eta != null ? Math.max(0, bus.eta * 60 - tick) : null;
              const etaM = etaS != null ? Math.floor(etaS / 60) : null;
              return (
                <div
                  key={bus.id}
                  className="bt-item"
                  style={{ "--sc": st.color }}
                  onClick={() => handleBusClick(bus.id)}
                >
                  <div className="bt-item__left">
                    <div className="bt-item__icon">
                      <i className="bx bxs-bus" />
                      <span>{bus.id}</span>
                    </div>
                    <div className="bt-item__text">
                      <div className="bt-item__route">{bus.route}</div>
                      <div className="bt-item__meta">
                        <i className="bx bx-time" />
                        <span>{bus.departure}</span>
                        <span className="bt-item__dot">·</span>
                        <i className="bx bx-map" />
                        <span>{dist} km</span>
                        {bus.status !== "notstarted" && (
                          <>
                            <span className="bt-item__dot">·</span>
                            <i className="bx bx-map-pin" />
                            <span>{bus.nextStop}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="bt-item__right">
                    <span
                      className="bt-item__badge"
                      style={{ color: st.color, background: st.bg }}
                    >
                      {st.label}
                    </span>
                    {etaM != null && (
                      <div className="bt-item__eta">
                        <span className="bt-item__eta-n">{etaM}</span>
                        <span className="bt-item__eta-l">min</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

          {/* Empty state for filtered tabs */}
          {!selected && filteredBuses.length === 0 && (
            <div className="bt-empty">
              <i className="bx bx-bus" />
              <span>No buses in this category</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
