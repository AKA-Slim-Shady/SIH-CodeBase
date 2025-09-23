import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import IssueCard from "../components/IssueCard";

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://<YOUR_BACKEND_URL>/api/posts")
      .then((res) => res.json())
      .then(setReports)
      .catch(() =>
        setReports([
          { _id: "1", description: "Pothole", location: { latitude: 12.8011, longitude: 80.2245 } },
          { _id: "2", description: "Garbage Overflow", location: { latitude: 12.805, longitude: 80.22 } },
        ])
      );
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 32 }}>
      <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.8rem", marginBottom: 24 }}>
        Reported Issues
      </h2>
      {reports.map((item) => (
        <IssueCard
          key={item._id}
          issue={item}
          onClick={() => navigate("/map", { state: { location: item.location, description: item.description } })}
        />
      ))}
    </div>
  );
}
