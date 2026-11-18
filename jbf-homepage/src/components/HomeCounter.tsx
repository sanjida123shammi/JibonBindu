import { useEffect, useRef, useState } from "react";
import { statsApi, type CounterStats } from "../api/statsApi";
import type { Strings } from "../i18n";

interface HomeCounterProps {
  t: Strings;
}

interface CounterItemConfig {
  key: keyof CounterStats;
  label: string;
}

// Custom hook to smoothly animate count only when the section is visible
function useAnimatedCount(
  target: number,
  isVisible: boolean,
  duration: number = 2400 // Slower duration for a satisfying rollup (2.4 seconds)
): number {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    // Only start counting when the user actually sees the section
    if (!isVisible || target <= 0) {
      setCount(0);
      return;
    }

    let animId: number;
    const startTime = performance.now();

    function update(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease-out cubic curve: steady progression that gently slows down at the end
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeProgress * target);
      setCount(current);

      if (progress < 1) {
        animId = requestAnimationFrame(update);
      } else {
        setCount(target);
      }
    }

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [target, isVisible, duration]);

  return count;
}

function CounterCircle({
  value,
  label,
  loading,
  isVisible,
}: {
  value: number;
  label: string;
  loading: boolean;
  isVisible: boolean;
}) {
  const animatedValue = useAnimatedCount(value, isVisible, 2400);

  return (
    <div className="counter-item">
      <div className={`counter-circle ${loading ? "is-loading" : ""}`}>
        <span className="counter-number">
          {loading ? "..." : animatedValue.toLocaleString()}
        </span>
      </div>
      <span className="counter-label">{label}</span>
    </div>
  );
}

export default function HomeCounter({ t }: HomeCounterProps) {
  const [stats, setStats] = useState<CounterStats>({
    totalDonation: 0,
    totalCase: 0,
    totalDonor: 0,
    totalMember: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  // Trigger animation when the user scrolls the counter into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once triggered, keep it counted so it doesn't reset on minor scroll
          observer.disconnect();
        }
      },
      {
        threshold: 0.25, // Starts when 25% of the counter section is visible
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Fetch counter statistics from API with fallbacks
  useEffect(() => {
    let mounted = true;
    statsApi
      .getCounterStats()
      .then((data) => {
        if (mounted) {
          setStats(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn("API counter fetch failed, displaying fallback numbers:", err);
        if (mounted) {
          setStats({
            totalDonation: 1250,
            totalCase: 850,
            totalDonor: 420,
            totalMember: 50,
          });
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const items: CounterItemConfig[] = [
    { key: "totalDonation", label: t.totalDonation },
    { key: "totalCase", label: t.totalCase },
    { key: "totalDonor", label: t.totalDonor },
    { key: "totalMember", label: t.totalMember },
  ];

  return (
    <section
      ref={sectionRef}
      className="home-counter-section"
      aria-label="Key Statistics"
    >
      <h2 className="counter-section-heading">
        {t.ourAchievement || "Our Achievement"}
      </h2>
      <div className="home-counter-container">
        {items.map((item) => (
          <CounterCircle
            key={item.key}
            value={stats[item.key]}
            label={item.label}
            loading={loading}
            isVisible={isVisible}
          />
        ))}
      </div>
    </section>
  );
}