// Hand-drawn bits: a global SVG filter that makes lines wobble, plus a few
// sketched shapes (circle, arrow, underline) drawn as paths.

export function SketchDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <filter id="sketch">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="3" />
        </filter>
        <filter id="sketch-strong">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="8" />
          <feDisplacementMap in="SourceGraphic" scale="6" />
        </filter>
      </defs>
    </svg>
  );
}

// Loose double-loop circle, as if drawn around something with a pen.
export function SketchCircle({ className = '' }) {
  return (
    <svg className={`sketch-circle ${className}`} viewBox="0 0 200 120" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M30 70 C 20 30, 90 8, 150 18 C 195 26, 198 80, 150 100 C 100 120, 25 110, 14 74 C 6 46, 50 22, 120 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        filter="url(#sketch)"
      />
    </svg>
  );
}

// Curvy annotation arrow pointing down-left.
export function SketchArrow({ className = '' }) {
  return (
    <svg className={`sketch-arrow ${className}`} viewBox="0 0 80 60" aria-hidden="true">
      <path
        d="M74 6 C 60 10, 40 18, 30 34 C 24 44, 20 50, 12 54 M12 54 L 26 52 M12 54 L 16 41"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#sketch)"
      />
    </svg>
  );
}

export function SketchUnderline({ className = '' }) {
  return (
    <svg className={`sketch-underline ${className}`} viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M3 8 C 50 3, 120 3, 197 6 M10 10 C 70 7, 140 8, 190 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        filter="url(#sketch)"
      />
    </svg>
  );
}

// Pill logo (rounded slot shape from the reference, as a hanger-ish tag).
export function Logo() {
  return (
    <svg className="logo" viewBox="0 0 64 40" aria-label="Petite Fit">
      <path
        d="M14 4 H50 A10 10 0 0 1 50 16 H56 A8 8 0 0 1 56 24 H50 A10 10 0 0 1 50 36 H14 A10 10 0 0 1 14 24 H8 A8 8 0 0 1 8 16 H14 A10 10 0 0 1 14 4 Z"
        fill="currentColor"
      />
      <rect x="18" y="13" width="28" height="14" rx="7" fill="#fff" />
    </svg>
  );
}

// Big numeral / label header block, after the reference's giant "7".
export function Hero({ big, title, subtitle, note, status, statusTone = 'ok' }) {
  return (
    <div className="hero">
      <div className="hero-big" style={{ '--len': Math.max(1, String(big).length) }}>
        <span className="hero-num">{big}</span>
        {note && (
          <span className="hand hero-note">
            <SketchArrow />
            {note}
          </span>
        )}
      </div>
      <div className="hero-rule" />
      <div className="hero-titles">
        <div>
          <div className="hero-title">{title}</div>
          {subtitle && <div className="hero-sub">{subtitle}</div>}
        </div>
        <span className="hero-arrow" aria-hidden="true">↗</span>
      </div>
      {status && <span className={`status status-${statusTone}`}>{status}</span>}
    </div>
  );
}

export function DataRows({ rows }) {
  return (
    <dl className="data-rows">
      {rows.map((r) => (
        <div key={r.label} className={r.tone ? `tone-${r.tone}` : ''}>
          <dt>{r.label}</dt>
          <dd>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
