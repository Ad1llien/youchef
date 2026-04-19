import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL, { apiFetch } from "../config/api";
import AccountNavigation from "./AccountNavigation";

function HistoryPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("meals");
  const [mealHistory, setMealHistory] = useState([]);
  const [aiHistory, setAiHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [expandedAI, setExpandedAI] = useState(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const [mealRes, aiRes] = await Promise.all([
        apiFetch(`${API_BASE_URL}/api/user/history/meal`),
        apiFetch(`${API_BASE_URL}/api/user/history/ai`),
      ]);
      const mealData = await mealRes.json();
      const aiData = await aiRes.json();
      if (mealData.success) setMealHistory(mealData.history);
      if (aiData.success) setAiHistory(aiData.history);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async (type) => {
    setClearing(true);
    try {
      await apiFetch(`${API_BASE_URL}/api/user/history/${type}`, { method: "DELETE" });
      if (type === "meal") setMealHistory([]);
      else setAiHistory([]);
    } catch (err) {
      console.error(err);
    } finally {
      setClearing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiFetch(`${API_BASE_URL}/api/auth/logout`, { method: "POST" });
      navigate("/login");
    } catch (err) { console.error(err); }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="mx-auto mt-[102px] w-full max-w-6xl px-4 md:px-6 pb-20">
      <h1 className="mb-6 text-center font-['Taviraj'] text-[32px] font-normal leading-normal text-[#242D96] md:mb-[80px]">
        My Account
      </h1>

      <div className="flex flex-col gap-11 md:gap-20 md:flex-row md:items-start">
        <AccountNavigation
          activeItem="history"
          onOpenPersonalInfo={() => navigate("/my-account")}
          onSubscription={() => navigate("/premium")}
          onOpenPasswordManager={() => navigate("/password-manager")}
          onOpenLikes={() => navigate("/my-likes")}
          onHistory={() => navigate("/history")}
          onLogout={() => setShowLogoutModal(true)}
          
        />

        <div className="w-full md:flex-1">
          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, marginBottom: 28, borderBottom: "2px solid #EEF0FB" }}>
            {[
              { key: "meals", label: "Meal History", icon: "🍽" },
              { key: "ai", label: "AI Requests", icon: "🤖" },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: "10px 20px", border: "none", cursor: "pointer",
                  background: "none", fontFamily: "Teachers, sans-serif", fontSize: 15,
                  color: activeTab === tab.key ? "#242D96" : "#788CA5",
                  fontWeight: activeTab === tab.key ? 600 : 400,
                  borderBottom: activeTab === tab.key ? "2px solid #242D96" : "2px solid transparent",
                  marginBottom: -2, display: "flex", alignItems: "center", gap: 6,
                  transition: "all 0.2s",
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loader" style={{ margin: "60px auto" }} />
          ) : (
            <>
              {/* ── MEAL HISTORY ── */}
              {activeTab === "meals" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <p style={{ color: "#788CA5", fontSize: 13, fontFamily: "Teachers, sans-serif", margin: 0 }}>
                      Last {mealHistory.length} viewed meals
                    </p>
                    {mealHistory.length > 0 && (
                      <button onClick={() => clearHistory("meal")} disabled={clearing}
                        style={{ background: "none", border: "1px solid #BBC8D8", borderRadius: 20, padding: "4px 12px", cursor: "pointer", color: "#788CA5", fontSize: 12, fontFamily: "Teachers, sans-serif" }}>
                        Clear history
                      </button>
                    )}
                  </div>

                  {mealHistory.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 0", color: "#BBC8D8" }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>🍽</div>
                      <p style={{ fontFamily: "Teachers, sans-serif", fontSize: 15 }}>No meal history yet</p>
                      <p style={{ fontFamily: "Teachers, sans-serif", fontSize: 13, marginTop: 4 }}>Browse recipes to see them here</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {mealHistory.map((meal, idx) => (
                        <div key={idx}
                          onClick={() => navigate(`/meal/${meal.idMeal}`)}
                          style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "white", borderRadius: 14, border: "1.5px solid #e8ecf8", cursor: "pointer", transition: "all 0.2s" }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = "#242D96"}
                          onMouseLeave={e => e.currentTarget.style.borderColor = "#e8ecf8"}
                        >
                          <img src={meal.strMealThumb} alt={meal.strMeal}
                            style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontWeight: 600, color: "#242D96", fontSize: 14, fontFamily: "Teachers, sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {meal.strMeal}
                            </p>
                            {meal.strCategory && (
                              <p style={{ margin: "3px 0 0", color: "#788CA5", fontSize: 12, fontFamily: "Teachers, sans-serif" }}>
                                {meal.strCategory}
                              </p>
                            )}
                          </div>
                          <div style={{ color: "#BBC8D8", fontSize: 12, fontFamily: "Teachers, sans-serif", flexShrink: 0 }}>
                            {formatDate(meal.viewedAt)}
                          </div>
                          <div style={{ color: "#BBC8D8", fontSize: 18 }}>›</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── AI HISTORY ── */}
              {activeTab === "ai" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <p style={{ color: "#788CA5", fontSize: 13, fontFamily: "Teachers, sans-serif", margin: 0 }}>
                      Last {aiHistory.length} AI requests
                    </p>
                    {aiHistory.length > 0 && (
                      <button onClick={() => clearHistory("ai")} disabled={clearing}
                        style={{ background: "none", border: "1px solid #BBC8D8", borderRadius: 20, padding: "4px 12px", cursor: "pointer", color: "#788CA5", fontSize: 12, fontFamily: "Teachers, sans-serif" }}>
                        Clear history
                      </button>
                    )}
                  </div>

                  {aiHistory.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 0", color: "#BBC8D8" }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
                      <p style={{ fontFamily: "Teachers, sans-serif", fontSize: 15 }}>No AI requests yet</p>
                      <p style={{ fontFamily: "Teachers, sans-serif", fontSize: 13, marginTop: 4 }}>Use AI Assistant to generate meal plans</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {aiHistory.map((item, idx) => (
                        <div key={idx} style={{ background: "white", borderRadius: 14, border: "1.5px solid #e8ecf8", overflow: "hidden" }}>
                          {/* Header */}
                          <div
                            onClick={() => setExpandedAI(expandedAI === idx ? null : idx)}
                            style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer" }}
                          >
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: item.type === "photo" ? "#FFF3E0" : "#EEF0FB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                              {item.type === "photo" ? "📷" : "🗓"}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ margin: 0, fontWeight: 600, color: "#242D96", fontSize: 14, fontFamily: "Teachers, sans-serif" }}>
                                {item.type === "photo" ? `Photo: ${item.result?.dish || item.query}` : "Meal Plan"}
                              </p>
                              <p style={{ margin: "2px 0 0", color: "#788CA5", fontSize: 12, fontFamily: "Teachers, sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {item.query}
                              </p>
                            </div>
                            <div style={{ color: "#BBC8D8", fontSize: 12, fontFamily: "Teachers, sans-serif", flexShrink: 0, marginRight: 4 }}>
                              {formatDate(item.createdAt)}
                            </div>
                            <div style={{ color: "#BBC8D8", fontSize: 16, transform: expandedAI === idx ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s" }}>›</div>
                          </div>

                          {/* Expanded content */}
                          {expandedAI === idx && item.result && (
                            <div style={{ borderTop: "1px solid #f3f4f6", padding: "14px 16px", background: "#f8f9ff" }}>
                              {item.type === "plan" && item.result.plan && (
                                <div>
                                  <p style={{ margin: "0 0 10px", fontSize: 12, color: "#788CA5", fontFamily: "Teachers, sans-serif" }}>
                                    ~{item.result.total_daily_calories} kcal/day · {item.result.notes}
                                  </p>
                                  {item.result.plan.map((day, di) => (
                                    <div key={di} style={{ marginBottom: 8, background: "white", borderRadius: 10, padding: "10px 12px" }}>
                                      <p style={{ margin: "0 0 6px", fontWeight: 600, color: "#242D96", fontSize: 13, fontFamily: "Teachers, sans-serif" }}>{day.day}</p>
                                      {["breakfast", "lunch", "dinner"].map(m => (
                                        <div key={m} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "2px 0", fontFamily: "Teachers, sans-serif" }}>
                                          <span style={{ color: "#788CA5", width: 64, flexShrink: 0, textTransform: "capitalize" }}>{m}</span>
                                          <span style={{ color: "#343B1B", flex: 1 }}>{day[m]?.name || "—"}</span>
                                          <span style={{ color: "#242D96", fontWeight: 600 }}>{day[m]?.calories} kcal</span>
                                        </div>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {item.type === "photo" && item.result && (
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                  {[
                                    { label: "Calories", value: `${item.result.total_calories} kcal` },
                                    { label: "Protein", value: `${item.result.protein}g` },
                                    { label: "Carbs", value: `${item.result.carbs}g` },
                                    { label: "Fat", value: `${item.result.fat}g` },
                                  ].map(n => (
                                    <div key={n.label} style={{ background: "white", borderRadius: 10, padding: "10px", textAlign: "center" }}>
                                      <p style={{ margin: 0, color: "#788CA5", fontSize: 11, fontFamily: "Teachers, sans-serif" }}>{n.label}</p>
                                      <p style={{ margin: "4px 0 0", color: "#242D96", fontWeight: 700, fontSize: 16, fontFamily: "Teachers, sans-serif" }}>{n.value}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-[340px] rounded-2xl bg-white p-6 text-center shadow-xl">
            <h3 className="mb-2 text-xl font-semibold text-[#13151A]">Logout</h3>
            <p className="mb-6 text-sm text-[#555]">Are you sure you want to log out?</p>
            <div className="flex justify-between gap-3">
              <button className="flex-1 rounded-lg bg-[#eee] px-4 py-2.5 text-sm font-medium text-[#333]" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button className="flex-1 rounded-lg bg-[#e53935] px-4 py-2.5 text-sm font-medium text-white" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistoryPage;