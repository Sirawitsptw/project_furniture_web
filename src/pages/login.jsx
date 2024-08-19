// src/Login.js
import "./login.css";
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (email === "admin@gmail.com" && password === "admin1234") {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login Successful");
      navigate("/HomePage");
    } else {
      alert("Invalid username or password");
    }
  };

  return (
    <>
      <div class="wrapper fadeInDown">
        <div id="formContent">
          <h2 class="active"> Sign In </h2>
          <div class="fadeIn first">
            <img
              src="https://img.icons8.com/?size=100&id=43964&format=png&color=000000"
              id="icon"
              alt="User Icon"
              style={{ width: "50px", height: "auto" }}
            />
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              class="fadeIn second"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              class="fadeIn third"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input type="submit" class="fadeIn fourth" value="Log In" />
          </form>
          <div id="formFooter">
            <a class="underlineHover" href="#">
              Contect us
            </a>
          </div>
          {error && <p>{error}</p>}
        </div>
      </div>
    </>
  );
}

export default Login;
