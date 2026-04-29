import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
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
import RequestRecipe from "./components/requestRecipe";
import LegalPages from "./components/LegalPages";
import NotFound from "./components/NotFound";
import OfflineDetector from "./components/OfflineDetector";
import ErrorBoundary from "./components/ErrorBoundary";
import MealPlanner from "./components/MealPlanner";
import HistoryPage from "./components/HistoryPage";
import SEO from "./components/SEO";
import PremiumPromoModal from "./components/PremiumPromoModal";
import API_BASE_URL, { apiFetch } from "./config/api";
import AdminPanel from "./components/AdminPanel";
import MiniGame from "./components/MiniGame";
import BattleGame from "./components/BattleGame";

function AppWrapper() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <OfflineDetector>
            <App />
          </OfflineDetector>
        </ErrorBoundary>
      </BrowserRouter>
    </HelmetProvider>
  );
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [checkPot, setCheckPot] = useState(() => {
    const saved = localStorage.getItem("checkPot");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("checkPot", JSON.stringify(checkPot));
  }, [checkPot]);

  useEffect(() => {
    const handleCopy = (e) => {
      const selection = window.getSelection();
      if (!selection || selection.toString().length < 20) return;
      const attribution = `\n\n— Источник: YouChef (youchef.kz)`;
      e.clipboardData.setData("text/plain", selection.toString() + attribution);
      e.preventDefault();
    };
    document.addEventListener("copy", handleCopy);
    return () => document.removeEventListener("copy", handleCopy);
  }, []);

  const [activeTab, setActiveTab] = useState("popular");
  const isAuthPage = [
    "/login", "/signup", "/reset-password", "/verify-account", "/setNewPassword",
  ].includes(location.pathname);

  const [promoUser, setPromoUser] = useState(null);

