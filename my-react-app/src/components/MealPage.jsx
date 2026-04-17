import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, useRef } from "react";
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

  const [nutrition, setNutrition] = useState(null);
  const [freeKbjuViewsUsed, setFreeKbjuViewsUsed] = useState(0);
  const [freeKbjuLimit, setFreeKbjuLimit] = useState(10);
  const [limitReached, setLimitReached] = useState(false);
  const [nutritionLoading, setNutritionLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [playerPlaying, setPlayerPlaying] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);

  const navigate = useNavigate();

  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });
  const [videoId, setVideoId] = useState(null);

  const nutritionFetchedRef = useRef(false);

  // Сбрасываем флаг при смене блюда
  useEffect(() => {
    nutritionFetchedRef.current = false;
    setNutrition(null);
    setNutritionLoading(true);
    setLimitReached(false);
    setShowUpgradeModal(false);
  }, [id]);

  // Загружаем данные пользователя
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/user/data`, {
      method: "GET",
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setIsPremium(Boolean(data.userData?.premium));
      })
      .catch(() => {})
      .finally(() => setUserLoaded(true));
  }, []);

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

  // Загружаем нутриции только один раз
  useEffect(() => {
    if (!meal || ingredients.length === 0 || !userLoaded) return;
    if (nutritionFetchedRef.current) return;
    nutritionFetchedRef.current = true;

    const fetchNutrition = async () => {
      setNutritionLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/nutrition/${meal.idMeal}`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ingredients,
            mealName: meal.strMeal,
            instructions: meal.strInstructions,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          if (res.status === 403 && data.limitReached) {
            setLimitReached(true);
            setFreeKbjuViewsUsed(data.freeKbjuViewsUsed ?? 10);
            setFreeKbjuLimit(data.freeKbjuLimit ?? 10);
            setNutrition(null);
            // Показываем модалку раз в неделю
            const lastShown = localStorage.getItem("upgrade_modal_shown");
            const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
            if (!lastShown || Number(lastShown) < weekAgo) {
              localStorage.setItem("upgrade_modal_shown", Date.now().toString());
              setShowUpgradeModal(true);
            }
            return;
          }
          throw new Error("Failed to fetch nutrition");
        }

        const used = data.freeKbjuViewsUsed ?? 0;
        const limit = data.freeKbjuLimit ?? 10;
        setLimitReached(false);
        setFreeKbjuViewsUsed(used);
        setFreeKbjuLimit(limit);
        setNutrition(data);

        // Показываем модалку когда лимит исчерпан
        if (!data.premium && used >= limit) {
          const lastShown = localStorage.getItem("upgrade_modal_shown");
          const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          if (!lastShown || Number(lastShown) < weekAgo) {
            localStorage.setItem("upgrade_modal_shown", Date.now().toString());
            setShowUpgradeModal(true);
          }
        }
      } catch (err) {
        console.error(err);
        setLimitReached(false);
        setNutrition(null);
      } finally {
        setNutritionLoading(false);
      }
    };

    fetchNutrition();
  }, [meal, ingredients, userLoaded]);

  useEffect(() => {
    const loadMeal = async () => {
      setLoading(true);
      try {
        const localMeal = (hybridMeals.meals || []).find(m => m.idMeal === id);

        if (localMeal) {
          setMeal(localMeal);
          if (localMeal.strYoutube) {
            setVideoId(localMeal.strYoutube.split("v=")[1]);
          }
          setLoading(false);
          return;
        }

        const mealRes = await fetch(
          `https://www.themealdb.com/api/json/v2/65232507/lookup.php?i=${id}`
        );
        const mealData = await mealRes.json();
        const currentMeal = mealData.meals?.[0] || null;
        setMeal(currentMeal);

        if (currentMeal?.strYoutube) {
          setVideoId(currentMeal.strYoutube.split("v=")[1]);
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
    const updated = isAlready
      ? favorites.filter(f => f.idMeal !== meal.idMeal)
      : [...favorites, meal];
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  if (loading || !userLoaded) {
    return (
      <div className="loaderContainer">
        <div className="loader"></div>
      </div>
    );
  }

  if (!meal) return <div>Meal not found</div>;

  const isFavorite = favorites.some(f => f.idMeal === meal.idMeal);
  const remainingViews = Math.max(0, freeKbjuLimit - freeKbjuViewsUsed);
  const shouldBlurNutrition = limitReached && !isPremium;
  const shownNutrition = shouldBlurNutrition
    ? { calories: "•••", carbs: "•••", protein: "•••", fat: "•••" }
    : nutrition;
  const counterColor = remainingViews <= 2 ? "#FF786D" : remainingViews <= 5 ? "#ED8B07" : "#029663";

  return (
    <div className="mealPage">

      {/* UPGRADE MODAL */}
      {showUpgradeModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}
          onClick={() => setShowUpgradeModal(false)}
        >
          <div
            style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 380, overflow: "hidden" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ background: "#242D96", padding: "28px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>💎</div>
              <h2 style={{ color: "white", fontSize: 20, fontWeight: 500, margin: "0 0 6px", fontFamily: "Teachers, sans-serif" }}>
                Upgrade to Premium
              </h2>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: 0, fontFamily: "Teachers, sans-serif" }}>
                {limitReached
                  ? "You've used all your free AI calorie calculations."
                  : `Only ${remainingViews} free views left.`}
              </p>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {["Unlimited AI calorie calculations", "Access to exclusive recipes", "Weekly meal planner", "Food photo analysis"].map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#E6FAED", display: "flex", alignItems: "center", justifyContent: "center", color: "#029663", fontSize: 11, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 14, color: "#555", fontFamily: "Teachers, sans-serif" }}>{f}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => { setShowUpgradeModal(false); navigate("/premium"); }}
                style={{ width: "100%", padding: "10px", borderRadius: 50, background: "#242D96", color: "white", fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer", fontFamily: "Teachers, sans-serif", marginBottom: 8 }}
              >
                Get Premium →
              </button>
              <button
                onClick={() => setShowUpgradeModal(false)}
                style={{ width: "100%", padding: "10px", borderRadius: 50, background: "transparent", color: "#aaa", fontSize: 14, border: "1px solid #BBC8D8", cursor: "pointer", fontFamily: "Teachers, sans-serif" }}
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="headerBegin">
        <button className="backBtn" onClick={() => navigate(-1)}>Back</button>
        <button className="backIconMobile" onClick={() => navigate(-1)} aria-label="Back">
          <img src={backIcon} alt="" aria-hidden="true" />
        </button>
        <div className="nameFoodTitle">{meal.strMeal}</div>
        <div className="favoriteIcon" onClick={toggleFavorite}>
          <img src={blueFav} alt="favorite" style={{ opacity: isFavorite ? 1 : 0.4 }} />
        </div>
      </div>

      <div className="imgWrapper">
        <img src={line} alt="" />
      </div>

      <div className="infoWrapper">
        <div className="youtubeLink">
          <img src={youtubeLogo} alt="YouTube" />
          <div className="youtubeText">
            <div>There is a video on YouTube link</div>
            {meal.strYoutube && (
              <a href={meal.strYoutube} target="_blank" rel="noreferrer" className="youtubeRecipeLink">
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
                {["calories", "carbs", "protein", "fat"].map((key, i) => (
                  <div key={key} className="nutritionItem">
                    <div className="nutritionValue">
                      {nutritionLoading ? "..." : shownNutrition ? shownNutrition[key] : "—"}
                    </div>
                    <div className="nutritionLabel">
                      {["Calories", "Carbs", "Protein", "Fat"][i]}
                    </div>
                  </div>
                ))}
              </div>
              {shouldBlurNutrition && (
                <div className="nutritionLockNotice">
                  Upgrade to Premium to unlock nutrition info.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Счётчик — скрыт у Premium и пока грузится */}
      {!isPremium && !nutritionLoading && (
        <div className="limitWrapper">
          <div className="img">
            <img src={warn} alt="" />
          </div>
          <div style={{ color: counterColor }}>
            {limitReached ? "Free limit reached" : "Free views left"}
          </div>
          <div className="limitText">
            {limitReached
              ? `You used all ${freeKbjuLimit}/${freeKbjuLimit} AI calorie calculations`
              : `${remainingViews}/${freeKbjuLimit} free AI calorie calculations remaining`}
          </div>
          <button
            className="upgrade premiumCtaBtn"
            onClick={() => setShowUpgradeModal(true)}
          >
            {limitReached ? "Upgrade Premium" : "Upgrade"}
          </button>
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

      {/* YouTube Video Player */}
      {videoId && (
        <div style={{ maxWidth: 800, margin: "60px auto 0", padding: "0 16px" }}>
          <h2 style={{ color: "#242D96", fontFamily: "Taviraj", fontSize: 28, fontWeight: 500, marginBottom: 20, textAlign: "center" }}>
            How to cook this {meal.strMeal}
          </h2>
          <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", background: "#000", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
            {!playerPlaying ? (
              <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setPlayerPlaying(true)}>
                <img
                  src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                  alt="Video preview"
                  style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }}
                  onError={e => { e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`; }}
                />
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)" }} />
                <div style={{
                  position: "absolute", top: "50%", left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 72, height: 72, borderRadius: "50%",
                  background: "rgba(255,255,255,0.95)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#242D96">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div style={{
                  position: "absolute", bottom: 12, right: 12,
                  background: "rgba(0,0,0,0.7)", color: "white",
                  borderRadius: 6, padding: "4px 10px", fontSize: 12,
                  fontFamily: "Teachers, sans-serif",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  YouTube
                </div>
              </div>
            ) : (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                title={`How to cook ${meal.strMeal}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: "100%", aspectRatio: "16/9", border: "none", display: "block" }}
              />
            )}
          </div>
          <p style={{ color: "#888", fontSize: 13, textAlign: "center", marginTop: 10, fontFamily: "Teachers, sans-serif" }}>
            Click play to watch the full recipe video
          </p>
        </div>
      )}

      <div className="lineWrapper">
        <div className="centerLine"></div>
      </div>

      <div className="searchingQuestion">
        Don't see what you're looking for?
      </div>

      <div className="expandTitle">
        YouChef is always looking to expand their recipes catalogue. Request a recipe and we'll do our best to help
      </div>

      <button className="requestRecipe" onClick={() => navigate("/request-recipe")}>
        Request Recipe
      </button>
    </div>
  );
}

export default MealPage;