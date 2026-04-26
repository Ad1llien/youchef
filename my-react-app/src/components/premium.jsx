import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import AccountNavigation from "./AccountNavigation";
import telegram from "../icons/telegram-app.svg";
import kaspi from "../icons/kaspi.svg";
import step1 from "../icons/step1-bot.png";
import step2 from "../icons/step2-auth.png";
import step3 from "../icons/step3-buy.png";
import step4 from "../icons/step4-pay.png";
import kaspiQr from "../icons/kaspi-qr.jpg";
import vipCrown from "../icons/crown.svg";
import API_BASE_URL, { apiFetch } from "../config/api";

const TG_STEPS = [
  {
    title: "Open Telegram bot",
    desc: "Go to @youchefBot and press START BOT",
    tip: "If you've already messaged the bot - just move to the next step",
    step: "Step 1 of 4",
    img: step1,
  },
  {
    title: "Link your account",
    desc: "Enter your YouChef website email and password",
    tip: "These are the same credentials you use to log in on the website",
    step: "Step 2 of 4",
    img: step2,
  },
  {
    title: "Buy Premium with Stars",
    desc: "Tap Buy Premium - 100 Stars in the bot menu",
    tip: "100 Stars = KZT 989. You can buy Stars directly in Telegram",
    step: "Step 3 of 4",
    img: step3,
  },
  {
    title: "Card payment",
    desc: "Telegram will show a checkout - choose a payment method and confirm",
    tip: "Premium will be activated automatically after payment",
    step: "Step 4 of 4",
    img: step4,
  },
];

const KASPI_STEPS = [
  "Open the Kaspi app on your phone",
  "Tap Payments - Scan QR",
  "Scan the code and confirm payment of 2500 KZT",
  "Message us via Contact - we will activate Premium manually",
];

