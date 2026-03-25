import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import MealCardGrid from "./MealCardGrid.jsx"; // карточки блюд

function MyLikes() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:4000/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  // Загружаем избранное из localStorage
  useEffect(() => {
    const saved = localStorage.getItem("favorites");
    setFavorites(saved ? JSON.parse(saved) : []);
  }, []);

  return (
    <div className="myAccountWrapper">
      <div className="recipeEmpty">My Likes</div>

      <div className="accountMenu">
        <div className="account-page">
          {/* Левое меню */}
          <div className="left-side">
            <div className="menuwrapper">
              <div className="personalInfo" onClick={() => navigate("/my-account")}>
                <div className="rp">
                  <div>Personal Info</div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#242D96]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <hr />
              </div>

              <div className="personalInfo">
                <div className="rp">
                  <div>Subscription</div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#242D96]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <hr />
              </div>

              <div className="personalInfo" onClick={()=> navigate("/password-manager")}>
                <div className="rp">
                  <div>Password Manager</div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#242D96]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <hr />
              </div>

              <div className="personalInfo active_MenuPage" onClick={() => navigate("/my-likes")}>
                <div className="rp">
                  <div>Likes</div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#242D96]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <hr />
              </div>

              <div className="personalInfo" onClick={() => setShowLogoutModal(true)}>
                <div className="rp">
                  <div>Logout</div>
                </div>
                <hr />
              </div>
            </div>
          </div>

          {/* Правая часть – карточки избранных блюд */}
          <div className="right-side">
            {favorites.length === 0 ? (
              <div className="emptyFavorites">No favorite recipes yet</div>
            ) : (
              <MealCardGrid
                meals={favorites}
                onCardClick={(meal) => navigate(`/meal/${meal.idMeal}`)}
                titleMaxLength={15}
                variant="mainRecipe"
                useLongTitle
              />
            )}
          </div>
        </div>
      </div>

      {/* Модалка логаута */}
      {showLogoutModal && (
        <div className="logoutModalOverlay">
          <div className="logoutModal">
            <h3>Logout</h3>
            <p>Are you sure you want to log out of your account?</p>
            <div className="logoutButtons">
              <button className="cancelBtn" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button className="logoutBtn" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyLikes;