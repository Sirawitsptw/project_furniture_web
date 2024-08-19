// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD715_A3-Pj9quoFK1zdYSiZMAPOVZsklY",
  authDomain: "fir-projectauth-b0f18.firebaseapp.com",
  projectId: "fir-projectauth-b0f18",
  storageBucket: "fir-projectauth-b0f18.appspot.com",
  messagingSenderId: "374531405116",
  appId: "1:374531405116:web:87217c681da9b4d0d59a39",
  measurementId: "G-K22B23LP49"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
