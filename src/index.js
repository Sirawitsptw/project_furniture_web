import React, { useState, useEffect, createContext } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App";
import Login from "./pages/login";
import reportWebVitals from "./reportWebVitals";
import AddItem from "./pages/additem";
import Listdata from "./pages/list";
import { UserAuthContextProvider } from "./context/UserAuthContext";
import HomePage from "./pages/homepage";
import ProtectedRoute from "./auth/protectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "AddItem",
    element: (
      <>
        <ProtectedRoute>
          <AddItem />
        </ProtectedRoute>
      </>
    ),
  },
  {
    path: "Listdata",
    element: (
      <>
        <ProtectedRoute>
          <Listdata />
        </ProtectedRoute>
      </>
    ),
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <UserAuthContextProvider>
      <RouterProvider router={router} />
    </UserAuthContextProvider>
  </React.StrictMode>
);

reportWebVitals();
