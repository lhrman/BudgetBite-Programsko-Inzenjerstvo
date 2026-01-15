import React from "react";
import "../../styles/global.css";
import "../../styles/student.css";

function OverviewSection() {
  return (
    <div className="overview-container">
      <h1 className="overview-title">Dobrodošao, Studentu!</h1>
      <p className="overview-subtitle">
        Ovdje možeš upravljati svojim profilom.
      </p>
      <p className="overview-subtitle">
        Ispuni svoj prehrambeni upitnik kako bi dobio personalizirani tjedni plan prehrane.
      </p>
    </div>
  );
}

export default OverviewSection;