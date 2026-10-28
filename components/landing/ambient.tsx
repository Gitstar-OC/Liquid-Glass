/**
 * The page's only ambience layer: a single soft wash that fades out before the
 * fold, plus a whisper of grain. Fixed, behind everything, never interactive.
 */
export function Ambient() {
  return (
    <div
      aria-hidden="true"
      data-adaptive-skip
      className="page-ambient"
    />
  );
}