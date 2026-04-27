import { useState, useEffect } from "react";
import styles from "./AttendancePage.css";

const subjects = [
  { id: 1, name: "Mathematics", code: "MATH301", attended: 38, total: 45, icon: "📐" },
  { id: 2, name: "Physics", code: "PHY201", attended: 30, total: 40, icon: "⚛️" },
  { id: 3, name: "Computer Science", code: "CS401", attended: 42, total: 44, icon: "💻" },
  { id: 4, name: "English", code: "ENG101", attended: 22, total: 35, icon: "📖" },
  { id: 5, name: "Chemistry", code: "CHEM202", attended: 28, total: 38, icon: "🧪" },
];

function CircularProgress({ percentage, size = 110, strokeWidth = 9, color }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = (pct) => {
    if (pct >= 75) return "#f97316";
    if (pct >= 60) return "#eab308";
    return "#ef4444";
  };

  const ringColor = color || getColor(percentage);

  return (
    <svg width={size} height={size} className={styles.circularSvg}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#2a2a2a"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={ringColor}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className={styles.progressRing}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="#fff"
        fontSize="18"
        fontWeight="700"
        fontFamily="'Rajdhani', sans-serif"
      >
        {percentage}%
      </text>
    </svg>
  );
}

function SubjectCard({ subject }) {
  const percentage = Math.round((subject.attended / subject.total) * 100);
  const isLow = percentage < 75;

  return (
    <div className={`${styles.subjectCard} ${isLow ? styles.lowCard : ""}`}>
      <div className={styles.subjectLeft}>
        <span className={styles.subjectIcon}>{subject.icon}</span>
        <div>
          <p className={styles.subjectName}>{subject.name}</p>
          <p className={styles.subjectCode}>{subject.code}</p>
          <div className={styles.classesRow}>
            <span className={styles.attended}>{subject.attended} attended</span>
            <span className={styles.divider}>/</span>
            <span className={styles.totalClasses}>{subject.total} total</span>
          </div>
        </div>
      </div>
      <div className={styles.subjectRight}>
        <CircularProgress percentage={percentage} size={70} strokeWidth={6} />
        {isLow && <span className={styles.lowBadge}>LOW</span>}
      </div>
    </div>
  );
}

