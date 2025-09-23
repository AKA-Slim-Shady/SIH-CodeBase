import React, { useState, useEffect } from "react";
import { colors, spacing, typography } from "../theme/theme";

export default function ReportForm() {
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [location, setLocation] = useState(null);

  // Get initial geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }),
        () => alert("Location access denied.")
      );
    }
  }, []);

  // Generate a random nearby location
  const randomizeLocation = () => {
    if (!location) return;

    const randomOffset = () => (Math.random() - 0.5) / 100; // ~±0.005 degrees (~500m)
    setLocation((prev) => ({
      latitude: prev.latitude + randomOffset(),
      longitude: prev.longitude + randomOffset(),
    }));
  };

  const handleSubmit = async () => {
    if (!description || !imageUrl) {
      return alert("Description and image URL are required!");
    }

    try {
      const token = localStorage.getItem("token");

      let locationString = null;
      if (location) {
        locationString = `${location.latitude},${location.longitude}`;
      }

      const res = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          desc: description,
          img: imageUrl,
          location: locationString,
        }),
      });

      if (res.ok) {
        alert("Report submitted!");
        setDescription("");
        setImageUrl("");
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to submit report");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting report");
    }
  };

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "auto",
        padding: spacing.l,
        background: colors.cardBg,
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <h2
        style={{
          fontFamily: typography.font,
          fontSize: typography.title,
          marginBottom: spacing.m,
        }}
      >
        Report an Issue
      </h2>

      <textarea
        style={{
          width: "100%",
          minHeight: 120,
          padding: spacing.m,
          marginBottom: spacing.m,
          borderRadius: 8,
          border: `1px solid ${colors.border}`,
          fontFamily: typography.font,
        }}
        placeholder="Describe the issue..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        type="text"
        placeholder="Image URL"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        style={{
          width: "100%",
          padding: spacing.m,
          marginBottom: spacing.m,
          borderRadius: 8,
          border: `1px solid ${colors.border}`,
        }}
      />

      <div style={{ display: "flex", gap: 8, marginTop: spacing.m }}>
        <button
          onClick={handleSubmit}
          style={{
            flex: 1,
            backgroundColor: colors.primary,
            color: "#fff",
            border: "none",
            padding: spacing.m,
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Submit Report
        </button>

        <button
          onClick={randomizeLocation}
          style={{
            flex: 1,
            backgroundColor: "#666",
            color: "#fff",
            border: "none",
            padding: spacing.m,
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Randomize Location
        </button>
      </div>

      {location && (
        <p style={{ marginTop: spacing.m, fontSize: 14, color: "#333" }}>
          Current location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
        </p>
      )}
    </div>
  );
}