useEffect(() => {
  apiFetch(`${API_BASE_URL}/api/user/data`, { method: "GET" })
    .then(res => res.json())
    .then(data => { if (data.success) setPromoUser(data.userData); })
    .catch(() => {});
}, []);
const isAdminPage = location.pathname === "/admin";

  return (
    <div className="App overflow-x-hidden">
      {!isAuthPage && !isAdminPage &&(
        <div className={mobileMenuOpen ? "relative z-50" : "relative"}>
          <Header onBurgerClick={() => setMobileMenuOpen((prev) => !prev)} />
          {mobileMenuOpen && !isAdminPage &&(
            <div className="absolute left-0 right-0 top-full z-50 flex flex-wrap items-center justify-center gap-4 bg-[#FFFEEB] p-4 font-normal sm:hidden text-[20px]" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="cursor-pointer border-none bg-transparent text-[#242D96] text-[20px] font-teachers" onClick={() => { navigate("/MealPlanner"); setMobileMenuOpen(false); }}>youCart</button>
              <button type="button" className="cursor-pointer border-none bg-transparent text-[#242D96] text-[20px] font-teachers" onClick={() => { navigate("/"); setMobileMenuOpen(false); }}>Recipe</button>
              <button type="button" className="cursor-pointer border-none bg-transparent text-[#242D96] text-[20px] font-teachers" onClick={() => { navigate("/premium"); setMobileMenuOpen(false); }}>Premium</button>
              <button type="button" className="cursor-pointer border-none bg-transparent text-[#242D96] text-[20px] font-teachers" onClick={() => { navigate("/contact"); setMobileMenuOpen(false); }}>Contact</button>
            </div>
          )}
        </div>
      )}

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/45 sm:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <main>
        <Routes>
          {/* ── Главная ── */}
          <Route path="/" element={
            <div className="main1stChild">
              <SEO
                title="Рецепты блюд — готовь вкусно каждый день"
                description="Тысячи рецептов завтраков, обедов и ужинов. Поиск по ингредиентам, план питания с AI, подсчёт калорий. Начни готовить вкусно с YouChef."
                url="https://youchef.kz"
              />
              <div className="recipeEmpty">Recipes</div>
              <MainNav activeTab={activeTab} setActiveTab={setActiveTab} />
              <SearchBar
                mode={activeTab === "create" ? "ingredients" : "meals"}
                selectedIngredients={checkPot}
                onIngredientSelect={(ingredient) => {
                  setCheckPot(prev => prev.includes(ingredient) ? prev.filter(i => i !== ingredient) : [...prev, ingredient]);
                }}
              />
              {activeTab === "popular" && <PopularMealContent />}
              {activeTab === "main" && <MainRecipeContent />}
              {activeTab === "create" && <CreateOwnMealContent checkPot={checkPot} setCheckPot={setCheckPot} />}
            </div>
          } />

          {/* ── Meal Planner ── */}
          <Route path="/MealPlanner" element={
            <>
              <SEO
                title="youCart — Планировщик покупок и блюд"
                description="Выбери блюда на неделю и получи список покупок. Найди ближайшие магазины. Умный планировщик питания от YouChef."
                url="https://youchef.kz/MealPlanner"
              />
              <MealPlanner />
            </>
          } />

          {/* ── Страница блюда ── */}
          <Route path="/meal/:id" element={
            <>
              <SEO
                title="Рецепт блюда"
                description="Пошаговый рецепт с ингредиентами, калориями, белками, углеводами и жирами. Смотри видео и скачивай PDF."
                url="https://youchef.kz/meal"
              />
              <MealPage />
            </>
          } />

          {/* ── Поиск ── */}
          <Route path="/search-results" element={
            <>
              <SEO
                title="Результаты поиска рецептов"
                description="Найди рецепт по названию или ингредиентам. Тысячи блюд на YouChef."
                url="https://youchef.kz/search-results"
              />
              <SearchResultsPage />
            </>
          } />

          {/* ── Premium ── */}
          <Route path="/premium" element={
            <>
              <SEO
                title="Premium — Безлимитный AI и эксклюзивные рецепты"
                description="Получи безлимитный доступ к AI анализу калорий, планированию питания и эксклюзивным рецептам. Подпишись на YouChef Premium."
                url="https://youchef.kz/premium"
              />
              <Premium />
            </>
          } />

          {/* ── Guides ── */}
          <Route path="/guide" element={
            <>
              <SEO
                title="Гайды по кулинарии и питанию"
                description="Полезные руководства по здоровому питанию, кулинарным техникам и планированию рациона от YouChef."
                url="https://youchef.kz/guide"
              />
              <Guides />
            </>
          } />

          {/* ── Contact ── */}
          <Route path="/contact" element={
            <>
              <SEO
                title="Контакты — Связаться с YouChef"
                description="Есть вопросы или предложения? Свяжитесь с командой YouChef. Мы рады помочь."
                url="https://youchef.kz/contact"
              />
              <Contact />
            </>
          } />

          {/* ── Help Center ── */}
          <Route path="/help-center" element={
            <>
              <SEO
                title="Центр помощи YouChef"
                description="Ответы на часто задаваемые вопросы о YouChef. Как пользоваться AI, как оформить Premium, как найти рецепт."
                url="https://youchef.kz/help-center"
              />
              <HelpCenter />
            </>
          } />

          {/* ── Request Recipe ── */}
          <Route path="/request-recipe" element={
            <>
              <SEO
                title="Запросить рецепт — YouChef"
                description="Не нашёл нужный рецепт? Отправь запрос и наши повара добавят его в каталог YouChef."
                url="https://youchef.kz/request-recipe"
              />
              <RequestRecipe />
            </>
          } />

          {/* ── Legal ── */}
          <Route path="/terms" element={
            <>
              <SEO title="Условия использования" description="Условия использования сервиса YouChef." url="https://youchef.kz/terms" />
              <LegalPages />
            </>
          } />
          <Route path="/privacy" element={
            <>
              <SEO title="Политика конфиденциальности" description="Политика конфиденциальности YouChef. Как мы храним и защищаем ваши данные." url="https://youchef.kz/privacy" />
              <LegalPages />
            </>
          } />
          <Route path="/refund" element={
            <>
              <SEO title="Политика возврата" description="Условия возврата средств за Premium подписку YouChef." url="https://youchef.kz/refund" />
              <LegalPages />
            </>
          } />

          {/* ── Auth страницы (SEO не нужен — noindex) ── */}
          <Route path="/login" element={<><SEO title="Войти в YouChef" description="Войдите в свой аккаунт YouChef." /><LoginPage /></>} />
          <Route path="/signup" element={<><SEO title="Регистрация в YouChef" description="Создайте аккаунт YouChef бесплатно." /><SignUpPage /></>} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-account" element={<VerifyCodePage />} />
          <Route path="/setNewPassword" element={<SetNewPasswordPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/check-email" element={<CheckEmailPage />} />

          {/* ── Личный кабинет (noindex) ── */}
          <Route path="/my-account" element={<MyAccount />} />
          <Route path="/my-likes" element={<MyLikes />} />
          <Route path="/password-manager" element={<PasswordManager />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/pot" element={<PotPage checkPot={checkPot} setCheckPot={setCheckPot} />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/MiniGame" element={<MiniGame />} />
          <Route path="/battle" element={<BattleGame user={promoUser} onClose={() => navigate("/")} />} />


          {/* ── 404 ── */}
          <Route path="*" element={
            <>
              <SEO title="Страница не найдена" description="Страница не найдена на YouChef." />
              <NotFound />
            </>
          } />
        </Routes>
      </main>
      {!isAdminPage && <PremiumPromoModal user={promoUser} />}
      {!isAdminPage && <Footer />}
    </div>
  );
}

export default AppWrapper;