"use client";

import Link from "next/link";
import { useRef, useState, type CSSProperties } from "react";
import {
  ArrowRight,
  Check,
  CheckCheck,
  ChevronDown,
  Copy,
  Layers,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Volume2,
} from "lucide-react";
import { LiquidGlass } from "@/components/liquid-glass";
import { useAdaptiveContrast } from "@/components/adaptive-contrast";
import {
  GLASS_PRESETS,
  DEFAULT_OPTICS,
  type GlassOptics,
  type GlassPreset,
  type LensParams,
} from "@/lib/glass";
import { cn } from "@/lib/utils";

const MATERIALS: GlassPreset[] = [
  "transparent",
  "clear",
  "regular",
  "frosted",
  "thick",
];
const SCENES = ["Landscape", "Daylight", "Midnight"] as const;
type Scene = (typeof SCENES)[number];
type Preview = "Player" | "Card" | "Form";
const DIALS: {
  key: keyof Omit<LensParams, "tintColor">;
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
}[] = [
  { key: "depth", label: "Refraction", min: 0, max: 90, step: 1 },
  { key: "blur", label: "Blur", min: 0, max: 30, step: 0.5, unit: "px" },
  { key: "glint", label: "Edge light", min: 0, max: 100, step: 1, unit: "%" },
  { key: "tint", label: "Tint opacity", min: 0, max: 0.8, step: 0.01 },
  { key: "saturate", label: "Saturation", min: 0.5, max: 2.5, step: 0.05 },
];
const ADVANCED: typeof DIALS = [
  { key: "splay", label: "Edge width", min: 1, max: 40, step: 1 },
  { key: "feather", label: "Falloff", min: 1, max: 40, step: 1 },
  { key: "curve", label: "Curvature", min: 0.3, max: 3, step: 0.1 },
  { key: "chroma", label: "Dispersion", min: 0, max: 0.15, step: 0.005 },
  { key: "brightness", label: "Brightness", min: 0.6, max: 1.4, step: 0.01 },
  { key: "contrast", label: "Contrast", min: 0.5, max: 1.5, step: 0.01 },
];

