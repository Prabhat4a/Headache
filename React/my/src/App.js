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
import Explorer from "./components/Explorer"; // Add this import

// Simple auth check function
const isAuthenticated = () => {
  return localStorage.getItem("token") !== null; // or however you store auth state
};

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/complete-register" element={<CompleteRegister />} />

        {/* Protected route - Explorer shows after login */}
        <Route
          path="/explorer"
          element={
            <ProtectedRoute>
              <Explorer />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
