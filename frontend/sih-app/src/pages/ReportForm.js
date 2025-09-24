import React, { useState, useEffect, useRef } from "react";
import { colors, spacing, typography } from "../theme/theme";

export default function ReportForm() {
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [location, setLocation] = useState(null);
  const [message, setMessage] = useState({ text: "", isError: false });
  const [isUploading, setIsUploading] = useState(false);

  const cloudinaryCloudName = "dlcimnrkc";
  const cloudinaryUploadPreset = "sih-app";

  // --- ADDED DEBUGGING LOGS ---
  console.log("Cloudinary Cloud Name:", cloudinaryCloudName);
  console.log("Cloudinary Upload Preset:", cloudinaryUploadPreset);
  // --- END OF DEBUGGING LOGS ---

  const initialLocation = useRef(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLoc = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
          setLocation(newLoc);
          initialLocation.current = newLoc;
        },
        (err) => {
          setMessage({ text: "Location access denied. Please enable it to use this feature.", isError: true });
          console.error(err);
        }
      );
    } else {
      setMessage({ text: "Geolocation is not supported by this browser.", isError: true });
    }
  }, []);

  const randomizeLocation = () => {
    if (!initialLocation.current) {
      setMessage({ text: "Please allow location access first.", isError: true });
      return;
    }

    const randomOffset = () => (Math.random() - 0.5) / 1000;
    setLocation((prev) => ({
      latitude: initialLocation.current.latitude + randomOffset(),
      longitude: initialLocation.current.longitude + randomOffset(),
    }));
  };

  const uploadToCloudinary = async () => {
    if (!file || !cloudinaryCloudName || !cloudinaryUploadPreset) {
      setMessage({ text: "Cloudinary configuration is missing. Please check your .env file.", isError: true });
      return null;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cloudinaryUploadPreset);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      setIsUploading(false);
      return data.secure_url;
    } catch (err) {
      setIsUploading(false);
      console.error("Cloudinary upload error:", err);
      setMessage({ text: "Failed to upload image. Please try again.", isError: true });
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!description || !file) {
      setMessage({ text: "Description and an image file are required!", isError: true });
      return;
    }

    const imageUrl = await uploadToCloudinary();
    if (!imageUrl) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage({ text: "You must be logged in to submit a report.", isError: true });
        return;
      }

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
        setMessage({ text: "Report submitted successfully!", isError: false });
        setDescription("");
        setFile(null);
        document.getElementById("fileInput").value = null;
      } else {
        const errData = await res.json();
        setMessage({ text: errData.message || "Failed to submit report", isError: true });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Error submitting report", isError: true });
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

      {message.text && (
        <div style={{ padding: spacing.s, marginBottom: spacing.m, borderRadius: 8, backgroundColor: message.isError ? '#fee2e2' : '#dcfce7', color: message.isError ? '#dc2626' : '#16a34a' }}>
          {message.text}
        </div>
      )}

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
        type="file"
        accept="image/*"
        id="fileInput"
        onChange={(e) => setFile(e.target.files[0])}
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
          disabled={isUploading}
          style={{
            flex: 1,
            backgroundColor: isUploading ? '#ccc' : colors.primary,
            color: "#fff",
            border: "none",
            padding: spacing.m,
            borderRadius: 8,
            cursor: isUploading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
          }}
        >
          {isUploading ? 'Uploading...' : 'Submit Report'}
        </button>

        <button
          onClick={randomizeLocation}
          disabled={isUploading}
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
