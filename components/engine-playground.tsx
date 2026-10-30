"use client";
import { PreviewToolbar } from "@/components/site/preview-toolbar";
import { GlassSwitch } from "@/components/glass/glass-switch";
import { GlassIcon } from "@/components/glass/glass-icons";
import { GlassContent } from "@/components/glass/glass-surface";
import { GlassButton } from "@/components/glass/glass-button";
import { GlassInput } from "@/components/glass/glass-input";
import {
  GlassToggleGroup,
  GlassToggleGroupItem,
} from "@/components/glass/glass-toggle";
import { GlassSlider } from "@/components/glass/glass-slider";
import { GlassStateSwap } from "@/components/glass/glass-state-swap";
import { SceneBackdrop } from "@/components/site/scene-backdrop";
import {
  BackdropPicker,
  ParameterSlider,
} from "@/components/site/preview-controls";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type CSSProperties,
} from "react";
import { useAdaptiveContrast } from "@/components/adaptive-contrast";
import { DEMO_PHOTOS } from "@/lib/demo-assets";
import { GlassScene, useGlassScene } from "@/components/glass-scene";
import { LiquidGlass } from "@/components/liquid-glass";
import { invalidateGlassScene } from "@/lib/glass-scene";
import {
  DEFAULT_OPTICS,
  GLASS_DEFAULT_PARAMS,
  type GlassOptics,
  type LensParams,
  type GlassShape,
} from "@/lib/glass";
import {
  Copy,
  Check,
  GripHorizontal,
  Pause,
  Play,
  RotateCcw,
  SlidersHorizontal,
  X,
  Ellipsis,
} from "lucide-react";

const INITIAL = GLASS_DEFAULT_PARAMS;
type PlaygroundGeometry = {
  w: number;
  h: number;
  radius: number;
  x: number;
  y: number;
};
function fitLens(
  value: PlaygroundGeometry,
  width: number,
  height: number,
): PlaygroundGeometry {
  const pad = Math.min(10, width / 4, height / 4),
    w = Math.min(value.w, width - pad * 2),
    h = Math.min(value.h, height - pad * 2);
  return {
    ...value,
    w,
    h,
    x: Math.max(pad, Math.min(value.x, width - w - pad)),
    y: Math.max(pad, Math.min(value.y, height - h - pad)),
  };
}
const DIALS = [
  { key: "depth", label: "Depth", min: 0, max: 120, step: 1 },
  { key: "splay", label: "Splay", min: 0, max: 40, step: 1 },
  { key: "feather", label: "Feather", min: 0, max: 40, step: 1 },
  { key: "curve", label: "Curvature", min: 0.3, max: 3, step: 0.1 },
  { key: "blur", label: "Blur", min: 0, max: 20, step: 0.05 },
  { key: "chroma", label: "Chromatic", min: 0, max: 0.25, step: 0.005 },
  { key: "glint", label: "Glint", min: 0, max: 150, step: 1 },
  { key: "tint", label: "Tint", min: 0, max: 1, step: 0.01 },
] as const;

