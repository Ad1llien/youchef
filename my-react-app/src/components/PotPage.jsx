import { useNavigate } from "react-router-dom";
import "../styles/inYourPot.css";
import Line from "../icons/Line36.svg";
import pot from "../icons/closedPot.svg";

function PotPage({ checkPot = [], setCheckPot = () => {} }) {
  const navigate = useNavigate();

  const clearAllIngredients = () => {
    if (!checkPot || checkPot.length === 0) return;

    const permission = window.confirm(
      "Are you sure you want to remove all ingredients?"
    );
    if (!permission) return;

    setCheckPot([]);
    localStorage.removeItem("checkPot");
    navigate(-1); // можно заменить на navigate("/") если нужно
  };

  const handleDelete = (item) => {
    setCheckPot((prev) => prev.filter((i) => i !== item));
  };

  return (
    <div className="ingredientsWrapper">
      <h2 className="inYourPot">In your Pot</h2>

      <div className="Line36">
        <img src={Line} alt="" />
      </div>

      <div className="btnsWrapper">
        <button className="backBtn" onClick={() => navigate("/")}>
          ← Back
        </button>
        <button className="backBtn clearBtn" onClick={clearAllIngredients}>
          Clear all
        </button>
      </div>

      <div className="PotImage">
        <img src={pot} alt="pot" />
      </div>

      {!checkPot || checkPot.length === 0 ? (
        <p className="emptyText">No ingredients selected</p>
      ) : (
        <>
          <div className="potList">
            {checkPot.map((item) => (
              <div
                key={item}
                className="potRow"
                onClick={() => handleDelete(item)}
              >
                <span className="potLabel">Ingredient</span>
                <span className="potName">{item}</span>
                <span
                  className="deleteBtn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item);
                  }}
                >
                  Delete
                </span>
              </div>
            ))}
          </div>

          <div className="searchWrapper">
            <button
              className="searchBtn"
              onClick={() => navigate("/search-results", { state: { checkPot } })}
            >
              Search
            </button>
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
        </>
      )}
    </div>
  );
}

export default PotPage;