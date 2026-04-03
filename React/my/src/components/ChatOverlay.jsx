import { useState, useEffect, useRef } from "react";
import "boxicons/css/boxicons.min.css";
import "../styles/Chatoverlay.css";

// ── Helpers ────────────────────────────────────────────────
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

function escapeHtml(text) {
  const d = document.createElement("div");
  d.textContent = text;
  return d.innerHTML;
}

function getDateLabel(dateStr) {
  const msgDate = new Date(dateStr);
  const toDay = new Date();
  toDay.setHours(0, 0, 0, 0);
  const mDay = new Date(msgDate);
  mDay.setHours(0, 0, 0, 0);
  const diff = Math.round((toDay - mDay) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return msgDate.toLocaleDateString("en-US", { weekday: "long" });
  return msgDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function playPing() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
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

// ── Static data ────────────────────────────────────────────
const INITIAL_MESSAGES = {
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

const INITIAL_CONTACTS = [
  {
    id: "1",
    name: "Amit Kumar",
    initials: "AK",
    avClass: "av-blue",
    lastMsg: "Great! I will wait for you",
    time: "10:33 AM",
    unread: 2,
  },
  {
    id: "2",
    name: "Priya Sharma",
    initials: "PS",
    avClass: "av-pink",
    lastMsg: "Got it, thanks!",
    time: "9:52 AM",
    unread: 0,
  },
  {
    id: "3",
    name: "Rahul Verma",
    initials: "RV",
    avClass: "av-green",
    lastMsg: "Let me know if you need anything",
    time: "8:26 AM",
    unread: 0,
  },
];

const EMOJI_CATEGORIES = {
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

// ══════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════
export default function ChatOverlay({ isOpen, onClose }) {
  const [messageData, setMessageData] = useState({ ...INITIAL_MESSAGES });
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);
  const [currentUser, setCurrentUser] = useState(null);
  const [inputText, setInputText] = useState("");
  const [replyData, setReplyData] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiTab, setEmojiTab] = useState(Object.keys(EMOJI_CATEGORIES)[0]);
  const [emojiSearch, setEmojiSearch] = useState("");
  const [bubbleMenu, setBubbleMenu] = useState(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedMsgs, setSelectedMsgs] = useState(new Set());
  const [deleteModal, setDeleteModal] = useState(false);
  const [forwardModal, setForwardModal] = useState(null);
  const [forwardSelected, setForwardSelected] = useState(new Set());
  const [menuOpen, setMenuOpen] = useState(false);
  const [blocked, setBlocked] = useState({});
  const [pinned, setPinned] = useState({});
  const [muted, setMuted] = useState({});
  const [reactions, setReactions] = useState({});
  const [ctxMenu, setCtxMenu] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const messagesEndRef = useRef(null);
  const typingTimer = useRef(null);
  const inputRef = useRef(null);

  // ── Effects ──────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageData, currentUser, isTyping]);

  useEffect(() => {
    if (!showEmojiPicker) return;
    const handler = () => setShowEmojiPicker(false);
    const id = setTimeout(
      () => document.addEventListener("click", handler),
      10,
    );
    return () => {
      clearTimeout(id);
      document.removeEventListener("click", handler);
    };
  }, [showEmojiPicker]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        setBubbleMenu(null);
        setCtxMenu(null);
        if (selectMode) exitSelectMode();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [selectMode]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // ── Derived ──────────────────────────────────────────────
  const getMessages = () =>
    currentUser ? messageData[currentUser.id] || [] : [];

  const groupByDate = (msgs) => {
    const groups = [];
    let lastLabel = null;
    msgs.forEach((msg) => {
      const label = getDateLabel(msg.date);
      if (label !== lastLabel) {
        groups.push({ type: "divider", label });
        lastLabel = label;
      }
      groups.push({ type: "msg", msg });
    });
    return groups;
  };

  const nowTime = () =>
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const filteredContacts = [...contacts]
    .filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => (pinned[b.id] ? 1 : 0) - (pinned[a.id] ? 1 : 0));

  const showLeft = !isMobile || !currentUser;
  const showRight = !isMobile || !!currentUser;

  // ── Actions ──────────────────────────────────────────────
  const sendMessage = () => {
    const text = inputText.trim();
    if (!text || !currentUser || blocked[currentUser.id]) return;
    const t = nowTime();
    const newMsg = {
      id: `${currentUser.id}-${Date.now()}`,
      type: "sent",
      text,
      time: t,
      date: daysAgo(0),
      reply: replyData ? { ...replyData } : null,
    };
    setMessageData((p) => ({
      ...p,
      [currentUser.id]: [...(p[currentUser.id] || []), newMsg],
    }));
    setContacts((p) =>
      p.map((c) =>
        c.id === currentUser.id
          ? { ...c, lastMsg: text, time: t, unread: 0 }
          : c,
      ),
    );
    setInputText("");
    setReplyData(null);

    clearTimeout(typingTimer.current);
    setTimeout(() => {
      if (!currentUser || blocked[currentUser.id]) return;
      setIsTyping(true);
      typingTimer.current = setTimeout(() => {
        setIsTyping(false);
        playPing();
        const pool = [
          "Got it!",
          "Sure thing 👍",
          "Okay!",
          "Sounds good!",
          "Let me check that.",
          "Thanks!",
        ];
        const autoMsg = {
          id: `${currentUser.id}-auto-${Date.now()}`,
          type: "received",
          text: pool[Math.floor(Math.random() * pool.length)],
          time: nowTime(),
          date: daysAgo(0),
        };
        setMessageData((p) => ({
          ...p,
          [currentUser.id]: [...(p[currentUser.id] || []), autoMsg],
        }));
        setContacts((p) =>
          p.map((c) =>
            c.id === currentUser.id
              ? { ...c, lastMsg: autoMsg.text, time: autoMsg.time }
              : c,
          ),
        );
      }, 2200);
    }, 600);
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedMsgs(new Set());
  };

  const toggleSelect = (id) => {
    setSelectedMsgs((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      if (n.size === 0) setSelectMode(false);
      return n;
    });
  };

  const doDeleteForEveryone = () => {
    setMessageData((p) => ({
      ...p,
      [currentUser.id]: (p[currentUser.id] || []).map((m) =>
        selectedMsgs.has(m.id) ? { ...m, deleted: true } : m,
      ),
    }));
    setDeleteModal(false);
    exitSelectMode();
  };

  const doDeleteForMe = () => {
    setMessageData((p) => ({
      ...p,
      [currentUser.id]: (p[currentUser.id] || []).filter(
        (m) => !selectedMsgs.has(m.id),
      ),
    }));
    setDeleteModal(false);
    exitSelectMode();
  };

  const openForward = (texts) => {
    setForwardModal(texts);
    setForwardSelected(new Set());
  };

  const doForward = () => {
    if (!forwardModal) return;
    const t = nowTime();
    setMessageData((p) => {
      const next = { ...p };
      forwardSelected.forEach((uid) => {
        const fwd = forwardModal.map((text, i) => ({
          id: `${uid}-fwd-${Date.now()}-${i}`,
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
    setForwardModal(null);
  };

  const unblockUser = (uid) =>
    setBlocked((p) => {
      const n = { ...p };
      delete n[uid];
      return n;
    });

  const handleCtxAction = (action) => {
    const uid = ctxMenu?.userId;
    if (!uid) return;
    if (action === "mute")
      setMuted((p) => {
        const n = { ...p };
        p[uid] ? delete n[uid] : (n[uid] = true);
        return n;
      });
    if (action === "pin")
      setPinned((p) => {
        const n = { ...p };
        p[uid] ? delete n[uid] : (n[uid] = true);
        return n;
      });
    if (action === "block") setBlocked((p) => ({ ...p, [uid]: true }));
    if (action === "clear") {
      setMessageData((p) => ({ ...p, [uid]: [] }));
      setContacts((p) =>
        p.map((c) => (c.id === uid ? { ...c, lastMsg: "" } : c)),
      );
    }
    if (action === "delete") {
      setContacts((p) => p.filter((c) => c.id !== uid));
      setMessageData((p) => {
        const n = { ...p };
        delete n[uid];
        return n;
      });
      if (currentUser?.id === uid) setCurrentUser(null);
    }
    setCtxMenu(null);
  };

  // ── Render ───────────────────────────────────────────────
  return (
    <>
      {/* ══ OVERLAY SHELL ══ */}
      <div className="co-overlay" onClick={onClose}>
        <div className="co-shell" onClick={(e) => e.stopPropagation()}>
          {/* ═══ LEFT PANEL ═══ */}
          {showLeft && (
            <div
              className={`co-left${isMobile && currentUser ? " co-left--hidden" : ""}`}
            >
              <div className="co-left-header">
                <h2 className="co-left-title">Messages</h2>
                <button className="co-icon-btn" onClick={onClose} title="Close">
                  <i className="bx bx-x" />
                </button>
              </div>

              <div className="co-search">
                <i className="bx bx-search" />
                <input
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="co-chat-list">
                {filteredContacts.length === 0 ? (
                  <div className="co-empty-contacts">
                    <i className="bx bx-search-alt" />
                    <p>No chats found</p>
                    <span>Try a different name</span>
                  </div>
                ) : (
                  filteredContacts.map((c) => (
                    <div
                      key={c.id}
                      className={[
                        "co-chat-item",
                        currentUser?.id === c.id ? "co-chat-item--active" : "",
                        blocked[c.id] ? "co-chat-item--blocked" : "",
                      ].join(" ")}
                      onClick={() => {
                        setCurrentUser(c);
                        setMenuOpen(false);
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setCtxMenu({
                          userId: c.id,
                          x: e.clientX,
                          y: e.clientY,
                        });
                      }}
                    >
                      <div className={`co-avatar ${c.avClass}`}>
                        {c.initials}
                      </div>
                      <div className="co-chat-info">
                        <div className="co-name-row">
                          <span className="co-name">
                            {c.name}
                            {pinned[c.id] && (
                              <i className="bx bx-pin co-pin-badge" />
                            )}
                          </span>
                          <span className="co-time">
                            {c.time}
                            {muted[c.id] && " 🔇"}
                          </span>
                        </div>
                        <div className="co-preview-row">
                          <span className="co-preview-msg">
                            {blocked[c.id] && (
                              <span className="co-blocked-label">
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

          {/* ═══ RIGHT PANEL ═══ */}
          {showRight && (
            <div className="co-right">
              {!currentUser ? (
                <div className="co-no-chat">
                  <div className="co-no-chat-icon">
                    <i className="bx bx-message-rounded-dots" />
                  </div>
                  <h3>Select a chat to start messaging</h3>
                  <p>Choose from your existing conversations</p>
                </div>
              ) : (
                <div className="co-chat-view">
                  {/* Chat header */}
                  <div className="co-chat-header">
                    <button
                      className="co-back-btn"
                      onClick={() => setCurrentUser(null)}
                    >
                      <i className="bx bx-arrow-back" />
                    </button>
                    <div
                      className={`co-avatar ${currentUser.avClass}`}
                      style={{ width: 40, height: 40, fontSize: 14 }}
                    >
                      {currentUser.initials}
                    </div>
                    <div className="co-header-info">
                      <div className="co-header-name">{currentUser.name}</div>
                      <div className="co-header-status">
                        {isTyping ? (
                          <span className="co-typing-status">typing...</span>
                        ) : (
                          "Online"
                        )}
                      </div>
                    </div>

                    {/* Three-dot menu */}
                    <div style={{ position: "relative" }}>
                      <button
                        className="co-icon-btn"
                        onClick={() => setMenuOpen((p) => !p)}
                      >
                        <i className="bx bx-dots-vertical-rounded" />
                      </button>
                      {menuOpen && (
                        <div
                          className="co-menu-dropdown"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div
                            className="co-menu-item"
                            onClick={() => {
                              blocked[currentUser.id]
                                ? unblockUser(currentUser.id)
                                : setBlocked((p) => ({
                                    ...p,
                                    [currentUser.id]: true,
                                  }));
                              setMenuOpen(false);
                            }}
                          >
                            <i className="bx bx-block" />
                            <span>
                              {blocked[currentUser.id]
                                ? "Unblock user"
                                : "Block user"}
                            </span>
                          </div>
                          <div
                            className="co-menu-item co-menu-danger"
                            onClick={() => {
                              setConfirmClear(true);
                              setMenuOpen(false);
                            }}
                          >
                            <i className="bx bx-trash" />
                            <span>Clear chat</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      className="co-icon-btn"
                      onClick={onClose}
                      title="Close"
                    >
                      <i className="bx bx-x" />
                    </button>
                  </div>

                  {/* Messages area */}
                  <div
                    className="co-messages"
                    onClick={() => {
                      setBubbleMenu(null);
                      setMenuOpen(false);
                    }}
                  >
                    {getMessages().length === 0 && !blocked[currentUser.id] ? (
                      <div className="co-empty-chat">
                        <div className="co-empty-emoji">👋</div>
                        <h3>Say hello!</h3>
                        <p>No messages yet. Start the conversation.</p>
                      </div>
                    ) : (
                      groupByDate(getMessages()).map((item, idx) =>
                        item.type === "divider" ? (
                          <div key={`div-${idx}`} className="co-day-divider">
                            <span>{item.label}</span>
                          </div>
                        ) : (
                          <MessageBubble
                            key={item.msg.id}
                            msg={item.msg}
                            currentUser={currentUser}
                            selectMode={selectMode}
                            isSelected={selectedMsgs.has(item.msg.id)}
                            reaction={reactions[item.msg.id]}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              setBubbleMenu({
                                msgId: item.msg.id,
                                x: e.clientX,
                                y: e.clientY,
                                text: item.msg.text,
                                type: item.msg.type,
                              });
                            }}
                            onArrowClick={(e) => {
                              e.stopPropagation();
                              const r = e.currentTarget.getBoundingClientRect();
                              setBubbleMenu({
                                msgId: item.msg.id,
                                x: r.left,
                                y: r.top,
                                text: item.msg.text,
                                type: item.msg.type,
                              });
                            }}
                            onClick={() => {
                              if (selectMode) toggleSelect(item.msg.id);
                            }}
                          />
                        ),
                      )
                    )}

                    {blocked[currentUser.id] && (
                      <div
                        className="co-system-notice"
                        onClick={() => unblockUser(currentUser.id)}
                      >
                        You blocked this contact. Tap to unblock.
                      </div>
                    )}

                    {isTyping && (
                      <div className="co-typing-indicator">
                        <div
                          className={`co-avatar ${currentUser.avClass}`}
                          style={{ width: 28, height: 28, fontSize: 10 }}
                        >
                          {currentUser.initials}
                        </div>
                        <div className="co-typing-bubble">
                          <span className="co-typing-dot" />
                          <span className="co-typing-dot" />
                          <span className="co-typing-dot" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Block notice */}
                  {blocked[currentUser.id] && (
                    <div className="co-block-notice">
                      <i className="bx bx-block" />
                      <span>You blocked this contact.</span>
                      <button onClick={() => unblockUser(currentUser.id)}>
                        Unblock
                      </button>
                    </div>
                  )}

                  {/* Multi-select bar */}
                  {selectMode && (
                    <div className="co-select-bar">
                      <button
                        className="co-select-cancel"
                        onClick={exitSelectMode}
                      >
                        <i className="bx bx-x" />
                      </button>
                      <span className="co-select-count">
                        {selectedMsgs.size} selected
                      </span>
                      <div className="co-select-actions">
                        <button
                          className="co-sel-btn"
                          title="Copy"
                          onClick={() => {
                            const texts = getMessages()
                              .filter((m) => selectedMsgs.has(m.id))
                              .map((m) => m.text);
                            navigator.clipboard
                              .writeText(texts.join("\n"))
                              .catch(() => {});
                            exitSelectMode();
                          }}
                        >
                          <i className="bx bx-copy" />
                        </button>
                        <button
                          className="co-sel-btn"
                          title="Delete"
                          onClick={() => setDeleteModal(true)}
                        >
                          <i className="bx bx-trash" />
                        </button>
                        <button
                          className="co-sel-btn"
                          title="Forward"
                          onClick={() => {
                            const texts = getMessages()
                              .filter((m) => selectedMsgs.has(m.id))
                              .map((m) => m.text);
                            openForward(texts);
                            exitSelectMode();
                          }}
                        >
                          <i className="bx bx-forward-big" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Message input */}
                  {!selectMode && (
                    <div
                      className={`co-input-area${blocked[currentUser.id] ? " co-input-disabled" : ""}`}
                    >
                      {replyData && (
                        <div className="co-reply-preview">
                          <div className="co-reply-content">
                            <strong>{replyData.user}</strong>
                            <span>{replyData.text}</span>
                          </div>
                          <button
                            className="co-close-reply"
                            onClick={() => setReplyData(null)}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                      <div className="co-input-box">
                        <div className="co-input-row">
                          <i
                            className="bx bx-smile co-emoji-toggle"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!blocked[currentUser.id])
                                setShowEmojiPicker((p) => !p);
                            }}
                          />
                          <input
                            ref={inputRef}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && sendMessage()
                            }
                            placeholder="Type a message..."
                            disabled={!!blocked[currentUser.id]}
                          />
                          <button
                            className="co-send-btn"
                            onClick={sendMessage}
                            disabled={!!blocked[currentUser.id]}
                          >
                            <i className="bx bx-send" />
                          </button>
                        </div>
                      </div>

                      {/* Emoji picker */}
                      {showEmojiPicker && (
                        <div
                          className="co-emoji-picker"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="co-ep-search-row">
                            <i className="bx bx-search" />
                            <input
                              className="co-ep-search"
                              placeholder="Search emoji..."
                              value={emojiSearch}
                              onChange={(e) => setEmojiSearch(e.target.value)}
                            />
                          </div>
                          <div className="co-ep-tabs">
                            {Object.keys(EMOJI_CATEGORIES).map((cat) => (
                              <button
                                key={cat}
                                className={`co-ep-tab${emojiTab === cat ? " co-ep-tab--active" : ""}`}
                                onClick={() => {
                                  setEmojiTab(cat);
                                  setEmojiSearch("");
                                }}
                              >
                                {cat.split(" ")[0]}
                              </button>
                            ))}
                          </div>
                          <div className="co-ep-body">
                            {Object.entries(EMOJI_CATEGORIES).map(
                              ([cat, emojis]) => {
                                if (cat !== emojiTab && !emojiSearch)
                                  return null;
                                return (
                                  <div key={cat}>
                                    {emojiSearch && (
                                      <div className="co-ep-cat-label">
                                        {cat}
                                      </div>
                                    )}
                                    <div className="co-ep-grid">
                                      {emojis.map((em) => (
                                        <span
                                          key={em}
                                          className="co-ep-em"
                                          onClick={() => {
                                            setInputText((p) => p + em);
                                            inputRef.current?.focus();
                                          }}
                                        >
                                          {em}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                );
                              },
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ══ BUBBLE CONTEXT MENU ══ */}
      {bubbleMenu && (
        <BubbleMenu
          x={bubbleMenu.x}
          y={bubbleMenu.y}
          text={bubbleMenu.text}
          msgType={bubbleMenu.type}
          onClose={() => setBubbleMenu(null)}
          onReaction={(emoji) => {
            setReactions((p) => ({ ...p, [bubbleMenu.msgId]: emoji }));
            setBubbleMenu(null);
          }}
          onReply={() => {
            setReplyData({
              user: bubbleMenu.type === "sent" ? "You" : currentUser?.name,
              text: bubbleMenu.text,
            });
            setBubbleMenu(null);
            inputRef.current?.focus();
          }}
          onCopy={() => {
            navigator.clipboard.writeText(bubbleMenu.text).catch(() => {});
            setBubbleMenu(null);
          }}
          onForward={() => {
            openForward([bubbleMenu.text]);
            setBubbleMenu(null);
          }}
          onSelect={() => {
            setSelectMode(true);
            setSelectedMsgs(new Set([bubbleMenu.msgId]));
            setBubbleMenu(null);
          }}
          onDelete={() => {
            setSelectedMsgs(new Set([bubbleMenu.msgId]));
            setDeleteModal(true);
            setBubbleMenu(null);
          }}
        />
      )}

      {/* ══ CONTACT CONTEXT MENU ══ */}
      {ctxMenu && (
        <ContactCtxMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          userId={ctxMenu.userId}
          isMuted={!!muted[ctxMenu.userId]}
          isPinned={!!pinned[ctxMenu.userId]}
          onClose={() => setCtxMenu(null)}
          onAction={handleCtxAction}
        />
      )}

      {/* ══ DELETE MODAL ══ */}
      {deleteModal && (
        <div className="co-modal-overlay" onClick={() => setDeleteModal(false)}>
          <div className="co-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete message?</h3>
            <div className="co-delete-actions">
              {[...selectedMsgs].every(
                (id) => getMessages().find((m) => m.id === id)?.type === "sent",
              ) && (
                <button
                  className="co-btn-everyone"
                  onClick={doDeleteForEveryone}
                >
                  Delete for everyone
                </button>
              )}
              <button className="co-btn-me" onClick={doDeleteForMe}>
                Delete for me
              </button>
              <button
                className="co-btn-cancel"
                onClick={() => setDeleteModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ FORWARD MODAL ══ */}
      {forwardModal && (
        <div className="co-modal-overlay" onClick={() => setForwardModal(null)}>
          <div
            className="co-forward-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="co-forward-header">
              <button
                className="co-icon-btn"
                onClick={() => setForwardModal(null)}
              >
                <i className="bx bx-x" />
              </button>
              <h3>Forward to</h3>
            </div>
            <div className="co-forward-list">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className={`co-forward-item${forwardSelected.has(c.id) ? " co-forward-item--sel" : ""}`}
                  onClick={() =>
                    setForwardSelected((p) => {
                      const n = new Set(p);
                      n.has(c.id) ? n.delete(c.id) : n.add(c.id);
                      return n;
                    })
                  }
                >
                  <div className="co-forward-check">
                    {forwardSelected.has(c.id) && <i className="bx bx-check" />}
                  </div>
                  <div
                    className={`co-avatar ${c.avClass}`}
                    style={{ width: 40, height: 40, fontSize: 13 }}
                  >
                    {c.initials}
                  </div>
                  <span>{c.name}</span>
                </div>
              ))}
            </div>
            <button
              className="co-forward-send"
              disabled={forwardSelected.size === 0}
              onClick={doForward}
            >
              <i className="bx bx-send" />
            </button>
          </div>
        </div>
      )}

      {/* ══ CLEAR CHAT CONFIRM ══ */}
      {confirmClear && (
        <div
          className="co-modal-overlay"
          onClick={() => setConfirmClear(false)}
        >
          <div className="co-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Clear this chat?</h3>
            <p
              style={{
                color: "#666",
                fontSize: 14,
                marginBottom: 20,
                lineHeight: 1.4,
              }}
            >
              This will permanently delete all messages.
            </p>
            <div className="co-confirm-actions">
              <button
                className="co-btn-cancel"
                onClick={() => setConfirmClear(false)}
              >
                Cancel
              </button>
              <button
                className="co-btn-danger"
                onClick={() => {
                  if (!currentUser) return;
                  setMessageData((p) => ({ ...p, [currentUser.id]: [] }));
                  setContacts((p) =>
                    p.map((c) =>
                      c.id === currentUser.id ? { ...c, lastMsg: "" } : c,
                    ),
                  );
                  setConfirmClear(false);
                }}
              >
                Clear chat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════
//  MessageBubble
// ══════════════════════════════════════════════════════════
function MessageBubble({
  msg,
  currentUser,
  selectMode,
  isSelected,
  reaction,
  onContextMenu,
  onArrowClick,
  onClick,
}) {
  const touchTimer = useRef(null);
  const isSent = msg.type === "sent";

  const handleTouchStart = (e) => {
    touchTimer.current = setTimeout(() => {
      const t = e.touches[0];
      onContextMenu({
        preventDefault: () => {},
        clientX: t.clientX,
        clientY: t.clientY,
      });
    }, 500);
  };
  const handleTouchEnd = () => clearTimeout(touchTimer.current);

  return (
    <div
      className={[
        "co-message",
        `co-message--${msg.type}`,
        isSelected ? "co-message--selected" : "",
      ].join(" ")}
      onClick={onClick}
    >
      {!isSent && (
        <div
          className={`co-avatar ${currentUser.avClass}`}
          style={{ width: 28, height: 28, fontSize: 10, alignSelf: "flex-end" }}
        >
          {currentUser.initials}
        </div>
      )}
      <div className="co-msg-content">
        {msg.deleted ? (
          <div
            className={`co-bubble co-bubble--${msg.type} co-bubble--deleted`}
          >
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
        ) : (
          <div
            className={`co-bubble co-bubble--${msg.type}`}
            onContextMenu={onContextMenu}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchEnd}
          >
            {msg.forwarded && (
              <div className="co-forwarded-label">
                <i className="bx bx-forward-big" /> Forwarded
              </div>
            )}
            {msg.reply && (
              <div className="co-reply-quote">
                <span className="co-reply-user">{msg.reply.user}</span>
                <span className="co-reply-text">{msg.reply.text}</span>
              </div>
            )}
            <div
              className="co-msg-text"
              dangerouslySetInnerHTML={{ __html: escapeHtml(msg.text) }}
            />
            <button className="co-arrow-btn" onClick={onArrowClick}>
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

// ══════════════════════════════════════════════════════════
//  BubbleMenu
// ══════════════════════════════════════════════════════════
function BubbleMenu({
  x,
  y,
  onClose,
  onReaction,
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
    const pw = ref.current.offsetWidth || 220;
    const ph = ref.current.offsetHeight || 320;
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
    { icon: "bx-reply-big", label: "Reply", fn: onReply, danger: false },
    { icon: "bx-copy", label: "Copy", fn: onCopy, danger: false },
    { icon: "bx-forward-big", label: "Forward", fn: onForward, danger: false },
    { icon: "bx-check-square", label: "Select", fn: onSelect, danger: false },
    { icon: "bx-trash", label: "Delete", fn: onDelete, danger: true },
  ];

  return (
    <div className="co-bm-overlay" onClick={onClose}>
      <div
        ref={ref}
        className="co-bm-popup"
        style={pos}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="co-bm-emoji-row">
          {QUICK_EMOJIS.map((em) => (
            <span
              key={em}
              className="co-bm-emoji"
              onClick={() => onReaction(em)}
            >
              {em}
            </span>
          ))}
        </div>
        {items.map((item) => (
          <div
            key={item.label}
            className={`co-bm-item${item.danger ? " co-bm-danger" : ""}`}
            onClick={item.fn}
          >
            <i className={`bx ${item.icon}`} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  ContactCtxMenu
// ══════════════════════════════════════════════════════════
function ContactCtxMenu({ x, y, isMuted, isPinned, onClose, onAction }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ left: x, top: y });

  useEffect(() => {
    if (!ref.current) return;
    const pw = ref.current.offsetWidth || 210;
    const ph = ref.current.offsetHeight || 220;
    const vw = window.innerWidth,
      vh = window.innerHeight;
    let lx = x,
      ly = y;
    if (lx + pw + 10 > vw) lx = vw - pw - 10;
    if (ly + ph + 10 > vh) ly = vh - ph - 10;
    setPos({ left: lx, top: ly });
  }, [x, y]);

  const items = [
    { icon: "bx-pin", label: isPinned ? "Unpin" : "Pin", action: "pin" },
    {
      icon: "bx-bell-off",
      label: isMuted ? "Unmute notifications" : "Mute notifications",
      action: "mute",
    },
    { icon: "bx-block", label: "Block", action: "block" },
    { icon: "bx-minus-circle", label: "Clear chat", action: "clear" },
    { icon: "bx-trash", label: "Delete chat", action: "delete", danger: true },
  ];

  return (
    <div className="co-bm-overlay" onClick={onClose}>
      <div
        ref={ref}
        className="co-ctx-menu"
        style={pos}
        onClick={(e) => e.stopPropagation()}
      >
        {items.map((item) => (
          <div
            key={item.action}
            className={`co-ctx-item${item.danger ? " co-ctx-danger" : ""}`}
            onClick={() => onAction(item.action)}
          >
            <i className={`bx ${item.icon}`} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
