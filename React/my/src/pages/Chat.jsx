import { useState, useEffect, useRef } from "react";
import "../styles/ChatApp.css";

// ── helpers ──────────────────────────────────────────────
const today = new Date();
function daysAgo(n) {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}
function getDateLabel(dateStr) {
  const msgDate = new Date(dateStr);
  const now = new Date();
  const toDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const mDay = new Date(
    msgDate.getFullYear(),
    msgDate.getMonth(),
    msgDate.getDate(),
  );
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
function nowTime() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
let _id = 0;
const newId = () => ++_id;

const AV = { 1: "av-blue", 2: "av-pink", 3: "av-green" };

const INIT_CONTACTS = [
  {
    userId: "1",
    name: "Amit Kumar",
    initials: "AK",
    avClass: "av-blue",
    lastMsg: "Great! I will wait for you",
    time: "10:33 AM",
    unread: 2,
  },
  {
    userId: "2",
    name: "Priya Sharma",
    initials: "PS",
    avClass: "av-pink",
    lastMsg: "Got it, thanks!",
    time: "9:52 AM",
    unread: 0,
  },
  {
    userId: "3",
    name: "Rahul Verma",
    initials: "RV",
    avClass: "av-green",
    lastMsg: "Let me know if you need anything",
    time: "8:26 AM",
    unread: 0,
  },
];

function buildMessages() {
  const raw = {
    1: [
      {
        type: "received",
        text: "Hey! Long time no see.",
        time: "10:10 AM",
        date: daysAgo(3),
      },
      {
        type: "sent",
        text: "I know right! How have you been?",
        time: "10:12 AM",
        date: daysAgo(3),
      },
      {
        type: "received",
        text: "All good! You coming to college tomorrow?",
        time: "6:00 PM",
        date: daysAgo(1),
      },
      {
        type: "sent",
        text: "Yes, I will be there!",
        time: "6:05 PM",
        date: daysAgo(1),
      },
      {
        type: "received",
        text: "Hey, are you coming to the lab?",
        time: "10:30 AM",
        date: daysAgo(0),
      },
      {
        type: "sent",
        text: "Yes, I will be there in 15 minutes",
        time: "10:32 AM",
        date: daysAgo(0),
      },
      {
        type: "received",
        text: "Great! I will wait for you",
        time: "10:33 AM",
        date: daysAgo(0),
      },
    ],
    2: [
      {
        type: "received",
        text: "Did you finish the assignment?",
        time: "9:00 AM",
        date: daysAgo(2),
      },
      {
        type: "sent",
        text: "Almost done, a few more questions left.",
        time: "9:15 AM",
        date: daysAgo(2),
      },
      {
        type: "received",
        text: "Can you share the notes?",
        time: "9:45 AM",
        date: daysAgo(0),
      },
      {
        type: "sent",
        text: "Sure, I will send them right away",
        time: "9:50 AM",
        date: daysAgo(0),
      },
      {
        type: "sent",
        text: "Check your email",
        time: "9:51 AM",
        date: daysAgo(0),
      },
      {
        type: "received",
        text: "Got it, thanks!",
        time: "9:52 AM",
        date: daysAgo(0),
      },
    ],
    3: [
      {
        type: "sent",
        text: "Hey Rahul, need help with the project.",
        time: "4:00 PM",
        date: daysAgo(4),
      },
      {
        type: "received",
        text: "Sure! What do you need?",
        time: "4:10 PM",
        date: daysAgo(4),
      },
      {
        type: "sent",
        text: "The database part is confusing me.",
        time: "8:00 AM",
        date: daysAgo(1),
      },
      {
        type: "received",
        text: "I can explain it to you after class.",
        time: "8:05 AM",
        date: daysAgo(1),
      },
      {
        type: "received",
        text: "Thanks for the help!",
        time: "8:20 AM",
        date: daysAgo(0),
      },
      {
        type: "sent",
        text: "No problem, happy to help!",
        time: "8:25 AM",
        date: daysAgo(0),
      },
      {
        type: "received",
        text: "Let me know if you need anything",
        time: "8:26 AM",
        date: daysAgo(0),
      },
    ],
  };
  const out = {};
  Object.entries(raw).forEach(([k, arr]) => {
    out[k] = arr.map((m) => ({
      ...m,
      id: newId(),
      reaction: null,
      deleted: false,
      deletedForMe: false,
      forwarded: false,
      reply: null,
    }));
  });
  return out;
}

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
    "😋",
    "😛",
    "😜",
    "🤪",
    "😎",
    "🤓",
    "😢",
    "😭",
    "😱",
    "😡",
    "🤬",
    "🥳",
    "🥺",
    "🤗",
    "🤔",
    "🤐",
    "😴",
    "🤒",
    "💀",
    "👻",
    "🤖",
  ],
  "👋 People": [
    "👋",
    "🤚",
    "✋",
    "👌",
    "✌️",
    "🤞",
    "👍",
    "👎",
    "✊",
    "👏",
    "🙌",
    "🤝",
    "🙏",
    "💪",
    "🫶",
    "👶",
    "🧒",
    "👦",
    "👧",
    "🧑",
    "👨",
    "👩",
    "🧓",
    "👴",
    "👵",
    "🙍",
    "🙆",
    "💁",
    "🙋",
    "🤷",
    "🤦",
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
    "🐔",
    "🐧",
    "🦆",
    "🦅",
    "🦉",
    "🐙",
    "🦑",
    "🐬",
    "🐳",
    "🦈",
    "🐊",
    "🐘",
    "🦒",
    "🦓",
    "🐕",
    "🐈",
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
    "🍒",
    "🍑",
    "🥭",
    "🍍",
    "🥥",
    "🥝",
    "🍅",
    "🥑",
    "🍆",
    "🥕",
    "🌽",
    "🍞",
    "🥐",
    "🧇",
    "🍳",
    "🍕",
    "🍔",
    "🍟",
    "🌮",
    "🍜",
    "🍣",
    "🍦",
    "🍰",
    "🎂",
    "☕",
    "🧋",
    "🍺",
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
    "✨",
    "🔥",
    "💫",
    "⭐",
    "🌟",
    "🎉",
    "🎊",
    "🎈",
    "🎁",
    "🏆",
    "💯",
    "✅",
    "❌",
    "❓",
    "❗",
    "🔔",
    "💡",
    "🎵",
    "🎶",
  ],
};
const EMOJI_QUICK = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

