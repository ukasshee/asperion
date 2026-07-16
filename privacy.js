const privacyUi = {
  pl: { back: "Wróć do strony", rights: "Wszelkie prawa zastrzeżone.", privacy: "Polityka prywatności", themeToLight: "Włącz jasny motyw", themeToDark: "Włącz ciemny motyw", title: "Polityka prywatności — Asperion" },
  en: { back: "Back to website", rights: "All rights reserved.", privacy: "Privacy policy", themeToLight: "Switch to light theme", themeToDark: "Switch to dark theme", title: "Privacy Policy — Asperion" }
};

let privacyLang = localStorage.getItem("asperion-lang") || "pl";
let privacyTheme = localStorage.getItem("asperion-theme") || "light";

function updatePrivacyThemeLabel() {
  const button = document.querySelector(".theme-toggle");
  const key = privacyTheme === "dark" ? "themeToLight" : "themeToDark";
  button.setAttribute("aria-label", privacyUi[privacyLang][key]);
  button.setAttribute("title", privacyUi[privacyLang][key]);
}

function setPrivacyTheme(theme, persist = true) {
  privacyTheme = theme;
  document.documentElement.dataset.theme = theme;
  if (persist) localStorage.setItem("asperion-theme", theme);
  document.querySelector('meta[name="theme-color"]').content = theme === "dark" ? "#3a1d11" : "#fffdf7";
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
  document.querySelectorAll(".lang").forEach((button) => {
    const active = button.dataset.lang === lang;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active);
  });
  updatePrivacyThemeLabel();
  document.dispatchEvent(new CustomEvent("asperion:language", { detail: { lang } }));
}

document.querySelector(".theme-toggle").addEventListener("click", () => setPrivacyTheme(privacyTheme === "dark" ? "light" : "dark"));
document.querySelectorAll(".lang").forEach((button) => button.addEventListener("click", () => setPrivacyLanguage(button.dataset.lang)));
document.querySelector("#year").textContent = new Date().getFullYear();
setPrivacyTheme(privacyTheme, false);
setPrivacyLanguage(privacyLang, false);
