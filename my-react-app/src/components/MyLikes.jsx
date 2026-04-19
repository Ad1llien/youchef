import { useNavigate } from "react-router-dom";
import { useState } from "react";
import MealCardGrid from "./MealCardGrid.jsx"; // карточки блюд
import Pagination from "./Pagination.jsx"; // твой компонент Pagination
import AccountNavigation from "./AccountNavigation";
import API_BASE_URL, { apiFetch } from "../config/api";

function MyLikes() {
  const navigate = useNavigate();
  const [favorites] = useState(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8); // сколько карточек на странице
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      await apiFetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
      });
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  // Определяем карточки для текущей страницы
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentFavorites = favorites.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(favorites.length / itemsPerPage);

  return (
    <div className="mx-auto mt-[102px] w-full max-w-6xl px-4 md:px-6">
      <h1 className="mb-6 text-center font-['Taviraj'] text-[32px] font-normal leading-normal text-[#242D96] md:mb-[80px]">
        My Favorites
      </h1>

      <div className="flex flex-col gap-11 md:gap-20 md:flex-row md:items-start">
        <AccountNavigation
          activeItem="likes"
          onOpenPersonalInfo={() => navigate("/my-account")}
          onSubscription={() => navigate("/premium")}
          onOpenPasswordManager={() => navigate("/password-manager")}
          onOpenLikes={() => navigate("/my-likes")}
          onLogout={() => setShowLogoutModal(true)}
          onHistory={() => navigate("/history")}

        />

        <div className="w-full md:flex-1">
          <div className="w-[300px] md:w-full max-w-[560px] min-w-0">
            {favorites.length === 0 ? (
              <div className="rounded-xl border border-[#BBC8D8] bg-white/50 px-5 py-8 text-center font-['Teachers'] text-[18px] text-[#343B1B]">
                No favorite recipes yet
              </div>
            ) : (
              <>
                <MealCardGrid
                  meals={currentFavorites}
                  onCardClick={(meal) => navigate(`/meal/${meal.idMeal}`)}
                  titleMaxLength={15}
                  variant="mainRecipe"
                  useLongTitle
                />

                {/* Пагинация */}
                {totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={(page) => setCurrentPage(page)}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-[340px] rounded-2xl bg-white p-6 text-center shadow-xl">
            <h3 className="mb-2 text-xl font-semibold text-[#13151A]">
              Logout
            </h3>
            <p className="mb-6 text-sm text-[#555]">
              Are you sure you want to log out of your account?
            </p>
            <div className="flex justify-between gap-3">
              <button
                className="flex-1 rounded-lg bg-[#eee] px-4 py-2.5 text-sm font-medium text-[#333]"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 rounded-lg bg-[#e53935] px-4 py-2.5 text-sm font-medium text-white"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyLikes;
