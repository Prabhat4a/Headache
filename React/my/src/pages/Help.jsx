import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "boxicons/css/boxicons.min.css";
import "../styles/Help.css";

const FAQ_CATEGORIES = [
  {
    id: "getting-started",
    icon: "bx-rocket",
    label: "Getting Started",
    color: "#a78bfa",
    faqs: [
      {
        q: "What is STUVO5?",
        a: "STUVO5 is your all-in-one college companion app. It helps you track college buses in real time, explore campus events, read notices, chat with peers, check your syllabus, raise complaints, and much more — all from one place.",
      },
      {
        q: "How do I create an account?",
        a: "Tap 'Register' on the login screen. Enter your college email, set a password, and verify your email via the OTP sent to you. Once verified, complete your profile and you're in!",
      },
      {
        q: "I forgot my password. What should I do?",
        a: "On the login page, tap 'Forgot Password'. Enter your registered email address and we'll send you a reset link. Check your spam folder if you don't see it within a minute.",
      },
      {
        q: "Can I use STUVO5 on my phone as an app?",
        a: "Yes! STUVO5 is a Progressive Web App (PWA). On Android Chrome, tap the ⊕ icon in the address bar or go to Menu → 'Add to Home Screen'. On iPhone Safari, tap the Share icon ↑ → 'Add to Home Screen'. It works just like a native app!",
      },
    ],
  },
  {
    id: "explorer",
    icon: "bx-compass",
    label: "Explorer",
    color: "#34d399",
    faqs: [
      {
        q: "What is the Explorer tab?",
        a: "Explorer is your home feed. It shows featured college events in a swipeable carousel, important notices from the admin, and quick access shortcuts. It's the first thing you see after logging in.",
      },
      {
        q: "How do I save an event?",
        a: "On any event card in the carousel, tap the bookmark icon (🔖) in the bottom-right corner of the card. Saved events are highlighted so you never miss them.",
      },
      {
        q: "How do I swipe through events?",
        a: "On mobile, simply swipe left or right on the event cards. On desktop, use the arrow buttons below the carousel or press the left/right keyboard arrow keys.",
      },
      {
        q: "Where can I search for something specific?",
        a: "Tap the 🔍 search icon in the top-right of the header. A search overlay will appear where you can type to find events, faculty, notices, and more.",
      },
    ],
  },
  {
    id: "bus",
    icon: "bx-bus",
    label: "Bus Tracking",
    color: "#f59e0b",
    faqs: [
      {
        q: "How does bus tracking work?",
        a: "The Bus tab shows real-time locations and schedules of college buses. You can see which bus is arriving soon, its route, and estimated arrival time so you never miss your ride.",
      },
      {
        q: "Why is my bus not showing on the map?",
        a: "Bus tracking depends on the driver having the tracker active. If a bus isn't visible, it may not have started its route yet, or the driver's device may be offline. Check back in a few minutes.",
      },
      {
        q: "Can I get notified when my bus is nearby?",
        a: "Notifications are shown in the bell icon in the header. When Bus #101 is arriving in 5 minutes, you'll get an alert there. Make sure notifications are enabled in your device settings.",
      },
    ],
  },
  {
    id: "more",
    icon: "bx-dots-horizontal-rounded",
    label: "More Section",
    color: "#60a5fa",
    faqs: [
      {
        q: "What is in the 'More' menu at the bottom?",
        a: "Tapping the '...' More button opens a Browse sheet with quick cards for: Support Us, Syllabus, Raise Complaint, Clubs, Placements, Facilities, Transport, Cafeteria, and Library.",
      },
      {
        q: "How do I check my syllabus?",
        a: "Go to More → Syllabus. You can browse the syllabus by branch and semester. The content is organized by subject so you can quickly find what you need.",
      },
      {
        q: "How do I raise a complaint?",
        a: "Go to More → Raise Complaint. Fill in the complaint form with details about the issue, the category (e.g. infrastructure, academics, hostel), and submit. The admin will review and respond.",
      },
      {
        q: "What is in Placements?",
        a: "The Placements section shows upcoming campus drives, company details, eligibility criteria, and results of past placement seasons. Stay updated so you never miss a recruitment opportunity.",
      },
      {
        q: "Some sections say 'Coming Soon'. When will they be available?",
        a: "Features like Clubs, Cafeteria, Library, and Facilities are actively being built. They'll be rolled out in upcoming updates. Keep the app updated to get them as soon as they launch.",
      },
    ],
  },
  {
    id: "chat",
    icon: "bx-message-rounded-dots",
    label: "Chat",
    color: "#f472b6",
    faqs: [
      {
        q: "How do I open the chat?",
        a: "Tap the Chat bubble icon in the bottom navigation bar. The chat overlay opens full-screen, covering the header and bottom nav. Tap Close or the X button to go back.",
      },
      {
        q: "Who can I chat with?",
        a: "You can chat with your classmates, batch-mates, and join group conversations. The admin may also use chat for broadcast announcements.",
      },
      {
        q: "Are my messages private?",
        a: "Direct messages between two users are private. Group chats are visible to all group members. STUVO5 does not share your messages with third parties.",
      },
    ],
  },
  {
    id: "profile",
    icon: "bx-user-circle",
    label: "Profile",
    color: "#fb923c",
    faqs: [
      {
        q: "How do I update my profile photo?",
        a: "Go to the Profile tab (person icon in the bottom nav). Tap on your profile picture or the edit button to upload a new photo from your gallery.",
      },
      {
        q: "How do I edit my details like branch or year?",
        a: "In your Profile page, tap the edit (pencil) icon next to any field. Update your branch, year, roll number, or bio and tap Save.",
      },
      {
        q: "How do I view a faculty profile?",
        a: "Faculty profiles are linked from the Explorer and Search sections. Tap on a faculty card to open their full profile including department, subjects taught, and contact info.",
      },
    ],
  },
  {
    id: "account",
    icon: "bx-cog",
    label: "Account & Settings",
    color: "#94a3b8",
    faqs: [
      {
        q: "Where are the app settings?",
        a: "Tap the ☰ menu icon in the top-right of the header, then tap 'Settings'. From there you can manage your account, change your password, update your email or phone, and control notification preferences.",
      },
      {
        q: "How do I log out?",
        a: "Tap the ☰ menu icon → Logout. A confirmation dialog will appear. Tap 'Yes, Logout' to confirm. You'll be taken back to the login screen.",
      },
      {
        q: "How do I delete my account?",
        a: "Go to Settings → Account Center → scroll down to the 'Danger Zone' section. Tap 'Delete Account' and confirm. This action is permanent and cannot be undone.",
      },
      {
        q: "I linked the wrong Google/college account. What do I do?",
        a: "Go to Settings → Account Center → Linked Accounts. You can unlink and re-link your account from there. If you're stuck, use the Raise Complaint feature to contact support.",
      },
    ],
  },
  {
    id: "support",
    icon: "bx-support",
    label: "Support & Feedback",
    color: "#e879f9",
    faqs: [
      {
        q: "How do I contact the STUVO5 team?",
        a: "Go to More → Support Us. You'll find our contact details, social links, and a feedback form. We love hearing from students!",
      },
      {
        q: "I found a bug. How do I report it?",
        a: "Use More → Raise Complaint and select 'App Bug' as the category. Describe what happened and we'll fix it ASAP. Screenshots help a lot!",
      },
      {
        q: "Can I suggest a new feature?",
        a: "Absolutely! Go to More → Support Us and drop us a message with your idea. The best student ideas get built into future updates.",
      },
    ],
  },
];

