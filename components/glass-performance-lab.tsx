"use client";

import { useEffect, useRef, useState } from "react";
import { GlassAtlas } from "@/components/glass-atlas";
import { GlassScene, GlassSettingsProvider } from "@/components/glass-scene";
import { GlassSurface } from "@/components/glass/glass-surface";
import { GlassButton } from "@/components/glass/glass-button";
import { GlassToggleGroup as ToggleGroup, GlassToggleGroupItem as ToggleGroupItem } from "@/components/glass/glass-toggle";
import { SceneBackdrop } from "@/components/site/scene-backdrop";
import { invalidateGlassScene } from "@/lib/glass-scene";
import { GLASS_DEFAULT_PARAMS } from "@/lib/glass";

export function GlassPerformanceLab() {
  const [backend, setBackend] = useState("independent");
  const [count, setCount] = useState("3");
  const [limit, setLimit] = useState("5");
  const [contour,setContour]=useState<"round"|"squircle">("round");
  const [colorBleed,setColorBleed]=useState("source");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const scene = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const marker = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  const run = () => {
    if (running) return;
    setRunning(true);
    setResult(null);
    const samples: number[] = [];
    const originalSurfaces = () => [...(stage.current?.querySelectorAll<HTMLElement>("[data-liquid-glass]") ?? [])].filter(node => !node.closest("[data-glass-mirror]"));
    const paints = () => originalSurfaces().reduce((sum,node) => sum + Number(node.querySelector<HTMLElement>("[data-lens-layer]")?.dataset.glassFilterPaints ?? 0),0);
    const startPaints = paints();
    let previous = 0;
    const tick = (time: number) => {
      if (document.hidden) { previous = 0; frame.current = requestAnimationFrame(tick); return; }
      if (previous) samples.push(time - previous);
      previous = time;
      if (marker.current) marker.current.style.transform = `translateX(${Math.sin(time / 500) * 180}px)`;
      invalidateGlassScene(scene.current, { target: marker.current ?? undefined, immediate: true });
      if (samples.length < 120) { frame.current = requestAnimationFrame(tick); return; }
      samples.sort((a,b) => a-b);
      const surfaces = originalSurfaces();
      setResult({ renderer: backend, contour, atlasSetupMs: stage.current?.querySelector<HTMLElement>("[data-glass-atlas]")?.dataset.atlasTextureMs ?? null, composited: surfaces.filter(node=>node.dataset.refraction === "scene-atlas" && node.dataset.glassRendering === "composited").length, mounted: Number(count), requestedLimit: Number(limit), viewport: `${innerWidth}×${innerHeight}`, active: surfaces.filter(node => (node.dataset.refraction === "scene-svg" || (node.dataset.refraction === "scene-atlas" && node.dataset.glassRendering === "active"))).length,
        colorBleed: colorBleed==="source"?.75:0,
        mirrors: surfaces.reduce((sum,node)=>sum+node.querySelectorAll("[data-glass-mirror]").length,0),
        mirroredNodes: surfaces.reduce((sum,node)=>sum+node.querySelectorAll("[data-glass-mirror] *").length,0),
        filterPaintsDuringRun: paints() - startPaints,
        medianFrameMs: Number(samples[60].toFixed(2)), p95FrameMs: Number(samples[114].toFixed(2)), maxFrameMs: Number(samples[119].toFixed(2)), framesOver25ms: samples.filter(value=>value>25).length,
      });
      setRunning(false);
    };
    frame.current = requestAnimationFrame(tick);
  };
  const surfaces = <div className="absolute inset-0 grid grid-cols-3 content-center gap-3 p-4 sm:grid-cols-4 sm:gap-5 sm:p-8">{Array.from({length:Number(count)},(_,index)=><GlassSurface key={index} adaptiveBackdrop={false} shape={contour} ink="dark" className="flex h-28 items-center justify-center p-3 text-sm">Surface {index+1}</GlassSurface>)}</div>;
  return <div className="flex flex-col gap-6">
    <div className="flex flex-wrap items-center gap-6">
      <div><p className="mb-2 text-xs text-muted-foreground">Renderer</p><ToggleGroup type="single" value={backend} disabled={running} onValueChange={value=>{if(value&&!running)setBackend(value);}} aria-label="Renderer"><ToggleGroupItem value="independent">Independent</ToggleGroupItem><ToggleGroupItem value="atlas">Shared atlas</ToggleGroupItem></ToggleGroup></div>
      <div><p className="mb-2 text-xs text-muted-foreground">Mounted surfaces</p><ToggleGroup type="single" value={count} onValueChange={value=>{if(value&&!running)setCount(value);}} disabled={running} aria-label="Mounted surfaces">{[3,5,8].map(value=><ToggleGroupItem key={value} value={String(value)}>{value}</ToggleGroupItem>)}</ToggleGroup></div>
      <div><p className="mb-2 text-xs text-muted-foreground">Active surface limit</p><ToggleGroup type="single" value={limit} onValueChange={value=>{if(value&&!running)setLimit(value);}} disabled={running} aria-label="Active surface limit">{[3,5].map(value=><ToggleGroupItem key={value} value={String(value)}>{value}</ToggleGroupItem>)}</ToggleGroup></div>
      <div><p className="mb-2 text-xs text-muted-foreground">Contour</p><ToggleGroup type="single" value={contour} disabled={running} onValueChange={value=>{if(value)setContour(value as "round"|"squircle");}} aria-label="Contour"><ToggleGroupItem value="round">Round</ToggleGroupItem><ToggleGroupItem value="squircle">Squircle</ToggleGroupItem></ToggleGroup></div>
      <div><p className="mb-2 text-xs text-muted-foreground">Rim light</p><ToggleGroup type="single" value={colorBleed} disabled={running} onValueChange={value=>{if(value)setColorBleed(value);}} aria-label="Rim light"><ToggleGroupItem value="neutral">Neutral</ToggleGroupItem><ToggleGroupItem value="source">Source color</ToggleGroupItem></ToggleGroup></div>
      <GlassButton disabled={running} onClick={run}>{running ? "Measuring…" : "Run benchmark"}</GlassButton>
    </div>
    <GlassSettingsProvider surface="clear" config={GLASS_DEFAULT_PARAMS} optics={{colorBleed:colorBleed==="source"?.75:0}} performance={{ maxActiveSurfaces: Number(limit), frameRate: 30 }}>
      <div ref={stage} data-testid="performance-stage"><GlassScene key={backend} sourceRef={scene} frameRate={30} className="relative overflow-hidden rounded-[20px]" style={{height:480}}
        content={<div className="absolute inset-0"><SceneBackdrop priority /><div ref={marker} className="absolute top-0 left-1/2 h-full w-12 bg-foreground/10" /><div className="absolute bottom-4 left-4 flex gap-4 text-sm">{["Scene text","Live content","Refraction"].map(text=><span key={text}>{text}</span>)}</div></div>}>
        {backend === "atlas" ? <GlassAtlas className="h-[480px]">{surfaces}</GlassAtlas> : surfaces}
      </GlassScene></div>
    </GlassSettingsProvider>
    <p className="text-xs leading-5 text-muted-foreground">120 animation frames over a moving DOM source. This measures this browser and machine; it does not certify a device’s GPU performance.</p>
    <pre data-testid="glass-performance-result" aria-live="polite" className="overflow-auto text-xs leading-6">{result ? JSON.stringify(result,null,2) : "Run a measurement to see the result."}</pre>
  </div>;
}
