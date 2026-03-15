import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import CompleteRegister from "./pages/CompleteRegister";
import LinkAccount from "./pages/LinkAccount";
import Layout from "./components/Layout";
import Explorer from "./components/Explorer";
import Profile from "./pages/Profile";

// ADD THIS — paste in browser console to see which is broken
console.log("Home:", Home);
console.log("Login:", Login);
console.log("Register:", Register);
console.log("ForgotPassword:", ForgotPassword);
console.log("CompleteRegister:", CompleteRegister);
console.log("LinkAccount:", LinkAccount);
console.log("Layout:", Layout);
console.log("Explorer:", Explorer);
console.log("Profile:", Profile);

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
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
