import logo from "./logo.svg";
import "./App.css";
import React, { useState } from "react";
import Login from "./pages/login";
import Nav from "./pages/Nav";

function App() {
  const [count, setCount] = useState(0);
  return (
    <>
      <div className="App">
        <Login />
      </div>
    </>
  );
}

export default App;
