import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import type { Lang, Strings } from "../i18n";
import LanguageSwitch from "./LanguageSwitch";
import logoImg from "../assets/logo.jpg";

interface Props {
  t: Strings;
  lang: Lang;
  onLangChange: (lang: Lang) => void;
}

const ANGULAR_APP_URL =
  import.meta.env.VITE_ANGULAR_APP_URL ?? "http://localhost:4200";

export default function Navbar({ t, lang, onLangChange }: Props) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>("");

  // Track active section on the homepage
  useEffect(() => {
    if (location.pathname === "/about") {
      setActiveSection("about");
      return;
    }

    if (location.pathname !== "/") {
      setActiveSection("");
      return;
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 250;
      const contactEl = document.getElementById("contact");

      if (contactEl && scrollPosition >= contactEl.offsetTop) {
        setActiveSection("contact");
      } else {
        setActiveSection("");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  // Navigate to contact section on homepage
  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveSection("contact");

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document
          .getElementById("contact")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } else {
      document
        .getElementById("contact")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="site-nav">
      <div className="site-nav-inner">
        {/* Brand Logo with New Emblem */}
        <Link to="/" className="site-logo" aria-label="Jibonbindu Foundation">
          <img src={logoImg} alt="Jibonbindu Logo" className="site-logo-img" />
        </Link>

        {/* Nav Links */}
        <nav className="site-nav-links">
          <Link
            to="/about"
            onClick={() =>
              window.scrollTo({ top: 0, left: 0, behavior: "instant" })
            }
            className={`nav-link-item ${location.pathname === "/about" ? "is-nav-active" : ""}`}
          >
            {t.about}
          </Link>

          <a
            href="#contact"
            onClick={handleContactClick}
            className={`nav-link-item ${activeSection === "contact" ? "is-nav-active" : ""}`}
          >
            {t.contact}
          </a>
        </nav>

        <div className="site-nav-actions">
          <LanguageSwitch lang={lang} onChange={onLangChange} />

          {/* User greeting if logged in */}
          {user && (
            <span className="text-light small d-none d-md-inline align-self-center px-1">
              {user.name || user.email}
            </span>
          )}

          {/* Dashboard Button */}
          <a
            href={`${ANGULAR_APP_URL}/dashboard`}
            className="btn btn-sm btn-outline-light"
            title="Go to Dashboard"
          >
            {t.dashboard}
          </a>

          {/* Login / Logout Button */}
          {user ? (
            <button
              type="button"
              className="btn btn-sm btn-danger"
              onClick={logout}
              title="Log out"
            >
              {t.logout}
            </button>
          ) : (
            <a
              href={`${ANGULAR_APP_URL}/login`}
              className="btn btn-sm btn-danger"
              title="Log in"
            >
              {t.login}
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
