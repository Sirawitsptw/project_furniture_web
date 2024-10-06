import "./App.css";
import React, { useState, useEffect } from "react";
import Login from "./pages/login";
import HomePage from "./pages/homepage";
import { auth } from "./firebase/config";

function App() {
  const [session, setSession] = useState({
    isLoggedIn: false,
    currentUser: null,
    errorMessage: null,
  });

  useEffect(() => {
    const handleAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setSession({
          isLoggedIn: true,
          currentUser: user,
          errorMessage: null,
        });
      }
    });
    return () => {
      handleAuth();
    };
  }, []);

  const handleLogout = () => {
    auth.signOut().then((response) => {
      setSession({
        isLoggedIn: false,
        currentUser: null,
      });
    });
  };

  return (
    <>
      <div className="App">
        {session.isLoggedIn ? (
          <>
            <header>
              <link
                rel="stylesheet"
                href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
              ></link>
              <link
                href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"
                rel="stylesheet"
              ></link>
              <nav className="bg-blue-500 p-1">
                <div className="container mx-auto grid grid-cols-3 gap-4 grid-rows-1 items-center">
                  <div className="text-white text-xl font-bold">MyApp</div>
                  <div className="space-x-5">
                    <a href="" className="text-white hover:text-black">
                      Home
                    </a>
                    <a href="" className="text-white hover:text-black">
                      Profile
                    </a>
                    <a href="" className="text-white hover:text-black">
                      Settings
                    </a>
                    <a href="Additem" className="text-white hover:text-black">
                      Add Product
                    </a>
                  </div>
                  <div className="ml-auto">
                    <a className="pr-5 text-pink-300 font-mono font-semibold">
                      <i className="bi bi-person-circle text-2xl px-1"></i>
                      {session.currentUser && session.currentUser.email}
                    </a>
                    <button
                      className="bi bi-box-arrow-left rounded-lg p-2 bg-transparent text-white hover:text-black"
                      onClick={handleLogout}
                    >
                      <a className="px-2">Logout</a>
                    </button>
                  </div>
                </div>
              </nav>
            </header>

            <HomePage />
          </>
        ) : (
          <Login setSession={setSession} />
        )}
      </div>
    </>
  );
}

export default App;
