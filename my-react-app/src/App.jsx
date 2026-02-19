import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import youChefLogo from "./logos/logo.png";
import searchIcon from "./icons/search-2-line.png";
import "./App.css";
import MealPage from "./components/MealPage";
import instagramIcon from "./icons/instagram.png";
import telegramIcon from "./icons/telegram.png";
import tiktokIcon from "./icons/filled.png";
import footlines from "./icons/footerlines.svg";

import PopularMealContent from "./components/PopularMealContent";
import MainRecipeContent from "./components/MainRecipeContent";
import CreateOwnMealContent from "./components/CreateOwnMealContent";
const theMealDBPIKey = '65232507';

function App() {
  const [activeTab, setActiveTab] = useState("popular");

  return (
    <BrowserRouter>
      <div className="App">
        {/* HEADER */}
        <header className="app-header">
          <img src={youChefLogo} alt="Logo" className="logo" />
          <nav className="nav-buttons">
            <div className="recipeBtn">Recipe</div>
            <div className="premiumBtn">Premium</div>
            <div className="contactBtn">Contact</div>
            <button className="loginBtn">Log In</button>
          </nav>
        </header>

        <main>
          <Routes>
            {/* ГЛАВНАЯ СТРАНИЦА */}
            <Route
              path="/"
              element={
                <div className="main1stChild">
                  <div className="recipeEmpty">Recipes</div>

                  {/* КНОПКИ */}
                  <div className="mainNavBtns">
                    <div
                      className={`mainRecipeBtn ${
                        activeTab === "main" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("main")}
                    >
                      Main Recipe
                    </div>

                    <div
                      className={`popularMeal ${
                        activeTab === "popular" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("popular")}
                    >
                      Popular Meals
                    </div>

                    <div
                      className={`createOwnMeal ${
                        activeTab === "create" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("create")}
                    >
                      Create Own Meal
                    </div>
                  </div>

                  {/* SEARCH */}
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

                  {/* КОНТЕНТ */}
                  {activeTab === "popular" && <PopularMealContent />}
                  {activeTab === "main" && <MainRecipeContent />}
                  {activeTab === "create" && <CreateOwnMealContent />}
                </div>
              }
            />

            {/* СТРАНИЦА БЛЮДА */}
            <Route path="/meal/:id" element={<MealPage />} />
          </Routes>
        </main>

        {/* FOOTER */}
        <footer>
          <div className="lines">
            <img className="line5" src={footlines} alt="" />
          </div>

          <div className="footerText">
            <div className="makeUs">Make us a part of your lifestyle</div>
            <div className="tasteIn">
              A taste of home <br /> in every dish
            </div>
          </div>

          <div className="socialLogos">
            <img src={instagramIcon} alt="" />
            <img src={telegramIcon} alt="" />
            <img src={tiktokIcon} alt="" />
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
