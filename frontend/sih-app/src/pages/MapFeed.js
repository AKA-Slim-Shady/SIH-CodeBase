import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getAllPosts, likePost, unlikePost } from "../api/posts";
import { io } from "socket.io-client";

// --- Socket.IO client
const socket = io("http://localhost:5000"); // adjust backend URL

// Helper component to auto-fit map to markers
function FitBounds({ markers }) {
  const map = useMap();
  useEffect(() => {
    const validMarkers = markers.filter(m => m.location?.latitude != null && m.location?.longitude != null);
    if (validMarkers.length > 0) {
      const bounds = validMarkers.map(m => [m.location.latitude, m.location.longitude]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers, map]);
  return null;
}

export default function MapFeed() {
  const [issues, setIssues] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userLocation] = useState([12.8011, 80.2245]);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUserId(JSON.parse(saved).id);

    async function fetchIssues() {
      try {
        const data = await getAllPosts();
        if (Array.isArray(data)) {
          const parsedIssues = data
            .map(issue => {
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
            .filter(issue => issue.location.latitude != null && issue.location.longitude != null);

          setIssues(parsedIssues);
        }
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setIssues([]);
      }
    }

    fetchIssues();

    // --- WebSocket listeners for live likes/unlikes ---
    socket.on("postLiked", ({ postId, likes }) => {
      setIssues(prev => prev.map(p => p.id === postId ? { ...p, likes } : p));
    });

    socket.on("postUnliked", ({ postId, likes }) => {
      setIssues(prev => prev.map(p => p.id === postId ? { ...p, likes } : p));
    });

    return () => {
      socket.off("postLiked");
      socket.off("postUnliked");
    };
  }, []);

  const handleLike = async (issue) => {
    try {
      const isLiked = issue.likes?.some(like => like.id === userId);
      if (isLiked) {
        await unlikePost(issue.id);
      } else {
        await likePost(issue.id);
      }
      // actual state updates come from websocket events
    } catch (err) {
      console.error("Error liking/unliking post:", err);
    }
  };

  return (
    <div style={{ height: "90vh", width: "100%", maxWidth: 1200, margin: "auto", marginTop: 16 }}>
      <MapContainer center={userLocation} zoom={14} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <FitBounds markers={issues} />
        {issues.map(issue => {
          const isLiked = issue.likes?.some(like => like.id === userId);
          return (
            <CircleMarker
              key={issue.id}
              center={[issue.location.latitude, issue.location.longitude]}
              radius={8}
              fillColor={isLiked ? "red" : "gray"}
              color="darkred"
              weight={1}
              fillOpacity={0.8}
            >
              <Popup>
                <div style={{ maxWidth: 200 }}>
                  <strong>{issue.desc}</strong>
                  <br />
                  {issue.img && <img src={issue.img} alt={issue.desc} style={{ width: "100%", height: "100px", objectFit: "cover", marginTop: 4 }} />}
                  <br />
                  Reported by: {issue.User?.name || "Unknown"}
                  <br />
                  {issue.location.latitude.toFixed(6)}, {issue.location.longitude.toFixed(6)}
                  <br />
                  Created at: {new Date(issue.createdAt).toLocaleString()}
                  <br />
                  Likes: {issue.likes?.length || 0}
                  <br />
                  <button
                    style={{
                      marginTop: 4,
                      padding: "4px 8px",
                      backgroundColor: isLiked ? "red" : "#ccc",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                      transition: "background-color 0.3s",
                    }}
                    onClick={() => handleLike(issue)}
                  >
                    {isLiked ? "Unlike" : "Like"}
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
