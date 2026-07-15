const cookieTranslations = {
  pl: {
    eyebrow: "PRYWATNOŚĆ",
    title: "Ta strona szanuje Twoją prywatność",
    text: "Używamy wyłącznie niezbędnej pamięci lokalnej, aby zapamiętać język, motyw i potwierdzenie tego komunikatu. Nie używamy cookies analitycznych ani reklamowych.",
    details: "Dowiedz się więcej",
    confirm: "Rozumiem"
  },
  en: {
    eyebrow: "PRIVACY",
    title: "This website respects your privacy",
    text: "We only use necessary local storage to remember your language, theme and acknowledgement of this notice. We do not use analytics or advertising cookies.",
    details: "Learn more",
    confirm: "Understood"
  }
};

const cookiePanel = document.querySelector("#cookie-panel");
const cookieConsentKey = "asperion-cookie-notice";

function updateCookieLanguage(lang = document.documentElement.lang || "pl") {
  const selected = cookieTranslations[lang] || cookieTranslations.pl;
  document.querySelectorAll("[data-cookie-i18n]").forEach((node) => {
    const value = selected[node.dataset.cookieI18n];
    if (value) node.textContent = value;
  });
  const detailsLink = document.querySelector(".cookie-copy a");
  if (detailsLink) {
    const onPolicyPage = window.location.pathname.endsWith("/privacy.html") || window.location.pathname.endsWith("privacy.html");
    detailsLink.href = onPolicyPage ? (lang === "en" ? "#cookies-en" : "#cookies") : "privacy.html#cookies";
  }
}

function openCookiePanel() {
  if (!cookiePanel) return;
  updateCookieLanguage();
  cookiePanel.hidden = false;
}

document.querySelector("[data-cookie-confirm]")?.addEventListener("click", () => {
  localStorage.setItem(cookieConsentKey, JSON.stringify({ acknowledged: true, version: "2026-07-16" }));
  cookiePanel.hidden = true;
});

document.querySelectorAll("[data-open-cookie-settings]").forEach((button) => {
  button.addEventListener("click", openCookiePanel);
});

document.addEventListener("asperion:language", (event) => updateCookieLanguage(event.detail.lang));

updateCookieLanguage();
if (!localStorage.getItem(cookieConsentKey)) openCookiePanel();
