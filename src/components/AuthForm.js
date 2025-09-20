import { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSignup) {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await set(ref(db, "users/" + userCred.user.uid), {
        galaxyName: "My Galaxy",
        stars: {}
      });
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">{isSignup ? "Sign Up" : "Login"}</button>
      <p onClick={() => setIsSignup(!isSignup)}>
        {isSignup ? "Already have an account? Login" : "No account? Sign up"}
      </p>
    </form>
  );
}
