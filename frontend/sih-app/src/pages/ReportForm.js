import React, { useState, useEffect } from "react";
import { colors, spacing, typography } from "../theme/theme";

export default function ReportForm() {
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [location, setLocation] = useState(null);

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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("description", description);
      if (location) formData.append("location", JSON.stringify(location));
      if (file) formData.append("image", file);

      const res = await fetch("http://<YOUR_BACKEND_URL>/api/posts", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("Report submitted!");
        setDescription("");
        setFile(null);
        setPreview(null);
      } else {
        alert("Failed to submit report");
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
      <h2 style={{ fontFamily: typography.font, fontSize: typography.title, marginBottom: spacing.m }}>
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
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {preview && (
        <img
          src={preview}
          alt="preview"
          style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 8, marginTop: spacing.s }}
        />
      )}
      <button
        onClick={handleSubmit}
        style={{
          backgroundColor: colors.primary,
          color: "#fff",
          border: "none",
          padding: spacing.m,
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: 600,
          marginTop: spacing.m,
        }}
      >
        Submit Report
      </button>
    </div>
  );
}