function BuyPremium() {
  const navigate = useNavigate();
  const userContext = useUser();
  const user = userContext?.user ?? null;

  const [freshUser, setFreshUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showTgModal, setShowTgModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showKaspiModal, setShowKaspiModal] = useState(false);
  const [tgStep, setTgStep] = useState(0);

  useEffect(() => {
    apiFetch(`${API_BASE_URL}/api/user/data`, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setFreshUser(data.userData);
      })
      .catch((err) => console.error(err));
  }, []);

  const isPremium = freshUser?.premium;

  const handleLogout = async () => {
    try {
      await apiFetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
      });
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto mt-[102px] w-full max-w-6xl px-4 md:mt-[102px] md:px-6">
      <h1 className="mb-6 text-center font-['Taviraj'] text-[32px] font-normal leading-normal text-[#242D96] md:mb-[80px]">
        My Account
      </h1>

      <div className="flex flex-col gap-11 md:gap-20 md:flex-row md:items-start">
        <AccountNavigation
          activeItem="subscription"
          onOpenPersonalInfo={() => navigate("/my-account")}
          onSubscription={() => navigate("/premium")}
          onOpenPasswordManager={() => navigate("/password-manager")}
          onOpenLikes={() => navigate("/my-likes")}
          onLogout={() => setShowLogoutModal(true)}
          onHistory={() => navigate("/history")}

        />

        <div className="w-full min-w-0 md:flex-1">

          {/* Status badge */}
          <div className="flex items-center gap-3 mb-6">
            <img
              src={vipCrown}
              className="w-6 h-6"
              style={{
                filter: isPremium
                  ? "invert(74%) sepia(98%) saturate(400%) hue-rotate(0deg) brightness(105%)"
                  : "grayscale(1) opacity(0.4)",
              }}
              alt=""
            />
            <div style={{ color: "#242D96", fontSize: "18px" }}>Status:</div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                padding: "3px 12px",
                borderRadius: "20px",
                background: isPremium ? "#FFF3CC" : "#F0F0F0",
                color: isPremium ? "#B8860B" : "#888",
                border: `1px solid ${isPremium ? "#FFD700" : "#ddd"}`,
              }}
            >
              {isPremium ? "Premium" : "Free"}
            </div>
          </div>

          <div style={{ marginBottom: "24px", color: "#666", fontSize: "14px" }}>
            Choose payment method:
          </div>

          <div className="flex flex-col gap-3 max-w-[360px]">
            <button
              onClick={() => { setShowTgModal(true); setTgStep(0); }}
              className="flex items-center gap-4 px-5 py-4 border border-[#BBC8D8] rounded-2xl bg-white hover:border-[#242D96] transition cursor-pointer"
            >
              <img src={telegram} alt="Telegram" className="w-8 h-8 object-contain" />
              <div className="text-left">
                <div className="text-[#242D96] font-semibold text-[16px] rounded-[10px]">Telegram Stars</div>
                <div className="text-gray-400 text-[13px] rounded-[10px]">Pay using Telegram</div>
              </div>
            </button>

            <button
              onClick={() => setShowKaspiModal(true)}
              className="flex items-center gap-4 px-5 py-4 border border-[#BBC8D8] rounded-2xl bg-white hover:border-[#F14635] transition cursor-pointer"
            >
              <img src={kaspi} alt="Kaspi" className="w-8 h-8 object-contain" />
              <div className="text-left">
                <div className="text-[#242D96] font-semibold text-[16px]">Kaspi QR</div>
                <div className="text-gray-400 text-[13px]">Pay using Kaspi QR</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-[340px] rounded-2xl bg-white p-6 text-center shadow-xl">
            <h3 className="mb-2 text-xl font-semibold text-[#13151A]">Logout</h3>
            <p className="mb-6 text-sm text-[#555]">
              Are you sure you want to log out of your account?
            </p>
            <div className="flex justify-between gap-3">
              <button
                className="flex-1 rounded-lg bg-[#eee] px-4 py-2.5 text-sm font-medium text-[#333]"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 rounded-lg bg-[#e53935] px-4 py-2.5 text-sm font-medium text-white"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TELEGRAM MODAL */}
      {showTgModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[50] px-4"
          onClick={() => { setShowTgModal(false); setTgStep(0); }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-[420px] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#242D96] px-6 pt-7 pb-6 text-center">
              <p className="text-[11px] font-medium text-white/60 tracking-widest uppercase mb-2">
                {TG_STEPS[tgStep].step}
              </p>
              <h2 className="text-[18px] font-medium text-white mb-2">
                {TG_STEPS[tgStep].title}
              </h2>
              <p className="text-[13px] text-white/70 leading-relaxed">
                {TG_STEPS[tgStep].desc}
              </p>
              <div className="flex justify-center gap-1.5 mt-5">
                {TG_STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTgStep(i)}
                    className={`h-1.5 rounded-full border-none cursor-pointer transition-all ${
                      i === tgStep ? "bg-white w-5" : "bg-white/30 w-1.5"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div style={{ position: "relative", background: "#f0f4ff", height: "220px", overflow: "hidden" }}>
              <img
                src={TG_STEPS[tgStep].img}
                alt={TG_STEPS[tgStep].title}
                style={{ width: "60%", maxHeight: "210px", objectFit: "contain", objectPosition: "center", display: "block", margin: "0 auto", position: "relative", zIndex: 1, paddingTop: "8px" }}
              />
              <div style={{ position: "absolute", top: 0, left: 0, width: "90px", height: "100%", zIndex: 2, background: "linear-gradient(to right, #f0f4ff, transparent)" }} />
              <div style={{ position: "absolute", top: 0, right: 0, width: "90px", height: "100%", zIndex: 2, background: "linear-gradient(to left, #f0f4ff, transparent)" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "50px", zIndex: 2, background: "linear-gradient(to top, #f0f4ff, transparent)" }} />
            </div>

            <div className="px-6 py-5">
              <div className="bg-[#E6F1FB] rounded-xl p-3 flex gap-2.5 items-start mb-5">
                <span className="text-[#185FA5] text-sm mt-0.5">i</span>
                <p className="text-[13px] text-[#0C447C] leading-relaxed m-0">
                  {TG_STEPS[tgStep].tip}
                </p>
              </div>
              <div className="flex gap-2.5">
                {tgStep > 0 && (
                  <button
                    onClick={() => setTgStep(tgStep - 1)}
                    className="flex-1 py-2.5 rounded-full border border-[#BBC8D8] bg-transparent text-gray-500 text-sm cursor-pointer"
                  >
                    Back
                  </button>
                )}
                {tgStep < TG_STEPS.length - 1 ? (
                  <button
                    onClick={() => setTgStep(tgStep + 1)}
                    className="flex-1 py-2.5 rounded-full bg-[#242D96] text-white text-sm font-medium border-none cursor-pointer"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={() => setShowExitModal(true)}
                    className="flex-1 py-2.5 rounded-full bg-[#242D96] text-white text-sm font-medium border-none cursor-pointer"
                  >
                    Open bot
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EXIT MODAL */}
      {showExitModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] px-4"
          onClick={() => setShowExitModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-[340px] p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-[#E6F1FB] flex items-center justify-center mx-auto mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </div>
            <h3 className="text-[16px] font-semibold text-[#13151A] mb-2">Leaving YouChef</h3>
            <p className="text-[13px] text-gray-500 mb-6 leading-relaxed">
              You are leaving YouChef and opening Telegram. After payment return to the site and refresh the page.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-2.5 rounded-full border border-[#BBC8D8] bg-transparent text-gray-500 text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  window.open("https://t.me/youchefBot", "_blank");
                  setShowExitModal(false);
                  setShowTgModal(false);
                  setTgStep(0);
                }}
                className="flex-1 py-2.5 rounded-full bg-[#242D96] text-white text-sm font-medium border-none cursor-pointer"
              >
                Open Telegram
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KASPI MODAL */}
      {showKaspiModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[50] px-4"
          onClick={() => setShowKaspiModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-[420px] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-5 text-center" style={{ background: "#F14635" }}>
              <p className="text-[11px] font-medium text-white/60 tracking-widest uppercase mb-2">
                Kaspi QR
              </p>
              <h2 className="text-[18px] font-medium text-white mb-1">
                Pay using Kaspi
              </h2>
              <p className="text-[13px] text-white/70 leading-relaxed">
                Scan QR code using Kaspi app
              </p>
            </div>

            <div style={{ position: "relative", background: "#fff5f4", height: "220px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img
                src={kaspiQr}
                alt="Kaspi QR"
                style={{ height: "190px", width: "auto", objectFit: "contain", borderRadius: "8px", position: "relative", zIndex: 1 }}
              />
              <div style={{ position: "absolute", top: 0, left: 0, width: "60px", height: "100%", zIndex: 2, background: "linear-gradient(to right, #fff5f4, transparent)" }} />
              <div style={{ position: "absolute", top: 0, right: 0, width: "60px", height: "100%", zIndex: 2, background: "linear-gradient(to left, #fff5f4, transparent)" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "40px", zIndex: 2, background: "linear-gradient(to top, #fff5f4, transparent)" }} />
            </div>

            <div className="px-6 py-5">
              <div className="flex flex-col gap-2.5 mb-4">
                {KASPI_STEPS.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span
                      className="w-5 h-5 rounded-full text-white text-[11px] font-medium flex items-center justify-center flex-shrink-0"
                      style={{ background: "#F14635" }}
                    >
                      {i + 1}
                    </span>
                    <p className="text-[13px] text-gray-600 m-0">{s}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl p-3 flex gap-2.5 items-start mb-5" style={{ background: "#FFF0EE" }}>
                <span className="text-sm mt-0.5" style={{ color: "#F14635" }}>i</span>
                <p className="text-[13px] leading-relaxed m-0" style={{ color: "#C0392B" }}>
                  After payment write an email to <strong>youchef.app@gmail.com</strong> and attach a screenshot of the payment  and send payment check with written email linked to YouChef website.
                </p>
              </div>

              <button
                onClick={() => setShowKaspiModal(false)}
                className="w-full py-2.5 rounded-full text-white text-sm font-medium border-none cursor-pointer"
                style={{ background: "#F14635" }}
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

export default BuyPremium;