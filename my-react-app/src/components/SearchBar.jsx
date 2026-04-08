import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import searchIcon from "../icons/search-2-line.svg";
import hybridMeals from "../mealsDB.json";
import ingredientsData from "../../classified_ingredients.json";
import { mealDictionary } from "../../../backend/backend/utils/mealDictionary.js";

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
      const res = await fetch("http://localhost:4000/api/translate", {
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
    <div className="flex justify-center mt-6">
      <div
        ref={containerRef}
        className="relative w-[588px] h-10 transition-all duration-300 hover:w-[488px] focus-within:w-[488px]"
      >
        <input
          className="w-full h-full rounded-[30px] border border-[#ccc] px-5 text-[16px] text-[#242D96] outline-none"
          placeholder={
            mode === "ingredients"
              ? "Search ingredient..."
              : "Which meal you want? Search it"
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button
          type="button"
          className="absolute right-[1px] top-1/2 -translate-y-[45%] border-none bg-transparent cursor-pointer p-1"
        >
          <img
            src={searchIcon}
            alt="Search"
            className="w-5 h-5 transition-transform p-1 bg-[#242D96] rounded-[14px]"
          />
        </button>

        {results.length > 0 && (
          <div className="absolute top-full left-0 w-full bg-[#FFFEEB] rounded-xl mt-2 z-[999] max-h-[420px] overflow-y-auto shadow-md">
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
                      className="w-12 h-12 rounded-[8px] object-cover"
                    />
                    <span>{item.strMeal}</span>
                  </>
                ) : (
                  <>
                    <img
                      src={`https://www.themealdb.com/images/ingredients/${item}.png`}
                      alt={item}
                      className="w-12 h-12 rounded-[8px] object-cover"
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
          <div className="mt-2 text-sm text-center text-[#242D96]">
            Searching...
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchBar;