import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import searchIcon from "../icons/search-2-line.svg";
import hybridMeals from "../mealsDB.json";
import ingredientsData from "../../classified_ingredients.json";
import { mealDictionary } from "../../../backend/backend/utils/mealDictionary.js";
import API_BASE_URL, { apiFetch } from "../config/api";

function SearchBar({
  mode = "meals",
  onIngredientSelect,
  selectedIngredients = [],
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  // перевод запроса
  async function translateQuery(text) {
    const lowerText = text.toLowerCase();

    if (mealDictionary[lowerText]) {
      return mealDictionary[lowerText];
    }

    try {
      const res = await apiFetch(`${API_BASE_URL}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      return data.translated;
    } catch (err) {
      console.error(err);
      return text;
    }
  }

  // эффект поиска
  useEffect(() => {
    if (!query.trim()) {
      // если нет запроса — очищаем результаты
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);

      try {
        const translatedQuery = await translateQuery(query);

        // ================= MEALS SEARCH =================
        if (mode === "meals") {
          const localResults = (hybridMeals.meals || []).filter((meal) =>
            meal.strMeal.toLowerCase().includes(translatedQuery.toLowerCase())
          );

          const res = await fetch(
            `https://www.themealdb.com/api/json/v1/1/search.php?s=${translatedQuery}`
          );
          const data = await res.json();
          const apiResults = data.meals || [];

          const merged = [...localResults, ...apiResults];

          // убираем дубли
          const uniqueMeals = Array.from(
            new Map(merged.map((meal) => [meal.idMeal, meal])).values()
          );

          setResults(uniqueMeals.slice(0, 10));
        }

        // ================= INGREDIENTS SEARCH =================
        if (mode === "ingredients") {
          const allIngredients = Object.values(ingredientsData).flat();

          const filtered = allIngredients.filter((item) =>
            item.toLowerCase().includes(translatedQuery.toLowerCase())
          );

          setResults(filtered.slice(0, 10));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query, mode]);

  // закрытие dropdown при клике вне компонента
  useEffect(() => {
    function handleClickOutside(e) {
      if (!containerRef.current) return;

      if (!containerRef.current.contains(e.target)) {
        setResults([]);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // выбор элемента
  const handleSelect = (item) => {
    if (mode === "meals") {
      setQuery("");
      setResults([]);
      navigate(`/meal/${item.idMeal}`);
      return;
    }

    if (mode === "ingredients") {
      onIngredientSelect?.(item);

      // чтобы selected элемент подсвечивался
      setResults((prev) =>
        prev.map((result) => (result === item ? result : result))
      );
    }
  };

  return (
    <div className="mt-6 flex justify-center px-4">
      <div
        ref={containerRef}
        className="relative w-full max-w-[260px] transition-all duration-300 sm:max-w-[420px] lg:max-w-[588px] lg:hover:max-w-[488px] lg:focus-within:max-w-[488px]"
      >
        <div className="relative">
          <input
            className="search-bar-input h-10 w-full box-border rounded-[30px] border border-[#ccc] bg-white pl-4 pr-11 text-[16px] text-[#242D96] outline-none sm:pl-5"
            placeholder={
              mode === "ingredients" ? "Search ingredient..." : "Search meal..."
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-[45%] cursor-pointer border-none bg-transparent p-0 "
          >
            <img
              src={searchIcon}
              alt="Search"
              className="h-5 w-5 rounded-full bg-[#242D96] p-1"
            />
          </button>
        </div>

        {results.length > 0 && (
          <div className="absolute left-0 top-full z-[999] mt-2 max-h-[420px] w-full overflow-y-auto rounded-xl bg-[#FFFEEB] shadow-md">
            {results.map((item, index) => (
              <div
                key={mode === "meals" ? item.idMeal : index}
                className={`searchResultItem ${
                  mode === "ingredients" &&
                  selectedIngredients.includes(item)
                    ? "active"
                    : ""
                }`}
                onClick={() => handleSelect(item)}
              >
                {mode === "meals" ? (
                  <>
                    <img
                      src={item.strMealThumb}
                      alt={item.strMeal}
                      className="h-12 w-12 rounded-[8px] object-cover"
                    />
                    <span>{item.strMeal}</span>
                  </>
                ) : (
                  <>
                    <img
                      src={`https://www.themealdb.com/images/ingredients/${item}.png`}
                      alt={item}
                      className="h-12 w-12 rounded-[8px] object-cover"
                      onError={(e) => (e.target.src = "/placeholder.png")}
                    />
                    <span>{item}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="mt-2 text-center text-sm text-[#242D96]">
            Searching...
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchBar;