import { useEffect, useState } from 'react';
import { SLIDES, SLIDE_INTERVAL, FADE_DURATION } from '../settings';

export default function Slideshow() {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const intervalMs = SLIDE_INTERVAL * 1000;
    const fadeMs = FADE_DURATION * 1000;

    const id = setInterval(() => {
      // Trigger fade to white
      setFading(true);

      // Wait for fade-out before switching image
      setTimeout(() => {
        setIndex((i) => (i + 1) % SLIDES.length);
        setFading(false);
      }, fadeMs);
    }, intervalMs + fadeMs); // total cycle time = visible + fade

    return () => clearInterval(id);
  }, []);

  return (
    <div className="slideshow">
      <img
        src={`/src/assets/${SLIDES[index]}`}
        alt={`Yoga pose ${index + 1}`}
        key={SLIDES[index]}
      />
      <div className={`fade-layer ${fading ? 'visible' : ''}`} />
    </div>
  );
}
