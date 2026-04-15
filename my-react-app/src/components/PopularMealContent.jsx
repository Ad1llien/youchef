import { useEffect, useState } from "react";
import "../styles/popularMeal.css";
import { useNavigate } from "react-router-dom";
import mealPhoto from "../icons/BAU.svg";
import CategoryFilter from "./CategoryFilter.jsx";
import MealCardGrid from "./MealCardGrid.jsx";
import Pagination from "./Pagination.jsx";

const STORAGE_KEY = "popularMealFilter";
const MEALS_PER_PAGE = 6;

function PopularMealContent() {
  const [meals, setMeals] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  // 🔹 Загрузка при открытии страницы
  useEffect(() => {
    const savedFilter = localStorage.getItem(STORAGE_KEY);
    if (savedFilter) {
      loadFilteredMeals(savedFilter);
    } else {
      loadDefaultMeals();
    }
  }, []);

  // 🔹 Дефолтные блюда
  const loadDefaultMeals = () => {
    setLoading(true);
    localStorage.removeItem(STORAGE_KEY);
    setActiveFilter("default");
    setCurrentPage(1);

    fetch("https://www.themealdb.com/api/json/v2/65232507/search.php?s=")
      .then((res) => res.json())
      .then((data) => {
        setMeals(data.meals || []);
        setLoading(false);
      });
  };

  // 🔹 Блюда по фильтру
  const loadFilteredMeals = (category) => {
    setLoading(true);
    setActiveFilter(category);
    setCurrentPage(1);
    localStorage.setItem(STORAGE_KEY, category);

    fetch(`https://www.themealdb.com/api/json/v2/65232507/filter.php?c=${category}`)
      .then((res) => res.json())
      .then((data) => {
        setMeals(data.meals || []);
        setLoading(false);
      });
  };

  const totalPages = Math.ceil(meals.length / MEALS_PER_PAGE);

  const currentMeals = meals.slice(
    (currentPage - 1) * MEALS_PER_PAGE,
    currentPage * MEALS_PER_PAGE
  );

  const handleFilterSelect = (value) => {
    if (value === "default") {
      loadDefaultMeals();
    } else {
      loadFilteredMeals(value);
    }
  };

  return (
    <div className="popularMealContent">
      <CategoryFilter
        activeValue={activeFilter}
        onSelect={handleFilterSelect}
        options={[
          { label: "Breakfast", value: "Breakfast" },
          { label: "Lunch", value: "Seafood" },
          { label: "Dinner", value: "Beef" },
          { label: "From Chef", value: "default" },
        ]}
      />
      <div className="popularMealBody">
        <div className="popularMealMainContainer">
          {/* MEALS */}
          {loading ? (
            <div className="loader"></div>
          ) : (
            <MealCardGrid
              meals={currentMeals}
              onCardClick={(meal) => navigate(`/meal/${meal.idMeal}`)}
              titleMaxLength={8}
              variant="popular"
            />
          )}
        </div>

        <div className="photoContainer">
          <img src={mealPhoto} alt="Meal preview" />
        </div>
      </div>
      {!loading && (
        <div className="popularMealPagination">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}

export default PopularMealContent;
