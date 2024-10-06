import "./login.css";
import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

function Login({ setSession }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const auth = getAuth();
      const response = await signInWithEmailAndPassword(auth, email, password);
      const { user } = response;

      setSession({
        isLoggedIn: true,
        currentUser: user,
      });
    } catch (error) {
      setSession({
        isLoggedIn: false,
        currentUser: null,
        errorMessage: error.message,
      });
      alert("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  const handleEmail = (event) => {
    setEmail(event.target.value);
  };

  const handlePassword = (event) => {
    setPassword(event.target.value);
  };

  return (
    <>
      <div className="wrapper fadeInDown">
        <div id="formContent">
          <h2 className="active"> Sign In </h2>
          <div className="fadeIn first">
            <img
              src="https://img.icons8.com/?size=100&id=43964&format=png&color=000000"
              id="icon"
              alt="User Icon"
              style={{ width: "50px", height: "auto" }}
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Email"
              className="fadeIn second"
              name="email"
              onChange={handleEmail}
            />
            <input
              type="password"
              placeholder="Password"
              className="fadeIn third"
              name="password"
              onChange={handlePassword}
            />
            <input
              type="button"
              className="fadeIn fourth"
              value="Log In"
              onClick={handleLogin}
            />
          </div>
          <div id="formFooter">
            <a className="underlineHover" href="#">
              Contect us
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
