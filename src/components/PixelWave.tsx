import type { CSSProperties } from 'react';

// Heights (in "pixels" of the 8-bit grid) of the decorative sound-wave bars.
const BARS = [2, 4, 7, 5, 9, 6, 3, 8, 5, 2];

/** Decorative pixel-art sound wave in the МРВ style; hidden from screen readers. */
export function PixelWave() {
  return (
    <div className="pixel-wave" aria-hidden="true">
      {BARS.map((height, i) => (
        <span key={i} className="pixel-wave__bar" style={{ '--h': height } as CSSProperties} />
      ))}
    </div>
  );
}
