"use client";
// @refresh reset
// Optical maps and SVG graph ownership must restart together during dev edits.

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import {
  decodeLensTextures,
  type GlassOptics,
  type LensTextures,
} from "@/lib/glass";
import { GlassFilterManager } from "@/lib/glass-filter";
import { registerGlassLens } from "@/lib/glass-performance";
import { useGlassSettings } from "@/components/glass-scene";
import {
  buildControlLensTextures,
  controlLensMetrics,
  sampleControlLensSpring,
  resolveControlLens,
  type ControlLensParameters,
  type ControlLensInput,
} from "@/lib/glass-lens-optics";

export interface GlassLensProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  lens: { lensW: number; lensH: number; borderRadius: number };
  /** Normalized position within the available travel. */
  x?: number;
  y?: number;
  /** Small elastic travel beyond the normalized rail, in CSS pixels. */
  offsetX?: number;
  offsetY?: number;
  /** Optional small visual target. Omit to filter the original children directly. */
  refractionTarget?: ReactNode;
  children?: ReactNode;
  active?: boolean;
  /** Transient control state. Omit for a persistent lens (for example the tuner). */
  engaged?: boolean;
  /** Scale occupied by the solid thumb before the optical cap opens. */
  restScale?: number | { x: number; y: number };
  /** Persistent selection returns to this size after travel, staying glass. */
  settledScale?: { x: number; y: number };
  strength?: number;
  blur?: number;
  chroma?: number;
  glint?: number;
  splay?: number;
  feather?: number;
  curvature?: number;
  optics?: Partial<Omit<GlassOptics, "colorBleed">>;
  duration?: number;
  scale?: number;
  parameters?: ControlLensInput;
  /** Sharp DOM fills use a non-folding field; photos can use the video field. */
  opticalProfile?: "dom" | "media";
  rim?: "none" | "column" | "dominant";
  motion?: "ease" | "spring" | "smooth";
}
const MEDIA =
  "(prefers-reduced-transparency: reduce), (prefers-contrast: more)";
const MOTION = "(prefers-reduced-motion: reduce)";
function subscribe(query: string, listener: () => void) {
  if (typeof matchMedia !== "function") return () => {};
  const media = matchMedia(query);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}
const subscribeGlass = (listener: () => void) => subscribe(MEDIA, listener);
const subscribeMotion = (listener: () => void) => subscribe(MOTION, listener);
const reducedGlass = () =>
  typeof matchMedia === "function" && matchMedia(MEDIA).matches;
const reducedMotion = () =>
  typeof matchMedia === "function" && matchMedia(MOTION).matches;
const server = () => false;
const clamp = (value: number, min: number, max: number, fallback: number) =>
  Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;

// SVG source/filter coordinates must follow the same on-screen trajectory.
// Evaluate the site's existing CSS token; do not invent a separate JS curve.
function tokenEase(value: string, smooth: boolean) {
  const match = value.match(/cubic-bezier\(([^)]+)\)/);
  const points = match?.[1].split(",").map(Number);
  const [x1, y1, x2, y2] =
    points?.length === 4 && points.every(Number.isFinite)
      ? points
      : smooth
        ? [0.77, 0, 0.175, 1]
        : [0.23, 1, 0.32, 1];
  const sample = (t: number, a: number, b: number) =>
    3 * (1 - t) * (1 - t) * t * a + 3 * (1 - t) * t * t * b + t * t * t;
  return (progress: number) => {
    if (progress <= 0 || progress >= 1) return progress;
    let low = 0,
      high = 1,
      t = progress;
    for (let i = 0; i < 12; i++) {
      const x = sample(t, x1, x2);
      if (Math.abs(x - progress) < 0.0001) break;
      if (x < progress) low = t;
      else high = t;
      t = (low + high) / 2;
    }
    return sample(t, y1, y2);
  };
}

/** A cached moving lens over original DOM, or a small explicit visual target.
 * No screenshot, style snapshot, scene clone or pixel readback is used. */
