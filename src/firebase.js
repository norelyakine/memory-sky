// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getDatabase,
  ref,
  get,
  set
} from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAUgAeQ1gt4nZjoWkXqy_I5LFuJcF2c-lk",
  authDomain: "memory-sky-2660a.firebaseapp.com",
  databaseURL:
    "https://memory-sky-2660a-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "memory-sky-2660a",
  storageBucket: "memory-sky-2660a.firebasestorage.app",
  messagingSenderId: "310009422870",
  appId: "1:310009422870:web:df5bab0d131c3ce6e04137",
  measurementId: "G-7T2L3RTD2N"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

;(async () => {
  try {
    const tagRef = ref(db, "tagOptions");
    const snap = await get(tagRef);

    if (!snap.exists()) {
      const tagData = {
        joyful: {
          color: "#FFD700",
          description: "Radiant, warm hopeful light",
          gradient: ["#FFE066", "#FFD700"]
        },
        hopeful: {
          color: "#A7F3D0",
          description: "Soft promise in the dark",
          gradient: ["#A7F3D0", "#6EE7B7"]
        },
        sad: {
          color: "#60A5FA",
          description: "Quiet introspection and blue calm",
          gradient: ["#60A5FA", "#2563EB"]
        },
        angry: {
          color: "#F87171",
          description: "Intense release and red fire",
          gradient: ["#FCA5A5", "#F87171"]
        },
        lonely: {
          color: "#A78BFA",
          description: "Quiet solitude in violet space",
          gradient: ["#C4B5FD", "#A78BFA"]
        },
        lost: {
          color: "#94A3B8",
          description: "Drifting thoughts and muted slate",
          gradient: ["#94A3B8", "#6B7280"]
        },
        mundane: {
          color: "#D4D4D8",
          description: "Everyday stillness in soft gray",
          gradient: ["#E5E7EB", "#D4D4D8"]
        }
      };

      await set(tagRef, tagData);
      console.log("✅ tagOptions seeded without icons");
    } else {
      console.log("ℹ️ tagOptions already exists — skipping seed");
    }
  } catch (err) {
    console.error("❌ Failed to seed tagOptions:", err);
  }
})();