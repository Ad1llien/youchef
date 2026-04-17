import { useEffect, useState } from "react";
import "../styles/popularMeal.css";
import { useNavigate } from "react-router-dom";
import mealPhoto from "../icons/BAU.svg";
import CategoryFilter from "./CategoryFilter.jsx";
import MealCardGrid from "./MealCardGrid.jsx";
import Pagination from "./Pagination.jsx";
import API_BASE_URL from "../config/api";
import AIAssistant from "./AIAssistant";
import OnboardingTour from "./OnboardingTour";

const STORAGE_KEY = "popularMealFilter";
const MEALS_PER_PAGE = 6;

function PopularMealContent() {
  const [meals, setMeals] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [userLoading, setUserLoading] = useState(true);
  const navigate = useNavigate();

  // 🔹 Загрузка при открытии страницы
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/user/data`, {
      method: "GET",
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setUser(data.userData);
      })
      .catch(err => console.error(err))
      .finally(() => setUserLoading(false));
  }, []);
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
    setActiveFilter("default");
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

  const handleFilterSelect = (value) => {
    if (value === "default") {
      loadDefaultMeals();
    } else {
      loadFilteredMeals(value);
    }
  };

  return (
    <div className="popularMealContent">
      <CategoryFilter
        activeValue={activeFilter}
        onSelect={handleFilterSelect}
        options={[
          { label: "Breakfast", value: "Breakfast" },
          { label: "Lunch", value: "Seafood" },
          { label: "Dinner", value: "Beef" },
          { label: "From Chef", value: "default" },
        ]}
      />
      <div className="popularMealBody">
        <div className="popularMealMainContainer">
          {/* MEALS */}
          {loading ? (
            <div className="loader"></div>
          ) : (
            <MealCardGrid
              meals={currentMeals}
              onCardClick={(meal) => {
                if (userLoading) return; // ждём пока загрузится
                if (!user) {
                  setShowLoginModal(true);
                } else {
                  navigate(`/meal/${meal.idMeal}`);
                }
              }}
              titleMaxLength={8}
              variant="popular"
            />
          )}
        </div>

        <div className="photoContainer">
          <img src={mealPhoto} alt="Meal preview" />
        </div>
      </div>
      {!loading && (
        <div className="popularMealPagination">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
      {showLoginModal && (
  <div
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    onClick={() => setShowLoginModal(false)}
  >
    <div
      className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="text-4xl mb-4">🍳</div>
      <h2 className="text-xl font-semibold text-[#242D96] mb-2">
        Login to see recipes
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        Sign up or Login to account to get access to recipes from YouChef
      </p>
      <div className="flex flex-col gap-3">
        <button
          onClick={() => navigate("/login")}
          className="w-full py-2.5 bg-[#242D96] text-white rounded-full font-medium border-none cursor-pointer"
        >
          Login
        </button>
        <button
          onClick={() => navigate("/signup")}
          className="w-full py-2.5 border border-[#242D96] text-[#242D96] rounded-full font-medium bg-transparent cursor-pointer"
        >
          Sign up
        </button>
        <button
          onClick={() => setShowLoginModal(false)}
          className="text-gray-400 text-sm bg-transparent border-none cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  </div>
  
)}
    <AIAssistant />
    <OnboardingTour />
    </div>
    
  );
}

export default PopularMealContent;
