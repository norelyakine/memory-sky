import React from "react";
import { useTags } from "../context/TagContext";

export default function ConstellationToggle() {
  const { showConstellations, setShowConstellations } = useTags();

  return (
    <button
      onClick={() => setShowConstellations(!showConstellations)}
      style={{
        position: "fixed",
        bottom: "100px", // adjust so it doesn’t overlap AddStarForm FAB
        right: "20px",
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        border: "none",
        background: showConstellations
          ? "linear-gradient(135deg, #ffd700, #facc15)"
          : "rgba(255,255,255,0.15)",
        color: "white",
        fontSize: "1.5rem",
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        zIndex: 1500,
        transition: "transform 0.2s ease, background 0.3s ease"
      }}
      title="Toggle Constellations"
    >
      ✨
    </button>
  );
}
