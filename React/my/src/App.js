import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// ── Components ──
import AdminExplorer from "./components/Admin-explorer";
import Layout from "./components/Layout";
import Explorer from "./components/Explorer";

// ── Public Pages ──
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import CompleteRegister from "./pages/CompleteRegister";
import LinkAccount from "./pages/LinkAccount";

// ── Protected Pages ──
import Profile from "./pages/Profile";
import Bus from "./pages/Bus";
import FacultyProfile from "./pages/FacultyProfile";
import Settings from "./pages/Settings";
import SearchPage from "./pages/SearchPage";

// ── Built Pages ──
import SupportUs from "./pages/SupportUs";
import Syllabus from "./pages/Syllabus";
import RaiseComplaint from "./pages/RaiseComplaint";
import Placements from "./pages/Placements";

// ── Coming Soon ──
import ComingSoon from "./pages/ComingSoon";

// ── Auth guard ──
const isAuthenticated = () => localStorage.getItem("token") !== null;
const ProtectedLayout = () =>
  isAuthenticated() ? <Layout /> : <Navigate to="/login" replace />;

function App() {
  return (
    <Router>
      <Routes>
        {/* ── Public ── */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/complete-register" element={<CompleteRegister />} />
        <Route path="/link-account" element={<LinkAccount />} />

        {/* ── Protected ── */}
        <Route element={<ProtectedLayout />}>
          <Route path="/explorer" element={<Explorer />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/bus" element={<Bus />} />

          {/* ✅ Chat is an overlay triggered from bottom nav.
              Redirect /chat to explorer so the URL never breaks. */}
          <Route path="/chat" element={<Navigate to="/explorer" replace />} />

          <Route path="/search" element={<SearchPage />} />
          <Route path="/admin-explorer" element={<AdminExplorer />} />
          <Route path="/faculty-profile" element={<FacultyProfile />} />
          <Route path="/settings" element={<Settings />} />

          {/* More section */}
          <Route path="/support-us" element={<SupportUs />} />
          <Route path="/syllabus" element={<Syllabus />} />
          <Route path="/complaint" element={<RaiseComplaint />} />
          <Route path="/placements" element={<Placements />} />

          {/* Coming Soon */}
          <Route path="/clubs" element={<ComingSoon />} />
          <Route path="/facilities" element={<ComingSoon />} />
          <Route path="/transport" element={<ComingSoon />} />
          <Route path="/cafeteria" element={<ComingSoon />} />
          <Route path="/library" element={<ComingSoon />} />
          <Route path="/attendance" element={<ComingSoon />} />
          <Route path="/results" element={<ComingSoon />} />
          <Route path="/lost-found" element={<ComingSoon />} />
          <Route path="/events" element={<ComingSoon />} />
          <Route path="/notices" element={<ComingSoon />} />
          <Route path="/assignments" element={<ComingSoon />} />
          <Route path="/fees" element={<ComingSoon />} />
          <Route path="/id-card" element={<ComingSoon />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
