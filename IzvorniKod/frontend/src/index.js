import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";

const token = localStorage.getItem("token");
if (token && !sessionStorage.getItem("token")) {
  sessionStorage.setItem("token", token);
}


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