export default function Chat() {
  const [contacts, setContacts] = useState(INIT_CONTACTS);
  const [messages, setMessages] = useState(buildMessages);
  const [currentUser, setCurrent] = useState(null);
  const [searchTerm, setSearch] = useState("");
  const [inputText, setInput] = useState("");
  const [replyData, setReply] = useState(null);
  const [blocked, setBlocked] = useState(() =>
    JSON.parse(localStorage.getItem("ch_blocked") || "{}"),
  );
  const [pinned, setPinned] = useState(() =>
    JSON.parse(localStorage.getItem("ch_pinned") || "{}"),
  );
  const [muted, setMuted] = useState(() =>
    JSON.parse(localStorage.getItem("ch_muted") || "{}"),
  );
  const [leftHidden, setLeftHidden] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelected] = useState(new Set());
  const [showMenu, setShowMenu] = useState(false);
  const [showClear, setShowClear] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [delTargets, setDelTargets] = useState([]);
  const [showFwd, setShowFwd] = useState(false);
  const [fwdTexts, setFwdTexts] = useState([]);
  const [bubbleMenu, setBubble] = useState(null);
  const [ctxMenu, setCtx] = useState(null);
  const [typing, setTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState("");
  const [emojiTab, setEmojiTab] = useState(Object.keys(EMOJI_CATS)[0]);

  const msgsEndRef = useRef(null);
  const typingTimer = useRef(null);
  const inputRef = useRef(null);
  const emojiRef = useRef(null);

  // persist
  useEffect(() => {
    localStorage.setItem("ch_blocked", JSON.stringify(blocked));
  }, [blocked]);
  useEffect(() => {
    localStorage.setItem("ch_pinned", JSON.stringify(pinned));
  }, [pinned]);
  useEffect(() => {
    localStorage.setItem("ch_muted", JSON.stringify(muted));
  }, [muted]);

  // scroll bottom
  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentUser, typing]);

  // outside click
  useEffect(() => {
    const h = (e) => {
      if (bubbleMenu && !e.target.closest(".bm-popup")) setBubble(null);
      if (ctxMenu && !e.target.closest(".contact-ctx-menu")) setCtx(null);
      if (showMenu && !e.target.closest(".chat-menu")) setShowMenu(false);
      if (
        showEmoji &&
        emojiRef.current &&
        !emojiRef.current.contains(e.target) &&
        !e.target.closest(".emoji-toggle-btn")
      )
        setShowEmoji(false);
    };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, [bubbleMenu, ctxMenu, showMenu, showEmoji]);

  // escape
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") {
        setBubble(null);
        setCtx(null);
        if (selectMode) exitSelect();
        setShowEmoji(false);
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [selectMode]);

  // ── contact helpers ──────────────────────────────
  const sorted = [...contacts]
    .filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => !!pinned[b.userId] - !!pinned[a.userId]);

  function openChat(c) {
    if (selectMode) exitSelect();
    setCurrent(c);
    setContacts((prev) =>
      prev.map((x) => (x.userId === c.userId ? { ...x, unread: 0 } : x)),
    );
    setShowMenu(false);
    setShowEmoji(false);
    setReply(null);
    setTyping(false);
    clearTimeout(typingTimer.current);
    if (window.innerWidth <= 768) setLeftHidden(true);
  }

  function closeChat() {
    setCurrent(null);
    setLeftHidden(false);
    setSelectMode(false);
    setSelected(new Set());
    setInput("");
    setReply(null);
    setShowMenu(false);
    setShowEmoji(false);
  }

  // ── send ─────────────────────────────────────────
  function sendMessage() {
    const text = inputText.trim();
    if (!text || !currentUser || blocked[currentUser.userId]) return;
    const uid = currentUser.userId;
    const msg = {
      id: newId(),
      type: "sent",
      text,
      time: nowTime(),
      date: daysAgo(0),
      reaction: null,
      deleted: false,
      deletedForMe: false,
      forwarded: false,
      reply: replyData ? { ...replyData } : null,
    };
    setMessages((prev) => ({ ...prev, [uid]: [...(prev[uid] || []), msg] }));
    setContacts((prev) =>
      prev.map((c) =>
        c.userId === uid
          ? { ...c, lastMsg: text, time: nowTime(), unread: 0 }
          : c,
      ),
    );
    setInput("");
    setReply(null);
    inputRef.current?.focus();
    clearTimeout(typingTimer.current);
    setTimeout(() => {
      if (!blocked[uid]) {
        setTyping(true);
        typingTimer.current = setTimeout(() => setTyping(false), 2200);
      }
    }, 600);
  }

  // ── message groups ────────────────────────────────
  function getGroups(userId) {
    const msgs = (messages[userId] || []).filter((m) => !m.deletedForMe);
    const result = [];
    let lastLabel = null;
    msgs.forEach((m) => {
      const label = getDateLabel(m.date);
      if (label !== lastLabel) {
        result.push({ kind: "divider", label });
        lastLabel = label;
      }
      result.push({ kind: "msg", ...m });
    });
    return result;
  }

  // ── select ────────────────────────────────────────
  function enterSelect(id) {
    setSelectMode(true);
    setSelected(new Set([id]));
  }
  function exitSelect() {
    setSelectMode(false);
    setSelected(new Set());
  }
  function toggleSel(id) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      if (n.size === 0) {
        setSelectMode(false);
        return prev;
      }
      return n;
    });
  }

  // ── bubble menu ───────────────────────────────────
  function openBubble(e, msg) {
    e.preventDefault();
    if (selectMode) {
      toggleSel(msg.id);
      return;
    }
    const vw = window.innerWidth,
      vh = window.innerHeight;
    let x = e.clientX ?? vw / 2,
      y = e.clientY ?? vh / 2;
    if (x + 220 > vw) x = vw - 220 - 10;
    if (y + 300 > vh) y = vh - 300 - 10;
    if (x < 10) x = 10;
    if (y < 10) y = 10;
    setBubble({ x, y, msgId: msg.id, type: msg.type, text: msg.text });
  }

  function doBubble(action) {
    if (!bubbleMenu) return;
    const { msgId, type, text } = bubbleMenu;
    if (action === "copy") navigator.clipboard.writeText(text).catch(() => {});
    if (action === "reply") {
      setReply({ user: type === "sent" ? "You" : currentUser.name, text });
      inputRef.current?.focus();
    }
    if (action === "forward") {
      setFwdTexts([text]);
      setShowFwd(true);
    }
    if (action === "select") {
      setBubble(null);
      enterSelect(msgId);
      return;
    }
    if (action === "delete") {
      setDelTargets([msgId]);
      setShowDelete(true);
    }
    setBubble(null);
  }

  function doReaction(emoji) {
    if (!bubbleMenu) return;
    const { msgId } = bubbleMenu;
    setMessages((prev) => ({
      ...prev,
      [currentUser.userId]: prev[currentUser.userId].map((m) =>
        m.id === msgId ? { ...m, reaction: emoji } : m,
      ),
    }));
    setBubble(null);
  }

  // ── delete ────────────────────────────────────────
  function doDelete(forAll) {
    const ids = delTargets.length ? new Set(delTargets) : selectedIds;
    const uid = currentUser.userId;
    setMessages((prev) => ({
      ...prev,
      [uid]: prev[uid].map((m) =>
        !ids.has(m.id)
          ? m
          : forAll
            ? { ...m, deleted: true }
            : { ...m, deletedForMe: true },
      ),
    }));
    setShowDelete(false);
    setDelTargets([]);
    exitSelect();
  }

  // ── block ──────────────────────────────────────────
  function blockUser(uid) {
    setBlocked((prev) => ({ ...prev, [uid]: true }));
    setMessages((prev) => ({
      ...prev,
      [uid]: [
        ...(prev[uid] || []),
        {
          id: newId(),
          type: "system",
          text: "You blocked this contact. Tap to unblock.",
          time: nowTime(),
          date: daysAgo(0),
          reaction: null,
          deleted: false,
          deletedForMe: false,
          forwarded: false,
          reply: null,
        },
      ],
    }));
  }
  function unblockUser(uid) {
    setBlocked((prev) => {
      const n = { ...prev };
      delete n[uid];
      return n;
    });
  }

  // ── clear ──────────────────────────────────────────
  function clearChat(uid) {
    setMessages((prev) => ({ ...prev, [uid]: [] }));
    setContacts((prev) =>
      prev.map((c) => (c.userId === uid ? { ...c, lastMsg: "" } : c)),
    );
  }

  // ── ctx menu ──────────────────────────────────────
  function openCtx(e, uid) {
    e.preventDefault();
    const vw = window.innerWidth,
      vh = window.innerHeight;
    let x = e.clientX,
      y = e.clientY;
    if (x + 220 > vw) x = vw - 220 - 10;
    if (y + 220 > vh) y = vh - 220 - 10;
    setCtx({ x, y, userId: uid });
  }
  function doCtx(action) {
    const { userId: uid } = ctxMenu;
    if (action === "pin") {
      setPinned((prev) => {
        const n = { ...prev };
        if (n[uid]) delete n[uid];
        else n[uid] = true;
        return n;
      });
    }
    if (action === "mute") {
      setMuted((prev) => {
        const n = { ...prev };
        if (n[uid]) delete n[uid];
        else n[uid] = true;
        return n;
      });
    }
    if (action === "block") blockUser(uid);
    if (action === "clear") clearChat(uid);
    if (action === "delete") {
      setContacts((prev) => prev.filter((c) => c.userId !== uid));
      if (currentUser?.userId === uid) closeChat();
    }
    setCtx(null);
  }

  // ── forward ──────────────────────────────────────
  function doForward(targetIds) {
    const t = nowTime();
    targetIds.forEach((toId) => {
      fwdTexts.forEach((txt) => {
        const msg = {
          id: newId(),
          type: "sent",
          text: txt,
          time: t,
          date: daysAgo(0),
          reaction: null,
          deleted: false,
          deletedForMe: false,
          forwarded: true,
          reply: null,
        };
        setMessages((prev) => ({
          ...prev,
          [toId]: [...(prev[toId] || []), msg],
        }));
        setContacts((prev) =>
          prev.map((c) =>
            c.userId === toId
              ? { ...c, lastMsg: "Forwarded: " + txt, time: t }
              : c,
          ),
        );
      });
    });
    setShowFwd(false);
    setFwdTexts([]);
  }

  // ── delete modal target check ──────────────────────
  const canDeleteForAll = (() => {
    const ids = delTargets.length ? new Set(delTargets) : selectedIds;
    return [...ids].every(
      (id) =>
        (messages[currentUser?.userId] || []).find((m) => m.id === id)?.type ===
        "sent",
    );
  })();

  const isBlocked = currentUser ? !!blocked[currentUser.userId] : false;

  return (
    <div className="chat-shell">
      {/* ══ LEFT PANEL ══ */}
      <div className={`chat-left-panel${leftHidden ? " hidden-mobile" : ""}`}>
        <div className="chat-left-header">
          <h2>Messages</h2>
        </div>

        <div className="chat-search-bar">
          <i className="bx bx-search" />
          <input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="chat-list">
          {sorted.map((c) => (
            <div
              key={c.userId}
              className={`chat-item${currentUser?.userId === c.userId ? " active-chat" : ""}${pinned[c.userId] ? " pinned" : ""}${muted[c.userId] ? " muted" : ""}${blocked[c.userId] ? " blocked" : ""}`}
              onClick={() => openChat(c)}
              onContextMenu={(e) => openCtx(e, c.userId)}
            >
              <div className={`chat-avatar ${c.avClass}`}>{c.initials}</div>
              <div className="chat-info">
                <div className="chat-name-row">
                  <span className="chat-name">
                    {c.name}
                    {pinned[c.userId] && (
                      <span className="pin-badge">
                        <i className="bx bx-pin" />
                      </span>
                    )}
                  </span>
                  <span className="chat-time">{c.time}</span>
                </div>
                <div className="chat-preview-row">
                  <span
                    className={`chat-message${blocked[c.userId] ? " blocked-msg" : ""}`}
                  >
                    {blocked[c.userId] ? "Blocked" : c.lastMsg}
                  </span>
                  {c.unread > 0 && (
                    <span className="unread-badge">{c.unread}</span>
                  )}
                  {muted[c.userId] && (
                    <span className="mute-icon">
                      <i className="bx bx-bell-off" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {sorted.length === 0 && searchTerm && (
            <div className="empty-contacts">
              <i className="bx bx-search-alt" />
              <p>No chats found</p>
              <span>Try a different name</span>
            </div>
          )}
        </div>
      </div>

      {/* ══ RIGHT PANEL ══ */}
      <div className="chat-right-panel">
        {!currentUser && (
          <div className="no-chat-selected">
            <div className="no-chat-inner">
              <div className="no-chat-icon">
                <i className="bx bx-message-rounded-dots" />
              </div>
              <h3>Select a chat to start messaging</h3>
              <p>
                Choose from your existing conversations or search for someone
              </p>
            </div>
          </div>
        )}

        {currentUser && (
          <div className="chat-view active">
            {/* Header */}
            <div className="chat-header-bar">
              <button className="back-button" onClick={closeChat}>
                <i className="bx bx-arrow-back" />
              </button>
              <div className="chat-header-info-wrap">
                <div
                  className={`chat-avatar ${currentUser.avClass || AV[currentUser.userId] || "av-purple"}`}
                >
                  {currentUser.initials}
                </div>
                <div className="chat-header-info">
                  <div className="chat-header-name">{currentUser.name}</div>
                  <div
                    className={`chat-header-status${typing ? " typing" : ""}`}
                  >
                    {typing ? "typing..." : "Online"}
                  </div>
                </div>
              </div>
              <div className="chat-menu">
                <button
                  className="icon-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu((p) => !p);
                  }}
                >
                  <i className="bx bx-dots-vertical-rounded" />
                </button>
                {showMenu && (
                  <div
                    className="menu-dropdown active"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      className="menu-item"
                      onClick={() => {
                        isBlocked
                          ? unblockUser(currentUser.userId)
                          : blockUser(currentUser.userId);
                        setShowMenu(false);
                      }}
                    >
                      <i className="bx bx-block" />
                      <span>{isBlocked ? "Unblock user" : "Block user"}</span>
                    </div>
                    <div
                      className="menu-item danger-item"
                      onClick={() => {
                        setShowClear(true);
                        setShowMenu(false);
                      }}
                    >
                      <i className="bx bx-trash" />
                      <span>Clear chat</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="messages-container">
              {(messages[currentUser.userId] || []).length === 0 &&
                !isBlocked && (
                  <div className="empty-chat-state">
                    <div className="empty-chat-inner">
                      <div className="empty-chat-emoji">👋</div>
                      <h3>Say hello!</h3>
                      <p>No messages yet. Start the conversation.</p>
                    </div>
                  </div>
                )}

              {getGroups(currentUser.userId).map((item, idx) => {
                if (item.kind === "divider")
                  return (
                    <div className="day-divider" key={`d${idx}`}>
                      <span>{item.label}</span>
                    </div>
                  );
                const msg = item;
                if (msg.type === "system")
                  return (
                    <div
                      className="system-notice"
                      key={msg.id}
                      onClick={() => unblockUser(currentUser.userId)}
                    >
                      {msg.text}
                    </div>
                  );
                const isSel = selectedIds.has(msg.id);
                return (
                  <div
                    key={msg.id}
                    className={`message ${msg.type}${isSel ? " selected-msg" : ""}${msg.deleted ? " faded" : ""}`}
                    onClick={() => selectMode && toggleSel(msg.id)}
                  >
                    {msg.type === "received" && (
                      <div
                        className={`message-avatar ${AV[currentUser.userId] || "av-purple"}`}
                      >
                        {currentUser.initials}
                      </div>
                    )}
                    <div className="message-content">
                      <div
                        className={`message-bubble${msg.starred ? " starred" : ""}`}
                        onContextMenu={(e) =>
                          !msg.deleted && openBubble(e, msg)
                        }
                      >
                        {msg.deleted ? (
                          <div className="deleted-msg-notice">
                            <i className="bx bx-block" />
                            <span>
                              {msg.type === "sent"
                                ? "You deleted this message"
                                : "This message was deleted"}
                            </span>
                          </div>
                        ) : (
                          <>
                            {msg.forwarded && (
                              <div className="forwarded-label">
                                <i className="bx bx-forward" /> Forwarded
                              </div>
                            )}
                            {msg.reply && (
                              <div className="reply-quote">
                                <span className="reply-user">
                                  {msg.reply.user}
                                </span>
                                <span className="reply-text">
                                  {msg.reply.text}
                                </span>
                              </div>
                            )}
                            <div className="message-text">{msg.text}</div>
                            {!selectMode && (
                              <button
                                className="bubble-arrow-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openBubble(e, msg);
                                }}
                              >
                                <i className="bx bx-chevron-down" />
                              </button>
                            )}
                          </>
                        )}
                        <span className="msg-time-stamp">{msg.time}</span>
                      </div>
                      {msg.reaction && (
                        <div className="reaction">{msg.reaction}</div>
                      )}
                    </div>
                  </div>
                );
              })}

              {typing && currentUser && (
                <div className="typing-indicator">
                  <div
                    className={`typing-avatar ${AV[currentUser.userId] || "av-purple"}`}
                  >
                    {currentUser.initials}
                  </div>
                  <div className="typing-bubble">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              )}
              <div ref={msgsEndRef} />
            </div>

            {/* Block notice */}
            {isBlocked && (
              <div className="block-notice active">
                <i className="bx bx-block" />
                <span>You blocked this contact.</span>
                <button onClick={() => unblockUser(currentUser.userId)}>
                  Unblock
                </button>
              </div>
            )}

            {/* Select bar */}
            {selectMode && (
              <div className="msg-select-bar active">
                <button className="msg-select-bar-cancel" onClick={exitSelect}>
                  <i className="bx bx-x" />
                </button>
                <span className="msg-select-count">
                  {selectedIds.size === 1
                    ? "1 selected"
                    : `${selectedIds.size} selected`}
                </span>
                <div className="msg-select-actions">
                  <button
                    className="msg-sel-btn"
                    title="Copy"
                    onClick={() => {
                      const texts = [...selectedIds].map(
                        (id) =>
                          (messages[currentUser.userId] || []).find(
                            (m) => m.id === id,
                          )?.text || "",
                      );
                      navigator.clipboard
                        .writeText(texts.join("\n"))
                        .catch(() => {});
                      exitSelect();
                    }}
                  >
                    <i className="bx bx-copy" />
                  </button>
                  <button
                    className="msg-sel-btn"
                    title="Delete"
                    onClick={() => {
                      setDelTargets([...selectedIds]);
                      setShowDelete(true);
                    }}
                  >
                    <i className="bx bx-trash" />
                  </button>
                  <button
                    className="msg-sel-btn"
                    title="Forward"
                    onClick={() => {
                      const texts = [...selectedIds]
                        .map(
                          (id) =>
                            (messages[currentUser.userId] || []).find(
                              (m) => m.id === id,
                            )?.text || "",
                        )
                        .filter(Boolean);
                      setFwdTexts(texts);
                      setShowFwd(true);
                      exitSelect();
                    }}
                  >
                    <i className="bx bx-forward" />
                  </button>
                </div>
              </div>
            )}

            {/* Input */}
            {!selectMode && (
              <div
                className={`message-input-container${isBlocked ? " disabled" : ""}`}
              >
                <div className="input-box">
                  {replyData && (
                    <div className="reply-preview visible">
                      <div className="reply-content">
                        <strong>{replyData.user}</strong>
                        <span>{replyData.text}</span>
                      </div>
                      <button
                        className="close-reply"
                        onClick={() => setReply(null)}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <div className="input-row">
                    <button
                      className="emoji-toggle-btn"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        padding: 0,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isBlocked) setShowEmoji((p) => !p);
                      }}
                    >
                      <i
                        className="bx bx-smile"
                        style={{ color: "#555", fontSize: 20 }}
                      />
                    </button>
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Type a message..."
                      value={inputText}
                      disabled={isBlocked}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <button
                      className="send-button"
                      onClick={sendMessage}
                      disabled={isBlocked}
                    >
                      <i className="bx bx-send" />
                    </button>
                  </div>
                </div>

                {showEmoji && (
                  <div
                    className="emoji-picker"
                    ref={emojiRef}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="ep-search-row">
                      <i className="bx bx-search" />
                      <input
                        className="ep-search"
                        placeholder="Search emoji..."
                        value={emojiSearch}
                        onChange={(e) => setEmojiSearch(e.target.value)}
                      />
                    </div>
                    <div className="ep-tabs">
                      {Object.keys(EMOJI_CATS).map((cat) => (
                        <button
                          key={cat}
                          className={`ep-tab${emojiTab === cat ? " active" : ""}`}
                          onClick={() => {
                            setEmojiTab(cat);
                            setEmojiSearch("");
                          }}
                        >
                          {cat.split(" ")[0]}
                        </button>
                      ))}
                    </div>
                    <div className="ep-body">
                      {Object.entries(EMOJI_CATS).map(([cat, emojis]) => {
                        const filtered = emojiSearch
                          ? emojis.filter((em) => em.includes(emojiSearch))
                          : emojis;
                        if (
                          emojiSearch ? filtered.length === 0 : cat !== emojiTab
                        )
                          return null;
                        return (
                          <div key={cat}>
                            <div className="ep-cat-label">{cat}</div>
                            <div className="ep-grid">
                              {filtered.map((em, i) => (
                                <span
                                  key={i}
                                  className="ep-em"
                                  onClick={() => {
                                    setInput((p) => p + em);
                                    inputRef.current?.focus();
                                  }}
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
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══ BUBBLE MENU ══ */}
      {bubbleMenu && (
        <div className="bm-overlay" onClick={() => setBubble(null)}>
          <div
            className="bm-popup"
            style={{ left: bubbleMenu.x, top: bubbleMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bm-emoji-row">
              {EMOJI_QUICK.map((em, i) => (
                <span
                  key={i}
                  className="bm-emoji"
                  onClick={() => doReaction(em)}
                >
                  {em}
                </span>
              ))}
            </div>
            <div className="bm-sep" />
            {[
              { icon: "bx-reply", label: "Reply", action: "reply" },
              { icon: "bx-copy", label: "Copy", action: "copy" },
              { icon: "bx-forward", label: "Forward", action: "forward" },
              { icon: "bx-check-square", label: "Select", action: "select" },
              {
                icon: "bx-trash",
                label: "Delete",
                action: "delete",
                danger: true,
              },
            ].map((item) => (
              <div
                key={item.action}
                className={`bm-item${item.danger ? " bm-danger" : ""}`}
                onClick={() => doBubble(item.action)}
              >
                <i className={`bx ${item.icon}`} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ CONTACT CTX MENU ══ */}
      {ctxMenu && (
        <div
          className="contact-ctx-overlay active"
          onClick={() => setCtx(null)}
        >
          <div
            className="contact-ctx-menu"
            style={{ left: ctxMenu.x, top: ctxMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            {[
              {
                icon: "bx-pin",
                label: pinned[ctxMenu.userId] ? "Unpin" : "Pin",
                action: "pin",
              },
              {
                icon: "bx-bell-off",
                label: muted[ctxMenu.userId] ? "Unmute" : "Mute notifications",
                action: "mute",
              },
              { icon: "bx-block", label: "Block", action: "block" },
              { icon: "bx-minus-circle", label: "Clear chat", action: "clear" },
            ].map((item) => (
              <div
                key={item.action}
                className="ctx-item"
                onClick={() => doCtx(item.action)}
              >
                <i className={`bx ${item.icon}`} />
                <span>{item.label}</span>
              </div>
            ))}
            <div
              className="ctx-item ctx-danger"
              onClick={() => doCtx("delete")}
            >
              <i className="bx bx-trash" />
              <span>Delete chat</span>
            </div>
          </div>
        </div>
      )}

      {/* ══ DELETE MODAL ══ */}
      {showDelete && (
        <div
          className="confirm-overlay active"
          onClick={() => setShowDelete(false)}
        >
          <div
            className="confirm-box delete-msg-box"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Delete message?</h3>
            <div className="confirm-actions delete-msg-actions">
              {canDeleteForAll && (
                <button
                  className="btn-delete-everyone"
                  onClick={() => doDelete(true)}
                >
                  Delete for everyone
                </button>
              )}
              <button className="btn-delete-me" onClick={() => doDelete(false)}>
                Delete for me
              </button>
              <button
                className="btn-cancel"
                onClick={() => setShowDelete(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ CLEAR CONFIRM ══ */}
      {showClear && (
        <div
          className="confirm-overlay active"
          onClick={() => setShowClear(false)}
        >
          <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
            <h3>Clear this chat?</h3>
            <p>This will permanently delete all messages in this chat.</p>
            <div className="confirm-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowClear(false)}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={() => {
                  clearChat(currentUser.userId);
                  setShowClear(false);
                }}
              >
                Clear chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ FORWARD PICKER ══ */}
      {showFwd && (
        <ForwardPicker
          contacts={contacts}
          onClose={() => setShowFwd(false)}
          onSend={doForward}
        />
      )}
    </div>
  );
}

function ForwardPicker({ contacts, onClose, onSend }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set());
  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );
  function toggle(uid) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(uid)) n.delete(uid);
      else n.add(uid);
      return n;
    });
  }
  return (
    <div className="forward-overlay" onClick={onClose}>
      <div className="forward-modal" onClick={(e) => e.stopPropagation()}>
        <div className="forward-header">
          <button className="forward-close" onClick={onClose}>
            <i className="bx bx-x" />
          </button>
          <h3>Forward message to</h3>
        </div>
        <div className="forward-search">
          <i className="bx bx-search" />
          <input
            placeholder="Search name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="forward-list">
          {filtered.map((c) => (
            <div
              key={c.userId}
              className={`forward-item${selected.has(c.userId) ? " fwd-selected" : ""}`}
              onClick={() => toggle(c.userId)}
            >
              <div className="forward-check">
                <i className="bx bx-check" />
              </div>
              <div
                className={`chat-avatar ${c.avClass}`}
                style={{ width: 42, height: 42, fontSize: 14 }}
              >
                {c.initials}
              </div>
              <span>{c.name}</span>
            </div>
          ))}
        </div>
        <button
          className="forward-send-btn"
          disabled={selected.size === 0}
          onClick={() => selected.size > 0 && onSend([...selected])}
        >
          <i className="bx bx-send" />
        </button>
      </div>
    </div>
  );
}
