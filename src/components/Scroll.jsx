import React from 'react';
import { SLIDES, ASSETS_FOLDER } from '../settings';

export default function Scroll() {
  return (
    <div className="scroll-gallery">
      {SLIDES.map((slide, i) => {
        const displayName = slide
          .replace(/\.[^/.]+$/, '') // remove extension
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
  );
}
