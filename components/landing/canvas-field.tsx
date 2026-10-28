"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface Blob {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  color: string;
}

export interface CanvasFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  palette?: string[];
  base?: string;
  speed?: number;
  blobCount?: number;
  /** Pause the animation (still paints one frame). */
  paused?: boolean;
  /** Fires after every painted frame — handy for contrast probes. */
  onFrame?: () => void;
}

const DEFAULT_PALETTE = ["#ffd166", "#5eead4", "#8ab4ff", "#f0a6ff", "#ff8f6b"];

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full =
    h.length === 3 ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2] : h.padEnd(6, "0");
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Animated field of drifting light blobs painted to a real <canvas>. Because
 * it is a canvas, the adaptive-contrast sampler can read exact pixels from it.
 */
export function CanvasField({
  palette = DEFAULT_PALETTE,
  base = "#05060b",
  speed = 1,
  blobCount,
  paused = false,
  onFrame,
  className,
  ...rest
}: CanvasFieldProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const pausedRef = React.useRef(paused);
  const frameRef = React.useRef(onFrame);

  React.useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  React.useEffect(() => {
    frameRef.current = onFrame;
  }, [onFrame]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const count = blobCount ?? Math.max(4, Math.round(palette.length * 1.4));
    const blobs: Blob[] = Array.from({ length: count }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.22 + Math.random() * 0.3,
      vx: (Math.random() - 0.5) * 0.00035 * speed,
      vy: (Math.random() - 0.5) * 0.00035 * speed,
      color: palette[i % palette.length],
    }));

    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    const paint = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = "lighter";
      const min = Math.min(width, height);
      for (const blob of blobs) {
        const cx = blob.x * width;
        const cy = blob.y * height;
        const radius = blob.r * min;
        const [r, g, b] = hexToRgb(blob.color);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.92)`);
        grad.addColorStop(0.45, `rgba(${r}, ${g}, ${b}, 0.35)`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      frameRef.current?.();
    };

    const step = () => {
      for (const blob of blobs) {
        blob.x += blob.vx;
        blob.y += blob.vy;
        if (blob.x < -0.3) blob.x = 1.3;
        if (blob.x > 1.3) blob.x = -0.3;
        if (blob.y < -0.3) blob.y = 1.3;
        if (blob.y > 1.3) blob.y = -0.3;
      }
    };

    let raf = 0;
    let visible = true;
    let last = 0;

    const loop = (time: number) => {
      if (!pausedRef.current && visible && time - last > 26) {
        last = time;
        step();
        paint();
      }
      raf = requestAnimationFrame(loop);
    };

    resize();
    paint();

    const ro = new ResizeObserver(() => {
      resize();
      paint();
    });
    ro.observe(host);

    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
          })
        : null;
    io?.observe(host);

    if (!reduce) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io?.disconnect();
    };
  }, [palette, base, speed, blobCount]);

  return (
    <div ref={hostRef} className={cn("absolute inset-0 overflow-hidden", className)} {...rest}>
      <canvas ref={canvasRef} aria-hidden="true" className="h-full w-full" />
    </div>
  );
}
