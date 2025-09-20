import { useState } from "react";
import { db } from "../firebase";
import { ref, push } from "firebase/database";
import { useAuth } from "../context/AuthContext";

export default function AddStarForm() {
  const [text, setText] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [open, setOpen] = useState(false);
  const user = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const star = {
      text,
      isPublic,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      createdAt: Date.now(),
      stardust: 0
    };

    await push(ref(db, `users/${user.uid}/stars`), star);
    setText("");
    setOpen(false);
  };

  return (
    <>
      {/* Floating Star Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          border: "none",
          background: "linear-gradient(135deg, #ffd700, #ff9d00)",
          fontSize: "24px",
          cursor: "pointer",
          zIndex: 20,
          boxShadow: "0 4px 15px rgba(0,0,0,0.4)"
        }}
      >
        ⭐
      </button>

      {/*  Form */}
      {open && (
        <form
          onSubmit={handleSubmit}
          style={{
            position: "fixed",
            bottom: "100px",
            right: "20px",
            width: "300px",
            padding: "2rem",
            borderRadius: "16px",
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            color: "white",
            zIndex: 30,
            animation: "fadeInUp 0.3s ease"
          }}
        >
          {/* Textarea */}
        <textarea
        value={text}
        onChange={(e) => {
            setText(e.target.value);
            const el = e.target;
            el.style.height = "12px"; 
            el.style.height = Math.min(el.scrollHeight, 120) + "px"; 
        }}
        placeholder="Plant a memory..."
        style={{
            width: "95%",
            minHeight: "12px",        
            maxHeight: "120px",      
            padding: "0.5rem",
            border: "none",
            outline: "none",
            background: "none",
            borderRadius: "8px",
            color: "white",
            resize: "none",
            overflowY: "auto",       
            scrollbarWidth: "none"   
        }}
        />


         {/* Action Row */}
            <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "1rem"
            }}
            >
            {/* Toggle Public/Private */}
            <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ marginRight: "0.5rem", fontSize: "0.9rem" }}>
                {isPublic ? "🔭 Public" : "🔒 Private"}
                </span>
                <label
                style={{
                    position: "relative",
                    display: "inline-block",
                    width: "50px",
                    height: "24px",
                    marginRight: "1rem"
                }}
                >
                <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
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
                    borderRadius: "24px"
                    }}
                />
                <span
                    style={{
                    position: "absolute",
                    height: "18px",
                    width: "18px",
                    left: isPublic ? "26px" : "4px",
                    bottom: "3px",
                    backgroundColor: "white",
                    borderRadius: "50%",
                    transition: ".4s"
                    }}
                />
                </label>
            </div>

                {/* Submit button */}
                <button
                    type="submit"
                    style={{
                    background: "linear-gradient(135deg, #ffd700, #ff9d00)",
                    border: "none",
                    padding: "0.6rem 1.2rem",
                    borderRadius: "45px",
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
