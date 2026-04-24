import React, { useState, useEffect, useRef } from "react";
import "../styles/Bus.css";

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

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

/* ── Leaflet loader ── */
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

/* ── Haversine ── */
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

/* ── Map ── */
function BusMap({
  buses,
  selectedId,
  onSelectBus,
  userLocation,
  mapRef: externalMapRef,
}) {
  const divRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const userMarkerRef = useRef(null);
  const polylineRef = useRef(null);
  const distLabelRef = useRef(null);
  const leafletReady = useLeaflet();

  const buildIcon = (bus, isSelected, isHidden) => {
    const L = window.L;
    const st = statusConfig[bus.status];
    return L.divIcon({
      className: "",
      html: `<div class="bt-marker${isSelected ? " bt-marker--sel" : ""}${isHidden ? " bt-marker--hidden" : ""}" style="--mc:${st.color}">
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

  /* Init map */
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
      const marker = L.marker(bus.coords, {
        icon: buildIcon(bus, false, false),
      })
        .addTo(map)
        .on("click", () => onSelectBus(bus.id));
      markersRef.current[bus.id] = marker;
    });

    mapRef.current = map;
    externalMapRef.current = map;
  }, [leafletReady]);

  /* React to selection change */
  useEffect(() => {
    if (!leafletReady || !mapRef.current) return;
    const L = window.L;
    const map = mapRef.current;

    /* Remove old polyline & distance label */
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }
    if (distLabelRef.current) {
      map.removeLayer(distLabelRef.current);
      distLabelRef.current = null;
    }

    if (!selectedId) {
      /* Show all buses, zoom out */
      buses.forEach((bus) =>
        markersRef.current[bus.id]?.setIcon(buildIcon(bus, false, false)),
      );
      map.flyTo(COLLEGE_CENTER, 15, { duration: 1.0 });
      return;
    }

    /* Hide others, highlight selected */
    buses.forEach((bus) => {
      const isSelected = bus.id === selectedId;
      const isHidden = !isSelected;
      markersRef.current[bus.id]?.setIcon(buildIcon(bus, isSelected, isHidden));
    });

    const selBus = buses.find((b) => b.id === selectedId);
    const userLatLng = userLocation || COLLEGE_CENTER;

    /* Draw dashed polyline */
    const poly = L.polyline([selBus.coords, userLatLng], {
      color: "#4ade80",
      weight: 3,
      dashArray: "8 6",
      lineCap: "round",
    }).addTo(map);
    polylineRef.current = poly;

    /* Distance label at midpoint */
    const midLat = (selBus.coords[0] + userLatLng[0]) / 2;
    const midLng = (selBus.coords[1] + userLatLng[1]) / 2;
    const distKm = haversineKm(
      selBus.coords[0],
      selBus.coords[1],
      userLatLng[0],
      userLatLng[1],
    );

    const distIcon = L.divIcon({
      className: "",
      html: `<div class="bt-dist-label"><i class='bx bx-ruler'></i> ${distKm} km</div>`,
      iconSize: [90, 28],
      iconAnchor: [45, 14],
    });
    distLabelRef.current = L.marker([midLat, midLng], {
      icon: distIcon,
      interactive: false,
    }).addTo(map);

    /* Fit both in view */
    map.fitBounds(L.latLngBounds([selBus.coords, userLatLng]), {
      padding: [60, 60],
      maxZoom: 17,
      animate: true,
      duration: 0.9,
    });
  }, [selectedId, leafletReady, userLocation]);

  /* User location marker */
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
    <div
      ref={divRef}
      className={`bt-leaflet-map${selectedId ? " bt-leaflet-map--expanded" : ""}`}
    >
      {!leafletReady && (
        <div className="bt-map-loading">
          <i className="bx bx-loader-alt bx-spin" />
          <span>Loading map…</span>
        </div>
      )}
    </div>
  );
}

/* ── Main ── */
export default function BusTracking() {
  const [selectedId, setSelectedId] = useState(null);
  const [liveTime, setLiveTime] = useState(new Date());
  const [userLocation, setUserLocation] = useState(null);
  const [locationLabel, setLocationLabel] = useState(null);
  const leafletMapRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
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

  const handleSelectBus = (id) => {
    const next = selectedId === id ? null : id;
    setSelectedId(next);
    /* Scroll list into view when selecting */
    if (next && listRef.current) {
      setTimeout(
        () =>
          listRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        300,
      );
    }
  };

  return (
    <div className="bt-root">
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
        selectedId={selectedId}
        onSelectBus={handleSelectBus}
        userLocation={userLocation}
        mapRef={leafletMapRef}
      />

      {/* Location strip */}
      {locationLabel && (
        <div className="bt-loc-strip">
          <i className="bx bx-map-pin" />
          <span>{locationLabel}</span>
        </div>
      )}

      {/* Selected bus info strip */}
      {selectedId &&
        (() => {
          const bus = busData.find((b) => b.id === selectedId);
          const st = statusConfig[bus.status];
          const userLatLng = userLocation || COLLEGE_CENTER;
          const dist =
            bus.status !== "notstarted"
              ? haversineKm(
                  bus.coords[0],
                  bus.coords[1],
                  userLatLng[0],
                  userLatLng[1],
                )
              : null;
          return (
            <div className="bt-selected-strip">
              <div className="bt-ss-left">
                <span className="bt-ss-id">{bus.id}</span>
                <div className="bt-ss-info">
                  <span className="bt-ss-route">{bus.route}</span>
                  <div className="bt-ss-meta">
                    <span
                      className="bt-status"
                      style={{ color: st.color, background: st.bg }}
                    >
                      {st.label}
                    </span>
                    {dist && (
                      <span className="bt-ss-dist">
                        <i className="bx bx-ruler" /> {dist} km from you
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                className="bt-ss-close"
                onClick={() => setSelectedId(null)}
              >
                <i className="bx bx-x" />
              </button>
            </div>
          );
        })()}

      <div className="bt-pull-handle">
        <span />
      </div>

      {/* Bus list */}
      <div className="bt-list-section" ref={listRef}>
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
            const isSelected = selectedId === bus.id;

            return (
              <button
                key={bus.id}
                className={`bt-card ${isSelected ? "bt-card--selected" : ""}`}
                onClick={() => handleSelectBus(bus.id)}
              >
                <div
                  className="bt-bus-badge"
                  style={{ borderColor: isSelected ? st.color : undefined }}
                >
                  <i
                    className="bx bxs-bus"
                    style={{ color: isSelected ? st.color : undefined }}
                  />
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
                    <div className="bt-card-meta">
                      <i className="bx bx-time-five" /> {bus.eta} min
                      <span className="bt-sep">·</span>
                      <i className="bx bx-map-pin" /> {bus.distance}
                      <span className="bt-sep">·</span>
                      <i className="bx bx-navigation" /> {bus.nextStop}
                    </div>
                  ) : (
                    <div className="bt-card-meta">
                      <i className="bx bx-time" /> {bus.departure} →{" "}
                      {bus.arrival}
                    </div>
                  )}
                </div>

                <i
                  className={`bx bx-chevron-right bt-chevron${isSelected ? " bt-chevron--active" : ""}`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
