import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MapFeed from "./pages/MapFeed";
import ReportForm from "./pages/ReportForm";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import NavBar from "./components/NavBar";

export default function App() {
  const [user, setUser] = useState(null);

  // Optional: persist user login from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <Router>
      <NavBar user={user} onLogout={handleLogout} />
      <main style={{ paddingTop: 16 }}>
        <Routes>
          <Route path="/" element={<MapFeed />} />
          <Route path="/report" element={<ReportForm />} />
          <Route path="/signin" element={<SignIn onLogin={handleLogin} />} />
          <Route path="/signup" element={<SignUp onLogin={handleLogin} />} />
          
          {/* Admin routes */}
          <Route
            path="/dashboard"
            element={user?.isAdmin ? <Dashboard /> : <Navigate to="/signin" />}
          />
          <Route
            path="/users"
            element={user?.isAdmin ? <Users /> : <Navigate to="/signin" />}
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </Router>
  );
}
