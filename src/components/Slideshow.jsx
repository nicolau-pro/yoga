import { useEffect, useState, useRef } from 'react';
import { SLIDES, SLIDE_INTERVAL, FADE_DURATION, FADE_SOUND } from '../settings';

export default function Slideshow() {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  const manualRef = useRef(false);
  const progressRef = useRef(null);

  // === Format filename for display ===
  const getDisplayName = (filename) => {
    let name = filename.replace(/\.[^/.]+$/, ''); // remove extension
    name = name.replace(/_R$|_L$/i, ''); // remove trailing _R/_L
    name = name.replace(/_/g, ' '); // replace underscores
    name = name.replace(/([a-z])([A-Z])/g, '$1 $2'); // add space before capitals
    return name.trim();
  };

  // === Progress bar logic ===
  const startProgress = (intervalMs) => {
    cancelAnimationFrame(progressRef.current);
    setProgress(0); // ✅ reset to 0
    const startTime = performance.now();

    const updateProgress = (now) => {
      const elapsed = now - startTime;
      const pct = Math.min((elapsed / intervalMs) * 100, 100);
      setProgress(pct);
      if (pct < 100 && !fading) {
        progressRef.current = requestAnimationFrame(updateProgress);
      }
    };

    progressRef.current = requestAnimationFrame(updateProgress);
  };

  useEffect(() => {
    if (FADE_SOUND) audioRef.current = new Audio(`/src/assets/${FADE_SOUND}`);

    const intervalMs = SLIDE_INTERVAL * 1000;
    const fadeMs = FADE_DURATION * 1000;

    startProgress(intervalMs); // start immediately on load

    const id = setInterval(() => {
      if (manualRef.current) {
        manualRef.current = false;
        startProgress(intervalMs);
        return;
      }

      // play chime when fade starts
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      setFading(true);

      setTimeout(() => {
        setIndex((i) => (i + 1) % SLIDES.length);
        setFading(false);
        startProgress(intervalMs);
      }, fadeMs);
    }, intervalMs + fadeMs);

    return () => {
      clearInterval(id);
      cancelAnimationFrame(progressRef.current);
    };
  }, [fading]);

  // === Handle manual navigation ===
  useEffect(() => {
    const handleKey = (e) => {
      const total = SLIDES.length;
      if (e.key === 'ArrowRight') {
        manualRef.current = true;
        setIndex((i) => (i + 1) % total);
        setFading(false);
        setProgress(0);
      } else if (e.key === 'ArrowLeft') {
        manualRef.current = true;
        setIndex((i) => (i - 1 + total) % total);
        setFading(false);
        setProgress(0);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const currentName = getDisplayName(SLIDES[index]);
  const showCaption = currentName.toLowerCase() !== 'mandala';

  return (
    <div className="slideshow">
      {showCaption && <div className="caption">{currentName}</div>}

      <img src={`/src/assets/${SLIDES[index]}`} alt={currentName} key={SLIDES[index]} />

      <div
        className={`fade-layer ${fading ? 'visible' : ''}`}
        style={{ transitionDuration: `${FADE_DURATION}s` }}
      />

      {/* Progress bar */}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${progress}%`,
            transition: fading ? 'none' : 'width 0.1s linear',
          }}
        ></div>
      </div>
    </div>
  );
}
