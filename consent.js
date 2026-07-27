const cookieTranslations = {
  pl: {
    eyebrow: "PRYWATNOŚĆ",
    title: "Ta strona szanuje Twoją prywatność",
    text: "Używamy wyłącznie niezbędnej pamięci lokalnej do ustawień strony. Dane z formularza — imię i nazwisko, e-mail, numer telefonu i wiadomość — nie są zapisywane w cookies ani localStorage.",
    details: "Dowiedz się więcej",
    confirm: "Rozumiem"
  },
  en: {
    eyebrow: "PRIVACY",
    title: "This website respects your privacy",
    text: "We only use necessary local storage for website settings. Form data — your name, email, telephone number and message — is not stored in cookies or local storage.",
    details: "Learn more",
    confirm: "Understood"
  }
};

const cookiePanel = document.querySelector("#cookie-panel");
const cookieConsentKey = "asperion-cookie-notice";
const cookieNoticeVersion = "2026-07-27";

function hasAcknowledgedCurrentNotice() {
  try {
    const saved = JSON.parse(localStorage.getItem(cookieConsentKey));
    return saved?.acknowledged === true && saved.version === cookieNoticeVersion;
  } catch {
    return false;
  }
}

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
  localStorage.setItem(cookieConsentKey, JSON.stringify({ acknowledged: true, version: cookieNoticeVersion }));
  cookiePanel.hidden = true;
});

document.querySelectorAll("[data-open-cookie-settings]").forEach((button) => {
  button.addEventListener("click", openCookiePanel);
});

document.addEventListener("asperion:language", (event) => updateCookieLanguage(event.detail.lang));

updateCookieLanguage();
if (!hasAcknowledgedCurrentNotice()) openCookiePanel();
