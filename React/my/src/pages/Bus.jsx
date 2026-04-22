import React, { useState, useEffect, useRef } from "react";
import "../styles/Bus.css";

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

// MITS Nowrangapur
const COLLEGE_CENTER = [19.2304, 82.5483];

const busData = [
  {
    id: "BUS 12",
    route: "Hostel → College",
    departure: "08:15 AM",
    arrival: "08:45 AM",
    distance: "2.3 km away",
    nextStop: "Gate 3",
    eta: "5",
    status: "ontime",
    speed: "32 km/h",
    driver: "Ramesh Kumar",
    totalStops: 8,
    coords: [19.2318, 82.5501],
  },
  {
    id: "BUS 05",
    route: "Main Gate → Hostel",
    departure: "08:10 AM",
    arrival: "08:40 AM",
    distance: "1.8 km away",
    nextStop: "Library",
    eta: "8",
    status: "ontime",
    speed: "28 km/h",
    driver: "Sunil Patel",
    totalStops: 6,
    coords: [19.229, 82.5462],
  },
  {
    id: "BUS 07",
    route: "City Center → College",
    departure: "08:00 AM",
    arrival: "08:35 AM",
    distance: "4.5 km away",
    nextStop: "Block B",
    eta: "12",
    status: "delayed",
    speed: "18 km/h",
    driver: "Arvind Singh",
    totalStops: 10,
    coords: [19.2275, 82.551],
  },
  {
    id: "BUS 09",
    route: "Station → College",
    departure: "08:20 AM",
    arrival: "08:55 AM",
    distance: "3.1 km away",
    nextStop: "Canteen",
    eta: "15",
    status: "ontime",
    speed: "35 km/h",
    driver: "Manoj Verma",
    totalStops: 9,
    coords: [19.2335, 82.547],
  },
  {
    id: "BUS 11",
    route: "College → City Center",
    departure: "05:00 PM",
    arrival: "05:35 PM",
    distance: "—",
    nextStop: "—",
    eta: "—",
    status: "notstarted",
    speed: "—",
    driver: "Deepak Rao",
    totalStops: 7,
    coords: [19.2298, 82.549],
  },
];

const statusConfig = {
  ontime: { label: "On Time", color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  delayed: { label: "Delayed", color: "#fb923c", bg: "rgba(251,146,60,0.12)" },
  notstarted: {
    label: "Not Started",
    color: "#f87171",
    bg: "rgba(248,113,113,0.12)",
  },
  completed: {
    label: "Completed",
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.12)",
  },
  offline: { label: "Offline", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
};

/* ── Leaflet loader hook ── */
function useLeaflet() {
  const [ready, setReady] = useState(!!window.L);
  useEffect(() => {
    if (window.L) {
      setReady(true);
      return;
    }
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }
    const script = document.createElement("script");
    script.src = LEAFLET_JS;
    script.onload = () => setReady(true);
    document.head.appendChild(script);
  }, []);
  return ready;
}

/* ── Haversine distance ── */
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
}

