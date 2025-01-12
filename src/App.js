import "./App.css";
import React, { useState, useEffect, createContext } from "react";
import Login from "./pages/login";
import HomePage from "./pages/homepage";
import Nav from "./pages/Nav";
import { auth } from "./firebase/config";
import AddItem from "./pages/additem";
import { Navigate } from "react-router-dom";

export const SessionContext = createContext();

function App() {
  const [session, setSession] = useState(0);
  return (
    <>
      <Navigate to="/home" />
    </>
  );
}

export default App;
