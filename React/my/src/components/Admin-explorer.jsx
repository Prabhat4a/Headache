import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import "boxicons/css/boxicons.min.css";

/* ─── Initial Data ──────────────────────────────────────── */
const INITIAL_EVENTS = [
  {
    id: 0,
    img: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=400&h=600&fit=crop",
    badge: "Featured",
    badgeType: "default",
    date: "Fri, 15 Mar, 10:00 AM",
    title: "Annual Tech Fest 2024 - Innovation Unleashed",
    location: "Main Auditorium",
  },
  {
    id: 1,
    img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=600&fit=crop",
    badge: "Register before 10 Mar",
    badgeType: "promo",
    date: "Mon, 18 Mar, 9:00 AM",
    title: "Google Campus Placement Drive",
    location: "Seminar Hall B",
  },
  {
    id: 2,
    img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=600&fit=crop",
    badge: null,
    badgeType: null,
    date: "Sat, 23 Mar, 6:00 PM",
    title: "Spring Cultural Fest - Rhythm 2024",
    location: "Open Air Theatre",
  },
  {
    id: 3,
    img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=600&fit=crop",
    badge: "Certificate Included",
    badgeType: "promo",
    date: "Wed, 27 Mar, 2:00 PM",
    title: "AI & Machine Learning Workshop",
    location: "Computer Lab 3",
  },
  {
    id: 4,
    img: "https://images.unsplash.com/photo-1540747913346-19378d7f5d39?w=400&h=600&fit=crop",
    badge: null,
    badgeType: null,
    date: "Fri, 29 Mar, 8:00 AM",
    title: "Inter-College Cricket Tournament",
    location: "Sports Ground",
  },
  {
    id: 5,
    img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=600&fit=crop",
    badge: "24 Hrs",
    badgeType: "default",
    date: "Sat, 6 Apr, 10:00 AM",
    title: "CodeFest Hackathon 2024",
    location: "Innovation Lab",
  },
  {
    id: 6,
    img: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=600&fit=crop",
    badge: "Annual",
    badgeType: "default",
    date: "Sun, 14 Apr, 11:00 AM",
    title: "Convocation Ceremony 2024",
    location: "Convention Centre",
  },
];

const INITIAL_NOTICES = [
  {
    id: 0,
    title: "Exam Schedule Released",
    body: "End semester exams start from April 15th. Check your hall tickets.",
    time: "2 hours ago",
  },
  {
    id: 1,
    title: "Campus WiFi Maintenance",
    body: "WiFi will be unavailable in Block A on March 10th, 10 AM – 2 PM.",
    time: "5 hours ago",
  },
  {
    id: 2,
    title: "Holiday Announcement",
    body: "College will remain closed on March 25th for Holi festival.",
    time: "1 day ago",
  },
];

let nextId = 100;

/* ─── Date helpers ─── */
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDisplayDate(d, h, min, ampm) {
  if (!d) return "";
  const dayName = DAY_NAMES[d.getDay()];
  const day = d.getDate();
  const mon = MONTH_SHORT[d.getMonth()];
  const yr = d.getFullYear();
  const hStr = String(h).padStart(2, "0");
  const mStr = String(min).padStart(2, "0");
  return `${dayName}, ${day} ${mon} ${yr}, ${hStr}:${mStr} ${ampm}`;
}

function parseDisplayDate(str) {
  if (!str) return null;
  const re = /(\w+),\s+(\d+)\s+(\w+)\s+(\d{4}),\s+(\d+):(\d+)\s+(AM|PM)/i;
  const m = str.match(re);
  if (!m) return null;
  const monIdx = MONTH_SHORT.findIndex(
    (x) => x.toLowerCase() === m[3].toLowerCase(),
  );
  if (monIdx === -1) return null;
  const d = new Date(parseInt(m[4]), monIdx, parseInt(m[2]));
  const h = parseInt(m[5]);
  const min = parseInt(m[6]);
  const ampm = m[7].toUpperCase();
  return { d, h, min, ampm };
}

