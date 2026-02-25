import { useEffect, useState } from "react";
import "../styles/popularMeal.css";
import { useNavigate } from "react-router-dom";
import "../styles/mealCard.css";

const STORAGE_KEY = "popularMealFilter";

function PopularMealContent() {
  const [meals, setMeals] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [loading, setLoading] = useState(false);

  const [visibleCount, setVisibleCount] = useState(24); // 🔹 для Load More

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
    setActiveFilter(null);
    setVisibleCount(24);

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
    setVisibleCount(24);
    localStorage.setItem(STORAGE_KEY, category);

    fetch(`https://www.themealdb.com/api/json/v2/65232507/filter.php?c=${category}`)
      .then((res) => res.json())
      .then((data) => {
        setMeals(data.meals || []);
        setLoading(false);
      });
  };

  const visibleMeals = meals.slice(0, visibleCount); // 🔹 показываем только видимые

  return (
    <div className="popularMealContent">
      <div className="popularMealMainContainer">

        {/* FILTER BUTTONS (scroll horizontally only this row) */}
        <div className="popularMealFilter">
          <div className="categories">
            <button
              className={activeFilter === "Breakfast" ? "active" : ""}
              onClick={() => loadFilteredMeals("Breakfast")}
            >
              Breakfast
            </button>

            <button
              className={activeFilter === "Seafood" ? "active" : ""}
              onClick={() => loadFilteredMeals("Seafood")}
            >
              Lunch
            </button>

            <button
              className={activeFilter === "Beef" ? "active" : ""}
              onClick={() => loadFilteredMeals("Beef")}
            >
              Dinner
            </button>

            <button onClick={loadDefaultMeals}>
              From Chef
            </button>
          </div>
        </div>

        {/* MEALS */}
        {loading ? (
          <div className="loader"></div>
        ) : (
          <>
            <div className="mealGrid">
              {visibleMeals.map((meal) => (
                <div
                  className="mealCard"
                  key={meal.idMeal}
                  onClick={() => navigate(`/meal/${meal.idMeal}`)}
                >
                  <img src={meal.strMealThumb} alt={meal.strMeal} />
                  <div className="cardTitle">
                    {meal.strMeal.length > 15
                      ? meal.strMeal.slice(0, 15) + "..."
                      : meal.strMeal}
                  </div>
                </div>
              ))}
            </div>

            {/* LOAD MORE BUTTON */}
            {visibleCount < meals.length && (
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

      <div className="photoContainer">
        {/* future preview */}
      </div>
    </div>
  );
}

export default PopularMealContent;
