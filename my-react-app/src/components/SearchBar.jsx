import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import searchIcon from "../icons/search-2-line.svg";

function SearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`,
        );
        const data = await res.json();
        setResults(data.meals ? data.meals.slice(0, 10) : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setResults([]);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectMeal = (meal) => {
    setQuery("");
    setResults([]);
    navigate(`/meal/${meal.idMeal}`);
  };

  return (
    <div className="flex justify-center mt-6">
      <div
        ref={containerRef}
        className="relative w-[588px] h-10 transition-all duration-300 hover:w-[488px] focus-within:w-[488px]"
      >
        <input
          className="w-full h-full rounded-[30px] border border-[#ccc] px-5 text-[16px] text-[#242D96] outline-none transition-all placeholder:transition-opacity placeholder:duration-200 focus:placeholder:opacity-0 hover:border-[#242D96]"
          placeholder="Which meal you want? Search it"
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
            {results.map((meal) => (
              <div
                key={meal.idMeal}
                className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-[rgba(255,255,255,0.08)]"
                onClick={() => handleSelectMeal(meal)}
              >
                <img
                  src={meal.strMealThumb}
                  alt={meal.strMeal}
                  className="w-12 h-12 rounded-[8px] object-cover"
                />
                <span className="text-black text-sm">{meal.strMeal}</span>
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

