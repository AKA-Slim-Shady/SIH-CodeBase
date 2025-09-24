import React from "react";
import { Link } from "react-router-dom";
import { colors, spacing, typography } from "../theme/theme";

export default function NavBar({ user, onLogout }) {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: spacing.m,
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <h1 style={{ color: colors.primary, fontFamily: typography.font }}>CivicWatch</h1>
      <nav style={{ display: "flex", gap: spacing.m }}>
        {!user && (
          <>
            <Link
              to="/signin"
              style={{ textDecoration: "none", color: colors.primary, fontWeight: 600 }}
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              style={{ textDecoration: "none", color: colors.secondary, fontWeight: 600 }}
            >
              Sign Up
            </Link>
          </>
        )}
        {user && (
          <>
            <Link
              to="/report"
              style={{ textDecoration: "none", color: colors.primary, fontWeight: 600 }}
            >
              Report
            </Link>
            <Link
              to="/user"
              style={{ textDecoration: "none", color: colors.primary, fontWeight: 600 }}
            >
              User
            </Link>

            {/* Render Admin Dashboard link only if user is admin */}
            {user.isAdmin && (
              <Link
              to="/dashboard"   // 👈 change this to the route where Dashboard.js is mounted
              style={{ textDecoration: "none", color: colors.primary, fontWeight: 600 }}
              >
                Admin Dashboard
              </Link>
            )}
            
            <button
              onClick={onLogout}
              style={{
                background: "none",
                border: "none",
                color: colors.secondary,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
