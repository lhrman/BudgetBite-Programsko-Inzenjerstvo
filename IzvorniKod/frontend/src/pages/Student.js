import React, { useState } from "react";
import Navbar from "../components/Creator/Dashboard/CreatorNavbar";
import Sidebar from "../components/Student/StudentSidebar";
import PublicArchiveSection from "./Recipes";
import QuestionnaireSection from "../components/Student/PrehrambeniUpitnik";
import MealPlanSection from "../components/Student/MealPlanPage";
import FoodMoodJournal from "../components/Student/FoodMoodJournal";
import ProfileSection from "../components/Student/StudentProfile";
import GamificationPage from "../components/Student/Gamification/GamificationPage";
import SettingsPage from "../components/Settings/SettingsPage";
import NotificationsPanel from "../components/Student/NotificationsPanel";
import RecipeView from "./RecipeView";
import "../styles/global.css";

function StudentPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);

  return (
    <div>
      <Navbar showLinks={false} />
      <div className="dashboard-container">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        

        <main className="main-content">
          {activeSection === "overview" && (<PublicArchiveSection
            onOpenRecipe={(id) => {
              setSelectedRecipeId(id);
              setActiveSection("recipeview");
          }}/>)}
          {activeSection === "questionnaire" && <QuestionnaireSection />}
          {activeSection === "mealplan" && <MealPlanSection />}
          {activeSection === "foodmood" && <FoodMoodJournal />}
          {activeSection === "gamification" && <GamificationPage />}
          {activeSection === "profile" && <ProfileSection />}
          {activeSection === "settings" && <SettingsPage />} 
          {activeSection === "notifications" && <NotificationsPanel />}
          {activeSection === "recipeview" && ( <RecipeView embedded recipeId={selectedRecipeId} />)}

        </main>
      </div>
    </div>
  );
}

export default StudentPage;