"use client";

import { useEffect, useRef, useState } from "react";
import { GlassSurface } from "@/components/glass/glass-surface";
import { GlassIcon } from "@/components/glass/glass-icons";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipProvider, GlassTooltipContent } from "@/components/glass/glass-tooltip";

export function GlassElasticButton({className}: {className?: string}) {
  const [held, setHeld] = useState(false), [pull, setPull] = useState({x: 0, y: 0});
  const [settling, setSettling] = useState(false);
  const gesture = useRef<{pointer: number; x: number; y: number} | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null), frame = useRef(0);
  const pending = useRef({x: 0, y: 0});
  const currentPull = useRef(pull);
  const updatePull = (next: {x: number; y: number}) => {currentPull.current = next;setPull(next);};
  const reset = () => { if (timer.current) clearTimeout(timer.current); timer.current = null; cancelAnimationFrame(frame.current); frame.current = 0; gesture.current = null; setHeld(false);setSettling(false);updatePull({x: 0, y: 0}); };
  const release = () => {
    if (!gesture.current) {reset();return;}
    const from = currentPull.current;
    reset();
    if (Math.hypot(from.x,from.y) < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setSettling(true); updatePull(from);
    const start = performance.now(); let previous = 0;
    const tick = (now: number) => {
      const t = Math.min(1,(now-start)/420);
      if (t === 1) {frame.current=0;setSettling(false);updatePull({x:0,y:0});return;}
      if (now-previous >= 30) {const spring = Math.exp(-7*t)*Math.cos(8*t); updatePull({x:Math.round(from.x*spring),y:Math.round(from.y*spring)});previous=now;}
      frame.current=requestAnimationFrame(tick);
    };
    frame.current=requestAnimationFrame(tick);
  };
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); cancelAnimationFrame(frame.current); }, []);
  const active = held || settling;
  return <TooltipProvider delayDuration={300}><Tooltip><TooltipTrigger asChild><GlassSurface asChild radius={999} config={{depth: active ? 100 : 48, splay: active ? 8 : 3, feather: active ? 28 : 18, ...(active ? {blur: .5} : {})}} deformation={active ? pull : undefined} priority={active ? 5 : 0}>
    <button type="button" aria-label="Pull glass" data-elastic-held={held} data-elastic-settling={settling}
      className={cn("glass-elastic-button relative flex h-12 touch-none items-center justify-center gap-2 px-4 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-(--glass-action)", className)}
      style={{transform: active ? `translate(${pull.x * .25}px,${pull.y * .25}px) scale(${held ? 1.04 : 1})` : undefined}}
      onPointerDown={event => { if(event.button !== 0) return; reset(); gesture.current = {pointer: event.pointerId, x: event.clientX, y: event.clientY}; event.currentTarget.setPointerCapture(event.pointerId); timer.current = setTimeout(() => {timer.current = null; setHeld(true);}, 160); }}
      onPointerMove={event => { const g = gesture.current; if (!held || !g || g.pointer !== event.pointerId || matchMedia("(prefers-reduced-motion: reduce)").matches) return; const quantize = (v: number) => Math.round(Math.max(-48,Math.min(48,v)) / 2) * 2; pending.current = {x: quantize(event.clientX-g.x), y: quantize(event.clientY-g.y)}; if(!frame.current) frame.current = requestAnimationFrame(() => {frame.current = 0; updatePull(pending.current);}); }}
      onPointerUp={release} onPointerCancel={reset} onLostPointerCapture={() => {if(gesture.current)reset();}} onBlur={reset}
      onKeyDown={event => {if(event.key === "Escape") reset(); if(event.key === " " || event.key === "Enter") {event.preventDefault();setHeld(true);}}} onKeyUp={reset}>
      <GlassIcon name="wave" className="size-4"/>Pull glass
    </button>
  </GlassSurface></TooltipTrigger><GlassTooltipContent side="top">Hold and drag to bend the scene</GlassTooltipContent></Tooltip></TooltipProvider>;
}
