// src/components/TagSidebar.js

import React, { useState } from "react";
import { useTags } from "../context/TagContext";

export default function TagSideBar() {
  const { tagOptions, filterTags, setFilterTags } = useTags();
  const tags = Object.keys(tagOptions);
  const [isOpen, setIsOpen] = useState(false);

  const SIDEBAR_WIDTH = 180;

  const handleStyle = {
    position: "fixed",
    top: "50%",
    left: 0,
    transform: "translateY(-50%)",
    width: 30,
    height: 50,
    background: "rgba(0,0,0,0.6)",
    color: "white",
    border: "none",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    cursor: "pointer",
    zIndex: 1001,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    userSelect: "none"
  };

  const sidebarStyle = {
    position: "fixed",
    top: 0,
    left: isOpen ? 0 : -SIDEBAR_WIDTH,
    width: SIDEBAR_WIDTH,
    height: "100%",
    padding: "1rem 0.5rem",
    background: "rgba(0,0,0,0.85)",
    boxSizing: "border-box",
    transition: "left 0.3s ease-in-out",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem"
  };

  function toggleTag(tag) {
    if (filterTags.includes(tag)) {
      setFilterTags(filterTags.filter(t => t !== tag));
    } else {
      setFilterTags([...filterTags, tag]);
    }
  }

  return (
    <>
      <button
        style={handleStyle}
        onClick={() => setIsOpen(o => !o)}
        aria-label={isOpen ? "Close tags" : "Open tags"}
      >
        {isOpen ? "‹" : "›"}
      </button>

      <div style={sidebarStyle}>
        {tags.map(tag => {
          const isActive = filterTags.includes(tag);
          const { color, gradient } = tagOptions[tag];
          const bg = isActive
            ? gradient
              ? `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`
              : color
            : "rgba(255,255,255,0.1)";
          const fg = isActive ? "#222" : "white";
          const border = isActive
            ? "2px solid #ffd700"
            : "1px solid rgba(255,255,255,0.3)";

          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              style={{
                padding: "0.4rem 0.6rem",
                borderRadius: 20,
                background: bg,
                color: fg,
                border,
                cursor: "pointer",
                textAlign: "left",
                whiteSpace: "nowrap"
              }}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </>
  );
}
