// src/components/GalaxyCanvas.js

import React, { useEffect, useRef, useState } from "react";
import p5 from "p5";
import { db } from "../firebase";
import { ref, onValue, update, remove } from "firebase/database";
import { useAuth } from "../context/AuthContext";
import { useTags } from "../context/TagContext";

export default function GalaxyCanvas() {
  const canvasRef = useRef();
  const { user } = useAuth();
  const stars = useRef([]);

  const { tagOptions, filterTags, showConstellations } = useTags(); 
  const showConstellationsRef = useRef(showConstellations);
  const [activeStar, setActiveStar] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [editedPublic, setEditedPublic] = useState(true);
  const [editedTag, setEditedTag] = useState(null);

  useEffect(() => {
    const onOpen = e => {
      const star = e.detail;
      setActiveStar(star);
      setIsEditing(false);
      setEditedText(star.text);
      setEditedPublic(star.isPublic);
      setEditedTag(Array.isArray(star.tags) ? star.tags[0] : null);
    };
    window.addEventListener("open-star", onOpen);
    return () => window.removeEventListener("open-star", onOpen);
  }, []);
  useEffect(() => {
    showConstellationsRef.current = showConstellations;
  }, [showConstellations]);
  useEffect(() => {
    if (!user) return;
    const starsRef = ref(db, `users/${user.uid}/stars`);
    const unsub = onValue(starsRef, snap => {
      const val = snap.val() || {};
      stars.current = Object.entries(val).map(([id, data]) => ({
        id,
        ...data
      }));
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    const sketch = p => {
      let colors, camera, dragging, lastMouse;

      p.setup = () => {
        const cnv = p.createCanvas(p.windowWidth, p.windowHeight);
        cnv.style("display", "block");
        cnv.parent(canvasRef.current);

        colors = [p.color("#0B0520"), p.color("#1a051e"), p.color("#10052d")];
        camera = { x: 0, y: 0, zoom: 1 };
        dragging = false;
        lastMouse = { x: 0, y: 0 };
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };

      function drawGradient(c1, c2) {
        p.noFill();
        for (let y = 0; y < p.height; y++) {
          const t = p.map(y, 0, p.height, 0, 1);
          p.stroke(p.lerpColor(c1, c2, t));
          p.line(0, y, p.width, y);
        }
      }

      p.mousePressed = () => {
        dragging = true;
        lastMouse.x = p.mouseX;
        lastMouse.y = p.mouseY;

        const wx = (p.mouseX - camera.x) / camera.zoom;
        const wy = (p.mouseY - camera.y) / camera.zoom;
        const hit = stars.current.findLast(s =>
          p.dist(wx, wy, s.x, s.y) < 10
        );
        if (hit) {
          window.dispatchEvent(new CustomEvent("open-star", { detail: hit }));
        }
      };

      p.mouseReleased = () => {
        dragging = false;
      };

      p.mouseDragged = () => {
        if (dragging) {
          const dx = p.mouseX - lastMouse.x;
          const dy = p.mouseY - lastMouse.y;
          camera.x += dx;
          camera.y += dy;
          lastMouse.x = p.mouseX;
          lastMouse.y = p.mouseY;
        }
      };

      p.mouseWheel = e => {
        const factor = e.delta > 0 ? 0.95 : 1.05;
        const prev = camera.zoom;
        const next = p.constrain(prev * factor, 0.5, 3);
        camera.zoom = next;
        const ratio = next / prev;
        camera.x = p.mouseX - (p.mouseX - camera.x) * ratio;
        camera.y = p.mouseY - (p.mouseY - camera.y) * ratio;
        return false;
      };

      p.draw = () => {
  const tt = (Date.now() / 1000) * 0.15;
  const cycle = (Math.sin(tt) + 1) / 2;
  const cA = p.lerpColor(colors[0], colors[1], cycle);
  const cB = p.lerpColor(colors[1], colors[2], cycle);
  drawGradient(
    p.lerpColor(cA, cB, cycle),
    p.lerpColor(cB, colors[0], cycle)
  );

  p.push();
  p.translate(camera.x, camera.y);
  p.scale(camera.zoom);

  const now = performance.now() / 1000;
  const cx = p.width / 2;
  const cy = p.height / 2;

  // --- Draw stars ---
  const visibleStars = [];
  stars.current.forEach((star, i) => {
    const starTags = Array.isArray(star.tags) ? star.tags : [];
    if (
      filterTags.length > 0 &&
      !starTags.some(t => filterTags.includes(t))
    ) {
      return;
    }

    const depth = star.depth ?? 1;
    const phase = (i * 0.37) % (2 * Math.PI);
    const tw = 0.6 + 0.4 * Math.sin(now * 2 + phase);
    const size = 4 + 3 * tw;
    const dx = ((p.mouseX - cx) / camera.zoom) * 0.02 * (1 - depth);
    const dy = ((p.mouseY - cy) / camera.zoom) * 0.02 * (1 - depth);
    const x = star.x + dx;
    const y = star.y + dy;

    const primary = starTags[0];
    let hex = star.isPublic ? "#FFD700" : "#8A2BE2";
    if (primary && tagOptions[primary]?.color) {
      hex = tagOptions[primary].color;
    }

    const c = p.color(hex);
    p.fill(p.red(c) * tw, p.green(c) * tw, p.blue(c) * tw);
    p.noStroke();
    p.ellipse(x, y, size, size);

    // Save for constellation drawing
    visibleStars.push({ ...star, x, y, primary });
  });

  // --- Draw constellations ---

  if (showConstellationsRef.current) {
     Object.keys(tagOptions).forEach(tag => {
    const group = visibleStars.filter(s =>
      Array.isArray(s.tags) && s.tags.includes(tag)
    );
    if (group.length < 2) return;

    const hex = tagOptions[tag]?.color || "#888";
    const c = p.color(hex);

    group.forEach((s, i) => {
      // find nearest neighbor in this group
      let nearest = null;
      let nearestDist = Infinity;
      group.forEach((t, j) => {
        if (i === j) return;
        const d = p.dist(s.x, s.y, t.x, t.y);
        if (d < nearestDist) {
          nearestDist = d;
          nearest = t;
        }
      });
      if (nearest) {
        // glow effect: draw multiple strokes
        for (let w = 3; w >= 1; w--) {
          p.strokeWeight(w);
          p.stroke(p.red(c), p.green(c), p.blue(c), 20 * w); // faint alpha
          p.line(s.x, s.y, nearest.x, nearest.y);
        }
      }
    });
  });

  }
 
  p.pop();
};

    };

    const instance = new p5(sketch);
    return () => instance.remove();
  }, [user, filterTags, tagOptions]);

  const handleDelete = () => {
    if (!user || !activeStar) return;
    remove(ref(db, `users/${user.uid}/stars/${activeStar.id}`))
      .then(() => setActiveStar(null))
      .catch(console.error);
  };

  const handleSave = () => {
    if (!user || !activeStar) return;
    update(ref(db, `users/${user.uid}/stars/${activeStar.id}`), {
      text: editedText,
      isPublic: editedPublic,
      tags: editedTag ? [editedTag] : []
    })
      .then(() => setActiveStar(null))
      .catch(console.error);
  };

  return (
    <>
      <style>{`
        .star-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6);
          display: flex; align-items: center; justify-content: center;
          z-index: 2000;
        }
        .star-modal-content {
          background: rgba(20,20,30,0.95);
          padding: 1.5rem; border-radius: 12px;
          max-width: 460px; width: 90%; color: white;
          position: relative; box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .star-modal-close {
          position: absolute; top: 0.5rem; right: 0.75rem;
          background: none; border: none; font-size: 1.5rem;
          color: white; cursor: pointer;
        }
        .star-modal-header {
          margin: 0 0 0.75rem 0; font-weight: 600;
        }
        .star-modal-text {
          color: #eaeaf2; line-height: 1.5;
        }
        .edit-btn {
          margin-top: 1rem; margin-right: 0.5rem;
          padding: 0.5rem 0.9rem; border-radius: 10px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.18);
          color: white; cursor: pointer;
        }
        .delete-btn {
          margin-top: 1rem; padding: 0.5rem 0.9rem;
          border-radius: 10px;
          background: linear-gradient(135deg, #ff6961, #f43f5e);
          border: 1px solid rgba(255,255,255,0.18);
          color: white; cursor: pointer;
        }
        .star-modal-footer {
          margin-top: 1rem; display: flex;
          justify-content: flex-end; gap: 0.5rem;
        }
      `}</style>

      <div ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: -1 }} />

      {activeStar && (
        <div
          className="star-modal-overlay"
          onClick={() => setActiveStar(null)}
        >
          <div
            className="star-modal-content"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="star-modal-close"
              onClick={() => setActiveStar(null)}
              aria-label="Close"
            >
              ×
            </button>

            <h3 className="star-modal-header">Your Memory</h3>

            {!isEditing ? (
              <>
                <p className="star-modal-text">{activeStar.text}</p>
                <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
                  {activeStar.tags?.slice(0, 1).map(tag => (
                    <span
                      key={tag}
                      style={{
                        padding: "0.3rem 0.6rem",
                        borderRadius: "20px",
                        background: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        fontSize: "0.75rem",
                        color: "white"
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                  Edit
                </button>
                <button className="delete-btn" onClick={handleDelete}>
                  Delete
                </button>
              </>
            ) : (
              <>
                <textarea
                  value={editedText}
                  onChange={e => setEditedText(e.target.value)}
                  className="star-modal-text"
                  style={{
                    width: "100%",
                    minHeight: "100px",
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.18)",
                    borderRadius: 8,
                    padding: "0.6rem",
                    color: "white"
                  }}
                />
                <label style={{ display: "block", margin: "0.75rem 0" }}>
                  <input
                    type="checkbox"
                    checked={editedPublic}
                    onChange={e => setEditedPublic(e.target.checked)}
                  />{" "}
                  Public
                </label>

                <div style={{ margin: "1rem 0" }}>
                  <p style={{ marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                    Tag:
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {Object.keys(tagOptions).map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setEditedTag(tag)}
                        style={{
                          padding: "0.4rem 0.8rem",
                          borderRadius: "20px",
                          border:
                            editedTag === tag
                              ? "2px solid #ffd700"
                              : "1px solid rgba(255,255,255,0.2)",
                          background:
                            editedTag === tag
                              ? "rgba(255,255,255,0.15)"
                              : "transparent",
                          color: "white",
                          cursor: "pointer",
                          fontSize: "0.85rem"
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="star-modal-footer">
                  <button className="edit-btn" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                  <button className="delete-btn" onClick={handleSave}>
                    Save
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