export function GlassLens({
  lens,
  x = 0.5,
  y = 0.5,
  offsetX = 0,
  offsetY = 0,
  refractionTarget,
  children,
  active = true,
  engaged,
  restScale = 0.65,
  settledScale,
  strength,
  blur,
  chroma,
  glint = 1,
  splay,
  feather,
  curvature,
  optics,
  parameters,
  opticalProfile = "dom",
  rim = "column",
  motion = "spring",
  duration = 0,
  scale = 1,
  style,
  ...props
}: GlassLensProps) {
  const direct = refractionTarget === undefined;
  const root = useRef<HTMLDivElement>(null),
    viewport = useRef<HTMLDivElement>(null),
    cap = useRef<HTMLDivElement>(null);
  const housing = useRef<SVGSVGElement>(null),
    layer = useRef<HTMLDivElement>(null),
    original = useRef<HTMLDivElement>(null),
    target = useRef<HTMLDivElement>(null);
  const manager = useRef<GlassFilterManager | null>(null);
  const sourceObserver = useRef<MutationObserver | null>(null);
  const traveling = useRef(false);
  const pose = useRef({ left: 0, top: 0, zoom: 1 });
  const capScale = useRef({ x: 1, y: 1 });
  const velocity = useRef({ left: 0, top: 0 });
  const settings = useGlassSettings();
  const reduced = useSyncExternalStore(subscribeGlass, reducedGlass, server);
  const still = useSyncExternalStore(subscribeMotion, reducedMotion, server);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [textures, setTextures] = useState<LensTextures | null>(null);
  const [decodedKey, setDecodedKey] = useState("");
  const [admitted, setAdmitted] = useState(false);
  const [retained, setRetained] = useState(Boolean(engaged));
  const [revealed, setRevealed] = useState(false);
  const requested = active && (engaged === undefined || engaged || retained);
  const revisions = useRef(0);
  const width = clamp(lens.lensW, 2, 1024, 96),
    height = clamp(lens.lensH, 2, 1024, 57);
  const radius = clamp(
    lens.borderRadius,
    0,
    Math.min(width, height) / 2,
    Math.min(width, height) / 2,
  );
  const parameterKey = JSON.stringify(
    resolveControlLens({
      ...(strength === undefined ? {} : { depth: strength }),
      ...(blur === undefined ? {} : { blur }),
      ...(chroma === undefined ? {} : { chroma }),
      ...(curvature === undefined
        ? {}
        : { curvature: curvature <= 4 ? (curvature / 2.2) * 58 : curvature }),
      ...(splay === undefined ? {} : { splay: splay / 10 }),
      ...(feather === undefined ? {} : { splay: feather / 20 }),
      ...(optics?.lightAngle === undefined
        ? {}
        : { specularAngle: optics.lightAngle }),
      ...parameters,
    }),
  );
  const optical = useMemo(
    () => JSON.parse(parameterKey) as ControlLensParameters,
    [parameterKey],
  );
  const geometryKey = JSON.stringify([
    width, height, radius, parameterKey, opticalProfile,
  ]);
  const { pad, displacementScale } = controlLensMetrics(
    width, height, optical, opticalProfile,
  );
  const depth = displacementScale,
    soften = optical.blur,
    dispersion = optical.chroma * 0.04;
  const fw = width + pad * 2,
    fh = height + pad * 2;
  const left =
    Math.max(0, size.width - width) * clamp(x, 0, 1, 0.5) +
    (still ? 0 : clamp(offsetX, -48, 48, 0));
  const top =
    Math.max(0, size.height - height) * clamp(y, 0, 1, 0.5) +
    (still ? 0 : clamp(offsetY, -48, 48, 0));
  const travel = still ? 0 : clamp(duration, 0, 600, 0);
  const zoom = active && !still ? clamp(scale, 1, 1.4, 1) : 1;
  const settling = !direct && Boolean(settledScale);
  const settleX = settling && settledScale
      ? clamp(settledScale.x, 0.5, 1, 1) : 1,
    settleY = settling && settledScale
      ? clamp(settledScale.y, 0.5, 1, 1) : 1;
  // Keep original-DOM source graphics conservatively bounded for WebKit.
  const withinBounds =
    size.width > 0 &&
    size.height > 0 &&
    (!direct ||
      (size.width <= 4096 &&
        size.height <= 4096 &&
        size.width * size.height <= 1_500_000));
  const ready =
    requested &&
    admitted &&
    !reduced &&
    Boolean(textures?.displacement) &&
    decodedKey === geometryKey &&
    withinBounds;
  const expanded = engaged === undefined || revealed;
  // Explicit controls retain the optical cap until it finishes shrinking. The
  // material and scale reverse together; an early opacity fade hid the return
  // motion and exposed the solid native thumb at full size underneath it.
  const visible = ready && (!direct || expanded);
  useEffect(() => {
    if (engaged === undefined) return;
    const timer = setTimeout(
      () => setRetained(engaged),
      engaged || still ? 0 : 260,
    );
    return () => clearTimeout(timer);
  }, [engaged, still]);
  useEffect(() => {
    if (engaged === undefined) return;
    const frame = requestAnimationFrame(() => setRevealed(ready && engaged));
    return () => cancelAnimationFrame(frame);
  }, [ready, engaged]);
  const paint = useCallback(() => {
    // A layout/position update already includes current child mutations. Drain
    // them before assigning the fresh ID so they cannot schedule a second paint.
    sourceObserver.current?.takeRecords();
    manager.current?.refresh();
    if (viewport.current && manager.current)
      viewport.current.dataset.glassFilterPaints = String(
        manager.current.refreshes,
      );
  }, []);

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const measure = () => {
      const css = getComputedStyle(element);
      const width = parseFloat(css.width) || element.clientWidth,
        height = parseFloat(css.height) || element.clientHeight;
      setSize((previous) =>
        previous.width === width && previous.height === height
          ? previous
          : { width, height },
      );
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (reduced || !withinBounds) return;
    let canceled = false;
    const started = performance.now();
    const next = buildControlLensTextures(
      width, height, radius, optical, opticalProfile,
    );
    if (root.current) {
      root.current.dataset.lensTextureMs = (
        performance.now() - started
      ).toFixed(2);
      root.current.dataset.lensMapRevisions = String(++revisions.current);
    }
    void decodeLensTextures(next).then(() => {
      if (!canceled) {
        setTextures(next);
        setDecodedKey(geometryKey);
      }
    });
    return () => {
      canceled = true;
    };
  }, [
    width, height, radius, reduced, optical,
    opticalProfile, geometryKey, withinBounds,
  ]);
  useEffect(() => {
    if (!requested || reduced || !withinBounds || !viewport.current) return;
    const release = registerGlassLens(viewport.current, setAdmitted, {
      limit: settings.performance?.maxActiveSurfaces,
      priority: 5,
    });
    return () => {
      release();
      setAdmitted(false);
    };
  }, [
    requested,
    reduced,
    withinBounds,
    settings.performance?.maxActiveSurfaces,
  ]);
  useLayoutEffect(() => {
    const element = direct ? original.current : layer.current;
    if (!ready || !textures || !housing.current || !element) return;
    const filter = new GlassFilterManager(housing.current, element);
    manager.current = filter;
    filter.update({
      map: textures.displacement,
      width: direct ? size.width : fw,
      height: direct ? size.height : fh,
      depth: settings.refraction === false ? 0 : depth,
      chroma: dispersion,
      blur: soften,
      ...(rim !== "none" && textures.rim && textures.coverage
        ? {
            sourceRim: {
              map: textures.rim,
              coverage: textures.coverage,
              scale: textures.rimScale!,
              amount: Math.min(
                1,
                (optical.edgeHighlight / 0.39) * (optical.rimStrength / 0.61),
              ),
              mode: rim,
              lensWidth: width,
              lensHeight: height,
              ...(!direct ? {
                planeColor: "var(--glass-lens-plane,var(--background))",
              } : {}),
            },
          }
        : {}),
      ...(direct
        ? {
            mapRegion: {
              x:
                pose.current.left -
                pad * pose.current.zoom -
                ((pose.current.zoom - 1) * width) / 2,
              y:
                pose.current.top -
                pad * pose.current.zoom -
                ((pose.current.zoom - 1) * height) / 2,
              width: fw * pose.current.zoom,
              height: fh * pose.current.zoom,
            },
            coverage: textures.coverage,
          }
        : {}),
    });
    if (viewport.current)
      viewport.current.dataset.glassFilterPaints = String(filter.refreshes);
    return () => {
      filter.destroy();
      manager.current = null;
    };
  }, [
    ready,
    textures,
    fw,
    fh,
    depth,
    soften,
    dispersion,
    direct,
    size.width,
    size.height,
    settings.refraction,
    pad,
    width,
    height,
    rim,
    optical.edgeHighlight,
    optical.rimStrength,
  ]);
  useLayoutEffect(() => {
    let frame = 0;
    const from = { ...pose.current },
      fromScale = { ...capScale.current },
      momentum = { ...velocity.current },
      started = performance.now();
    const place = (a: number, b: number, z = zoom, lift = 0, progress = 1) => {
      pose.current = { left: a, top: b, zoom: z };
      const sx = settleX + (1 - settleX) * lift +
          (fromScale.x - settleX) * (1 - progress),
        sy = settleY + (1 - settleY) * lift +
          (fromScale.y - settleY) * (1 - progress);
      capScale.current = { x: Math.min(1, sx), y: Math.min(1, sy) };
      if (viewport.current) {
        viewport.current.style.transform = `translate(${a}px, ${b}px)`;
        if (direct && cap.current) cap.current.style.scale = String(z);
        else if (settling && cap.current)
          cap.current.style.scale = `${capScale.current.x} ${capScale.current.y}`;
      }
      if (direct)
        manager.current?.moveMap(
          a - pad * z - ((z - 1) * width) / 2,
          b - pad * z - ((z - 1) * height) / 2,
          fw * z,
          fh * z,
        );
      else if (target.current) {
        const { x: sx, y: sy } = capScale.current;
        target.current.style.transform = settling
          ? `translate(${pad + width / 2 - (a + width / 2) / sx}px, ${pad + height / 2 - (b + height / 2) / sy}px) scale(${1 / sx},${1 / sy})`
          : `translate(${pad - a}px, ${pad - b}px)`;
      }
      paint();
    };
    const moveTime =
      Math.hypot(from.left - left, from.top - top) < 0.01 ? 0 : travel;
    const zoomTime =
      direct && !still && Math.abs(from.zoom - zoom) > 0.001 ? 180 : 0;
    const lifetime = Math.max(moveTime, zoomTime);
    traveling.current = false;
    if (!ready) {
      // Dormant controls track their value immediately. Holding an old pose
      // here made the next press animate from a stale thumb position.
      velocity.current = { left: 0, top: 0 };
      place(left, top, zoom);
      return;
    }
    if (!lifetime) {
      velocity.current = { left: 0, top: 0 };
      place(left, top);
      return;
    }
    traveling.current = true;
    const css = root.current && (motion !== "spring" || zoomTime > 0)
      ? getComputedStyle(root.current)
      : null;
    const easeOut = tokenEase(css?.getPropertyValue("--ease-out") ?? "", false);
    const moveEase =
      motion === "smooth"
        ? tokenEase(css?.getPropertyValue("--ease-in-out") ?? "", true)
        : easeOut;
    // One interruptible, gesture-bounded travel. Map and highlight use the same
    // coordinates; there is no CSS/JS timing mismatch or idle animation loop.
    const tick = (time: number) => {
      if (document.hidden) return;
      const elapsed = Math.max(0, time - started);
      const progress = moveTime ? Math.min(1, elapsed / moveTime) : 1;
      const move = moveEase(progress);
      const grow = zoomTime
        ? easeOut(Math.min(1, elapsed / zoomTime))
        : 1;
      // Lift grows WITH travel and returns as the spring settles. It does not
      // expand first or release the persistent selection afterward.
      const lift = settling ? Math.sin(Math.PI * progress) : 0;
      if (motion === "spring" && moveTime) {
        const a = sampleControlLensSpring(
            from.left, left, momentum.left, elapsed, moveTime,
          ),
          b = sampleControlLensSpring(
            from.top, top, momentum.top, elapsed, moveTime,
          );
        velocity.current = { left: a.velocity, top: b.velocity };
        place(a.value, b.value, from.zoom + (zoom - from.zoom) * grow, lift, progress);
      } else {
        velocity.current = { left: 0, top: 0 };
        place(
          from.left + (left - from.left) * move,
          from.top + (top - from.top) * move,
          from.zoom + (zoom - from.zoom) * grow,
          lift,
          progress,
        );
      }
      if (elapsed < lifetime) frame = requestAnimationFrame(tick);
      else traveling.current = false;
    };
    place(
      moveTime ? from.left : left,
      moveTime ? from.top : top,
      direct ? from.zoom : zoom,
      0,
      moveTime ? 0 : 1,
    );
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      traveling.current = false;
    };
  }, [
    left,
    top,
    ready,
    travel,
    direct,
    pad,
    zoom,
    width,
    height,
    paint,
    fw,
    fh,
    still,
    motion,
    active,
    settleX,
    settleY,
    settling,
  ]);
  useEffect(() => {
    const source = direct ? original.current : target.current;
    if (!ready || !source) return;
    let frame = 0;
    const refresh = () => {
      if (!frame && !document.hidden)
        frame = requestAnimationFrame(() => {
          frame = 0;
          if (!traveling.current) paint();
          if (
            source
              .getAnimations?.({ subtree: true })
              .some((animation) => animation.playState === "running")
          )
            refresh();
        });
    };
    const observer = new MutationObserver((mutations) => {
      if (mutations.some((m) => m.target !== source)) refresh();
    });
    sourceObserver.current = observer;
    observer.observe(source, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
    });
    const events = [
      "input",
      "change",
      "load",
      "scroll",
      "transitionrun",
      "animationstart",
      "pointerover",
      "pointerout",
      "focusin",
      "focusout",
    ];
    events.forEach((event) => source.addEventListener(event, refresh, true));
    document.fonts?.addEventListener("loadingdone", refresh);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      sourceObserver.current = null;
      events.forEach((event) =>
        source.removeEventListener(event, refresh, true),
      );
      document.fonts?.removeEventListener("loadingdone", refresh);
    };
  }, [direct, ready, paint]);

  useEffect(() => {
    if (!ready) return;
    let frame = 0;
    const observer = new MutationObserver(() => {
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          paint();
        });
    });
    const options = {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    };
    observer.observe(document.documentElement, options);
    observer.observe(document.body, options);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [ready, paint]);

  const texture: CSSProperties = {
    position: "absolute",
    inset: -pad,
    backgroundSize: "100% 100%",
    pointerEvents: "none",
  };
  return (
    <div
      {...props}
      ref={root}
      data-glass-target-root=""
      data-lens-source={direct ? "original-dom" : "explicit-target"}
      data-lens-rim={rim}
      data-target-lens-ready={ready}
      data-lens-visible={visible}
      data-lens-state={
        !ready
          ? "idle"
          : engaged === false
            ? "settling"
            : visible
              ? "active"
              : "preparing"
      }
      style={{ position: "relative", ...style }}
    >
      {direct ? (
        <div
          ref={original}
          data-lens-original=""
          style={{ position: "relative", width: "100%", height: "100%" }}
        >
          {children}
        </div>
      ) : (
        children
      )}
      <div
        ref={viewport}
        aria-hidden="true"
        inert
        data-glass-ignore=""
        data-glass-target-lens=""
        data-glass-rendering={ready ? "active" : "lightweight"}
        data-refraction={
          ready ? (direct ? "dom-svg" : "target-svg") : "disabled"
        }
        style={{
          position: "absolute",
          zIndex: 1,
          pointerEvents: "none",
          width,
          height,
          left: 0,
          top: 0,
          transform: `translate(${left}px, ${top}px)`,
          borderRadius: radius,
          opacity: visible ? 1 : 0,
          visibility: ready ? "visible" : "hidden",
        }}
      >
        {ready && (
          <>
            <svg
              ref={housing}
              width="0"
              height="0"
              style={{ position: "absolute" }}
            />
            <div
              ref={cap}
              data-lens-cap=""
              onTransitionRun={(event) => {
                if (
                  event.target === event.currentTarget &&
                  event.propertyName === "scale" && viewport.current
                )
                  viewport.current.dataset.lensExpanded = "false";
              }}
              onTransitionEnd={(event) => {
                if (event.target !== event.currentTarget || event.propertyName !== "scale")
                  return;
                if (viewport.current)
                  viewport.current.dataset.lensExpanded = String(expanded);
                if (engaged === false) setRetained(false);
              }}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: radius,
                overflow: "hidden",
                isolation: "isolate",
                // Translation belongs to the outer frame. Keeping press scale
                // here prevents CSS scale from multiplying the travel offset.
                scale:
                  settling
                    ? `${settleX} ${settleY}`
                    : expanded || direct || still
                    ? zoom
                    : typeof restScale === "number"
                      ? clamp(restScale, 0.25, 1, 0.65)
                      : `${clamp(restScale.x, 0.25, 1, 0.65)} ${clamp(restScale.y, 0.25, 1, 0.65)}`,
                transition: still || direct || settling
                  ? "none"
                  : "scale 220ms var(--ease-in-out)",
              }}
            >
              {!direct && (
                <div
                  ref={layer}
                  data-lens-layer=""
                  style={{
                    position: "absolute",
                    left: -pad,
                    top: -pad,
                    width: fw,
                    height: fh,
                    overflow: "hidden",
                  }}
                >
                  <div
                    ref={target}
                    data-refraction-target=""
                    style={{
                      position: "absolute",
                      width: size.width,
                      height: size.height,
                      left: 0,
                      top: 0,
                      transform: `translate(${pad - left}px, ${pad - top}px)`,
                      transformOrigin: "0 0",
                    }}
                  >
                    {refractionTarget}
                  </div>
                </div>
              )}
              <div
                data-target-reflection=""
                style={{
                  ...texture,
                  backgroundImage: `url("${textures!.reflection}")`,
                  opacity: clamp(glint, 0, 1.5, 1),
                }}
              />
              {!direct && engaged !== undefined && (
                <div
                  data-lens-rest-material=""
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: radius,
                    background: "var(--glass-lens-rest,#fff)",
                    opacity: expanded ? 0 : 1,
                    transition: still
                      ? "none"
                      : "opacity 220ms var(--ease-in-out)",
                  }}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
