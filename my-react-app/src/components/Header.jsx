import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import youChefLogo from "../logos/logo.svg";
import accountLogo from "../icons/account-circle-line.svg"
import likes from "../icons/likes.svg"
import vipCrown from "../icons/crown.svg"
import qaa from "../icons/question-line.svg"
import guide from "../icons/news-line.svg"
import menuLine from "../icons/menu-line.svg";
import API_BASE_URL from "../config/api";

function Header({ onBurgerClick }) {

  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("EN");

  // ✅ новый state для languages
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const menuRef = useRef(null);
  const langMenuRef = useRef(null);

  const changeLanguage = (lang) => {
    const select = document.querySelector(".goog-te-combo");
    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event("change"));
    }
  };

  const languageOptions = [
    { label: "ru", value: "ru" },
    { label: "kz", value: "kk" },
    { label: "en", value: "en" },
    { label: "es", value: "es" },
  ];

  const handleLanguageChange = (option) => {
    setCurrentLang(option.label);
    changeLanguage(option.value);
    setLangMenuOpen(false);
  };

  // закрытие профиля
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/user/data`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUser(data.userData);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <header className="flex justify-between items-center sm:items-end sm:flex-row pt-4 sm:pt-12 px-4 sm:px-[146px] max-w-[1148px] mx-auto bg-[#FFFEEB]">
   
      <img 
        src={youChefLogo}
        alt="YouChef Logo"
        className="youchef-logo w-[110px] h-auto sm:w-[245px] sm:h-[74px] block cursor-pointer"
        onClick={() => navigate("/")}
      />

      <nav className="hidden sm:flex gap-8 text-[#242D96] font-teachers text-xl font-normal items-center">

        <div className="cursor-pointer" onClick={() => navigate("/")}>Recipes</div>
        <div className=" premium-nav-link cursor-pointer" onClick={() => {
  if (!user) {
    setShowLoginModal(true);
  } else {
    navigate("/premium");
  }
}}>Premium</div>

        <div
          className="cursor-pointer"
          onClick={()=> {navigate("/contact")}}
        >
          Contact
        </div>

        <div className="relative ml-4 text-sm" ref={langMenuRef}>
          <div
            onClick={() => setLangMenuOpen((prev) => !prev)}
            className="flex items-center gap-1.5 cursor-pointer text-[30px] leading-none text-[#242D96] font-medium"
          >
            <span className="text-[20px] leading-none tracking-tight">{currentLang}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
                stroke="#242D96"
                strokeWidth="1.8"
              />
              <path d="M3 12H21" stroke="#242D96" strokeWidth="1.8" />
              <path d="M12 3C14.5 5.7 15.9 8.8 15.9 12C15.9 15.2 14.5 18.3 12 21" stroke="#242D96" strokeWidth="1.8" />
              <path d="M12 3C9.5 5.7 8.1 8.8 8.1 12C8.1 15.2 9.5 18.3 12 21" stroke="#242D96" strokeWidth="1.8" />
            </svg>
          </div>

          {langMenuOpen && (
            <div className="absolute top-full mt-2 w-[60px] flex flex-col bg-white border border-[#BBC8D8] rounded-[8px] shadow-md z-50">
              {languageOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-[#242D96] text-[20px] text-left border-none bg-transparent"
                  onClick={() => handleLanguageChange(option)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {user ? (
          <div className="relative " ref={menuRef}>
            <div
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 text-[#50576B] font-medium bg-white rounded-[30px] border border-[#242D96] w-[128px] px-1 py-1 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>

              <span className="truncate text-[20px]">{user.name}</span>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 text-[#242D96] ml-auto transition-transform ${
                  menuOpen ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {menuOpen && (
              <div
                className="absolute top-full mt-2 w-[210px] min-w-[180px] flex flex-col items-start gap-2 p-2 border border-[#BBC8D8] rounded-[5px] bg-white shadow-md z-50"
              >
                <div className="profile-modal">
                  <div className="relative w-8 h-8">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>

                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                  </div>

                  <div className="nameWrapper">
                    <div className="name">{user.name}</div>
                    <div className="email">{user.email}</div>
                  </div>
                </div>

                <hr className="hr" />

                <div className="account-modal">
                  account
                </div>

                <div className="modal-logo" onClick={() => {navigate("/my-account")}}>
                  <img className="accLogo" src={accountLogo} alt="" />
                  <div>account</div>
                </div>

                <div className="modal-logo" onClick={()=> {navigate("/my-likes")}}>
                  <img className="accLogo" src={likes} alt="" />
                  <div>Favorites</div>
                </div>

                <div className="modal-logo" onClick={() => navigate("/premium")}>
  <img className="accLogo" src={vipCrown} alt="" />
  <div>premium</div>
  <div className="pr" style={{ color: user?.premium ? "#FFB800" : undefined }}>
    {user?.premium ? "Premium" : "Free"}
  </div>
</div>
                <hr className="hr"/>

                <div className="account-modal">
                  support
                </div>

                <div className="modal-logo" onClick={()=> {navigate("/help-center")}}>
                  <img className="accLogo" src={qaa} alt="" />
                  <div>helpCenter</div>
                </div>

                <div className="modal-logo" onClick={()=> {navigate("/guide")}}>
                  <img className="accLogo" src={guide} alt="" />
                  <div>guides</div>
                </div>

              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="flex w-32 h-10 py-2.5 px-3 justify-center items-center gap-1 border-none cursor-pointer rounded-full bg-[#242D96] ml-16 text-white font-teachers text-lg font-medium"
          >
            login
          </button>
        )}
      </nav>

      <div className="flex sm:hidden gap-3 items-center">
        {user ? (
          <div className="text-[#242D96] font-medium">{user.name}</div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="flex w-[104px] h-10 py-2 px-3 justify-center items-center rounded-full bg-[#242D96] text-white font-teachers text-[20px] font-medium border-none"
          >
            login
          </button>
        )}

<button
  className=" bg-transparent border-none cursor-pointer w-7 h-7"
  onClick={() => {
    if (!user) {
      setShowLoginModal(true);
    } else {
      onBurgerClick();
    }
  }}
>
  <img src={menuLine} alt="menu" className="w-7 h-7" />
</button>
      </div>
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
    </header>
  );
}

export default Header;