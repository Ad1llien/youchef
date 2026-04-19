import { useState, useEffect, useCallback, useRef } from "react";
import API_BASE_URL from "../config/api";

const TOUR_KEY = "youchef_tour_done";

const STEPS = [
  {
    target: ".youchef-logo",
    title: "Welcome to YouChef! 🍳",
    content: "Your personal recipe platform with dishes from around the world.",
    place: "bottom",
  },
  {
    target: ".main-nav-tabs",
    title: "Recipe Tabs",
    content: "Browse by tab: Main Recipe for all dishes, Popular Meals for curated picks, Create Own Meal to cook with what you have.",
    place: "bottom",
  },
  {
    target: ".search-bar-input",
    title: "Search Meals",
    content: "Search for any dish by name. Type and find exactly what you're craving.",
    place: "bottom",
  },
  {
    target: ".category-filter-buttons",
    title: "Filter by Category",
    content: "Filter meals by Breakfast, Lunch, Dinner, or From Chef with one click.",
    place: "bottom",
  },
  {
    target: ".meal-cards-grid",
    title: "Meal Cards",
    content: "Click any dish card to see the full recipe with ingredients, instructions and nutrition info.",
    place: "bottom",
  },
  {
    target: ".ai-assistant-btn",
    title: "AI Assistant 🤖",
    content: "Analyze food photos for calories, or generate a personalized weekly meal plan!",
    place: "top",
  },
  {
    target: ".premium-nav-link",
    title: "Premium ✨",
    content: "Upgrade to Premium for exclusive recipes and unlimited AI analysis. Pay with Telegram Stars or Kaspi QR.",
    place: "bottom",
  },
];

const W = 300;
const GAP = 12;

function OnboardingTour() {
  const [phase, setPhase] = useState("idle"); // idle | video | fading | tour
  const [fadeOut, setFadeOut] = useState(false);
  const [tourVisible, setTourVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);
  const [user, setUser] = useState(null);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/user/data`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUser(data.userData);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    const done = localStorage.getItem(TOUR_KEY);
    if (!done) {
      const timer = setTimeout(() => setPhase("video"), 600);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const transitionToTour = () => {
    // 1. Fade out видео
    setFadeOut(true);
    setTimeout(() => {
      setPhase("tour");
      setFadeOut(false);
      // 2. Fade in тур
      setTimeout(() => setTourVisible(true), 50);
    }, 600);
  };

  const handlePlay = () => {
    videoRef.current?.play();
    setPlaying(true);
  };

  const handleVideoEnd = () => {
    transitionToTour();
  };

  const skipVideo = () => {
    videoRef.current?.pause();
    transitionToTour();
  };

  const updateRect = useCallback(() => {
    if (phase !== "tour") return;
    const el = document.querySelector(STEPS[step].target);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        setRect(el.getBoundingClientRect());
      }, 400);
    } else {
      setRect(null);
    }
  }, [step, phase]);

  useEffect(() => {
    updateRect();
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, [updateRect]);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setTourVisible(false);
      setTimeout(() => {
        setStep((s) => s + 1);
        setTourVisible(true);
      }, 200);
    } else {
      finish();
    }
  };

  const finish = () => {
    setTourVisible(false);
    setTimeout(() => {
      localStorage.setItem(TOUR_KEY, "true");
      setPhase("idle");
    }, 300);
  };

  // ==================== ВИДЕО ====================
  if (phase === "video") {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#000",
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: fadeOut ? 0 : 1,
          transition: "opacity 0.6s ease",
        }}
      >
        <video
          ref={videoRef}
          src="/LogoMotion_design.mp4"
          playsInline
          onEnded={handleVideoEnd}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />

        {/* Play button */}
        {!playing && (
          <button
            onClick={handlePlay}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              border: "2px solid rgba(255,255,255,0.6)",
              color: "white",
              fontSize: 30,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(8px)",
            }}
          >
            ▶
          </button>
        )}

        {/* Skip button */}
        <button
          onClick={skipVideo}
          style={{
            position: "absolute",
            bottom: 32,
            right: 32,
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.3)",
            color: "white",
            borderRadius: 50,
            padding: "8px 20px",
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "Teachers, sans-serif",
            backdropFilter: "blur(8px)",
          }}
        >
          Skip intro →
        </button>
      </div>
    );
  }

  // ==================== ТУР ====================
  if (phase !== "tour" || !user) return null;

  const current = STEPS[step];

  let top = 0;
  let left = 0;

  if (rect) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const TH = 180;
    const cx = rect.left + rect.width / 2;

    if (current.place === "bottom") {
      top = Math.min(rect.bottom + GAP, vh - TH - 8);
    } else {
      top = Math.max(rect.top - TH - GAP, 8);
    }

    left = Math.max(8, Math.min(cx - W / 2, vw - W - 8));
  } else {
    top = window.innerHeight / 2 - 90;
    left = window.innerWidth / 2 - W / 2;
  }

  return (
    <>
      {/* Dark overlay с fade in */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 9990,
          opacity: tourVisible ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      />

      {/* Spotlight */}
      {rect && (
        <div
          style={{
            position: "fixed",
            top: rect.top - 5,
            left: rect.left - 5,
            width: rect.width + 10,
            height: rect.height + 10,
            borderRadius: 10,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)",
            zIndex: 9991,
            pointerEvents: "none",
            border: "2px solid rgba(255,255,255,0.25)",
            opacity: tourVisible ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        />
      )}

      {/* Tooltip с fade + slide up */}
      <div
        style={{
          position: "fixed",
          top,
          left,
          width: W,
          zIndex: 9999,
          background: "white",
          borderRadius: 16,
          padding: "18px 20px 16px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
          fontFamily: "Teachers, sans-serif",
          opacity: tourVisible ? 1 : 0,
          transform: tourVisible ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.35s ease, transform 0.35s ease",
        }}
      >
        {/* Progress dots */}
        <div style={{ display: "flex", gap: 5, marginBottom: 12 }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                height: 5,
                width: i === step ? 20 : 5,
                borderRadius: 999,
                background: i === step ? "#242D96" : "#BBC8D8",
                transition: "all 0.25s",
              }}
            />
          ))}
        </div>

        <h3 style={{ color: "#242D96", fontSize: 15, fontWeight: 600, margin: "0 0 7px", fontFamily: "Teachers, sans-serif" }}>
          {current.title}
        </h3>
        <p style={{ color: "#555", fontSize: 13, lineHeight: 1.6, margin: "0 0 14px", fontFamily: "Teachers, sans-serif" }}>
          {current.content}
        </p>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={finish}
            style={{ background: "none", border: "none", color: "#aaa", fontSize: 13, cursor: "pointer", fontFamily: "Teachers, sans-serif" }}
          >
            Skip
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "#bbb", fontSize: 12 }}>{step + 1} / {STEPS.length}</span>
            <button
              onClick={handleNext}
              style={{
                background: "#242D96",
                color: "white",
                border: "none",
                borderRadius: 50,
                padding: "7px 18px",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "Teachers, sans-serif",
              }}
            >
              {step === STEPS.length - 1 ? "Finish ✓" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default OnboardingTour;
