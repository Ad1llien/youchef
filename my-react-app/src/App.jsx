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

  /* 🍔 mobile menu */
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  /* ❌ закрытие dropdown */
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

        {/* DESKTOP NAV */}
        <nav className="nav-buttons desktop-nav">
          <div>Recipe</div>
          <div>Premium</div>
          <div>Contact</div>
          <button className="loginBtn">Log In</button>
        </nav>

        {/* MOBILE HEADER */}
        <div className="mobile-header">
          <button className="loginBtn">Log In</button>
          <button
            className="burger"
            onClick={() => setMobileMenuOpen(prev => !prev)}
          >
            ☰
          </button>
        </div>
      </header>

      {/* MOBILE SLIDE MENU */}
      {mobileMenuOpen && (
        <div
          className="mobile-slide-menu"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div>Recipe</div>
          <div>Premium</div>
          <div>Contact</div>
        </div>
      )}

      {/* ================= MAIN ================= */}
      <main>
        <Routes>

          <Route
            path="/"
            element={
              <div className="main1stChild">

                <div className="recipeEmpty">Recipes</div>

                <div className="mainNavBtns">
                  <div
                    className={activeTab === "main" ? "active" : ""}
                    onClick={() => setActiveTab("main")}
                  >
                    Main Recipe
                  </div>

                  <div
                    className={activeTab === "popular" ? "active" : ""}
                    onClick={() => setActiveTab("popular")}
                  >
                    Popular Meals
                  </div>

                  <div
                    className={activeTab === "create" ? "active" : ""}
                    onClick={() => setActiveTab("create")}
                  >
                    Create Own Meal
                  </div>
                </div>

                <div className="container-search">
                  <div className="search-wrapper" ref={searchRef}>
                    <input
                      className="search-input"
                      placeholder="Which meal you want?"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <button className="search-btn">
                      <img src={searchIcon} alt="Search" />
                    </button>

                    {searchResults.length > 0 && (
                      <div className="searchDropdown">
                        {searchResults.map(meal => (
                          <div
                            key={meal.idMeal}
                            className="searchItem"
                            onClick={() => {
                              setSearchQuery("");
                              setSearchResults([]);
                              navigate(`/meal/${meal.idMeal}`);
                            }}
                          >
                            <img src={meal.strMealThumb} alt="" />
                            <span>{meal.strMeal}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {searchLoading && <div>Searching...</div>}
                  </div>
                </div>

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

          <Route
            path="/pot"
            element={
              <PotPage
                checkPot={checkPot}
                setCheckPot={setCheckPot}
              />
            }
          />

          <Route path="/meal/:id" element={<MealPage />} />
          <Route path="/search-results" element={<SearchResultsPage />} />

        </Routes>
      </main>

      {/* ================= FOOTER ================= */}
      <footer>
        <img className="line5" src={footlines} alt="" />

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
  );
}

export default AppWrapper;