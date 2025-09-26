import React, { useState, useEffect, useRef } from "react";

export default function ReportForm() {
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [location, setLocation] = useState(null);
  const [message, setMessage] = useState({ text: "", isError: false });
  const [isUploading, setIsUploading] = useState(false);

  const cloudinaryCloudName = "dlcimnrkc";
  const cloudinaryUploadPreset = "sih-app";
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
          setMessage({ text: "Location access denied. Please enable it.", isError: true });
        }
      );
    }
  }, []);
  
  const uploadToCloudinary = async () => {
    if (!file) return null;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cloudinaryUploadPreset);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setIsUploading(false);
      return data.secure_url;
    } catch (err) {
      setIsUploading(false);
      setMessage({ text: "Failed to upload image.", isError: true });
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!description || !file) {
      setMessage({ text: "Description and an image are required!", isError: true });
      return;
    }
    const imageUrl = await uploadToCloudinary();
    if (!imageUrl) return;

    try {
      const token = localStorage.getItem("token");
      const locationString = location ? `${location.latitude},${location.longitude}` : null;

      const res = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ desc: description, img: imageUrl, location: locationString }),
      });

      if (res.ok) {
        setMessage({ text: "Report submitted successfully!", isError: false });
        setDescription("");
        setFile(null);
        if(document.getElementById("fileInput")) {
          document.getElementById("fileInput").value = null;
        }
      } else {
        const errData = await res.json();
        setMessage({ text: errData.message || "Failed to submit report", isError: true });
      }
    } catch (err) {
      setMessage({ text: "Error submitting report", isError: true });
    }
  };

  return (
    <div className="form-card">
      <h2>Report an Issue</h2>

      {message.text && (
        <div style={{ padding: '8px', marginBottom: '16px', borderRadius: 8, backgroundColor: message.isError ? '#fee2e2' : '#dcfce7', color: message.isError ? '#dc2626' : '#16a34a' }}>
          {message.text}
        </div>
      )}

      <textarea
        placeholder="Describe the issue..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ minHeight: 120 }}
      />

      <input
        type="file"
        accept="image/*"
        id="fileInput"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={handleSubmit} disabled={isUploading}>
        {isUploading ? 'Uploading...' : 'Submit Report'}
      </button>

      {location && (
        <p style={{ marginTop: '16px', fontSize: 14, color: "#555", textAlign: 'center' }}>
          Current location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
        </p>
      )}
    </div>
  );
}