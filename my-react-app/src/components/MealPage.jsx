import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import "../styles/popularMeal.css";
import blueFav from '../icons/blueFav.svg';
import backIcon from "../icons/back.svg";
import "../styles/mealPage.css";
import youtubeLogo from '../icons/youtube.svg';
import line from '../icons/Line36.svg';
import Calculator from '../icons/Group135.svg';
import warn from '../icons/information-fill.svg';
import hybridMeals from "../mealsDB.json";
import API_BASE_URL from "../config/api";
import { useUser } from "../context/UserContext";
function MealPage() {
  const { id } = useParams();
  const userContext = useUser();
  const user = userContext?.user ?? null;
  const [nutrition, setNutrition] = useState(null);
  const [freeKbjuViewsUsed, setFreeKbjuViewsUsed] = useState(0);
  const [freeKbjuLimit, setFreeKbjuLimit] = useState(3);
  const [limitReached, setLimitReached] = useState(false);
  const [nutritionLoading, setNutritionLoading] = useState(false);

  const navigate = useNavigate();

  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });

  const loadSpecialFilter = (type) => {
    setLoading(true);
    setActiveFilter(type);
    setCurrentPage(1);
  
    // 🔹 локальные блюда
    const localMeals = hybridMeals.filter(meal =>
      meal.tags?.includes(type)
    );
  
    // 🔹 API блюда (опционально)
    let apiCategory = "";
  
    if (type === "halal") apiCategory = "Beef";
    if (type === "vegan") apiCategory = "Vegetarian";
    if (type === "chef") apiCategory = "Chicken";
  
    fetch(`https://www.themealdb.com/api/json/v2/65232507/filter.php?c=${apiCategory}`)
      .then(res => res.json())
      .then(data => {
        const apiMeals = data.meals || [];
  
        const merged = mergeMeals([...apiMeals, ...localMeals]);
  
        setAllMeals(merged);
        setLoading(false);
      });
  };
  const ingredients = useMemo(() => {
    const list = [];
    if (meal) {
      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== "") {
          list.push({ ingredient, measure });
        }
      }
    }
    return list;
  }, [meal]);

  useEffect(() => {
    if (!meal || ingredients.length === 0) return; // убедились, что meal и ingredients готовы
  
    const fetchNutrition = async () => {
      setNutritionLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/nutrition/${meal.idMeal}`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ingredients, mealName: meal.strMeal ,   instructions: meal.strInstructions, // 👈 ДОБАВИЛИ
        }), // теперь отправляем название
        });

        const data = await res.json();

        if (!res.ok) {
          if (res.status === 403 && data.limitReached) {
            setLimitReached(true);
            setFreeKbjuViewsUsed(data.freeKbjuViewsUsed ?? freeKbjuLimit);
            setFreeKbjuLimit(data.freeKbjuLimit ?? 3);
            setNutrition({ calories: "...", carbs: "...", protein: "...", fat: "..." });
            return;
          }
          throw new Error("Failed to fetch nutrition");
        }

        setLimitReached(false);
        setFreeKbjuViewsUsed(data.freeKbjuViewsUsed ?? 0);
        setFreeKbjuLimit(data.freeKbjuLimit ?? 3);
        setNutrition(data);
      } catch (err) {
        console.error(err);
        setLimitReached(false);
        setNutrition({ calories: "...", carbs: "...", protein: "...", fat: "..." });
      } finally {
        setNutritionLoading(false);
      }
    };
  
    fetchNutrition();
  }, [meal, ingredients]); // зависимость от meal и ingredients

  const [checkPot, setCheckPot] = useState(() => {
    const saved = localStorage.getItem("checkPot");
    return saved ? JSON.parse(saved) : [];
  });

  const [videoId, setVideoId] = useState(null);

  useEffect(() => {
    const loadMeal = async () => {
      setLoading(true);
  
      try {
        // 1️⃣ сначала ищем в локальной БД
        const localMeal = (hybridMeals.meals || []).find(
          m => m.idMeal === id
        );
  
        if (localMeal) {
          setMeal(localMeal);
  
          if (localMeal.strYoutube) {
            const videoId = localMeal.strYoutube.split("v=")[1];
            setVideoId(videoId);
          }
  
          setLoading(false);
          return; // ❗ ВАЖНО: не идем в API
        }
  
        // 2️⃣ если нет — идем в API
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

 

  const isFavorite = favorites.some(f => f.idMeal === meal.idMeal);
  const isPremium = Boolean(user?.premium);
  const remainingViews = Math.max(0, freeKbjuLimit - freeKbjuViewsUsed);
  const shouldBlurNutrition = limitReached && !isPremium;
  const shownNutrition = shouldBlurNutrition
    ? { calories: "•••", carbs: "•••", protein: "•••", fat: "•••" }
    : nutrition;

  return (
    <div className="mealPage">
      <div className="headerBegin">
        <button className="backBtn" onClick={() => navigate(-1)}>
          Back
        </button>
        <button
          className="backIconMobile"
          onClick={() => navigate(-1)}
          aria-label="Back"
        >
          <img src={backIcon} alt="" aria-hidden="true" />
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
              <div className={`nutritionRow ${shouldBlurNutrition ? "nutritionBlurred" : ""}`}>
                <div className="nutritionItem">
                  <div className="nutritionValue"> {nutritionLoading ? "..." : (shownNutrition ? shownNutrition.calories : "...")}</div>
                  <div className="nutritionLabel">Calories</div>
                </div>
                <div className="nutritionItem">
                  <div className="nutritionValue"> {nutritionLoading ? "..." : (shownNutrition ? shownNutrition.carbs : "...")}</div>
                  <div className="nutritionLabel">Carbs</div>
                </div>
                <div className="nutritionItem">
                  <div className="nutritionValue"> {nutritionLoading ? "..." : (shownNutrition ? shownNutrition.protein : "...")}</div>
                  <div className="nutritionLabel">Protein</div>
                </div>
                <div className="nutritionItem">
                  <div className="nutritionValue">{nutritionLoading ? "..." : (shownNutrition ? shownNutrition.fat : "...")}</div>
                  <div className="nutritionLabel">Fat</div>
                </div>
              </div>
              {shouldBlurNutrition && (
                <div className="nutritionLockNotice">
                  Для разблокировки КБЖУ, пожалуйста, купите Premium подписку.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {!isPremium && (
        <div className="limitWrapper">
          <div className="img">
            <img src={warn} alt="" />
          </div>
          <div>{limitReached ? "Free limit reached" : "Free views left"}</div>
          <div className="limitText">
            {limitReached
              ? `You used ${freeKbjuViewsUsed}/${freeKbjuLimit} AI calorie calculations`
              : `${remainingViews}/${freeKbjuLimit} free AI calorie calculations remaining`}
          </div>
          {limitReached && (
            <button className="upgrade premiumCtaBtn" onClick={() => navigate("/premium")}>
              Buy Premium
            </button>
          )}
        </div>
      )}

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