/* ═══════════════════════════════════════════════════════════
   INJECT STYLES ONCE
═══════════════════════════════════════════════════════════ */
const STYLES = `
.ae-section-header {
  display: flex; align-items: center; gap: 10px;
  padding: 26px 20px 0; margin-bottom: 20px;
}
.ae-header-inner {
  flex: 1; display: flex; align-items: center; gap: 10px; min-width: 0;
}
.ae-header-line {
  flex: 1; height: 1.5px;
  background: linear-gradient(to right, transparent, #a78bfa55, transparent);
}
.ae-section-title {
  flex-shrink: 0; font-size: 13px; font-weight: 800; letter-spacing: 4px;
  color: #a78bfa; text-transform: uppercase; white-space: nowrap;
  text-shadow: 0 0 18px rgba(167,139,250,0.6);
}
.ae-edit-btn {
  flex-shrink: 0; height: 28px; padding: 0 10px;
  background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.4);
  border-radius: 8px; color: #ef4444; display: flex; align-items: center;
  gap: 5px; font-size: 11px; font-weight: 700; cursor: pointer;
  white-space: nowrap; font-family: inherit;
  transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
}
.ae-edit-btn i { font-size: 13px; }
.ae-edit-btn:hover {
  background: rgba(239,68,68,0.22); border-color: #ef4444;
  box-shadow: 0 0 10px rgba(239,68,68,0.25);
}
.ae-section-heading { padding: 0 20px; margin: 4px 0 14px; font-size: 17px; font-weight: 600; color: #fff; }
.ae-spotlight { margin-bottom: 32px; }
.ae-carousel { width: 100%; overflow: hidden; padding: 14px 0 10px; }
.ae-track {
  display: flex; align-items: flex-start; gap: 16px; will-change: transform;
  cursor: grab; user-select: none; -webkit-user-select: none; touch-action: pan-y;
}
.ae-track.dragging { cursor: grabbing; }
.ae-card {
  flex: 0 0 auto; width: 340px; background: #141414; border-radius: 20px;
  overflow: hidden; border: 1px solid #2a2a2a; transform-origin: top center;
  transform: scale(0.87); opacity: 0.5; filter: brightness(0.6);
  transition: transform 0.4s cubic-bezier(0.4,0,0.2,1),
              opacity 0.4s cubic-bezier(0.4,0,0.2,1),
              filter 0.4s cubic-bezier(0.4,0,0.2,1),
              border-color 0.4s ease, box-shadow 0.4s ease;
  -webkit-user-select: none; user-select: none;
}
.ae-card.active {
  transform: scale(1); opacity: 1; filter: brightness(1);
  border-color: #a78bfa; box-shadow: 0 12px 48px rgba(167,139,250,0.2);
}
.ae-card-img { position: relative; width: 100%; height: 320px; overflow: hidden; background: #0d0d0d; }
.ae-card-img img {
  width: 100%; height: 100%; object-fit: cover; pointer-events: none;
  -webkit-user-drag: none; opacity: 0; transform: scale(1);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.ae-card-img img.loaded { opacity: 1; }
.ae-card.active .ae-card-img img { transform: scale(1.04); }
.ae-overlay {
  position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 50%, transparent 100%);
}
.ae-badge {
  position: absolute; top: 14px; left: 14px; background: #a78bfa; color: #000;
  padding: 5px 12px; border-radius: 20px; font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.8px;
}
.ae-badge.promo {
  background: rgba(255,255,255,0.9); top: auto; bottom: 90px;
  left: 14px; right: 14px; text-align: center; border-radius: 8px;
}
.ae-card-info { padding: 14px; position: relative; min-height: 96px; }
.ae-card-date { font-size: 11px; color: #555; margin-bottom: 6px; font-weight: 500; }
.ae-card-title {
  font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 8px;
  line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
}
.ae-card-loc { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #555; }
.ae-card-loc i { color: #a78bfa; font-size: 14px; }
.ae-bookmark {
  position: absolute; bottom: 12px; right: 12px; width: 32px; height: 32px;
  border-radius: 50%; background: #1e1e1e; border: 1px solid #2a2a2a;
  color: #888; display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 15px; transition: all 0.2s ease;
}
.ae-bookmark:hover { background: #2a2a2a; color: #fff; }
.ae-bookmark.saved { background: #a78bfa; border-color: #a78bfa; color: #000; }
.ae-controls {
  display: flex; align-items: center; justify-content: center;
  gap: 14px; padding: 14px 20px 0;
}
.ae-arrow {
  flex-shrink: 0; width: 32px; height: 32px; border-radius: 50%;
  background: transparent; border: 1.5px solid #333; color: #666;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 19px; outline: none; transition: all 0.2s ease;
}
.ae-arrow:hover:not(:disabled) { border-color: #a78bfa; color: #a78bfa; background: rgba(167,139,250,0.08); }
.ae-arrow:disabled { opacity: 0.2; cursor: not-allowed; pointer-events: none; }
.ae-dots { display: flex; align-items: center; gap: 6px; }
.ae-dot {
  width: 7px; height: 7px; border-radius: 50%; background: #2a2a2a;
  cursor: pointer; transition: all 0.3s ease; flex-shrink: 0;
}
.ae-dot.active { background: #a78bfa; width: 22px; border-radius: 4px; }
.ae-notices-section { padding: 0 20px; margin-bottom: 32px; }
.ae-notices-list { background: #111; border: 1px solid #1e1e1e; border-radius: 14px; overflow: hidden; }
.ae-notice-item { padding: 14px 16px; border-bottom: 1px solid #1a1a1a; transition: background 0.15s; }
.ae-notice-item:last-child { border-bottom: none; }
.ae-notice-item:hover { background: #141414; }
.ae-notice-item h4 { font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 4px; }
.ae-notice-item p { font-size: 12px; color: #666; line-height: 1.5; margin-bottom: 5px; }
.ae-notice-time { font-size: 10px; color: #444; font-weight: 500; }
.ae-bus-card { background: #111; border-radius: 14px; padding: 20px; margin: 0 20px 20px; border: 1px solid #1e1e1e; }

/* ── Edit page shell ── */
.ep-root {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  z-index: 9999; background: #0a0a0a;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #fff; display: flex; flex-direction: column; overflow: hidden;
}
.ep-header {
  flex-shrink: 0; background: #000; padding: 15px 20px;
  display: flex; align-items: center; gap: 14px; border-bottom: 1px solid #1a1a1a;
}
.ep-back {
  background: #1a1a1a; border: 1px solid #2a2a2a; color: #aaa;
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 18px; flex-shrink: 0; transition: all 0.2s;
}
.ep-back:hover { border-color: #a78bfa; color: #a78bfa; }
.ep-title { flex: 1; font-size: 17px; font-weight: 700; color: #fff; }
.ep-save {
  background: #a78bfa; border: none; color: #000; padding: 8px 20px;
  border-radius: 20px; font-size: 13px; font-weight: 700; cursor: pointer;
  flex-shrink: 0; font-family: inherit; transition: opacity 0.2s;
}
.ep-save:hover { opacity: 0.85; }
.ep-content {
  flex: 1; overflow-y: auto; overflow-x: hidden;
  -webkit-overflow-scrolling: touch; overscroll-behavior: contain;
  padding: 16px 16px 12px; display: flex; flex-direction: column; gap: 12px;
}
.ep-footer { flex-shrink: 0; padding: 14px 16px; background: #0a0a0a; border-top: 1px solid #1a1a1a; }
.ep-add-btn {
  width: 100%; background: #111; border: 1.5px dashed #a78bfa; color: #a78bfa;
  border-radius: 14px; padding: 14px; font-size: 14px; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  gap: 8px; font-family: inherit; transition: background 0.2s;
}
.ep-add-btn:hover { background: rgba(167,139,250,0.08); }
.ep-add-btn i { font-size: 18px; }
.ep-event-row {
  background: #111; border: 1px solid #1e1e1e; border-radius: 14px;
  padding: 12px; display: flex; align-items: center; gap: 12px;
}
.ep-thumb { width: 64px; height: 64px; border-radius: 10px; overflow: hidden; flex-shrink: 0; background: #1a1a1a; }
.ep-thumb img { width: 100%; height: 100%; object-fit: cover; }
.ep-info { flex: 1; min-width: 0; }
.ep-info-title { font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ep-info-date { font-size: 11px; color: #555; margin-bottom: 2px; }
.ep-info-loc { font-size: 11px; color: #555; display: flex; align-items: center; gap: 3px; }
.ep-info-loc i { color: #a78bfa; font-size: 12px; }
.ep-notice-row {
  background: #111; border: 1px solid #1e1e1e; border-radius: 14px;
  padding: 14px; display: flex; align-items: flex-start; gap: 12px;
}
.ep-notice-info { flex: 1; min-width: 0; }
.ep-notice-title { font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 4px; }
.ep-notice-body { font-size: 12px; color: #666; line-height: 1.4; margin-bottom: 4px; }
.ep-notice-time { font-size: 10px; color: #444; }
.ep-row-actions { display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; }
.ep-update-btn {
  background: rgba(167,139,250,0.12); border: 1px solid rgba(167,139,250,0.3);
  color: #a78bfa; border-radius: 8px; padding: 6px 10px; font-size: 11px;
  font-weight: 600; cursor: pointer; display: flex; align-items: center;
  gap: 4px; white-space: nowrap; font-family: inherit; transition: background 0.2s;
}
.ep-update-btn:hover { background: rgba(167,139,250,0.22); }
.ep-delete-btn {
  background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
  color: #ef4444; border-radius: 8px; padding: 6px 10px; font-size: 11px;
  font-weight: 600; cursor: pointer; display: flex; align-items: center;
  gap: 4px; white-space: nowrap; font-family: inherit; transition: background 0.2s;
}
.ep-delete-btn:hover { background: rgba(239,68,68,0.2); }

/* ── Bottom sheet ── */
.ep-backdrop {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 10000;
  background: rgba(0,0,0,0.75); backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px);
}
.ep-sheet {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 10001;
  background: #161616; border-top: 1px solid #2a2a2a;
  border-radius: 22px 22px 0 0; display: flex; flex-direction: column;
  max-height: 88vh; max-height: 88dvh;
  animation: epSheetUp 0.32s cubic-bezier(0.32,0.72,0,1);
}
@keyframes epSheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.ep-sheet-handle {
  width: 40px; height: 4px; border-radius: 2px; background: #333;
  align-self: center; margin: 12px 0 4px; flex-shrink: 0;
}
.ep-sheet-title {
  font-size: 14px; font-weight: 700; color: #a78bfa;
  display: flex; align-items: center; gap: 7px;
  padding: 0 20px 12px; border-bottom: 1px solid #1e1e1e; flex-shrink: 0;
}
.ep-sheet-title i { font-size: 16px; }
.ep-sheet-body {
  flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain; padding: 16px 20px 0;
  display: flex; flex-direction: column; gap: 12px;
}
.ep-sheet-actions {
  flex-shrink: 0; display: flex; gap: 10px;
  padding: 14px 20px 24px; border-top: 1px solid #1e1e1e; background: #161616;
}
.ep-sheet-cancel {
  flex: 1; background: #1e1e1e; border: 1px solid #2a2a2a; border-radius: 10px;
  color: #888; padding: 13px; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: background 0.2s;
}
.ep-sheet-cancel:hover { background: #252525; }
.ep-sheet-apply {
  flex: 1; background: #a78bfa; border: none; border-radius: 10px;
  color: #000; padding: 13px; font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: opacity 0.2s;
}
.ep-sheet-apply:hover { opacity: 0.88; }

/* ── Form fields ── */
.ep-field { display: flex; flex-direction: column; gap: 5px; }
.ep-label { font-size: 10px; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.8px; }
.ep-input {
  background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 10px;
  padding: 11px 13px; color: #fff; font-size: 13px; outline: none;
  font-family: inherit; width: 100%; transition: border-color 0.2s; box-sizing: border-box;
}
.ep-input:focus { border-color: #a78bfa; }
.ep-textarea { resize: vertical; min-height: 80px; }
.ep-img-wrap { display: flex; flex-direction: column; gap: 10px; }
.ep-img-preview { width: 100%; height: 140px; border-radius: 10px; overflow: hidden; background: #1a1a1a; border: 1px solid #2a2a2a; }
.ep-img-preview img { width: 100%; height: 100%; object-fit: cover; }
.ep-img-btn {
  background: #1a1a1a; border: 1.5px dashed #a78bfa; color: #a78bfa;
  border-radius: 10px; padding: 11px; font-size: 13px; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  gap: 8px; width: 100%; font-family: inherit; transition: background 0.2s;
}
.ep-img-btn:hover { background: rgba(167,139,250,0.08); }
.ep-img-btn i { font-size: 18px; }

/* ── Confirm dialog ── */
.ep-confirm-bg {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 10002;
  background: rgba(0,0,0,0.88); display: flex; align-items: center;
  justify-content: center; padding: 24px; backdrop-filter: blur(8px);
}
.ep-confirm-box {
  background: #141414; border: 1px solid #2a2a2a; border-radius: 20px;
  padding: 28px 24px 20px; width: 100%; max-width: 340px; text-align: center;
}
.ep-confirm-icon { font-size: 40px; color: #ef4444; margin-bottom: 12px; line-height: 1; }
.ep-confirm-msg { font-size: 14px; color: #ccc; line-height: 1.6; margin-bottom: 20px; }
.ep-confirm-actions { display: flex; gap: 10px; }
.ep-confirm-cancel {
  flex: 1; background: #1e1e1e; border: 1px solid #2a2a2a; border-radius: 10px;
  color: #888; padding: 11px; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: inherit;
}
.ep-confirm-ok {
  flex: 1; background: #ef4444; border: none; border-radius: 10px;
  color: #fff; padding: 11px; font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: opacity 0.2s;
}
.ep-confirm-ok:hover { opacity: 0.85; }

/* ── Toast ── */
.ep-toast {
  position: fixed; top: 70px; left: 50%; transform: translateX(-50%);
  background: #1a1a1a; border: 1px solid #ef4444; color: #ef4444;
  font-size: 12px; font-weight: 600; padding: 10px 18px; border-radius: 20px;
  z-index: 10003; display: flex; align-items: center; gap: 8px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.7); max-width: 90vw;
  text-align: center; white-space: normal; animation: epToastIn 0.25s ease;
}
.ep-toast i { font-size: 15px; flex-shrink: 0; }
@keyframes epToastIn {
  from { opacity:0; transform: translateX(-50%) translateY(-8px); }
  to   { opacity:1; transform: translateX(-50%) translateY(0); }
}

/* ══════════════════════════════════════════
   DUAL DATE-TIME INPUT
══════════════════════════════════════════ */
.edt-wrap { display: flex; flex-direction: column; gap: 6px; }
.edt-row  { display: flex; gap: 8px; align-items: stretch; }

.edt-text-input {
  flex: 1; min-width: 0;
  background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 10px;
  padding: 11px 13px; color: #fff; font-size: 13px;
  outline: none; font-family: inherit; transition: border-color 0.2s; box-sizing: border-box;
}
.edt-text-input:focus { border-color: #a78bfa; }
.edt-text-input::placeholder { color: #3d3d3d; }

.edt-cal-btn {
  flex-shrink: 0; width: 44px;
  background: rgba(167,139,250,0.1); border: 1px solid rgba(167,139,250,0.3);
  border-radius: 10px; color: #a78bfa;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 18px; transition: background 0.2s, border-color 0.2s;
}
.edt-cal-btn:hover { background: rgba(167,139,250,0.2); border-color: #a78bfa; }
.edt-hint { font-size: 10px; color: #444; font-style: italic; }

/* ══════════════════════════════════════════
   DATE-TIME PICKER (DTP)
══════════════════════════════════════════ */
.dtp-overlay {
  position: fixed; inset: 0; z-index: 10010;
  background: rgba(0,0,0,0.82);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
  animation: dtpFadeIn 0.18s ease;
}
@keyframes dtpFadeIn { from { opacity:0; } to { opacity:1; } }

.dtp-card {
  width: 100%; max-width: 340px;
  background: #111; border: 1px solid #2a2a2a; border-radius: 20px;
  overflow: hidden; box-shadow: 0 24px 64px rgba(0,0,0,0.9);
  animation: dtpSlideUp 0.22s cubic-bezier(0.32,0.72,0,1);
  display: flex; flex-direction: column;
  max-height: 90vh; max-height: 90dvh;
}
@keyframes dtpSlideUp {
  from { opacity:0; transform: translateY(14px) scale(0.97); }
  to   { opacity:1; transform: translateY(0) scale(1); }
}

/* Header */
.dtp-head {
  flex-shrink: 0; display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px 12px; border-bottom: 1px solid #1c1c1c; background: #111;
}
.dtp-head-title { font-size: 14px; font-weight: 700; color: #a78bfa; display: flex; align-items: center; gap: 7px; }
.dtp-head-title i { font-size: 16px; }
.dtp-close-btn {
  background: none; border: none; color: #555; font-size: 22px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border-radius: 8px;
  transition: color 0.15s, background 0.15s; padding: 0;
}
.dtp-close-btn:hover { color: #fff; background: #1e1e1e; }

/* Calendar body — scrollable */
.dtp-cal-body {
  flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch;
  padding: 12px 14px 10px;
}

/* Year row */
.dtp-nav-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px; }
.dtp-month-row { margin-bottom: 12px; }

.dtp-nav-btn {
  background: none; border: none; color: #a78bfa; font-size: 22px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; border-radius: 9px; transition: background 0.15s; padding: 0; flex-shrink: 0;
}
.dtp-nav-btn:hover { background: rgba(167,139,250,0.12); }

/* Year — click to type, type to confirm */
.dtp-year-btn {
  background: none; border: none; font-size: 17px; font-weight: 800;
  color: #a78bfa; cursor: pointer; padding: 4px 10px; border-radius: 7px;
  transition: background 0.15s; font-family: inherit; letter-spacing: 0.4px;
}
.dtp-year-btn:hover { background: rgba(167,139,250,0.1); }
.dtp-year-input {
  background: #1a1a1a; border: 1px solid #a78bfa; border-radius: 7px;
  color: #a78bfa; font-size: 17px; font-weight: 800;
  text-align: center; width: 76px; padding: 4px 6px;
  outline: none; font-family: inherit;
}

.dtp-month-label { font-size: 17px; font-weight: 700; color: #e0e0e0; }

/* Day names */
.dtp-day-names { display: grid; grid-template-columns: repeat(7,1fr); margin-bottom: 4px; text-align: center; }
.dtp-day-names span { font-size: 12px; font-weight: 700; color: #555; text-transform: uppercase; padding: 3px 0; }

/* Day grid */
.dtp-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 2px; }
.dtp-day {
  aspect-ratio: 1; border: none; background: none; color: #bbb;
  font-size: 14px; font-weight: 500; cursor: pointer; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  font-family: inherit; transition: background 0.12s, color 0.12s;
  padding: 0; -webkit-tap-highlight-color: transparent; line-height: 1;
}
.dtp-day:hover { background: rgba(167,139,250,0.13); color: #a78bfa; }
.dtp-day.dtp-today { color: #a78bfa; font-weight: 700; position: relative; }
.dtp-day.dtp-today::after {
  content: ""; position: absolute; bottom: 3px; left: 50%;
  transform: translateX(-50%); width: 4px; height: 4px;
  border-radius: 50%; background: #a78bfa;
}
.dtp-day.dtp-selected { background: #a78bfa !important; color: #000 !important; font-weight: 700; box-shadow: 0 0 10px rgba(167,139,250,0.35); }
.dtp-day.dtp-selected.dtp-today::after { background: #000; }
.dtp-day.dtp-empty { pointer-events: none; }

/* Divider */
.dtp-divider { height: 1px; background: #1e1e1e; margin: 0 12px; flex-shrink: 0; }

/* Time row */
.dtp-time-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 11px 16px; background: #0a0a0a; gap: 8px; flex-shrink: 0;
}
.dtp-time-label {
  display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700;
  color: #555; text-transform: uppercase; letter-spacing: 0.7px; flex-shrink: 0;
}
.dtp-time-label i { font-size: 15px; color: #a78bfa; }
.dtp-time-controls { display: flex; align-items: center; gap: 5px; flex-shrink: 0; }
.dtp-spinner { display: flex; flex-direction: column; align-items: center; gap: 2px; touch-action: none; }
.dtp-spin-btn {
  background: none; border: none; color: #888; font-size: 22px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  width: 38px; height: 26px; border-radius: 7px;
  transition: color 0.12s, background 0.12s; padding: 0;
}
.dtp-spin-btn:hover { color: #a78bfa; background: rgba(167,139,250,0.14); }

/* Click spinner value to type it */
.dtp-spin-val {
  font-size: 24px; font-weight: 800; color: #fff; min-width: 38px;
  text-align: center; font-variant-numeric: tabular-nums;
  letter-spacing: 1px; line-height: 1; padding: 2px;
  cursor: pointer; border-radius: 6px; transition: background 0.12s;
}
.dtp-spin-val:hover { background: rgba(167,139,250,0.08); }
.dtp-spin-input {
  font-size: 24px; font-weight: 800; color: #a78bfa; width: 38px;
  text-align: center; background: rgba(167,139,250,0.1);
  border: 1px solid rgba(167,139,250,0.4); border-radius: 6px;
  outline: none; padding: 1px 0; font-family: inherit;
  font-variant-numeric: tabular-nums; letter-spacing: 1px; line-height: 1;
}
.dtp-colon { font-size: 22px; font-weight: 800; color: #a78bfa; opacity: 0.7; padding-bottom: 2px; }
.dtp-ampm {
  background: rgba(167,139,250,0.09); border: 1px solid rgba(167,139,250,0.25);
  color: #a78bfa; font-size: 12px; font-weight: 800; padding: 7px 12px;
  border-radius: 8px; cursor: pointer; letter-spacing: 0.4px; margin-left: 4px;
  font-family: inherit; transition: background 0.12s, border-color 0.12s; line-height: 1;
}
.dtp-ampm:hover { background: rgba(167,139,250,0.18); border-color: rgba(167,139,250,0.45); }

/* Footer */
.dtp-footer {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: 10px 16px 14px; border-top: 1px solid #1e1e1e;
  background: #0d0d0d; flex-shrink: 0; flex-wrap: wrap;
}
.dtp-preview {
  flex: 1; font-size: 12px; font-weight: 600; color: #a78bfa;
  display: flex; align-items: center; gap: 5px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0;
}
.dtp-preview i { font-size: 14px; flex-shrink: 0; }
.dtp-footer-btns { display: flex; gap: 8px; flex-shrink: 0; }
.dtp-cancel-btn {
  background: #1e1e1e; border: 1px solid #2a2a2a; color: #777; border-radius: 9px;
  padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer;
  transition: background 0.15s; font-family: inherit;
}
.dtp-cancel-btn:hover { background: #252525; }
.dtp-confirm-btn {
  background: #a78bfa; border: none; color: #000; border-radius: 9px;
  padding: 8px 18px; font-size: 13px; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; gap: 5px;
  transition: opacity 0.15s; font-family: inherit;
}
.dtp-confirm-btn:hover { opacity: 0.88; }
.dtp-confirm-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.dtp-confirm-btn i { font-size: 15px; }

/* Mobile — bottom sheet style */
@media (max-width: 480px) {
  .ae-card { width: 300px; } .ae-card-img { height: 290px; } .ae-track { gap: 12px; }
  .ep-sheet { max-height: 92vh; max-height: 92dvh; }
  .dtp-overlay { align-items: flex-end; padding: 0; }
  .dtp-card {
    max-width: 100%; max-height: 88dvh;
    border-radius: 20px 20px 0 0; overflow: hidden;
    display: flex; flex-direction: column;
    animation: dtpSlideUpMobile 0.25s cubic-bezier(0.32,0.72,0,1);
  }
  @keyframes dtpSlideUpMobile { from { transform: translateY(100%); } to { transform: translateY(0); } }
  .dtp-cal-body { flex: 1; overflow-y: auto; padding: 10px 12px 8px; }
  .dtp-footer { padding-bottom: max(14px, env(safe-area-inset-bottom, 14px)); }
}
@media (min-width: 481px) and (max-width: 767px) { .ae-card { width: 340px; } .ae-card-img { height: 310px; } }
@media (min-width: 768px)  { .ae-card { width: 400px; } .ae-card-img { height: 340px; } .ae-track { gap: 20px; } }
@media (min-width: 1024px) { .ae-card { width: 460px; } .ae-card-img { height: 360px; } .ae-track { gap: 28px; } }
`;

