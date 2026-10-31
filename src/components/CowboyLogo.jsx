// src/components/CowboyLogo.jsx
// SVG logo inline - silhueta de cowboy com glow ciano
export default function CowboyLogo({ size = 60, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Hat brim */}
      <ellipse cx="50" cy="46" rx="36" ry="7" fill="#00E5FF" opacity="0.25"/>
      <ellipse cx="50" cy="46" rx="36" ry="7" fill="none" stroke="#00E5FF" strokeWidth="1.5" opacity="0.7"/>
      {/* Hat crown */}
      <path d="M28 46 Q30 20 50 18 Q70 20 72 46 Z" fill="#00E5FF" opacity="0.8"/>
      <path d="M28 46 Q30 20 50 18 Q70 20 72 46 Z" fill="none" stroke="#00E5FF" strokeWidth="1.5"/>
      {/* Hat dent */}
      <path d="M38 30 Q50 25 62 30" stroke="#05070A" strokeWidth="3" strokeLinecap="round"/>
      {/* Head */}
      <ellipse cx="50" cy="60" rx="12" ry="14" fill="#CBD5E1"/>
      {/* Body / duster */}
      <path d="M30 74 Q40 69 50 70 Q60 69 70 74 L75 100 H25 Z" fill="#CBD5E1" opacity="0.7"/>
      {/* Belt */}
      <rect x="35" y="80" width="30" height="4" rx="2" fill="#00E5FF" opacity="0.5"/>
      {/* Glow effect */}
      <ellipse cx="50" cy="46" rx="36" ry="7" fill="none" stroke="#00E5FF" strokeWidth="0.5" opacity="0.4"/>
    </svg>
  );
}
