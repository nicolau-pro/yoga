import { useEffect, useState, useRef } from 'react';
import {
  SLIDES,
  SLIDE_INTERVAL,
  FADE_DURATION,
  FADE_SOUND,
  ASSETS_FOLDER,
  END_ZOOM_SCALE,
} from '../settings';

export default function Slideshow() {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [started, setStarted] = useState(false);
  const audioRef = useRef(null);
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
    window.addEventListener('load', () => {
      window.open(
        'https://www.youtube.com/results?search_query=yoga+music',
        '_blank',
        'noopener,noreferrer'
      );
    });
  }, []);

  // === Keep screen awake ===
  useEffect(() => {
    let wakeLock = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
          console.log('Screen wake lock activated');
        }
      } catch (err) {
        console.warn('Wake Lock error:', err);
      }
    };
    requestWakeLock();
    const handleVisibilityChange = () => {
      if (wakeLock !== null && document.visibilityState === 'visible') requestWakeLock();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock) wakeLock.release().catch(() => {});
    };
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
      const elapsed = now - start;
      const pct = Math.min((elapsed / intervalMs) * 100, 100);
      setProgress(pct);
      if (pct < 100 && !fading) progressRef.current = requestAnimationFrame(update);
    };

    progressRef.current = requestAnimationFrame(update);
  };

  const runNextSlide = (intervalMs, fadeMs, totalSlideTime) => {
    // Start fade at end of zoom
    setTimeout(() => {
      setFading(true);

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      // End fade, switch image, reset zoom+progress
      setTimeout(() => {
        setIndex((i) => (i + 1) % SLIDES.length);
        setFading(false);
        startProgress(totalSlideTime);
      }, fadeMs);
    }, intervalMs);
  };

  const startSlideshow = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    const intervalMs = config.interval * 1000;
    const fadeMs = config.fade * 1000;
    const totalSlideTime = intervalMs + fadeMs;

    // Start progress + first transition immediately
    startProgress(totalSlideTime);
    runNextSlide(intervalMs, fadeMs, totalSlideTime);

    // Continue cycling automatically
    intervalRef.current = setInterval(() => {
      runNextSlide(intervalMs, fadeMs, totalSlideTime);
    }, totalSlideTime);
  };

  // === Start slideshow only after click ===
  useEffect(() => {
    if (!started) return;
    if (FADE_SOUND) audioRef.current = new Audio(`/chime/${FADE_SOUND}`);
    startSlideshow();

    return () => {
      clearInterval(intervalRef.current);
      cancelAnimationFrame(progressRef.current);
    };
  }, [started]);

  const handleClick = () => {
    if (!started) setStarted(true);
  };

  const currentName = getDisplayName(SLIDES[index]);
  const showCaption = currentName.toLowerCase() !== 'mandala';
  const minScale = 1.0;
  const scale = minScale + (END_ZOOM_SCALE - minScale) * (progress / 100);

  return (
    <div className="slideshow" onClick={handleClick}>
      {!started && <div className="caption">(Click to Start)</div>}

      {started && showCaption && <div className="caption">{currentName}</div>}

      <img
        src={`/${ASSETS_FOLDER}/${SLIDES[index]}`}
        alt={currentName}
        key={SLIDES[index]}
        style={{
          transform: `scale(${scale.toFixed(3)})`,
          opacity: started ? 1 : 0.6,
          transition: 'none',
        }}
      />

      {started && (
        <>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${progress}%`,
                transition: fading ? 'none' : 'width 0.1s linear',
              }}
            ></div>
          </div>

          <div
            className={`fade-layer ${fading ? 'visible' : ''}`}
            style={{ transitionDuration: `${config.fade}s` }}
          />
        </>
      )}
    </div>
  );
}
