// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
 
const firebaseConfig = {
  apiKey: "AIzaSyAUgAeQ1gt4nZjoWkXqy_I5LFuJcF2c-lk",
  authDomain: "memory-sky-2660a.firebaseapp.com",
  databaseURL: "https://memory-sky-2660a-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "memory-sky-2660a",
  storageBucket: "memory-sky-2660a.firebasestorage.app",
  messagingSenderId: "310009422870",
  appId: "1:310009422870:web:df5bab0d131c3ce6e04137",
  measurementId: "G-7T2L3RTD2N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getDatabase(app);
 