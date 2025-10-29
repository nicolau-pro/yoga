import { useEffect, useState, useRef } from 'react';
import { SLIDES, SLIDE_INTERVAL, FADE_DURATION, FADE_SOUND } from '../settings';

export default function Slideshow() {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  const manualRef = useRef(false);

  // === Format filename for display ===
  const getDisplayName = (filename) => {
    let name = filename.replace(/\.[^/.]+$/, ''); // remove extension
    name = name.replace(/_R$|_L$/i, ''); // remove trailing _R/_L
    name = name.replace(/_/g, ' '); // replace underscores
    name = name.replace(/([a-z])([A-Z])/g, '$1 $2'); // add space before capitals
    return name.trim();
  };

  useEffect(() => {
    if (FADE_SOUND) audioRef.current = new Audio(`/src/assets/${FADE_SOUND}`);

    const intervalMs = SLIDE_INTERVAL * 1000;
    const fadeMs = FADE_DURATION * 1000;

    // progress bar updates
    let progressTimer;
    const startProgress = () => {
      setProgress(0);
      const start = performance.now();
      progressTimer = requestAnimationFrame(function update(now) {
        const elapsed = now - start;
        const pct = Math.min((elapsed / intervalMs) * 100, 100);
        setProgress(pct);
        if (pct < 100 && !fading) requestAnimationFrame(update);
      });
    };

    startProgress();

    const id = setInterval(() => {
      if (manualRef.current) {
        manualRef.current = false;
        startProgress();
        return;
      }

      // play chime at fade start
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      setFading(true);

      setTimeout(() => {
        setIndex((i) => (i + 1) % SLIDES.length);
        setFading(false);
        startProgress();
      }, fadeMs);
    }, intervalMs + fadeMs);

    return () => {
      clearInterval(id);
      cancelAnimationFrame(progressTimer);
    };
  }, [fading]);

  // === Handle manual navigation ===
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') {
        manualRef.current = true;
        setIndex((i) => (i + 1) % SLIDES.length);
        setFading(false);
        setProgress(0);
      } else if (e.key === 'ArrowLeft') {
        manualRef.current = true;
        setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length);
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
