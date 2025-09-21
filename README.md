# Memory Sky

Memory Sky is an interactive, poetic web app where users plant memories as stars in a living galaxy.  
Each star can be tagged with emotions, colored by palettes, and connected into constellations.  
The sky itself is alive with gradients, twinkling stars, and emergent clusters.

---

## Features

- **Galaxy Canvas**  
  - Infinite panning & zooming with smooth camera controls  
  - Animated aurora‑like gradient background  
  - Stars twinkle with depth‑based parallax  

- **Memories as Stars**  
  - Add, edit, and delete memories  
  - Each star stores text, visibility (public/private), and tags  
  - Stars are color‑coded by their primary tag  

- **Constellations**  
  - Toggle to reveal faint glowing lines between related stars  

- **Emotional Tagging**  
  - Curated tag sidebar with gradients and colors  
  - Filter the galaxy by selected tags  
  - Floating sidebar handle for quick access  

- **Authentication**  
  - Firebase Authentication (email/password, social providers)  
  - User‑scoped data storage in Firebase Realtime Database  

---

## 🛠️ Tech Stack

- **Frontend**: React, p5.js, Tailwind CSS  
- **State & Context**: React Context API (`AuthContext`, `TagContext`)  
- **Backend**: Firebase Authentication + Realtime Database  
- **Design**: Glassmorphism UI, floating FABs, animated gradients  

---
Built with gleam by Aya

# Start development server
npm start