if (!document.getElementById("ae-styles")) {
  const tag = document.createElement("style");
  tag.id = "ae-styles";
  tag.textContent = STYLES;
  document.head.appendChild(tag);
}

/* ═══════════════════════════════════════════════════════════
   DATE-TIME PICKER COMPONENT
   — calendar + time spinners (click value to type it)
═══════════════════════════════════════════════════════════ */
function DateTimePicker({ onConfirm, onClose, initialDate }) {
  const today = new Date();
  const parsed = parseDisplayDate(initialDate);

  const [viewYear, setViewYear] = useState(
    parsed?.d?.getFullYear() ?? today.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    parsed?.d?.getMonth() ?? today.getMonth(),
  );
  const [selDate, setSelDate] = useState(parsed?.d ?? null);
  const [hour, setHour] = useState(parsed?.h ?? 10);
  const [minute, setMinute] = useState(parsed?.min ?? 0);
  const [ampm, setAmpm] = useState(parsed?.ampm ?? "AM");

  // inline edit states
  const [editYear, setEditYear] = useState(false);
  const [yearTmp, setYearTmp] = useState(String(viewYear));
  const [editHour, setEditHour] = useState(false);
  const [hourTmp, setHourTmp] = useState(String(hour));
  const [editMin, setEditMin] = useState(false);
  const [minTmp, setMinTmp] = useState(String(minute).padStart(2, "0"));

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMon = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMon; d++) cells.push(d);

  const isToday = (d) =>
    d === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear();
  const isSelected = (d) =>
    selDate &&
    d === selDate.getDate() &&
    viewMonth === selDate.getMonth() &&
    viewYear === selDate.getFullYear();

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  // Year inline edit
  const commitYear = () => {
    const y = parseInt(yearTmp);
    if (!isNaN(y) && y > 1900 && y < 2200) setViewYear(y);
    else setYearTmp(String(viewYear));
    setEditYear(false);
  };

  // Hour spinner + inline edit
  const adjHour = (d) => {
    let h = hour + d;
    if (h < 1) h = 12;
    if (h > 12) h = 1;
    setHour(h);
    setHourTmp(String(h).padStart(2, "0"));
  };
  const commitHour = () => {
    const v = parseInt(hourTmp);
    if (!isNaN(v) && v >= 1 && v <= 12) setHour(v);
    else setHourTmp(String(hour).padStart(2, "0"));
    setEditHour(false);
  };

  // Minute spinner + inline edit
  const adjMin = (d) => {
    let m = minute + d;
    if (m < 0) m = 59;
    if (m > 59) m = 0;
    setMinute(m);
    setMinTmp(String(m).padStart(2, "0"));
  };
  const commitMin = () => {
    const v = parseInt(minTmp);
    if (!isNaN(v) && v >= 0 && v <= 59) setMinute(v);
    else setMinTmp(String(minute).padStart(2, "0"));
    setEditMin(false);
  };

  const previewStr = selDate
    ? formatDisplayDate(selDate, hour, minute, ampm)
    : "";

  return createPortal(
    <div
      className="dtp-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dtp-card">
        {/* ── Header ── */}
        <div className="dtp-head">
          <div className="dtp-head-title">
            <i className="bx bx-calendar" /> Pick Date &amp; Time
          </div>
          <button className="dtp-close-btn" onClick={onClose}>
            <i className="bx bx-x" />
          </button>
        </div>

        {/* ── Calendar ── */}
        <div className="dtp-cal-body">
          {/* Year row — click year to type */}
          <div className="dtp-nav-row">
            <button
              className="dtp-nav-btn"
              onClick={() => {
                setViewYear((y) => y - 1);
                setYearTmp(String(viewYear - 1));
              }}
            >
              <i className="bx bx-chevron-left" />
            </button>
            {editYear ? (
              <input
                className="dtp-year-input"
                autoFocus
                value={yearTmp}
                onChange={(e) => setYearTmp(e.target.value)}
                onBlur={commitYear}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitYear();
                  if (e.key === "Escape") {
                    setEditYear(false);
                    setYearTmp(String(viewYear));
                  }
                }}
              />
            ) : (
              <button
                className="dtp-year-btn"
                onClick={() => {
                  setEditYear(true);
                  setYearTmp(String(viewYear));
                }}
              >
                {viewYear}
              </button>
            )}
            <button
              className="dtp-nav-btn"
              onClick={() => {
                setViewYear((y) => y + 1);
                setYearTmp(String(viewYear + 1));
              }}
            >
              <i className="bx bx-chevron-right" />
            </button>
          </div>

          {/* Month row */}
          <div className="dtp-nav-row dtp-month-row">
            <button className="dtp-nav-btn" onClick={prevMonth}>
              <i className="bx bx-chevron-left" />
            </button>
            <span className="dtp-month-label">{MONTHS[viewMonth]}</span>
            <button className="dtp-nav-btn" onClick={nextMonth}>
              <i className="bx bx-chevron-right" />
            </button>
          </div>

          {/* Day names */}
          <div className="dtp-day-names">
            {DAYS_SHORT.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          {/* Day grid */}
          <div className="dtp-grid">
            {cells.map((d, i) =>
              d === null ? (
                <div key={`e${i}`} className="dtp-day dtp-empty" />
              ) : (
                <button
                  key={d}
                  className={`dtp-day${isToday(d) ? " dtp-today" : ""}${isSelected(d) ? " dtp-selected" : ""}`}
                  onClick={() => setSelDate(new Date(viewYear, viewMonth, d))}
                >
                  {d}
                </button>
              ),
            )}
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="dtp-divider" />

        {/* ── Time row ── */}
        <div className="dtp-time-row">
          <div className="dtp-time-label">
            <i className="bx bx-time" /> Time
          </div>
          <div className="dtp-time-controls">
            {/* Hour spinner — click value to type */}
            <div className="dtp-spinner">
              <button className="dtp-spin-btn" onClick={() => adjHour(1)}>
                <i className="bx bx-chevron-up" />
              </button>
              {editHour ? (
                <input
                  className="dtp-spin-input"
                  autoFocus
                  value={hourTmp}
                  onChange={(e) => setHourTmp(e.target.value)}
                  onBlur={commitHour}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitHour();
                    if (e.key === "Escape") {
                      setEditHour(false);
                      setHourTmp(String(hour).padStart(2, "0"));
                    }
                  }}
                />
              ) : (
                <span
                  className="dtp-spin-val"
                  onClick={() => {
                    setEditHour(true);
                    setHourTmp(String(hour).padStart(2, "0"));
                  }}
                >
                  {String(hour).padStart(2, "0")}
                </span>
              )}
              <button className="dtp-spin-btn" onClick={() => adjHour(-1)}>
                <i className="bx bx-chevron-down" />
              </button>
            </div>

            <span className="dtp-colon">:</span>

            {/* Minute spinner — click value to type */}
            <div className="dtp-spinner">
              <button className="dtp-spin-btn" onClick={() => adjMin(1)}>
                <i className="bx bx-chevron-up" />
              </button>
              {editMin ? (
                <input
                  className="dtp-spin-input"
                  autoFocus
                  value={minTmp}
                  onChange={(e) => setMinTmp(e.target.value)}
                  onBlur={commitMin}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitMin();
                    if (e.key === "Escape") {
                      setEditMin(false);
                      setMinTmp(String(minute).padStart(2, "0"));
                    }
                  }}
                />
              ) : (
                <span
                  className="dtp-spin-val"
                  onClick={() => {
                    setEditMin(true);
                    setMinTmp(String(minute).padStart(2, "0"));
                  }}
                >
                  {String(minute).padStart(2, "0")}
                </span>
              )}
              <button className="dtp-spin-btn" onClick={() => adjMin(-1)}>
                <i className="bx bx-chevron-down" />
              </button>
            </div>

            {/* AM / PM toggle */}
            <button
              className="dtp-ampm"
              onClick={() => setAmpm((a) => (a === "AM" ? "PM" : "AM"))}
            >
              {ampm}
            </button>
          </div>
        </div>

        {/* ── Footer — preview + confirm ── */}
        <div className="dtp-footer">
          <div className="dtp-preview">
            {previewStr ? (
              <>
                <i className="bx bx-check-circle" />
                {previewStr}
              </>
            ) : (
              <span style={{ color: "#333" }}>Select a date above</span>
            )}
          </div>
          <div className="dtp-footer-btns">
            <button className="dtp-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              className="dtp-confirm-btn"
              disabled={!selDate}
              onClick={() => {
                onConfirm(previewStr);
              }}
            >
              <i className="bx bx-check" /> Set
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ═══════════════════════════════════════════════════════════
   DUAL DATE-TIME INPUT
   — text field  +  calendar button  (both stay in sync)
