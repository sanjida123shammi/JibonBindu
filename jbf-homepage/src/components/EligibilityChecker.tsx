import { useState } from "react";
import type { Strings } from "../i18n";

interface Props {
  t: Strings;
}

const ANGULAR_APP_URL =
  import.meta.env.VITE_ANGULAR_APP_URL ?? "http://localhost:4200";

type AnswersState = {
  age: boolean | null;
  weight: boolean | null;
  interval: boolean | null;
  health: boolean | null;
};

interface BloodDropButtonProps {
  label: string;
  type: "yes" | "no";
  isActive: boolean;
  onClick: () => void;
}

/** Blood Drop shaped interactive button */
function BloodDropButton({ label, type, isActive, onClick }: BloodDropButtonProps) {
  const isYes = type === "yes";

  return (
    <button
      type="button"
      className={`blood-drop-btn ${isYes ? "drop-yes" : "drop-no"} ${isActive ? "is-active" : ""}`}
      onClick={onClick}
      title={`${label} (${type.toUpperCase()})`}
      aria-pressed={isActive}
    >
      <svg
        className="blood-drop-svg"
        viewBox="0 0 100 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Active Yes Gradient (Green) */}
          <linearGradient id="dropGradYes" x1="50" y1="5" x2="50" y2="115" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="60%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          {/* Active No Gradient (Red) */}
          <linearGradient id="dropGradNo" x1="50" y1="5" x2="50" y2="115" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="60%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>

          {/* Unselected Default Glass Gradient */}
          <linearGradient id="dropGradDefault" x1="50" y1="5" x2="50" y2="115" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.12)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.04)" />
          </linearGradient>
        </defs>

        {/* Realistic Blood Droplet Silhouette */}
        <path
          className="drop-path"
          d="M50 8 
             C50 8, 88 56, 88 84 
             C88 104, 71 116, 50 116 
             C29 116, 12 104, 12 84 
             C12 56, 50 8, 50 8 Z"
          fill={isActive ? (isYes ? "url(#dropGradYes)" : "url(#dropGradNo)") : "url(#dropGradDefault)"}
          stroke={isActive ? (isYes ? "#10b981" : "#ef4444") : "rgba(255, 255, 255, 0.2)"}
          strokeWidth="2.5"
        />

        {/* 3D Glass Arc Highlight */}
        <path
          d="M48 18 C36 38, 23 62, 24 82 C25 87, 22 89, 19 85 C16 68, 33 34, 45 16 Z"
          fill="#ffffff"
          opacity={isActive ? 0.45 : 0.2}
        />
      </svg>

      {/* Button Text Centered Inside Droplet */}
      <span className="blood-drop-label">{label}</span>
    </button>
  );
}

