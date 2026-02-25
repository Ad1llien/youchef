import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/popularMeal.css";
import blueFav from '../icons/blueFav.svg';
import "../styles/mealPage.css"
import youtubeLogo from '../icons/youtube.svg'
import line from '../icons/Line36.svg';
import Calculator from '../icons/Group135.svg'
import warn from '../icons/information-fill.svg';
function MealPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkPot, setCheckPot] = useState(() => {
    const saved = localStorage.getItem("checkPot");
    return saved ? JSON.parse(saved) : [];
  });

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

  return (
    <div className="mealPage">
      <div className="headerBegin">
        <button className="backBtn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="nameFoodTitle">
          Name of the food
        </div>
        <div className="favoriteIcon">
          <img src={blueFav} alt="" />
        </div>
      </div>
      <div className="imgWrapper">
        <img src={line} alt="" srcset="" />
      </div>
      <div className="infoWrapper">
        <div className="youtubeLink">
          <img src={youtubeLogo} alt="" />
          <div className="youtubeText">
          There is a video on YouTube link 
          "How to cook this <span>{meal.strMeal}</span>
          </div>
        </div>
        <div className="calculationWrapper">
          <div className="topCalc">
            <img src={Calculator} alt="" />
            <div className="calcInfos">
              <div className="digits">
                <div>
                  0 cal
                </div>
                <div>
                  0 g
                </div>
                <div>
                  0 g
                </div>
                <div>
                  0 g
                </div>
              </div>
              <div className="categories">
                <div>
                  Cal
                </div>
                <div>
                  Carbs
                </div>
                <div>
                  Protein
                </div>
                <div>
                  Fat
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
            <img src={meal.strMealThumb} alt="meal.strMeal" />
          </div>
          <div className="ingredientsList">
            <div className="ingredientsTitle">Ingredients</div>
            <div className="ingredientsContainer">
              {Array.from({ length: 20 }, (_, i) => i + 1)
              .map(i => ({
                ingredient: meal[`strIngredient${i}`],
                measure: meal[`strMeasure${i}`]
              }))
              .filter(item => item.ingredient && item.ingredient.trim() !== "")
              .map((item, index) => (
              <div key={index} className="ingredientRow">
                <li className="ingredientName">{item.ingredient + " "}</li>
                <span className="ingredientMeasure">{" "+item.measure}</span>
              </div>
              ))}
            </div>
          </div>
        </div>
        <div className="secondRow">
          {meal.strInstructions}
        </div>
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

// 🔹 YouTube API function
