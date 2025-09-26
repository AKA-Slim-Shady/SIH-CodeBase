import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateStatus } from "../api/status";
// The main posts API is now fetched directly, so we don't need getStatus
import { getAllPosts } from "../api/posts"; 


function IssueCard({ issue, onStatusChange, onClick }) {
    return (
      <div className="user-post-card">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, cursor: "pointer" }} onClick={onClick}>
          <div>
            <strong>{issue.desc}</strong>
            <div style={{ fontSize: 13, color: "#555" }}>
              Reported by: {issue.User?.name || "Unknown"}
            </div>
            {/* The status now comes directly from the 'issue' object */}
            <div className="status-display" style={{marginTop: '8px'}}><strong>Status:</strong> {issue.status || 'Pending'}</div>
          </div>
          <div style={{ textAlign: "right", minWidth: 90 }}>
            <div style={{ fontSize: 14 }}>❤ {issue.likesCount ?? (issue.Likes?.length ?? 0)}</div>
          </div>
        </div>
        <div className="button-group">
          <button onClick={() => onStatusChange(issue.id, 'Issue identified')} style={{backgroundColor: '#FFD700', color: '#000'}}>Identified</button>
          <button onClick={() => onStatusChange(issue.id, 'Issue being worked on')} style={{backgroundColor: '#4169E1'}}>Working On</button>
          <button onClick={() => onStatusChange(issue.id, 'Issue resolved')} style={{backgroundColor: '#32CD32'}}>Resolved</button>
        </div>
      </div>
    );
}
  
const LOCALITIES = {
    Kelambakkam: { lat: 12.8011, lng: 80.2245 },
    Tambaram: { lat: 12.9229, lng: 80.1275 },
    Adyar: { lat: 13.0067, lng: 80.2570 },
};
  
export default function Dashboard() {
  const [reports, setReports] = useState([]);
  // The separate 'statuses' state is no longer needed.
  const [locality, setLocality] = useState("");
  const [sort, setSort] = useState("");
  const [radiusKm, setRadiusKm] = useState(5);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchReports = async () => {
    setLoading(true);
    try {
      // We can use the same clean API call from our posts API file
      const data = await getAllPosts({ locality, sort, radiusKm });
      setReports(data);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (postId, newStatus) => {
    try {
      await updateStatus(postId, { status: newStatus });
      // For a faster UI update, we can change the status in our local state
      // without needing to re-fetch everything.
      setReports(prevReports => 
        prevReports.map(report => 
          report.id === postId ? { ...report, status: newStatus } : report
        )
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status.");
    }
  };

  useEffect(() => {
    fetchReports();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locality, sort, radiusKm]);

  return (
    <div className="page-container">
      <h2>Admin Dashboard</h2>
      <div className="dashboard-filters">
        {/* ... Filters are unchanged ... */}
      </div>

      <div>
        {loading && <p className="page-loader">Loading...</p>}
        {!loading && reports.length === 0 && <p>No reports found.</p>}
        {!loading && reports.map((r) => (
          <IssueCard
            key={r.id}
            issue={r}
            // The status is now part of the 'r' (report) object itself
            status={r.status}
            onStatusChange={handleStatusChange}
            onClick={() => navigate("/", { state: { location: r.locationParsed || r.location } })}
          />
        ))}
      </div>
    </div>
  );
}
