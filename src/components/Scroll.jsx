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
  const wheelLocked = useRef(false);

  // === Smooth scroll to current slide ===
  const scrollToCurrent = () => {
    const container = containerRef.current;
    const nextImage = container?.children[currentIndex.current];
    if (nextImage) {
      nextImage.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
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

  // === Mouse wheel scroll control ===
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      if (wheelLocked.current) return;

      wheelLocked.current = true;
      const delta = e.deltaY;

      if (delta > 0) {
        currentIndex.current = (currentIndex.current + 1) % SLIDES.length;
      } else if (delta < 0) {
        currentIndex.current = (currentIndex.current - 1 + SLIDES.length) % SLIDES.length;
      }

      setVisibleIndex(currentIndex.current);
      scrollToCurrent();

      // reset auto-scroll timer after manual scroll
      restartAutoScroll();

      setTimeout(() => {
        wheelLocked.current = false;
      }, config.fade * 1000);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [config.fade, config.interval]);

  // === Auto-scroll initialization ===
  useEffect(() => {
    restartAutoScroll();
    return () => clearInterval(intervalRef.current);
  }, [config.interval]);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);

  return (
    <>
      {/* Slide counter overlay */}
      <div className="slide-counter">
        {visibleIndex + 1} / {SLIDES.length}
      </div>

      {/* Scrollable gallery */}
      <div className="scroll-gallery" ref={containerRef} style={{ overflow: 'hidden' }}>
        {SLIDES.map((slide, i) => {
          const displayName = slide
            .replace(/\.[^/.]+$/, '')
            .replace(/_R$|_L$/i, '')
            .replace(/_/g, ' ')
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .trim();

          return (
            <div key={i} className="scroll-image">
              <img src={`/${ASSETS_FOLDER}/${slide}`} alt={displayName} />
              <div className="caption">{displayName}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}
