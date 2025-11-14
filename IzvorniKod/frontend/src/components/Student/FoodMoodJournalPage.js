import React, { useState } from "react"; 
import Navbar from ".././Creator/CreatorNavbar";
import Sidebar from "./StudentSidebar";
import OverviewSection from "./StudentOverview";
import MealPlanSection from "./MealPlanPage";
import FoodMoodJournal from "./FoodMoodJournal";
import ProfileSection from "./StudentProfile";
import "../../styles/global.css";

function FoodMoodJournalPage() {
  const [activeSection, setActiveSection] = useState("foodmood");

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
          {activeSection === "mealplan" && <MealPlanSection />}
          {activeSection === "foodmood" && <FoodMoodJournal />}
          {activeSection === "profile" && <ProfileSection />}
        </main>
      </div>
    </div>
  );
}

export default FoodMoodJournalPage;
