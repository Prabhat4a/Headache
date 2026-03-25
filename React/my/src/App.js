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
import Profile from "./pages/Profile"; // ✅ was ./components/pages/Profile
import Bus from "./pages/Bus"; // ✅ was ./components/pages/Bus
import Chat from "./pages/Chat"; // ✅ was ./components/pages/Chat
import FacultyProfile from "./pages/FacultyProfile";

const isAuthenticated = () => localStorage.getItem("token") !== null;
const ProtectedLayout = () =>
  isAuthenticated() ? <Layout /> : <Navigate to="/login" replace />;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/complete-register" element={<CompleteRegister />} />
        <Route path="/link-account" element={<LinkAccount />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/explorer" element={<Explorer />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/bus" element={<Bus />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/admin-explorer" element={<AdminExplorer />} />

          <Route path="/faculty-profile" element={<FacultyProfile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
