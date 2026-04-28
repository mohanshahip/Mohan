// src/i18n.js

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./en.json";
import np from "./np.json";

/* ✅ Force LTR globally (Nepali is NOT RTL) */
const forceLTR = () => {
  document.documentElement.setAttribute("dir", "ltr");
  document.documentElement.style.direction = "ltr";

  document.body.setAttribute("dir", "ltr");
  document.body.style.direction = "ltr";

  // Remove accidental RTL classes
  document.documentElement.classList.remove("rtl", "admin-layout-rtl");
  document.body.classList.remove("rtl", "admin-layout-rtl");
};

/* ✅ Initialize i18n ONLY ONCE */
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    np: { translation: np }, // Nepali language key
  },

  lng: localStorage.getItem("preferred-language") || "en",
  fallbackLng: "en",

  interpolation: {
    escapeValue: false,
  },

  react: {
    useSuspense: false,

    // Prevent extra rerenders during language switch
    bindI18n: "languageChanged loaded",
    bindI18nStore: "added removed",

    transEmptyNodeValue: "",
    transSupportBasicHtmlNodes: true,
    transKeepBasicHtmlNodesFor: ["br", "strong", "i"],
  },

  // Helps prevent async layout flicker
  initImmediate: false,
});

/* ✅ Apply LTR immediately */
forceLTR();

/* ✅ Apply LTR again after every language change */
i18n.on("languageChanged", (lng) => {
  console.log(`🌍 Language changed to ${lng} → Forcing LTR`);

  forceLTR();

  // Update lang attribute properly
  document.documentElement.setAttribute("lang", lng === "np" ? "ne" : lng);
});

export default i18n;
