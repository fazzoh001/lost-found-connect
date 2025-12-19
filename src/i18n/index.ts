import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { translations } from "./translations";

// Get stored language or default to English
const storedLanguage = typeof window !== "undefined" 
  ? localStorage.getItem("language") || "en" 
  : "en";

i18n
  .use(initReactI18next)
  .init({
    resources: translations,
    lng: storedLanguage,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