function LiveScene({
  moving,
  revision,
  photo,
  label,
}: {
  moving: boolean;
  revision: number;
  photo: keyof typeof DEMO_PHOTOS;
  label: string;
}) {
  const scene = useGlassScene();
  const orb = useRef<HTMLDivElement>(null);
  const phase = useRef(Math.PI / 2);
  useEffect(() => {
    const element = orb.current;
    if (!element || !scene?.source.current) return;
    const root = scene.source.current;
    if (
      !moving ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    let frame = 0;
    let previous = 0;
    let lastPaint = 0,
      visible = true;
    const tick = (time: number) => {
      frame = 0;
      if (!document.hidden && visible && time - lastPaint >= 1000 / 30) {
        const dt = previous ? Math.min(0.05, (time - previous) / 1000) : 0;
        phase.current += dt * 0.8;
        const width = root.clientWidth;
        element.style.left = `${22 + (width - 100) * (0.5 - 0.5 * Math.cos(phase.current))}px`;
        // Update the original and its painted copy within this same frame.
        invalidateGlassScene(root, { target: element, immediate: true });
        lastPaint = time;
        previous = time;
      }
      if (!document.hidden && visible) frame = requestAnimationFrame(tick);
    };
    const resume = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
      if (!document.hidden && visible) frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      resume();
    });
    observer.observe(root);
    document.addEventListener("visibilitychange", resume);
    resume();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", resume);
    };
  }, [moving, scene]);
  return (
    <div
      className="absolute inset-0 overflow-hidden bg-slate-700 text-white"
      style={
        {
          "--foreground": "#ffffff",
          "--background": "#151719",
        } as CSSProperties
      }
      data-testid="engine-live-scene"
    >
      <SceneBackdrop photo={photo} priority className="absolute inset-0" />
      <div className="absolute inset-0 bg-black/5" />
      <div
        className="absolute top-8 right-8 left-8"
        style={{
          color: photo === "dunes" || photo === "ocean" ? "#18202a" : "#ffffff",
        }}
      >
        <p className="text-[11px] font-medium opacity-65">Live DOM</p>
        <h2 className="mt-3 max-w-sm text-4xl leading-[1.05] font-medium tracking-[-.045em] sm:text-5xl">
          {label}
        </h2>
      </div>
      <div
        ref={orb}
        className="absolute top-[48%] left-[45%] size-16 rounded-full bg-[#0784ff]"
        data-testid="scene-orb"
      />
      <div
        className="absolute right-8 bottom-8 left-8 flex items-end justify-between gap-6"
        style={{ color: photo === "ice" ? "#fff" : "#18202a" }}
      >
        <div>
          {["Morning light", "Slow tide", "Soft focus"].map((title, i) => (
            <div className="flex items-center gap-3 py-2" key={title}>
              <span className="text-[10px] opacity-40">0{i + 1}</span>
              <span className="text-sm font-medium">{title}</span>
            </div>
          ))}
        </div>
        <span className="text-[11px] opacity-60">
          {revision ? `Revision ${revision}` : "Text · Image · Live content"}
        </span>
      </div>
    </div>
  );
}

