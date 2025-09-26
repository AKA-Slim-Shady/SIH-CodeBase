import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";

export default function SignUp({ onLogin }) { // Pass onLogin to SignUp as well
  const navigate = useNavigate();
  const [type, setType] = useState("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [location, setLocation] = useState("");

  const LOCATIONS = [
    { name: "Chennai", lat: 13.0827, lng: 80.2707 },
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
      onLogin(res); // Use onLogin for consistent state management
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || err.message || "Sign-Up failed");
    }
  };

  return (
    <div className="form-card">
      <h2>Sign Up</h2>

      {/* Toggle button styles are better handled in CSS, but this is fine for now */}
      <div style={{ display: "flex", marginBottom: "16px", gap: '8px' }}>
        <button
          onClick={() => setType("user")}
          style={{ flex: 1, background: type === 'user' ? '#1DA1F2' : '#eee', color: 'white', border: 'none', padding: '12px', borderRadius: '8px' }}
        >
          User
        </button>
        <button
          onClick={() => setType("government")}
          style={{ flex: 1, background: type === 'government' ? '#1DA1F2' : '#eee', color: 'white', border: 'none', padding: '12px', borderRadius: '8px' }}
        >
          Government
        </button>
      </div>

      <input
        placeholder={type === "user" ? "Name" : "Official Name"}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {type === "government" && (
        <>
          <input
            placeholder="Department / Body Name"
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
          />
          <select value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="">Select Location</option>
            {LOCATIONS.map((l) => (
              <option key={l.name} value={l.name}>{l.name}</option>
            ))}
          </select>
        </>
      )}

      <button onClick={handleSubmit}>Sign Up</button>
    </div>
  );
}