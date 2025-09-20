import { useAuth } from "./context/AuthContext";
import AuthForm from "./components/AuthForm";
import AddStarForm from "./components/AddStarForm";
import GalaxyCanvas from "./components/GalaxyCanvas";

function App() {
  const user = useAuth();

  return (
    <div>
      <h1>Memory Sky</h1>
      {!user ? (
        <AuthForm />
      ) : (
        <>
          <AddStarForm />
          <GalaxyCanvas />
        </>
      )}
    </div>
  );
}

export default App;
