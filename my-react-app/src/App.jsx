import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Contact from "./components/contact";
import PasswordManager from "./components/PasswordManager";
import HelpCenter from "./components/HelpCenter";
import MyAccount from "../src/components/myAccount";
import { useLocation } from "react-router-dom";
import MyLikes from "./components/MyLikes";
import LoginPage from "./pages/loginPage";
import SignUpPage from "./pages/SignUpPage";
import "./App.css";
import ResetPasswordPage from "./pages/resetPassword";
import VerifyCodePage from "./pages/VerifyCodePage";
import SetNewPasswordPage from "./pages/SetNewPassword";
import Premium from "./components/premium";
import MealPage from "./components/MealPage";
import PotPage from "./components/PotPage";
import PopularMealContent from "./components/PopularMealContent";
import MainRecipeContent from "./components/MainRecipeContent";
import CreateOwnMealContent from "./components/CreateOwnMealContent";
import SearchResultsPage from "./components/SearchResultsPage";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import MainNav from "./components/MainNav";
import Footer from "./components/Footer";
import Guides from "./components/Guides";
import VerifyPage from "./pages/VerifyPage";
import CheckEmailPage from "./pages/CheckEmailPage";
import RequestRecipe from "./components/requestRecipe"; /* ================= APP WRAPPER ================= */
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

  /* 📂 вкладки */
  const [activeTab, setActiveTab] = useState("popular");
  const isAuthPage = [
    "/login",
    "/signup",
    "/reset-password",
    "/verify-account",
    "/setNewPassword",
  ].includes(location.pathname);

  /* 🔍 поиск */
  // поиск теперь живет внутри компонента SearchBar

  return (
    <div className="App overflow-x-hidden">
      {!isAuthPage && (
        <div className={mobileMenuOpen ? "relative z-50" : "relative"}>
          <Header onBurgerClick={() => setMobileMenuOpen((prev) => !prev)} />
          {/* MOBILE SLIDE MENU */}
          {mobileMenuOpen && (
            <div
              className="absolute left-0 right-0 top-full z-50 flex items-center justify-center gap-8 bg-[#FFFEEB] p-4 font-normal sm:hidden text-[20px]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="cursor-pointer border-none bg-transparent text-[#242D96] text-[20px] font-teachers"
                onClick={() => {
                  navigate("/");
                  setMobileMenuOpen(false);
                }}
              >
                Recipe
              </button>
              <button
                type="button"
                className="cursor-pointer border-none bg-transparent text-[#242D96] text-[20px] font-teachers"
                onClick={() => {
                  navigate("/premium");
                  setMobileMenuOpen(false);
                }}
              >
                Premium
              </button>
              <button
                type="button"
                className="cursor-pointer border-none bg-transparent text-[#242D96] text-[20px] font-teachers"
                onClick={() => {
                  navigate("/contact");
                  setMobileMenuOpen(false);
                }}
              >
                Contact
              </button>
            </div>
          )}
        </div>
      )}

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/45 sm:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ================= MAIN ================= */}
      <main>
        <Routes>
          <Route
            path="/"
            element={
              <div className="main1stChild">
                <div className="recipeEmpty">Recipes</div>

                <MainNav activeTab={activeTab} setActiveTab={setActiveTab} />

                <SearchBar
                  mode={activeTab === "create" ? "ingredients" : "meals"}
                  selectedIngredients={checkPot}
                  onIngredientSelect={(ingredient) => {
                    setCheckPot(
                      (prev) =>
                        prev.includes(ingredient)
                          ? prev.filter((i) => i !== ingredient) // toggle OFF
                          : [...prev, ingredient], // toggle ON
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
            element={<PotPage checkPot={checkPot} setCheckPot={setCheckPot} />}
          />

          <Route path="/meal/:id" element={<MealPage />} />
          <Route path="/search-results" element={<SearchResultsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-account" element={<VerifyCodePage />} />
          <Route path="/setNewPassword" element={<SetNewPasswordPage />} />
          <Route path="/my-account" element={<MyAccount />} />
          <Route path="/my-likes" element={<MyLikes />} />
          <Route path="/contact" element={<Contact />}></Route>
          <Route path="/help-center" element={<HelpCenter />}></Route>
          <Route path="/guide" element={<Guides />}></Route>
          <Route path="/password-manager" element={<PasswordManager />}></Route>

          <Route path="/premium" element={<Premium />}></Route>
          <Route path="/verify" element={<VerifyPage />}></Route>
          <Route path="/check-email" element={<CheckEmailPage />} />
          <Route path="/request-recipe" element={<RequestRecipe />} />
        </Routes>
      </main>

      {/* ================= FOOTER ================= */}
      <Footer />
    </div>
  );
}

export default AppWrapper;
