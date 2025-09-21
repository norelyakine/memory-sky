// src/components/AddStarForm.js

import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, push, onValue } from "firebase/database";
import { useAuth } from "../context/AuthContext";

export default function AddStarForm() {
  const [text, setText] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [open, setOpen] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [tagOptions, setTagOptions] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const { user } = useAuth();

  // Load available tags (names only) from RTDB
  useEffect(() => {
    const tagRef = ref(db, "tagOptions");
    const unsub = onValue(tagRef, snap => {
      const val = snap.val() || {};
      setTagOptions(Object.keys(val));
    });
    return () => unsub();
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!user) return;
    const star = {
      text,
      isPublic,
      tags: selectedTag ? [selectedTag] : [],
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      depth: 0.6 + Math.random() * 0.4,
      createdAt: Date.now(),
      stardust: 0
    };
    await push(ref(db, `users/${user.uid}/stars`), star);
    // reset form
    setText("");
    setSelectedTag(null);
    setShowTags(false);
    setOpen(false);
  };

  return (
    <>
      {/* pop-in keyframes for tags */}
      <style>{`
        @keyframes tagPop {
          from { opacity: 0; transform: scale(0.8); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* floating “Plant Star” toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 60,
          height: 60,
          borderRadius: "50%",
          border: "none",
          background: "linear-gradient(135deg, #ffd700, #ff9d00)",
          fontSize: 24,
          cursor: "pointer",
          zIndex: 20,
          boxShadow: "0 4px 15px rgba(0,0,0,0.4)"
        }}
      >
        ⭐
      </button>

      {open && (
        <form
          onSubmit={handleSubmit}
          style={{
            position: "fixed",
            bottom: 100,
            right: 20,
            width: 300,
            padding: "2rem",
            borderRadius: 16,
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            color: "white",
            zIndex: 30
          }}
        >
          <textarea
            value={text}
            onChange={e => {
              setText(e.target.value);
              const el = e.target;
              el.style.height = "12px";
              el.style.height = Math.min(el.scrollHeight, 120) + "px";
            }}
            placeholder="Plant a memory..."
            style={{
              width: "95%",
              minHeight: 12,
              maxHeight: 120,
              padding: "0.5rem",
              border: "none",
              outline: "none",
              background: "none",
              borderRadius: 8,
              color: "white",
              resize: "none",
              overflowY: "auto",
              scrollbarWidth: "none"
            }}
          />

          {/* single-tag toggle */}
          <button
            type="button"
            onClick={() => setShowTags(t => !t)}
            style={{
              marginTop: "1rem",
              marginBottom: "0.5rem",
              padding: "0.4rem 0.8rem",
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "transparent",
              color: "white",
              cursor: "pointer",
              fontSize: "0.85rem"
            }}
          >
            {showTags ? "Hide Tag" : "✨ Tag"}
          </button>

          {showTags && (
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {tagOptions.map((tag, i) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    style={{
                      padding: "0.4rem 0.8rem",
                      borderRadius: 20,
                      border:
                        selectedTag === tag
                          ? "2px solid #ffd700"
                          : "1px solid rgba(255,255,255,0.2)",
                      background:
                        selectedTag === tag
                          ? "linear-gradient(135deg, #ffd700, #ff9d00)"
                          : "rgba(255,255,255,0.05)",
                      color: selectedTag === tag ? "#222" : "white",
                      fontWeight: selectedTag === tag ? "bold" : "normal",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      opacity: 0,
                      animation: `tagPop 0.4s ease forwards`,
                      animationDelay: `${i * 100}ms`
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* privacy toggle & submit */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "1rem"
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ marginRight: "0.5rem", fontSize: "0.9rem" }}>
                {isPublic ? "🔭 Public" : "🔒 Private"}
              </span>
              <label
                style={{
                  position: "relative",
                  display: "inline-block",
                  width: 50,
                  height: 24
                }}
              >
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={e => setIsPublic(e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span
                  style={{
                    position: "absolute",
                    cursor: "pointer",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: isPublic ? "#4ade80" : "#f87171",
                    transition: ".4s",
                    borderRadius: 24
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    height: 18,
                    width: 18,
                    left: isPublic ? 26 : 4,
                    bottom: 3,
                    backgroundColor: "white",
                    borderRadius: "50%",
                    transition: ".4s"
                  }}
                />
              </label>
            </div>

            <button
              type="submit"
              style={{
                background: "linear-gradient(135deg, #ffd700, #ff9d00)",
                border: "none",
                padding: "0.6rem 1.2rem",
                borderRadius: 45,
                cursor: "pointer",
                fontWeight: "bold",
                color: "#222",
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
              }}
            >
              Plant Star
            </button>
          </div>
        </form>
      )}
    </>
  );
}
