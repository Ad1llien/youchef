import { useState, useEffect, useRef } from "react";import API_BASE_URL from "../config/api";
import { useNavigate } from "react-router-dom";
function AIAssistant() {
    const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [planText, setPlanText] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileRef = useRef(null);
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
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
  const handleOpen = () => {
    setIsOpen(true);
    setMode(null);
    setResult(null);
    setPreviewUrl(null);
    setPlanText("");
  };

  const handleClose = () => {
    setIsOpen(false);
    setMode(null);
    setResult(null);
    setPreviewUrl(null);
    setPlanText("");
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setLoading(true);
    setResult(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target.result.split(",")[1];
      const mediaType = file.type;
      try {
        const res = await fetch(`${API_BASE_URL}/api/ai/analyze-food`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ imageBase64: base64, mediaType }),
        });
        const data = await res.json();
        if (data.success) setResult({ type: "photo", data: data.data });
        else setResult({ type: "error", message: data.message });
      } catch {
        setResult({ type: "error", message: "Something went wrong" });
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMealPlan = async () => {
    if (!planText.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/meal-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ preferences: planText }),
      });
      const data = await res.json();
      if (data.success) setResult({ type: "plan", data: data.data });
      else setResult({ type: "error", message: data.message });
    } catch {
      setResult({ type: "error", message: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes ripple1 {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes ripple2 {
          0% { transform: scale(1); opacity: 0.3; }
          100% { transform: scale(3); opacity: 0; }
        }
        .ai-ripple1 { animation: ripple1 2s ease-out infinite; }
        .ai-ripple2 { animation: ripple2 2s ease-out infinite 0.6s; }
      `}</style>

      {/* Floating button */}
      <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[999]">
        <span className="ai-ripple1 absolute inset-0 rounded-full bg-[#242D96]/20" />
        <span className="ai-ripple2 absolute inset-0 rounded-full bg-[#242D96]/10" />
        <button
          onClick={() => {
            if (!user) {
              setShowLoginModal(true);
            } else {
              handleOpen();
            }
          }}
          className="ai-assistant-btn relative z-10 w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full bg-[#242D96] border-none cursor-pointer flex items-center justify-center shadow-[0_6px_24px_rgba(36,45,150,0.45)] hover:scale-105 transition-transform"
        >
          {/* Chef hat / AI icon */}
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C9.5 2 7.5 3.8 7.5 6c0 .4.1.8.2 1.2A4 4 0 0 0 4 11c0 2.2 1.8 4 4 4h8a4 4 0 0 0 4-4 4 4 0 0 0-3.7-3.8c.1-.4.2-.8.2-1.2C16.5 3.8 14.5 2 12 2z"/>
            <path d="M8 15v2a4 4 0 0 0 8 0v-2"/>
            <path d="M9 11h.01M12 11h.01M15 11h.01"/>
          </svg>
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[1000] p-0 sm:p-4"
          onClick={handleClose}
        >
          <div
            className="bg-white w-full sm:max-w-[480px] rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[92vh] overflow-y-auto font-['Teachers']"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle on mobile */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="bg-[#242D96] px-6 pt-5 pb-6 text-center">
              <p className="text-white/60 text-[11px] tracking-[2px] uppercase mb-2 font-['Teachers']">
                AI Assistant
              </p>
              <h2 className="text-white text-[20px] font-medium mb-1 font-['Teachers']">
                {mode === "photo" ? "Food Analysis"
                  : mode === "plan" ? "Meal Planner"
                  : "What can I help with?"}
              </h2>
              <p className="text-white/70 text-[13px] font-['Teachers']">
                {mode === "photo" ? "Upload a photo to get nutrition info"
                  : mode === "plan" ? "Describe your diet preferences"
                  : "Choose one of the options below"}
              </p>
            </div>

            <div className="p-5 sm:p-6">

              {/* Mode selection */}
              {!mode && (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setMode("photo")}
                    className="flex items-center gap-4 p-4 sm:p-5 border border-[#BBC8D8] rounded-2xl bg-white cursor-pointer text-left hover:border-[#242D96] transition"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#EEF0FB] flex items-center justify-center flex-shrink-0">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#242D96" strokeWidth="1.8">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-[#242D96] text-[15px] font-['Teachers']">Analyze Food Photo</div>
                      <div className="text-gray-400 text-[13px] mt-0.5 font-['Teachers']">Get calories, protein, carbs & fat</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setMode("plan")}
                    className="flex items-center gap-4 p-4 sm:p-5 border border-[#BBC8D8] rounded-2xl bg-white cursor-pointer text-left hover:border-[#242D96] transition"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#EEF0FB] flex items-center justify-center flex-shrink-0">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#242D96" strokeWidth="1.8">
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <path d="M16 2v4M8 2v4M3 10h18"/>
                        <path d="M8 14h2M8 18h2M14 14h2M14 18h2"/>
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-[#242D96] text-[15px] font-['Teachers']">Weekly Meal Plan</div>
                      <div className="text-gray-400 text-[13px] mt-0.5 font-['Teachers']">AI creates a 7-day plan for you</div>
                    </div>
                  </button>
                </div>
              )}

              {/* Photo mode */}
              {mode === "photo" && !result && (
                <div>
                  {!previewUrl ? (
                    <div
                      onClick={() => fileRef.current.click()}
                      className="border-2 border-dashed border-[#BBC8D8] rounded-2xl p-10 text-center cursor-pointer mb-4 hover:border-[#242D96] transition"
                    >
                      <div className="text-4xl mb-3">📷</div>
                      <p className="text-[#242D96] font-medium mb-1 font-['Teachers']">Upload food photo</p>
                      <p className="text-gray-400 text-[13px] font-['Teachers']">JPG, PNG up to 5MB</p>
                    </div>
                  ) : (
                    <img src={previewUrl} alt="food" className="w-full max-h-[200px] object-cover rounded-2xl mb-4" />
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  {loading && (
                    <p className="text-center text-[#242D96] text-[14px] py-3 font-['Teachers']">Analyzing your food...</p>
                  )}
                  <button
                    onClick={() => setMode(null)}
                    className="w-full py-2.5 rounded-full border border-[#BBC8D8] bg-transparent text-gray-400 text-[14px] cursor-pointer font-['Teachers'] mt-2"
                  >
                    Back
                  </button>
                </div>
              )}

              {/* Plan mode */}
              {mode === "plan" && !result && (
                <div>
                  <textarea
                    value={planText}
                    onChange={(e) => setPlanText(e.target.value)}
                    placeholder="Example: I want to lose weight, no pork, budget meals, around 1800 calories per day..."
                    className="w-full min-h-[120px] p-4 rounded-xl border border-[#BBC8D8] text-[14px] resize-y outline-none font-['Teachers'] mb-3 focus:border-[#242D96]"
                  />
                  {loading ? (
                    <p className="text-center text-[#242D96] text-[14px] py-3 font-['Teachers']">Creating your meal plan...</p>
                  ) : (
                    <div className="flex gap-2.5">
                      <button onClick={() => setMode(null)} className="flex-1 py-2.5 rounded-full border border-[#BBC8D8] bg-transparent text-gray-400 text-[14px] cursor-pointer font-['Teachers']">
                        Back
                      </button>
                      <button onClick={handleMealPlan} className="flex-[2] py-2.5 rounded-full bg-[#242D96] text-white text-[14px] font-medium border-none cursor-pointer font-['Teachers']">
                        Generate Plan →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Photo result */}
              {result?.type === "photo" && (
                <div>
                  {previewUrl && (
                    <img src={previewUrl} alt="food" className="w-full max-h-[150px] object-cover rounded-2xl mb-4" />
                  )}
                  <h3 className="text-[#242D96] text-[18px] font-semibold text-center mb-4 font-['Teachers']">
                    {result.data.dish}
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5 mb-4">
                    {[
                      { label: "Calories", value: `${result.data.total_calories} kcal`, sub: `${result.data.calories}/100g` },
                      { label: "Protein", value: `${result.data.protein}g`, sub: "per 100g" },
                      { label: "Carbs", value: `${result.data.carbs}g`, sub: "per 100g" },
                      { label: "Fat", value: `${result.data.fat}g`, sub: "per 100g" },
                    ].map((item) => (
                      <div key={item.label} className="bg-[#EEF0FB] rounded-xl p-3.5 text-center">
                        <div className="text-gray-400 text-[12px] mb-1 font-['Teachers']">{item.label}</div>
                        <div className="text-[#242D96] font-bold text-[18px] font-['Teachers']">{item.value}</div>
                        <div className="text-gray-300 text-[11px] font-['Teachers']">{item.sub}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 mb-4">
                    <p className="text-gray-500 text-[12px] mb-1 font-['Teachers']">Portion: {result.data.portion}g</p>
                    <p className="text-gray-500 text-[12px] font-['Teachers']">Confidence: {result.data.confidence}</p>
                  </div>
                  <div className="flex gap-2.5">
                    <button onClick={() => { setResult(null); setPreviewUrl(null); }} className="flex-1 py-2.5 rounded-full border border-[#BBC8D8] bg-transparent text-gray-400 text-[14px] cursor-pointer font-['Teachers']">
                      Analyze another
                    </button>
                    <button onClick={handleClose} className="flex-1 py-2.5 rounded-full bg-[#242D96] text-white text-[14px] border-none cursor-pointer font-['Teachers']">
                      Done
                    </button>
                  </div>
                </div>
              )}

              {/* Meal plan result */}
              {result?.type === "plan" && (
                <div>
                  <p className="text-gray-500 text-[13px] text-center mb-4 font-['Teachers']">
                    ~{result.data.total_daily_calories} kcal/day · {result.data.notes}
                  </p>
                  <div className="flex flex-col gap-2.5 mb-4">
                    {result.data.plan.map((day) => (
                      <div key={day.day} className="border border-[#BBC8D8] rounded-xl p-3.5">
                        <div className="font-semibold text-[#242D96] text-[14px] mb-2 font-['Teachers']">{day.day}</div>
                        <div className="flex flex-col gap-1">
                          {["breakfast", "lunch", "dinner"].map((meal) => (
                            <div key={meal} className="flex justify-between text-[13px] gap-2">
                              <span className="text-gray-400 capitalize w-[70px] flex-shrink-0 font-['Teachers']">{meal}</span>
                              <span className="text-gray-700 flex-1 font-['Teachers']">{day[meal]?.name}</span>
                              <span className="text-[#242D96] font-medium font-['Teachers']">{day[meal]?.calories} kcal</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2.5">
                    <button onClick={() => { setResult(null); setPlanText(""); }} className="flex-1 py-2.5 rounded-full border border-[#BBC8D8] bg-transparent text-gray-400 text-[14px] cursor-pointer font-['Teachers']">
                      New plan
                    </button>
                    <button onClick={handleClose} className="flex-1 py-2.5 rounded-full bg-[#242D96] text-white text-[14px] border-none cursor-pointer font-['Teachers']">
                      Done
                    </button>
                  </div>
                </div>
              )}

              {/* Error */}
              {result?.type === "error" && (
                <div className="text-center py-4">
                  <div className="text-4xl mb-3">❌</div>
                  <p className="text-red-500 text-[14px] mb-4 font-['Teachers']">{result.message}</p>
                  <button onClick={() => setResult(null)} className="px-6 py-2.5 rounded-full bg-[#242D96] text-white text-[14px] border-none cursor-pointer font-['Teachers']">
                    Try again
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
      {showLoginModal && (
  <div
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1001] px-4"
    onClick={() => setShowLoginModal(false)}
  >
    <div
      className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="text-4xl mb-4">🍳</div>
      <h2 className="text-xl font-semibold text-[#242D96] mb-2 font-['Teachers']">
        Login to use AI
      </h2>
      <p className="text-gray-500 text-sm mb-6 font-['Teachers']">
        Sign up or login to access AI food analysis and meal planning
      </p>
      <div className="flex flex-col gap-3">
        <button
          onClick={() => navigate("/login")}
          className="w-full py-2.5 bg-[#242D96] text-white rounded-full font-medium border-none cursor-pointer font-['Teachers']"
        >
          Login
        </button>
        <button
          onClick={() => navigate("/signup")}
          className="w-full py-2.5 border border-[#242D96] text-[#242D96] rounded-full font-medium bg-transparent cursor-pointer font-['Teachers']"
        >
          Sign up
        </button>
        <button
          onClick={() => setShowLoginModal(false)}
          className="text-gray-400 text-sm bg-transparent border-none cursor-pointer font-['Teachers']"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
    </>
  );
}

export default AIAssistant;