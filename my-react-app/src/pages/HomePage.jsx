import { useState } from "react";
import SearchBar from "../components/SearchBar.jsx";

import PopularMealContent from "../components/PopularMealContent.jsx";
import MainRecipeContent from "../components/MainRecipeContent.jsx";
import CreateOwnMealContent from "../components/CreateOwnMealContent.jsx";

function HomePage() {
  const [activeTab, setActiveTab] = useState("popular");
  const [currentLang, setCurrentLang] = useState("EN");
  const [langOpen, setLangOpen] = useState(false);
  return (
    <main>
      <div className="main1stChild">
        <div className="recipeEmpty">Recipes</div>

        {/* Tabs */}
        <div className="mainNavBtns">
          <div
            className={`mainRecipeBtn ${activeTab === "main" ? "active" : ""}`}
            onClick={() => setActiveTab("main")}
          >
            Main Recipe
          </div>

          <div
            className={`popularMeal ${activeTab === "popular" ? "active" : ""}`}
            onClick={() => setActiveTab("popular")}
          >
            Popular Meals
          </div>

          <div
            className={`createOwnMeal ${activeTab === "create" ? "active" : ""}`}
            onClick={() => setActiveTab("create")}
          >
            Create Own Meal
          </div>
        </div>

        <SearchBar />

        {/* Content */}
        {activeTab === "popular" && <PopularMealContent />}
        {activeTab === "main" && <MainRecipeContent />}
        {activeTab === "create" && <CreateOwnMealContent />}
      </div>
    </main>
  );
}

export default HomePage;
