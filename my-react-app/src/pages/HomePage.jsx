import { useState } from "react";
import searchIcon from "../icons/search-2-line.svg";

import PopularMealContent from "../components/PopularMealContent.jsx";
import MainRecipeContent from "../components/MainRecipeContent.jsx";
import CreateOwnMealContent from "../components/CreateOwnMealContent.jsx";

function HomePage() {
  const [activeTab, setActiveTab] = useState("popular");

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

        {/* Search */}
        <div className="container-search">
          <div className="search-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Which meal you want? Search it!"
            />
            <button className="search-btn">
              <img src={searchIcon} alt="Search" />
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === "popular" && <PopularMealContent />}
        {activeTab === "main" && <MainRecipeContent />}
        {activeTab === "create" && <CreateOwnMealContent />}
      </div>
    </main>
  );
}

export default HomePage;