export function GlassStudio({ expanded = false }: { expanded?: boolean }) {
  const [material, setMaterial] = useState<GlassPreset>("clear");
  const [params, setParams] = useState<LensParams>({ ...GLASS_PRESETS.clear });
  const [optics, setOptics] = useState<GlassOptics>({ ...DEFAULT_OPTICS });
  const [radius, setRadius] = useState(28);
  const [scene, setScene] = useState<Scene>("Landscape");
  const [preview, setPreview] = useState<Preview>("Player");
  const [adaptive, setAdaptive] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const probe = useRef<HTMLDivElement>(null);
  const backdropScene = useRef<HTMLDivElement>(null);
  const sample = useAdaptiveContrast(probe, {
    live: true,
    interval: 180,
    resolution: 3,
    tintColor: params.tintColor,
    tintOpacity: params.tint,
  });
  const darkInk = adaptive && sample.tone === "dark";
  const protectedInk = adaptive && sample.contrast < 4.5;
  const selectMaterial = (value: GlassPreset) => {
    setMaterial(value);
    setParams({ ...GLASS_PRESETS[value] });
  };
  const reset = () => {
    selectMaterial("clear");
    setRadius(28);
    setAdaptive(true);
    setOptics({ ...DEFAULT_OPTICS });
  };
  const copy = async () => {
    const code = `<LiquidGlass preset="${material}" radius={${radius}} optics={${JSON.stringify(optics)}} config={${JSON.stringify(params, null, 2)}}>\n  {/* Your content */}\n</LiquidGlass>`;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  const inkStyle = {
    "--preview-ink": darkInk ? "#16191b" : "#fff",
    "--preview-muted": darkInk ? "rgba(16,22,26,.72)" : "rgba(255,255,255,.75)",
    "--preview-line": darkInk ? "rgba(0,0,0,.14)" : "rgba(255,255,255,.23)",
    color: "var(--preview-ink)",
    background: protectedInk
      ? darkInk
        ? "rgba(255,255,255,.68)"
        : "rgba(12,18,23,.54)"
      : undefined,
    textShadow: protectedInk
      ? darkInk
        ? "0 1px 3px rgba(255,255,255,.5)"
        : "0 1px 3px rgba(0,0,0,.6)"
      : undefined,
    borderRadius: Math.max(0, radius - 1),
  } as CSSProperties;

  return (
    <div className={cn("studio", expanded && "studio-expanded")} id="studio">
      <div className="studio-toolbar">
        <div className="studio-toolbar-title">
          <span className="studio-live-dot" />
          Live preview <span className="studio-toolbar-muted">/ {preview}</span>
        </div>
        <Link href={expanded ? "/" : "/playground"} className="studio-expand">
          {expanded ? "Back to overview" : "Open playground"}
          <Maximize2 size={13} />
        </Link>
      </div>
      <div className="studio-body">
        <div className="studio-canvas-column">
          <div
            className={cn(
              "studio-canvas",
              `studio-scene-${scene.toLowerCase()}`,
            )}
          >
            <div
              ref={backdropScene}
              style={{ position: "absolute", inset: 0, background: "inherit" }}
            >
              {scene === "Landscape" && (
                // A real image element lets the ink engine read local pixels.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="/stage-refraction.jpg"
                  alt=""
                  className="studio-landscape"
                />
              )}
              <div className="studio-scene-label">
                <span>
                  {scene === "Landscape"
                    ? "Somewhere, a little quieter."
                    : scene === "Daylight"
                      ? "Let the light in."
                      : "After hours."}
                </span>
                <span>01 — 03</span>
              </div>
            </div>
            <div className="studio-preview-anchor">
              <LiquidGlass
                preset={material}
                config={params}
                optics={optics}
                sceneRef={backdropScene}
                radius={radius}
                pad={56}
                className="studio-glass"
              >
                <div
                  ref={probe}
                  className="studio-preview-content"
                  style={inkStyle}
                  data-ink={darkInk ? "dark" : "light"}
                >
                  {preview === "Player" && (
                    <>
                      <div className="studio-player-top">
                        <div className="studio-album">
                          <span>
                            e<br />c h o
                          </span>
                        </div>
                        <div>
                          <p className="preview-overline">
                            A moment to yourself
                          </p>
                          <h3>Weightless</h3>
                          <p className="preview-secondary">
                            Marconi Union · Ambient
                          </p>
                        </div>
                        <span className="studio-equalizer" aria-hidden="true">
                          <i />
                          <i />
                          <i />
                        </span>
                      </div>
                      <div className="studio-track">
                        <div style={{ width: playing ? "64%" : "38%" }} />
                      </div>
                      <div className="studio-track-times">
                        <span>{playing ? "3:42" : "2:18"}</span>
                        <span>6:00</span>
                      </div>
                      <div className="studio-player-controls">
                        <Volume2 size={17} strokeWidth={1.6} />
                        <button
                          type="button"
                          className="studio-play"
                          aria-label={
                            playing ? "Pause preview" : "Play preview"
                          }
                          onClick={() => setPlaying(!playing)}
                        >
                          {playing ? (
                            <Pause size={20} fill="currentColor" />
                          ) : (
                            <Play size={20} fill="currentColor" />
                          )}
                        </button>
                        <span className="studio-hires">LOSSLESS</span>
                      </div>
                    </>
                  )}
                  {preview === "Card" && (
                    <>
                      <p className="preview-overline">Your daily pause</p>
                      <h3 className="studio-card-title">
                        Make room
                        <br />
                        for a little less.
                      </h3>
                      <p className="preview-secondary">
                        A clear surface. A quiet moment.
                        <br />
                        Everything in its right place.
                      </p>
                      <button
                        type="button"
                        className="studio-preview-button"
                        onClick={() => setPreview("Player")}
                      >
                        Take a moment <ArrowRight size={15} />
                      </button>
                    </>
                  )}
                  {preview === "Form" && (
                    <form
                      className="studio-preview-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        setSubmitted(true);
                      }}
                    >
                      <p className="preview-overline">A place for your ideas</p>
                      <h3>Welcome back.</h3>
                      <label>
                        Email address
                        <input
                          required
                          type="email"
                          placeholder="you@example.com"
                          autoComplete="email"
                          onChange={() => setSubmitted(false)}
                        />
                      </label>
                      <label>
                        Password
                        <input
                          required
                          type="password"
                          placeholder="Enter your password"
                          autoComplete="current-password"
                          minLength={6}
                          onChange={() => setSubmitted(false)}
                        />
                      </label>
                      <button type="submit" className="studio-preview-button">
                        {submitted ? "Preview submitted" : "Continue"}
                        {submitted ? (
                          <Check size={15} />
                        ) : (
                          <ArrowRight size={15} />
                        )}
                      </button>
                      <span className="studio-form-note" role="status">
                        {submitted
                          ? "Demo complete. Your details stay in this browser."
                          : "An interactive form preview. No account is created."}
                      </span>
                    </form>
                  )}
                </div>
              </LiquidGlass>
            </div>
            <div
              className="studio-background-switch"
              role="group"
              aria-label="Preview background"
            >
              {SCENES.map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={scene === value}
                  onClick={() => setScene(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          <div className="studio-canvas-footer">
            <span>
              <Layers size={13} />
              Full-scene refraction
            </span>
            <span>
              {adaptive
                ? `Adaptive ink · ${sample.tone === "light" ? "Light" : "Dark"}${protectedInk ? " + protection" : ""}`
                : "Fixed light ink"}
            </span>
          </div>
        </div>
        <aside className="studio-inspector" aria-label="Glass controls">
          <div className="studio-inspector-heading">
            <span>
              <SlidersHorizontal size={14} />
              Make it yours
            </span>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all glass settings"
              title="Reset settings"
            >
              <RotateCcw size={14} />
            </button>
          </div>
          <label className="studio-select-label">
            Component
            <div className="studio-select-wrap">
              <select
                value={preview}
                onChange={(e) => setPreview(e.target.value as Preview)}
              >
                {["Player", "Card", "Form"].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
              <ChevronDown size={13} />
            </div>
          </label>
          <div className="studio-control-block">
            <p className="studio-control-label">Material</p>
            <div
              className="studio-materials"
              role="group"
              aria-label="Glass material"
            >
              {MATERIALS.map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={material === value}
                  onClick={() => selectMaterial(value)}
                >
                  <span
                    className={cn("studio-material-dot", `material-${value}`)}
                  />
                  {value === "transparent"
                    ? "Crystal"
                    : value[0].toUpperCase() + value.slice(1)}
                  {material === value && <Check size={12} />}
                </button>
              ))}
            </div>
          </div>
          <div className="studio-dials">
            {DIALS.map((dial) => (
              <label className="studio-dial" key={dial.key}>
                <span>
                  {dial.label}
                  <output>
                    {Number(params[dial.key].toFixed(2))}
                    {dial.unit}
                  </output>
                </span>
                <input
                  aria-label={dial.label}
                  type="range"
                  min={dial.min}
                  max={dial.max}
                  step={dial.step}
                  value={params[dial.key]}
                  onChange={(e) =>
                    setParams({ ...params, [dial.key]: Number(e.target.value) })
                  }
                />
              </label>
            ))}
            <label className="studio-dial">
              <span>
                Corner radius<output>{radius}px</output>
              </span>
              <input
                aria-label="Corner radius"
                type="range"
                min={0}
                max={64}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
              />
            </label>
          </div>
          <label className="studio-ink-switch">
            <span>
              Adaptive ink<small>Reads the background</small>
            </span>
            <input
              type="checkbox"
              checked={adaptive}
              onChange={(e) => setAdaptive(e.target.checked)}
            />
            <span className="studio-toggle" aria-hidden="true" />
          </label>
          <details className="studio-advanced" open={expanded || undefined}>
            <summary>
              Advanced optics
              <ChevronDown size={12} />
            </summary>
            <div className="studio-dials">
              {ADVANCED.map((dial) => (
                <label className="studio-dial" key={dial.key}>
                  <span>
                    {dial.label}
                    <output>{Number(params[dial.key].toFixed(3))}</output>
                  </span>
                  <input
                    aria-label={dial.label}
                    type="range"
                    min={dial.min}
                    max={dial.max}
                    step={dial.step}
                    value={params[dial.key]}
                    onChange={(e) =>
                      setParams({
                        ...params,
                        [dial.key]: Number(e.target.value),
                      })
                    }
                  />
                </label>
              ))}
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
                    label: "Lens thickness",
                    min: 0.05,
                    max: 2,
                    step: 0.05,
                  },
                  {
                    key: "lightAngle",
                    label: "Light direction",
                    min: -180,
                    max: 180,
                    step: 1,
                  },
                  {
                    key: "roughness",
                    label: "Surface roughness",
                    min: 0,
                    max: 1,
                    step: 0.01,
                  },
                ] as const
              ).map((dial) => (
                <label className="studio-dial" key={dial.key}>
                  <span>
                    {dial.label}
                    <output>{Number(optics[dial.key].toFixed(2))}</output>
                  </span>
                  <input
                    aria-label={dial.label}
                    type="range"
                    min={dial.min}
                    max={dial.max}
                    step={dial.step}
                    value={optics[dial.key]}
                    onChange={(e) =>
                      setOptics({
                        ...optics,
                        [dial.key]: Number(e.target.value),
                      })
                    }
                  />
                </label>
              ))}
              <label className="studio-color">
                Tint color
                <input
                  type="color"
                  value={params.tintColor}
                  onChange={(e) =>
                    setParams({ ...params, tintColor: e.target.value })
                  }
                />
              </label>
            </div>
          </details>
          <button
            type="button"
            className="studio-copy"
            onClick={copy}
            onBlur={() => setCopied(false)}
          >
            {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
            {copied ? "Copied component" : "Copy component"}
          </button>
        </aside>
      </div>
    </div>
  );
}
