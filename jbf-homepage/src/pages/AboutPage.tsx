import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../auth/useAuth";
import { tokenStore } from "../api/http";
import { STRINGS, type Lang } from "../i18n";

import causeLogo from "../assets/cause-logo.jpeg";
import storyImage from "../assets/3.camp.jpeg";
import Footer from "../components/Footer";

const ANGULAR_APP_URL =
  import.meta.env.VITE_ANGULAR_APP_URL ?? "http://localhost:4200";

export default function AboutPage() {
  const { user } = useAuth();
  // Defaults to "en"
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("jbf_lang");
    return saved === "en" ? "en" : "bn";
  });
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);
  useEffect(() => {
    localStorage.setItem("jbf_lang", lang);
  }, [lang]);

  const t = STRINGS[lang];

  // Bilingual content for Join the Cause with connected dashboard forms
  const causeItems = [
    {
      id: "become-a-donor",
      title: lang === "bn" ? "রক্তদাতা হোন" : "Become a Donor",
      description:
        lang === "bn"
          ? "জরুরি রক্তের প্রয়োজনে ডাক পেতে আমাদের সাথে নিবন্ধন করুন।"
          : "Register with us to be called upon when someone urgently needs your blood type.",
      targetPath: "/donors/new", // Dashboard Donor Form
    },
    {
      id: "volunteer",
      title: lang === "bn" ? "স্বেচ্ছাসেবক হোন" : "Volunteer",
      description:
        lang === "bn"
          ? "জরুরি পরিস্থিতি সমন্বয় এবং আমাদের রক্তদাতাদের সহায়তায় সক্রিয় দলের সাথে যুক্ত হোন।"
          : "Join our active team on the ground to help coordinate emergencies and support our donors.",
      targetPath: "/members/new", // Dashboard Volunteer / Member Form
    },
    {
      id: "support-our-fund",
      title: lang === "bn" ? "আমাদের তহবিলে সহায়তা করুন" : "Support Our Fund",
      description:
        lang === "bn"
          ? "রোগীদের সেবা ১০০% বিনামূল্যে রাখতে এবং রক্তদাতাদের সম্পূর্ণ সহায়তা নিশ্চিত করতে আমাদের অপারেশনাল ফান্ডে অনুদান দিন।"
          : "Help us keep our services 100% free for patients and fully covered for donors by contributing to our operational fund.",
      targetPath: "/funds/deposits/new", // Dashboard Fund Form
    },
  ];

    const handleActionClick = (targetPath: string) => {
      if (user) {
        // 1. If user is logged in: take them directly to connected dashboard form
        const token = tokenStore.get();
        const url = token
          ? `${ANGULAR_APP_URL}${targetPath}${targetPath.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`
          : `${ANGULAR_APP_URL}${targetPath}`;
        window.location.href = url;
      } else {
        // 2. If user is NOT logged in: redirect to login page with returnUrl
        window.location.href = `${ANGULAR_APP_URL}/login?returnUrl=${encodeURIComponent(
          targetPath,
        )}`;
      }
    };

  return (
    <div className="about-page-wrapper" lang={lang}>
      <div className="auth-bg" aria-hidden="true" />

      {/* Top Navbar with Language Switcher */}
      <Navbar t={t} lang={lang} onLangChange={setLang} />

      <main className="about-page-container">
        {/* TOP OF THE PAGE: Page Title instead of back-to-home button */}
        <div className="about-page-top-header">
          <h1 className="about-page-main-title">
            {lang === "bn" ? "আমাদের সম্পর্কে" : "About Us"}
          </h1>
        </div>

        {/* 1. Core Introduction */}
        <header className="about-hero-card glass-panel">
          <p
            className="about-hero-lead"
            style={{ fontSize: "1.1rem", lineHeight: "1.8" }}
          >
            {lang === "bn" ? (
              <>
                জীবনবিন্দু ফাউন্ডেশনে আমরা বিশ্বাস করি যে মানবতার শ্রেষ্ঠ কাজ
                হলো একটি প্রাণ রক্ষা করা। রক্তের অভাবে যাতে কোনো মুমূর্ষু রোগী
                কষ্ট না পায় বা প্রাণ না হারায়—এই একনিষ্ঠ লক্ষ্য নিয়ে পরিচালিত
                একটি অলাভজনক স্বেচ্ছাসেবী সংগঠন।{" "}
                <strong>"এক বিন্দু রক্ত, এক প্রাণের স্পন্দন"</strong>—এই
                মূলমন্ত্রকে ধারণ করে আমরা স্বেচ্ছাসেবী রক্তদাতা ও সংকটাপন্ন
                রোগীদের মাঝে দূরত্ব ঘোচাতে নিরলস কাজ করে যাচ্ছি।
              </>
            ) : (
              <>
                At Jibonbindu Foundation, we believe that humanity’s greatest
                act is saving a life. We are a dedicated, non-profit
                organization driven by a single, powerful purpose: ensuring that
                no emergency patient suffers or loses their life due to a lack
                of blood. Guided by our core belief—
                <strong>"এক বিন্দু রক্ত, এক প্রাণের স্পন্দন"</strong> (One drop
                of blood, the pulse of a life)—we work tirelessly to bridge the
                gap between voluntary blood donors and critically ill patients
                who need immediate help.
              </>
            )}
          </p>
        </header>

        {/* 2. Our Mission */}
        <section className="about-section-card glass-panel">
          <h2
            className="section-title mb-3"
            style={{ color: "#ffffff", fontWeight: 800 }}
          >
            {lang === "bn" ? "আমাদের লক্ষ্য (Our Mission)" : "Our Mission"}
          </h2>
          <p
            className="section-body-text"
            style={{ fontSize: "1.05rem", lineHeight: "1.75" }}
          >
            {lang === "bn"
              ? "আমাদের লক্ষ্য সুনির্দিষ্ট ও মানবিক: সংকটাপন্ন পরিস্থিতিতে থাকা রোগীদের জন্য সম্পূর্ণ বিনামূল্যে নিরাপদ ও জরুরি রক্তের ব্যবস্থা করা। একই সাথে এমন একটি শক্তিশালী ও সহানুভূতিশীল রক্তদাতা ও স্বেচ্ছাসেবক সমাজ গড়ে তোলা, যারা যেকোনো চিকিৎসাজনিত জরুরি প্রয়োজনে দ্রুত এগিয়ে আসতে প্রস্তুত।"
              : "Our mission is simple yet vital: to provide safe, emergency blood to those in critical condition, completely free of charge. We strive to build a strong, compassionate community of donors and volunteers who are always ready to respond to medical emergencies."}
          </p>
        </section>

        {/* 3. How We Are Different */}
        <section className="about-section-card glass-panel">
          <h2
            className="section-title mb-2"
            style={{ color: "#ffffff", fontWeight: 800 }}
          >
            {lang === "bn"
              ? "আমরা যেভাবে আলাদা (How We Are Different)"
              : "How We Are Different"}
          </h2>
          <p
            className="section-subtitle mb-4"
            style={{ color: "#cbd5e1", fontSize: "1rem" }}
          >
            {lang === "bn"
              ? "আমরা একটি কঠোর নৈতিকতা ও সহানুভূতির নীতিতে পরিচালিত হই যা রোগী ও রক্তদাতা উভয়কেই প্রাধান্য দেয়:"
              : "We operate on a strict code of ethics and compassion that puts both the patient and the donor first:"}
          </p>

          <div className="diff-pillars-grid">
            <div className="pillar-glass-card">
              <h3 className="pillar-heading mb-2" style={{ color: "#ffffff" }}>
                {lang === "bn"
                  ? "গ্রহীতাদের জন্য ১০০% বিনামূল্যে"
                  : "100% Free for Seekers"}
              </h3>
              <p className="pillar-body">
                {lang === "bn"
                  ? "চিকিৎসার জরুরি সময়ে পরিবার যে অসহনীয় মানসিক ও আর্থিক চাপে থাকে, তা আমরা বুঝি। রক্ত সন্ধানকারীদের কাছ থেকে আমরা কখনোই একটি পয়সাও গ্রহণ বা দাবি করি না। আমাদের সেবা সম্পূর্ণ বিনামূল্যে।"
                  : "We understand the extreme stress families face during medical emergencies. We never accept or ask for a single penny from those seeking blood. Our services are entirely free, ensuring that financial hardship never stands in the way of a life-saving transfusion."}
              </p>
            </div>

            <div className="pillar-glass-card">
              <h3 className="pillar-heading mb-2" style={{ color: "#ffffff" }}>
                {lang === "bn"
                  ? "রক্তদাতার সম্পূর্ণ সহায়তা"
                  : "Fully Funded Donor Support"}
              </h3>
              <p className="pillar-body">
                {lang === "bn"
                  ? "রক্তদান প্রক্রিয়ার সাথে সম্পর্কিত যাতায়াত ও আনুষঙ্গিক লজিস্টিক খরচের সম্পূর্ণ দায়ভার ফাউন্ডেশন নিজস্ব তহবিল থেকে বহন করে। রক্তদাতারা অমূল্য রক্ত দান করেন, তাই নিজস্ব টাকা খরচের প্রয়োজন নেই।"
                  : "We bear all the costs associated with the blood donation process from our own foundation funds. Donors give their invaluable blood, and we ensure they do not have to spend their own money on transportation or related logistical expenses to do so."}
              </p>
            </div>

            <div className="pillar-glass-card">
              <h3 className="pillar-heading mb-2" style={{ color: "#ffffff" }}>
                {lang === "bn"
                  ? "দাতার স্বাস্থ্য ও সুরক্ষায় আপসহীন"
                  : "Uncompromising Donor Health & Safety"}
              </h3>
              <p className="pillar-body">
                {lang === "bn"
                  ? "আমাদের রক্তদাতারা আমাদের নায়ক এবং তাদের সুস্থতা আমাদের সর্বোচ্চ অগ্রাধিকার। রক্তদানের সময় ও পরে সার্বিক যত্ন নিশ্চিত করা হয় এবং তাদের নিয়মিত খোঁজখবর রাখা হয়।"
                  : "Our donors are our heroes, and their well-being is our top priority. We take comprehensive measures to ensure that every donor is safe, comfortable, and properly cared for during the process, and we follow up to ensure they remain healthy after donating."}
              </p>
            </div>
          </div>
        </section>

        {/* 4. Our Story (Equal Parts 50% / 50%) */}
        <section className="about-section-card glass-panel">
          <div className="story-equal-grid">
            <div className="story-text-col">
              <h2
                className="section-title mb-3"
                style={{ color: "#ffffff", fontWeight: 800 }}
              >
                {lang === "bn" ? "আমাদের গল্প (Our Story)" : "Our Story"}
              </h2>
              <p
                className="section-body-text"
                style={{ fontSize: "1.05rem", lineHeight: "1.8" }}
              >
                {lang === "bn"
                  ? "একটি ছোট্ট মানবিক উদ্যোগ হিসেবে যা শুরু হয়েছিল, তা আজ নিবেদিতপ্রাণ স্বেচ্ছাসেবক ও রক্তদাতাদের এক বিশাল পরিবারে পরিণত হয়েছে। আমাদের দৈনন্দিন কর্মকাণ্ডে প্রমাণিত—জীবনবিন্দু কেবল একটি সংস্থা নয়, এটি এক পরম সহানুভূতির আন্দোলন। গভীর রাতে জরুরি রক্তের ব্যবস্থা করা হোক কিংবা জনসচেতনতামূলক ক্যাম্পেইন, মূল্যবান সময় ও নিঃস্বার্থ রক্তদানের অনুপ্রেরণায় আমাদের সমাজ ঐক্যবদ্ধ।"
                  : "What started as a small initiative has grown into a widespread family of selfless volunteers and donors. As seen in our everyday activities and community gatherings, Jibonbindu is more than just an organization; it is a movement of empathy. Whether we are arranging an urgent blood match in the middle of the night or organizing donor awareness events, our community stands united by the inspiration of valuable time and selfless blood donation."}
              </p>
            </div>

            <div className="story-image-col">
              <div className="story-image-wrapper">
                <img
                  src={storyImage}
                  alt="Our Story - Jibonbindu"
                  className="story-featured-img"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 5. Join the Cause (Left: matching dark background with emblem; Right: 3 Action Cards) */}
        <section className="about-section-card glass-panel">
          <h2
            className="section-title mb-2"
            style={{ color: "#ffffff", fontWeight: 800 }}
          >
            {lang === "bn"
              ? "আমাদের সাথে যুক্ত হোন (Join the Cause)"
              : "Join the Cause"}
          </h2>
          <p
            className="section-subtitle mb-4"
            style={{ color: "#cbd5e1", fontSize: "1rem" }}
          >
            {lang === "bn"
              ? "যেহেতু আমরা রক্তদাতাদের সকল খরচ নিজস্ব তহবিল থেকে বহন করি, তাই আমরা সমাজের উদারতা ও সহযোগিতার ওপর আস্থাশীল। জীবনবিন্দু পরিবারের অংশ হওয়ার উপায়সমূহ:"
              : "Because we cover all donor expenses from our own foundation, we rely on the generosity and spirit of our community. There are many ways you can be a part of the Jibonbindu family:"}
          </p>

          <div className="cause-equal-layout">
            {/* Left side matching background with emblem */}
            <div className="cause-left-card">
              <img
                src={causeLogo}
                alt="Jibonbindu Emblem"
                className="cause-emblem-image"
              />
            </div>

            {/* Right side interactive cards linked to dashboard */}
            <div className="questions-column">
              {causeItems.map((item) => (
                <div
                  key={item.id}
                  className="question-card"
                  onClick={() => handleActionClick(item.targetPath)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleActionClick(item.targetPath);
                    }
                  }}
                >
                  <div className="card-content">
                    <h3 className="card-title">{item.title}</h3>
                    <p className="card-subtitle">{item.description}</p>
                  </div>

                  <div className="card-action-arrow" aria-hidden="true">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Get in Touch with Facebook & Instagram Links */}
        <section className="about-section-card glass-panel contact-highlight-panel">
          <h2
            className="section-title mb-3"
            style={{ color: "#ffffff", fontWeight: 800 }}
          >
            {lang === "bn" ? "যোগাযোগ করুন (Get in Touch)" : "Get in Touch"}
          </h2>

          <p
            className="contact-email-line mb-3"
            style={{ color: "#e2e8f0", fontSize: "1.05rem" }}
          >
            <strong>{lang === "bn" ? "ইমেইল:" : "Email:"}</strong>{" "}
            <a
              href="mailto:info.jibonbindu@gmail.com"
              style={{ color: "#ff6b81", textDecoration: "none" }}
            >
              info.jibonbindu@gmail.com
            </a>
          </p>

          {/* Social Follow Links: Facebook & Instagram */}
          <div className="about-social-section mb-4">
            <span className="social-label-text">
              {lang === "bn"
                ? "আমাদের সামাজিক মাধ্যমে যুক্ত থাকুন:"
                : "Follow Us on Social Media:"}
            </span>

            <div className="about-social-buttons">
              {/* Facebook Link */}
              <a
                href="https://www.facebook.com/Jibonbindufoundation"
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn facebook-btn"
                title="Follow Jibonbindu on Facebook"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </a>

              {/* Instagram Link */}
              <a
                href="https://www.instagram.com/jibonbindu/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn instagram-btn"
                title="Follow Jibonbindu on Instagram"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>Instagram</span>
              </a>
            </div>
          </div>

          {/* Closing Motto */}
          <div className="motto-closing-box">
            <blockquote
              className="closing-quote-text"
              style={{ fontSize: "1.05rem" }}
            >
              {lang === "bn"
                ? "“একসাথে মিলে আমরা নিশ্চিত করতে পারি—রক্তের প্রতিটি বিন্দুই যেন পৃথিবীতে একটি নতুন হৃদস্পন্দন জাগিয়ে তোলে।”"
                : "“Together, we can ensure that every drop of blood brings a new heartbeat to the world.”"}
            </blockquote>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </div>
  );
}
