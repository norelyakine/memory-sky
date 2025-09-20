import { useEffect, useRef } from "react";
import p5 from "p5";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import { useAuth } from "../context/AuthContext";

export default function GalaxyCanvas() {
  const canvasRef = useRef();
  const user = useAuth();
  const starsRef = user ? ref(db, `users/${user.uid}/stars`) : null;
  const stars = useRef([]);

  useEffect(() => {
    if (!starsRef) return;
    const unsub = onValue(starsRef, (snapshot) => {
      const data = snapshot.val() || {};
      stars.current = Object.values(data);
    });
    return () => unsub();
  }, [starsRef]);

  useEffect(() => {
    const sketch = (p) => {
      let colors;

      p.setup = () => {
        const cnv = p.createCanvas(p.windowWidth, p.windowHeight);
        cnv.style("display", "block");
        cnv.parent(canvasRef.current);

        colors = [
          p.color("#0B0520"),   
          p.color("#1a051eff"), 
          p.color("#10052dff")   
        ];
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };

      function drawGradient(c1, c2) {
        for (let y = 0; y < p.height; y++) {
          let inter = p.map(y, 0, p.height, 0, 1);
          let c = p.lerpColor(c1, c2, inter);
          p.stroke(c);
          p.line(0, y, p.width, y);
        }
      }

      p.draw = () => {
        let t = (Date.now() / 700) * 0.1; //  speed
        let cycle = (Math.sin(t) + 1) / 2; // oscillation

        let c1 = p.lerpColor(colors[0], colors[1], cycle);
        let c2 = p.lerpColor(colors[1], colors[2], cycle);
        let top = p.lerpColor(c1, c2, cycle);
        let bottom = p.lerpColor(c2, colors[0], cycle);

        drawGradient(top, bottom);

        // draw stars
        stars.current.forEach((star) => {
          p.fill(star.isPublic ? 255 : 150, 200, 255);
          p.noStroke();
          p.ellipse(star.x, star.y, 8, 8);
        });
      };
    };

    const instance = new p5(sketch);
    return () => instance.remove();
  }, []);

  return <div ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: -1 }} />;
}
