import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapScreen() {
  const [issues, setIssues] = useState([]);

  // Fetch posts from backend
  useEffect(() => {
    async function fetchIssues() {
      try {
        const res = await fetch("http://<YOUR_BACKEND_URL>/api/posts");
        if (!res.ok) throw new Error("Failed to fetch posts");
        const data = await res.json();
        setIssues(data);
      } catch (err) {
        console.error("Error fetching issues, using placeholder:", err);
        setIssues([
          { id: "1", description: "Pothole", loc: "Kelambakkam", lat: 12.8011, lng: 80.2245 },
          { id: "2", description: "Garbage Overflow", loc: "Kelambakkam", lat: 12.805, lng: 80.22 },
        ]);
      }
    }

    fetchIssues();
  }, []);

  // Center map
  const defaultCenter = [12.8011, 80.2245];

  return (
    <div style={{ height: "80vh", width: "100%", maxWidth: "1000px", margin: "auto", marginTop: "32px" }}>
      <MapContainer center={defaultCenter} zoom={14} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {issues.map((issue) => (
          <CircleMarker
            key={issue.id}
            center={[issue.lat, issue.lng]}
            radius={8}          // size of the circle
            fillColor="red"     // red color
            color="darkred"     // border color
            weight={1}          // border width
            fillOpacity={0.8}   // opacity
          >
            <Popup>
              <strong>{issue.description}</strong>
              <br />
              📍 {issue.loc}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
