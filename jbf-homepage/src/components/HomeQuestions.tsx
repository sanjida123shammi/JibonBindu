import { useAuth } from "../auth/useAuth";
import { tokenStore } from "../api/http";
import type { Strings } from "../i18n";

interface Props {
  t: Strings;
}

const ANGULAR_APP_URL =
  import.meta.env.VITE_ANGULAR_APP_URL ?? "http://localhost:4200";

interface QuestionItem {
  id: string;
  title: string;
  subtitle: string;
  badgeText: string;
  badgeColor: string;
  targetPath: string;
}

export default function HomeQuestions({ t }: Props) {
  const { user } = useAuth();

  const questions: QuestionItem[] = [
    {
      id: "need-blood",
      title: t.qNeedBlood || "Do you need blood?",
      subtitle:
        t.qNeedBloodSub ||
        "Post an urgent blood request for a patient and connect with nearby donors.",
      badgeText: "Request",
      badgeColor: "#e0334c",
      targetPath: "/cases/new",
    },
    {
      id: "donate-blood",
      title: t.qDonateBlood || "Do you want to donate blood?",
      subtitle:
        t.qDonateBloodSub ||
        "Register as a volunteer donor and save lives in your local community.",
      badgeText: "Donate",
      badgeColor: "#10b981",
      targetPath: "/donors/new",
    },
    {
      id: "join-family",
      title: t.qJoinFamily || "Do you want to join in our JibonBindu Family?",
      subtitle:
        t.qJoinFamilySub ||
        "Become an active foundation team member or volunteer associate.",
      badgeText: "Join Team",
      badgeColor: "#3b82f6",
      targetPath: "/members/new",
    },
    {
      id: "financial-aid",
      title:
        t.qFinancialAid || "Would you like to provide financial assistance?",
      subtitle:
        t.qFinancialAidSub ||
        "Support our patient medical fund and foundation emergency operations.",
      badgeText: "Contribute",
      badgeColor: "#f59e0b",
      targetPath: "/funds/deposits/new",
    },
  ];

    const handleCardClick = (targetPath: string) => {
      if (user) {
        // 1. If user is logged in: take them directly to the connected dashboard form
        const token = tokenStore.get();
        const url = token
          ? `${ANGULAR_APP_URL}${targetPath}${targetPath.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`
          : `${ANGULAR_APP_URL}${targetPath}`;
        window.location.href = url;
      } else {
        // 2. If user is NOT logged in: redirect to the login page with returnUrl
        window.location.href = `${ANGULAR_APP_URL}/login?returnUrl=${encodeURIComponent(
          targetPath,
        )}`;
      }
    };

  return (
    <section
      className="home-questions-section"
      aria-label="Get Started Options"
    >
      <h2 className="questions-section-heading">
        {t.getStartedHeading || "How Can We Help You Today?"}
      </h2>

      <div className="questions-layout">
        {/* LEFT COLUMN: Animated Happy Blood Drop Mascot with Spotlight Backdrop */}
        <div className="mascot-column">
          <div className="mascot-spotlight">
            <svg
              className="mascot-svg"
              viewBox="0 0 340 380"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="Happy blood drop welcoming you"
            >
              <defs>
                {/* 3D Blood Gradient */}
                <linearGradient
                  id="dropGrad"
                  x1="50"
                  y1="20"
                  x2="260"
                  y2="340"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#ff4d6d" />
                  <stop offset="45%" stopColor="#e02447" />
                  <stop offset="100%" stopColor="#8c031d" />
                </linearGradient>

                {/* Gloss / Shine */}
                <linearGradient
                  id="glossGrad"
                  x1="100"
                  y1="50"
                  x2="160"
                  y2="200"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>

                {/* Shoes gradient */}
                <linearGradient id="shoeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0b2230" />
                  <stop offset="100%" stopColor="#040d13" />
                </linearGradient>

                {/* Shadow */}
                <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(0,0,0,0.45)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                </radialGradient>
              </defs>

              {/* Ground Shadow */}
              <ellipse
                cx="170"
                cy="355"
                rx="100"
                ry="16"
                fill="url(#groundShadow)"
              />

              {/* Cute Little Legs */}
              <g className="mascot-legs">
                {/* Left Leg */}
                <rect
                  x="120"
                  y="270"
                  width="16"
                  height="50"
                  rx="8"
                  fill="#a1142d"
                />
                <ellipse
                  cx="124"
                  cy="325"
                  rx="22"
                  ry="12"
                  fill="url(#shoeGrad)"
                />
                <ellipse
                  cx="122"
                  cy="323"
                  rx="18"
                  ry="8"
                  fill="#ffffff"
                  opacity="0.25"
                />

                {/* Right Leg */}
                <rect
                  x="180"
                  y="270"
                  width="16"
                  height="50"
                  rx="8"
                  fill="#a1142d"
                />
                <ellipse
                  cx="190"
                  cy="325"
                  rx="22"
                  ry="12"
                  fill="url(#shoeGrad)"
                />
                <ellipse
                  cx="188"
                  cy="323"
                  rx="18"
                  ry="8"
                  fill="#ffffff"
                  opacity="0.25"
                />
              </g>

              {/* Left Arm (Hands on hip, confident) */}
              <g className="mascot-left-arm">
                <path
                  d="M72 195 C 45 205, 40 245, 68 250"
                  stroke="#a1142d"
                  strokeWidth="16"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle
                  cx="68"
                  cy="250"
                  r="14"
                  fill="#ffffff"
                  stroke="#d9dee3"
                  strokeWidth="3"
                />
              </g>

              {/* Main Blood Drop Body */}
              <path
                d="M170 35 
                   C 170 35, 75 160, 75 220 
                   C 75 285, 120 310, 170 310 
                   C 220 310, 265 285, 265 220 
                   C 265 160, 170 35, 170 35 Z"
                fill="url(#dropGrad)"
                filter="drop-shadow(0 14px 20px rgba(184, 15, 45, 0.45))"
              />

              {/* Glossy Curved Highlight */}
              <path
                d="M165 60 C 130 110, 95 180, 98 225 C 99 240, 95 245, 90 235 C 85 190, 125 110, 158 55 Z"
                fill="url(#glossGrad)"
              />

              {/* Right Arm (Gesturing and pointing towards the question cards on the right!) */}
              <g className="mascot-right-arm-pointing">
                <path
                  d="M255 195 C 285 195, 305 185, 320 170"
                  stroke="#a1142d"
                  strokeWidth="16"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Hand pointing to the right */}
                <circle
                  cx="320"
                  cy="170"
                  r="15"
                  fill="#ffffff"
                  stroke="#d9dee3"
                  strokeWidth="3"
                />
                <path
                  d="M322 170 L336 170"
                  stroke="#ffffff"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
              </g>

              {/* Happy Face Features */}
              {/* Left Eye */}
              <g className="mascot-eye-left">
                <ellipse cx="140" cy="180" rx="11" ry="16" fill="#0b2230" />
                <circle cx="137" cy="173" r="5" fill="#ffffff" />
                <circle cx="143" cy="187" r="2.5" fill="#ffffff" />
              </g>

              {/* Right Eye (Playful wink or wide happy eye) */}
              <g className="mascot-eye-right">
                <ellipse cx="198" cy="180" rx="11" ry="16" fill="#0b2230" />
                <circle cx="195" cy="173" r="5" fill="#ffffff" />
                <circle cx="201" cy="187" r="2.5" fill="#ffffff" />
              </g>

              {/* Rosy Cheeks */}
              <ellipse
                cx="120"
                cy="202"
                rx="10"
                ry="6"
                fill="#ff708f"
                opacity="0.75"
              />
              <ellipse
                cx="218"
                cy="202"
                rx="10"
                ry="6"
                fill="#ff708f"
                opacity="0.75"
              />

              {/* Big Joyful Smile */}
              <path
                d="M145 204 Q170 240 195 204"
                stroke="#0b2230"
                strokeWidth="5"
                strokeLinecap="round"
                fill="#ffffff"
              />
              <path d="M156 218 Q170 236 184 218 Z" fill="#ff4d6d" />
            </svg>
          </div>
        </div>

        {/* RIGHT COLUMN: 4 Interactive Question Cards */}
        <div className="questions-column">
          {questions.map((q) => (
            <div
              key={q.id}
              className="question-card"
              onClick={() => handleCardClick(q.targetPath)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleCardClick(q.targetPath);
                }
              }}
            >
              <div className="card-badge-wrap">
                <span
                  className="card-badge-pill"
                  style={{
                    backgroundColor: `${q.badgeColor}20`,
                    color: q.badgeColor,
                    borderColor: q.badgeColor,
                  }}
                >
                  {q.badgeText}
                </span>
              </div>

              <div className="card-content">
                <h3 className="card-title">{q.title}</h3>
                <p className="card-subtitle">{q.subtitle}</p>
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
  );
}
