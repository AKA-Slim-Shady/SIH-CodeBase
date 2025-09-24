import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { colors, spacing, typography } from "../theme/theme";
import { registerUser } from "../api/auth";

export default function SignUp() {
  const navigate = useNavigate();
  const [type, setType] = useState("user"); // user | government
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [location, setLocation] = useState(""); // dropdown selection

  const LOCATIONS = [
    { name: "New Delhi", lat: 28.6139, lng: 77.209 },
    { name: "Mumbai", lat: 19.076, lng: 72.877 },
    { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
  ];

  const handleSubmit = async () => {
    try {
      if (!name || !email || !password) {
        return alert("Please fill in all required fields");
      }

      const payload = { type, name, email, password };

      if (type === "government") {
        if (!departmentName) return alert("Enter department name");
        const locObj = LOCATIONS.find((l) => l.name === location);
        if (!locObj) return alert("Please select a location");

        payload.departmentName = departmentName;
        payload.location = { lat: locObj.lat, lng: locObj.lng };
      }

      const res = await registerUser(payload);
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res));
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || err.message || "Sign-Up failed");
    }
  };

  return (
    <div
      style={{
        maxWidth: 450,
        margin: "auto",
        padding: spacing.l,
        borderRadius: 12,
        background: "#fff",
        marginTop: spacing.l,
      }}
    >
      <h2 style={{ fontSize: typography.title, marginBottom: spacing.m }}>
        Sign Up
      </h2>

      {/* Toggle User / Government */}
      <div style={{ display: "flex", marginBottom: spacing.m }}>
        <button
          style={{
            flex: 1,
            padding: spacing.m,
            background: type === "user" ? colors.secondary : "#eee",
            color: type === "user" ? "#fff" : "#333",
            border: "none",
            borderRadius: 6,
            marginRight: 6,
          }}
          onClick={() => setType("user")}
        >
          User
        </button>
        <button
          style={{
            flex: 1,
            padding: spacing.m,
            background: type === "government" ? colors.secondary : "#eee",
            color: type === "government" ? "#fff" : "#333",
            border: "none",
            borderRadius: 6,
          }}
          onClick={() => setType("government")}
        >
          Government
        </button>
      </div>

      {/* Common Fields */}
      <input
        placeholder={type === "user" ? "Name" : "Official Name"}
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "100%", padding: spacing.m, marginBottom: spacing.m }}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: spacing.m, marginBottom: spacing.m }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", padding: spacing.m, marginBottom: spacing.m }}
      />

      {/* Government Fields */}
      {type === "government" && (
        <>
          <input
            placeholder="Department / Body Name"
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
            style={{ width: "100%", padding: spacing.m, marginBottom: spacing.m }}
          />
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{ width: "100%", padding: spacing.m, marginBottom: spacing.m }}
          >
            <option value="">Select Location</option>
            {LOCATIONS.map((l) => (
              <option key={l.name} value={l.name}>
                {l.name}
              </option>
            ))}
          </select>
        </>
      )}

      <button
        onClick={handleSubmit}
        style={{
          width: "100%",
          padding: spacing.m,
          background: colors.primary,
          color: "#fff",
          border: "none",
          borderRadius: 8,
        }}
      >
        Sign Up
      </button>
    </div>
  );
}
