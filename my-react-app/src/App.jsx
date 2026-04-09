import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate
} from "react-router-dom";
import Contact from "./components/contact"
import PasswordManager  from "./components/PasswordManager";
import HelpCenter from "./components/HelpCenter";
import MyAccount from "../src/components/myAccount"
import { useLocation } from "react-router-dom";
import MyLikes from "./components/MyLikes"
import LoginPage from "./pages/loginPage";
import SignUpPage from "./pages/SignUpPage"
import "./App.css";
import ResetPasswordPage from "./pages/resetPassword"
import VerifyCodePage from "./pages/VerifyCodePage"
import SetNewPasswordPage from "./pages/SetNewPassword";
import MealPage from "./components/MealPage";
import PotPage from "./components/PotPage";
import PopularMealContent from "./components/PopularMealContent";
import MainRecipeContent from "./components/MainRecipeContent";
import CreateOwnMealContent from "./components/CreateOwnMealContent";
import SearchResultsPage from "./components/SearchResultsPage";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import Guides from "./components/Guides"
import instagramIcon from "./icons/instagram.svg";
import telegramIcon from "./icons/telegram.svg";
import tiktokIcon from "./icons/tik-tok.svg";
import footlines from "./icons/footerlines.svg";
import VerifyPage from "./pages/VerifyPage";
import CheckEmailPage from "./pages/CheckEmailPage"
import RequestRecipe from "./components/requestRecipe";/* ================= APP WRAPPER ================= */
import BuyPremium from "./components/premium";
function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

/* ================= APP ================= */
function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tgUser, setTgUser] = useState(null);
  /* 🍔 mobile menu */
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  /* 🫕 кастрюля */
  const [checkPot, setCheckPot] = useState(() => {
    const saved = localStorage.getItem("checkPot");
    return saved ? JSON.parse(saved) : [];
  });
  

  useEffect(() => {
    localStorage.setItem("checkPot", JSON.stringify(checkPot));
  }, [checkPot]);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
  
      tg.onEvent("themeChanged", () => {}); // чтобы WebApp точно инициализировался
      tg.ready();
      tg.expand();
  
      console.log("Telegram initData:", tg.initData); // полные данные
      console.log("Telegram unsafe user:", tg.initDataUnsafe?.user);
  
      setTgUser(tg.initDataUnsafe?.user || null);
    }
  }, []);
  /* 📂 вкладки */
  const [activeTab, setActiveTab] = useState("popular");
  const isAuthPage = ["/login", "/signup", "/reset-password", "/verify-account", "/setNewPassword"].includes(location.pathname);

  /* 🔍 поиск */
  // поиск теперь живет внутри компонента SearchBar

  return (
    <div className="App overflow-x-hidden">
      {!isAuthPage && (
      <Header onBurgerClick={() => setMobileMenuOpen((prev) => !prev)} />
      )}
      {/* MOBILE SLIDE MENU */}
      {mobileMenuOpen && (
        <div
          className="mobile-slide-menu"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div>Recipe</div>
          <div>Premium</div>
          <div>Contact</div>
        </div>
      )}

      {/* ================= MAIN ================= */}
      <main>
        <Routes>

          <Route
            path="/"
            element={
              <div className="main1stChild">

                <div className="recipeEmpty">Recipes</div>

                <div className="mainNavBtns">
                  <div
                    className={activeTab === "main" ? "active" : ""}
                    onClick={() => setActiveTab("main")}
                  >
                    Main Recipe
                  </div>

                  <div
                    className={activeTab === "popular" ? "active" : ""}
                    onClick={() => setActiveTab("popular")}
                  >
                    Popular Meals
                  </div>

                  <div
                    className={activeTab === "create" ? "active" : ""}
                    onClick={() => setActiveTab("create")}
                  >
                    Create Own Meal
                  </div>
                </div>

                <SearchBar
  mode={activeTab === "create" ? "ingredients" : "meals"}
  selectedIngredients={checkPot}
  onIngredientSelect={(ingredient) => {
    setCheckPot((prev) =>
      prev.includes(ingredient)
        ? prev.filter((i) => i !== ingredient) // toggle OFF
        : [...prev, ingredient] // toggle ON
    );
  }}
/>

                {activeTab === "popular" && <PopularMealContent />}
                {activeTab === "main" && <MainRecipeContent />}
                {activeTab === "create" && (
                  <CreateOwnMealContent
                    checkPot={checkPot}
                    setCheckPot={setCheckPot}
                  />
                )}
              </div>
            }
          />

          <Route
            path="/pot"
            element={
              <PotPage
                checkPot={checkPot}
                setCheckPot={setCheckPot}
              />
            }
          />

          <Route path="/meal/:id" element={<MealPage />} />
          <Route path="/search-results" element={<SearchResultsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} /> 
          <Route path="/verify-account" element={<VerifyCodePage />} /> 
          <Route path="/setNewPassword" element={<SetNewPasswordPage />} /> 
          <Route path="/my-account" element={<MyAccount/>}/>
          <Route path="/my-likes" element={<MyLikes/>}/>
          <Route path="/contact" element={<Contact />}></Route>
          <Route path="/help-center" element={<HelpCenter/>}></Route>
          <Route path="/guide" element={<Guides />}></Route>
          <Route path="/password-manager" element={< PasswordManager/>}></Route>
          <Route path="/verify" element={<VerifyPage />}></Route>
          <Route path="/check-email" element={<CheckEmailPage />} />
          <Route path="/request-recipe" element={<RequestRecipe />} />
          <Route path="/buy-premium" element={<BuyPremium tgUser={tgUser}/>} />          
          
          </Routes>
      </main>

      {/* ================= FOOTER ================= */}
      <footer>
        <img className="line5 max-w-full mx-auto" src={footlines} alt="" />

        <div className="footerText">
          <div className="makeUs">Make us a part of your lifestyle</div>
          <div className="tasteIn">
            A taste of home <br /> in every dish
          </div>
        </div>

        <div className="socialLogos">
          <img src={instagramIcon} alt="" />
          <img src={telegramIcon} alt="" />
          <img src={tiktokIcon} alt="" />
        </div>
      </footer>

    </div>
  );
}

export default AppWrapper;