export function EnginePlayground() {
  const [photo, setPhoto] = useState<keyof typeof DEMO_PHOTOS>("dunes");
  const [params, setParams] = useState<LensParams>({ ...INITIAL });
  const [optics, setOptics] = useState<GlassOptics>({ ...DEFAULT_OPTICS });
  const [geometry, setGeometry] = useState({
    w: 280,
    h: 148,
    radius: 30,
    x: 190,
    y: 190,
  });
  const [moving, setMoving] = useState(false);
  const [inside, setInside] = useState(true);
  const [mini, setMini] = useState(false);
  const [revision, setRevision] = useState(0);
  const [copied, setCopied] = useState(false);
  const [foregroundClicks, setForegroundClicks] = useState(0);
  const [enabled, setEnabled] = useState(true);
  const [shape, setShape] = useState("panel");
  const [contour, setContour] = useState<GlassShape>("squircle");
  const [showOutline, setShowOutline] = useState(false);
  const [adaptContent, setAdaptContent] = useState(true);
  const [sceneLabel, setSceneLabel] = useState("Refraction.");
  const [previewVolume, setPreviewVolume] = useState(62);
  const lensRoot = useRef<HTMLElement>(null);
  const sceneSource = useRef<HTMLDivElement>(null);
  const ink = useAdaptiveContrast(lensRoot, {
    source: sceneSource,
    live: moving,
    interval: 120,
    resolution: 3,
    tintColor: params.tintColor,
    tintOpacity: params.tint,
    tintBlendMode: "normal",
    brightness: params.brightness,
    contrast: params.contrast,
    saturate: params.saturate,
  });
  const inkColor = ink.tone === "light" ? "#ffffff" : "#000000";
  const bounds = useRef<HTMLDivElement>(null);
  const drag = useRef<{ pointer: number; dx: number; dy: number } | null>(null);
  const transition = useRef<number>(0);
  const currentGeometry = useRef(geometry);
  const expandedGeometry = useRef(geometry);
  useEffect(() => {
    currentGeometry.current = geometry;
  }, [geometry]);
  useEffect(() => () => cancelAnimationFrame(transition.current), []);
  useEffect(() => {
    if (!bounds.current) return;
    const observer = new ResizeObserver(() => {
      const rect = bounds.current!.getBoundingClientRect();
      setGeometry((value) => fitLens(value, rect.width, rect.height));
    });
    observer.observe(bounds.current);
    return () => observer.disconnect();
  }, []);
  const move = (event: PointerEvent<HTMLElement>) => {
    const state = drag.current;
    const area = bounds.current;
    if (!state || state.pointer !== event.pointerId || !area) return;
    const rect = area.getBoundingClientRect();
    setGeometry((value) =>
      fitLens(
        {
          ...value,
          x: Math.max(
            0,
            Math.min(
              rect.width - value.w,
              event.clientX - rect.left - state.dx,
            ),
          ),
          y: Math.max(
            0,
            Math.min(
              rect.height - value.h,
              event.clientY - rect.top - state.dy,
            ),
          ),
        },
        rect.width,
        rect.height,
      ),
    );
  };
  const toggle = () => {
    const area = bounds.current;
    if (!area) return;
    const wasAnimating = transition.current !== 0;
    cancelAnimationFrame(transition.current);
    transition.current = 0;
    const start = currentGeometry.current;
    const nextMini = !mini;
    if (nextMini && !wasAnimating) expandedGeometry.current = start;
    setMini(nextMini);
    const saved = expandedGeometry.current;
    const width = nextMini ? 60 : Math.min(saved.w, area.clientWidth - 20);
    const height = nextMini ? 60 : Math.min(saved.h, area.clientHeight - 20);
    const target = {
      w: width,
      h: height,
      radius: nextMini ? 30 : saved.radius,
      x: nextMini
        ? (area.clientWidth - width) / 2
        : Math.max(0, Math.min(saved.x, area.clientWidth - width)),
      y: nextMini
        ? area.clientHeight - 80
        : Math.max(0, Math.min(saved.y, area.clientHeight - height)),
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setGeometry(target);
      return;
    }
    const startTime = performance.now();
    let lastPaint = 0;
    const tick = (time: number) => {
      const t = Math.min(1, (time - startTime) / 300);
      if (t < 1 && time - lastPaint < 1000 / 30) {
        transition.current = requestAnimationFrame(tick);
        return;
      }
      lastPaint = time;
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Object.fromEntries(
        Object.keys(target).map((key) => {
          const k = key as keyof typeof target;
          return [k, Math.round(start[k] + (target[k] - start[k]) * eased)];
        }),
      ) as typeof target;
      currentGeometry.current = value;
      setGeometry(value);
      if (t < 1) transition.current = requestAnimationFrame(tick);
      else transition.current = 0;
    };
    transition.current = requestAnimationFrame(tick);
  };
  const setDimension = (key: "w" | "h" | "radius", value: number) => {
    cancelAnimationFrame(transition.current);
    transition.current = 0;
    setMini(false);
    const area = bounds.current;
    setGeometry((previous) => {
      const next = { ...previous, [key]: value };
      if (area) {
        return fitLens(next, area.clientWidth, area.clientHeight);
      }
      return next;
    });
  };
  const reset = () => {
    cancelAnimationFrame(transition.current);
    transition.current = 0;
    setParams({ ...INITIAL });
    setOptics({ ...DEFAULT_OPTICS });
    setShape("panel");
    setContour("squircle");
    setInside(true);
    setEnabled(true);
    setForegroundClicks(0);
    setPreviewVolume(62);
    setShowOutline(false);
    setAdaptContent(true);
    setGeometry(
      fitLens(
        {
          w: Math.min(280, bounds.current?.clientWidth ?? 280),
          h: 148,
          radius: 30,
          x: Math.max(0, ((bounds.current?.clientWidth ?? 280) - 280) / 2),
          y: Math.max(0, ((bounds.current?.clientHeight ?? 480) - 148) / 2),
        },
        bounds.current?.clientWidth ?? 748,
        bounds.current?.clientHeight ?? 480,
      ),
    );
    setMini(false);
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_252px]">
      <div className="min-w-0 lg:sticky lg:top-6">
        <div>
          <div
            className="h-[560px] sm:h-[480px] overflow-hidden rounded-[20px]"
            ref={bounds}
            data-testid="engine-stage"
          >
            <GlassScene
              sourceRef={sceneSource}
              appearance="dark"
              className="size-full"
              content={
                <LiveScene
                  moving={moving}
                  revision={revision}
                  photo={photo}
                  label={sceneLabel}
                />
              }
            >
              <LiquidGlass
                adaptiveBackdrop={adaptContent}
                config={params}
                optics={optics}
                tintBlendMode="normal"
                readability={
                  inside && !mini
                    ? {
                        color: ink.tone === "light" ? "#000000" : "#ffffff",
                        opacity: ink.samples ? (ink.scrimOpacity ?? 0) : 0.6,
                      }
                    : undefined
                }
                radius={geometry.radius}
                shape={!mini && shape === "panel" ? contour : "round"}
                showOutline={showOutline}
                ref={lensRoot}
                data-testid="engine-lens"
                className="absolute z-3 "
                style={
                  {
                    "--foreground": inkColor,
                    "--background":
                      ink.tone === "light" ? "#151719" : "#ffffff",
                    color: inkColor,
                    width: geometry.w,
                    height: geometry.h,
                    left: geometry.x,
                    top: geometry.y,
                  } as CSSProperties
                }
                onPointerDown={(event) => {
                  if (!(event.target as Element).closest("[data-lens-handle]"))
                    return;
                  cancelAnimationFrame(transition.current);
                  transition.current = 0;
                  const rect = event.currentTarget.getBoundingClientRect();
                  drag.current = {
                    pointer: event.pointerId,
                    dx: event.clientX - rect.left,
                    dy: event.clientY - rect.top,
                  };
                  event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onPointerMove={move}
                onPointerUp={() => {
                  drag.current = null;
                }}
                onPointerCancel={() => {
                  drag.current = null;
                }}
              >
                {!mini && (
                  <GlassButton
                    rendering="shared"
                    variant="ghost"
                    type="button"
                    data-lens-handle
                    aria-label="Move lens"
                    title="Drag to move. Arrow keys also move the lens."
                    className="absolute left-1/2 grid h-7 w-12 -translate-x-1/2 touch-none cursor-grab place-items-center rounded-full opacity-60 hover:opacity-100 active:cursor-grabbing"
                    style={{ top: Math.max(-32, 4 - geometry.y) }}
                    onKeyDown={(event) => {
                      const delta = event.shiftKey ? 10 : 2;
                      const offsets: Record<string, [number, number]> = {
                        ArrowLeft: [-delta, 0],
                        ArrowRight: [delta, 0],
                        ArrowUp: [0, -delta],
                        ArrowDown: [0, delta],
                      };
                      const offset = offsets[event.key];
                      if (!offset) return;
                      event.preventDefault();
                      const area = bounds.current;
                      if (area)
                        setGeometry((value) =>
                          fitLens(
                            {
                              ...value,
                              x: Math.max(
                                0,
                                Math.min(
                                  area.clientWidth - value.w,
                                  value.x + offset[0],
                                ),
                              ),
                              y: Math.max(
                                0,
                                Math.min(
                                  area.clientHeight - value.h,
                                  value.y + offset[1],
                                ),
                              ),
                            },
                            area.clientWidth,
                            area.clientHeight,
                          ),
                        );
                    }}
                  >
                    <GripHorizontal className="size-4" />
                  </GlassButton>
                )}
                {inside &&
                  !mini &&
                  shape === "panel" &&
                  geometry.w > 160 &&
                  geometry.h > 110 && (
                    <div className="flex h-full flex-col justify-center gap-4 px-5 py-4">
                      <GlassContent ink={ink.tone}>
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <strong className="text-[13px] font-semibold">
                              Sound
                            </strong>
                            <p className="mt-1 text-[11px] opacity-65">
                              MacBook Pro Speakers
                            </p>
                          </div>
                          <GlassSwitch
                            size="sm"
                            aria-label="Preview sound"
                            checked={enabled}
                            onCheckedChange={setEnabled}
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <GlassIcon name="quiet" className="size-4 shrink-0" />
                          <GlassSlider
                            tone="accent"
                            aria-label="Preview volume"
                            value={[previewVolume]}
                            onValueChange={([value]) => setPreviewVolume(value)}
                            disabled={!enabled}
                          />
                          <GlassIcon
                            name="speaker"
                            className="size-4 shrink-0"
                          />
                        </div>
                      </GlassContent>
                    </div>
                  )}
                {inside && !mini && shape !== "panel" && (
                  <GlassContent ink={ink.tone}>
                    <GlassButton
                      variant="ghost"
                      rendering="shared"
                      className="size-full rounded-full bg-transparent p-0 hover:bg-transparent active:bg-transparent"
                      aria-label={
                        shape === "circle"
                          ? foregroundClicks % 2
                            ? "Pause preview"
                            : "Play preview"
                          : foregroundClicks % 2
                            ? "Saved"
                            : "Continue"
                      }
                      aria-pressed={Boolean(foregroundClicks % 2)}
                      onClick={() => setForegroundClicks((value) => value + 1)}
                    >
                      <GlassStateSwap
                        active={Boolean(foregroundClicks % 2)}
                        from={
                          <>
                            <GlassIcon
                              name={shape === "circle" ? "play" : "arrow"}
                            />
                            {shape === "button" && "Continue"}
                          </>
                        }
                        to={
                          <>
                            <GlassIcon
                              name={shape === "circle" ? "pause" : "check"}
                            />
                            {shape === "button" && "Saved"}
                          </>
                        }
                      />
                    </GlassButton>
                  </GlassContent>
                )}
              </LiquidGlass>
              {!mini && (
                <LiquidGlass
                  config={params}
                  optics={optics}
                  radius={30}
                  className="pointer-events-none absolute bottom-5 left-1/2 size-[60px] -translate-x-1/2"
                />
              )}
              <GlassButton
                rendering="shared"
                variant="ghost"
                className="absolute bottom-5 left-1/2 z-5 grid size-[60px] -translate-x-1/2 place-items-center rounded-full bg-transparent hover:bg-transparent"
                type="button"
                onClick={toggle}
                aria-label={mini ? "Expand lens" : "Minimize lens"}
              >
                {mini ? (
                  <Ellipsis className="size-5" />
                ) : (
                  <X className="size-4" />
                )}
              </GlassButton>
            </GlassScene>
          </div>
        </div>
        <PreviewToolbar
          photo={photo}
          onPhotoChange={setPhoto}
          blur={params.blur}
          onBlurChange={(blur) =>
            setParams((previous) => ({ ...previous, blur }))
          }
          label="Playground"
          backgroundControls={
            <div
              data-testid="playground-scene-actions"
              className="flex min-h-10 flex-wrap items-center gap-2 text-xs sm:flex-nowrap"
            >
              <BackdropPicker
                label="Preview backdrop"
                value={photo}
                onValueChange={setPhoto}
                className="h-10"
              />
              <div className="flex items-center gap-2">
                <GlassButton
                  rendering="shared"
                  className="grid size-10 place-items-center"
                  aria-label={moving ? "Pause motion" : "Resume motion"}
                  title={moving ? "Pause motion" : "Resume motion"}
                  onClick={() => setMoving(!moving)}
                >
                  {moving ? (
                    <Pause className="size-3.5" />
                  ) : (
                    <Play className="size-3.5" />
                  )}
                </GlassButton>
                <GlassButton
                  rendering="shared"
                  className="h-10 px-3"
                  onClick={() => setInside(!inside)}
                  aria-pressed={inside}
                >
                  {inside ? "Hide content" : "Show content"}
                </GlassButton>
                <GlassButton
                  rendering="shared"
                  className="grid size-10 place-items-center"
                  aria-label="Reset lens"
                  title="Reset lens"
                  onClick={reset}
                >
                  <RotateCcw className="size-3.5" />
                </GlassButton>
              </div>
              <GlassButton
                rendering="shared"
                className="h-10 px-3"
                onClick={() => setRevision((value) => value + 1)}
              >
                Refresh scene
                <RotateCcw className="size-3.5" data-icon="inline-end" />
              </GlassButton>
            </div>
          }
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1 text-[11px] text-muted-foreground">
          <label className="flex flex-1 items-center gap-3 text-muted-foreground">
            Scene text
            <GlassInput
              aria-label="Background text"
              value={sceneLabel}
              onChange={(event) => setSceneLabel(event.target.value)}
              className="h-9 max-w-52"
            />
          </label>
        </div>
      </div>
      <aside
        onInputCapture={() => setCopied(false)}
        className="site-inspector flex flex-col rounded-[20px] bg-card p-5"
        aria-label="Lens controls"
      >
        <div className="mb-5 flex items-center gap-2 text-xs font-medium">
          <SlidersHorizontal className="size-3.5" />
          Lens settings
        </div>
        <GlassToggleGroup
          type="single"
          liquid
          className="mb-6 w-full rounded-xl bg-foreground/3 p-1"
          value={shape}
          aria-label="Lens shape"
          onValueChange={(next) => {
            if (!next) return;
            setShape(next);
            setMini(false);
            setForegroundClicks(0);
            cancelAnimationFrame(transition.current);
            transition.current = 0;
            const preset =
              next === "circle"
                ? { w: 96, h: 96, radius: 48 }
                : next === "button"
                  ? { w: 200, h: 52, radius: 26 }
                  : { w: 280, h: 148, radius: 30 };
            setGeometry((previous) =>
              fitLens(
                { ...previous, ...preset },
                bounds.current?.clientWidth ?? 748,
                bounds.current?.clientHeight ?? 480,
              ),
            );
          }}
        >
          <GlassToggleGroupItem
            value="panel"
            className="h-9 flex-1 px-2 text-xs"
          >
            Panel
          </GlassToggleGroupItem>
          <GlassToggleGroupItem
            value="button"
            className="h-9 flex-1 px-2 text-xs"
          >
            Button
          </GlassToggleGroupItem>
          <GlassToggleGroupItem
            value="circle"
            className="h-9 flex-1 px-2 text-xs"
          >
            Circle
          </GlassToggleGroupItem>
        </GlassToggleGroup>
        <div className="mb-6 flex flex-col gap-3">
          <span className="text-xs text-muted-foreground">Corner profile</span>
          <GlassToggleGroup
            type="single"
            value={contour}
            aria-label="Corner profile"
            onValueChange={(value) => {
              if (value) setContour(value as GlassShape);
            }}
            className="w-full"
          >
            <GlassToggleGroupItem value="round" className="h-9 flex-1 text-xs">
              Round
            </GlassToggleGroupItem>
            <GlassToggleGroupItem
              value="squircle"
              className="h-9 flex-1 text-xs"
            >
              Squircle
            </GlassToggleGroupItem>
          </GlassToggleGroup>
          <label className="flex items-center justify-between text-xs text-muted-foreground">
            Show contour
            <GlassSwitch
              size="sm"
              opticalIdle={false}
              aria-label="Show contour"
              checked={showOutline}
              onCheckedChange={setShowOutline}
            />
          </label>
        </div>
        <div className="flex flex-col gap-5">
          <Dial
            label="Depth"
            value={params.depth}
            min={0}
            max={120}
            step={1}
            unit="px"
            onValueChange={(depth) => setParams((prev) => ({ ...prev, depth }))}
          />
          <Dial
            label="Radius"
            value={geometry.radius}
            min={0}
            max={120}
            step={1}
            onValueChange={(v) => setDimension("radius", v)}
            unit="px"
          />
        </div>
        <div className="mt-5 flex flex-col gap-5">
          <Dial
            label="Glint"
            value={params.glint}
            min={0}
            max={150}
            step={1}
            onValueChange={(glint) =>
              setParams((previous) => ({ ...previous, glint }))
            }
          />
          <Dial
            label="Light direction"
            value={optics.lightAngle}
            min={-180}
            max={180}
            step={1}
            unit="°"
            onValueChange={(lightAngle) =>
              setOptics((previous) => ({ ...previous, lightAngle }))
            }
          />
        </div>
        <label className="mt-6 flex items-center justify-between gap-3 text-xs text-muted-foreground">
          Adapt to content
          <GlassSwitch
            size="sm"
            opticalIdle={false}
            aria-label="Adapt to content"
            checked={adaptContent}
            onCheckedChange={setAdaptContent}
          />
        </label>
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          Text behind the lens softens without stretching.
        </p>
        <details className="mt-7 pt-3">
          <summary className="text-xs text-muted-foreground">Size</summary>
          <div className="mt-6 flex flex-col gap-5">
            <Dial
              label="Width"
              value={geometry.w}
              min={60}
              max={450}
              step={1}
              onValueChange={(v) => setDimension("w", v)}
              unit="px"
            />
            <Dial
              label="Height"
              value={geometry.h}
              min={60}
              max={400}
              step={1}
              onValueChange={(v) => setDimension("h", v)}
              unit="px"
            />
          </div>
        </details>
        <details className="mt-5 pt-3">
          <summary className="text-xs text-muted-foreground">
            Refraction & light
          </summary>
          <div className="mt-6 flex flex-col gap-5">
            {DIALS.filter(
              (d) => !["depth", "blur", "tint", "glint"].includes(d.key),
            ).map((d) => (
              <Dial
                key={d.key}
                label={d.label}
                value={params[d.key]}
                min={d.min}
                max={d.max}
                step={d.step}
                onValueChange={(v) =>
                  setParams((prev) => ({ ...prev, [d.key]: v }))
                }
              />
            ))}
            <Dial
              label="Tint"
              value={params.tint}
              min={0}
              max={1}
              step={0.01}
              onValueChange={(v) => setParams((prev) => ({ ...prev, tint: v }))}
            />
            <label className="flex items-center justify-between text-xs text-muted-foreground">
              Tint color
              <input
                className="h-7 w-9 rounded-md border border-border bg-background p-1"
                type="color"
                aria-label="Tint color"
                value={params.tintColor}
                onChange={(e) =>
                  setParams((prev) => ({ ...prev, tintColor: e.target.value }))
                }
              />
            </label>
          </div>
        </details>
        <details className="mt-5 pt-3">
          <summary className="text-xs text-muted-foreground">
            Optical model
          </summary>
          <div className="mt-6 flex flex-col gap-5">
            {(
              [
                {
                  key: "refractiveIndex",
                  label: "Refractive index",
                  min: 1,
                  max: 2.2,
                  step: 0.01,
                },
                {
                  key: "thickness",
                  label: "Thickness",
                  min: 0.05,
                  max: 2,
                  step: 0.05,
                },
                {
                  key: "roughness",
                  label: "Roughness",
                  min: 0,
                  max: 1,
                  step: 0.01,
                },
                {
                  key: "interior",
                  label: "Interior lensing",
                  min: 0,
                  max: 1,
                  step: 0.01,
                },
                {
                  key: "colorBleed",
                  label: "Color bleed",
                  min: 0,
                  max: 1,
                  step: 0.01,
                },
              ] as const
            ).map((d) => (
              <Dial
                key={d.key}
                label={d.label}
                value={optics[d.key]}
                min={d.min}
                max={d.max}
                step={d.step}
                onValueChange={(v) =>
                  setOptics((prev) => ({ ...prev, [d.key]: v }))
                }
              />
            ))}
          </div>
        </details>
        <GlassButton
          rendering="shared"
          className="mt-7 w-full"
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(
                JSON.stringify(
                  {
                    config: params,
                    optics,
                    adaptiveBackdrop: adaptContent,
                    width: geometry.w,
                    height: geometry.h,
                    radius: geometry.radius,
                    shape: !mini && shape === "panel" ? contour : "round",
                  },
                  null,
                  2,
                ),
              );
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? (
            <Check className="size-3.5" />
          ) : (
            <Copy className="size-3.5" />
          )}
          {copied ? "Settings copied" : "Copy settings"}
        </GlassButton>
      </aside>
    </div>
  );
}

function Dial({
  label,
  value,
  min,
  max,
  step,
  onValueChange,
  unit = "",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onValueChange: (value: number) => void;
  unit?: string;
}) {
  return (
    <ParameterSlider
      label={label}
      value={value}
      min={min}
      max={max}
      step={step}
      unit={unit}
      onValueChange={onValueChange}
    />
  );
}
