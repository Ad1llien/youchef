import { useState } from "react";

function AuthLangButton() {
  const [currentLang, setCurrentLang] = useState("EN");
  const [langOpen, setLangOpen] = useState(false);

  const options = [
    { label: "RU", value: "ru" },
    { label: "KZ", value: "kk" },
    { label: "EN", value: "en" },
    { label: "ES", value: "es" },
  ];

  const changeLanguage = (opt) => {
    setCurrentLang(opt.label);
    const s = document.querySelector(".goog-te-combo");
    if (s) { s.value = opt.value; s.dispatchEvent(new Event("change")); }
    setLangOpen(false);
  };

  return (
    <div style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
      <button
        onClick={() => setLangOpen(v => !v)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "white", border: "1.5px solid #BBC8D8",
          borderRadius: 20, padding: "6px 12px", cursor: "pointer",
          color: "#242D96", fontSize: 13, fontFamily: "Teachers, sans-serif",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#242D96" strokeWidth="1.8"/>
          <path d="M3 12H21" stroke="#242D96" strokeWidth="1.8"/>
          <path d="M12 3C14.5 5.7 15.9 8.8 15.9 12C15.9 15.2 14.5 18.3 12 21" stroke="#242D96" strokeWidth="1.8"/>
          <path d="M12 3C9.5 5.7 8.1 8.8 8.1 12C8.1 15.2 9.5 18.3 12 21" stroke="#242D96" strokeWidth="1.8"/>
        </svg>
        {currentLang}
      </button>

      {langOpen && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0,
          background: "white", border: "1px solid #BBC8D8",
          borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          zIndex: 100, overflow: "hidden", minWidth: 64,
        }}>
          {options.map(opt => (
            <button key={opt.value} onClick={() => changeLanguage(opt)}
              style={{
                display: "block", width: "100%", padding: "8px 14px",
                background: currentLang === opt.label ? "#EEF0FB" : "transparent",
                border: "none", cursor: "pointer", color: "#242D96",
                fontSize: 13, fontFamily: "Teachers, sans-serif", textAlign: "left",
              }}>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default AuthLangButton;