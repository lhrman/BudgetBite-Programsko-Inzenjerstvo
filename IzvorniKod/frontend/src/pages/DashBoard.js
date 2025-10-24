import React from "react";
import Navbar from "../components/Navbar";

function Dashboard() {
  return (
    React.createElement("div", null,
      React.createElement(Navbar),
      React.createElement("div", { className: "p-8" },
        React.createElement("h1", { className: "text-2xl font-bold" }, "Početna stranica"),
        React.createElement("p", null, "probna")
      )
    )
  );
}

export default Dashboard;