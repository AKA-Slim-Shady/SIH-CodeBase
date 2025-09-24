import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getAllPosts, likePost, unlikePost } from "../api/posts";
import { getStatus } from "../api/status"; 
import { io as ioClient } from "socket.io-client";
import CommentsSection from "../components/CommentsSection"; 

const socket = ioClient("http://localhost:5000");

const STATUS_COLORS = {
  'Issue identified': '#FFD700',
  'Issue being worked on': '#4169E1',
  'Issue resolved': '#32CD32',
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

export default function MapFeed({ user: userProp }) {
  const [issues, setIssues] = useState([]);
  const [userLocation] = useState([12.8011, 80.2245]);

  // THE FIX: Determine the user for the current render.
  // We prioritize the 'user' prop from App.js, but fall back to localStorage
  // to handle the race condition right after login.
  let user = userProp;
  if (!user) {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
          try {
              user = JSON.parse(savedUser);
          } catch (e) {
              console.error("Error parsing user from localStorage", e);
          }
      }
  }

  useEffect(() => {
    // If there's no user from either props or localStorage, do nothing.
    if (!user) {
      setIssues([]);
      return;
    }

    const fetchIssues = async () => {
      try {
        const data = await getAllPosts();
        if (Array.isArray(data)) {
          const processedIssues = [];
          for (const post of data) {
            let loc = { latitude: null, longitude: null };
            if (post.location && typeof post.location === "string") {
              const [a, b] = post.location.split(",").map(s => s && s.trim());
              const lat = parseFloat(a);
              const lng = parseFloat(b);
              if (!isNaN(lat) && !isNaN(lng)) loc = { latitude: lat, longitude: lng };
            }

            if (loc.latitude == null || loc.longitude == null) continue;

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
    // THE FIX: Depend on user.id. This ensures the effect only re-runs when the
    // actual user changes, not just on object reference changes from JSON.parse.
  }, [user?.id]); 

  const handleLike = async (issue) => {
    if (!user) {
      alert("Please sign in to like posts.");
      return;
    }
    try {
      const isLiked = (issue.likes || []).some(u => u.id === user.id);
      if (isLiked) {
        await unlikePost(issue.id);
      } else {
        await likePost(issue.id);
      }
    } catch (err) {
      console.error("Error liking/unliking:", err);
    }
  };
  
  if (!user) {
    return (
        <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
            <h2>Welcome to CivicWatch</h2>
            <p>Please sign in to view and report local issues.</p>
        </div>
    );
  }

  return (
    <div style={{ height: "90vh", width: "100%", maxWidth: 1200, margin: "auto", marginTop: 16 }}>
      <MapContainer center={userLocation} zoom={14} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitBounds markers={issues} />
        {issues.map(issue => {
          const isLiked = (issue.likes || []).some(u => u.id === user.id);
          return (
            <CircleMarker key={issue.id}
              center={[issue.location.latitude, issue.location.longitude]}
              radius={8}
              fillColor={STATUS_COLORS[issue.status] || 'gray'}
              color="darkred" weight={1} fillOpacity={0.9}>
              <Popup>
                <div style={{ maxWidth: 260 }}>
                  <strong>{issue.desc}</strong><br/>
                  {issue.img && <img src={issue.img} alt="issue" style={{ width: "100%", height: 100, objectFit: "cover" }} />}
                  <br/>Reported by: {issue.User?.name || 'Unknown'}
                  <br/>Status: <strong>{issue.status || 'Pending'}</strong>
                  <br/>{issue.location.latitude.toFixed(6)}, {issue.location.longitude.toFixed(6)}
                  <br/>Likes: {(issue.likes || []).length}
                  <br/>
                  {user && (
                    <>
                      <button 
                        onClick={() => handleLike(issue)} 
                        style={{ background: isLiked ? 'red' : '#ccc', color: '#fff', padding: '6px 10px', border: 'none', borderRadius: 6, marginTop: '5px' }}>
                        {isLiked ? 'Unlike' : 'Like'}
                      </button>
                      <CommentsSection postId={issue.id} userId={user.id} />
                    </>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

