import React, { useState } from "react";
import Navbar from "../components/Creator/Dashboard/CreatorNavbar";
import Sidebar from "../components/Creator/Dashboard/Sidebar";
import OverviewSection from "../components/Creator/Dashboard/OverviewSection";
import RecipesSection from "../components/Creator/Recipes/RecipesSection";
import AddRecipeSection from "../components/Creator/RecipeForm/AddRecipeSection";
import ProfileSection from "../components/Creator/Profile/ProfileSection";
import SettingsPage from "../components/Settings/SettingsPage"; // ← NOVI IMPORT
import "../styles/global.css";
import "../styles/creator.css";

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
          {activeSection === "recipes" && (
            <RecipesSection onAddRecipe={() => setActiveSection("addRecipe")} />
          )}
          {activeSection === "addRecipe" && <AddRecipeSection />}
          {activeSection === "profile" && <ProfileSection />}
          {activeSection === "settings" && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}

export default CreatorPage;