import { useNavigate } from "react-router-dom";
import "../styles/inYourPot.css";
import Line from "../icons/Line36.svg";
import pot from "../icons/openPot.svg";

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

      {/* Кнопки Back / Clear такие же, как на странице результатов */}
      <div className="btnsWrapper">
        <button className="backBtn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div />
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
            {checkPot.map((item, index) => (
              <div
                key={item}
                className="potRow"
                onClick={() => handleDelete(item)}
              >
                <span className="potName">{item}</span>
                <svg className="potLine" width="100%" height="9" viewBox="0 0 511 9" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                  <g filter={`url(#filter_wavy_${index})`}>
                    <line x1="3.00065" y1="4" x2="508.001" y2="4.32665" stroke="currentColor" strokeWidth="2"/>
                  </g>
                  <defs>
                    <filter id={`filter_wavy_${index}`} x="0" y="0" width="511" height="8.32812" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                      <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                      <feTurbulence type="fractalNoise" baseFrequency="0.2083333283662796 0.2083333283662796" numOctaves="3" seed="6150" />
                      <feDisplacementMap in="shape" scale="6" xChannelSelector="R" yChannelSelector="G" result="displacedImage" width="100%" height="100%" />
                      <feMerge result="effect1_texture_702_9862">
                        <feMergeNode in="displacedImage"/>
                      </feMerge>
                    </filter>
                  </defs>
                </svg>
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