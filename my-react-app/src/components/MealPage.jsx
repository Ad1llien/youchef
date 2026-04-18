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

// ─── PDF Download ─────────────────────────────────────────────────────────────
function downloadMealAsPDF(meal, ingredients, nutrition) {
  const cal = nutrition?.calories || "—";
  const protein = nutrition?.protein || "—";
  const fat = nutrition?.fat || "—";
  const carbs = nutrition?.carbs || "—";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>${meal.strMeal} — YouChef</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Teachers:wght@400;500;600;700&family=Taviraj:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Teachers', sans-serif; background: #FDFBE7; padding: 32px 24px; color: #1a1a2e; }
  .page { max-width: 720px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 40px rgba(36,45,150,0.12); }

  /* HEADER */
  .header { background: #242D96; padding: 0; position: relative; overflow: hidden; }
  .header::before { content:''; position:absolute; top:-60px; right:-60px; width:200px; height:200px; border-radius:50%; background:rgba(255,255,255,0.05); }
  .header::after { content:''; position:absolute; bottom:-40px; left:40%; width:160px; height:160px; border-radius:50%; background:rgba(255,255,255,0.04); }
  .header-top { display:flex; align-items:center; justify-content:space-between; padding:24px 32px 20px; }
  .brand-row { display:flex; align-items:center; gap:14px; }
  .logo-box { width:48px; height:48px; border-radius:14px; background:rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; overflow:hidden; }
  .logo-box img { width:38px; height:38px; object-fit:contain; }
  .brand-name { font-family:'Taviraj',serif; font-size:22px; font-weight:500; color:white; }
  .brand-sub { font-size:11px; color:rgba(255,255,255,0.5); margin-top:1px; }
  .header-badge { background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); border-radius:12px; padding:8px 16px; text-align:center; }
  .badge-tag { font-size:10px; color:rgba(255,255,255,0.5); text-transform:uppercase; letter-spacing:2px; }
  .badge-cat { font-size:14px; font-weight:600; color:white; margin-top:2px; }

  /* MEAL HERO */
  .meal-hero { display:flex; gap:0; }
  .meal-img { width:220px; height:200px; object-fit:cover; flex-shrink:0; }
  .meal-info { flex:1; padding:20px 24px; display:flex; flex-direction:column; justify-content:center; }
  .meal-title { font-family:'Taviraj',serif; font-size:22px; font-weight:500; color:white; margin-bottom:8px; line-height:1.3; }
  .meal-meta { display:flex; gap:8px; flex-wrap:wrap; }
  .meta-pill { background:rgba(255,255,255,0.12); border-radius:20px; padding:3px 12px; font-size:11px; color:rgba(255,255,255,0.8); }

  /* NUTRITION */
  .nutrition-bar { display:flex; background:#f8f9ff; border-bottom:1px solid #eef0fb; }
  .nut-item { flex:1; text-align:center; padding:16px 8px; border-right:1px solid #eef0fb; }
  .nut-item:last-child { border-right:none; }
  .nut-val { font-size:22px; font-weight:700; color:#242D96; }
  .nut-label { font-size:11px; color:#788CA5; margin-top:2px; text-transform:uppercase; letter-spacing:1px; }

  /* CONTENT */
  .content { display:flex; gap:0; }
  .left-col { width:260px; border-right:1px solid #f3f4f6; padding:24px; flex-shrink:0; }
  .right-col { flex:1; padding:24px; }
  .section-title { font-family:'Taviraj',serif; font-size:16px; font-weight:500; color:#242D96; margin-bottom:14px; padding-bottom:8px; border-bottom:1px solid #eef0fb; display:flex; align-items:center; gap:8px; }
  .ing-row { display:flex; align-items:center; gap:8px; padding:5px 0; border-bottom:1px solid #f9f9f9; }
  .ing-img { width:28px; height:28px; object-fit:contain; flex-shrink:0; }
  .ing-name { font-size:12px; font-weight:500; color:#242D96; flex:1; }
  .ing-measure { font-size:11px; color:#788CA5; white-space:nowrap; }
  .instructions { font-size:13px; line-height:1.8; color:#444; }

  /* TEAR + FOOTER */
  .tear { position:relative; height:26px; display:flex; align-items:center; background:#FDFBE7; }
  .tear::before { content:''; position:absolute; left:-14px; width:28px; height:28px; border-radius:50%; background:#FDFBE7; }
  .tear::after { content:''; position:absolute; right:-14px; width:28px; height:28px; border-radius:50%; background:#FDFBE7; }
  .tear-line { flex:1; margin:0 14px; border-top:2px dashed #BBC8D8; }
  .footer { background:#242D96; padding:14px 32px; display:flex; justify-content:space-between; align-items:center; }
  .footer-left { color:rgba(255,255,255,0.6); font-size:12px; }
  .footer-right { color:rgba(255,255,255,0.3); font-size:11px; }

  @media print {
    body { background:white; padding:0; }
    .page { box-shadow:none; border-radius:0; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="header">
    <div class="header-top">
      <div class="brand-row">
        <div class="logo-box">
          <img src="https://youchef.kz/icons/logo-192.png" alt="YouChef" onerror="this.style.display='none'"/>
        </div>
        <div>
          <div class="brand-name">YouChef</div>
          <div class="brand-sub">Recipe Card</div>
        </div>
      </div>
      <div class="header-badge">
        <div class="badge-tag">Category</div>
        <div class="badge-cat">${meal.strCategory || "Recipe"}</div>
      </div>
    </div>

    <div class="meal-hero">
      <img class="meal-img" src="${meal.strMealThumb}" alt="${meal.strMeal}" onerror="this.style.background='#eef0fb'"/>
      <div class="meal-info">
        <div class="meal-title">${meal.strMeal}</div>
        <div class="meal-meta">
          ${meal.strArea ? `<span class="meta-pill">🌍 ${meal.strArea}</span>` : ""}
          ${meal.strCategory ? `<span class="meta-pill">🍽 ${meal.strCategory}</span>` : ""}
          ${meal.strTags ? meal.strTags.split(",").slice(0,2).map(t => `<span class="meta-pill">${t.trim()}</span>`).join("") : ""}
        </div>
      </div>
    </div>
  </div>

  <!-- NUTRITION -->
  <div class="nutrition-bar">
    ${[
      { label: "Calories", val: cal, unit: "kcal" },
      { label: "Protein", val: protein, unit: "g" },
      { label: "Carbs", val: carbs, unit: "g" },
      { label: "Fat", val: fat, unit: "g" },
    ].map(n => `
      <div class="nut-item">
        <div class="nut-val">${n.val}<span style="font-size:12px;font-weight:400;color:#BBC8D8"> ${n.unit}</span></div>
        <div class="nut-label">${n.label}</div>
      </div>
    `).join("")}
  </div>

  <!-- CONTENT -->
  <div class="content">
    <!-- Ingredients -->
    <div class="left-col">
      <div class="section-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#242D96" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        Ingredients
      </div>
      ${ingredients.map(({ ingredient, measure }) => `
        <div class="ing-row">
          <img class="ing-img" src="https://www.themealdb.com/images/ingredients/${ingredient}-small.png" alt="${ingredient}" onerror="this.style.display='none'"/>
          <span class="ing-name">${ingredient}</span>
          <span class="ing-measure">${measure || ""}</span>
        </div>
      `).join("")}
    </div>

    <!-- Instructions -->
    <div class="right-col">
      <div class="section-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#242D96" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        Instructions
      </div>
      <div class="instructions">${(meal.strInstructions || "").slice(0, 1200)}${meal.strInstructions?.length > 1200 ? "..." : ""}</div>
    </div>
  </div>

  <!-- TEAR + FOOTER -->
  <div class="tear"><div class="tear-line"></div></div>
  <div class="footer">
    <div class="footer-left">Generated by YouChef AI · ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
    <div class="footer-right">youchef.kz</div>
  </div>

</div>
</body>
</html>`;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 700);
}

// ─── Copy recipe as text ──────────────────────────────────────────────────────
function copyMealAsText(meal, ingredients, nutrition) {
  const lines = [
    `🍽 ${meal.strMeal}`,
    `📍 ${meal.strArea || ""} · ${meal.strCategory || ""}`,
    "",
    `📊 Nutrition (per serving):`,
    `  Calories: ${nutrition?.calories || "—"} kcal`,
    `  Protein:  ${nutrition?.protein || "—"}g`,
    `  Carbs:    ${nutrition?.carbs || "—"}g`,
    `  Fat:      ${nutrition?.fat || "—"}g`,
    "",
    `🧂 Ingredients:`,
    ...ingredients.map(i => `  • ${i.ingredient}  ${i.measure}`),
    "",
    `📝 Instructions:`,
    meal.strInstructions || "",
    "",
    `— Generated by YouChef · youchef.kz`,
  ];
  navigator.clipboard.writeText(lines.join("\n"));
}

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
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const navigate = useNavigate();

  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });
  const [videoId, setVideoId] = useState(null);

  const nutritionFetchedRef = useRef(false);

  useEffect(() => {
    nutritionFetchedRef.current = false;
    setNutrition(null);
    setNutritionLoading(true);
    setLimitReached(false);
    setShowUpgradeModal(false);
  }, [id]);

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
          if (localMeal.strYoutube) setVideoId(localMeal.strYoutube.split("v=")[1]);
          setLoading(false);
          return;
        }
        const mealRes = await fetch(`https://www.themealdb.com/api/json/v2/65232507/lookup.php?i=${id}`);
        const mealData = await mealRes.json();
        const currentMeal = mealData.meals?.[0] || null;
        setMeal(currentMeal);
        if (currentMeal?.strYoutube) setVideoId(currentMeal.strYoutube.split("v=")[1]);
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

  const handleCopy = () => {
    copyMealAsText(meal, ingredients, nutrition);
    setCopied(true);
    setShowShareMenu(false);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePDF = () => {
    downloadMealAsPDF(meal, ingredients, nutrition);
    setShowShareMenu(false);
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
              <button onClick={() => { setShowUpgradeModal(false); navigate("/premium"); }}
                style={{ width: "100%", padding: "10px", borderRadius: 50, background: "#242D96", color: "white", fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer", fontFamily: "Teachers, sans-serif", marginBottom: 8 }}>
                Get Premium →
              </button>
              <button onClick={() => setShowUpgradeModal(false)}
                style={{ width: "100%", padding: "10px", borderRadius: 50, background: "transparent", color: "#aaa", fontSize: 14, border: "1px solid #BBC8D8", cursor: "pointer", fontFamily: "Teachers, sans-serif" }}>
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE DROPDOWN OVERLAY */}
      {showShareMenu && (
        <div style={{ position: "fixed", inset: 0, zIndex: 998 }} onClick={() => setShowShareMenu(false)} />
      )}

      <div className="headerBegin">
        <button className="backBtn" onClick={() => navigate(-1)}>Back</button>
        <button className="backIconMobile" onClick={() => navigate(-1)} aria-label="Back">
          <img src={backIcon} alt="" aria-hidden="true" />
        </button>
        <div className="nameFoodTitle">{meal.strMeal}</div>

        {/* Right side actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Share button */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowShareMenu(v => !v)}
              style={{
                background: "#242D96",
                border: "none",
                borderRadius: 50,
                padding: "10px 20px",
                cursor: "pointer",
                fontFamily: "Teachers, sans-serif",
                fontSize: 14,
                color: "white",
                display: "flex",
                alignItems: "center",
                gap: 6,
                height: 40,
                transition: "all 0.2s",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              {copied ? "Copied!" : "Share"}
            </button>

            {showShareMenu && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0,
                background: "white", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                border: "1px solid #e8ecf8", zIndex: 999, minWidth: 180,
                overflow: "hidden",
              }}>
                <button onClick={handleCopy}
                  style={{ width: "100%", padding: "12px 16px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontFamily: "Teachers, sans-serif", fontSize: 14, color: "#242D96", textAlign: "left" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#242D96" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy recipe
                </button>
                <div style={{ height: 1, background: "#f3f4f6" }} />
                <button onClick={handlePDF}
                  style={{ width: "100%", padding: "12px 16px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontFamily: "Teachers, sans-serif", fontSize: 14, color: "#242D96", textAlign: "left" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#242D96" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download PDF
                </button>
              </div>
            )}
          </div>

          <div className="favoriteIcon" onClick={toggleFavorite}>
            <img src={blueFav} alt="favorite" style={{ opacity: isFavorite ? 1 : 0.4 }} />
          </div>
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

      {!isPremium && !nutritionLoading && (
        <div className="limitWrapper">
          <div className="img"><img src={warn} alt="" /></div>
          <div style={{ color: counterColor }}>
            {limitReached ? "Free limit reached" : "Free views left"}
          </div>
          <div className="limitText">
            {limitReached
              ? `You used all ${freeKbjuLimit}/${freeKbjuLimit} AI calorie calculations`
              : `${remainingViews}/${freeKbjuLimit} free AI calorie calculations remaining`}
          </div>
          <button className="upgrade premiumCtaBtn" onClick={() => setShowUpgradeModal(true)}>
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
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.95)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#242D96"><path d="M8 5v14l11-7z" /></svg>
                </div>
                <div style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(0,0,0,0.7)", color: "white", borderRadius: 6, padding: "4px 10px", fontSize: 12, fontFamily: "Teachers, sans-serif" }}>
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

      <div className="searchingQuestion">Don't see what you're looking for?</div>

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