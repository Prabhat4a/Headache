import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "boxicons/css/boxicons.min.css";
import "../styles/ChatOverlay.css";

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
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const recordingChunks = useRef([]);
  const recordingTimer = useRef(null);
  // Group creation modal
  const [groupModal, setGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState(new Set());
  const [groupSearch, setGroupSearch] = useState("");
  const [groupImage, setGroupImage] = useState(null);
  const [cropSrc, setCropSrc] = useState(null); // FIX 3: image crop
  const groupImageInputRef = useRef(null);
  const [toasts, setToasts] = useState([]);
  const [lightbox, setLightbox] = useState(null);
  const [profileCard, setProfileCard] = useState(null);
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
        if (cropSrc) setCropSrc(null);
        if (!user) onClose();
      }
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [selMode, lightbox, user, cropSrc]);

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

  // FIX 2: On mobile show left OR right. On desktop show both.
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
    if (mediaRecorder && recording) mediaRecorder.stop();
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
      groupImage: groupImage || null,
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
    setGroupSearch("");
    setGroupImage(null);
    setUser(newGroup);
  };

  const handleInvite = (msg, action) => {
    setInviteStatus((p) => ({ ...p, [msg.id]: action }));
    if (action === "accepted") {
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

  const filteredGroupContacts = contacts.filter(
    (c) =>
      !c.isGroup && c.name.toLowerCase().includes(groupSearch.toLowerCase()),
  );

  /* ═══ RENDER ═══ */
  return (
    <>
      {/*
        FIX 2: overlay class changes based on whether a chat is open.
        - co-overlay--list: sits between header and bottom nav (not full screen)
        - co-overlay--full: covers everything (when chatting on mobile)
      */}
      <div
        className={`co-overlay${user && isMobile ? " co-overlay--full" : " co-overlay--list"}`}
      >
        <div className="co-shell">
          {/* ══ LEFT PANEL (contacts list) ══ */}
          {showLeft && (
            <div className={`co-left${isMobile && user ? " hidden" : ""}`}>
              <div className="co-left-header">
                <button
                  className="co-back-to-app"
                  onClick={onClose}
                  title="Back"
                >
                  <i className="bx bx-arrow-back" />
                </button>
                <span className="co-left-title">Messages</span>
                <button
                  className="co-icon-btn"
                  title="New Group"
                  onClick={() => setGroupModal(true)}
                >
                  <i className="bx bx-plus" />
                </button>
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

          {/* ══ RIGHT PANEL (chat view) ══ */}
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
                    <button
                      className="co-back-btn"
                      onClick={() => {
                        if (isMobile) setUser(null);
                        else onClose();
                      }}
                    >
                      <i className="bx bx-arrow-back" />
                    </button>
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

                  {blocked[user.id] && (
                    <div className="co-block-bar">
                      <i className="bx bx-block" />
                      <span>You blocked this contact.</span>
                      <button onClick={() => doUnblock(user.id)}>
                        Unblock
                      </button>
                    </div>
                  )}

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

      {/* ══ PREMIUM GROUP CREATION MODAL ══ */}
      {groupModal && (
        <div
          className="co-modal-backdrop co-modal-backdrop--centered"
          onClick={() => setGroupModal(false)}
        >
          <div className="co-group-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="co-gm-header">
              <button
                className="co-gm-back"
                onClick={() => setGroupModal(false)}
              >
                <i className="bx bx-arrow-back" />
              </button>
              <h3>New Group</h3>
              <button
                className="co-gm-create-btn"
                disabled={!groupName.trim() || groupMembers.size === 0}
                onClick={createGroup}
              >
                Create
              </button>
            </div>

            {/* Group identity section */}
            <div className="co-gm-identity">
              {/* FIX 3: Image upload triggers crop modal */}
              <div
                className="co-gm-avatar-wrap"
                onClick={() => groupImageInputRef.current?.click()}
              >
                {groupImage ? (
                  <img
                    src={groupImage}
                    alt="Group"
                    className="co-gm-avatar-img"
                  />
                ) : (
                  <div className="co-gm-avatar-placeholder">
                    <i className="bx bx-camera" />
                  </div>
                )}
                <div className="co-gm-avatar-overlay">
                  <i className="bx bx-camera" />
                </div>
              </div>
              <input
                ref={groupImageInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  // FIX 3: open crop modal instead of setting directly
                  reader.onload = (ev) => setCropSrc(ev.target.result);
                  reader.readAsDataURL(file);
                  e.target.value = "";
                }}
              />
              <div className="co-gm-name-wrap">
                <input
                  className="co-gm-name-input"
                  placeholder="Group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  maxLength={40}
                />
                <div className="co-gm-name-char">{groupName.length}/40</div>
              </div>
            </div>

            {/* Selected members chips */}
            {groupMembers.size > 0 && (
              <div className="co-gm-chips-section">
                <div className="co-gm-chips">
                  {contacts
                    .filter((c) => groupMembers.has(c.id))
                    .map((c) => (
                      <div key={c.id} className="co-gm-chip">
                        <div className={`co-gm-chip-av ${c.avClass}`}>
                          {c.initials}
                        </div>
                        <span>{c.name.split(" ")[0]}</span>
                        <button
                          className="co-gm-chip-remove"
                          onClick={() =>
                            setGroupMembers((p) => {
                              const n = new Set(p);
                              n.delete(c.id);
                              return n;
                            })
                          }
                        >
                          <i className="bx bx-x" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Member search */}
            <div className="co-gm-search">
              <i className="bx bx-search" />
              <input
                placeholder="Search people to add…"
                value={groupSearch}
                onChange={(e) => setGroupSearch(e.target.value)}
              />
            </div>

            {/* Members list */}
            <div className="co-gm-members">
              {filteredGroupContacts.length === 0 ? (
                <div className="co-gm-empty">
                  <i className="bx bx-user-x" />
                  <p>No contacts found</p>
                </div>
              ) : (
                filteredGroupContacts.map((c) => {
                  const selected = groupMembers.has(c.id);
                  return (
                    <div
                      key={c.id}
                      className={`co-gm-member-row${selected ? " selected" : ""}`}
                      onClick={() =>
                        setGroupMembers((p) => {
                          const n = new Set(p);
                          n.has(c.id) ? n.delete(c.id) : n.add(c.id);
                          return n;
                        })
                      }
                    >
                      <div
                        className={`co-avatar ${c.avClass}`}
                        style={{
                          width: 44,
                          height: 44,
                          fontSize: 14,
                          flexShrink: 0,
                        }}
                      >
                        {c.initials}
                      </div>
                      <div className="co-gm-member-info">
                        <span className="co-gm-member-name">{c.name}</span>
                        <span className="co-gm-member-sub">Student</span>
                      </div>
                      <div
                        className={`co-gm-check${selected ? " checked" : ""}`}
                      >
                        {selected && <i className="bx bx-check" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer count */}
            <div className="co-gm-footer">
              <i className="bx bx-group" />
              <span>
                {groupMembers.size}{" "}
                {groupMembers.size === 1 ? "participant" : "participants"}{" "}
                selected
              </span>
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

      {/* FIX 3: IMAGE CROP MODAL ══ */}
      {cropSrc && (
        <CropModal
          src={cropSrc}
          onDone={(dataUrl) => {
            setGroupImage(dataUrl);
            setCropSrc(null);
          }}
          onCancel={() => setCropSrc(null)}
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
            {msg.audio && (
              <div className="co-audio-msg">
                <i className="bx bx-microphone" />
                <audio controls src={msg.audio} />
              </div>
            )}
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
   AvatarWithPress
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
  const start = () => {
    didLongPress.current = false;
    pressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      onLongPress && onLongPress();
    }, 550);
  };
  const end = () => clearTimeout(pressTimer.current);
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
        overflow: "hidden",
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
      {contact.groupImage ? (
        <img
          src={contact.groupImage}
          alt={contact.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            inset: 0,
          }}
        />
      ) : (
        contact.initials
      )}
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
          <div
            className={`co-profile-av ${contact.avClass}`}
            style={{ overflow: "hidden", position: "relative" }}
          >
            {contact.groupImage ? (
              <img
                src={contact.groupImage}
                alt={contact.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  position: "absolute",
                  inset: 0,
                }}
              />
            ) : (
              contact.initials
            )}
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
   FIX 3: CropModal — circular crop with drag + zoom
═══════════════════════════════════════════════ */
function CropModal({ src, onDone, onCancel }) {
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);
  const imgRef = useRef(new Image());
  const SIZE = 260;

  useEffect(() => {
    imgRef.current = new Image();
    imgRef.current.onload = () => draw();
    imgRef.current.src = src;
  }, [src]);

  useEffect(() => {
    draw();
  }, [scale, offset]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imgRef.current.complete || !imgRef.current.naturalWidth)
      return;
    const ctx = canvas.getContext("2d");
    const img = imgRef.current;
    const w = img.width * scale;
    const h = img.height * scale;
    const dx = SIZE / 2 - w / 2 + offset.x;
    const dy = SIZE / 2 - h / 2 + offset.y;

    ctx.clearRect(0, 0, SIZE, SIZE);

    // draw full image dimmed
    ctx.globalAlpha = 0.35;
    ctx.drawImage(img, dx, dy, w, h);
    ctx.globalAlpha = 1;

    // draw circular clip bright
    ctx.save();
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, dx, dy, w, h);
    ctx.restore();

    // circle border
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.strokeStyle = "#a78bfa";
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const getClientXY = (e) => {
    if (e.touches) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  };

  const onDragStart = (e) => {
    e.preventDefault();
    const { x, y } = getClientXY(e);
    setDragging(true);
    dragStart.current = { x: x - offset.x, y: y - offset.y };
  };
  const onDragMove = (e) => {
    if (!dragging) return;
    const { x, y } = getClientXY(e);
    setOffset({ x: x - dragStart.current.x, y: y - dragStart.current.y });
  };
  const onDragEnd = () => setDragging(false);

  const handleDone = () => {
    const out = document.createElement("canvas");
    out.width = 256;
    out.height = 256;
    const ctx = out.getContext("2d");
    const img = imgRef.current;
    const ratio = 256 / SIZE;
    const w = img.width * scale * ratio;
    const h = img.height * scale * ratio;
    const dx = 128 - (img.width * scale * ratio) / 2 + offset.x * ratio;
    const dy = 128 - (img.height * scale * ratio) / 2 + offset.y * ratio;
    ctx.beginPath();
    ctx.arc(128, 128, 128, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, dx, dy, w, h);
    onDone(out.toDataURL("image/png"));
  };

  return (
    <div className="co-modal-backdrop" onClick={onCancel}>
      <div className="co-crop-modal" onClick={(e) => e.stopPropagation()}>
        <div className="co-crop-header">
          <button className="co-gm-back" onClick={onCancel}>
            <i className="bx bx-arrow-back" />
          </button>
          <h3>Crop Photo</h3>
          <button className="co-gm-create-btn" onClick={handleDone}>
            Use Photo
          </button>
        </div>
        <div className="co-crop-hint">
          Drag to reposition • Pinch or scroll to zoom
        </div>
        <div className="co-crop-canvas-wrap">
          <canvas
            ref={canvasRef}
            width={SIZE}
            height={SIZE}
            className="co-crop-canvas"
            style={{ cursor: dragging ? "grabbing" : "grab" }}
            onMouseDown={onDragStart}
            onMouseMove={onDragMove}
            onMouseUp={onDragEnd}
            onMouseLeave={onDragEnd}
            onTouchStart={onDragStart}
            onTouchMove={onDragMove}
            onTouchEnd={onDragEnd}
            onWheel={(e) => {
              e.preventDefault();
              setScale((s) => Math.min(5, Math.max(0.3, s - e.deltaY * 0.003)));
            }}
          />
        </div>
        <div className="co-crop-zoom-row">
          <i className="bx bx-minus" style={{ color: "#555", fontSize: 18 }} />
          <input
            type="range"
            min="0.3"
            max="5"
            step="0.01"
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="co-crop-slider"
          />
          <i className="bx bx-plus" style={{ color: "#555", fontSize: 18 }} />
        </div>
      </div>
    </div>
  );
}
