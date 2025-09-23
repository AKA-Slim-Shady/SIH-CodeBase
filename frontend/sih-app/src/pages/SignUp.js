import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { colors, typography, spacing } from "../theme/theme";
import { registerUser } from "../api/auth"; // ✅ correct import

export default function SignUp() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await registerUser({ name, email, password });

      // ✅ save token in localStorage
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res));

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.message || "Sign-Up failed");
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "auto",
        padding: spacing.l,
        background: colors.cardBg,
        borderRadius: 12,
        marginTop: spacing.l,
      }}
    >
      <h2
        style={{
          fontSize: typography.title,
          color: colors.primary,
          marginBottom: spacing.m,
        }}
      >
        Sign Up
      </h2>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{
          width: "100%",
          padding: spacing.m,
          marginBottom: spacing.m,
          borderRadius: 8,
          border: `1px solid ${colors.border}`,
        }}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: "100%",
          padding: spacing.m,
          marginBottom: spacing.m,
          borderRadius: 8,
          border: `1px solid ${colors.border}`,
        }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: "100%",
          padding: spacing.m,
          marginBottom: spacing.m,
          borderRadius: 8,
          border: `1px solid ${colors.border}`,
        }}
      />
      <button
        onClick={handleSubmit}
        style={{
          width: "100%",
          padding: spacing.m,
          background: colors.secondary,
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontWeight: 600,
        }}
      >
        Sign Up
      </button>
    </div>
  );
}
