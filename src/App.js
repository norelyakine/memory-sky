import { useAuth } from "./context/AuthContext";
import GalaxyCanvas from "./components/GalaxyCanvas";
import AddStarForm from "./components/AddStarForm";
import AuthForm from "./components/AuthForm";
import "./App.css";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ color: "white" }}>Loading your galaxy...</div>;
  }

  return (
    <>
      <GalaxyCanvas />
      {user ? <AddStarForm /> : <AuthForm />}
    </>
  );
}

export default App;
