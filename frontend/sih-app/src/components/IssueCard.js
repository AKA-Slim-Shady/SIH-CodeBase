import React from "react";
import { colors, spacing, typography } from "../theme/theme";

export default function IssueCard({ issue, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: colors.cardBg,
        borderRadius: 12,
        padding: spacing.m,
        marginBottom: spacing.m,
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      {issue.imageUrl && (
        <img
          src={issue.imageUrl}
          alt="report"
          style={{ width: "100%", borderRadius: 8, marginBottom: spacing.s }}
        />
      )}
      <p style={{ fontFamily: typography.font, fontSize: typography.body }}>
        {issue.description}
      </p>
      {issue.location && (
        <p style={{ fontFamily: typography.font, fontSize: typography.body }}>
          📍 {issue.location.latitude}, {issue.location.longitude}
        </p>
      )}
    </div>
  );
}
