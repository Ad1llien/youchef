import { createContext, useState, useContext } from "react";
import en from "./locales/en.json";
import ru from "./locales/ru.json";

const translations = { en, ru };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en");

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Хук для удобного доступа
export const useLanguage = () => useContext(LanguageContext);