═══════════════════════════════════════════════════════════ */
function DateTimeInput({ value, onChange }) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="edt-wrap">
      <div className="edt-row">
        {/* Free-type text field */}
        <input
          className="edt-text-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Fri, 15 Mar 2026, 10:00 AM"
        />
        {/* Calendar picker button */}
        <button
          type="button"
          className="edt-cal-btn"
          onClick={() => setShowPicker(true)}
          title="Open calendar picker"
        >
          <i className="bx bx-calendar" />
        </button>
      </div>
      <span className="edt-hint">
        Type directly · or tap 📅 to pick from calendar
      </span>

      {showPicker && (
        <DateTimePicker
          initialDate={value}
          onConfirm={(val) => {
            onChange(val);
            setShowPicker(false);
          }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}

/* ─── Image Upload ─── */
function ImageUpload({ value, onChange }) {
  const ref = useRef(null);
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div className="ep-img-wrap">
      {value && (
        <div className="ep-img-preview">
          <img src={value} alt="preview" />
        </div>
      )}
      <button
        type="button"
        className="ep-img-btn"
        onClick={() => ref.current.click()}
      >
        <i className="bx bx-image-add" />
        {value ? "Change Image" : "Upload Image"}
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFile}
      />
    </div>
  );
}

/* ─── Bottom Sheet (portal) ─── */
function BottomSheet({ title, icon, children, onClose, onApply, applyLabel }) {
  return createPortal(
    <>
      <div className="ep-backdrop" onClick={onClose} />
      <div className="ep-sheet">
        <div className="ep-sheet-handle" />
        <div className="ep-sheet-title">
          <i className={`bx ${icon}`} />
          {title}
        </div>
        <div className="ep-sheet-body">{children}</div>
        <div className="ep-sheet-actions">
          <button className="ep-sheet-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="ep-sheet-apply" onClick={onApply}>
            {applyLabel}
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}

/* ─── Confirm Dialog (portal) ─── */
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return createPortal(
    <div className="ep-confirm-bg">
      <div className="ep-confirm-box">
        <div className="ep-confirm-icon">
          <i className="bx bx-error-circle" />
        </div>
        <p className="ep-confirm-msg">{message}</p>
        <div className="ep-confirm-actions">
          <button className="ep-confirm-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="ep-confirm-ok" onClick={onConfirm}>
            Yes, Delete
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ─── Toast (portal) ─── */
function Toast({ msg }) {
  return createPortal(
    <div className="ep-toast">
      <i className="bx bx-error-circle" />
      {msg}
    </div>,
    document.body,
  );
}

/* ═══════════════════════════════════════════════════════════
   EDIT EVENTS PAGE  ← DateTimeInput used here
═══════════════════════════════════════════════════════════ */
function EditEventsPage({ events, onSave, onBack }) {
  const [draft, setDraft] = useState(events);
  const [sheet, setSheet] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const openUpdate = (ev) =>
    setSheet({
      mode: "update",
      id: ev.id,
      data: {
        title: ev.title,
        date: ev.date,
        location: ev.location,
        badge: ev.badge || "",
        img: ev.img,
      },
    });

  const openAdd = () =>
    setSheet({
      mode: "add",
      data: { title: "", date: "", location: "", badge: "", img: "" },
    });

  const setField = (key, val) =>
    setSheet((s) => ({ ...s, data: { ...s.data, [key]: val } }));

  const handleApply = () => {
    if (sheet.mode === "add") {
      if (!sheet.data.title.trim() || !sheet.data.date.trim()) {
        showToast("Title and Date are required.");
        return;
      }
      setDraft((p) => [
        ...p,
        {
          id: nextId++,
          img:
            sheet.data.img ||
            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=600&fit=crop",
          badge: sheet.data.badge || null,
          badgeType: sheet.data.badge ? "default" : null,
          date: sheet.data.date,
          title: sheet.data.title,
          location: sheet.data.location,
        },
      ]);
    } else {
      setDraft((p) =>
        p.map((e) =>
          e.id === sheet.id
            ? { ...e, ...sheet.data, badge: sheet.data.badge || null }
            : e,
        ),
      );
    }
    setSheet(null);
  };

  const handleDelete = (id) => {
    if (draft.length <= 1) {
      showToast("You must keep at least 1 event.");
      return;
    }
    setConfirmId(id);
  };

  return createPortal(
    <div className="ep-root">
      <div className="ep-header">
        <button className="ep-back" onClick={onBack}>
          <i className="bx bx-arrow-back" />
        </button>
        <span className="ep-title">Edit Events</span>
        <button
          className="ep-save"
          onClick={() => {
            onSave(draft);
            onBack();
          }}
        >
          Save
        </button>
      </div>

      <div className="ep-content">
        {draft.map((ev) => (
          <div className="ep-event-row" key={ev.id}>
            <div className="ep-thumb">
              <img src={ev.img} alt={ev.title} />
            </div>
            <div className="ep-info">
              <div className="ep-info-title">{ev.title}</div>
              <div className="ep-info-date">{ev.date}</div>
              <div className="ep-info-loc">
                <i className="bx bx-map" />
                {ev.location}
              </div>
            </div>
            <div className="ep-row-actions">
              <button className="ep-update-btn" onClick={() => openUpdate(ev)}>
                <i className="bx bx-edit" />
                Update
              </button>
              <button
                className="ep-delete-btn"
                onClick={() => handleDelete(ev.id)}
              >
                <i className="bx bx-trash" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="ep-footer">
        <button className="ep-add-btn" onClick={openAdd}>
          <i className="bx bx-plus" />
          Add New Event
        </button>
      </div>

      {sheet && (
        <BottomSheet
          title={sheet.mode === "add" ? "New Event" : "Update Event"}
          icon={sheet.mode === "add" ? "bx-plus-circle" : "bx-edit-alt"}
          onClose={() => setSheet(null)}
          onApply={handleApply}
          applyLabel={sheet.mode === "add" ? "Add Event" : "Apply"}
        >
          {/* Title */}
          <div className="ep-field">
            <label className="ep-label">
              {sheet.mode === "add" ? "Title *" : "Title"}
            </label>
            <input
              className="ep-input"
              value={sheet.data.title}
              onChange={(e) => setField("title", e.target.value)}
            />
          </div>

          {/* ── Date & Time — dual input (type OR pick from calendar) ── */}
          <div className="ep-field">
            <label className="ep-label">
              {sheet.mode === "add" ? "Date & Time *" : "Date & Time"}
            </label>
            <DateTimeInput
              value={sheet.data.date}
              onChange={(val) => setField("date", val)}
            />
          </div>

          {/* Location */}
          <div className="ep-field">
            <label className="ep-label">Location</label>
            <input
              className="ep-input"
              value={sheet.data.location}
              onChange={(e) => setField("location", e.target.value)}
            />
          </div>

          {/* Badge */}
          <div className="ep-field">
            <label className="ep-label">Badge Text</label>
            <input
              className="ep-input"
              value={sheet.data.badge}
              onChange={(e) => setField("badge", e.target.value)}
            />
          </div>

          {/* Image */}
          <div className="ep-field">
            <label className="ep-label">Image</label>
            <ImageUpload
              value={sheet.data.img}
              onChange={(v) => setField("img", v)}
            />
          </div>
        </BottomSheet>
      )}

      {confirmId !== null && (
        <ConfirmDialog
          message="Delete this event? This cannot be undone."
          onConfirm={() => {
            setDraft((p) => p.filter((e) => e.id !== confirmId));
            setConfirmId(null);
          }}
          onCancel={() => setConfirmId(null)}
        />
      )}
      {toast && <Toast msg={toast} />}
    </div>,
    document.body,
  );
}

/* ═══════════════════════════════════════════════════════════
   EDIT NOTICES PAGE  (unchanged)
═══════════════════════════════════════════════════════════ */
function EditNoticesPage({ notices, onSave, onBack }) {
  const [draft, setDraft] = useState(notices);
  const [sheet, setSheet] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };
  const openUpdate = (n) =>
    setSheet({
      mode: "update",
      id: n.id,
      data: { title: n.title, body: n.body, time: n.time },
    });
  const openAdd = () =>
    setSheet({ mode: "add", data: { title: "", body: "", time: "" } });
  const setField = (key, val) =>
    setSheet((s) => ({ ...s, data: { ...s.data, [key]: val } }));

  const handleApply = () => {
    if (!sheet.data.title.trim()) {
      showToast("Title is required.");
      return;
    }
    if (sheet.mode === "add") {
      setDraft((p) => [
        ...p,
        {
          id: nextId++,
          title: sheet.data.title,
          body: sheet.data.body,
          time: sheet.data.time || "Just now",
        },
      ]);
    } else {
      setDraft((p) =>
        p.map((n) => (n.id === sheet.id ? { ...n, ...sheet.data } : n)),
      );
    }
    setSheet(null);
  };

  const handleDelete = (id) => {
    if (draft.length <= 1) {
      showToast("You must keep at least 1 notice.");
      return;
    }
    setConfirmId(id);
  };

  return createPortal(
    <div className="ep-root">
      <div className="ep-header">
        <button className="ep-back" onClick={onBack}>
          <i className="bx bx-arrow-back" />
        </button>
        <span className="ep-title">Edit Notices</span>
        <button
          className="ep-save"
          onClick={() => {
            onSave(draft);
            onBack();
          }}
        >
          Save
        </button>
      </div>
      <div className="ep-content">
        {draft.map((n) => (
          <div className="ep-notice-row" key={n.id}>
            <div className="ep-notice-info">
              <div className="ep-notice-title">{n.title}</div>
              <div className="ep-notice-body">{n.body}</div>
              <div className="ep-notice-time">{n.time}</div>
            </div>
            <div className="ep-row-actions">
              <button className="ep-update-btn" onClick={() => openUpdate(n)}>
                <i className="bx bx-edit" />
                Update
              </button>
              <button
                className="ep-delete-btn"
                onClick={() => handleDelete(n.id)}
              >
                <i className="bx bx-trash" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="ep-footer">
        <button className="ep-add-btn" onClick={openAdd}>
          <i className="bx bx-plus" />
          Add New Notice
        </button>
      </div>
      {sheet && (
        <BottomSheet
          title={sheet.mode === "add" ? "New Notice" : "Update Notice"}
          icon={sheet.mode === "add" ? "bx-plus-circle" : "bx-edit-alt"}
          onClose={() => setSheet(null)}
          onApply={handleApply}
          applyLabel={sheet.mode === "add" ? "Add Notice" : "Apply"}
        >
          <div className="ep-field">
            <label className="ep-label">
              {sheet.mode === "add" ? "Title *" : "Title"}
            </label>
            <input
              className="ep-input"
              value={sheet.data.title}
              onChange={(e) => setField("title", e.target.value)}
            />
          </div>
          <div className="ep-field">
            <label className="ep-label">Body</label>
            <textarea
              className="ep-input ep-textarea"
              rows={3}
              value={sheet.data.body}
              onChange={(e) => setField("body", e.target.value)}
            />
          </div>
          <div className="ep-field">
            <label className="ep-label">Time (e.g. "2 hours ago")</label>
            <input
              className="ep-input"
              placeholder="Just now"
              value={sheet.data.time}
              onChange={(e) => setField("time", e.target.value)}
            />
          </div>
        </BottomSheet>
      )}
      {confirmId !== null && (
        <ConfirmDialog
          message="Delete this notice? This cannot be undone."
          onConfirm={() => {
            setDraft((p) => p.filter((n) => n.id !== confirmId));
            setConfirmId(null);
          }}
          onCancel={() => setConfirmId(null)}
        />
      )}
      {toast && <Toast msg={toast} />}
    </div>,
    document.body,
  );
}

/* ═══════════════════════════════════════════════════════════
   CAROUSEL HOOK
═══════════════════════════════════════════════════════════ */
function useCarousel(total) {
  const [current, setCurrent] = useState(Math.floor(total / 2));
  const [tx, setTx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const carouselRef = useRef(null);
  const trackRef = useRef(null);
  const dragRef = useRef({ startX: 0, delta: 0, baseTx: 0, t0: 0 });

  const cardW = useCallback(() => {
    const c = trackRef.current?.querySelector(".ae-card");
    return c ? c.offsetWidth : 340;
  }, []);
  const gapPx = useCallback(() => {
    if (!trackRef.current) return 16;
    return parseInt(getComputedStyle(trackRef.current).gap) || 16;
  }, []);
  const calcTx = useCallback(
    (i) => {
      const vw = carouselRef.current?.clientWidth || window.innerWidth;
      const cw = cardW(),
        step = cw + gapPx();
      return vw / 2 - (i * step + cw / 2);
    },
    [cardW, gapPx],
  );
  const goTo = useCallback(
    (idx) => {
      if (idx < 0 || idx >= total) return;
      setCurrent(idx);
      setTx(calcTx(idx));
    },
    [total, calcTx],
  );

  useEffect(() => {
    if (current >= total) setCurrent(Math.max(0, total - 1));
  }, [total, current]);
  useEffect(() => {
    const apply = () => setTx(calcTx(current));
    requestAnimationFrame(() => requestAnimationFrame(apply));
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [current, calcTx]);
  useEffect(() => {
    const h = (e) => {
      if (e.key === "ArrowLeft") goTo(current - 1);
      if (e.key === "ArrowRight") goTo(current + 1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [current, goTo]);

  const onDragStart = useCallback(
    (x) => {
      dragRef.current = {
        startX: x,
        delta: 0,
        baseTx: calcTx(current),
        t0: Date.now(),
      };
      setDragging(true);
    },
    [calcTx, current],
  );
  const onDragMove = useCallback(
    (x) => {
      if (!dragging) return;
      let d = x - dragRef.current.startX;
      dragRef.current.delta = d;
      if ((current === 0 && d > 0) || (current === total - 1 && d < 0))
        d *= 0.2;
      setTx(dragRef.current.baseTx + d);
    },
    [dragging, current, total],
  );
  const onDragEnd = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    const { delta, t0 } = dragRef.current;
    const elapsed = Date.now() - t0 || 1;
    const velocity = Math.abs(delta) / elapsed;
    const threshold = cardW() / 4;
    const isFlick = velocity > 0.35 && Math.abs(delta) > 25;
    if ((delta < -threshold || (isFlick && delta < 0)) && current < total - 1)
      goTo(current + 1);
    else if ((delta > threshold || (isFlick && delta > 0)) && current > 0)
      goTo(current - 1);
    else goTo(current);
  }, [dragging, current, total, cardW, goTo]);
  const dragDelta = useCallback(() => dragRef.current.delta, []);

  return {
    current,
    tx,
    dragging,
    goTo,
    carouselRef,
    trackRef,
    onDragStart,
    onDragMove,
    onDragEnd,
    dragDelta,
  };
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function AdminExplorer() {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [notices, setNotices] = useState(INITIAL_NOTICES);
  const [savedCards, setSavedCards] = useState({});
  const [loadedImgs, setLoadedImgs] = useState({});
  const [page, setPage] = useState(null);

  const total = events.length;
  const {
    current,
    tx,
    dragging,
    goTo,
    carouselRef,
    trackRef,
    onDragStart,
    onDragMove,
    onDragEnd,
    dragDelta,
  } = useCarousel(total);

  useEffect(() => {
    const move = (e) => onDragMove(e.clientX);
    const up = () => onDragEnd();
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("mouseleave", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("mouseleave", up);
    };
  }, [onDragMove, onDragEnd]);

  const toggleBookmark = (id, e) => {
    e.stopPropagation();
    setSavedCards((p) => ({ ...p, [id]: !p[id] }));
  };
  const handleImgLoad = (id) => setLoadedImgs((p) => ({ ...p, [id]: true }));

  return (
    <>
      {page === "editEvents" && (
        <EditEventsPage
          events={events}
          onSave={setEvents}
          onBack={() => setPage(null)}
        />
      )}
      {page === "editNotices" && (
        <EditNoticesPage
          notices={notices}
          onSave={setNotices}
          onBack={() => setPage(null)}
        />
      )}

      {/* ── IN THE SPOTLIGHT ── */}
      <div className="ae-spotlight">
        <div className="ae-section-header">
          <div className="ae-header-inner">
            <div className="ae-header-line" />
            <h2 className="ae-section-title">In The Spotlight</h2>
            <div className="ae-header-line" />
          </div>
          <button className="ae-edit-btn" onClick={() => setPage("editEvents")}>
            <i className="bx bx-edit" />
            <span>Edit</span>
          </button>
        </div>

        <div className="ae-carousel" ref={carouselRef}>
          <div
            ref={trackRef}
            className={`ae-track${dragging ? " dragging" : ""}`}
            style={{
              transform: `translateX(${tx}px)`,
              transition: dragging
                ? "none"
                : "transform 0.42s cubic-bezier(0.4,0,0.2,1)",
            }}
            onMouseDown={(e) => {
              onDragStart(e.clientX);
              e.preventDefault();
            }}
            onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
            onTouchMove={(e) => onDragMove(e.touches[0].clientX)}
            onTouchEnd={onDragEnd}
            onTouchCancel={onDragEnd}
            onClick={(e) => {
              if (Math.abs(dragDelta()) > 8) {
                e.stopPropagation();
                e.preventDefault();
              }
            }}
          >
            {events.map((ev, i) => (
              <div
                key={ev.id}
                className={`ae-card${i === current ? " active" : ""}`}
              >
                <div className="ae-card-img">
                  <img
                    src={ev.img}
                    alt={ev.title}
                    className={loadedImgs[ev.id] ? "loaded" : ""}
                    onLoad={() => handleImgLoad(ev.id)}
                    onError={() => handleImgLoad(ev.id)}
                    draggable={false}
                  />
                  <div className="ae-overlay" />
                  {ev.badge && (
                    <div
                      className={`ae-badge${ev.badgeType === "promo" ? " promo" : ""}`}
                    >
                      {ev.badge}
                    </div>
                  )}
                </div>
                <div className="ae-card-info">
                  <div className="ae-card-date">{ev.date}</div>
                  <h3 className="ae-card-title">{ev.title}</h3>
                  <div className="ae-card-loc">
                    <i className="bx bx-map" />
                    <span>{ev.location}</span>
                  </div>
                  <button
                    className={`ae-bookmark${savedCards[ev.id] ? " saved" : ""}`}
                    onClick={(e) => toggleBookmark(ev.id, e)}
                  >
                    <i
                      className={`bx ${savedCards[ev.id] ? "bxs-bookmark" : "bx-bookmark"}`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ae-controls">
          <button
            className="ae-arrow"
            onClick={() => goTo(current - 1)}
            disabled={current === 0}
          >
            <i className="bx bx-chevron-left" />
          </button>
          <div className="ae-dots">
            {events.map((_, i) => (
              <span
                key={i}
                className={`ae-dot${i === current ? " active" : ""}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
          <button
            className="ae-arrow"
            onClick={() => goTo(current + 1)}
            disabled={current === total - 1}
          >
            <i className="bx bx-chevron-right" />
          </button>
        </div>
      </div>

      {/* ── NOTICES ── */}
      <div className="ae-notices-section">
        <div className="ae-section-header">
          <div className="ae-header-inner">
            <div className="ae-header-line" />
            <h2 className="ae-section-title">Notices</h2>
            <div className="ae-header-line" />
          </div>
          <button
            className="ae-edit-btn"
            onClick={() => setPage("editNotices")}
          >
            <i className="bx bx-edit" />
            <span>Edit</span>
          </button>
        </div>
        <div className="ae-notices-list">
          {notices.map((n) => (
            <div className="ae-notice-item" key={n.id}>
              <h4>{n.title}</h4>
              <p>{n.body}</p>
              <span className="ae-notice-time">{n.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── QUICK ACCESS ── */}
      <h2 className="ae-section-heading">Quick Access</h2>
      <div className="ae-bus-card">
        <h3 style={{ color: "#a78bfa", marginBottom: 10 }}>Admin Panel 👋</h3>
        <p style={{ color: "#aaa" }}>
          Manage events, notices, and college content from here.
        </p>
      </div>
    </>
  );
}
