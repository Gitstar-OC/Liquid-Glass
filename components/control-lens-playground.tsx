"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { GlassLens } from "@/components/glass/glass-target-lens";
import { GlassSliderSource } from "@/components/glass/glass-slider";
import { ParameterSlider } from "@/components/site/preview-controls";
import { PreviewToolbar } from "@/components/site/preview-toolbar";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldDescription } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SceneBackdrop } from "@/components/site/scene-backdrop";
import {
  CONTROL_LENS_PRESETS,
  buildControlLensTextures,
  type ControlLensParameters,
} from "@/lib/glass-lens-optics";

const DIALS = [
  { key: "magnification", label: "Magnification", min: 1, max: 5, step: 0.05 },
  { key: "scale", label: "Scale", min: 0, max: 0.2, step: 0.001 },
  { key: "depth", label: "Depth", min: 0, max: 40, step: 1 },
  { key: "curvature", label: "Curvature", min: 1, max: 100, step: 1 },
  { key: "splay", label: "Splay", min: 0.2, max: 2, step: 0.01 },
  { key: "chroma", label: "Chroma", min: 0, max: 1, step: 0.01 },
  { key: "blur", label: "Blur", min: 0, max: 24, step: 0.1 },
  {
    key: "rimStrength",
    label: "Rim light",
    min: 0,
    max: 1.5,
    step: 0.01,
  },
  { key: "edgeHighlight", label: "Edge highlight", min: 0, max: 1, step: 0.01 },
  {
    key: "specularAngle",
    label: "Specular angle",
    min: -180,
    max: 180,
    step: 1,
  },
] as const;
const INITIAL = { width: 64, height: 32, radius: 16 };
const HELP: Record<string, string> = {
  depth: "Lens thickness: increases the bend near the curved edge.",
  curvature: "Changes how steeply the edge curves.",
  splay: "Redistributes the bend across the shoulder.",
  chroma: "Separates color channels slightly near the edge.",
  rimStrength: "Strength of the edge reflection. This does not paint white glow.",
  edgeHighlight: "Contrast of the thin optical edge.",
  specularAngle: "Direction of the two neutral edge glints, in degrees.",
};
type Preset = "slider" | "switch" | "surface" | "magnifier";
const clamp = (v: number) => Math.max(0, Math.min(1, v));
export function ControlLensPlayground() {
  const [preset, setPreset] = useState<Preset>("slider");
  const [showMap, setShowMap] = useState(false);
  const [copied, setCopied] = useState("");
  const [parameters, setParameters] = useState<ControlLensParameters>(
    CONTROL_LENS_PRESETS.slider,
  );
  const [geometry, setGeometry] = useState(INITIAL),
    [position, setPosition] = useState({ x: 0.5, y: 0.5 });
  const map = useRef<HTMLImageElement>(null);
  const source = useRef<HTMLDivElement>(null),
    grab = useRef({ x: 0, y: 0 });
  const hintId = useId();
  const changeGeometry = (key: keyof typeof INITIAL, value: number) =>
    setGeometry((current) => {
      const next = { ...current, [key]: value };
      return {
        ...next,
        radius: Math.min(next.radius, next.width / 2, next.height / 2),
      };
    });
  // The slider magnifies its explicit track along the short axis. Keep the
  // displacement map neutral in the center, just like the installed control.
  const trackSource = preset === "slider" || preset === "switch";
  const opticalParameters = { ...parameters, magnification: trackSource ? 1 : parameters.magnification };
  const parameterKey = JSON.stringify(opticalParameters);
  const settingsText = JSON.stringify({ lens: { lensW: geometry.width, lensH: geometry.height, borderRadius: geometry.radius }, parameters, x: position.x, y: position.y }, null, 2);
  useEffect(() => {
    if (!showMap) return;
    const texture = buildControlLensTextures(
      geometry.width,
      geometry.height,
      geometry.radius,
      JSON.parse(parameterKey),
    );
    if (map.current) map.current.src = texture.displacement;
  }, [geometry.width, geometry.height, geometry.radius, parameterKey, showMap]);
  const reset = () => {
    choosePreset(preset);
  };
  const choosePreset = (next: Preset) => {
    setPreset(next);
    setGeometry(next === "surface" ? { width: 70, height: 60, radius: 22 } :
      next === "magnifier" ? { width: 96, height: 72, radius: 28 } : INITIAL);
    setParameters(CONTROL_LENS_PRESETS[next]);
    setPosition({ x: 0.5, y: 0.5 });
    setCopied("");
  };
  return (
    <div className="flex flex-col gap-8" data-testid="control-lens-workbench">
      <div>
        <div className={showMap ? "grid gap-4 md:grid-cols-2" : "grid"}>
          <figure className="flex min-w-0 flex-col gap-3">
            <div
              ref={source}
              className="control-lens-source relative h-80 overflow-hidden rounded-[24px] bg-muted/35"
              style={{ "--glass-lens-plane": "var(--card)", "--glass-action": "#9896ff" } as CSSProperties}
            >
              <GlassLens
                lens={{
                  lensW: geometry.width,
                  lensH: geometry.height,
                  borderRadius: geometry.radius,
                }}
                parameters={opticalParameters}
                x={position.x}
                y={position.y}
                className="size-full"
                rim="column"
                refractionTarget={preset === "switch" ? (
                  <div className="absolute inset-0 bg-card">
                    <div className="absolute left-1/2 top-1/2 -translate-1/2 rounded-full bg-(--glass-action)" style={{ width: 74 * .95, height: 21 }} />
                  </div>
                ) : trackSource ? (
                  <GlassSliderSource
                    inset={24}
                    thickness={6}
                    magnification={parameters.magnification}
                    background="var(--card)"
                  >
                    <span className="absolute inset-x-6 bottom-8 text-center text-sm text-muted-foreground">
                      Selectable source text
                    </span>
                  </GlassSliderSource>
                ) : undefined}
              >
                <div className="absolute inset-0 bg-card">
                  {!trackSource && <SceneBackdrop photo="ocean" />}
                  {preset === "switch" ? <div className="absolute left-1/2 top-1/2 -translate-1/2 rounded-full bg-(--glass-action)" style={{ width: 74, height: 28 }} /> : trackSource && <div className="absolute inset-x-6 top-1/2 h-[6px] -translate-y-1/2 overflow-hidden rounded-full bg-foreground/18">
                    <div className="h-full w-1/2 rounded-full bg-(--glass-action)" />
                  </div>}
                  <span className="absolute inset-x-6 bottom-8 text-center text-sm text-muted-foreground" style={!trackSource ? { color: "#fff" } : undefined}>
                    Selectable source text
                  </span>
                </div>
              </GlassLens>
              <button
                type="button"
                aria-label="Move control lens"
                aria-describedby={hintId}
                className="absolute touch-none border-0 bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4"
                style={{
                  width: geometry.width,
                  height: geometry.height,
                  borderRadius: geometry.radius,
                  left: `calc(${position.x * 100}% - ${position.x * geometry.width}px)`,
                  top: `calc(${position.y * 100}% - ${position.y * geometry.height}px)`,
                }}
                onPointerDown={(event) => {
                  if (event.button !== 0) return;
                  const b = event.currentTarget.getBoundingClientRect();
                  grab.current = {
                    x: event.clientX - b.left,
                    y: event.clientY - b.top,
                  };
                  event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onPointerMove={(event) => {
                  if (
                    !event.currentTarget.hasPointerCapture(event.pointerId) ||
                    !source.current
                  )
                    return;
                  const b = source.current.getBoundingClientRect();
                  setPosition({
                    x: clamp(
                      (event.clientX - b.left - grab.current.x) /
                        Math.max(1, b.width - geometry.width),
                    ),
                    y: clamp(
                      (event.clientY - b.top - grab.current.y) /
                        Math.max(1, b.height - geometry.height),
                    ),
                  });
                }}
                onPointerUp={(event) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId))
                    event.currentTarget.releasePointerCapture(event.pointerId);
                }}
                onKeyDown={(event) => {
                  const step = event.shiftKey ? 0.1 : 0.025;
                  if (
                    [
                      "ArrowLeft",
                      "ArrowRight",
                      "ArrowUp",
                      "ArrowDown",
                    ].includes(event.key)
                  ) {
                    event.preventDefault();
                    setPosition((current) => ({
                      x: clamp(
                        current.x +
                          (event.key === "ArrowRight"
                            ? step
                            : event.key === "ArrowLeft"
                              ? -step
                              : 0),
                      ),
                      y: clamp(
                        current.y +
                          (event.key === "ArrowDown"
                            ? step
                            : event.key === "ArrowUp"
                              ? -step
                              : 0),
                      ),
                    }));
                  }
                }}
              />
            </div>
            <figcaption className="text-xs text-muted-foreground" id={hintId}>
              Drag to move. Use arrow keys for smaller adjustments.
            </figcaption>
          </figure>
          {showMap && <figure className="flex min-w-0 flex-col gap-3">
            <div className="flex h-80 items-center justify-center rounded-[24px] bg-muted/35 p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={map}
                alt="Displacement map"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <figcaption className="text-xs text-muted-foreground">
              Displacement map
            </figcaption>
          </figure>}
        </div>
        <PreviewToolbar
          blurControl={null}
          label="Control lens"
            backgroundControls={
              <div className="flex flex-wrap items-center gap-2">
                <ToggleGroup type="single" value={preset} onValueChange={next => next && choosePreset(next as Preset)} aria-label="Lens preset" spacing={0}>
                  {([ ["slider", "Slider"], ["switch", "Switch"], ["surface", "Surface"], ["magnifier", "Magnify"] ] as const).map(([value, label]) => (
                    <ToggleGroupItem key={value} value={value} className="h-8 rounded-full px-3 text-xs">{label}</ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <Button variant="ghost" size="sm" aria-pressed={showMap} onClick={() => setShowMap(value => !value)}>{showMap ? "Hide map" : "Show map"}</Button>
                <Button variant="ghost" size="sm" onClick={reset}>Reset</Button>
                <Button variant="secondary" size="sm" onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(settingsText);
                    setCopied(settingsText);
                  } catch { setCopied(""); }
                }}>{copied === settingsText ? "Copied" : "Copy settings"}</Button>
              </div>
          }
          href="/docs/glass-target-lens"
        />
      </div>
      <FieldGroup className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        {(
          [
            { key: "width", label: "Width", min: 32, max: 200 },
            { key: "height", label: "Height", min: 16, max: 100 },
            {
              key: "radius",
              label: "Border radius",
              min: 0,
              max: Math.min(geometry.width, geometry.height) / 2,
            },
          ] as const
        ).map((dial) => (
          <Field key={dial.key}>
            <ParameterSlider
              label={dial.label}
              value={geometry[dial.key]}
              min={dial.min}
              max={dial.max}
              step={1}
              unit="px"
              onValueChange={(value) => changeGeometry(dial.key, value)}
            />
          </Field>
        ))}
        {DIALS.filter(dial => ["magnification", "scale", "blur"].includes(dial.key)).map((dial) => (
          <Field key={dial.key}>
            <ParameterSlider
              label={dial.label}
              value={parameters[dial.key] ?? 1}
              min={dial.min}
              max={dial.max}
              step={dial.step}
              onValueChange={(value) =>
                setParameters((current) => ({ ...current, [dial.key]: value }))
              }
            />
          </Field>
        ))}
      </FieldGroup>
      <details className="site-inspector rounded-2xl bg-muted/25 p-5">
        <summary className="text-sm font-medium">Advanced optics</summary>
        <FieldGroup className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {DIALS.filter(dial => !["magnification", "scale", "blur"].includes(dial.key)).map(dial => <Field key={dial.key}>
            <ParameterSlider label={dial.label} value={parameters[dial.key] ?? 1} min={dial.min} max={dial.max} step={dial.step}
              onValueChange={value => setParameters(current => ({ ...current, [dial.key]: value }))} />
            <FieldDescription>{HELP[dial.key]}</FieldDescription>
          </Field>)}
        </FieldGroup>
      </details>
    </div>
  );
}
