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

  const MEALS_PER_PAGE = 9;

  const [allMeals, setAllMeals] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
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
    setCurrentPage(1);

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
  setCurrentPage(1);

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
    setCurrentPage(1);

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

  const totalPages = Math.ceil(allMeals.length / MEALS_PER_PAGE);

  const currentMeals = allMeals.slice(
    (currentPage - 1) * MEALS_PER_PAGE,
    currentPage * MEALS_PER_PAGE
  );

  const getPageItems = () => {
    if (totalPages <= 1) return [];

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, idx) => ({
        type: "page",
        value: idx + 1,
      }));
    }

    const items = [];
    items.push({ type: "page", value: 1 });

    let left = currentPage - 1;
    let right = currentPage + 1;

    if (currentPage <= 3) {
      left = 2;
      right = 4;
    } else if (currentPage >= totalPages - 2) {
      left = totalPages - 3;
      right = totalPages - 1;
    }

    if (left > 2) {
      items.push({ type: "ellipsis", key: "left" });
    }

    for (let page = left; page <= right; page += 1) {
      if (page > 1 && page < totalPages) {
        items.push({ type: "page", value: page });
      }
    }

    if (right < totalPages - 1) {
      items.push({ type: "ellipsis", key: "right" });
    }

    items.push({ type: "page", value: totalPages });

    return items;
  };

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

        {/* TOP FILTER BUTTONS — только этот ряд скроллится по X */}
        <div className="popularMealFilter mainRecipeCategories">
          <div className="categories">
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
        </div>

        {/* MEALS */}
        {loading ? (
          <div className="loader"></div>
        ) : (
          <>
            <div className="popularMealList mainRecipeCardsGrid">
              {currentMeals.map(meal => (
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

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="loadMoreWrapper">
                <div className="pagination">
                  <button
                    className="pageArrow"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage(prev => (prev > 1 ? prev - 1 : prev))
                    }
                  >
                    «
                  </button>

                  {getPageItems().map(item =>
                    item.type === "page" ? (
                      <button
                        key={item.value}
                        className={`pageBtn ${
                          item.value === currentPage ? "active" : ""
                        }`}
                        onClick={() => setCurrentPage(item.value)}
                      >
                        {item.value}
                      </button>
                    ) : (
                      <span key={item.key} className="pageDots">
                        ...
                      </span>
                    )
                  )}

                  <button
                    className="pageArrow"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage(prev =>
                        prev < totalPages ? prev + 1 : prev
                      )
                    }
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MainRecipeContent;
