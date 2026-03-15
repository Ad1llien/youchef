import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/popularMeal.css";
import blueFav from '../icons/blueFav.svg';
import "../styles/mealPage.css";
import youtubeLogo from '../icons/youtube.svg';
import line from '../icons/Line36.svg';
import Calculator from '../icons/Group135.svg';
import warn from '../icons/information-fill.svg';

function MealPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });

  const [checkPot, setCheckPot] = useState(() => {
    const saved = localStorage.getItem("checkPot");
    return saved ? JSON.parse(saved) : [];
  });

  const [videoId, setVideoId] = useState(null);

  useEffect(() => {
    const loadMeal = async () => {
      setLoading(true);
      try {
        const mealRes = await fetch(
          `https://www.themealdb.com/api/json/v2/65232507/lookup.php?i=${id}`
        );
        const mealData = await mealRes.json();
        const currentMeal = mealData.meals?.[0] || null;
        setMeal(currentMeal);

        if (currentMeal?.strYoutube) {
          const videoId = currentMeal.strYoutube.split("v=")[1];
          setVideoId(videoId);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMeal();
  }, [id]);

  const toggleFavorite = () => {
    if (!meal) return;

    const isAlready = favorites.find(f => f.idMeal === meal.idMeal);

    let updated;

    if (isAlready) {
      updated = favorites.filter(f => f.idMeal !== meal.idMeal);
    } else {
      updated = [...favorites, meal];
    }

    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  if (loading) {
    return (
      <div className="loaderContainer">
        <div className="loader"></div>
      </div>
    );
  }

  if (!meal) {
    return <div>Meal not found</div>;
  }

  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim() !== "") {
      ingredients.push({ ingredient, measure });
    }
  }

  const isFavorite = favorites.some(f => f.idMeal === meal.idMeal);

  return (
    <div className="mealPage">
      <div className="headerBegin">
        <button className="backBtn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="nameFoodTitle">{meal.strMeal}</div>
        <div className="favoriteIcon" onClick={toggleFavorite}>
          <img
            src={blueFav}
            alt="favorite"
            style={{ opacity: isFavorite ? 1 : 0.4 }}
          />
        </div>
      </div>

      {/* Остальной код без изменений */}
      <div className="imgWrapper">
        <img src={line} alt="" />
      </div>
      <div className="infoWrapper">
        <div className="youtubeLink">
          <img src={youtubeLogo} alt="YouTube" />
          <div className="youtubeText">
            <div>There is a video on YouTube link</div>
            {meal.strYoutube && (
              <a
                href={meal.strYoutube}
                target="_blank"
                rel="noreferrer"
                className="youtubeRecipeLink"
              >
                How to cook this {meal.strMeal}
              </a>
            )}
          </div>
        </div>
        <div className="calculationWrapper">
          <div className="topCalc">
            <img className="caloriesCalculator" src={Calculator} alt="Calories calculator" />
            <div className="calcInfos">
              <div className="nutritionRow">
                <div className="nutritionItem">
                  <div className="nutritionValue">63 Cal</div>
                  <div className="nutritionLabel">Calories</div>
                </div>
                <div className="nutritionItem">
                  <div className="nutritionValue">13.2 g</div>
                  <div className="nutritionLabel">Carbs</div>
                </div>
                <div className="nutritionItem">
                  <div className="nutritionValue">20 g</div>
                  <div className="nutritionLabel">Protein</div>
                </div>
                <div className="nutritionItem">
                  <div className="nutritionValue">0.3 g</div>
                  <div className="nutritionLabel">Fat</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="limitWrapper">
        <div className="img">
          <img src={warn} alt="" />
        </div>
        <div> Free limit reached</div>
        <div className="limitText">
          You used 3/3 AI calorie calculations
        </div>
        <div className="upgrade">
          Upgrade to Premium
        </div>
        <div>
          X
        </div>
      </div>

      <div className="mainContent">
        <div className="firstRow">
          <div className="image">
            <img src={meal.strMealThumb} alt={meal.strMeal} />
          </div>
          <div className="ingredientsList">
            <div className="ingredientsTitle">Ingredients</div>
            <div className="ingredientsContainer">
              {ingredients.map((item, index) => (
                <div key={index} className="ingredientRow">
                  <li className="ingredientName">{item.ingredient + " "}</li>
                  <span className="ingredientMeasure">{" " + item.measure}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="secondRow">{meal.strInstructions}</div>
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

      <button className="requestRecipe">Request Recipe</button>
    </div>
  );
}

export default MealPage;