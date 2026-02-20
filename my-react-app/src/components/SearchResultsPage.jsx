import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/searchResults.css";

function SearchResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedIngredients = location.state?.checkPot || [];

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
        const res = await fetch("https://www.themealdb.com/api/json/v2/65232507/search.php?s=");
        const data = await res.json();

        if (!data.meals) {
          setMeals([]);
          setLoading(false);
          return;
        }

        // Формируем массив ингредиентов для каждого блюда
        const allMeals = data.meals.map((meal) => {
          const ingredients = [];
          for (let i = 1; i <= 20; i++) {
            const ing = meal[`strIngredient${i}`];
            if (ing && ing.trim() !== "") ingredients.push(ing.trim());
          }
          return { ...meal, ingredients };
        });

        // Считаем совпадения (нестрого)
        const matchedMeals = allMeals
          .map((meal) => {
            const matches = meal.ingredients.filter((ing) =>
              selectedIngredients.some((sel) =>
                ing.toLowerCase().includes(sel.toLowerCase())
              )
            );
            const matchPercent = Math.round((matches.length / meal.ingredients.length) * 100);
            return { ...meal, matchPercent };
          })
          .filter((meal) => meal.matchPercent >= 20) // минимальное совпадение 20%
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
    <div className="searchResultsWrapper">
      <button className="backBtn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h2 className="resultsTitle">
        Recipes you can make with your selected ingredients
      </h2>

      {meals.length === 0 ? (
        <p style={{ textAlign: "center" }}>No matching recipes found 😔</p>
      ) : (
        <div className="recipesList">
          {meals.map((meal) => (
            <div
              key={meal.idMeal}
              className="recipeCard"
              onClick={() => navigate(`/meal/${meal.idMeal}`)}
              style={{ cursor: "pointer" }}
            >
              <h3>{meal.strMeal}</h3>
              <p>Match: {meal.matchPercent}%</p>
              <p>Ingredients: {meal.ingredients.join(", ")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchResultsPage;