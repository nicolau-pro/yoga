import { useEffect, useState, useRef } from 'react';
import { SLIDES, SLIDE_INTERVAL, FADE_DURATION, FADE_SOUND } from '../settings';

export default function Slideshow() {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(true); // 👈 start paused
  const audioRef = useRef(null);
  const manualRef = useRef(false);
  const progressRef = useRef(null);
  const intervalRef = useRef(null);

  // === Read optional URL overrides (interval & fade) ===
  const getUrlConfig = () => {
    const params = new URLSearchParams(window.location.search);
    const interval = parseFloat(params.get('interval')) || SLIDE_INTERVAL;
    const fade = parseFloat(params.get('fade')) || FADE_DURATION;
    return { interval, fade };
  };

  const [config] = useState(getUrlConfig());

  // === Open YouTube Yoga Music tab on load ===
  useEffect(() => {
    window.open(
      'https://www.youtube.com/results?search_query=yoga+music',
      '_blank',
      'noopener,noreferrer'
    );
  }, []);

  // === Format filename for display ===
  const getDisplayName = (filename) => {
    let name = filename.replace(/\.[^/.]+$/, '');
    name = name.replace(/_R$|_L$/i, '');
    name = name.replace(/_/g, ' ');
    name = name.replace(/([a-z])([A-Z])/g, '$1 $2');
    return name.trim();
  };

  // === Progress bar logic ===
  const startProgress = (intervalMs) => {
    cancelAnimationFrame(progressRef.current);
    setProgress(0);
    const start = performance.now();

    const update = (now) => {
      if (paused) return;
      const elapsed = now - start;
      const pct = Math.min((elapsed / intervalMs) * 100, 100);
      setProgress(pct);
      if (pct < 100 && !fading) progressRef.current = requestAnimationFrame(update);
    };

    progressRef.current = requestAnimationFrame(update);
  };

  const startSlideshow = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    const intervalMs = config.interval * 1000;
    const fadeMs = config.fade * 1000;

    startProgress(intervalMs);

    intervalRef.current = setInterval(() => {
      if (paused) return;
      if (manualRef.current) {
        manualRef.current = false;
        startProgress(intervalMs);
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
        startProgress(intervalMs);
      }, fadeMs);
    }, intervalMs + fadeMs);
  };

  useEffect(() => {
    if (FADE_SOUND) audioRef.current = new Audio(`/assets/${FADE_SOUND}`);
    startSlideshow();

    return () => {
      clearInterval(intervalRef.current);
      cancelAnimationFrame(progressRef.current);
    };
  }, [paused]);

  // === Keyboard controls ===
  useEffect(() => {
    const handleKey = (e) => {
      const total = SLIDES.length;

      if (e.key === ' ') {
        e.preventDefault();
        setPaused((p) => !p);
        return;
      }

      if (paused) return;

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
  }, [paused]);

  const currentName = getDisplayName(SLIDES[index]);
  const showCaption = currentName.toLowerCase() !== 'mandala';

  return (
    <div className="slideshow">
      {showCaption && <div className="caption">{currentName}</div>}

      <img src={`/assets/${SLIDES[index]}`} alt={currentName} key={SLIDES[index]} />

      <div
        className={`fade-layer ${fading ? 'visible' : ''}`}
        style={{ transitionDuration: `${config.fade}s` }}
      />

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${progress}%`,
            transition: fading ? 'none' : 'width 0.1s linear',
          }}
        ></div>
      </div>

      {paused && <div className="pause-indicator">Paused</div>}
    </div>
  );
}
