/** A small optical ring, kept as vector artwork rather than another live lens. */
export function LiquidMark() {
  return (
    <svg className="showcase-mark" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="27" stroke="currentColor" strokeOpacity=".16" />
      <ellipse cx="32" cy="32" rx="21" ry="27" transform="rotate(-35 32 32)" stroke="currentColor" strokeOpacity=".3" />
      <ellipse cx="32" cy="32" rx="14" ry="27" transform="rotate(-35 32 32)" stroke="currentColor" strokeOpacity=".55" />
      <path d="M16.5 9.9a27 27 0 0 1 31 44.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
