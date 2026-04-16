import { useNavigate } from "react-router-dom";
import "../styles/inYourPot.css";
import Line from "../icons/Line36.svg";
import pot from "../icons/openPot.svg";
import deleteIcon from "../icons/deleteIcon.svg";
import backIcon from "../icons/back.svg";
import API_BASE_URL from "../config/api";
import { useState, useEffect } from "react";

function PotPage({ checkPot = [], setCheckPot = () => {} }) {
  
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
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
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/user/data`, {
      method: "GET",
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setUser(data.userData);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="ingredientsWrapper">
      <div className="potTitleRow">
        <button className="potBackIconBtn" onClick={() => navigate(-1)} aria-label="Go back">
          <img src={backIcon} alt="" />
        </button>
        <h2 className="inYourPot text-[32px]">In your Pot</h2>
      </div>

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
                <svg className="potLine " width="100%" height="9" viewBox="0 0 511 9" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
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
                  <img className="deleteIcon" src={deleteIcon} alt="" />
                  <span className="deleteText">Delete</span>
                </span>
              </div>
            ))}
          </div>

          <div className="searchWrapper">
          <button
  className="searchBtn"
  onClick={() => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    navigate("/search-results", { state: { checkPot } });
  }}
>
  <p className="font-teachers text-[22px] m-0">Search</p>
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

          <button className="requestRecipe" onClick={() =>{
            if (!user) {
              setShowLoginModal(true);
            } else{
            navigate("/request-recipe")}}}>Request Recipe</button>
        </>
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
    </div>
  );
}

export default PotPage;