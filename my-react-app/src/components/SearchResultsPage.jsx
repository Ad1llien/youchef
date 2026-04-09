import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/searchResults.css";
import lineSVG from "../icons/Line36.svg";
import hybridMeals from "../mealsDB.json"; // путь поправь под свой проект
function SearchResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedIngredients = location.state?.checkPot || [];
  const clearAllIngredients = () => {
    localStorage.removeItem("checkPot");
    navigate(-1); // или navigate("/") если хочешь на главную
  };
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedIngredients.length === 0) {
      setMeals([]);
      setLoading(false);
      return;
    }
  
    const fetchMeals = async () => {
      try {
        // 🔹 API-блюда
        const res = await fetch(
          "https://www.themealdb.com/api/json/v2/65232507/search.php?s="
        );
        const data = await res.json();
        const apiMeals = (data.meals || []).map((meal) => {
          const ingredients = [];
          for (let i = 1; i <= 20; i++) {
            const ing = meal[`strIngredient${i}`];
            if (ing && ing.trim() !== "") ingredients.push(ing.trim());
          }
          return { ...meal, ingredients };
        });
  
        // 🔹 Локальные блюда (собираем ингредиенты из strIngredient1-20)
        const localMeals = (hybridMeals.meals || []).map((meal) => {
          const ingredients = [];
          for (let i = 1; i <= 20; i++) {
            const ing = meal[`strIngredient${i}`];
            if (ing && ing.trim() !== "") ingredients.push(ing.trim());
          }
          return { ...meal, ingredients };
        });
  
        // 🔹 Объединяем API и локальные
        const allMeals = [...apiMeals, ...localMeals];
  
        // 🔹 Считаем совпадения по выбранным ингредиентам
        const matchedMeals = allMeals
          .map((meal) => {
            const matches = meal.ingredients.filter((ing) =>
              selectedIngredients.some((sel) =>
                ing.toLowerCase().includes(sel.toLowerCase())
              )
            );
            const matchPercent = Math.round(
              (matches.length / meal.ingredients.length) * 100
            );
            return { ...meal, matchPercent };
          })
          .filter((meal) => meal.matchPercent >= 20)
          .sort((a, b) => b.matchPercent - a.matchPercent);
  
        setMeals(matchedMeals);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setMeals([]);
        setLoading(false);
      }
    };
  
    fetchMeals();
  }, [selectedIngredients]);

  if (loading) return <p style={{ textAlign: "center" }}>Loading meals...</p>;

  return (
    <div className="searchResultsPageWrapper">
      {/* Back button слева */}
      <div className="backBtnWrapper">
        <button className="backBtn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <button className="backBtn clearBtn" onClick={clearAllIngredients}>
          Clear all
        </button>
      </div>

      {/* Заголовок по центру */}
      <h2 className="resultsTitle">Result</h2>

      {/* Линия на всю ширину */}
      <div className="lineFull">
        <img src={lineSVG} alt="" />
      </div>

      {/* Большой контейнер */}
      <div className="mealsContainer">
        {/* Шапка */}
        <div className="mealHeader">
          <span className="mealHeaderNames">ID</span>
          <span className="mealHeaderNames">Name</span>
          <span className="mealHeaderNames">Matching %</span>
        </div>

        {/* Список с прокруткой */}
        <div className="mealsList">
          {meals.length === 0 ? (
            <p style={{ textAlign: "center", marginTop: "20px" }}>
              No matching recipes 😔
            </p>
          ) : (
            meals.map((meal, idx) => (
              <div
                key={meal.idMeal}
                className="mealRow"
                onClick={() => navigate(`/meal/${meal.idMeal}`)}
              >
                <span className="mealIndex">{idx + 1}</span>
                <span className="mealName">{meal.strMeal}</span>
                <span className="mealMatch">{meal.matchPercent}%</span>
              </div>
            ))
          )}
        </div>
        <div className="lineWrapper">
            <div className="centerLine"></div>
          </div>

          <div className="searchingQuestion">
            Don’t see what you’re looking for?
          </div>

          <div className="expandTitle">
            YouChef is always looking to expand their recipes catalogue. Request a recipe and we’ll do our best to help
          </div>

          <button className="requestRecipe" onClick={() => navigate("/request-recipe")}>Request Recipe</button>
      </div>
    </div>
  );
}

export default SearchResultsPage;