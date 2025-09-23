import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getAllPosts } from "../api/posts";

// Helper component to auto-fit map to markers
function FitBounds({ markers }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length > 0) {
      const bounds = markers.map((m) => [m.location.latitude, m.location.longitude]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers, map]);

  return null;
}

export default function MapFeed() {
  const [issues, setIssues] = useState([]);
  const [userLocation, setUserLocation] = useState([12.8011, 80.2245]);

  useEffect(() => {
    async function fetchIssues() {
      try {
        const data = await getAllPosts();
        console.log("🚀 Fetched posts:", data);

        if (Array.isArray(data)) {
          const parsedIssues = data
            .map((issue) => {
              let loc = { latitude: null, longitude: null };
              if (issue.location && typeof issue.location === "string") {
                const parts = issue.location.split(",");
                if (parts.length === 2) {
                  const lat = parseFloat(parts[0]);
                  const lng = parseFloat(parts[1]);
                  if (!isNaN(lat) && !isNaN(lng)) loc = { latitude: lat, longitude: lng };
                }
              }
              return { ...issue, location: loc };
            })
            .filter((issue) => issue.location.latitude !== null); // remove invalid locations

          setIssues(parsedIssues);
        }
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setIssues([]);
      }
    }

    fetchIssues();
  }, []);

  return (
    <div style={{ height: "90vh", width: "100%", maxWidth: 1200, margin: "auto", marginTop: 16 }}>
      <MapContainer center={userLocation} zoom={14} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <FitBounds markers={issues} />

        {issues.map((issue) => (
          <CircleMarker
            key={issue.id}
            center={[issue.location.latitude, issue.location.longitude]}
            radius={8}
            fillColor="red"
            color="darkred"
            weight={1}
            fillOpacity={0.8}
          >
            <Popup>
              <div style={{ maxWidth: 200 }}>
                <strong>{issue.desc}</strong>
                <br />
                {issue.img && (
                  <img
                    src={issue.img}
                    alt={issue.desc}
                    style={{ width: "100%", height: "100px", objectFit: "cover", marginTop: 4 }}
                  />
                )}
                <br />
                Reported by: {issue.User?.name || "Unknown"}
                <br />
                {issue.location.latitude.toFixed(6)}, {issue.location.longitude.toFixed(6)}
                <br />
                Created at: {new Date(issue.createdAt).toLocaleString()}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
