import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getAllPosts } from "../api/posts";

export default function MapFeed() {
  const [issues, setIssues] = useState([]);
  const [userLocation, setUserLocation] = useState([12.8011, 80.2245]); // default fallback

  useEffect(() => {
    // Fetch issues from backend
    async function fetchIssues() {
      try {
        const data = await getAllPosts();
        setIssues(data);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      }
    }
    fetchIssues();

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        () => console.warn("Location access denied, using default center")
      );
    }
  }, []);

  return (
    <div style={{ height: "90vh", width: "100%", maxWidth: 1200, margin: "auto", marginTop: 16 }}>
      <MapContainer center={userLocation} zoom={14} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {issues.map((issue) => (
          <CircleMarker
            key={issue._id}
            center={[issue.location.latitude, issue.location.longitude]}
            radius={8}
            fillColor="red"
            color="darkred"
            weight={1}
            fillOpacity={0.8}
          >
            <Popup>
              <strong>{issue.description}</strong>
              <br />
              {issue.location.latitude.toFixed(4)}, {issue.location.longitude.toFixed(4)}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
