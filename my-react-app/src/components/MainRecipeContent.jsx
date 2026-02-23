import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/mainRecipe.css";
import "../styles/mealCard.css";

import halalLogo from "../icons/hugeicons_halal.svg";
import veganLogo from "../icons/lucide_vegan.svg";
import codeChef from "../icons/simple-icons_codechef.svg";
import arrowDown from "../icons/arrow-down-s-line.svg";

function MainRecipeContent() {
  const navigate = useNavigate();

  const [allMeals, setAllMeals] = useState([]);
  const [visibleCount, setVisibleCount] = useState(24);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("default");

  const [dishOpen, setDishOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);

  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);

  // 🔹 Загрузка блюд по дефолту
  useEffect(() => {
    loadDefaultMeals();
  }, []);

  const loadDefaultMeals = () => {
    setLoading(true);
    setActiveFilter("default");
    setVisibleCount(24);

    fetch("https://www.themealdb.com/api/json/v2/65232507/search.php?s=")
      .then(res => res.json())
      .then(data => {
        setAllMeals(data.meals || []);
        setLoading(false);
      });
  };
  // 🔹 Загрузка блюд по стране
const loadMealsByCountry = (country) => {
  setLoading(true);
  setActiveFilter(country);
  setVisibleCount(24);

  fetch(
    `https://www.themealdb.com/api/json/v2/65232507/filter.php?a=${country}`
  )
    .then(res => res.json())
    .then(data => {
      setAllMeals(data.meals || []);
      setLoading(false);
    });
};

  // 🔹 Загрузка блюд по категориям
  const loadFilteredMeals = (category) => {
    setLoading(true);
    setActiveFilter(category);
    setVisibleCount(24);

    fetch(`https://www.themealdb.com/api/json/v2/65232507/filter.php?c=${category}`)
      .then(res => res.json())
      .then(data => {
        setAllMeals(data.meals || []);
        setLoading(false);
      });
  };

  // 🔹 Категории (Dish Type)
  useEffect(() => {
    fetch("https://www.themealdb.com/api/json/v2/65232507/list.php?c=list")
      .then(res => res.json())
      .then(data => setCategories(data.meals || []));
  }, []);

  // 🔹 Страны (Countries)
  useEffect(() => {
    fetch("https://www.themealdb.com/api/json/v2/65232507/list.php?a=list")
      .then(res => res.json())
      .then(data => setCountries(data.meals || []));
  }, []);

  const visibleMeals = allMeals.slice(0, visibleCount);

  const formatTitle = (title) => {
    return title.length > 15 ? title.slice(0, 15) + "..." : title;
  };

  return (
    <div className="mainRecipeWrapper">

      {/* LEFT FILTER PANEL */}
      <div className="sideRecipeFilter">
        <div className="types">

          {/* DISH TYPE */}
          <div className="dishType">
            <div className="q1st"   onClick={() => setDishOpen(!dishOpen)}>
              <div>Dish Type</div>
              <img
                src={arrowDown}
                className={dishOpen ? "arrow open" : "arrow"}
                alt=""
              />
            </div>

            {dishOpen && (
              <div className="filterList">
                {categories.map(item => (
                  <div
                    key={item.strCategory}
                    className={`filterItem ${
                      activeFilter === item.strCategory ? "active" : ""
                    }`}
                    onClick={() => loadFilteredMeals(item.strCategory)}
                  >
                    {item.strCategory}
                  </div>
                ))}
              </div>
            )}
            <div className="divider" />
          </div>

          {/* COUNTRIES */}
          <div className="religions">
            <div className="q2st" onClick={() => setCountryOpen(!countryOpen)}>
              <div>Countries</div>
              <img
                src={arrowDown}
                className={countryOpen ? "arrow open" : "arrow"}
                alt=""
              />
            </div>

            {countryOpen && (
              <div className="filterList">
                {countries.map(item => (
  <div
    key={item.strArea}
    className={`filterItem ${
      activeFilter === item.strArea ? "active" : ""
    }`}
    onClick={() => loadMealsByCountry(item.strArea)}
  >
    {item.strArea}
  </div>
))}
              </div>
            )}
            <div className="divider" />
          </div>
        </div>

        {/* SPECIAL FILTER BOX */}
        <div className="specialFilterBox">
          <div className="halal" onClick={() => loadFilteredMeals("Seafood")}>
            <img src={halalLogo} alt="" />
            <div>Halal</div>
          </div>
          <div className="halal" onClick={() => loadFilteredMeals("Vegan")}>
            <img src={veganLogo} alt="" />
            <div>Vegan</div>
          </div>
          <div className="halal" onClick={() => loadFilteredMeals("Beef")}>
            <img src={codeChef} alt="" />
            <div>From Chef</div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="cardsWrapper">

        {/* TOP FILTER BUTTONS */}
        <div className="popularMealFilter">
          <button
            className={activeFilter === "Vegan" ? "active" : ""}
            onClick={() => loadFilteredMeals("Vegan")}
          >
            Vegan
          </button>

          <button
            className={activeFilter === "Seafood" ? "active" : ""}
            onClick={() => loadFilteredMeals("Seafood")}
          >
            Halal
          </button>

          <button
            className={activeFilter === "Beef" ? "active" : ""}
            onClick={() => loadFilteredMeals("Beef")}
          >
            From Chef
          </button>
        </div>

        {/* MEALS */}
        {loading ? (
          <div className="loader"></div>
        ) : (
          <>
            <div className="popularMealList">
              {visibleMeals.map(meal => (
                <div
                  key={meal.idMeal}
                  className="mealCard"
                  onClick={() => navigate(`/meal/${meal.idMeal}`)}
                >
                  <img src={meal.strMealThumb} alt={meal.strMeal} />
                  <div className="textName">{formatTitle(meal.strMeal)}</div>
                </div>
              ))}
            </div>

            {/* LOAD MORE BUTTON */}
            {visibleCount < allMeals.length && (
              <div className="loadMoreWrapper">
                <button
                  className="loadMoreBtn"
                  onClick={() => setVisibleCount(prev => prev + 24)}
                >
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MainRecipeContent;
