"use client";

import { useEffect, useRef, useState } from "react";
import { GlassAtlas } from "@/components/glass-atlas";
import { GlassScene, GlassSettingsProvider } from "@/components/glass-scene";
import { GlassSurface } from "@/components/glass/glass-surface";
import { GlassButton } from "@/components/glass/glass-button";
import {
  GlassToggleGroup as ToggleGroup,
  GlassToggleGroupItem as ToggleGroupItem,
} from "@/components/glass/glass-toggle";
import { SceneBackdrop } from "@/components/site/scene-backdrop";
import { invalidateGlassScene } from "@/lib/glass-scene";
import { GLASS_DEFAULT_PARAMS } from "@/lib/glass";
import { GlassLens } from "@/components/glass/glass-target-lens";

export function GlassPerformanceLab() {
  const [backend, setBackend] = useState("independent");
  const [count, setCount] = useState("3");
  const [limit, setLimit] = useState("5");
  const [contour, setContour] = useState<"round" | "squircle">("round");
  const [colorBleed, setColorBleed] = useState("source");
  const [targetProgress, setTargetProgress] = useState(0.5);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const scene = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const marker = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  const localLens = backend === "target" || backend === "dom";
  const run = () => {
    if (running) return;
    setRunning(true);
    setResult(null);
    const samples: number[] = [];
    const originalSurfaces = () =>
      [
        ...(stage.current?.querySelectorAll<HTMLElement>(
          "[data-liquid-glass],[data-glass-target-lens]",
        ) ?? []),
      ].filter((node) => !node.closest("[data-glass-mirror]"));
    const paints = () =>
      originalSurfaces().reduce(
        (sum, node) =>
          sum +
          Number(
            node.dataset.glassFilterPaints ??
              node.querySelector<HTMLElement>("[data-lens-layer]")?.dataset
                .glassFilterPaints ??
              0,
          ),
        0,
      );
    const startPaints = paints();
    const mapRevisions = () =>
      [
        ...(stage.current?.querySelectorAll<HTMLElement>(
          "[data-lens-map-revisions]",
        ) ?? []),
      ].reduce((sum, node) => sum + Number(node.dataset.lensMapRevisions), 0);
    const startMaps = mapRevisions();
    let previous = 0;
    const tick = (time: number) => {
      if (document.hidden) {
        previous = 0;
        frame.current = requestAnimationFrame(tick);
        return;
      }
      if (previous) samples.push(time - previous);
      previous = time;
      if (localLens) setTargetProgress(0.5 + Math.sin(time / 500) * 0.4);
      else {
        if (marker.current)
          marker.current.style.transform = `translateX(${Math.sin(time / 500) * 180}px)`;
        invalidateGlassScene(scene.current, {
          target: marker.current ?? undefined,
          immediate: true,
        });
      }
      if (samples.length < 120) {
        frame.current = requestAnimationFrame(tick);
        return;
      }
      samples.sort((a, b) => a - b);
      const surfaces = originalSurfaces();
      setResult({
        renderer: backend,
        contour: localLens ? "round" : contour,
        atlasSetupMs:
          stage.current?.querySelector<HTMLElement>("[data-glass-atlas]")
            ?.dataset.atlasTextureMs ?? null,
        composited: surfaces.filter(
          (node) =>
            node.dataset.refraction === "scene-atlas" &&
            node.dataset.glassRendering === "composited",
        ).length,
        mounted: Number(count),
        requestedLimit: Number(limit),
        viewport: `${innerWidth}×${innerHeight}`,
        active: surfaces.filter(
          (node) =>
            node.dataset.refraction === "dom-svg" ||
            node.dataset.refraction === "target-svg" ||
            node.dataset.refraction === "scene-svg" ||
            (node.dataset.refraction === "scene-atlas" &&
              node.dataset.glassRendering === "active"),
        ).length,
        colorBleed: colorBleed === "source" ? 0.75 : 0,
        controlRim: localLens
          ? colorBleed === "source"
            ? "column"
            : "none"
          : null,
        mirrors: surfaces.reduce(
          (sum, node) =>
            sum + node.querySelectorAll("[data-glass-mirror]").length,
          0,
        ),
        mirroredNodes: surfaces.reduce(
          (sum, node) =>
            sum + node.querySelectorAll("[data-glass-mirror] *").length,
          0,
        ),
        filterPaintsDuringRun: paints() - startPaints,
        mapRevisionsDuringRun: mapRevisions() - startMaps,
        medianFrameMs: Number(samples[60].toFixed(2)),
        p95FrameMs: Number(samples[114].toFixed(2)),
        maxFrameMs: Number(samples[119].toFixed(2)),
        framesOver25ms: samples.filter((value) => value > 25).length,
      });
      setRunning(false);
    };
    frame.current = requestAnimationFrame(tick);
  };
  const target = (
    <div className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 overflow-hidden rounded-full bg-black/15">
      <div
        className="h-full bg-(--glass-action)"
        style={{ width: `${targetProgress * 100}%` }}
      />
    </div>
  );
  const surfaces = (
    <div className="absolute inset-0 grid grid-cols-3 content-center gap-3 p-4 sm:grid-cols-4 sm:gap-5 sm:p-8">
      {Array.from({ length: Number(count) }, (_, index) =>
        localLens ? (
          <GlassLens
            key={index}
            lens={{ lensW: 90, lensH: 60, borderRadius: 30 }}
            x={targetProgress}
            parameters={{ depth: 17 }}
            rim={colorBleed === "source" ? "column" : "none"}
            refractionTarget={backend === "target" ? target : undefined}
            className="h-28 w-full"
          >
            {target}
          </GlassLens>
        ) : (
          <GlassSurface
            key={index}
            adaptiveBackdrop={false}
            shape={contour}
            ink="dark"
            className="flex h-28 items-center justify-center p-3 text-sm"
          >
            Surface {index + 1}
          </GlassSurface>
        ),
      )}
    </div>
  );
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-6">
        <div>
          <p className="mb-2 text-xs text-muted-foreground">Renderer</p>
          <ToggleGroup
            type="single"
            value={backend}
            disabled={running}
            onValueChange={(value) => {
              if (value && !running) setBackend(value);
            }}
            aria-label="Renderer"
          >
            <ToggleGroupItem value="independent">Independent</ToggleGroupItem>
            <ToggleGroupItem value="atlas">Shared atlas</ToggleGroupItem>
            <ToggleGroupItem value="target">Target lens</ToggleGroupItem>
            <ToggleGroupItem value="dom">Original DOM</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div>
          <p className="mb-2 text-xs text-muted-foreground">Mounted surfaces</p>
          <ToggleGroup
            type="single"
            value={count}
            onValueChange={(value) => {
              if (value && !running) setCount(value);
            }}
            disabled={running}
            aria-label="Mounted surfaces"
          >
            {[3, 5, 8].map((value) => (
              <ToggleGroupItem key={value} value={String(value)}>
                {value}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div>
          <p className="mb-2 text-xs text-muted-foreground">
            Active surface limit
          </p>
          <ToggleGroup
            type="single"
            value={limit}
            onValueChange={(value) => {
              if (value && !running) setLimit(value);
            }}
            disabled={running}
            aria-label="Active surface limit"
          >
            {[3, 5].map((value) => (
              <ToggleGroupItem key={value} value={String(value)}>
                {value}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div>
          <p className="mb-2 text-xs text-muted-foreground">Contour</p>
          <ToggleGroup
            type="single"
            value={localLens ? "round" : contour}
            disabled={running || localLens}
            onValueChange={(value) => {
              if (value) setContour(value as "round" | "squircle");
            }}
            aria-label="Contour"
          >
            <ToggleGroupItem value="round">Round</ToggleGroupItem>
            <ToggleGroupItem value="squircle">Squircle</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div>
          <p className="mb-2 text-xs text-muted-foreground">Rim light</p>
          <ToggleGroup
            type="single"
            value={colorBleed}
            disabled={running}
            onValueChange={(value) => {
              if (value) setColorBleed(value);
            }}
            aria-label="Rim light"
          >
            <ToggleGroupItem value="neutral">Neutral</ToggleGroupItem>
            <ToggleGroupItem value="source">Source color</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
      <GlassSettingsProvider
        surface="clear"
        config={GLASS_DEFAULT_PARAMS}
        optics={{ colorBleed: colorBleed === "source" ? 0.75 : 0 }}
        performance={{ maxActiveSurfaces: Number(limit), frameRate: 30 }}
      >
        <div ref={stage} data-testid="performance-stage">
          <GlassScene
            key={backend}
            sourceRef={scene}
            frameRate={30}
            className="relative overflow-hidden rounded-[20px]"
            style={{ height: 480 }}
            content={
              <div className="absolute inset-0">
                <SceneBackdrop priority />
                <div
                  ref={marker}
                  className="absolute top-[calc(50%-90px)] left-1/2 size-12 bg-[#007aff]"
                />
                <div className="absolute bottom-4 left-4 flex gap-4 text-sm">
                  {["Scene text", "Live content", "Refraction"].map((text) => (
                    <span key={text}>{text}</span>
                  ))}
                </div>
              </div>
            }
          >
            {backend === "atlas" ? (
              <GlassAtlas className="h-[480px]">{surfaces}</GlassAtlas>
            ) : (
              surfaces
            )}
          </GlassScene>
        </div>
      </GlassSettingsProvider>
      <GlassButton disabled={running} onClick={run} className="self-start">
        {running ? "Measuring…" : "Run benchmark"}
      </GlassButton>
      <p className="text-xs leading-5 text-muted-foreground">
        120 animation frames over{" "}
        {localLens
          ? backend === "dom"
            ? "the original track DOM"
            : "an explicit track target"
          : "a moving DOM source"}
        . This measures this browser and machine; it does not certify a device’s
        GPU performance.
      </p>
      <pre
        data-testid="glass-performance-result"
        aria-live="polite"
        className="overflow-auto text-xs leading-6"
      >
        {result
          ? JSON.stringify(result, null, 2)
          : "Run a measurement to see the result."}
      </pre>
    </div>
  );
}
