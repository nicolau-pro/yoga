import { useEffect, useState } from 'react';
import { SLIDES, SLIDE_INTERVAL } from '../settings';

export default function Slideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="slideshow">
      <img
        src={`/src/assets/${SLIDES[index]}`}
        alt={`Yoga pose ${index + 1}`}
        key={SLIDES[index]}
      />
    </div>
  );
}