function CalculatorTab() {
  const [totalClasses, setTotalClasses] = useState("");
  const [attendedClasses, setAttendedClasses] = useState("");
  const [targetPercentage, setTargetPercentage] = useState(75);
  const [result, setResult] = useState(null);

  const calculate = () => {
    const total = parseInt(totalClasses);
    const attended = parseInt(attendedClasses);
    if (!total || !attended || attended > total) return;

    const current = Math.round((attended / total) * 100);
    const target = targetPercentage;

    // Classes needed to reach target
    // (attended + x) / (total + x) = target/100
    // attended + x = target/100 * (total + x)
    // attended + x = target*total/100 + target*x/100
    // x - target*x/100 = target*total/100 - attended
    // x(1 - target/100) = target*total/100 - attended
    // x = (target*total/100 - attended) / (1 - target/100)

    let classesNeeded = 0;
    let canBunk = 0;

    if (current < target) {
      classesNeeded = Math.ceil(
        (target * total / 100 - attended) / (1 - target / 100)
      );
    } else {
      // How many can be bunked?
      // (attended) / (total + x) >= target/100
      // attended >= target * (total + x) / 100
      // 100*attended >= target*total + target*x
      // 100*attended - target*total >= target*x
      // x <= (100*attended - target*total) / target
      canBunk = Math.floor((100 * attended - target * total) / target);
    }

    setResult({ current, classesNeeded, canBunk, total, attended, target });
  };

  return (
    <div className={styles.calcContainer}>
      <p className={styles.calcDesc}>
        Find out how many classes you can skip — or need to attend.
      </p>

      <div className={styles.inputGroup}>
        <label className={styles.inputLabel}>Total Classes Held</label>
        <input
          className={styles.calcInput}
          type="number"
          placeholder="e.g. 45"
          value={totalClasses}
          onChange={(e) => setTotalClasses(e.target.value)}
          min="1"
        />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.inputLabel}>Classes Attended</label>
        <input
          className={styles.calcInput}
          type="number"
          placeholder="e.g. 38"
          value={attendedClasses}
          onChange={(e) => setAttendedClasses(e.target.value)}
          min="0"
        />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.inputLabel}>
          Target Attendance — <span className={styles.targetVal}>{targetPercentage}%</span>
        </label>
        <input
          className={styles.rangeInput}
          type="range"
          min="50"
          max="100"
          value={targetPercentage}
          onChange={(e) => setTargetPercentage(parseInt(e.target.value))}
        />
        <div className={styles.rangeLabels}>
          <span>50%</span><span>75%</span><span>100%</span>
        </div>
      </div>

      <button className={styles.calcBtn} onClick={calculate}>
        <span>⚡</span> Calculate
      </button>

      {result && (
        <div className={styles.resultBox}>
          <div className={styles.resultHeader}>
            <CircularProgress percentage={result.current} size={90} strokeWidth={7} />
            <div>
              <p className={styles.resultTitle}>Current Status</p>
              <p className={styles.resultSub}>
                {result.attended} / {result.total} classes
              </p>
            </div>
          </div>

          {result.current < result.target ? (
            <div className={styles.resultAlert + " " + styles.alertDanger}>
              <span className={styles.alertIcon}>⚠️</span>
              <div>
                <p className={styles.alertTitle}>Attendance Below Target</p>
                <p className={styles.alertMsg}>
                  Attend <strong>{result.classesNeeded}</strong> consecutive classes to reach {result.target}%
                </p>
              </div>
            </div>
          ) : (
            <div className={styles.resultAlert + " " + styles.alertSuccess}>
              <span className={styles.alertIcon}>✅</span>
              <div>
                <p className={styles.alertTitle}>You're on Track!</p>
                <p className={styles.alertMsg}>
                  You can skip up to <strong>{result.canBunk}</strong> more classes and stay above {result.target}%
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalAttended = subjects.reduce((a, s) => a + s.attended, 0);
  const totalClasses = subjects.reduce((a, s) => a + s.total, 0);
  const overallPct = Math.round((totalAttended / totalClasses) * 100);
  const lowSubjects = subjects.filter(
    (s) => Math.round((s.attended / s.total) * 100) < 75
  );

  return (
    <div className={`${styles.page} ${mounted ? styles.mounted : ""}`}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn}>←</button>
        <div className={styles.headerInfo}>
          <div className={styles.headerIcon}>📊</div>
          <div>
            <h1 className={styles.headerTitle}>Attendance</h1>
            <p className={styles.headerSub}>Track your academic presence</p>
          </div>
        </div>
      </div>

      {/* Overall Score Card */}
      <div className={styles.overallCard}>
        <div className={styles.overallLeft}>
          <CircularProgress percentage={overallPct} size={110} strokeWidth={9} color="#f97316" />
        </div>
        <div className={styles.overallRight}>
          <p className={styles.overallLabel}>OVERALL ATTENDANCE</p>
          <p className={styles.overallFraction}>{totalAttended} / {totalClasses}</p>
          <p className={styles.overallSemester}>Semester · 2025–26</p>
          {lowSubjects.length > 0 ? (
            <span className={styles.warnBadge}>⚠ {lowSubjects.length} subject{lowSubjects.length > 1 ? "s" : ""} below 75%</span>
          ) : (
            <span className={styles.goodBadge}>✓ All subjects healthy</span>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        <div className={styles.statBox}>
          <p className={styles.statVal}>{totalClasses}</p>
          <p className={styles.statLbl}>Total Classes</p>
        </div>
        <div className={styles.statBox}>
          <p className={styles.statVal}>{totalAttended}</p>
          <p className={styles.statLbl}>Attended</p>
        </div>
        <div className={styles.statBox}>
          <p className={`${styles.statVal} ${styles.missed}`}>{totalClasses - totalAttended}</p>
          <p className={styles.statLbl}>Missed</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "overview" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Subjects
        </button>
        <button
          className={`${styles.tab} ${activeTab === "calculator" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("calculator")}
        >
          ⚡ Calculator
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" ? (
        <div className={styles.subjectList}>
          <p className={styles.sectionLabel}>SUBJECT-WISE BREAKDOWN</p>
          {subjects.map((s) => (
            <SubjectCard key={s.id} subject={s} />
          ))}
        </div>
      ) : (
        <CalculatorTab />
      )}
    </div>
  );
}