export default function Help() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("getting-started");
  const [openFaq, setOpenFaq] = useState(null);
  const [search, setSearch] = useState("");

  const currentCat = FAQ_CATEGORIES.find((c) => c.id === activeCategory);

  const filteredFaqs = search.trim()
    ? FAQ_CATEGORIES.flatMap((cat) =>
        cat.faqs
          .filter(
            (f) =>
              f.q.toLowerCase().includes(search.toLowerCase()) ||
              f.a.toLowerCase().includes(search.toLowerCase()),
          )
          .map((f) => ({
            ...f,
            catLabel: cat.label,
            catColor: cat.color,
            catIcon: cat.icon,
          })),
      )
    : currentCat?.faqs.map((f) => ({
        ...f,
        catLabel: currentCat.label,
        catColor: currentCat.color,
        catIcon: currentCat.icon,
      }));

  const toggleFaq = (idx) => setOpenFaq((p) => (p === idx ? null : idx));

  return (
    <div className="help-wrapper">
      {/* Header */}
      <div className="help-header">
        <button className="help-back-btn" onClick={() => navigate(-1)}>
          <i className="bx bx-arrow-back" />
        </button>
        <div className="help-header-info">
          <div className="help-header-icon">
            <i className="bx bx-help-circle" />
          </div>
          <div>
            <h1 className="help-title">Help & FAQ</h1>
            <p className="help-subtitle">Everything you need to know</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="help-search-wrap">
        <i className="bx bx-search help-search-icon" />
        <input
          className="help-search-input"
          placeholder="Search questions…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpenFaq(null);
          }}
        />
        {search && (
          <button className="help-search-clear" onClick={() => setSearch("")}>
            <i className="bx bx-x" />
          </button>
        )}
      </div>

      {/* Category chips — hidden while searching */}
      {!search && (
        <div className="help-cats-scroll">
          {FAQ_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`help-cat-chip${activeCategory === cat.id ? " active" : ""}`}
              style={
                activeCategory === cat.id ? { "--chip-color": cat.color } : {}
              }
              onClick={() => {
                setActiveCategory(cat.id);
                setOpenFaq(null);
              }}
            >
              <i className={`bx ${cat.icon}`} />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Section label */}
      <div className="help-section-label">
        {search ? (
          <span>
            {filteredFaqs.length} result{filteredFaqs.length !== 1 ? "s" : ""}{" "}
            for "{search}"
          </span>
        ) : (
          <span style={{ color: currentCat?.color }}>
            <i className={`bx ${currentCat?.icon}`} /> {currentCat?.label}
          </span>
        )}
      </div>

      {/* FAQ Accordion */}
      <div className="help-faq-list">
        {filteredFaqs.length === 0 ? (
          <div className="help-empty">
            <i className="bx bx-search-alt" />
            <p>No results found</p>
            <span>Try different keywords</span>
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => (
            <div
              key={idx}
              className={`help-faq-item${openFaq === idx ? " open" : ""}`}
              onClick={() => toggleFaq(idx)}
            >
              <div className="help-faq-question">
                <span>{faq.q}</span>
                <i
                  className={`bx ${openFaq === idx ? "bx-minus" : "bx-plus"}`}
                />
              </div>
              <div className="help-faq-answer">
                <p>{faq.a}</p>
                {search && (
                  <span
                    className="help-faq-tag"
                    style={{ color: faq.catColor }}
                  >
                    <i className={`bx ${faq.catIcon}`} /> {faq.catLabel}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer CTA */}
      <div className="help-footer">
        <i className="bx bx-message-rounded-dots" />
        <p>Still need help?</p>
        <span>
          Use More → Raise Complaint to contact our support team directly.
        </span>
        <button
          className="help-footer-btn"
          onClick={() => navigate("/complaint")}
        >
          Raise a Complaint
        </button>
      </div>
    </div>
  );
}
