import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getAllPosts, likePost, unlikePost } from "../api/posts";
import { getStatus } from "../api/status"; 
import { io as ioClient } from "socket.io-client";
import CommentsSection from "../components/CommentsSection"; 

const socket = ioClient("http://localhost:5000");

// Define colors for each status
const STATUS_COLORS = {
  'Issue identified': '#FFD700', // Yellow
  'Issue being worked on': '#4169E1', // Blue
  'Issue resolved': '#32CD32', // Green
};

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

    const fetchIssues = async () => {
      try {
        const data = await getAllPosts();
        if (Array.isArray(data)) {
          const processedIssues = [];
          for (const post of data) {
            let loc = { latitude: null, longitude: null };
            // Ensure location data is a string before attempting to parse
            if (post.location && typeof post.location === "string") {
              const [a, b] = post.location.split(",").map(s => s && s.trim());
              const lat = parseFloat(a);
              const lng = parseFloat(b);
              if (!isNaN(lat) && !isNaN(lng)) loc = { latitude: lat, longitude: lng };
            }

            // Skip posts with invalid location data to prevent errors
            if (loc.latitude == null || loc.longitude == null) {
              continue;
            }

            const likes = Array.isArray(post.Likes) ? post.Likes : [];
            let status = 'Pending';
            try {
              const statusData = await getStatus(post.id);
              status = statusData.status;
            } catch (err) {
              console.error(`Failed to fetch status for post ${post.id}:`, err);
            }
            
            processedIssues.push({ ...post, location: loc, likes, status });
          }
          setIssues(processedIssues);
        }
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      }
    };

    fetchIssues();

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
      const isLiked = (issue.likes || []).some(u => u.id === userId);
      if (isLiked) {
        await unlikePost(issue.id);
      } else {
        await likePost(issue.id);
      }
    } catch (err) {
      console.error("Error liking/unliking:", err);
    }
  };

  return (
    <div style={{ height: "90vh", width: "100%", maxWidth: 1200, margin: "auto", marginTop: 16 }}>
      <MapContainer center={userLocation} zoom={14} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitBounds markers={issues} />
        {issues.map(issue => {
          const isLiked = (issue.likes || []).some(u => u.id === userId);
          return (
            <CircleMarker key={issue.id}
              center={[issue.location.latitude, issue.location.longitude]}
              radius={8}
              fillColor={STATUS_COLORS[issue.status] || 'gray'} // Use status for color
              color="darkred" weight={1} fillOpacity={0.9}>
              <Popup>
                <div style={{ maxWidth: 260 }}>
                  <strong>{issue.desc}</strong><br/>
                  {issue.img && <img src={issue.img} style={{ width: "100%", height: 100, objectFit: "cover" }} />}
                  <br/>Reported by: {issue.User?.name || 'Unknown'}
                  <br/>Status: <strong>{issue.status || 'Pending'}</strong>
                  <br/>{issue.location.latitude.toFixed(6)}, {issue.location.longitude.toFixed(6)}
                  <br/>Likes: {(issue.likes || []).length}
                  <br/>
                  <button 
                    onClick={() => handleLike(issue)} 
                    style={{ background: isLiked ? 'red' : '#ccc', color: '#fff', padding: '6px 10px', border: 'none', borderRadius: 6 }}>
                    {isLiked ? 'Unlike' : 'Like'}
                  </button>

                  {/* Comments Section */}
                  <CommentsSection postId={issue.id} userId={userId} />
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}