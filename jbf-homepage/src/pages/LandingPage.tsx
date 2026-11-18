import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeroSlider from "../components/HeroSlider";
import HomeCounter from "../components/HomeCounter";
import HomeQuestions from "../components/HomeQuestions";
import EligibilityChecker from "../components/EligibilityChecker";
import Navbar from "../components/Navbar";
import { STRINGS, type Lang } from "../i18n";
import slide1 from "../assets/1.logo.jpeg";
import slide2 from "../assets/2.donation.jpeg";
import slide3 from "../assets/3.camp.jpeg";
import slide4 from "../assets/4.celebration.jpeg";
import slide5 from "../assets/5.picnic.jpeg";
import slide6 from "../assets/6.meeting.jpeg";
import aboutMascot from "../assets/about-blood-drop.jpg";
import Footer from "../components/Footer";

export default function LandingPage() {
  // Defaults to "en" unless the user explicitly selected "bn"
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("jbf_lang");
    return saved === "en" ? "en" : "bn";
  });
  useEffect(() => {
    localStorage.setItem("jbf_lang", lang);
  }, [lang]);

  // Contact form state
  const [contactForm, setContactForm] = useState({
    fullName: "",
    email: "",
    message: "",
  });
  const [formSent, setFormSent] = useState(false);

  const t = STRINGS[lang];
  const slideImages = [slide1, slide2, slide3, slide4, slide5, slide6];
  const slides = slideImages.map((img) => ({
    image: img,
  }));

  // Handle email send to info.jibonbindu@gmail.com
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(
      `Inquiry from ${contactForm.fullName} via Jibonbindu Website`
    );
    const body = encodeURIComponent(
      `Name: ${contactForm.fullName}\nEmail: ${contactForm.email}\n\nMessage:\n${contactForm.message}`
    );

    // Dispatches directly to the email client with recipient pre-filled
    window.location.href = `mailto:info.jibonbindu@gmail.com?subject=${subject}&body=${body}`;

    setFormSent(true);
    setTimeout(() => setFormSent(false), 5000);
  };

  return (
    <div className="landing" lang={lang}>
      <div className="auth-bg" aria-hidden="true" />
      <Navbar t={t} lang={lang} onLangChange={setLang} />

      <main>
        {/* 1. Hero Slider */}
        <HeroSlider slides={slides} />

        {/* 2. Counter Section */}
        <HomeCounter t={t} />

        {/* 3. Questions Section */}
        <HomeQuestions t={t} />

        {/* 4. Pre-Screening Section */}
        <EligibilityChecker t={t} />

        {/* 5. About Section (2 Equal Columns) */}
        <section id="about" className="glass-section about-equal-split-section">
          {/* LEFT EQUAL COLUMN */}
          <div className="about-split-col about-left-col">
            <h2 className="about-split-heading">{t.about}</h2>
            <p className="about-split-text">
              {lang === "bn"
                ? "জীবনবিন্দু ফাউন্ডেশনে আমরা বিশ্বাস করি যে মানবতার শ্রেষ্ঠ কাজ হলো একটি প্রাণ রক্ষা করা। রক্তের অভাবে যাতে কোনো মুমূর্ষু রোগী কষ্ট না পায় বা প্রাণ না হারায়—এই একনিষ্ঠ লক্ষ্য নিয়ে পরিচালিত একটি অলাভজনক স্বেচ্ছাসেবী সংগঠন।"
                : "At Jibonbindu Foundation, we believe that humanity’s greatest act is saving a life. We are a dedicated, non-profit organization driven by a single, powerful purpose: ensuring that no emergency patient suffers or loses their life due to a lack of blood."}
            </p>
            <p className="about-split-text-sub">
              {lang === "bn"
                ? "“এক বিন্দু রক্ত, এক প্রাণের স্পন্দন”—এই আদর্শে উদ্বুদ্ধ হয়ে আমরা স্বেচ্ছাসেবী রক্তদাতা ও সংকটাপন্ন রোগীদের মাঝে সেতুবন্ধন তৈরিতে নিরলস কাজ করে যাচ্ছি।"
                : "Guided by our core belief—“এক বিন্দু রক্ত, এক প্রাণের স্পন্দন” (One drop of blood, the pulse of a life)—we work tirelessly to bridge the gap between voluntary blood donors and critically ill patients who need immediate help."}
            </p>
            <div className="about-btn-wrap">
              <Link
                to="/about"
                className="about-read-more-btn"
                onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "instant" })}
              >
                <span>{t.readMore}</span>
                <span className="about-arrow">→</span>
              </Link>
            </div>
          </div>

          {/* RIGHT EQUAL COLUMN */}
          <div className="about-split-col about-right-col">
            <div className="about-mascot-wrapper">
              <div className="about-mascot-glow" aria-hidden="true" />
              <img
                src={aboutMascot}
                alt="Jibonbindu Blood Drop Mascot"
                className="about-mascot-image"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* 6. CONTACT SECTION (2 Equal Columns: Info on Left & Email Form on Right) */}
        <section id="contact" className="glass-section contact-dual-section">
          <div className="contact-dual-grid">
            {/* LEFT COLUMN: Header, Content, Emergency Hotlines, Social Icons */}
            <div className="contact-col-info">              

              <h2 className="contact-header-title">
                {lang === "bn" ? "যোগাযোগ" : "Contact"}
              </h2>

              <p className="contact-lead-text">
                {lang === "bn"
                  ? "আমাদের সাথে যোগাযোগ করুন। একসাথে আমরা ছড়িয়ে দিই জীবনের উপহার।"
                  : "Reach out to us. Together, we share the gift of life."}
              </p>

              {/* Emergency Hotline Numbers */}
              <div className="emergency-hotline-card">
                <div className="hotline-title">
                  <span className="hotline-icon">🚨</span>
                  <strong>{lang === "bn" ? "জরুরি যোগাযোগ নম্বর:" : "Emergency Contact Numbers:"}</strong>
                </div>
                <div className="hotline-numbers">
                  <a href="tel:+8801624980276" className="phone-item-link">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <span>+880 1624-980276</span>
                  </a>
                  <span className="phone-divider">/</span>
                  <a href="tel:+8801521433483" className="phone-item-link">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <span>+880 1521-433483</span>
                  </a>
                </div>
              </div>
              
              {/* Facebook & Instagram Icons */}
              <div className="contact-social-area">
                <span className="social-sublabel">
                  {lang === "bn" ? "আমাদের সামাজিক মাধ্যমে যুক্ত থাকুন:" : "Follow Jibonbindu:"}
                </span>
                <div className="social-icons-row">
                  {/* Facebook Icon */}
                  <a
                    href="https://www.facebook.com/Jibonbindufoundation"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-social-pill fb-pill"
                    title="Follow on Facebook"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>Facebook</span>
                  </a>

                  {/* Instagram Icon */}
                  <a
                    href="https://www.instagram.com/jibonbindu/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-social-pill insta-pill"
                    title="Follow on Instagram"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    <span>Instagram</span>
                  </a>
                </div>
              </div>
            </div>

                        {/* RIGHT COLUMN: Contact Form with E-mail ID below Full Name */}
            <div className="contact-col-form">
              <form className="contact-interactive-form" onSubmit={handleContactSubmit}>
                <h3 className="form-title">
                  {lang === "bn" ? "আমাদের একটি বার্তা পাঠান" : "Send Us a Message"}
                </h3>

                {formSent && (
                  <div className="contact-success-alert">
                    ✓ {lang === "bn" ? "আপনার বার্তাটি ইমেইলের জন্য প্রস্তুত হয়েছে।" : "Your message is ready for info.jibonbindu@gmail.com!"}
                  </div>
                )}

                {/* 1. Full Name */}
                <div className="contact-form-group">
                  <label htmlFor="fullName" className="contact-label">
                    {lang === "bn" ? "পূর্ণ নাম *" : "Full Name *"}
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    className="contact-input-field"
                    placeholder={lang === "bn" ? "যেমন: মোহাম্মদ রহিম" : "e.g. John Doe"}
                    value={contactForm.fullName}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, fullName: e.target.value })
                    }
                  />
                </div>

                {/* 2. E-mail ID (Directly below Full Name) */}
                <div className="contact-form-group">
                  <label htmlFor="email" className="contact-label">
                    {lang === "bn" ? "ই-মেইল *" : "E-mail ID *"}
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="contact-input-field"
                    placeholder={lang === "bn" ? "example@mail.com" : "example@mail.com"}
                    value={contactForm.email}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, email: e.target.value })
                    }
                  />
                </div>

                {/* 3. Message */}
                <div className="contact-form-group">
                  <label htmlFor="message" className="contact-label">
                    {lang === "bn" ? "বার্তা *" : "Message *"}
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    className="contact-input-field contact-textarea-field"
                    placeholder={
                      lang === "bn"
                        ? "আপনার প্রশ্ন বা বার্তা এখানে লিখুন..."
                        : "Write your message or inquiry here..."
                    }
                    value={contactForm.message}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, message: e.target.value })
                    }
                  />
                </div>

                {/* 4. Submit Button */}
                <button type="submit" className="contact-form-submit-btn">
                  <span>{lang === "bn" ? "বার্তা পাঠান" : "Send Message"}</span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
       {/* Fixed Copyright Footer */}
      <Footer lang={lang} />
    </div>
  );
}