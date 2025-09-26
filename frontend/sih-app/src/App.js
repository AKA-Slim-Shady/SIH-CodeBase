import React, { useEffect, useState, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import './App.css'
// --- New Component Imports ---
import TopBar from "./components/TopBar";
import BottomNav from "./components/BottomNav";

const MapFeed = lazy(() => import("./pages/MapFeed"));
const ReportForm = lazy(() => import("./pages/ReportForm"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const UserPage = lazy(() => import("./pages/UserPage"));
const FeedbackForm = lazy(() => import("./pages/FeedbackForm"));

const PageLoader = () => <div className="page-loader">Loading...</div>;

export default function App() {
  const [user, setUser] = useState(null);

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
    if (userData && userData.token) {
        localStorage.setItem("token", userData.token);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <Router>
      {/* --- This is the new mobile-first layout structure --- */}
      <div className="app-container">
        <TopBar user={user} onLogout={handleLogout} />

        <main className="main-content">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* If user is not logged in, show signin/signup, otherwise show map */}
              <Route path="/" element={!user ? <SignIn onLogin={handleLogin} /> : <MapFeed user={user} />} />
              <Route path="/report" element={user ? <ReportForm /> : <Navigate to="/" />} />
              <Route path="/signin" element={!user ? <SignIn onLogin={handleLogin} /> : <Navigate to="/" />} />
              <Route path="/signup" element={!user ? <SignUp onLogin={handleLogin} /> : <Navigate to="/" />} />
              <Route path="/user" element={user ? <UserPage /> : <Navigate to="/" />} />
              <Route
                path="/dashboard"
                element={user?.isAdmin ? <Dashboard /> : <Navigate to="/" />}
              />
              <Route 
                path="/feedback/:postId" 
                element={user ? <FeedbackForm /> : <Navigate to="/" />} 
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </main>
        
        {/* The bottom navigation only shows when a user is logged in */}
        {user && <BottomNav user={user} />}
      </div>
    </Router>
  );
}