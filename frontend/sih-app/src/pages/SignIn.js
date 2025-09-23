import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { colors, typography, spacing } from "../theme/theme";
import { loginUser } from "../api/users"; // you need to implement loginUser POST API

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await loginUser({ email, password }); 
      if(res.success){
        navigate("/dashboard");
      } else {
        alert(res.message);
      }
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: spacing.l, background: colors.cardBg, borderRadius: 12, marginTop: spacing.l }}>
      <h2 style={{ fontSize: typography.title, color: colors.primary, marginBottom: spacing.m }}>Sign In</h2>
      <input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} style={{ width: "100%", padding: spacing.m, marginBottom: spacing.m, borderRadius: 8, border: `1px solid ${colors.border}` }} />
      <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} style={{ width: "100%", padding: spacing.m, marginBottom: spacing.m, borderRadius: 8, border: `1px solid ${colors.border}` }} />
      <button onClick={handleSubmit} style={{ width: "100%", padding: spacing.m, background: colors.primary, color: "#fff", border: "none", borderRadius: 8, fontWeight: 600 }}>Sign In</button>
    </div>
  );
}
