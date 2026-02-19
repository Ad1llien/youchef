import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/popularMeal.css";

function MealPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [meal, setMeal] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMeal = async () => {
      setLoading(true);

      const mealRes = await fetch(
        `https://www.themealdb.com/api/json/v2/65232507/lookup.php?i=${id}`
      );
      const mealData = await mealRes.json();
      const currentMeal = mealData.meals?.[0] || null;
      setMeal(currentMeal);

      if (currentMeal) {
        // ищем видео на YouTube
        const queryVideoId = await fetchYoutubeVideo(currentMeal.strMeal);
        setVideoId(queryVideoId);
      }

      setLoading(false);
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

  return (
    <div className="mealPage">
      <button className="backBtn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1>{meal.strMeal}</h1>
      <img src={meal.strMealThumb} alt={meal.strMeal} />

      <h3>Instructions</h3>
      <p>{meal.strInstructions}</p>

      {videoId ? (
        <div style={{ marginTop: "40px" }}>
          <h3>Video Tutorial</h3>
          <iframe
            width="100%"
            height="400"
            src={`https://www.youtube.com/embed/${videoId}`}
            frameBorder="0"
            allowFullScreen
            title="Cooking Video"
          ></iframe>
        </div>
      ) : (
        <p>No video available for this recipe.</p>
      )}
    </div>
  );
}

export default MealPage;

// 🔹 YouTube API function
async function fetchYoutubeVideo(mealName) {
  const query = encodeURIComponent(`how to cook ${mealName} recipe`);
  const apiKey = "AIzaSyA8bqQSYJKeM3ZzZylGQU34BTYdYd4IMv8";
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=1&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      return data.items[0].id.videoId;
    }
    return null;
  } catch (error) {
    console.error("YouTube API error:", error);
    return null;
  }
}
