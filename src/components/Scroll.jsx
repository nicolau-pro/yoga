import React, { useEffect, useRef, useState } from 'react';
import { SLIDES, ASSETS_FOLDER, SLIDE_INTERVAL, FADE_DURATION } from '../settings';

export default function Scroll() {
  // === Read optional URL overrides (interval & fade) ===
  const getUrlConfig = () => {
    const params = new URLSearchParams(window.location.search);
    const interval = parseFloat(params.get('interval')) || SLIDE_INTERVAL;
    const fade = parseFloat(params.get('fade')) || FADE_DURATION;
    return { interval, fade };
  };

  const [config] = useState(getUrlConfig());
  const containerRef = useRef(null);
  const currentIndex = useRef(0);
  const intervalRef = useRef(null);
  const [visibleIndex, setVisibleIndex] = useState(0);

  // === Smooth scroll to current slide ===
  const scrollToCurrent = () => {
    const container = containerRef.current;
    const target = container?.children[currentIndex.current];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // === Restart auto-scroll timer ===
  const restartAutoScroll = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      currentIndex.current = (currentIndex.current + 1) % SLIDES.length;
      setVisibleIndex(currentIndex.current);
      scrollToCurrent();
    }, config.interval * 1000);
  };

  // === Initialize auto-scroll ===
  useEffect(() => {
    restartAutoScroll();
    return () => clearInterval(intervalRef.current);
  }, [config.interval]);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);

  // === Handle user click ===
  const handleClick = (e, i) => {
    const slideElement = e.currentTarget;
    const rect = slideElement.getBoundingClientRect();
    const clickY = e.clientY - rect.top;

    if (i === currentIndex.current) {
      // User clicked on current slide
      if (clickY > (rect.height * 2) / 3) {
        // bottom third → next slide
        currentIndex.current = (currentIndex.current + 1) % SLIDES.length;
      } else {
        // top two-thirds → previous slide
        currentIndex.current = (currentIndex.current - 1 + SLIDES.length) % SLIDES.length;
      }
    } else {
      // Clicked another slide → go directly
      currentIndex.current = i;
    }

    setVisibleIndex(currentIndex.current);
    scrollToCurrent();
    restartAutoScroll();
  };

  return (
    <>
      {/* Slide counter overlay */}
      <div className="slide-counter">
        {visibleIndex + 1} / {SLIDES.length}
      </div>

      {/* Scrollable gallery */}
      <div className="scroll-gallery" ref={containerRef}>
        {SLIDES.map((slide, i) => {
          const displayName = slide
            .replace(/\.[^/.]+$/, '')
            .replace(/_R$|_L$/i, '')
            .replace(/_/g, ' ')
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .trim();

          const isActive = i === visibleIndex;
          const hideCaption = displayName.toLowerCase() === 'mandala'; // 👈 hide this one

          return (
            <div
              key={i}
              className={`scroll-image ${isActive ? 'active' : 'dimmed'}`}
              onClick={(e) => handleClick(e, i)}
              style={{ cursor: 'pointer' }}
            >
              <img src={`/${ASSETS_FOLDER}/${slide}`} alt={displayName} />
              {!hideCaption && <div className="caption">{displayName}</div>}
            </div>
          );
        })}
      </div>
    </>
  );
}
