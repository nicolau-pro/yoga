import { useEffect, useState, useRef } from 'react';
import { SLIDES, SLIDE_INTERVAL, FADE_DURATION, FADE_SOUND } from '../settings';

export default function Slideshow() {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const audioRef = useRef(null);
  const manualRef = useRef(false);

  // === Format filename for display ===
  const getDisplayName = (filename) => {
    let name = filename.replace(/\.[^/.]+$/, ''); // remove extension
    name = name.replace(/_R$|_L$/i, ''); // remove trailing _R/_L
    name = name.replace(/_/g, ' '); // replace underscores
    name = name.replace(/([a-z])([A-Z])/g, '$1 $2'); // space before capitals
    return name.trim();
  };

  useEffect(() => {
    // preload chime sound
    if (FADE_SOUND) audioRef.current = new Audio(`/src/assets/${FADE_SOUND}`);

    const intervalMs = SLIDE_INTERVAL * 1000;
    const fadeMs = FADE_DURATION * 1000;

    const id = setInterval(() => {
      // skip chime if manual navigation just occurred
      if (manualRef.current) {
        manualRef.current = false;
        return;
      }

      // play chime at fade start
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      // start fade to white
      setFading(true);

      setTimeout(() => {
        // switch image after fade duration
        setIndex((i) => (i + 1) % SLIDES.length);
        setFading(false);
      }, fadeMs);
    }, intervalMs + fadeMs);

    return () => clearInterval(id);
  }, []);

  // === Handle manual navigation (arrow keys) ===
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') {
        manualRef.current = true;
        setIndex((i) => (i + 1) % SLIDES.length);
        setFading(false);
      } else if (e.key === 'ArrowLeft') {
        manualRef.current = true;
        setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length);
        setFading(false);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // === Prepare caption ===
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
    </div>
  );
}
