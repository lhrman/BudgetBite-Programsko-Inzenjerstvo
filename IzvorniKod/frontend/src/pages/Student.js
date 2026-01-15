import React, { useState } from "react";
import Navbar from "../components/Creator/Dashboard/CreatorNavbar";
import Sidebar from "../components/Student/StudentSidebar";
import OverviewSection from "../components/Student/StudentOverview";
import QuestionnaireSection from "../components/Student/PrehrambeniUpitnik";
import MealPlanSection from "../components/Student/MealPlanPage";
import FoodMoodJournal from "../components/Student/FoodMoodJournal";
import ProfileSection from "../components/Student/StudentProfile";
import GamificationPage from "../components/Student/Gamification/GamificationPage";
import SettingsPage from "../components/Settings/SettingsPage"; // ← DODANO
import "../styles/global.css";

function StudentPage() {
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
          {activeSection === "questionnaire" && <QuestionnaireSection />}
          {activeSection === "mealplan" && <MealPlanSection />}
          {activeSection === "foodmood" && <FoodMoodJournal />}
          {activeSection === "gamification" && <GamificationPage />}
          {activeSection === "profile" && <ProfileSection />}
          {activeSection === "settings" && <SettingsPage />} {/* ← DODANO */}
        </main>
      </div>
    </div>
  );
}

export default StudentPage;