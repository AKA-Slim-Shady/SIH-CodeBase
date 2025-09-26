import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IoMegaphone, IoPersonCircle, IoGrid } from 'react-icons/io5';

// We now accept the 'user' object as a prop
export default function BottomNav({ user }) {
  const location = useLocation();

  // If the user is an admin, show a different set of navigation links
  if (user?.isAdmin) {
    return (
      <nav className="bottom-nav">
        <Link to="/dashboard" className={`bottom-nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
          <IoGrid size={24} />
          <span>Admin Dashboard</span>
        </Link>
      </nav>
    );
  }

  // Otherwise, show the regular user links
  return (
    <nav className="bottom-nav">
      <Link to="/report" className={`bottom-nav-link ${location.pathname === '/report' ? 'active' : ''}`}>
        <IoMegaphone size={24} />
        <span>Report Issue</span>
      </Link>
      <Link to="/user" className={`bottom-nav-link ${location.pathname === '/user' ? 'active' : ''}`}>
        <IoPersonCircle size={24} />
        <span>My Page</span>
      </Link>
    </nav>
  );
}