export default function EligibilityChecker({ t }: Props) {
  const [answers, setAnswers] = useState<AnswersState>({
    age: null,
    weight: null,
    interval: null,
    health: null,
  });

  const setAnswer = (key: keyof AnswersState, val: boolean) => {
    setAnswers((prev) => ({ ...prev, [key]: val }));
  };

  const resetAll = () => {
    setAnswers({ age: null, weight: null, interval: null, health: null });
  };

  const values = Object.values(answers);
  const allAnswered = values.every((v) => v !== null);
  const isFullyEligible = allAnswered && values.every((v) => v === true);
  const hasIneligible = values.some((v) => v === false);

  const goToCases = () => {
    window.location.href = `${ANGULAR_APP_URL}/cases`;
  };

  return (
    <section className="eligibility-section" aria-label="Clinical Pre-screening Protocol">
      {/* Top Header */}
      <div className="eligibility-header">
        <div className="eligibility-title-block">
          <div className="protocol-badge">
            <svg
              className="pulse-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#e0334c"
              strokeWidth="2.5"
            >
            </svg>
          </div>

          <h2 className="eligibility-heading">
            {t.eligibilityTitle || "আমি কি আজ রক্ত দিতে পারি?"}
          </h2>

          <p className="eligibility-subheading">
            {t.eligibilitySub ||
              "জাতীয় ও বিশ্ব স্বাস্থ্য সংস্থার রক্ত পরিসঞ্চালন মানদণ্ড অনুযায়ী ৪টি দ্রুত স্বাস্থ্য প্রশ্নের উত্তর দিয়ে আপনার উপযুক্ততা যাচাই করুন।"}
          </p>
        </div>

        {/* Reset Button */}
        <button
          type="button"
          className="reset-answers-btn"
          onClick={resetAll}
          title="Reset all questions"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          <span>{t.resetQuestions || "প্রশ্ন রিসেট করুন"}</span>
        </button>
      </div>

      {/* 4 Criteria Cards */}
      <div className="criteria-grid">
        {/* Card 1: Age */}
        <div className={`criteria-card ${answers.age === true ? "card-selected-yes" : answers.age === false ? "card-selected-no" : ""}`}>
          <div className="criteria-card-head">
            <span className="card-icon">📅</span>
            <h3 className="card-crit-title">{t.critAgeTitle || "১. বয়স (১৮ - ৬৫ বছর)"}</h3>
          </div>
          <p className="card-crit-desc">
            {t.critAgeDesc || "আপনার বয়স কি বর্তমানে ১৮ থেকে ৬৫ বছরের মধ্যে?"}
          </p>
          <div className="blood-drop-button-row">
            <BloodDropButton
              label={t.btnYes || "হ্যাঁ"}
              type="yes"
              isActive={answers.age === true}
              onClick={() => setAnswer("age", true)}
            />
            <BloodDropButton
              label={t.btnNo || "না"}
              type="no"
              isActive={answers.age === false}
              onClick={() => setAnswer("age", false)}
            />
          </div>
        </div>

        {/* Card 2: Weight */}
        <div className={`criteria-card ${answers.weight === true ? "card-selected-yes" : answers.weight === false ? "card-selected-no" : ""}`}>
          <div className="criteria-card-head">
            <span className="card-icon">⚖️</span>
            <h3 className="card-crit-title">{t.critWeightTitle || "২. ওজন (≥ ৫০ কেজি)"}</h3>
          </div>
          <p className="card-crit-desc">
            {t.critWeightDesc || "আপনার শরীরের ওজন কি অন্তত ৫০ কেজি (১১০ পাউন্ড)?"}
          </p>
          <div className="blood-drop-button-row">
            <BloodDropButton
              label={t.btnYes || "হ্যাঁ"}
              type="yes"
              isActive={answers.weight === true}
              onClick={() => setAnswer("weight", true)}
            />
            <BloodDropButton
              label={t.btnNo || "না"}
              type="no"
              isActive={answers.weight === false}
              onClick={() => setAnswer("weight", false)}
            />
          </div>
        </div>

        {/* Card 3: Interval */}
        <div className={`criteria-card ${answers.interval === true ? "card-selected-yes" : answers.interval === false ? "card-selected-no" : ""}`}>
          <div className="criteria-card-head">
            <span className="card-icon">💛</span>
            <h3 className="card-crit-title">{t.critIntervalTitle || "৩. বিরতি (৯০+ দিন)"}</h3>
          </div>
          <p className="card-crit-desc">
            {t.critIntervalDesc || "আপনার সর্বশেষ রক্তদানের পর কি অন্তত ৩ মাস (৯০ দিন) অতিক্রান্ত হয়েছে?"}
          </p>
          <div className="blood-drop-button-row">
            <BloodDropButton
              label={t.btnYes || "হ্যাঁ"}
              type="yes"
              isActive={answers.interval === true}
              onClick={() => setAnswer("interval", true)}
            />
            <BloodDropButton
              label={t.btnNo || "না"}
              type="no"
              isActive={answers.interval === false}
              onClick={() => setAnswer("interval", false)}
            />
          </div>
        </div>

        {/* Card 4: Health */}
        <div className={`criteria-card ${answers.health === true ? "card-selected-yes" : answers.health === false ? "card-selected-no" : ""}`}>
          <div className="criteria-card-head">
            <span className="card-icon">❇️</span>
            <h3 className="card-crit-title">{t.critHealthTitle || "৪. সুস্থ শারীরিক অবস্থা"}</h3>
          </div>
          <p className="card-crit-desc">
            {t.critHealthDesc || "আপনি কি আজ জ্বর, সর্দি ও অ্যান্টিবায়োটিক সেবনমুক্ত আছেন?"}
          </p>
          <div className="blood-drop-button-row">
            <BloodDropButton
              label={t.btnYes || "হ্যাঁ"}
              type="yes"
              isActive={answers.health === true}
              onClick={() => setAnswer("health", true)}
            />
            <BloodDropButton
              label={t.btnNo || "না"}
              type="no"
              isActive={answers.health === false}
              onClick={() => setAnswer("health", false)}
            />
          </div>
        </div>
      </div>

      {/* Outcome Banner */}
      {isFullyEligible && (
        <div className="eligibility-banner is-success-banner" role="status">
          <div className="banner-left">
            <div className="banner-check-circle">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12l2.5 2.5 L16 9" />
              </svg>
            </div>
            <div className="banner-text">
              <h4 className="banner-title">
                {t.eligibleBannerTitle || "অভিনন্দন! আপনি রক্তদানে সম্পূর্ণ উপযুক্ত!"}
              </h4>
              <p className="banner-desc">
                {t.eligibleBannerDesc ||
                  "আপনার উত্তরসমূহ জাতীয় ট্রান্সফিউশন নীতিমালার সাথে মিলেছে। আপনার এক ব্যাগ রক্ত ৩ জনের জীবন বাঁচাতে পারে।"}
              </p>
            </div>
          </div>
          <button type="button" className="banner-action-btn" onClick={goToCases}>
            <span>{t.viewEmergencyReq || "জরুরি আবেদন দেখুন"}</span>
            <span className="banner-arrow">→</span>
          </button>
        </div>
      )}

      {hasIneligible && (
        <div className="eligibility-banner is-warning-banner" role="alert">
          <div className="banner-left">
            <div className="banner-check-circle warning-circle">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="banner-text">
              <h4 className="banner-title">
                {t.ineligibleBannerTitle || "দুঃখিত, আপনি সাময়িকভাবে রক্তদানে উপযুক্ত নন"}
              </h4>
              <p className="banner-desc">
                {t.ineligibleBannerDesc ||
                  "আপনার শারীরিক সুরক্ষা ও রোগীর নিরাপত্তার জন্য স্বাস্থ্যবিধি অনুসারে নির্দিষ্ট সময় পর অনুগ্রহ করে পুনরায় চেষ্টা করুন।"}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}