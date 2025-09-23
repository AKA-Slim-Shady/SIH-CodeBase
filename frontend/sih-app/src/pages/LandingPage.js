import React from "react";
import { Link } from "react-router-dom";
import { colors, typography, spacing } from "../theme/theme";

export default function LandingPage() {
  return (
    <div style={{ fontFamily: typography.font, textAlign: "center", background: colors.background, minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <h1 style={{ fontSize: "3rem", color: colors.primary, marginBottom: spacing.l }}>CivicWatch</h1>
      <p style={{ fontSize: typography.subtitle, marginBottom: spacing.l }}>Empowering citizens to report civic issues in real-time</p>
      <div style={{ display: "flex", gap: spacing.m }}>
        <Link to="/signin" style={{ padding: spacing.m, background: colors.primary, color: "#fff", borderRadius: 8, textDecoration: "none", fontWeight: 600 }}>Sign In</Link>
        <Link to="/signup" style={{ padding: spacing.m, background: colors.secondary, color: "#fff", borderRadius: 8, textDecoration: "none", fontWeight: 600 }}>Sign Up</Link>
      </div>
    </div>
  );
}
