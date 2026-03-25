import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import youChefLogo from "../logos/logo.svg";
import accountLogo from "../icons/account-circle-line.svg"
import likes from "../icons/likes.svg"
import vipCrown from "../icons/crown.svg"
import qaa from "../icons/question-line.svg"
import guide from "../icons/news-line.svg"

function Header({ onBurgerClick }) {

  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // ✅ новый state для languages
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const menuRef = useRef(null);
  const langMenuRef = useRef(null);

  const changeLanguage = (lang) => {
    const select = document.querySelector(".goog-te-combo");
    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event("change"));
    }
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
    fetch("http://localhost:4000/api/user/data", {
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
    <header className="flex justify-between items-end pt-12 px-[146px] max-w-[1148px] mx-auto bg-[#FFFEEB]">
   
      <img
        src={youChefLogo}
        alt="YouChef Logo"
        className="w-[245px] h-[74px] block cursor-pointer"
        onClick={() => navigate("/")}
      />

      <nav className="flex gap-8 text-[#242D96] font-teachers text-xl font-normal items-center max-[393px]:hidden">

        <div className="cursor-pointer">recipe</div>
        <div className="cursor-pointer">premium</div>

        <div
          className="cursor-pointer"
          onClick={()=> {navigate("/contact")}}
        >
          contact
        </div>

        {/* ✅ LANGUAGE DROPDOWN */}
        <div className="relative ml-4 text-sm" ref={langMenuRef}>
          <div
            onClick={() => setLangMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 cursor-pointer"
          >
            Languages
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 transition-transform ${
                langMenuOpen ? "rotate-180" : "rotate-0"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {langMenuOpen && (
            <div className="absolute top-full mt-2 w-[140px] flex flex-col bg-white border border-[#BBC8D8] rounded-[5px] shadow-md z-50">
              <div
                className="p-2 cursor-pointer hover:bg-gray-100"
                onClick={() => changeLanguage("ru")}
              >
                Русский
              </div>
              <div
                className="p-2 cursor-pointer hover:bg-gray-100"
                onClick={() => changeLanguage("kk")}
              >
                Қазақша
              </div>
              <div
                className="p-2 cursor-pointer hover:bg-gray-100"
                onClick={() => changeLanguage("en")}
              >
                English
              </div>
              <div
                className="p-2 cursor-pointer hover:bg-gray-100"
                onClick={() => changeLanguage("es")}
              >
                Español
              </div>
            </div>
          )}
        </div>

        {user ? (
          <div className="relative ml-16" ref={menuRef}>
            <div
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 text-[#50576B] font-medium bg-white rounded-[30px] border border-[#242D96] w-[200px] px-3 py-1 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>

              <span className="truncate">{user.name}</span>

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
                  <div>likes</div>
                </div>

                <div className="modal-logo">
                  <img className="accLogo" src={vipCrown} alt="" />
                  <div>premium</div>
                  <div className="pr">Free</div>
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

      <div className="hidden max-[393px]:flex max-[393px]:gap-3 max-[393px]:items-center">
        {user ? (
          <div className="text-[#242D96] font-medium">{user.name}</div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="flex w-32 h-10 py-2.5 px-3 justify-center items-center rounded-full bg-[#242D96] text-white font-teachers text-lg font-medium"
          >
            login
          </button>
        )}

        <button
          className="text-[28px] bg-transparent border-none cursor-pointer text-[#242D96]"
          onClick={onBurgerClick}
        >
          ☰
        </button>
      </div>
    </header>
  );
}

export default Header;