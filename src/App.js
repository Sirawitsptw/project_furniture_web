import "./App.css";
import React, { useState, useEffect, createContext } from "react";
import Login from "./pages/login";
import HomePage from "./pages/homepage";
import Nav from "./pages/Nav";
import { auth } from "./firebase/config";
import AddItem from "./pages/additem";

export const SessionContext = createContext();

function App() {
  const [session, setSession] = useState({
    isLoggedIn: false,
    currentUser: null,
    errorMessage: null,
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setSession({
          isLoggedIn: true,
          currentUser: user,
          errorMessage: null,
        });
      } else {
        setSession({
          isLoggedIn: false,
          currentUser: null,
          errorMessage: null,
        });
      }
    });

    // Cleanup function to unsubscribe from the auth state listener
    return () => unsubscribe();
  }, []);

  return (
    <>
      <div className="App">
        <SessionContext.Provider value={{ session, setSession }}>
          {session.isLoggedIn ? (
            <>
              <Nav />
              <HomePage />
            </>
          ) : (
            <Login setSession={setSession} />
          )}
        </SessionContext.Provider>
      </div>
    </>
  );
}

export default App;
