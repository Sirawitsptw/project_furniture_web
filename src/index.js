import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import HomePage from "./pages/homepage";
import AddItem from "./pages/additem";
import Listdata from "./pages/list";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "AddItem",
    element: <AddItem />,
  },
  {
    path: "Listdata",
    element: <Listdata />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

reportWebVitals();
