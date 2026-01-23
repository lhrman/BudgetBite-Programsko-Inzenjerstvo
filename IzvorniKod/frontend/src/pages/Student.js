import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Student/StudentSidebar";
import PublicArchiveSection from "./Recipes";
import QuestionnaireSection from "../components/Student/PrehrambeniUpitnik";
import MealPlanSection from "../components/Student/MealPlanPage";
import FoodMoodJournal from "../components/Student/FoodMoodJournal";
import WeeklyReflection from "../components/Student/WeeklyReflection";
import WeeklyExpenses from "../components/Student/WeeklyExpenses";
import ProfileSection from "../components/Student/StudentProfile";
import GamificationPage from "../components/Student/GamificationPage";
import SettingsPage from "../components/Settings/SettingsPage";
import RecipeView from "./RecipeView";
import "../styles/global.css";

function StudentPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [moodRecipe, setMoodRecipe] = useState(null);
  const [moodReturnRecipeId, setMoodReturnRecipeId] = useState(null);


  const openFoodMoodForRecipe = (recipe) => {
    // recipe: { id, title }
    setMoodRecipe(recipe);
    setMoodReturnRecipeId(recipe?.id ?? null);
    setActiveSection("foodmood");
  };

  const afterMoodSavedGoToArchive = () => {
    setMoodRecipe(null);
    setActiveSection("overview");
  };

  return (
    <div>
      <Navbar showLinks={false} />
      <div className="dashboard-container">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

        <main className="main-content">
          {activeSection === "overview" && (
            <PublicArchiveSection
              onOpenRecipe={(id) => {
                setSelectedRecipeId(id);
                setActiveSection("recipeview");
              }}
              onOpenFoodMoodJournal={openFoodMoodForRecipe}
            />
          )}

          {activeSection === "questionnaire" && <QuestionnaireSection />}

          {activeSection === "mealplan" && (
            <MealPlanSection
              onOpenRecipe={(id) => {
                setSelectedRecipeId(id);
                setActiveSection("recipeview");
              }}
              onOpenFoodMoodJournal={openFoodMoodForRecipe}
            />
          )}

         {activeSection === "foodmood" && (
            <FoodMoodJournal
              selectedRecipe={moodRecipe}
              onSaved={afterMoodSavedGoToArchive}
              onCancel={() => {
                const rid = moodReturnRecipeId;
                setMoodRecipe(null);
                setMoodReturnRecipeId(null);

                if (rid) {
                  setSelectedRecipeId(rid);
                  setActiveSection("recipeview");
                } else {
                  setActiveSection("overview");
                }
              }}
            />

          )}

          {activeSection === "reflection" && <WeeklyReflection />}
          {activeSection === "gamification" && <GamificationPage />}
          {activeSection === "profile" && <ProfileSection />}
          {activeSection === "settings" && <SettingsPage />}
          {activeSection === "expenses" && <WeeklyExpenses />}
          {activeSection === "recipeview" && (<RecipeView embedded recipeId={selectedRecipeId}
              onFinish={(recipe) => openFoodMoodForRecipe(recipe)}
              />
          )}

        </main>
      </div>
    </div>
  );
}

export default StudentPage;