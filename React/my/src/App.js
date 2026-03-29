import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AdminExplorer from "./components/Admin-explorer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import CompleteRegister from "./pages/CompleteRegister";
import LinkAccount from "./pages/LinkAccount";
import Layout from "./components/Layout";
import Explorer from "./components/Explorer";
import Profile from "./pages/Profile";
import Bus from "./pages/Bus";
import Chat from "./pages/Chat";
import FacultyProfile from "./pages/FacultyProfile";
import Settings from "./pages/Settings";

// ── Built pages ──
import SupportUs from "./pages/SupportUs";
import Syllabus from "./pages/Syllabus";
import RaiseComplaint from "./pages/RaiseComplaint";
import Placements from "./pages/Placements";

// ── Coming Soon ──
import ComingSoon from "./pages/ComingSoon";

const isAuthenticated = () => localStorage.getItem("token") !== null;
const ProtectedLayout = () =>
  isAuthenticated() ? <Layout /> : <Navigate to="/login" replace />;

function App() {
  return (
    <Router>
      <Routes>
        {/* ── Public routes ── */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/complete-register" element={<CompleteRegister />} />
        <Route path="/link-account" element={<LinkAccount />} />

        {/* ── Protected routes ── */}
        <Route element={<ProtectedLayout />}>
          <Route path="/explorer" element={<Explorer />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/bus" element={<Bus />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/admin-explorer" element={<AdminExplorer />} />
          <Route path="/faculty-profile" element={<FacultyProfile />} />
          <Route path="/settings" element={<Settings />} />

          {/* ── More section — built pages ── */}
          <Route path="/support-us" element={<SupportUs />} />
          <Route path="/syllabus" element={<Syllabus />} />
          <Route path="/complaint" element={<RaiseComplaint />} />
          <Route path="/placements" element={<Placements />} />

          {/* ── More section — Coming Soon pages ── */}
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
      </Routes>
    </Router>
  );
}

export default App;
