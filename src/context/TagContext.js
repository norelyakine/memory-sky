// src/context/TagContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { ref, onValue, set } from "firebase/database";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";

const TagContext = createContext();

export function TagProvider({ children }) {
  const { user } = useAuth();
  const [tagOptions, setTagOptions] = useState({});
  const [filterTags, setFilterTags] = useState([]);
  const [showConstellations, setShowConstellations] = useState(false);

  // Load global tag options
  useEffect(() => {
    const unsub = onValue(ref(db, "tagOptions"), snap => {
      setTagOptions(snap.val() || {});
    });
    return () => unsub();
  }, []);

  // Load user preference when user logs in
  useEffect(() => {
    if (!user) return;
    const prefRef = ref(db, `users/${user.uid}/preferences/showConstellations`);
    const unsub = onValue(prefRef, snap => {
      const val = snap.val();
      if (val !== null) {
        setShowConstellations(val);
      }
    });
    return () => unsub();
  }, [user]);

  // Explicit updater that syncs to Firebase
  const updateShowConstellations = (val) => {
    setShowConstellations(val);
    if (user) {
      const prefRef = ref(db, `users/${user.uid}/preferences/showConstellations`);
      set(prefRef, val);
    }
  };

  return (
    <TagContext.Provider
      value={{
        tagOptions,
        filterTags,
        setFilterTags,
        showConstellations,
        setShowConstellations: updateShowConstellations
      }}
    >
      {children}
    </TagContext.Provider>
  );
}

export function useTags() {
  return useContext(TagContext);
}