/* ── Map Component ── */
function BusMap({
  buses,
  selectedId,
  onSelectBus,
  flyToRef,
  userLocation,
  mapRef: externalMapRef,
}) {
  const divRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const userMarkerRef = useRef(null);
  const leafletReady = useLeaflet();

  const buildIcon = (bus, isSelected) => {
    const L = window.L;
    const st = statusConfig[bus.status];
    return L.divIcon({
      className: "",
      html: `<div class="bt-marker${isSelected ? " bt-marker--sel" : ""}" style="--mc:${st.color}">
               <i class='bx bxs-bus'></i><span>${bus.id}</span>
             </div>`,
      iconSize: [54, 46],
      iconAnchor: [27, 46],
    });
  };

  const buildUserIcon = () => {
    const L = window.L;
    return L.divIcon({
      className: "",
      html: `<div class="bt-user-marker"><div class="bt-user-dot"></div><div class="bt-user-pulse"></div></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  useEffect(() => {
    if (!leafletReady || !divRef.current || mapRef.current) return;
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

    buses.forEach((bus) => {
      const marker = L.marker(bus.coords, { icon: buildIcon(bus, false) })
        .addTo(map)
        .on("click", () => onSelectBus(bus.id));
      markersRef.current[bus.id] = marker;
    });

    mapRef.current = map;
    externalMapRef.current = map;
    flyToRef.current = (coords) => map.flyTo(coords, 17, { duration: 1.2 });
  }, [leafletReady]);

  // Update marker styles when selection changes
  useEffect(() => {
    if (!leafletReady || !mapRef.current) return;
    buses.forEach((bus) => {
      markersRef.current[bus.id]?.setIcon(
        buildIcon(bus, bus.id === selectedId),
      );
    });
  }, [selectedId, leafletReady]);

  // Add / move user location marker
  useEffect(() => {
    if (!leafletReady || !mapRef.current || !userLocation) return;
    const L = window.L;
    const map = mapRef.current;
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(userLocation);
    } else {
      userMarkerRef.current = L.marker(userLocation, {
        icon: buildUserIcon(),
        zIndexOffset: 1000,
      }).addTo(map);
    }
  }, [userLocation, leafletReady]);

  return (
    <div ref={divRef} className="bt-leaflet-map">
      {!leafletReady && (
        <div className="bt-map-loading">
          <i className="bx bx-loader-alt bx-spin" />
          <span>Loading map…</span>
        </div>
      )}
    </div>
  );
}

/* ── Notify hook ── */
function useNotify() {
  const [notified, setNotified] = useState({});
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = "info") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  const toggle = async (bus) => {
    if (notified[bus.id]) {
      clearTimeout(notified[bus.id]);
      setNotified((n) => {
        const c = { ...n };
        delete c[bus.id];
        return c;
      });
      addToast(`Notification cancelled for ${bus.id}`, "cancel");
      return;
    }
    if (bus.eta === "—") {
      addToast(`${bus.id} hasn't started yet`, "error");
      return;
    }

    let perm = Notification.permission;
    if (perm === "default") perm = await Notification.requestPermission();
    if (perm === "denied") {
      addToast("Enable notifications in browser settings", "error");
      return;
    }

    const notifyBefore = 2;
    const delayMin = Math.max(parseInt(bus.eta) - notifyBefore, 0);
    const delayMs = delayMin > 0 ? delayMin * 60 * 1000 : 8000;

    const tid = setTimeout(() => {
      new Notification(`🚌 ${bus.id} arriving in ~${notifyBefore} min!`, {
        body: `${bus.route} — next stop: ${bus.nextStop}`,
        icon: "/favicon.ico",
      });
      setNotified((n) => {
        const c = { ...n };
        delete c[bus.id];
        return c;
      });
      addToast(`${bus.id} is almost at ${bus.nextStop}!`, "success");
    }, delayMs);

    setNotified((n) => ({ ...n, [bus.id]: tid }));
    addToast(
      delayMin > 0
        ? `You'll be notified ${delayMin} min before ${bus.id} arrives ✓`
        : `Demo: notification fires in ~8 sec for ${bus.id} ✓`,
      "success",
    );
  };

  return { notified, toggle, toasts };
}

/* ── Main ── */
export default function BusTracking() {
  const [expanded, setExpanded] = useState(null);
  const [liveTime, setLiveTime] = useState(new Date());
  const [userLocation, setUserLocation] = useState(null);
  const [locationLabel, setLocationLabel] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const { notified, toggle, toasts } = useNotify();
  const flyToRef = useRef(null);
  const leafletMapRef = useRef(null);
  const polylineRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Watch user GPS location
  useEffect(() => {
    if (!navigator.geolocation) {
      // fallback demo location near college
      setUserLocation([19.2295, 82.5478]);
      setLocationLabel("Demo location");
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setLocationLabel(null);
      },
      () => {
        setUserLocation([19.2295, 82.5478]);
        setLocationLabel("Demo location (GPS unavailable)");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  const clearRoute = () => {
    if (polylineRef.current && leafletMapRef.current) {
      leafletMapRef.current.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }
    setActiveRoute(null);
  };

  const handleTrackOnMap = (bus) => {
    const map = leafletMapRef.current;
    if (!map || !window.L) return;

    // Remove old route
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    const L = window.L;
    const userLatLng = userLocation || COLLEGE_CENTER;

    // Dashed polyline: bus → user
    const poly = L.polyline([bus.coords, userLatLng], {
      color: "#4ade80",
      weight: 3,
      dashArray: "8 6",
      lineCap: "round",
    }).addTo(map);
    polylineRef.current = poly;

    const distKm = haversineKm(
      bus.coords[0],
      bus.coords[1],
      userLatLng[0],
      userLatLng[1],
    );
    setActiveRoute({ busId: bus.id, distKm });

    // Fit both markers in view
    map.fitBounds(L.latLngBounds([bus.coords, userLatLng]), {
      padding: [40, 40],
      maxZoom: 17,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bt-root">
      {/* Toasts */}
      <div className="bt-toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`bt-toast bt-toast--${t.type}`}>
            <i
              className={`bx ${t.type === "success" ? "bx-check-circle" : t.type === "cancel" ? "bx-bell-off" : "bx-error-circle"}`}
            />
            {t.msg}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="bt-header">
        <button className="bt-icon-btn">
          <i className="bx bx-menu" />
        </button>
        <span className="bt-title">Bus Tracking</span>
        <button className="bt-icon-btn">
          <i className="bx bx-bell" />
        </button>
      </div>

      {/* Map */}
      <BusMap
        buses={busData}
        selectedId={expanded}
        onSelectBus={(id) => setExpanded((p) => (p === id ? null : id))}
        flyToRef={flyToRef}
        userLocation={userLocation}
        mapRef={leafletMapRef}
      />

      {/* Route info bar — only when a route is active */}
      {activeRoute && (
        <div className="bt-route-bar">
          <i className="bx bx-navigation" />
          <div className="bt-route-bar-info">
            <span className="bt-route-bar-dist">
              {activeRoute.distKm} km away
            </span>
            <span className="bt-route-bar-label">
              {activeRoute.busId} → Your Location
            </span>
          </div>
          <button className="bt-route-bar-close" onClick={clearRoute}>
            <i className="bx bx-x" />
          </button>
        </div>
      )}

      {/* Location label strip */}
      {locationLabel && (
        <div className="bt-loc-strip">
          <i className="bx bx-map-pin" />
          <span>{locationLabel}</span>
        </div>
      )}

      <div className="bt-pull-handle">
        <span />
      </div>

      {/* List */}
      <div className="bt-list-section">
        <div className="bt-list-header">
          <span className="bt-list-title">All Buses</span>
          <span className="bt-list-clock">
            <span className="bt-live-dot" />
            {liveTime.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>

        <div className="bt-buses">
          {busData.map((bus) => {
            const st = statusConfig[bus.status];
            const isOpen = expanded === bus.id;
            const isSet = !!notified[bus.id];
            const isRouted = activeRoute?.busId === bus.id;

            return (
              <div
                key={bus.id}
                className={`bt-card ${isOpen ? "bt-card--open" : ""} ${isRouted ? "bt-card--routed" : ""}`}
              >
                {/* Collapsed row */}
                <button
                  className="bt-card-row"
                  onClick={() =>
                    setExpanded((p) => (p === bus.id ? null : bus.id))
                  }
                >
                  <div className="bt-bus-badge">
                    <i className="bx bxs-bus" />
                    <span>{bus.id}</span>
                  </div>

                  <div className="bt-card-info">
                    <div className="bt-card-top">
                      <span className="bt-card-route">{bus.route}</span>
                      <span
                        className="bt-status"
                        style={{ color: st.color, background: st.bg }}
                      >
                        {st.label}
                      </span>
                    </div>
                    {bus.status !== "notstarted" ? (
                      <>
                        <div className="bt-card-next">
                          <strong>Next:</strong> {bus.nextStop}
                        </div>
                        <div className="bt-card-meta">
                          <i className="bx bx-time-five" /> {bus.eta} min
                          <span className="bt-sep">·</span>
                          <i className="bx bx-map-pin" /> {bus.distance}
                        </div>
                      </>
                    ) : (
                      <div className="bt-card-meta">
                        <i className="bx bx-time" /> {bus.departure} →{" "}
                        {bus.arrival}
                      </div>
                    )}
                  </div>

                  <i
                    className={`bx bx-chevron-down bt-chevron ${isOpen ? "bt-chevron--up" : ""}`}
                  />
                </button>

                {/* Expanded details — accordion */}
                {isOpen && (
                  <div className="bt-expand">
                    <div className="bt-expand-divider" />

                    <div className="bt-detail-grid">
                      {[
                        {
                          icon: "bx-time-five",
                          label: "Departure",
                          val: bus.departure,
                        },
                        { icon: "bx-flag", label: "Arrival", val: bus.arrival },
                        {
                          icon: "bx-map-pin",
                          label: "Next Stop",
                          val: bus.nextStop,
                        },
                        {
                          icon: "bx-timer",
                          label: "ETA",
                          val: bus.eta === "—" ? "—" : `${bus.eta} min`,
                          hi: true,
                        },
                        {
                          icon: "bx-route",
                          label: "Distance",
                          val: bus.distance,
                        },
                        { icon: "bx-run", label: "Speed", val: bus.speed },
                      ].map(({ icon, label, val, hi }) => (
                        <div key={label} className="bt-dcell">
                          <i className={`bx ${icon}`} />
                          <span className="bt-dlabel">{label}</span>
                          <span
                            className={`bt-dval ${hi ? "bt-dval--hi" : ""}`}
                          >
                            {val}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="bt-extra-list">
                      <div className="bt-erow">
                        <i className="bx bx-user" />
                        <span>Driver</span>
                        <span>{bus.driver}</span>
                      </div>
                      <div className="bt-erow">
                        <i className="bx bx-stop-circle" />
                        <span>Total Stops</span>
                        <span>{bus.totalStops} stops</span>
                      </div>
                      {userLocation && bus.status !== "notstarted" && (
                        <div className="bt-erow">
                          <i className="bx bx-current-location" />
                          <span>From You</span>
                          <span>
                            {haversineKm(
                              bus.coords[0],
                              bus.coords[1],
                              userLocation[0],
                              userLocation[1],
                            )}{" "}
                            km
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="bt-actions">
                      <button
                        className={`bt-btn ${isRouted ? "bt-btn--map-active" : "bt-btn--map"}`}
                        onClick={() =>
                          isRouted ? clearRoute() : handleTrackOnMap(bus)
                        }
                      >
                        <i
                          className={`bx ${isRouted ? "bx-x" : "bx-map-alt"}`}
                        />
                        {isRouted ? "Clear Route" : "Track on Map"}
                      </button>
                      <button
                        className={`bt-btn ${isSet ? "bt-btn--notified" : "bt-btn--notify"}`}
                        onClick={() => toggle(bus)}
                      >
                        <i
                          className={`bx ${isSet ? "bx-bell-off" : "bx-bell"}`}
                        />
                        {isSet ? "Cancel" : "Notify Me"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
