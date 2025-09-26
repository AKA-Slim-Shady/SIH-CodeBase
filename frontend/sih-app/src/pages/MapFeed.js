import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getAllPosts, likePost, unlikePost } from "../api/posts";
// 'getStatus' is no longer needed and has been removed.
import { io as ioClient } from "socket.io-client";
import CommentsSection from "../components/CommentsSection"; 

const socket = ioClient("http://localhost:5000");

const STATUS_COLORS = {
  'Pending': '#808080', // Added a default color for Pending
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
    if (!user) {
      setIssues([]);
      return;
    }

    const fetchIssues = async () => {
      try {
        // This is now the ONLY API call. The 'data' array includes the status for each post.
        const data = await getAllPosts();
        if (Array.isArray(data)) {
          // The old loop for getStatus is gone. We just process the location.
          const processedIssues = data.map(post => {
            let loc = { latitude: null, longitude: null };
            if (post.location && typeof post.location === "string") {
              const [a, b] = post.location.split(",").map(s => s && s.trim());
              const lat = parseFloat(a);
              const lng = parseFloat(b);
              if (!isNaN(lat) && !isNaN(lng)) loc = { latitude: lat, longitude: lng };
            }

            if (loc.latitude == null || loc.longitude == null) return null;
            
            // The post object already has a 'status' field from the backend.
            return { ...post, location: loc };
          }).filter(Boolean); // Filter out any posts that had invalid locations

          setIssues(processedIssues);
        }
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      }
    };

    fetchIssues();

    // Socket logic remains the same
    socket.on("postLiked", ({ postId, likes }) => {
      setIssues(prev => prev.map(p => p.id === postId ? { ...p, Likes: likes } : p));
    });
    socket.on("postUnliked", ({ postId, likes }) => {
      setIssues(prev => prev.map(p => p.id === postId ? { ...p, Likes: likes } : p));
    });

    return () => {
      socket.off("postLiked");
      socket.off("postUnliked");
    };
  }, [user?.id]); 

  const handleLike = async (issue) => {
    if (!user) return;
    try {
      const isLiked = (issue.Likes || []).some(u => u.id === user.id);
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
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer center={userLocation} zoom={14} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitBounds markers={issues} />
        {issues.map(issue => {
          const isLiked = (issue.Likes || []).some(u => u.id === user.id);
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
                  <br/>Likes: {(issue.Likes || []).length}
                  <br/>
                  {user && (
                    <>
                      <button 
                        onClick={() => handleLike(issue)} 
                        style={{ background: isLiked ? '#FF4C4C' : '#ccc', color: '#fff', padding: '6px 10px', border: 'none', borderRadius: 6, marginTop: '5px' }}>
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
