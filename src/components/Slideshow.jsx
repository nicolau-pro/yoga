import { useEffect, useState } from 'react';

const images = [
  'Mandala.jpg',
  'SupineSpinalTwist_L.png',
  'SupineSpinalTwist_R.png',
  'HeadToKnee_L.png',
  'HeadToKneeII_R.png',
  'SeatedForwardBend.png',
  'PyramidPrayer_R.png',
  'PyramidPrayer_L.png',
  'ForwardBend.png',
  'SideLunge_L.png',
  'SideLunge_R.png',
  'Banana_R.png',
  'Turtle.png',
  'BlissfulBaby.png',
  'PlankUpward.png',
  'Bridge.png',
  'ShoulderstandSupported.png',
  'Plow.png',
  'Camel.png',
  'PigeonHalf_R.png',
  'PigeonHalf_L.png',
  'WideLeggedForwardBendI_R.png',
  'Sphinx.png',
  'CobraFull.png',
  'Plank.png',
  'DownwardDog.png',
  'Dolphin.png',
  'Mandala.jpg',
];

export default function Slideshow({ interval = 3000 }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, interval);
    return () => clearInterval(id);
  }, [interval]);

  return (
    <div className="slideshow">
      <img src={`/src/assets/${images[index]}`} alt={`Slide ${index + 1}`} key={images[index]} />
    </div>
  );
}
