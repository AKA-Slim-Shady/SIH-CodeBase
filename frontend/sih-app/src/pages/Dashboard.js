import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateStatus, getStatus } from "../api/status";

// Simple IssueCard component with status buttons
function IssueCard({ issue, status, onStatusChange, onClick }) {
  // The card's background color is now static, as the color change happens on the map
  
  return (
    <div
      style={{
        border: "1px solid #e6e6e6",
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        background: '#fff',
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, cursor: "pointer" }} onClick={onClick}>
        <div>
          <strong>{issue.desc}</strong>
          <div style={{ fontSize: 13, color: "#555" }}>
            Reported by: {issue.User?.name || "Unknown"}
          </div>
        </div>
        <div style={{ textAlign: "right", minWidth: 90 }}>
          <div style={{ fontSize: 14 }}>❤ {issue.likesCount ?? (issue.Likes?.length ?? 0)}</div>
          <div style={{ fontSize: 12, color: "#888" }}>
            {issue.locationParsed ? `${issue.locationParsed.latitude.toFixed(4)}, ${issue.locationParsed.longitude.toFixed(4)}` : "No location"}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button
          onClick={() => onStatusChange(issue.id, 'Issue identified')}
          style={{ padding: '4px 8px', fontSize: 12, backgroundColor: '#FFD700', color: '#000', border: 'none', borderRadius: 4 }}
        >
          Identified
        </button>
        <button
          onClick={() => onStatusChange(issue.id, 'Issue being worked on')}
          style={{ padding: '4px 8px', fontSize: 12, backgroundColor: '#4169E1', color: '#fff', border: 'none', borderRadius: 4 }}
        >
          Working On
        </button>
        <button
          onClick={() => onStatusChange(issue.id, 'Issue resolved')}
          style={{ padding: '4px 8px', fontSize: 12, backgroundColor: '#32CD32', color: '#fff', border: 'none', borderRadius: 4 }}
        >
          Resolved
        </button>
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
  const [statuses, setStatuses] = useState({});
  const [locality, setLocality] = useState("");
  const [sort, setSort] = useState("");
  const [radiusKm, setRadiusKm] = useState(5);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const BACKEND = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const fetchReports = async () => {
    setLoading(true);
    try {
      let url = `${BACKEND}/api/posts`;
      const params = [];
      if (locality) {
        const loc = LOCALITIES[locality];
        if (loc) {
          params.push(`lat=${loc.lat}`);
          params.push(`lng=${loc.lng}`);
          params.push(`radiusKm=${radiusKm}`);
        }
      }
      if (sort) params.push(`sort=${sort}`);
      if (params.length) url += `?${params.join("&")}`;

      const token = localStorage.getItem("token") || "";
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to fetch reports");
      }
      const data = await res.json();
      setReports(data);
      
      const statusMap = {};
      for (const report of data) {
        try {
          const statusData = await getStatus(report.id);
          statusMap[report.id] = statusData.status;
        } catch (err) {
          statusMap[report.id] = 'Pending';
        }
      }
      setStatuses(statusMap);

    } catch (err) {
      console.error("Failed to fetch reports:", err);
      setReports([]);
      setStatuses({});
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (postId, newStatus) => {
    try {
      await updateStatus(postId, { status: newStatus });
      setStatuses(prev => ({ ...prev, [postId]: newStatus }));
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
    <div style={{ maxWidth: 1000, margin: "auto", padding: 24 }}>
      <h2 style={{ marginBottom: 18 }}>Admin Dashboard — Reports</h2>

      <div style={{ display: "flex", gap: 12, marginBottom: 18, alignItems: "center" }}>
        <div>
          <label style={{ display: "block", marginBottom: 6 }}>Locality</label>
          <select value={locality} onChange={(e) => setLocality(e.target.value)}>
            <option value="">All localities</option>
            {Object.keys(LOCALITIES).map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6 }}>Radius (km)</label>
          <input type="number" min="1" value={radiusKm} onChange={(e) => setRadiusKm(Number(e.target.value || 5))} style={{ width: 80 }} />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6 }}>Sort by likes</label>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="">Newest</option>
            <option value="asc">Lowest likes first</option>
            <option value="desc">Highest likes first</option>
          </select>
        </div>

        <div style={{ marginLeft: "auto" }}>
          <button onClick={fetchReports} style={{ padding: "8px 12px" }}>Refresh</button>
        </div>
      </div>

      <div style={{ minHeight: 200 }}>
        {loading ? <p>Loading...</p> : null}
        {!loading && reports.length === 0 && <p>No reports found.</p>}

        {!loading && reports.map((r) => (
          <IssueCard
            key={r.id}
            issue={r}
            status={statuses[r.id]}
            onStatusChange={handleStatusChange}
            onClick={() => navigate("/map", { state: { location: r.locationParsed || r.location, description: r.desc, status: statuses[r.id] } })}
          />
        ))}
      </div>
    </div>
  );
}
