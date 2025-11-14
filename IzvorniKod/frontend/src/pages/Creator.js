import React, { useState } from "react";
import Navbar from "../components/Creator/CreatorNavbar";
import Sidebar from "../components/Creator/Sidebar";
import OverviewSection from "../components/Creator/OverviewSection";
import RecipesSection from "../components/Creator/RecipesSection";
import AddRecipeSection from "../components/Creator/AddRecipeSection";
import ProfileSection from "../components/Creator/ProfileSection";
import "../styles/global.css";

function CreatorPage() {
  const [activeSection, setActiveSection] = useState("overview");

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        
        <main className="main-content">
          {activeSection === "overview" && <OverviewSection />}
          {activeSection === "recipes" && <RecipesSection />}
          {activeSection === "addRecipe" && <AddRecipeSection />}
          {activeSection === "profile" && <ProfileSection />}
        </main>
      </div>
    </div>
  );
}

export default CreatorPage;
