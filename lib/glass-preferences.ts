/** Contrast and transparency are separate preferences. Higher contrast keeps
 * refraction; explicit reduced transparency and forced palettes use solid UI. */
export const REDUCED_GLASS_QUERY =
  "(prefers-reduced-transparency: reduce), (forced-colors: active)";

export function subscribeReducedGlass(listener: () => void) {
  if (typeof matchMedia !== "function") return () => {};
  const media = matchMedia(REDUCED_GLASS_QUERY);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}

export const prefersReducedGlass = () =>
  typeof matchMedia === "function" && matchMedia(REDUCED_GLASS_QUERY).matches;
export const serverGlassPreference = () => false;
