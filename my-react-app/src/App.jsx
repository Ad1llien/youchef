import { useState, useEffect, useRef } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate
} from "react-router-dom";

import youChefLogo from "./logos/logo.png";
import searchIcon from "./icons/search-2-line.png";
import "./App.css";

import MealPage from "./components/MealPage";
import PotPage from "./components/PotPage";
import PopularMealContent from "./components/PopularMealContent";
import MainRecipeContent from "./components/MainRecipeContent";
import CreateOwnMealContent from "./components/CreateOwnMealContent";
import SearchResultsPage from "./components/SearchResultsPage";

import instagramIcon from "./icons/instagram.png";
import telegramIcon from "./icons/telegram.png";
import tiktokIcon from "./icons/filled.png";
import footlines from "./icons/footerlines.svg";

/* ================= APP WRAPPER ================= */
function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

/* ================= APP ================= */
function App() {
  const navigate = useNavigate();

  /* 🫕 кастрюля */
  const [checkPot, setCheckPot] = useState(() => {
    const saved = localStorage.getItem("checkPot");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("checkPot", JSON.stringify(checkPot));
  }, [checkPot]);

  /* 📂 вкладки */
  const [activeTab, setActiveTab] = useState("popular");

  /* 🔍 поиск */
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  /* 📌 ref для dropdown */
  const searchRef = useRef(null);

  /* 🔄 debounce search */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(
          `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchQuery}`
        );
        const data = await res.json();
        setSearchResults(data.meals ? data.meals.slice(0, 10) : []);
      } catch (err) {
        console.error(err);
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  /* ❌ закрытие dropdown при клике вне */
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchResults([]);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="App">
      {/* ================= HEADER ================= */}
      <header className="app-header">
        <img src={youChefLogo} alt="YouChef Logo" className="logo" />

        <nav className="nav-buttons">
          <div>Recipe</div>
          <div>Premium</div>
          <div>Contact</div>
          <button className="loginBtn">Log In</button>
        </nav>
      </header>

      {/* ================= MAIN ================= */}
      <main>
        <Routes>
          {/* HOME */}
          <Route
            path="/"
            element={
              <div className="main1stChild">
                <div className="recipeEmpty">Recipes</div>

                {/* Tabs */}
                <div className="mainNavBtns">
                  <div
                    className={`mainRecipeBtn ${activeTab === "main" ? "active" : ""}`}
                    onClick={() => {
                      setActiveTab("main");
                      setSearchResults([]);
                      setSearchQuery("");
                    }}
                  >
                    Main Recipe
                  </div>

                  <div
                    className={`popularMeal ${activeTab === "popular" ? "active" : ""}`}
                    onClick={() => {
                      setActiveTab("popular");
                      setSearchResults([]);
                      setSearchQuery("");
                    }}
                  >
                    Popular Meals
                  </div>

                  <div
                    className={`createOwnMeal ${activeTab === "create" ? "active" : ""}`}
                    onClick={() => {
                      setActiveTab("create");
                      setSearchResults([]);
                      setSearchQuery("");
                    }}
                  >
                    Create Own Meal
                  </div>
                </div>

                {/* Search */}
                <div className="container-search">
                  <div className="search-wrapper" ref={searchRef}>
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Which meal you want? Search it!"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <button className="search-btn">
                      <img src={searchIcon} alt="Search" />
                    </button>

                    {/* Dropdown */}
                    {searchResults.length > 0 && (
                      <div className="searchDropdown">
                        {searchResults.map((meal) => (
                          <div
                            key={meal.idMeal}
                            className="searchItem"
                            onClick={() => {
                              setSearchQuery("");
                              setSearchResults([]);
                              navigate(`/meal/${meal.idMeal}`);
                            }}
                          >
                            <img src={meal.strMealThumb} alt={meal.strMeal} />
                            <span>{meal.strMeal}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {searchLoading && (
                      <div className="searchLoading">Searching...</div>
                    )}
                  </div>
                </div>

                {/* Content */}
                {activeTab === "popular" && <PopularMealContent />}
                {activeTab === "main" && <MainRecipeContent />}
                {activeTab === "create" && (
                  <CreateOwnMealContent
                    checkPot={checkPot}
                    setCheckPot={setCheckPot}
                  />
                )}
              </div>
            }
          />

          {/* POT */}
          <Route
            path="/pot"
            element={
              <PotPage
                checkPot={checkPot}
                setCheckPot={setCheckPot}
              />
            }
          />

          {/* MEAL PAGE */}
          <Route path="/meal/:id" element={<MealPage />} />

          {/* SEARCH RESULTS */}
          <Route
            path="/search-results"
            element={<SearchResultsPage />}
          />
        </Routes>
      </main>

      {/* ================= FOOTER ================= */}
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
          <img src={instagramIcon} alt="Instagram" />
          <img src={telegramIcon} alt="Telegram" />
          <img src={tiktokIcon} alt="TikTok" />
        </div>
      </footer>
    </div>
  );
}

export default AppWrapper;