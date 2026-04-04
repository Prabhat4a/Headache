import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "boxicons/css/boxicons.min.css";

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}
function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}
function getDateLabel(dateStr) {
  const msg = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const mDay = new Date(msg);
  mDay.setHours(0, 0, 0, 0);
  const diff = Math.round((today - mDay) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return msg.toLocaleDateString("en-US", { weekday: "long" });
  return msg.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
function nowTime() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
function playPing() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator(),
      gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch {}
}
function loadBlocked() {
  try {
    return JSON.parse(localStorage.getItem("co_blocked") || "{}");
  } catch {
    return {};
  }
}
function saveBlocked(obj) {
  localStorage.setItem("co_blocked", JSON.stringify(obj));
}

/* ═══════════════════════════════════════════════
   STATIC DATA
═══════════════════════════════════════════════ */
const INIT_MSGS = {
  1: [
    {
      id: "1-0",
      type: "received",
      text: "Hey! Long time no see.",
      time: "10:10 AM",
      date: daysAgo(3),
    },
    {
      id: "1-1",
      type: "sent",
      text: "I know right! How have you been?",
      time: "10:12 AM",
      date: daysAgo(3),
    },
    {
      id: "1-2",
      type: "received",
      text: "All good! You coming to college tomorrow?",
      time: "6:00 PM",
      date: daysAgo(1),
    },
    {
      id: "1-3",
      type: "sent",
      text: "Yes, I will be there!",
      time: "6:05 PM",
      date: daysAgo(1),
    },
    {
      id: "1-4",
      type: "received",
      text: "Hey, are you coming to the lab?",
      time: "10:30 AM",
      date: daysAgo(0),
    },
    {
      id: "1-5",
      type: "sent",
      text: "Yes, I will be there in 15 minutes",
      time: "10:32 AM",
      date: daysAgo(0),
    },
    {
      id: "1-6",
      type: "received",
      text: "Great! I will wait for you",
      time: "10:33 AM",
      date: daysAgo(0),
    },
  ],
  2: [
    {
      id: "2-0",
      type: "received",
      text: "Did you finish the assignment?",
      time: "9:00 AM",
      date: daysAgo(2),
    },
    {
      id: "2-1",
      type: "sent",
      text: "Almost done, a few more questions left.",
      time: "9:15 AM",
      date: daysAgo(2),
    },
    {
      id: "2-2",
      type: "received",
      text: "Can you share the notes?",
      time: "9:45 AM",
      date: daysAgo(0),
    },
    {
      id: "2-3",
      type: "sent",
      text: "Sure, I will send them right away",
      time: "9:50 AM",
      date: daysAgo(0),
    },
    {
      id: "2-4",
      type: "sent",
      text: "Check your email",
      time: "9:51 AM",
      date: daysAgo(0),
    },
    {
      id: "2-5",
      type: "received",
      text: "Got it, thanks!",
      time: "9:52 AM",
      date: daysAgo(0),
    },
  ],
  3: [
    {
      id: "3-0",
      type: "sent",
      text: "Hey Rahul, need help with the project.",
      time: "4:00 PM",
      date: daysAgo(4),
    },
    {
      id: "3-1",
      type: "received",
      text: "Sure! What do you need?",
      time: "4:10 PM",
      date: daysAgo(4),
    },
    {
      id: "3-2",
      type: "sent",
      text: "The database part is confusing me.",
      time: "8:00 AM",
      date: daysAgo(1),
    },
    {
      id: "3-3",
      type: "received",
      text: "I can explain it to you after class.",
      time: "8:05 AM",
      date: daysAgo(1),
    },
    {
      id: "3-4",
      type: "received",
      text: "Thanks for the help!",
      time: "8:20 AM",
      date: daysAgo(0),
    },
    {
      id: "3-5",
      type: "sent",
      text: "No problem, happy to help!",
      time: "8:25 AM",
      date: daysAgo(0),
    },
    {
      id: "3-6",
      type: "received",
      text: "Let me know if you need anything",
      time: "8:26 AM",
      date: daysAgo(0),
    },
  ],
};

const INIT_CONTACTS = [
  {
    id: "1",
    name: "Amit Kumar",
    initials: "AK",
    avClass: "av-blue",
    lastMsg: "Great! I will wait for you",
    time: "10:33 AM",
    unread: 2,
    isGroup: false,
  },
  {
    id: "2",
    name: "Priya Sharma",
    initials: "PS",
    avClass: "av-pink",
    lastMsg: "Got it, thanks!",
    time: "9:52 AM",
    unread: 0,
    isGroup: false,
  },
  {
    id: "3",
    name: "Rahul Verma",
    initials: "RV",
    avClass: "av-green",
    lastMsg: "Let me know if you need anything",
    time: "8:26 AM",
    unread: 0,
    isGroup: false,
  },
];

// Say-hi stickers shown on empty/new chats
const SAY_HI_STICKERS = [
  { emoji: "👋", label: "Say Hi!" },
  { emoji: "😊", label: "Hello!" },
  { emoji: "🔥", label: "Hey!" },
  { emoji: "❤️", label: "Love" },
  { emoji: "🎉", label: "Wohoo!" },
  { emoji: "😂", label: "Haha" },
];

const EMOJI_CATS = {
  "😀 Smileys": [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "🤣",
    "😂",
    "🙂",
    "🙃",
    "😉",
    "😊",
    "😇",
    "🥰",
    "😍",
    "🤩",
    "😘",
    "😗",
    "😚",
    "😙",
    "🥲",
    "😋",
    "😛",
    "😜",
    "🤪",
    "😝",
    "🤑",
    "🤗",
    "🤭",
    "🤫",
    "🤔",
    "🤐",
    "🤨",
    "😐",
    "😑",
    "😶",
    "😏",
    "😒",
    "🙄",
    "😬",
    "🤥",
    "😌",
    "😔",
    "😪",
    "🤤",
    "😴",
    "😷",
    "🤒",
    "🤕",
    "🤢",
    "🤮",
    "🤧",
    "🥵",
    "🥶",
    "🥴",
    "😵",
    "🤯",
    "🤠",
    "🥳",
    "😎",
    "🤓",
    "🧐",
    "😕",
    "😟",
    "🙁",
    "☹️",
    "😮",
    "😯",
    "😲",
    "😳",
    "🥺",
    "😦",
    "😧",
    "😨",
    "😰",
    "😥",
    "😢",
    "😭",
    "😱",
    "😖",
    "😣",
    "😞",
    "😓",
    "😩",
    "😫",
    "🥱",
    "😤",
    "😡",
    "😠",
    "🤬",
    "😈",
    "👿",
    "💀",
    "☠️",
    "💩",
    "🤡",
    "👻",
    "👽",
    "👾",
    "🤖",
  ],
  "👋 People": [
    "👋",
    "🤚",
    "🖐️",
    "✋",
    "🖖",
    "👌",
    "🤌",
    "🤏",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "👇",
    "☝️",
    "👍",
    "👎",
    "✊",
    "👊",
    "🤛",
    "🤜",
    "👏",
    "🙌",
    "👐",
    "🤲",
    "🤝",
    "🙏",
    "✍️",
    "💅",
    "🤳",
    "💪",
    "🦾",
    "🦵",
    "🦶",
    "👂",
    "🦻",
    "👃",
    "🧠",
    "🦷",
    "🦴",
    "👀",
    "👅",
    "👄",
    "💋",
    "👶",
    "🧒",
    "👦",
    "👧",
    "🧑",
    "👱",
    "👨",
    "🧔",
    "👩",
    "🧓",
    "👴",
    "👵",
    "🙍",
    "🙎",
    "🙅",
    "🙆",
    "💁",
    "🙋",
    "🧏",
    "🙇",
    "🤦",
    "🤷",
  ],
  "🐶 Animals": [
    "🐶",
    "🐱",
    "🐭",
    "🐹",
    "🐰",
    "🦊",
    "🐻",
    "🐼",
    "🐨",
    "🐯",
    "🦁",
    "🐮",
    "🐷",
    "🐸",
    "🐵",
    "🙈",
    "🙉",
    "🙊",
    "🐔",
    "🐧",
    "🐦",
    "🐤",
    "🦆",
    "🦅",
    "🦉",
    "🦇",
    "🐺",
    "🐗",
    "🐴",
    "🦄",
    "🐝",
    "🐛",
    "🦋",
    "🐌",
    "🐞",
    "🐜",
    "🦟",
    "🦗",
    "🕷️",
    "🦂",
    "🐢",
    "🐍",
    "🦎",
    "🦖",
    "🦕",
    "🐙",
    "🦑",
    "🦐",
    "🦞",
    "🦀",
    "🐡",
    "🐠",
    "🐟",
    "🐬",
    "🐳",
    "🐋",
    "🦈",
    "🐊",
    "🐅",
    "🐆",
    "🦓",
    "🦍",
    "🦧",
    "🦣",
    "🐘",
    "🦛",
    "🦏",
    "🐪",
    "🐫",
    "🦒",
    "🦘",
    "🦬",
    "🐃",
    "🐂",
    "🐄",
    "🐎",
    "🐖",
    "🐏",
    "🐑",
    "🦙",
    "🐐",
    "🦌",
    "🐕",
    "🐩",
    "🦮",
    "🐈",
    "🐓",
    "🦃",
    "🦤",
    "🦚",
    "🦜",
    "🦢",
    "🦩",
    "🕊️",
    "🐇",
    "🦝",
    "🦨",
    "🦡",
    "🦫",
    "🦦",
    "🦥",
    "🐁",
    "🐀",
    "🐿️",
    "🦔",
  ],
  "🍎 Food": [
    "🍎",
    "🍐",
    "🍊",
    "🍋",
    "🍌",
    "🍉",
    "🍇",
    "🍓",
    "🫐",
    "🍈",
    "🍒",
    "🍑",
    "🥭",
    "🍍",
    "🥥",
    "🥝",
    "🍅",
    "🫒",
    "🥑",
    "🍆",
    "🥔",
    "🥕",
    "🌽",
    "🌶️",
    "🫑",
    "🥒",
    "🥬",
    "🥦",
    "🧄",
    "🧅",
    "🍄",
    "🥜",
    "🌰",
    "🍞",
    "🥐",
    "🥖",
    "🫓",
    "🥨",
    "🥯",
    "🥞",
    "🧇",
    "🧈",
    "🍳",
    "🍲",
    "🥘",
    "🍜",
    "🍝",
    "🍠",
    "🍢",
    "🍣",
    "🍤",
    "🍙",
    "🍚",
    "🍛",
    "🍥",
    "🥮",
    "🍡",
    "🥟",
    "🥠",
    "🥡",
    "🍦",
    "🍧",
    "🍨",
    "🍩",
    "🍪",
    "🎂",
    "🍰",
    "🧁",
    "🥧",
    "🍫",
    "🍬",
    "🍭",
    "🍮",
    "🍯",
    "🍼",
    "🥛",
    "☕",
    "🫖",
    "🍵",
    "🍶",
    "🍾",
    "🍷",
    "🍸",
    "🍹",
    "🍺",
    "🍻",
    "🥂",
    "🥃",
    "🫗",
    "🥤",
    "🧋",
    "🧃",
    "🧉",
    "🧊",
  ],
  "⚽ Activity": [
    "⚽",
    "🏀",
    "🏈",
    "⚾",
    "🥎",
    "🎾",
    "🏐",
    "🏉",
    "🥏",
    "🎱",
    "🏓",
    "🏸",
    "🏒",
    "🏑",
    "🥍",
    "🏏",
    "🪃",
    "🥅",
    "⛳",
    "🪁",
    "🏹",
    "🎣",
    "🤿",
    "🥊",
    "🥋",
    "🎽",
    "🛹",
    "🛼",
    "🛷",
    "⛸️",
    "🥌",
    "🎿",
    "⛷️",
    "🏂",
    "🪂",
    "🏋️",
    "🤼",
    "🤸",
    "🤺",
    "⛺",
    "🎭",
    "🎨",
    "🎬",
    "🎤",
    "🎧",
    "🎼",
    "🎹",
    "🥁",
    "🎷",
    "🎺",
    "🎸",
    "🪕",
    "🎻",
    "🎲",
    "♟️",
    "🎯",
    "🎳",
    "🎮",
    "🎰",
    "🧩",
  ],
  "❤️ Symbols": [
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "❣️",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "💝",
    "💟",
    "☮️",
    "✝️",
    "☪️",
    "🕉️",
    "☸️",
    "✡️",
    "🔯",
    "🕎",
    "☯️",
    "☦️",
    "🛐",
    "⛎",
    "♈",
    "♉",
    "♊",
    "♋",
    "♌",
    "♍",
    "♎",
    "♏",
    "♐",
    "♑",
    "♒",
    "♓",
    "🆔",
    "⚛️",
    "🉑",
    "☢️",
    "☣️",
    "📴",
    "📳",
    "🈶",
    "🈚",
    "🈸",
    "🈺",
    "🈷️",
    "✴️",
    "🆚",
    "💮",
    "🉐",
    "㊙️",
    "㊗️",
    "🈴",
    "🈵",
    "🈹",
    "🈲",
    "🅰️",
    "🅱️",
    "🆎",
    "🆑",
    "🅾️",
    "🆘",
    "❌",
    "⭕",
    "🛑",
    "⛔",
    "📛",
    "🚫",
    "💯",
    "💢",
    "♨️",
    "🚷",
    "🚯",
    "🚳",
    "🚱",
    "🔞",
    "📵",
    "🔕",
  ],
};
const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
export default function ChatOverlay({ isOpen, onClose }) {
  const [msgData, setMsgData] = useState({ ...INIT_MSGS });
  const [contacts, setContacts] = useState(INIT_CONTACTS);
  const [user, setUser] = useState(null);
  const [input, setInput] = useState("");
  const [reply, setReply] = useState(null);
  const [typing, setTyping] = useState(false);
  const [search, setSearch] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [emojiTab, setEmojiTab] = useState(Object.keys(EMOJI_CATS)[0]);
  const [emojiQ, setEmojiQ] = useState("");
  const [bubMenu, setBubMenu] = useState(null);
  const [selMode, setSelMode] = useState(false);
  const [selMsgs, setSelMsgs] = useState(new Set());
  const [muted, setMuted] = useState({});
  const [reactions, setReactions] = useState({});
  const [ctxMenu, setCtxMenu] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [modal, setModal] = useState(null);
  const [fwdModal, setFwdModal] = useState(null);
  const [fwdSel, setFwdSel] = useState(new Set());
  const [attachOpen, setAttachOpen] = useState(false);
  const [blocked, setBlockedRaw] = useState(loadBlocked);
  // Recording state
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const recordingChunks = useRef([]);
  const recordingTimer = useRef(null);
  // Group creation modal
  const [groupModal, setGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState(new Set());
  // Toast notifications
  const [toasts, setToasts] = useState([]);
  // Lightbox for images
  const [lightbox, setLightbox] = useState(null);
  // Profile card popup (long-press avatar)
  const [profileCard, setProfileCard] = useState(null); // { contact, x, y }
  // Group invite responses: { msgId: "accepted"|"rejected" }
  const [inviteStatus, setInviteStatus] = useState({});

  const navigate = useNavigate();

  const setBlocked = useCallback((fn) => {
    setBlockedRaw((prev) => {
      const next = typeof fn === "function" ? fn(prev) : fn;
      saveBlocked(next);
      return next;
    });
  }, []);

  const endRef = useRef(null);
  const typTimer = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const attachRef = useRef(null);
  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const docInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Toast helper
  const addToast = (msg, type = "info") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  };

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgData, user, typing]);

  useEffect(() => {
    if (!menuOpen) return;
    const fn = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    setTimeout(() => document.addEventListener("click", fn), 10);
    return () => document.removeEventListener("click", fn);
  }, [menuOpen]);

  useEffect(() => {
    if (!attachOpen) return;
    const fn = (e) => {
      if (attachRef.current && !attachRef.current.contains(e.target))
        setAttachOpen(false);
    };
    setTimeout(() => document.addEventListener("click", fn), 10);
    return () => document.removeEventListener("click", fn);
  }, [attachOpen]);

  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") {
        setBubMenu(null);
        setCtxMenu(null);
        setEmojiOpen(false);
        setAttachOpen(false);
        if (selMode) exitSel();
        if (lightbox) setLightbox(null);
        if (profileCard) setProfileCard(null);
      }
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [selMode, lightbox]);

  // ✅ ADD THIS RIGHT HERE ↓
  useEffect(() => {
    if (!isOpen) {
      setUser(null);
      setInput("");
      setReply(null);
      setEmojiOpen(false);
      setAttachOpen(false);
      setSelMode(false);
      setSelMsgs(new Set());
      setBubMenu(null);
    }
  }, [isOpen]);

  if (!isOpen) return null; // ← this line should already be here
  // Wrong — don't do it here
  if (!isOpen) return null;

  const msgs = user ? msgData[user.id] || [] : [];
  const isNewChat = msgs.length === 0;

  const grouped = (() => {
    const out = [];
    let last = null;
    msgs.forEach((m) => {
      const lbl = getDateLabel(m.date);
      if (lbl !== last) {
        out.push({ kind: "div", lbl });
        last = lbl;
      }
      out.push({ kind: "msg", m });
    });
    return out;
  })();

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const showLeft = !isMobile || !user;
  const showRight = !isMobile || !!user;

  /* ═══ SEND TEXT ═══ */
  const sendMsg = (textOverride) => {
    const text = (textOverride !== undefined ? textOverride : input).trim();
    if (!text || !user || blocked[user.id]) return;
    const t = nowTime();
    const newMsg = {
      id: `${user.id}-${Date.now()}`,
      type: "sent",
      text,
      time: t,
      date: daysAgo(0),
      reply: reply ? { ...reply } : null,
    };
    setMsgData((p) => ({ ...p, [user.id]: [...(p[user.id] || []), newMsg] }));
    setContacts((p) =>
      p.map((c) =>
        c.id === user.id ? { ...c, lastMsg: text, time: t, unread: 0 } : c,
      ),
    );
    if (textOverride === undefined) setInput("");
    setReply(null);
    clearTimeout(typTimer.current);
    setTimeout(() => {
      if (!user || blocked[user.id]) return;
      setTyping(true);
      typTimer.current = setTimeout(() => {
        setTyping(false);
        playPing();
        const pool = [
          "Got it!",
          "Sure thing 👍",
          "Okay!",
          "Sounds good!",
          "Let me check that.",
          "Thanks!",
          "😊",
          "Nice one!",
          "Absolutely!",
        ];
        const auto = {
          id: `${user.id}-a-${Date.now()}`,
          type: "received",
          text: pool[Math.floor(Math.random() * pool.length)],
          time: nowTime(),
          date: daysAgo(0),
        };
        setMsgData((p) => ({ ...p, [user.id]: [...(p[user.id] || []), auto] }));
        setContacts((p) =>
          p.map((c) =>
            c.id === user.id
              ? { ...c, lastMsg: auto.text, time: auto.time }
              : c,
          ),
        );
      }, 2200);
    }, 600);
  };

  /* ═══ SEND FILE ═══ */
  const sendFile = (file, forceType) => {
    if (!file || !user || blocked[user.id]) return;
    const t = nowTime();
    const url = URL.createObjectURL(file);
    const isImage = forceType === "image" || file.type.startsWith("image/");
    const isAudio = forceType === "audio" || file.type.startsWith("audio/");
    const isDoc = !isImage && !isAudio;
    const newMsg = {
      id: `${user.id}-${Date.now()}`,
      type: "sent",
      text: "",
      time: t,
      date: daysAgo(0),
      ...(isImage && { image: url, fileName: file.name }),
      ...(isAudio && { audio: url, fileName: file.name }),
      ...(isDoc && {
        document: url,
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(1) + " KB",
      }),
    };
    setMsgData((p) => ({ ...p, [user.id]: [...(p[user.id] || []), newMsg] }));
    setContacts((p) =>
      p.map((c) =>
        c.id === user.id
          ? {
              ...c,
              lastMsg: isImage
                ? "📷 Photo"
                : isAudio
                  ? "🎵 Audio"
                  : `📄 ${file.name}`,
              time: t,
              unread: 0,
            }
          : c,
      ),
    );
    setAttachOpen(false);
  };

  /* ═══ VOICE RECORDING ═══ */
  const startRecording = async () => {
    if (!user || blocked[user.id]) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      recordingChunks.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) recordingChunks.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(recordingChunks.current, { type: "audio/webm" });
        const audioFile = new File([blob], "voice-message.webm", {
          type: "audio/webm",
        });
        sendFile(audioFile, "audio");
        stream.getTracks().forEach((t) => t.stop());
        clearInterval(recordingTimer.current);
        setRecordingTime(0);
        setRecording(false);
        setMediaRecorder(null);
      };
      mr.start();
      setMediaRecorder(mr);
      setRecording(true);
      setRecordingTime(0);
      recordingTimer.current = setInterval(
        () => setRecordingTime((p) => p + 1),
        1000,
      );
    } catch (e) {
      addToast("Microphone access denied", "error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.ondataavailable = null;
      mediaRecorder.onstop = () => {};
      mediaRecorder.stop();
      mediaRecorder.stream?.getTracks().forEach((t) => t.stop());
      clearInterval(recordingTimer.current);
      setRecordingTime(0);
      setRecording(false);
      setMediaRecorder(null);
      recordingChunks.current = [];
    }
  };

  const formatRecordingTime = (s) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const exitSel = () => {
    setSelMode(false);
    setSelMsgs(new Set());
  };
  const toggleSel = (id) => {
    setSelMsgs((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      if (n.size === 0) setSelMode(false);
      return n;
    });
  };

  const execDeleteEveryone = () => {
    setMsgData((p) => ({
      ...p,
      [user.id]: (p[user.id] || []).map((m) =>
        selMsgs.has(m.id) ? { ...m, deleted: true } : m,
      ),
    }));
    exitSel();
    setModal(null);
  };
  const execDeleteForMe = () => {
    setMsgData((p) => ({
      ...p,
      [user.id]: (p[user.id] || []).filter((m) => !selMsgs.has(m.id)),
    }));
    exitSel();
    setModal(null);
  };
  const execClear = (uid) => {
    setMsgData((p) => ({ ...p, [uid]: [] }));
    setContacts((p) =>
      p.map((c) => (c.id === uid ? { ...c, lastMsg: "" } : c)),
    );
    setModal(null);
  };
  const execBlock = (uid) => {
    setBlocked((p) => ({ ...p, [uid]: true }));
    setModal(null);
    setMenuOpen(false);
  };
  const doUnblock = (uid) =>
    setBlocked((p) => {
      const n = { ...p };
      delete n[uid];
      return n;
    });
  const execDeleteContact = (uid) => {
    setContacts((p) => p.filter((c) => c.id !== uid));
    setMsgData((p) => {
      const n = { ...p };
      delete n[uid];
      return n;
    });
    if (user?.id === uid) setUser(null);
    setModal(null);
  };

  const doForward = () => {
    if (!fwdModal) return;
    const t = nowTime();
    setMsgData((p) => {
      const next = { ...p };
      fwdSel.forEach((uid) => {
        const fwd = fwdModal.map((text, i) => ({
          id: `${uid}-f-${Date.now()}-${i}`,
          type: "sent",
          text,
          time: t,
          date: daysAgo(0),
          forwarded: true,
        }));
        next[uid] = [...(next[uid] || []), ...fwd];
      });
      return next;
    });
    setFwdModal(null);
    setFwdSel(new Set());
  };

  /* ═══ GROUP CREATION ═══ */
  const createGroup = () => {
    if (!groupName.trim() || groupMembers.size === 0) return;
    const memberList = contacts.filter((c) => groupMembers.has(c.id));
    const initials = groupName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    const groupId = `g-${Date.now()}`;
    const newGroup = {
      id: groupId,
      name: groupName.trim(),
      initials,
      avClass: "av-purple",
      lastMsg: "Group created",
      time: nowTime(),
      unread: 0,
      isGroup: true,
      members: [],
      memberIds: [],
    };
    setContacts((p) => [newGroup, ...p]);
    setMsgData((p) => ({
      ...p,
      [groupId]: [
        {
          id: `${groupId}-sys-0`,
          type: "sent",
          text: `You created the group "${groupName.trim()}" 🎉`,
          time: nowTime(),
          date: daysAgo(0),
          system: true,
        },
      ],
    }));
    // Send actionable invite to each member
    memberList.forEach((m, idx) => {
      setTimeout(
        () => {
          addToast(`📨 Invitation sent to ${m.name}`, "success");
          const inviteId = `${m.id}-inv-${Date.now()}-${idx}`;
          const inviteMsg = {
            id: inviteId,
            type: "received",
            text: "",
            time: nowTime(),
            date: daysAgo(0),
            invite: true,
            groupId,
            groupName: groupName.trim(),
          };
          setMsgData((prev) => ({
            ...prev,
            [m.id]: [...(prev[m.id] || []), inviteMsg],
          }));
          setContacts((prev) =>
            prev.map((c) =>
              c.id === m.id
                ? {
                    ...c,
                    lastMsg: `📨 Group invite: ${groupName.trim()}`,
                    time: inviteMsg.time,
                    unread: (c.unread || 0) + 1,
                  }
                : c,
            ),
          );
        },
        300 * (idx + 1),
      );
    });
    setGroupModal(false);
    setGroupName("");
    setGroupMembers(new Set());
    setUser(newGroup);
  };

  /* ═══ ACCEPT / REJECT GROUP INVITE ═══ */
  const handleInvite = (msg, action) => {
    setInviteStatus((p) => ({ ...p, [msg.id]: action }));
    if (action === "accepted") {
      // Add member to the group
      setContacts((p) =>
        p.map((c) =>
          c.id === msg.groupId
            ? {
                ...c,
                members: [...(c.members || []), user?.name || "You"],
                memberIds: [...(c.memberIds || []), user?.id],
              }
            : c,
        ),
      );
      // Add system message to group chat
      const joinMsg = {
        id: `${msg.groupId}-join-${Date.now()}`,
        type: "received",
        text: `${user?.name || "A member"} joined the group 🎉`,
        time: nowTime(),
        date: daysAgo(0),
        system: true,
      };
      setMsgData((prev) => ({
        ...prev,
        [msg.groupId]: [...(prev[msg.groupId] || []), joinMsg],
      }));
      addToast(`✅ You joined "${msg.groupName}"`, "success");
    } else {
      addToast(`❌ Declined invite to "${msg.groupName}"`, "info");
    }
  };

  const handleCtxAction = (action) => {
    const uid = ctxMenu?.uid;
    if (!uid) return;
    setCtxMenu(null);
    if (action === "mute")
      setMuted((p) => {
        const n = { ...p };
        p[uid] ? delete n[uid] : (n[uid] = true);
        return n;
      });
    if (action === "block") setModal({ type: "block", payload: uid });
    if (action === "clear") setModal({ type: "clearChat", payload: uid });
    if (action === "delete") setModal({ type: "deleteContact", payload: uid });
  };

  /* ═══ RENDER ═══ */
  return (
    <>
      <div className="co-overlay">
        <div className="co-shell">
          {/* ══ LEFT ══ */}
          {showLeft && (
            <div className={`co-left${isMobile && user ? " hidden" : ""}`}>
              <div className="co-left-header">
                <span className="co-left-title">Messages</span>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    className="co-icon-btn"
                    title="New Group"
                    onClick={() => setGroupModal(true)}
                  >
                    <i className="bx bx-plus" />
                  </button>
                  <button
                    className="co-icon-btn"
                    onClick={onClose}
                    title="Close"
                  >
                    <i className="bx bx-x" />
                  </button>
                </div>
              </div>
              <div className="co-search">
                <i className="bx bx-search" />
                <input
                  placeholder="Search contacts…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="co-list">
                {filteredContacts.length === 0 ? (
                  <div className="co-empty-list">
                    <i className="bx bx-search-alt" />
                    <p>No contacts found</p>
                  </div>
                ) : (
                  filteredContacts.map((c) => (
                    <div
                      key={c.id}
                      className={`co-item${user?.id === c.id ? " active" : ""}${blocked[c.id] ? " blocked" : ""}`}
                      onClick={() => {
                        setUser(c);
                        setMenuOpen(false);
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setCtxMenu({ uid: c.id, x: e.clientX, y: e.clientY });
                      }}
                    >
                      <AvatarWithPress
                        contact={c}
                        size={44}
                        fontSize={14}
                        onClick={(e) => {
                          e.stopPropagation();
                          setUser(c);
                          setMenuOpen(false);
                        }}
                        onLongPress={() => setProfileCard({ contact: c })}
                      />
                      <div className="co-info">
                        <div className="co-name-row">
                          <span className="co-name">
                            {c.name}
                            {muted[c.id] && " 🔇"}
                          </span>
                          <span className="co-ctime">{c.time}</span>
                        </div>
                        <div className="co-preview-row">
                          <span className="co-preview">
                            {blocked[c.id] && (
                              <span
                                style={{
                                  color: "#ef4444",
                                  fontStyle: "italic",
                                }}
                              >
                                Blocked •{" "}
                              </span>
                            )}
                            {c.lastMsg}
                          </span>
                          {c.unread > 0 && !blocked[c.id] && (
                            <span className="co-unread">{c.unread}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ══ RIGHT ══ */}
          {showRight && (
            <div className="co-right">
              {!user ? (
                <div className="co-no-chat">
                  <div className="co-no-chat-icon">
                    <i className="bx bx-message-rounded-dots" />
                  </div>
                  <h3>Select a chat</h3>
                  <p>Choose a conversation to start messaging</p>
                </div>
              ) : (
                <div className="co-chat-view">
                  {/* Header */}
                  <div className="co-header">
                    {isMobile && (
                      <button
                        className="co-back-btn"
                        onClick={() => setUser(null)}
                      >
                        <i className="bx bx-arrow-back" />
                      </button>
                    )}
                    <AvatarWithPress
                      contact={user}
                      size={38}
                      fontSize={13}
                      onClick={() => {
                        if (!user.isGroup) navigate("/profile");
                      }}
                      onLongPress={() => setProfileCard({ contact: user })}
                    />
                    <div
                      className="co-header-info"
                      style={{ cursor: user.isGroup ? "default" : "pointer" }}
                      onClick={() => {
                        if (!user.isGroup) navigate("/profile");
                      }}
                    >
                      <div className="co-header-name">
                        {user.name}
                        {user.isGroup && (
                          <span className="co-group-tag"> · Group</span>
                        )}
                      </div>
                      <div className="co-header-status">
                        {typing ? (
                          <span className="co-typing-status">typing…</span>
                        ) : user.isGroup ? (
                          `${user.members?.length || 0} members`
                        ) : (
                          "Online"
                        )}
                      </div>
                    </div>
                    <div className="co-menu-wrap" ref={menuRef}>
                      <button
                        className="co-icon-btn"
                        onClick={() => setMenuOpen((p) => !p)}
                      >
                        <i className="bx bx-dots-vertical-rounded" />
                      </button>
                      {menuOpen && (
                        <div className="co-menu-dropdown">
                          {!user.isGroup && (
                            <div
                              className="co-menu-item"
                              onClick={() => {
                                blocked[user.id]
                                  ? doUnblock(user.id)
                                  : setModal({
                                      type: "block",
                                      payload: user.id,
                                    });
                                setMenuOpen(false);
                              }}
                            >
                              <i className="bx bx-block" />
                              <span>
                                {blocked[user.id]
                                  ? "Unblock user"
                                  : "Block user"}
                              </span>
                            </div>
                          )}
                          <div
                            className="co-menu-item"
                            onClick={() => {
                              setModal({ type: "clearChat", payload: user.id });
                              setMenuOpen(false);
                            }}
                          >
                            <i className="bx bx-eraser" />
                            <span>Clear chat</span>
                          </div>
                          {user.isGroup && (
                            <div
                              className="co-menu-item danger"
                              onClick={() => {
                                setModal({
                                  type: "leaveGroup",
                                  payload: user.id,
                                });
                                setMenuOpen(false);
                              }}
                            >
                              <i className="bx bx-log-out" />
                              <span>Leave group</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <div
                    className="co-messages"
                    onClick={() => {
                      setBubMenu(null);
                      setMenuOpen(false);
                      setAttachOpen(false);
                    }}
                  >
                    {/* Say Hi stickers for new/empty chats */}
                    {isNewChat && !blocked[user.id] && (
                      <div className="co-sayhi-wrap">
                        <div className="co-sayhi-avatar">
                          <div
                            className={`co-avatar ${user.avClass}`}
                            style={{ width: 64, height: 64, fontSize: 22 }}
                          >
                            {user.initials}
                          </div>
                        </div>
                        <p className="co-sayhi-name">{user.name}</p>
                        <p className="co-sayhi-hint">
                          Say something nice to start the conversation!
                        </p>
                        <div className="co-sayhi-stickers">
                          {SAY_HI_STICKERS.map((s, i) => (
                            <button
                              key={i}
                              className="co-sayhi-btn"
                              style={{ animationDelay: `${i * 0.07}s` }}
                              onClick={() => sendMsg(s.emoji + " " + s.label)}
                            >
                              <span className="co-sayhi-emoji">{s.emoji}</span>
                              <span className="co-sayhi-label">{s.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {!isNewChat &&
                      grouped.map((item, idx) =>
                        item.kind === "div" ? (
                          <div key={`d-${idx}`} className="co-day-divider">
                            <span>{item.lbl}</span>
                          </div>
                        ) : (
                          <MsgBubble
                            key={item.m.id}
                            msg={item.m}
                            contact={user}
                            selMode={selMode}
                            isSel={selMsgs.has(item.m.id)}
                            reaction={reactions[item.m.id]}
                            inviteStatus={inviteStatus[item.m.id]}
                            onClick={() => {
                              if (selMode) toggleSel(item.m.id);
                            }}
                            onCtx={(e) => {
                              e.preventDefault();
                              setBubMenu({
                                msgId: item.m.id,
                                x: e.clientX,
                                y: e.clientY,
                                text: item.m.text,
                                type: item.m.type,
                              });
                            }}
                            onArrow={(e) => {
                              e.stopPropagation();
                              const r = e.currentTarget.getBoundingClientRect();
                              setBubMenu({
                                msgId: item.m.id,
                                x: r.left,
                                y: r.top,
                                text: item.m.text,
                                type: item.m.type,
                              });
                            }}
                            onImageClick={(url) => setLightbox(url)}
                            onInviteAction={(action) =>
                              handleInvite(item.m, action)
                            }
                            onAvatarLongPress={() =>
                              setProfileCard({ contact: user })
                            }
                          />
                        ),
                      )}

                    {blocked[user.id] && (
                      <div
                        className="co-system-notice"
                        onClick={() => doUnblock(user.id)}
                      >
                        You blocked this contact. Tap to unblock.
                      </div>
                    )}

                    {typing && (
                      <div className="co-typing">
                        <div
                          className={`co-avatar ${user.avClass}`}
                          style={{
                            width: 28,
                            height: 28,
                            fontSize: 10,
                            alignSelf: "flex-end",
                          }}
                        >
                          {user.initials}
                        </div>
                        <div className="co-typing-bubble">
                          <span className="co-dot" />
                          <span className="co-dot" />
                          <span className="co-dot" />
                        </div>
                      </div>
                    )}
                    <div ref={endRef} />
                  </div>

                  {/* Block bar */}
                  {blocked[user.id] && (
                    <div className="co-block-bar">
                      <i className="bx bx-block" />
                      <span>You blocked this contact.</span>
                      <button onClick={() => doUnblock(user.id)}>
                        Unblock
                      </button>
                    </div>
                  )}

                  {/* Select bar */}
                  {selMode && (
                    <div className="co-select-bar">
                      <button className="co-sel-cancel" onClick={exitSel}>
                        <i className="bx bx-x" />
                      </button>
                      <span className="co-sel-count">
                        {selMsgs.size} selected
                      </span>
                      <div className="co-sel-actions">
                        <button
                          className="co-sel-btn"
                          title="Copy"
                          onClick={() => {
                            const t = msgs
                              .filter((m) => selMsgs.has(m.id))
                              .map((m) => m.text)
                              .join("\n");
                            navigator.clipboard.writeText(t).catch(() => {});
                            exitSel();
                          }}
                        >
                          <i className="bx bx-copy" />
                        </button>
                        <button
                          className="co-sel-btn"
                          title="Forward"
                          onClick={() => {
                            const texts = msgs
                              .filter((m) => selMsgs.has(m.id))
                              .map((m) => {
                                if (m.image) return "📷 Photo";
                                if (m.audio)
                                  return `🎵 ${m.fileName || "Audio"}`;
                                return m.text;
                              });
                            setFwdModal(texts);
                            setFwdSel(new Set());
                            exitSel();
                          }}
                        >
                          <i className="bx bx-transfer-alt" />
                        </button>
                        <button
                          className="co-sel-btn"
                          title="Delete"
                          onClick={() => setModal({ type: "deleteMsg" })}
                        >
                          <i className="bx bx-trash" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Input */}
                  {!selMode && (
                    <div
                      className={`co-input-area${blocked[user.id] ? " disabled" : ""}`}
                    >
                      {reply && (
                        <div className="co-reply-preview">
                          <div className="co-reply-content">
                            <strong>{reply.user}</strong>
                            <span>{reply.text}</span>
                          </div>
                          <button
                            className="co-close-reply"
                            onClick={() => setReply(null)}
                          >
                            <i className="bx bx-x" />
                          </button>
                        </div>
                      )}

                      {/* Recording UI */}
                      {recording ? (
                        <div className="co-recording-bar">
                          <button
                            className="co-rec-cancel"
                            onClick={cancelRecording}
                            title="Cancel"
                          >
                            <i className="bx bx-x" />
                          </button>
                          <div className="co-rec-indicator">
                            <span className="co-rec-dot" />
                            <span className="co-rec-time">
                              {formatRecordingTime(recordingTime)}
                            </span>
                            <span className="co-rec-label">Recording…</span>
                          </div>
                          <button
                            className="co-rec-send"
                            onClick={stopRecording}
                            title="Send"
                          >
                            <i className="bx bx-send" />
                          </button>
                        </div>
                      ) : (
                        <div className="co-input-box">
                          <div className="co-input-row">
                            {/* Attachment */}
                            <div className="co-attach-wrap" ref={attachRef}>
                              <button
                                className="co-attach-btn"
                                title="Attach"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!blocked[user.id])
                                    setAttachOpen((p) => !p);
                                }}
                              >
                                <i className="bx bx-plus" />
                              </button>
                              {attachOpen && (
                                <div className="co-attach-popup">
                                  <button
                                    className="co-attach-item"
                                    onClick={() => {
                                      docInputRef.current?.click();
                                      setAttachOpen(false);
                                    }}
                                  >
                                    <span className="co-attach-icon doc-icon">
                                      <i className="bx bx-file" />
                                    </span>
                                    <span>Document</span>
                                  </button>
                                  <button
                                    className="co-attach-item"
                                    onClick={() => {
                                      imageInputRef.current?.click();
                                      setAttachOpen(false);
                                    }}
                                  >
                                    <span className="co-attach-icon img-icon">
                                      <i className="bx bx-image" />
                                    </span>
                                    <span>Photos &amp; Videos</span>
                                  </button>
                                  <button
                                    className="co-attach-item"
                                    onClick={() => {
                                      cameraInputRef.current?.click();
                                      setAttachOpen(false);
                                    }}
                                  >
                                    <span className="co-attach-icon cam-icon">
                                      <i className="bx bx-camera" />
                                    </span>
                                    <span>Camera</span>
                                  </button>
                                  <button
                                    className="co-attach-item"
                                    onClick={() => {
                                      audioInputRef.current?.click();
                                      setAttachOpen(false);
                                    }}
                                  >
                                    <span className="co-attach-icon aud-icon">
                                      <i className="bx bx-headphone" />
                                    </span>
                                    <span>Audio</span>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Hidden file inputs */}
                            <input
                              ref={imageInputRef}
                              type="file"
                              accept="image/*,video/*"
                              style={{ display: "none" }}
                              onChange={(e) => {
                                sendFile(e.target.files[0]);
                                e.target.value = "";
                              }}
                            />
                            <input
                              ref={audioInputRef}
                              type="file"
                              accept="audio/*"
                              style={{ display: "none" }}
                              onChange={(e) => {
                                sendFile(e.target.files[0], "audio");
                                e.target.value = "";
                              }}
                            />
                            <input
                              ref={docInputRef}
                              type="file"
                              accept=".pdf,.doc,.docx,.txt,.zip,.rar,.xls,.xlsx,.ppt,.pptx"
                              style={{ display: "none" }}
                              onChange={(e) => {
                                sendFile(e.target.files[0]);
                                e.target.value = "";
                              }}
                            />
                            {/* Camera — capture attribute opens device camera */}
                            <input
                              ref={cameraInputRef}
                              type="file"
                              accept="image/*"
                              capture="environment"
                              style={{ display: "none" }}
                              onChange={(e) => {
                                sendFile(e.target.files[0], "image");
                                e.target.value = "";
                              }}
                            />

                            <i
                              className="bx bx-smile co-emoji-toggle"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!blocked[user.id]) setEmojiOpen((p) => !p);
                              }}
                            />

                            <input
                              ref={inputRef}
                              value={input}
                              onChange={(e) => setInput(e.target.value)}
                              onKeyDown={(e) =>
                                e.key === "Enter" && !e.shiftKey && sendMsg()
                              }
                              placeholder="Type a message…"
                              disabled={!!blocked[user.id]}
                            />

                            {/* Dynamic right button: mic when empty, send when has text */}
                            {input.trim() ? (
                              <button
                                className="co-send-btn"
                                onClick={() => sendMsg()}
                                disabled={!!blocked[user.id]}
                              >
                                <i className="bx bx-send" />
                              </button>
                            ) : (
                              <button
                                className="co-mic-btn"
                                onMouseDown={startRecording}
                                onTouchStart={startRecording}
                                title="Hold to record"
                                disabled={!!blocked[user.id]}
                              >
                                <i className="bx bx-microphone" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {emojiOpen && (
                        <EmojiPicker
                          tab={emojiTab}
                          query={emojiQ}
                          onTab={(t) => {
                            setEmojiTab(t);
                            setEmojiQ("");
                          }}
                          onQuery={setEmojiQ}
                          onPick={(em) => {
                            setInput((p) => p + em);
                            inputRef.current?.focus();
                          }}
                          onClose={() => setEmojiOpen(false)}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ══ IMAGE LIGHTBOX ══ */}
      {lightbox && (
        <div className="co-lightbox" onClick={() => setLightbox(null)}>
          <button
            className="co-lightbox-close"
            onClick={() => setLightbox(null)}
          >
            <i className="bx bx-x" />
          </button>
          <img
            src={lightbox}
            alt="Preview"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ══ BUBBLE MENU ══ */}
      {bubMenu && (
        <BubbleMenu
          x={bubMenu.x}
          y={bubMenu.y}
          msgType={bubMenu.type}
          onClose={() => setBubMenu(null)}
          onReact={(em) => {
            setReactions((p) => ({ ...p, [bubMenu.msgId]: em }));
            setBubMenu(null);
          }}
          onReply={() => {
            setReply({
              user: bubMenu.type === "sent" ? "You" : user?.name,
              text: bubMenu.text,
            });
            setBubMenu(null);
            inputRef.current?.focus();
          }}
          onCopy={() => {
            navigator.clipboard.writeText(bubMenu.text).catch(() => {});
            setBubMenu(null);
          }}
          onForward={() => {
            setFwdModal([bubMenu.text || "📎 Attachment"]);
            setFwdSel(new Set());
            setBubMenu(null);
          }}
          onSelect={() => {
            setSelMode(true);
            setSelMsgs(new Set([bubMenu.msgId]));
            setBubMenu(null);
          }}
          onDelete={() => {
            setSelMsgs(new Set([bubMenu.msgId]));
            setModal({ type: "deleteMsg" });
            setBubMenu(null);
          }}
        />
      )}

      {/* ══ CONTACT CONTEXT MENU ══ */}
      {ctxMenu && (
        <ContactCtxMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          isMuted={!!muted[ctxMenu.uid]}
          onClose={() => setCtxMenu(null)}
          onAction={handleCtxAction}
        />
      )}

      {/* ══ GROUP CREATION MODAL ══ */}
      {groupModal && (
        <div className="co-modal-backdrop" onClick={() => setGroupModal(false)}>
          <div className="co-group-modal" onClick={(e) => e.stopPropagation()}>
            <div className="co-group-header">
              <h3>New Group</h3>
              <button
                className="co-icon-btn"
                onClick={() => setGroupModal(false)}
              >
                <i className="bx bx-x" />
              </button>
            </div>
            <div className="co-group-body">
              <div className="co-group-name-wrap">
                <div className="co-group-icon-preview">
                  <i className="bx bx-group" />
                </div>
                <input
                  className="co-group-name-input"
                  placeholder="Group name…"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  maxLength={40}
                />
              </div>
              <p className="co-group-section-label">Add members</p>
              <div className="co-group-members">
                {contacts
                  .filter((c) => !c.isGroup)
                  .map((c) => (
                    <div
                      key={c.id}
                      className={`co-fwd-item${groupMembers.has(c.id) ? " sel" : ""}`}
                      onClick={() =>
                        setGroupMembers((p) => {
                          const n = new Set(p);
                          n.has(c.id) ? n.delete(c.id) : n.add(c.id);
                          return n;
                        })
                      }
                    >
                      <div className="co-fwd-check">
                        {groupMembers.has(c.id) && (
                          <i className="bx bx-check" />
                        )}
                      </div>
                      <div
                        className={`co-avatar ${c.avClass}`}
                        style={{ width: 38, height: 38, fontSize: 13 }}
                      >
                        {c.initials}
                      </div>
                      <span>{c.name}</span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="co-group-footer">
              <span className="co-group-count">
                {groupMembers.size} selected
              </span>
              <button
                className="co-btn-create"
                disabled={!groupName.trim() || groupMembers.size === 0}
                onClick={createGroup}
              >
                Create Group <i className="bx bx-chevron-right" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODALS ══ */}
      {modal?.type === "deleteMsg" && (
        <div className="co-modal-backdrop" onClick={() => setModal(null)}>
          <div className="co-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete message?</h3>
            <div className="co-modal-actions col">
              {[...selMsgs].every(
                (id) => msgs.find((m) => m.id === id)?.type === "sent",
              ) && (
                <button className="co-btn-outline" onClick={execDeleteEveryone}>
                  Delete for everyone
                </button>
              )}
              <button className="co-btn-subtle" onClick={execDeleteForMe}>
                Delete for me
              </button>
              <button className="co-btn-text" onClick={() => setModal(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {modal?.type === "clearChat" && (
        <div className="co-modal-backdrop" onClick={() => setModal(null)}>
          <div className="co-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Clear this chat?</h3>
            <p>
              All messages will be permanently deleted. This cannot be undone.
            </p>
            <div className="co-modal-actions">
              <button className="co-btn-cancel" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button
                className="co-btn-danger"
                onClick={() => execClear(modal.payload)}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
      {modal?.type === "block" && (
        <div className="co-modal-backdrop" onClick={() => setModal(null)}>
          <div className="co-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Block this contact?</h3>
            <p>
              You won't receive messages from them. They won't know they've been
              blocked.
            </p>
            <div className="co-modal-actions">
              <button className="co-btn-cancel" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button
                className="co-btn-danger"
                onClick={() => execBlock(modal.payload)}
              >
                Block
              </button>
            </div>
          </div>
        </div>
      )}
      {modal?.type === "deleteContact" && (
        <div className="co-modal-backdrop" onClick={() => setModal(null)}>
          <div className="co-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete this chat?</h3>
            <p>The entire conversation will be removed permanently.</p>
            <div className="co-modal-actions">
              <button className="co-btn-cancel" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button
                className="co-btn-danger"
                onClick={() => execDeleteContact(modal.payload)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {modal?.type === "leaveGroup" && (
        <div className="co-modal-backdrop" onClick={() => setModal(null)}>
          <div className="co-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Leave group?</h3>
            <p>You will no longer receive messages from this group.</p>
            <div className="co-modal-actions">
              <button className="co-btn-cancel" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button
                className="co-btn-danger"
                onClick={() => {
                  execDeleteContact(modal.payload);
                  addToast("You left the group", "info");
                }}
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ FORWARD MODAL ══ */}
      {fwdModal && (
        <div className="co-modal-backdrop" onClick={() => setFwdModal(null)}>
          <div className="co-fwd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="co-fwd-header">
              <button className="co-icon-btn" onClick={() => setFwdModal(null)}>
                <i className="bx bx-x" />
              </button>
              <h3>Forward to</h3>
            </div>
            <div className="co-fwd-list">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className={`co-fwd-item${fwdSel.has(c.id) ? " sel" : ""}`}
                  onClick={() =>
                    setFwdSel((p) => {
                      const n = new Set(p);
                      n.has(c.id) ? n.delete(c.id) : n.add(c.id);
                      return n;
                    })
                  }
                >
                  <div className="co-fwd-check">
                    {fwdSel.has(c.id) && <i className="bx bx-check" />}
                  </div>
                  <div
                    className={`co-avatar ${c.avClass}`}
                    style={{ width: 38, height: 38, fontSize: 13 }}
                  >
                    {c.initials}
                  </div>
                  <span>{c.name}</span>
                </div>
              ))}
            </div>
            <button
              className="co-fwd-send"
              disabled={fwdSel.size === 0}
              onClick={doForward}
            >
              <i className="bx bx-send" />
            </button>
          </div>
        </div>
      )}

      {/* ══ PROFILE CARD POPUP ══ */}
      {profileCard && (
        <ProfileCardPopup
          contact={profileCard.contact}
          onClose={() => setProfileCard(null)}
          onViewProfile={() => {
            setProfileCard(null);
            navigate("/profile");
          }}
        />
      )}

      {/* ══ TOAST NOTIFICATIONS ══ */}
      <div className="co-toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`co-toast co-toast-${t.type}`}>
            {t.type === "success" ? (
              <i className="bx bx-check-circle" />
            ) : (
              <i className="bx bx-info-circle" />
            )}
            {t.msg}
          </div>
        ))}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════
   MsgBubble
═══════════════════════════════════════════════ */
function MsgBubble({
  msg,
  contact,
  selMode,
  isSel,
  reaction,
  inviteStatus,
  onClick,
  onCtx,
  onArrow,
  onImageClick,
  onInviteAction,
  onAvatarLongPress,
}) {
  const touchRef = useRef(null);
  const isSent = msg.type === "sent";

  const onTouchStart = (e) => {
    touchRef.current = setTimeout(() => {
      const t = e.touches[0];
      onCtx({
        preventDefault: () => {},
        clientX: t.clientX,
        clientY: t.clientY,
      });
    }, 500);
  };
  const onTouchEnd = () => clearTimeout(touchRef.current);

  // Render invite bubble
  if (msg.invite) {
    const status = inviteStatus;
    return (
      <div className="co-msg received">
        <AvatarWithPress
          contact={contact}
          size={28}
          fontSize={10}
          onLongPress={onAvatarLongPress}
        />
        <div className="co-msg-content">
          <div className="co-invite-bubble">
            <div className="co-invite-icon">
              <i className="bx bx-group" />
            </div>
            <div className="co-invite-info">
              <span className="co-invite-title">Group Invitation</span>
              <span className="co-invite-name">"{msg.groupName}"</span>
            </div>
            {!status ? (
              <div className="co-invite-actions">
                <button
                  className="co-invite-reject"
                  onClick={() => onInviteAction("rejected")}
                >
                  <i className="bx bx-x" /> Decline
                </button>
                <button
                  className="co-invite-accept"
                  onClick={() => onInviteAction("accepted")}
                >
                  <i className="bx bx-check" /> Accept
                </button>
              </div>
            ) : (
              <div className={`co-invite-status ${status}`}>
                <i
                  className={`bx ${status === "accepted" ? "bx-check-circle" : "bx-x-circle"}`}
                />
                {status === "accepted" ? "Joined!" : "Declined"}
              </div>
            )}
            <span
              className="co-timestamp"
              style={{
                position: "relative",
                bottom: "auto",
                right: "auto",
                marginTop: 6,
                display: "block",
                textAlign: "right",
              }}
            >
              {msg.time}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`co-msg ${msg.type}${isSel ? " selected" : ""}`}
      onClick={onClick}
    >
      {!isSent && (
        <AvatarWithPress
          contact={contact}
          size={28}
          fontSize={10}
          onLongPress={onAvatarLongPress}
          style={{ alignSelf: "flex-end" }}
        />
      )}
      <div className="co-msg-content">
        {msg.deleted ? (
          <div className={`co-bubble ${msg.type} deleted`}>
            <div className="co-deleted-notice">
              <i className="bx bx-block" />
              <span>
                {isSent
                  ? "You deleted this message"
                  : "This message was deleted"}
              </span>
            </div>
            <span className="co-timestamp">{msg.time}</span>
          </div>
        ) : msg.system ? (
          <div className="co-system-msg">{msg.text}</div>
        ) : (
          <div
            className={`co-bubble ${msg.type}`}
            onContextMenu={onCtx}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onTouchMove={onTouchEnd}
          >
            {msg.forwarded && (
              <div className="co-forwarded-label">
                <i className="bx bx-transfer-alt" /> Forwarded
              </div>
            )}
            {msg.reply && (
              <div className="co-reply-quote">
                <span className="co-reply-user">{msg.reply.user}</span>
                <span className="co-reply-text">{msg.reply.text}</span>
              </div>
            )}

            {/* Image attachment — clickable for lightbox */}
            {msg.image && (
              <div
                className="co-img-msg"
                onClick={(e) => {
                  e.stopPropagation();
                  onImageClick && onImageClick(msg.image);
                }}
              >
                <img src={msg.image} alt={msg.fileName || "attachment"} />
                <div className="co-img-overlay">
                  <i className="bx bx-zoom-in" />
                </div>
              </div>
            )}

            {/* Audio attachment */}
            {msg.audio && (
              <div className="co-audio-msg">
                <i className="bx bx-microphone" />
                <audio controls src={msg.audio} />
              </div>
            )}

            {/* Document attachment */}
            {msg.document && (
              <a
                className="co-doc-msg"
                href={msg.document}
                download={msg.fileName}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="co-doc-icon">
                  <i className="bx bx-file-blank" />
                </div>
                <div className="co-doc-info">
                  <span className="co-doc-name">{msg.fileName}</span>
                  <span className="co-doc-size">{msg.fileSize}</span>
                </div>
                <i className="bx bx-download co-doc-dl" />
              </a>
            )}

            {msg.text && (
              <div
                className="co-msg-text"
                dangerouslySetInnerHTML={{ __html: escapeHtml(msg.text) }}
              />
            )}

            <button className="co-arrow-btn" onClick={onArrow}>
              <i className="bx bx-chevron-down" />
            </button>
            <span className="co-timestamp">{msg.time}</span>
          </div>
        )}
        {reaction && <div className="co-reaction">{reaction}</div>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   EmojiPicker
═══════════════════════════════════════════════ */
function EmojiPicker({ tab, query, onTab, onQuery, onPick, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const fn = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    setTimeout(() => document.addEventListener("click", fn), 10);
    return () => document.removeEventListener("click", fn);
  }, [onClose]);
  return (
    <div
      className="co-emoji-picker"
      ref={ref}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="co-ep-header">
        <div className="co-ep-search-wrap">
          <i className="bx bx-search" />
          <input
            className="co-ep-search"
            placeholder="Search emoji…"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
          />
        </div>
        <button className="co-ep-close" onClick={onClose}>
          <i className="bx bx-x" />
        </button>
      </div>
      <div className="co-ep-tabs">
        {Object.keys(EMOJI_CATS).map((cat) => (
          <button
            key={cat}
            className={`co-ep-tab${tab === cat ? " active" : ""}`}
            onClick={() => onTab(cat)}
          >
            {cat.split(" ")[0]}
          </button>
        ))}
      </div>
      <div className="co-ep-body">
        {Object.entries(EMOJI_CATS).map(([cat, emojis]) => {
          if (!query && cat !== tab) return null;
          const filtered = query
            ? emojis.filter(
                (e) =>
                  cat.toLowerCase().includes(query.toLowerCase()) ||
                  e.includes(query),
              )
            : emojis;
          return (
            <div key={cat}>
              {query && <div className="co-ep-cat">{cat}</div>}
              <div className="co-ep-grid">
                {filtered.map((em) => (
                  <span
                    key={em}
                    className="co-ep-em"
                    onClick={() => onPick(em)}
                  >
                    {em}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   BubbleMenu
═══════════════════════════════════════════════ */
function BubbleMenu({
  x,
  y,
  msgType,
  onClose,
  onReact,
  onReply,
  onCopy,
  onForward,
  onSelect,
  onDelete,
}) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ left: x, top: y });
  useEffect(() => {
    if (!ref.current) return;
    const pw = ref.current.offsetWidth || 220,
      ph = ref.current.offsetHeight || 300;
    const vw = window.innerWidth,
      vh = window.innerHeight;
    let lx = x,
      ly = y;
    if (lx + pw + 10 > vw) lx = vw - pw - 10;
    if (ly + ph + 10 > vh) ly = vh - ph - 10;
    if (lx < 10) lx = 10;
    if (ly < 10) ly = 10;
    setPos({ left: lx, top: ly });
  }, [x, y]);
  const items = [
    { icon: "bx-undo", label: "Reply", fn: onReply },
    { icon: "bx-copy", label: "Copy", fn: onCopy },
    { icon: "bx-transfer-alt", label: "Forward", fn: onForward },
    { icon: "bx-check-square", label: "Select", fn: onSelect },
    { icon: "bx-trash", label: "Delete", fn: onDelete, danger: true },
  ];
  return (
    <>
      <div className="co-bm-backdrop" onClick={onClose} />
      <div ref={ref} className="co-bm-popup" style={pos}>
        <div className="co-bm-emoji-row">
          {QUICK_EMOJIS.map((em) => (
            <span key={em} className="co-bm-emoji" onClick={() => onReact(em)}>
              {em}
            </span>
          ))}
        </div>
        {items.map((item) => (
          <div
            key={item.label}
            className={`co-bm-item${item.danger ? " danger" : ""}`}
            onClick={item.fn}
          >
            <i className={`bx ${item.icon}`} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════
   ContactCtxMenu
═══════════════════════════════════════════════ */
function ContactCtxMenu({ x, y, isMuted, onClose, onAction }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ left: x, top: y });
  useEffect(() => {
    if (!ref.current) return;
    const pw = ref.current.offsetWidth || 200,
      ph = ref.current.offsetHeight || 170;
    const vw = window.innerWidth,
      vh = window.innerHeight;
    let lx = x,
      ly = y;
    if (lx + pw + 10 > vw) lx = vw - pw - 10;
    if (ly + ph + 10 > vh) ly = vh - ph - 10;
    setPos({ left: lx, top: ly });
  }, [x, y]);
  const items = [
    {
      icon: "bx-bell-off",
      label: isMuted ? "Unmute" : "Mute notifications",
      action: "mute",
    },
    { icon: "bx-block", label: "Block", action: "block" },
    { icon: "bx-minus-circle", label: "Clear chat", action: "clear" },
    { icon: "bx-trash", label: "Delete chat", action: "delete", danger: true },
  ];
  return (
    <>
      <div className="co-ctx-backdrop" onClick={onClose} />
      <div ref={ref} className="co-ctx-popup" style={pos}>
        {items.map((item) => (
          <div
            key={item.action}
            className={`co-ctx-item${item.danger ? " danger" : ""}`}
            onClick={() => onAction(item.action)}
          >
            <i className={`bx ${item.icon}`} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════
   AvatarWithPress — click navigates, long-press shows card
═══════════════════════════════════════════════ */
function AvatarWithPress({
  contact,
  size = 44,
  fontSize = 14,
  onClick,
  onLongPress,
  style = {},
}) {
  const pressTimer = useRef(null);
  const didLongPress = useRef(false);

  const start = (e) => {
    didLongPress.current = false;
    pressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      onLongPress && onLongPress();
    }, 550);
  };
  const end = (e) => {
    clearTimeout(pressTimer.current);
  };
  const handleClick = (e) => {
    if (didLongPress.current) {
      e.stopPropagation();
      return;
    }
    onClick && onClick(e);
  };

  return (
    <div
      className={`co-avatar ${contact.avClass} co-avatar-pressable`}
      style={{
        width: size,
        height: size,
        fontSize,
        position: "relative",
        cursor: "pointer",
        ...style,
      }}
      onMouseDown={start}
      onMouseUp={end}
      onMouseLeave={end}
      onTouchStart={start}
      onTouchEnd={end}
      onTouchCancel={end}
      onClick={handleClick}
    >
      {contact.initials}
      {contact.isGroup && (
        <span className="co-group-badge">
          <i className="bx bx-group" />
        </span>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ProfileCardPopup
═══════════════════════════════════════════════ */
function ProfileCardPopup({ contact, onClose, onViewProfile }) {
  return (
    <>
      <div className="co-profile-backdrop" onClick={onClose} />
      <div className="co-profile-popup">
        <button className="co-profile-close" onClick={onClose}>
          <i className="bx bx-x" />
        </button>
        <div className="co-profile-card">
          <div className={`co-profile-av ${contact.avClass}`}>
            {contact.initials}
            {contact.isGroup && (
              <span className="co-profile-group-badge">
                <i className="bx bx-group" />
              </span>
            )}
          </div>
          <div className="co-profile-glow" />
        </div>
        <div className="co-profile-name">{contact.name}</div>
        <div className="co-profile-sub">
          {contact.isGroup ? (
            `${contact.members?.length || 0} members`
          ) : (
            <span className="co-profile-online">
              <span className="co-profile-dot" />
              Online
            </span>
          )}
        </div>
        {!contact.isGroup && (
          <button className="co-profile-view-btn" onClick={onViewProfile}>
            <i className="bx bx-user" /> View Profile
          </button>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════
   CSS (injected as a string to keep single file)
═══════════════════════════════════════════════ */
const CHAT_CSS = `
.co-overlay {
  position: fixed; top: 57px; left: 0; right: 0; bottom: 62px;
  z-index: 50; display: flex; animation: coFadeIn 0.2s ease;
}
@keyframes coFadeIn { from { opacity: 0; } to { opacity: 1; } }

.co-shell {
  display: flex; width: 100%; height: 100%;
  background: #0a0a0a; overflow: hidden;
  animation: coSlideUp 0.22s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes coSlideUp { from { transform: translateY(16px); opacity: 0; } to { transform: none; opacity: 1; } }

.co-avatar {
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-weight: 700; color: #fff; flex-shrink: 0; width: 44px; height: 44px; font-size: 14px;
}
.av-blue { background: linear-gradient(135deg,#667eea,#764ba2); }
.av-pink { background: linear-gradient(135deg,#f093fb,#f5576c); }
.av-green { background: linear-gradient(135deg,#4facfe,#00f2fe); color: #000 !important; }
.av-purple { background: linear-gradient(135deg,#a78bfa,#7c3aed); }

.co-group-badge {
  position: absolute; bottom: -2px; right: -2px;
  background: #7c3aed; border-radius: 50%; width: 16px; height: 16px;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid #111;
}
.co-group-badge i { font-size: 9px; color: #fff; }
.co-group-tag { font-size: 11px; color: #a78bfa; font-weight: 400; }

/* LEFT */
.co-left {
  width: 340px; min-width: 280px; max-width: 380px; height: 100%;
  background: #111; border-right: 1px solid #1e1e1e;
  display: flex; flex-direction: column; flex-shrink: 0;
}
.co-left-header {
  padding: 14px 16px 10px; display: flex; align-items: center;
  justify-content: space-between; border-bottom: 1px solid #1a1a1a; flex-shrink: 0;
}
.co-left-title { font-size: 18px; font-weight: 700; color: #fff; }

.co-search {
  margin: 10px 12px; background: #1a1a1a; border-radius: 22px;
  border: 1px solid #2a2a2a; display: flex; align-items: center;
  gap: 8px; padding: 8px 14px; flex-shrink: 0; transition: border-color 0.2s;
}
.co-search:focus-within { border-color: #a78bfa55; }
.co-search i { color: #555; font-size: 17px; flex-shrink: 0; }
.co-search input { background: transparent; border: none; outline: none; color: #fff; font-size: 14px; width: 100%; }
.co-search input::placeholder { color: #444; }

.co-list { flex: 1; overflow-y: auto; }
.co-list::-webkit-scrollbar { width: 3px; }
.co-list::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 4px; }

.co-item {
  display: flex; align-items: center; gap: 12px; padding: 11px 14px;
  cursor: pointer; transition: background 0.15s; border-bottom: 1px solid #161616; user-select: none;
}
.co-item:hover { background: #161616; }
.co-item.active { background: #1a1a2e; border-left: 3px solid #a78bfa; }
.co-item.blocked .co-preview { color: #ef4444; font-style: italic; }

.co-info { flex: 1; min-width: 0; }
.co-name-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 3px; }
.co-name { font-weight: 600; font-size: 14px; color: #eee; }
.co-ctime { font-size: 11px; color: #555; flex-shrink: 0; }
.co-preview-row { display: flex; justify-content: space-between; align-items: center; }
.co-preview { font-size: 13px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
.co-unread {
  background: #a78bfa; color: #fff; font-size: 11px; font-weight: 700;
  min-width: 20px; height: 20px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  padding: 0 5px; flex-shrink: 0; margin-left: 6px;
}
.co-empty-list { text-align: center; padding: 40px 20px; }
.co-empty-list i { font-size: 32px; color: #333; display: block; margin-bottom: 10px; }
.co-empty-list p { font-size: 14px; color: #666; }

/* RIGHT */
.co-right { flex: 1; height: 100%; display: flex; flex-direction: column; background: #0d0d0d; overflow: hidden; }
.co-no-chat {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 12px; text-align: center; padding: 40px;
}
.co-no-chat-icon {
  width: 72px; height: 72px; border-radius: 50%; background: #1a1a1a;
  border: 1px solid #2a2a2a; display: flex; align-items: center; justify-content: center;
}
.co-no-chat-icon i { font-size: 32px; color: #a78bfa; }
.co-no-chat h3 { font-size: 17px; color: #888; font-weight: 500; }
.co-no-chat p { font-size: 13px; color: #444; max-width: 240px; line-height: 1.5; }
.co-chat-view { display: flex; flex-direction: column; height: 100%; }

/* Header */
.co-header {
  background: #111; padding: 10px 14px; display: flex; align-items: center;
  gap: 10px; border-bottom: 1px solid #1a1a1a; flex-shrink: 0;
}
.co-back-btn {
  background: transparent; border: none; color: #a78bfa; font-size: 22px; cursor: pointer;
  display: flex; align-items: center; padding: 2px; border-radius: 50%; transition: background 0.15s;
}
.co-back-btn:hover { background: #1e1e1e; }
.co-header-info { flex: 1; min-width: 0; }
.co-header-name { color: #fff; font-weight: 600; font-size: 15px; }
.co-header-status { color: #10b981; font-size: 12px; }
.co-typing-status { color: #a78bfa; }

.co-icon-btn {
  background: transparent; border: none; color: #888; font-size: 20px; cursor: pointer;
  width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center;
  justify-content: center; transition: all 0.2s; flex-shrink: 0;
}
.co-icon-btn:hover { background: #1e1e1e; color: #a78bfa; }

.co-menu-wrap { position: relative; }
.co-menu-dropdown {
  position: absolute; top: calc(100% + 6px); right: 0; background: #1a1a1a;
  border: 1px solid #2a2a2a; border-radius: 12px; min-width: 175px;
  box-shadow: 0 8px 28px rgba(0,0,0,0.7); z-index: 150; overflow: hidden;
  animation: coDropIn 0.15s ease;
}
@keyframes coDropIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
.co-menu-item {
  display: flex; align-items: center; gap: 10px; padding: 12px 14px;
  font-size: 14px; cursor: pointer; color: #ccc; border-bottom: 1px solid #222; transition: background 0.15s;
}
.co-menu-item:last-child { border-bottom: none; }
.co-menu-item:hover { background: #222; }
.co-menu-item i { font-size: 18px; color: #a78bfa; }
.co-menu-item.danger { color: #ef4444; }
.co-menu-item.danger i { color: #ef4444; }
.co-menu-item.danger:hover { background: #2a1515; }

/* ═══ MESSAGES ═══ */
.co-messages {
  flex: 1; overflow-y: auto; min-height: 0; padding: 14px 16px;
  display: flex; flex-direction: column; gap: 6px;
  background: #0d0d0d;
  background-image: radial-gradient(circle, #1c1c1c 1px, transparent 1px);
  background-size: 28px 28px;
}
.co-messages::-webkit-scrollbar { width: 3px; }
.co-messages::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 4px; }

.co-day-divider { display: flex; align-items: center; gap: 10px; margin: 4px 0; }
.co-day-divider::before,.co-day-divider::after { content: ""; flex: 1; height: 1px; background: #1e1e1e; }
.co-day-divider span {
  color: #555; font-size: 11px; white-space: nowrap;
  background: #161616; padding: 3px 10px; border-radius: 10px; border: 1px solid #222;
}

/* ── Say Hi stickers ── */
.co-sayhi-wrap {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; flex: 1; padding: 32px 16px; gap: 10px;
  animation: coFadeIn 0.3s ease;
}
.co-sayhi-avatar { margin-bottom: 4px; }
.co-sayhi-name { font-size: 18px; font-weight: 700; color: #eee; margin: 0; }
.co-sayhi-hint { font-size: 13px; color: #555; margin: 0 0 8px; }
.co-sayhi-stickers { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.co-sayhi-btn {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 16px;
  padding: 12px 16px; cursor: pointer; font-family: inherit;
  transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
  animation: coStickerIn 0.4s ease both;
}
@keyframes coStickerIn { from { opacity: 0; transform: scale(0.6) translateY(20px); } to { opacity: 1; transform: none; } }
.co-sayhi-btn:hover { background: #2e2550; border-color: #a78bfa; transform: scale(1.08) translateY(-2px); }
.co-sayhi-emoji { font-size: 28px; line-height: 1; }
.co-sayhi-label { font-size: 11px; color: #888; white-space: nowrap; }

.co-system-msg {
  align-self: center; background: #1a1a2e; border: 1px solid #2e2e50;
  color: #a78bfa; font-size: 12px; padding: 6px 14px;
  border-radius: 10px; text-align: center; max-width: 280px; line-height: 1.4;
}

.co-system-notice {
  align-self: center; background: #1a1a1a; border: 1px solid #2a2a2a;
  color: #888; font-size: 12px; padding: 6px 14px; border-radius: 10px;
  cursor: pointer; text-align: center; transition: background 0.15s, color 0.15s;
}
.co-system-notice:hover { background: #222; color: #a78bfa; }

/* ── Message bubble ── */
.co-msg { display: flex; gap: 8px; max-width: 68%; position: relative; }
.co-msg.sent { align-self: flex-end; flex-direction: row-reverse; margin-left: auto; }
.co-msg.received { align-self: flex-start; margin-right: auto; }
.co-msg.selected .co-bubble { outline: 2px solid #22c55e !important; border-radius: 18px; }

.co-msg-content { display: flex; flex-direction: column; gap: 0; position: relative; }

.co-bubble {
  min-width: 80px; padding: 8px 12px 22px; border-radius: 18px;
  word-wrap: break-word; position: relative; cursor: default; user-select: text;
}
.co-bubble.sent { background: #7c3aed; border-bottom-right-radius: 4px; }
.co-bubble.received { background: #1e1e1e; border-bottom-left-radius: 4px; border: 1px solid #2a2a2a; }
.co-bubble.deleted { opacity: 0.65; }
.co-bubble.sent.deleted { background: #3b1f6a !important; }
.co-bubble.received.deleted { background: #181818 !important; }

.co-msg-text { color: #fff; font-size: 14px; line-height: 1.45; word-wrap: break-word; }

.co-timestamp {
  position: absolute; bottom: 5px; right: 10px;
  font-size: 10px; color: rgba(255,255,255,0.45); white-space: nowrap; pointer-events: none; line-height: 1;
}

.co-reaction {
  align-self: flex-end; display: inline-flex; align-items: center; justify-content: center;
  background: #1e1e1e; border: 1px solid #333; border-radius: 12px;
  padding: 2px 7px; font-size: 14px; margin-top: 3px; line-height: 1.4;
}
.co-msg.received .co-reaction { align-self: flex-start; }

.co-arrow-btn {
  position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.25);
  border: none; border-radius: 50%; width: 22px; height: 22px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; opacity: 0; transition: opacity 0.15s;
  color: #fff; font-size: 14px; padding: 0; z-index: 2;
}
.co-bubble:hover .co-arrow-btn { opacity: 1; }
.co-arrow-btn:hover { background: rgba(0,0,0,0.5); }

.co-deleted-notice { display: flex; align-items: center; gap: 7px; font-size: 13px; color: rgba(255,255,255,0.45); font-style: italic; }
.co-deleted-notice i { font-size: 14px; }

.co-forwarded-label {
  display: flex; align-items: center; gap: 5px; font-size: 11px;
  color: rgba(255,255,255,0.5); margin-bottom: 4px; font-style: italic;
}
.co-reply-quote {
  background: rgba(0,0,0,0.2); border-left: 3px solid rgba(255,255,255,0.4);
  padding: 5px 8px; margin-bottom: 5px; border-radius: 6px;
}
.co-bubble.received .co-reply-quote { border-left-color: #a78bfa; background: rgba(167,139,250,0.1); }
.co-reply-user { display: block; color: #a78bfa; font-weight: 700; font-size: 12px; margin-bottom: 2px; }
.co-bubble.sent .co-reply-user { color: rgba(255,255,255,0.85); }
.co-reply-text { color: rgba(255,255,255,0.55); font-size: 12px; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 220px; }

/* ── Image ── */
.co-img-msg {
  margin-bottom: 4px; border-radius: 12px; overflow: hidden;
  max-width: 240px; cursor: pointer; position: relative;
}
.co-img-msg img { width: 100%; display: block; border-radius: 12px; object-fit: cover; max-height: 220px; }
.co-img-overlay {
  position: absolute; inset: 0; background: rgba(0,0,0,0); border-radius: 12px;
  display: flex; align-items: center; justify-content: center; transition: background 0.2s;
}
.co-img-overlay i { font-size: 28px; color: #fff; opacity: 0; transition: opacity 0.2s; }
.co-img-msg:hover .co-img-overlay { background: rgba(0,0,0,0.35); }
.co-img-msg:hover .co-img-overlay i { opacity: 1; }

/* ── Audio ── */
.co-audio-msg { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; padding: 6px 0 2px; }
.co-audio-msg i { font-size: 20px; color: rgba(255,255,255,0.7); flex-shrink: 0; }
.co-audio-msg audio { flex: 1; min-width: 0; height: 32px; border-radius: 20px; accent-color: #a78bfa; }

/* ── Document ── */
.co-doc-msg {
  display: flex; align-items: center; gap: 10px; padding: 8px 6px 10px;
  text-decoration: none; margin-bottom: 4px; min-width: 180px;
}
.co-doc-icon {
  width: 40px; height: 40px; border-radius: 10px; background: rgba(167,139,250,0.2);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.co-doc-icon i { font-size: 22px; color: #a78bfa; }
.co-doc-info { flex: 1; min-width: 0; }
.co-doc-name { display: block; font-size: 13px; color: #fff; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px; }
.co-doc-size { font-size: 11px; color: rgba(255,255,255,0.45); }
.co-doc-dl { font-size: 18px; color: rgba(255,255,255,0.5); flex-shrink: 0; }
.co-doc-msg:hover .co-doc-dl { color: #a78bfa; }

/* ── Typing ── */
.co-typing { display: flex; align-items: flex-end; gap: 8px; align-self: flex-start; margin-right: auto; }
.co-typing-bubble { background: #1e1e1e; border: 1px solid #2a2a2a; border-radius: 18px; border-bottom-left-radius: 4px; padding: 12px 16px; display: flex; align-items: center; gap: 5px; }
.co-dot { width: 7px; height: 7px; border-radius: 50%; background: #888; display: inline-block; animation: coBounce 1.2s infinite ease-in-out; }
.co-dot:nth-child(1) { animation-delay: 0s; }
.co-dot:nth-child(2) { animation-delay: 0.2s; }
.co-dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes coBounce { 0%,60%,100% { transform: translateY(0); background: #555; } 30% { transform: translateY(-6px); background: #a78bfa; } }

/* ── Block bar ── */
.co-block-bar {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  background: #111; border-top: 1px solid #2a2a2a; padding: 10px 16px;
  font-size: 13px; color: #888; flex-shrink: 0;
}
.co-block-bar i { color: #ef4444; font-size: 16px; }
.co-block-bar button {
  background: transparent; border: 1px solid #a78bfa; color: #a78bfa;
  padding: 4px 14px; border-radius: 20px; font-size: 13px; cursor: pointer;
  transition: all 0.2s; font-family: inherit;
}
.co-block-bar button:hover { background: #a78bfa; color: #fff; }

/* ── Select bar ── */
.co-select-bar {
  display: flex; align-items: center; gap: 10px; background: #111;
  border-top: 1px solid #2a2a2a; padding: 10px 14px; flex-shrink: 0;
  animation: coSlideUp2 0.2s ease;
}
@keyframes coSlideUp2 { from { transform: translateY(100%); opacity: 0; } to { transform: none; opacity: 1; } }
.co-sel-cancel { background: transparent; border: none; color: #888; font-size: 22px; cursor: pointer; display: flex; align-items: center; transition: color 0.15s; }
.co-sel-cancel:hover { color: #fff; }
.co-sel-count { font-size: 15px; font-weight: 600; color: #fff; flex: 1; }
.co-sel-actions { display: flex; align-items: center; gap: 4px; }
.co-sel-btn {
  background: transparent; border: none; color: #888; font-size: 21px; cursor: pointer;
  width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center;
  justify-content: center; transition: all 0.15s;
}
.co-sel-btn:hover { background: #1e1e1e; color: #a78bfa; }

/* ═══ INPUT AREA ═══ */
.co-input-area {
  padding: 8px 14px 15px; background: #0d0d0d; border-top: 1px solid #1a1a1a;
  display: flex; flex-direction: column; gap: 0; flex-shrink: 0; position: relative;
}
.co-input-area.disabled { opacity: 0.4; pointer-events: none; }

.co-reply-preview {
  display: flex; align-items: center; gap: 10px; padding: 7px 12px 5px;
  border-left: 3px solid #a78bfa; background: #1a1a2a; margin-bottom: 6px;
}
.co-reply-content { flex: 1; font-size: 12px; color: #aaa; min-width: 0; }
.co-reply-content strong { display: block; color: #a78bfa; font-size: 12px; font-weight: 600; margin-bottom: 1px; }
.co-reply-content span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; color: #888; }
.co-close-reply { background: none; border: none; color: #555; cursor: pointer; font-size: 18px; flex-shrink: 0; transition: color 0.15s; display: flex; align-items: center; }
.co-close-reply:hover { color: #fff; }

.co-input-box {
  background: #161616; border: 1px solid #2a2a2a; border-radius: 26px;
  overflow: visible; transition: border-color 0.2s;
}
.co-input-box:focus-within { border-color: #a78bfa55; }
.co-input-row { display: flex; align-items: center; gap: 10px; padding: 9px 12px; position: relative; }
.co-input-row input { background: transparent; border: none; outline: none; color: #fff; flex: 1; font-size: 14px; font-family: inherit; }
.co-input-row input::placeholder { color: #444; }

/* Attach */
.co-attach-wrap { position: relative; flex-shrink: 0; }
.co-attach-btn {
  background: transparent; border: none; color: #555; font-size: 22px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;
  border-radius: 50%; transition: color 0.2s, background 0.2s; flex-shrink: 0;
}
.co-attach-btn:hover { color: #a78bfa; background: #1e1e1e; }

.co-attach-popup {
  position: absolute; bottom: calc(100% + 14px); left: 0;
  background: #1c1c1c; border: 1px solid #2e2e2e; border-radius: 16px;
  padding: 8px; display: flex; flex-direction: column; gap: 2px;
  min-width: 185px; box-shadow: 0 -8px 32px rgba(0,0,0,0.7);
  z-index: 200; animation: coSlideUpPop 0.18s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes coSlideUpPop { from { opacity: 0; transform: translateY(10px) scale(0.95); } to { opacity: 1; transform: none; } }
.co-attach-item {
  display: flex; align-items: center; gap: 12px; padding: 10px 12px;
  background: transparent; border: none; border-radius: 12px; cursor: pointer;
  font-size: 14px; color: #ddd; font-family: inherit; transition: background 0.13s;
  text-align: left; width: 100%;
}
.co-attach-item:hover { background: #272727; }
.co-attach-icon {
  width: 38px; height: 38px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; flex-shrink: 0;
}
.co-attach-icon.doc-icon { background: linear-gradient(135deg,#667eea,#764ba2); color: #fff; }
.co-attach-icon.img-icon { background: linear-gradient(135deg,#f093fb,#f5576c); color: #fff; }
.co-attach-icon.cam-icon { background: linear-gradient(135deg,#f7971e,#ffd200); color: #000; }
.co-attach-icon.aud-icon { background: linear-gradient(135deg,#4facfe,#00f2fe); color: #000; }

.co-emoji-toggle { color: #555; font-size: 20px; cursor: pointer; transition: color 0.2s; flex-shrink: 0; }
.co-emoji-toggle:hover { color: #a78bfa; }

.co-send-btn {
  background: #7c3aed; border: none; color: #fff; font-size: 16px; cursor: pointer;
  width: 34px; height: 34px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
}
.co-send-btn:hover:not(:disabled) { background: #6d28d9; transform: scale(1.1); }
.co-send-btn:active { transform: scale(0.9); }
.co-send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

.co-mic-btn {
  background: transparent; border: none; color: #888; font-size: 22px; cursor: pointer;
  width: 34px; height: 34px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  transition: all 0.2s; flex-shrink: 0;
}
.co-mic-btn:hover:not(:disabled) { color: #a78bfa; background: #1e1e1e; }
.co-mic-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Recording bar ── */
.co-recording-bar {
  display: flex; align-items: center; gap: 12px;
  background: #161616; border: 1px solid #2a2a2a; border-radius: 26px;
  padding: 8px 12px; animation: coFadeIn 0.2s ease;
}
.co-rec-cancel {
  background: transparent; border: none; color: #ef4444; font-size: 22px;
  cursor: pointer; display: flex; align-items: center; flex-shrink: 0; transition: opacity 0.15s;
}
.co-rec-indicator { display: flex; align-items: center; gap: 8px; flex: 1; }
.co-rec-dot {
  width: 10px; height: 10px; border-radius: 50%; background: #ef4444;
  animation: coPulseRed 1s ease-in-out infinite; flex-shrink: 0;
}
@keyframes coPulseRed { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } }
.co-rec-time { font-size: 16px; font-weight: 600; color: #fff; font-variant-numeric: tabular-nums; }
.co-rec-label { font-size: 12px; color: #888; }
.co-rec-send {
  background: #7c3aed; border: none; color: #fff; font-size: 16px; cursor: pointer;
  width: 38px; height: 38px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
}
.co-rec-send:hover { background: #6d28d9; transform: scale(1.1); }

/* Emoji picker */
.co-emoji-picker {
  position: absolute; bottom: calc(100% + 6px); left: 14px; right: 14px;
  background: #161616; border: 1px solid #2a2a2a; border-radius: 16px;
  height: 300px; display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 -8px 32px rgba(0,0,0,0.6); animation: coFadeIn 0.15s ease; z-index: 150;
}
.co-ep-header { display: flex; align-items: center; gap: 6px; padding: 8px 10px 6px; border-bottom: 1px solid #222; flex-shrink: 0; }
.co-ep-search-wrap { flex: 1; display: flex; align-items: center; gap: 6px; background: #1e1e1e; border-radius: 20px; padding: 5px 10px; }
.co-ep-search-wrap i { color: #555; font-size: 15px; flex-shrink: 0; }
.co-ep-search { background: transparent; border: none; outline: none; color: #fff; font-size: 13px; flex: 1; }
.co-ep-search::placeholder { color: #444; }
.co-ep-close { background: transparent; border: none; color: #666; font-size: 20px; cursor: pointer; display: flex; align-items: center; flex-shrink: 0; transition: color 0.15s; padding: 2px; }
.co-ep-close:hover { color: #fff; }
.co-ep-tabs { display: flex; overflow-x: auto; gap: 2px; padding: 5px 8px; border-bottom: 1px solid #1e1e1e; flex-shrink: 0; scrollbar-width: none; }
.co-ep-tabs::-webkit-scrollbar { display: none; }
.co-ep-tab { background: transparent; border: none; font-size: 18px; cursor: pointer; padding: 4px 6px; border-radius: 8px; transition: background 0.15s; flex-shrink: 0; }
.co-ep-tab:hover { background: #2a2a2a; }
.co-ep-tab.active { background: #2e2550; }
.co-ep-body { flex: 1; overflow-y: auto; padding: 6px 8px; }
.co-ep-body::-webkit-scrollbar { width: 3px; }
.co-ep-body::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 4px; }
.co-ep-cat { font-size: 11px; color: #555; padding: 4px 2px 5px; letter-spacing: 0.4px; }
.co-ep-grid { display: grid; grid-template-columns: repeat(8,1fr); gap: 2px; margin-bottom: 8px; }
.co-ep-em { font-size: 20px; cursor: pointer; border-radius: 6px; display: flex; align-items: center; justify-content: center; height: 32px; transition: background 0.1s, transform 0.1s; }
.co-ep-em:hover { background: #2a2a2a; transform: scale(1.2); }

/* ═══ BUBBLE MENU ═══ */
.co-bm-backdrop { position: fixed; inset: 0; z-index: 400; }
.co-bm-popup {
  position: fixed; background: #1e1e1e; border: 1px solid #2e2e2e;
  border-radius: 14px; min-width: 210px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.7); overflow: hidden; z-index: 401;
  animation: coPopIn 0.16s ease;
}
@keyframes coPopIn { from { opacity: 0; transform: scale(0.92) translateY(-6px); } to { opacity: 1; transform: none; } }
.co-bm-emoji-row { display: flex; align-items: center; justify-content: space-around; padding: 12px 10px 10px; gap: 4px; border-bottom: 1px solid #2e2e2e; }
.co-bm-emoji { font-size: 22px; cursor: pointer; transition: transform 0.15s; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; }
.co-bm-emoji:hover { transform: scale(1.35); background: #2a2a2a; }
.co-bm-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; font-size: 14px; color: #ddd; cursor: pointer; transition: background 0.13s; border-bottom: 1px solid #252525; }
.co-bm-item:last-child { border-bottom: none; }
.co-bm-item:hover { background: #2a2a2a; }
.co-bm-item i { font-size: 18px; color: #a78bfa; flex-shrink: 0; }
.co-bm-item.danger { color: #ef4444; }
.co-bm-item.danger i { color: #ef4444; }
.co-bm-item.danger:hover { background: #2a1515; }

/* ═══ CONTACT CTX MENU ═══ */
.co-ctx-backdrop { position: fixed; inset: 0; z-index: 400; }
.co-ctx-popup { position: fixed; background: #1e1e1e; border: 1px solid #2e2e2e; border-radius: 12px; min-width: 200px; box-shadow: 0 8px 30px rgba(0,0,0,0.7); overflow: hidden; z-index: 401; animation: coPopIn 0.15s ease; }
.co-ctx-item { display: flex; align-items: center; gap: 12px; padding: 12px 15px; font-size: 14px; color: #ddd; cursor: pointer; transition: background 0.12s; border-bottom: 1px solid #252525; }
.co-ctx-item:last-child { border-bottom: none; }
.co-ctx-item:hover { background: #2a2a2a; }
.co-ctx-item i { font-size: 17px; color: #a78bfa; flex-shrink: 0; }
.co-ctx-item.danger { color: #ef4444; }
.co-ctx-item.danger i { color: #ef4444; }
.co-ctx-item.danger:hover { background: #2a1515; }

/* ═══ MODALS ═══ */
.co-modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.72); backdrop-filter: blur(5px);
  display: flex; align-items: center; justify-content: center;
  z-index: 500; animation: coFadeIn 0.18s ease; padding: 20px;
}
.co-modal { background: #161616; border: 1px solid #2a2a2a; border-radius: 16px; padding: 24px; width: 100%; max-width: 300px; animation: coModalIn 0.2s ease; }
@keyframes coModalIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
.co-modal h3 { font-size: 16px; color: #fff; margin-bottom: 8px; }
.co-modal p { font-size: 13px; color: #666; line-height: 1.5; margin-bottom: 20px; }
.co-modal-actions { display: flex; justify-content: flex-end; gap: 10px; }
.co-modal-actions.col { flex-direction: column; align-items: stretch; margin-top: 4px; }

.co-btn-cancel { background: transparent; border: none; color: #a78bfa; font-size: 14px; padding: 8px 12px; cursor: pointer; font-family: inherit; border-radius: 8px; transition: background 0.15s; }
.co-btn-cancel:hover { background: #1e1e1e; }
.co-btn-danger { background: #ef4444; border: none; color: #fff; font-size: 14px; padding: 9px 18px; border-radius: 8px; cursor: pointer; font-family: inherit; transition: background 0.15s; }
.co-btn-danger:hover { background: #dc2626; }
.co-btn-outline { background: transparent; border: 1px solid #a78bfa; color: #a78bfa; font-size: 14px; padding: 10px 16px; border-radius: 10px; cursor: pointer; font-family: inherit; text-align: center; transition: all 0.2s; }
.co-btn-outline:hover { background: #a78bfa; color: #fff; }
.co-btn-subtle { background: transparent; border: 1px solid #444; color: #ccc; font-size: 14px; padding: 10px 16px; border-radius: 10px; cursor: pointer; font-family: inherit; text-align: center; transition: all 0.2s; }
.co-btn-subtle:hover { background: #222; }
.co-btn-text { background: transparent; border: none; color: #555; font-size: 13px; padding: 8px; cursor: pointer; font-family: inherit; text-align: center; transition: color 0.15s; }
.co-btn-text:hover { color: #888; }

/* Forward modal */
.co-fwd-modal { background: #161616; border: 1px solid #2a2a2a; border-radius: 18px; width: 100%; max-width: 340px; max-height: 70vh; display: flex; flex-direction: column; overflow: hidden; animation: coModalIn 0.2s ease; position: relative; }
.co-fwd-header { display: flex; align-items: center; gap: 10px; padding: 14px 14px 10px; border-bottom: 1px solid #222; flex-shrink: 0; }
.co-fwd-header h3 { font-size: 15px; font-weight: 600; color: #fff; }
.co-fwd-list { flex: 1; overflow-y: auto; padding: 4px 0; }
.co-fwd-item { display: flex; align-items: center; gap: 12px; padding: 10px 14px; cursor: pointer; transition: background 0.13s; }
.co-fwd-item:hover { background: #1e1e1e; }
.co-fwd-item.sel { background: #1a1a2e; }
.co-fwd-item span { font-size: 14px; color: #ddd; font-weight: 500; flex: 1; }
.co-fwd-check { width: 22px; height: 22px; border-radius: 50%; border: 2px solid #444; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.15s; }
.co-fwd-item.sel .co-fwd-check { background: #a78bfa; border-color: #a78bfa; color: #fff; }
.co-fwd-check i { font-size: 13px; }
.co-fwd-send { position: absolute; bottom: 12px; right: 12px; background: #7c3aed; border: none; color: #fff; width: 46px; height: 46px; border-radius: 50%; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(124,58,237,0.4); }
.co-fwd-send:hover:not(:disabled) { background: #6d28d9; transform: scale(1.08); }
.co-fwd-send:disabled { opacity: 0.3; cursor: not-allowed; }

/* Group modal */
.co-group-modal { background: #161616; border: 1px solid #2a2a2a; border-radius: 18px; width: 100%; max-width: 380px; max-height: 80vh; display: flex; flex-direction: column; overflow: hidden; animation: coModalIn 0.2s ease; }
.co-group-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 16px 10px; border-bottom: 1px solid #222; flex-shrink: 0; }
.co-group-header h3 { font-size: 16px; font-weight: 700; color: #fff; }
.co-group-body { flex: 1; overflow-y: auto; padding: 12px 16px; }
.co-group-name-wrap { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.co-group-icon-preview { width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg,#a78bfa,#7c3aed); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.co-group-icon-preview i { font-size: 26px; color: #fff; }
.co-group-name-input { flex: 1; background: #1e1e1e; border: 1px solid #2a2a2a; border-radius: 12px; padding: 10px 14px; color: #fff; font-size: 15px; font-family: inherit; outline: none; transition: border-color 0.2s; }
.co-group-name-input:focus { border-color: #a78bfa55; }
.co-group-name-input::placeholder { color: #444; }
.co-group-section-label { font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
.co-group-members { display: flex; flex-direction: column; }
.co-group-footer { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-top: 1px solid #222; flex-shrink: 0; }
.co-group-count { font-size: 13px; color: #666; }
.co-btn-create { display: flex; align-items: center; gap: 6px; background: #7c3aed; border: none; color: #fff; font-size: 14px; font-weight: 600; padding: 10px 20px; border-radius: 24px; cursor: pointer; font-family: inherit; transition: all 0.2s; }
.co-btn-create:hover:not(:disabled) { background: #6d28d9; transform: scale(1.04); }
.co-btn-create:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

/* Lightbox */
.co-lightbox {
  position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 600;
  display: flex; align-items: center; justify-content: center;
  animation: coFadeIn 0.2s ease; cursor: zoom-out;
}
.co-lightbox img { max-width: 90vw; max-height: 90vh; border-radius: 12px; object-fit: contain; cursor: default; }
.co-lightbox-close {
  position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.1);
  border: none; color: #fff; font-size: 26px; cursor: pointer; width: 44px; height: 44px;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
}
.co-lightbox-close:hover { background: rgba(255,255,255,0.2); }

/* ═══ TOASTS ═══ */
.co-toasts { position: fixed; bottom: 70px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; gap: 8px; z-index: 700; pointer-events: none; }
.co-toast {
  display: flex; align-items: center; gap: 8px; padding: 10px 18px;
  border-radius: 24px; font-size: 13px; font-weight: 500; color: #fff;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5); white-space: nowrap;
  animation: coToastIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes coToastIn { from { opacity: 0; transform: translateY(10px) scale(0.9); } to { opacity: 1; transform: none; } }
.co-toast-success { background: #1a3a2a; border: 1px solid #22c55e44; color: #86efac; }
.co-toast-success i { color: #22c55e; font-size: 16px; }
.co-toast-error { background: #3a1a1a; border: 1px solid #ef444444; color: #fca5a5; }
.co-toast-info { background: #1a1a3a; border: 1px solid #a78bfa44; }
.co-toast-info i { color: #a78bfa; font-size: 16px; }

/* ═══ MOBILE ═══ */
@media (max-width: 768px) {
  .co-left { width: 100%; max-width: 100%; border-right: none; }
  .co-left.hidden { display: none; }
  .co-right { position: absolute; inset: 0; }
  .co-msg { max-width: 85%; }
  .co-ep-grid { grid-template-columns: repeat(7,1fr); }
}

/* ═══ AVATAR PRESSABLE ═══ */
.co-avatar-pressable { user-select: none; -webkit-user-select: none; transition: transform 0.15s, filter 0.15s; }
.co-avatar-pressable:active { transform: scale(0.92); filter: brightness(1.2); }

/* ═══ GROUP INVITE BUBBLE ═══ */
.co-invite-bubble {
  background: linear-gradient(135deg, #1a1a2e, #16162a);
  border: 1px solid #a78bfa44;
  border-radius: 16px;
  padding: 14px 14px 10px;
  min-width: 240px;
  max-width: 280px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: coPopIn 0.2s ease;
}
.co-invite-icon {
  width: 44px; height: 44px; border-radius: 50%;
  background: linear-gradient(135deg, #a78bfa, #7c3aed);
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; color: #fff; flex-shrink: 0; margin: 0 auto 2px;
}
.co-invite-info { text-align: center; }
.co-invite-title { display: block; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
.co-invite-name { display: block; font-size: 15px; font-weight: 700; color: #fff; }
.co-invite-actions { display: flex; gap: 8px; }
.co-invite-reject {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px;
  background: transparent; border: 1px solid #444; color: #aaa;
  padding: 8px; border-radius: 10px; font-size: 13px; cursor: pointer;
  font-family: inherit; transition: all 0.2s;
}
.co-invite-reject:hover { background: #2a1515; border-color: #ef4444; color: #ef4444; }
.co-invite-accept {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px;
  background: #7c3aed; border: none; color: #fff;
  padding: 8px; border-radius: 10px; font-size: 13px; cursor: pointer;
  font-family: inherit; font-weight: 600; transition: all 0.2s;
}
.co-invite-accept:hover { background: #6d28d9; transform: scale(1.03); }
.co-invite-status {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 8px; border-radius: 10px; font-size: 13px; font-weight: 600;
}
.co-invite-status.accepted { background: #1a3a2a; color: #86efac; border: 1px solid #22c55e44; }
.co-invite-status.accepted i { color: #22c55e; }
.co-invite-status.rejected { background: #2a1515; color: #fca5a5; border: 1px solid #ef444444; }
.co-invite-status.rejected i { color: #ef4444; }

/* ═══ PROFILE CARD POPUP ═══ */
.co-profile-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); z-index: 600; }
.co-profile-popup {
  position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
  background: #161616; border: 1px solid #2a2a2a; border-radius: 24px;
  padding: 24px 28px 28px; min-width: 240px; text-align: center;
  z-index: 601; animation: coModalIn 0.25s cubic-bezier(0.34,1.56,0.64,1);
  display: flex; flex-direction: column; align-items: center; gap: 8px;
}
.co-profile-close {
  position: absolute; top: 12px; right: 12px; background: #222; border: none;
  color: #888; font-size: 20px; cursor: pointer; width: 32px; height: 32px;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.co-profile-close:hover { background: #333; color: #fff; }
.co-profile-card { position: relative; margin-bottom: 4px; }
.co-profile-av {
  width: 88px; height: 88px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 32px; font-weight: 700; color: #fff;
  box-shadow: 0 0 0 4px #1e1e1e, 0 0 0 6px #a78bfa55;
  position: relative; z-index: 1;
}
.co-profile-glow {
  position: absolute; inset: -8px; border-radius: 50%;
  background: radial-gradient(circle, #a78bfa33, transparent 70%);
  animation: coPulseGlow 2s ease-in-out infinite;
}
@keyframes coPulseGlow { 0%,100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } }
.co-profile-group-badge {
  position: absolute; bottom: 2px; right: 2px;
  background: #7c3aed; border-radius: 50%; width: 22px; height: 22px;
  display: flex; align-items: center; justify-content: center; border: 2px solid #161616;
}
.co-profile-group-badge i { font-size: 12px; color: #fff; }
.co-profile-name { font-size: 20px; font-weight: 700; color: #fff; margin-top: 4px; }
.co-profile-sub { font-size: 13px; color: #666; }
.co-profile-online { display: flex; align-items: center; gap: 5px; color: #10b981; }
.co-profile-dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; display: inline-block; animation: coPulseGreen 1.5s ease infinite; }
@keyframes coPulseGreen { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
.co-profile-view-btn {
  display: flex; align-items: center; gap: 8px; margin-top: 8px;
  background: #7c3aed; border: none; color: #fff;
  padding: 10px 24px; border-radius: 24px; font-size: 14px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
}
.co-profile-view-btn:hover { background: #6d28d9; transform: scale(1.05); }
`;

/* Inject CSS once at module level — runs when the module is first imported,
   so styles are ready even before isOpen becomes true */
if (typeof document !== "undefined" && !document.getElementById("co-styles")) {
  const _s = document.createElement("style");
  _s.id = "co-styles";
  _s.textContent = CHAT_CSS;
  document.head.appendChild(_s);
}
