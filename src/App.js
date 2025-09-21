// src/App.js

import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { TagProvider } from "./context/TagContext";
import TagSideBar from "./components/TagSideBar";
import GalaxyCanvas from "./components/GalaxyCanvas";
import AddStarForm from "./components/AddStarForm";
import ConstellationToggle from "./components/ConstellationToggle";

function App() {
  return (
    <AuthProvider>
      <TagProvider>
        <TagSideBar />
        <GalaxyCanvas />
        <AddStarForm />
        <ConstellationToggle /> 
      </TagProvider>
    </AuthProvider>
  );
}

export default App;
