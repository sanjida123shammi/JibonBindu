import { useEffect, useMemo, useRef, useState } from "react";

export interface Slide {
  image: string;
  title?: string;
  text?: string;
}

interface Props {
  slides: Slide[];
}

/**
 * Continuous infinite-loop hero image slider (Clean Image-Only).
 */
export default function HeroSlider({ slides }: Props) {
  const count = slides.length;

  // Single slide fallback
  if (count <= 1) {
    const s = slides[0];
    return (
      <section className="hero-slider" aria-label="Hero highlight">
        {s && (
          <figure
            className="hero-slide"
            style={{ backgroundImage: `url(${s.image})` }}
          />
        )}
      </section>
    );
  }

  // Prepend last slide and append first slide for seamless looping
  const extendedSlides = useMemo(() => {
    return [slides[count - 1], ...slides, slides[0]];
  }, [slides, count]);

  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const isMoving = useRef(false);

  const activeDot = (currentIndex - 1 + count) % count;

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, currentIndex]);

  const handleNext = () => {
    if (isMoving.current) return;
    isMoving.current = true;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (isMoving.current) return;
    isMoving.current = true;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  };

  const handleDotClick = (dotIndex: number) => {
    if (isMoving.current) return;
    setIsTransitioning(true);
    setCurrentIndex(dotIndex + 1);
  };

  const handleTransitionEnd = () => {
    isMoving.current = false;

    if (currentIndex >= count + 1) {
      setIsTransitioning(false);
      setCurrentIndex(1);
    } else if (currentIndex <= 0) {
      setIsTransitioning(false);
      setCurrentIndex(count);
    }
  };

  return (
    <section
      className="hero-slider"
      aria-roledescription="carousel"
      aria-label="Foundation highlights"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div
        className="hero-track"
        onTransitionEnd={handleTransitionEnd}
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: isTransitioning
            ? "transform 0.65s cubic-bezier(0.25, 1, 0.5, 1)"
            : "none",
        }}
      >
        {extendedSlides.map((s, i) => (
          <figure
            key={i}
            className="hero-slide"
            style={{ backgroundImage: `url(${s.image})` }}
            aria-hidden={activeDot !== (i - 1 + count) % count}
          />
        ))}
      </div>

      {/* Previous Arrow */}
      <button
        type="button"
        className="hero-arrow hero-prev"
        aria-label="Previous slide"
        onClick={handlePrev}
      >
        ‹
      </button>

      {/* Next Arrow */}
      <button
        type="button"
        className="hero-arrow hero-next"
        aria-label="Next slide"
        onClick={handleNext}
      >
        ›
      </button>

      {/* Navigation Dots */}
      <div className="hero-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === activeDot}
            className={i === activeDot ? "is-active" : ""}
            onClick={() => handleDotClick(i)}
          />
        ))}
      </div>
    </section>
  );
}