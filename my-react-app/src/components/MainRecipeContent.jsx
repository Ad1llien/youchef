import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import hybridMeals from "../mealsDB.json"
import "../styles/mainRecipe.css";

import halalLogo from "../icons/hugeicons_halal.svg";
import veganLogo from "../icons/lucide_vegan.svg";
import codeChef from "../icons/simple-icons_codechef.svg";
import arrowDown from "../icons/arrow-down-s-line.svg";
import CategoryFilter from "./CategoryFilter.jsx";
import MealCardGrid from "./MealCardGrid.jsx";
import Pagination from "./Pagination.jsx";

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
        const merged = mergeMeals(data.meals || []);
        setAllMeals(merged);
        setLoading(false);
      });
  };
  // 🔹 Загрузка блюд по стране
  const loadMealsByCountry = (country) => {
    setLoading(true);
    setActiveFilter(country);
    setCurrentPage(1);
  
    fetch(`https://www.themealdb.com/api/json/v2/65232507/filter.php?a=${country}`)
      .then(res => res.json())
      .then(data => {
        const apiMeals = data.meals || [];
  
        // 🔥 фильтруем локальные блюда
        const localMeals = (hybridMeals.meals || []).filter(
          meal => meal.strArea === country
        );
  
        const merged = mergeMeals([...apiMeals, ...localMeals]);
  
        setAllMeals(merged);
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
        const apiMeals = data.meals || [];
        let localMeals = hybridMeals.meals || [];
  
        // 🔥 ВАЖНО: фильтрация локальных
        if (category === "Vegan") {
          localMeals = localMeals.filter(meal =>
            !meal.tags?.includes("meat") &&
            !meal.tags?.includes("beef") &&
            !meal.tags?.includes("chicken")
          );
        } else {
          localMeals = localMeals.filter(
            meal => meal.strCategory === category
          );
        }
  
        const merged = mergeMeals([...apiMeals, ...localMeals]);
  
        setAllMeals(merged);
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
      .then(data => {
        const apiCountries = data.meals || [];
  
        // ➕ добавляем Казахстан вручную
        const hasKazakhstan = apiCountries.some(
          c => c.strArea === "Kazakhstan"
        );
  
        if (!hasKazakhstan) {
          apiCountries.push({ strArea: "Kazakhstan" });
        }
  
        setCountries(apiCountries);
      });
  }, []);
  const totalPages = Math.ceil(allMeals.length / MEALS_PER_PAGE);

  const currentMeals = allMeals.slice(
    (currentPage - 1) * MEALS_PER_PAGE,
    currentPage * MEALS_PER_PAGE
  );

  const handleTopFilterSelect = (value) => {
    if (value === "default") {
      loadDefaultMeals();
    } else {
      loadFilteredMeals(value);
    }
  };


  const mergeMeals = (apiMeals = []) => {
    const map = new Map();
    const localMeals = hybridMeals.meals || [];
  
    // 🔹 сначала API
    apiMeals.forEach(meal => {
      map.set(meal.idMeal, meal);
    });
  
    // 🔹 потом локальные (перезаписывают API если совпадает id)
    localMeals.forEach(meal => {
      map.set(meal.idMeal, meal);
    });
  
    return Array.from(map.values());
  };

  return (
    <>
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
              <div>Region</div>
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
        <div className="mainRecipeTopFilters flex justify-end w-full ">
        <CategoryFilter
          activeValue={activeFilter}
          onSelect={handleTopFilterSelect}
          options={[
            { label: "Vegan", value: "Vegan" },
            { label: "Halal", value: "Seafood" },
            { label: "From Chef", value: "Beef" },
          ]}
        />
        </div>
        {/* MEALS */}
        {loading ? (
          <div className="loader"></div>
        ) : (
          <MealCardGrid
            meals={currentMeals}
            onCardClick={(meal) => navigate(`/meal/${meal.idMeal}`)}
            titleMaxLength={15}
            variant="mainRecipe"
            useLongTitle
          />
        )}
      </div>
    </div>
    {!loading && (
      <div className="mainRecipePagination">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    )}
    </>
  );
}

export default MainRecipeContent;
