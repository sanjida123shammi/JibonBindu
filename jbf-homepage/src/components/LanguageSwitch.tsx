import type { Lang } from "../i18n";

interface Props {
  lang: Lang;
  onChange: (lang: Lang) => void;
}

/**
 * Sleek Bn / En language toggle matching the Angular Dashboard topbar design.
 */
export default function LanguageSwitch({ lang, onChange }: Props) {
  const toggleLanguage = () => {
    onChange(lang === "bn" ? "en" : "bn");
  };

  return (
    <div className="lang-toggle-wrapper">
      <button
        type="button"
        className="lang-switch-btn"
        onClick={toggleLanguage}
        title="Switch Language: Bangla / English"
        aria-label={`Current language is ${lang === "bn" ? "Bangla" : "English"}. Click to toggle.`}
      >
        <span className={lang === "bn" ? "active-lang" : ""}>Bn</span>
        <span className="lang-divider">/</span>
        <span className={lang === "en" ? "active-lang" : ""}>En</span>
      </button>
    </div>
  );
}