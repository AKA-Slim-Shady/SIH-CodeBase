import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MapFeed from "./pages/MapFeed";
import ReportForm from "./pages/ReportForm";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import NavBar from "./components/NavBar";
import UserPage from "./pages/UserPage";
import FeedbackForm from "./pages/FeedbackForm";

export default function App() {
  const [user, setUser] = useState(null);
  console.log("ENV : " , process.env.REACT_APP_VAR);
  useEffect(() => {
    try {
        const saved = localStorage.getItem("user");
        if (saved) {
            setUser(JSON.parse(saved));
        }
    } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem("user");
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    // --- 👇 THE FIX: Explicitly save the token to localStorage ---
    if (userData && userData.token) {
        localStorage.setItem("token", userData.token);
    }
    // --- 👆 END FIX ---
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    // --- 👇 THE FIX: Also remove the token on logout ---
    localStorage.removeItem("token");
    // --- 👆 END FIX ---
  };

  return (
    <Router>
      <NavBar user={user} onLogout={handleLogout} />
      <main style={{ paddingTop: 16 }}>
        <Routes>
          <Route path="/" element={<MapFeed user={user} />} />
          <Route path="/report" element={user ? <ReportForm /> : <Navigate to="/signin" />} />
          <Route path="/signin" element={<SignIn onLogin={handleLogin} />} />
          <Route path="/signup" element={<SignUp onLogin={handleLogin} />} />
          <Route path="/user" element={user ? <UserPage /> : <Navigate to="/signin" />} />
          <Route
            path="/dashboard"
            element={user?.isAdmin ? <Dashboard /> : <Navigate to="/signin" />}
          />
          <Route 
            path="/feedback/:postId" 
            element={user ? <FeedbackForm /> : <Navigate to="/signin" />} 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </Router>
  );
}

