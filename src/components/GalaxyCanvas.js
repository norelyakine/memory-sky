import React, { useEffect, useRef, useState } from "react";
import p5 from "p5";
import { db } from "../firebase";
import { ref, onValue, update, remove } from "firebase/database";
import { useAuth } from "../context/AuthContext";

export default function GalaxyCanvas() {
  const canvasRef = useRef();
  const { user } = useAuth();
  const stars = useRef([]);

  // For modal
  const [activeStar, setActiveStar] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [editedPublic, setEditedPublic] = useState(true);

  useEffect(() => {
    const onOpen = e => {
      const star = e.detail;
      setActiveStar(star);
      setIsEditing(false);
      setEditedText(star.text);
      setEditedPublic(star.isPublic);
    };
    window.addEventListener("open-star", onOpen);
    return () => window.removeEventListener("open-star", onOpen);
  }, []);

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

        colors = [
          p.color("#0B0520"),
          p.color("#1a051e"),
          p.color("#10052d")
        ];

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

        // coords
        const wx = (p.mouseX - camera.x) / camera.zoom;
        const wy = (p.mouseY - camera.y) / camera.zoom;

        const hit = stars.current.findLast(s => p.dist(wx, wy, s.x, s.y) < 10);
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
        // background gradient
        const tt = (Date.now() / 1000) * 0.15;
        const cycle = (Math.sin(tt) + 1) / 2;
        const cA = p.lerpColor(colors[0], colors[1], cycle);
        const cB = p.lerpColor(colors[1], colors[2], cycle);
        drawGradient(
          p.lerpColor(cA, cB, cycle),
          p.lerpColor(cB, colors[0], cycle)
        );

        // stars
        p.push();
        p.translate(camera.x, camera.y);
        p.scale(camera.zoom);

        const now = performance.now() / 1000;
        const cx = p.width / 2;
        const cy = p.height / 2;

        stars.current.forEach((star, i) => {
          const depth = star.depth ?? 1;
          const phase = (i * 0.37) % (2 * Math.PI);
          const tw = 0.6 + 0.4 * Math.sin(now * 2 + phase);
          const size = 4 + 3 * tw;
          const dx = ((p.mouseX - cx) / camera.zoom) * 0.02 * (1 - depth);
          const dy = ((p.mouseY - cy) / camera.zoom) * 0.02 * (1 - depth);
          const x = star.x + dx;
          const y = star.y + dy;
          const base = star.isPublic
            ? [255, 215, 0]
            : [138, 43, 226];
          p.fill(base[0] * tw, base[1] * tw, base[2] * tw);
          p.noStroke();
          p.ellipse(x, y, size, size);
        });

        p.pop();
      };
    };

    const instance = new p5(sketch);
    return () => instance.remove();
  }, []);

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
      isPublic: editedPublic
    })
      .then(() => setActiveStar(null))
      .catch(console.error);
  };

  return (
    <>
      <div ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: -1 }} />

      {activeStar && (
        <div className="star-modal-overlay" onClick={() => setActiveStar(null)}>
          <div className="star-modal-content" onClick={e => e.stopPropagation()}>
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
                  style={{ width: "100%", minHeight: "80px" }}
                />
                <label style={{ display: "block", margin: "0.5rem 0" }}>
                  <input
                    type="checkbox"
                    checked={editedPublic}
                    onChange={e => setEditedPublic(e.target.checked)}
                  />{" "}
                  Public
                </label>

                <div className="star-modal-footer">
                  <button
                    className="edit-btn"
                    onClick={() => setIsEditing(false)}
                  >
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
