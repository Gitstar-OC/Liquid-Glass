"use client";

import {
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { LiquidGlass } from "@/components/liquid-glass";
import type { LensParams } from "@/lib/glass";
import { cn } from "@/lib/utils";

type PlayParams = LensParams & { radius: number; lensW: number; lensH: number };
type StageMode = "photo" | "gradient" | "solid";

export type { PlayParams };
export type NumericParamKey = {
  [K in keyof PlayParams]: PlayParams[K] extends number ? K : never;
}[keyof PlayParams];

export const PLAY_DEFAULTS: PlayParams = {
  depth: 44,
  splay: 13,
  feather: 20,
  curve: 2.2,
  blur: 0,
  saturate: 1.6,
  brightness: 1.03,
  contrast: 1.07,
  chroma: 0.035,
  glint: 66,
  tint: 0.04,
  tintColor: "#ffffff",
  radius: 28,
  lensW: 190,
  lensH: 190,
};

const STAGE_PHOTO = "/stage-refraction.jpg";
const MESH =
  "radial-gradient(at 15% 25%, oklch(0.62 0.24 350 / 0.9) 0px, transparent 50%), radial-gradient(at 85% 15%, oklch(0.65 0.2 255 / 0.9) 0px, transparent 50%), radial-gradient(at 50% 85%, oklch(0.6 0.23 300 / 0.9) 0px, transparent 50%), radial-gradient(at 80% 90%, oklch(0.72 0.18 160 / 0.85) 0px, transparent 50%)";

interface SliderDef {
  key: NumericParamKey;
  label: string;
  min: number;
  max: number;
  step: number;
  fmt?: (v: number) => string;
}

const GROUPS: { title: string; sliders: SliderDef[] }[] = [
  {
    title: "Refraction",
    sliders: [
      { key: "depth", label: "Depth", min: 0, max: 120, step: 1 },
      { key: "splay", label: "Splay", min: 0, max: 40, step: 1 },
      { key: "feather", label: "Feather", min: 0, max: 40, step: 1 },
      {
        key: "curve",
        label: "Curvature",
        min: 0.3,
        max: 3,
        step: 0.1,
        fmt: (v) => v.toFixed(1),
      },
      {
        key: "chroma",
        label: "Chromatic",
        min: 0,
        max: 0.25,
        step: 0.005,
        fmt: (v) => v.toFixed(3),
      },
    ],
  },
  {
    title: "Material",
    sliders: [
      { key: "blur", label: "Blur", min: 0, max: 30, step: 0.5, fmt: (v) => v.toFixed(1) },
      {
        key: "saturate",
        label: "Saturate",
        min: 1,
        max: 3,
        step: 0.05,
        fmt: (v) => v.toFixed(2),
      },
      {
        key: "brightness",
        label: "Brighten",
        min: 0.5,
        max: 1.5,
        step: 0.01,
        fmt: (v) => v.toFixed(2),
      },
      { key: "glint", label: "Glint", min: 0, max: 100, step: 1 },
      { key: "tint", label: "Tint", min: 0, max: 1, step: 0.01, fmt: (v) => v.toFixed(2) },
    ],
  },
  {
    title: "Lens",
    sliders: [
      { key: "radius", label: "Radius", min: 0, max: 95, step: 1 },
      { key: "lensW", label: "Width", min: 60, max: 320, step: 2 },
      { key: "lensH", label: "Height", min: 60, max: 320, step: 2 },
    ],
  },
];

const MODES: { id: StageMode; label: string }[] = [
  { id: "photo", label: "Photo" },
  { id: "gradient", label: "Gradient" },
  { id: "solid", label: "Solid" },
];

function SliderRow({
  def,
  value,
  onChange,
}: {
  def: SliderDef;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="grid grid-cols-[72px_1fr_38px] items-center gap-2.5">
      <span className="text-[11.5px] font-medium text-foreground/70">
        {def.label}
      </span>
      <input
        type="range"
        data-testid={`pg-${def.key}`}
        min={def.min}
        max={def.max}
        step={def.step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="pg-range"
      />
      <span className="text-right font-mono text-[10px] tabular-nums text-foreground/50">
        {def.fmt ? def.fmt(value) : value}
      </span>
    </label>
  );
}

export interface LiquidPlaygroundProps {
  params: PlayParams;
  onParam: (key: NumericParamKey, value: number) => void;
  onTintColor: (value: string) => void;
  onReset: () => void;
}

export default function LiquidPlayground({
  params,
  onParam,
  onTintColor,
  onReset,
}: LiquidPlaygroundProps) {
  const [mode, setMode] = useState<StageMode>("photo");
  const [pos, setPos] = useState({ x: 205, y: 120 });
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  const p = params;

  const onLensDown = (e: ReactPointerEvent<HTMLElement>) => {
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onLensMove = (e: ReactPointerEvent<HTMLElement>) => {
    if (!drag.current) return;
    const stage = stageRef.current;
    if (!stage) return;
    const maxX = Math.max(0, stage.clientWidth - p.lensW);
    const maxY = Math.max(0, stage.clientHeight - p.lensH);
    setPos({
      x: Math.min(maxX, Math.max(0, e.clientX - drag.current.dx)),
      y: Math.min(maxY, Math.max(0, e.clientY - drag.current.dy)),
    });
  };

  const onLensUp = () => {
    drag.current = null;
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_296px] lg:items-start">
      <div className="min-w-0">
        <div
          ref={stageRef}
          data-testid="playground-stage"
          className="relative h-[420px] w-full overflow-hidden rounded-[var(--surface-radius)] border border-foreground/10 bg-black shadow-sm"
        >
          <div
            data-testid="stage-layer-photo"
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-300"
            style={{
              backgroundImage: `url('${STAGE_PHOTO}')`,
              opacity: mode === "photo" ? 1 : 0,
            }}
          />
          <div
            data-testid="stage-layer-gradient"
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              backgroundImage: MESH,
              backgroundColor: "#07070b",
              opacity: mode === "gradient" ? 1 : 0,
            }}
          />
          <div
            data-testid="stage-layer-solid"
            className="absolute inset-0 transition-opacity duration-300"
            style={{ background: "#0f766e", opacity: mode === "solid" ? 1 : 0 }}
          />

          <LiquidGlass
            preset="clear"
            config={p}
            radius={p.radius}
            pad={80}
            data-testid="playground-lens"
            onPointerDown={onLensDown}
            onPointerMove={onLensMove}
            onPointerUp={onLensUp}
            onPointerCancel={onLensUp}
            className="absolute z-20 cursor-grab touch-none shadow-2xl shadow-black/40 active:cursor-grabbing"
            style={
              {
                left: pos.x,
                top: pos.y,
                width: p.lensW,
                height: p.lensH,
              } as CSSProperties
            }
          />
        </div>
        <p className="mt-3 text-center text-[12px] text-muted-foreground">
          Drag the lens — what you see through it is the same scene, refracted
          live.
        </p>
      </div>

      <div
        data-adaptive-skip
        className="glass-field w-full rounded-[var(--surface-radius)] p-5 lg:sticky lg:top-24"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[12px] font-semibold tracking-tight">
            Lens controls
          </h3>
          <button
            type="button"
            data-testid="pg-reset"
            onClick={onReset}
            className={cn(
              "cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-medium",
              "text-muted-foreground transition-colors",
              "hover:bg-foreground/10 hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            Reset
          </button>
        </div>

        {GROUPS.map((group, gi) => (
          <div
            key={group.title}
            className={cn(
              "space-y-2.5 py-3",
              gi > 0 && "border-t border-foreground/10"
            )}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {group.title}
            </p>
            {group.sliders.map((def) => (
              <SliderRow
                key={def.key}
                def={def}
                value={p[def.key]}
                onChange={(v) => onParam(def.key, v)}
              />
            ))}
            {group.title === "Material" && (
              <label className="grid grid-cols-[72px_1fr] items-center gap-2.5 pt-0.5">
                <span className="text-[11px] font-medium text-foreground/70">
                  Tint color
                </span>
                <input
                  type="color"
                  data-testid="pg-tintColor"
                  value={p.tintColor}
                  onChange={(e) => onTintColor(e.target.value)}
                  className="pg-color h-6 w-full cursor-pointer rounded-md border-none bg-transparent"
                />
              </label>
            )}
          </div>
        ))}

        <div className="mt-3 border-t border-foreground/10 pt-3">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Backdrop
          </p>
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-foreground/5 p-1">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                data-testid={`stage-${m.id}`}
                onClick={() => setMode(m.id)}
                className={cn(
                  "cursor-pointer rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  mode === m.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
