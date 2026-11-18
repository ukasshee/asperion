const privacyUi = {
  pl: { back: "Wróć do strony", rights: "Wszelkie prawa zastrzeżone.", privacy: "Polityka prywatności", contrastOn: "Włącz tryb wysokiego kontrastu", contrastOff: "Wyłącz tryb wysokiego kontrastu", languageToEnglish: "Przełącz na język angielski", title: "Polityka prywatności — Asperion" },
  en: { back: "Back to website", rights: "All rights reserved.", privacy: "Privacy policy", contrastOn: "Enable high contrast mode", contrastOff: "Disable high contrast mode", languageToPolish: "Switch to Polish", title: "Privacy Policy — Asperion" }
};

let privacyLang = localStorage.getItem("asperion-lang") || "pl";
const storedPrivacyTheme = localStorage.getItem("asperion-theme-v2");
let privacyTheme = storedPrivacyTheme === "dark" || storedPrivacyTheme === "contrast" ? "contrast" : "light";

function updatePrivacyThemeLabel() {
  const button = document.querySelector(".theme-toggle");
  const isContrast = privacyTheme === "contrast";
  const key = isContrast ? "contrastOff" : "contrastOn";
  button.setAttribute("aria-label", privacyUi[privacyLang][key]);
  button.setAttribute("title", privacyUi[privacyLang][key]);
  button.setAttribute("aria-pressed", String(isContrast));
}

function setPrivacyTheme(theme, persist = true) {
  privacyTheme = theme;
  document.documentElement.dataset.theme = theme;
  if (persist) localStorage.setItem("asperion-theme-v2", theme);
  document.querySelector('meta[name="theme-color"]').content = theme === "contrast" ? "#000000" : "#fbf8f3";
  updatePrivacyThemeLabel();
}

function setPrivacyLanguage(lang, persist = true) {
  privacyLang = lang;
  document.documentElement.lang = lang;
  document.title = privacyUi[lang].title;
  if (persist) localStorage.setItem("asperion-lang", lang);

  document.querySelectorAll("[data-policy-lang]").forEach((section) => {
    section.hidden = section.dataset.policyLang !== lang;
  });
  document.querySelectorAll("[data-policy-ui]").forEach((node) => {
    node.textContent = privacyUi[lang][node.dataset.policyUi];
  });
  const languageButton = document.querySelector("[data-language-toggle]");
  if (languageButton) {
    const label = lang === "pl" ? privacyUi.pl.languageToEnglish : privacyUi.en.languageToPolish;
    languageButton.querySelector("img").src = lang === "pl" ? "flag-gb.svg" : "flag-pl.svg";
    languageButton.setAttribute("aria-label", label);
    languageButton.setAttribute("title", label);
  }
  updatePrivacyThemeLabel();
  document.dispatchEvent(new CustomEvent("asperion:language", { detail: { lang } }));
}

document.querySelector(".theme-toggle").addEventListener("click", () => setPrivacyTheme(privacyTheme === "contrast" ? "light" : "contrast"));
document.querySelector("[data-language-toggle]")?.addEventListener("click", () => setPrivacyLanguage(privacyLang === "pl" ? "en" : "pl"));
document.querySelector("#year").textContent = new Date().getFullYear();
setPrivacyTheme(privacyTheme, false);
setPrivacyLanguage(privacyLang, false);
