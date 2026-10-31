/** A document-wide budget. Controls that share a panel do not register lenses. */
interface LensEntry {
  element: HTMLElement;
  visible: boolean;
  active: boolean | null;
  limit: number;
  priority: number;
  onChange: (active: boolean) => void;
}

/** Active examples get the phone's limited slots before passive page chrome. */
export const GLASS_PRIORITY = {
  background: 0,
  button: 1,
  dock: 2,
  media: 7,
  control: 8,
  overlay: 10,
} as const;

const entries = new Set<LensEntry>();
let observer: IntersectionObserver | null = null;
let listening = false;

const deviceLimit = () =>
  typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches
    ? 3
    : 5;
const boundedLimit = (limit?: number) =>
  Math.max(
    1,
    Math.min(
      deviceLimit(),
      Number.isFinite(limit) ? Math.floor(limit!) : deviceLimit(),
    ),
  );

function reconcile() {
  const visible = [...entries].filter((entry) => entry.visible);
  const limit = Math.min(deviceLimit(), ...visible.map((entry) => entry.limit));
  const selected = new Set(
    document.hidden
      ? []
      : visible.sort((a, b) => b.priority - a.priority).slice(0, limit),
  );
  for (const entry of entries) {
    const active = selected.has(entry);
    if (active === entry.active) continue;
    entry.active = active;
    entry.onChange(active);
  }
}

export function registerGlassLens(
  element: HTMLElement,
  onChange: LensEntry["onChange"],
  options: { limit?: number; priority?: number } = {},
) {
  const rect = element.getBoundingClientRect();
  const entry: LensEntry = {
    element,
    onChange,
    limit: boundedLimit(options.limit),
    priority: options.priority ?? 0,
    // Publish even an initial false state when a component re-registers.
    active: null,
    visible:
      rect.width > 0 &&
      rect.height > 0 &&
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.top < innerHeight &&
      rect.left < innerWidth,
  };
  entries.add(entry);
  if (!listening) {
    document.addEventListener("visibilitychange", reconcile);
    listening = true;
  }
  if (!observer && typeof IntersectionObserver !== "undefined") {
    observer = new IntersectionObserver((changes) => {
      for (const change of changes) {
        for (const candidate of entries) {
          if (candidate.element === change.target) {
            candidate.visible = change.isIntersecting;
          }
        }
      }
      reconcile();
    });
  }
  observer?.observe(element);
  reconcile();

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    entries.delete(entry);
    observer?.unobserve(element);
    reconcile();
    if (!entries.size) {
      observer?.disconnect();
      observer = null;
      document.removeEventListener("visibilitychange", reconcile);
      listening = false;
    }
  };
}

/** Diagnostics for tests and tooling; never starts a polling loop. */
export function getGlassBudgetSnapshot() {
  return {
    registered: entries.size,
    visible: [...entries].filter((entry) => entry.visible).length,
    active: [...entries].filter((entry) => entry.active).length,
    deviceLimit: deviceLimit(),
  };
}
