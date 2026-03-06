import { useEffect, useState } from "react";
import "../styles/popularMeal.css";
import { useNavigate } from "react-router-dom";
import "../styles/mealCard.css";
import mealPhoto from "../icons/BAU.svg";

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
    setActiveFilter(null);
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
              {currentMeals.map((meal) => (
                <div
                  className="mealCard"
                  key={meal.idMeal}
                  onClick={() => navigate(`/meal/${meal.idMeal}`)}
                >
                  <img src={meal.strMealThumb} alt={meal.strMeal} />
                  <div className="cardTitle">
                    {meal.strMeal.length > 6
                      ? meal.strMeal.slice(0, 6) + "..."
                      : meal.strMeal}
                  </div>
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

      <div className="photoContainer">
      <img src={mealPhoto} alt="Meal preview" />
      </div>
    </div>
  );
}

export default PopularMealContent;
