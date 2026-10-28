"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  BLACK_INK,
  WHITE_INK,
  sampleBackdrop,
  sampleFromLuminance,
  type ContrastSample,
} from "@/lib/contrast";

export interface UseAdaptiveContrastOptions {
  /** Enable sampling. Fixed-theme consumers can opt out. */
  enabled?: boolean;
  /** Keep a chosen ink while computing the readability protection it needs. */
  tone?: "light" | "dark";
  /** The original DOM source used by the refraction engine. */
  source?: React.RefObject<HTMLElement | null>;
  /** Re-measure continuously (for animated backdrops). */
  live?: boolean;
  /** Minimum ms between live measurements. */
  interval?: number;
  /** Pixels per row and column sampled across the target region. */
  resolution?: number;
  tintColor?: string;
  tintBlendMode?: string;
  brightness?: number;
  contrast?: number;
  saturate?: number;
  tintOpacity?: number;
  /** Used before measurement and when pixels are unavailable. */
  fallback?: ContrastSample;
}

/**
 * Measures the backdrop behind `ref` and resolves the ink color that reads
 * best against it. Static elements re-measure on scroll/resize; `live`
 * elements also poll on an animation frame (for moving backgrounds/canvas).
 */
export function useAdaptiveContrast(
  ref: React.RefObject<HTMLElement | null>,
  {
    enabled = true,
    tone,
    source,
    live = false,
    interval = 240,
    resolution = 3,
    tintColor,
    tintOpacity = 0,
    tintBlendMode,
    brightness,
    contrast,
    saturate,
    fallback,
  }: UseAdaptiveContrastOptions = {},
): ContrastSample {
  const initial = fallback ?? sampleFromLuminance(0.02, 0);
  const [sample, setSample] = React.useState<ContrastSample>(initial);
  const previous = React.useRef<ContrastSample>(initial);

  React.useEffect(() => {
    const el = ref.current;
    if (!enabled || !el || typeof window === "undefined") return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let frame = 0;
    let visible = true;
    let disposed = false;
    const delay = Math.max(100, interval);
    const measure = () => {
      if (disposed || !visible || document.hidden) return;
      const options = {
        source: source?.current,
        resolution,
        tone,
        tintColor,
        tintOpacity,
        tintBlendMode,
        brightness,
        contrast,
        saturate,
      };
      let next = sampleBackdrop(el, options);
      const prev = previous.current;
      // Hysteresis must also recompute the protection for the retained ink.
      if (
        !tone &&
        next.samples &&
        prev.samples &&
        prev.tone !== next.tone &&
        next.contrast < next.rejectedContrast + 0.7
      ) {
        next = sampleBackdrop(el, { ...options, tone: prev.tone });
      }
      previous.current = next;
      setSample((value) =>
        value.tone === next.tone &&
        value.samples === next.samples &&
        value.inherited === next.inherited &&
        value.scrimOpacity === next.scrimOpacity &&
        Math.abs(value.luminance - next.luminance) < 0.008 &&
        Math.abs(value.contrast - next.contrast) < 0.08
          ? value
          : next,
      );
    };
    const tick = () => {
      measure();
      if (live && visible && !document.hidden && !disposed)
        timer = setTimeout(tick, delay);
    };
    const queue = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const restart = () => {
      clearTimeout(timer);
      tick();
    };
    const onLoad=(event:Event)=>{
      if(event.target instanceof Element && event.target.closest("[data-glass-mirror-host],[data-glass-mirror]"))return;
      queue();
    };
    const position=typeof MutationObserver!=="undefined" ? new MutationObserver(queue) : null;
    position?.observe(el,{attributes:true,attributeFilter:["style","class"]});
    const mutations =
      typeof MutationObserver !== "undefined"
        ? new MutationObserver((records) => {
            if (
              records.every(
                (record) =>
                  record.target === el ||
                  el.contains(record.target as Node) ||
                  (record.target instanceof Element &&
                    record.target.closest("[data-glass-mirror-host]")),
              )
            )
              return;
            queue();
          })
        : null;
    mutations?.observe(source?.current ?? document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["class", "style", "src", "srcset", "hidden"],
    });
    const resize =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(queue) : null;
    resize?.observe(el);
    if (source?.current) resize?.observe(source.current);
    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            restart();
          })
        : null;
    observer?.observe(el);
    window.addEventListener("scroll", queue, { passive: true, capture: true });
    window.addEventListener("resize", queue);
    document.addEventListener("load", onLoad, true);
    document.addEventListener("visibilitychange", restart);
    tick();
    return () => {
      disposed = true;
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      observer?.disconnect();
      resize?.disconnect();
      mutations?.disconnect();
      position?.disconnect();
      window.removeEventListener("scroll", queue, true);
      window.removeEventListener("resize", queue);
      document.removeEventListener("load", onLoad, true);
      document.removeEventListener("visibilitychange", restart);
    };
  }, [
    ref,
    enabled,
    tone,
    source,
    live,
    interval,
    resolution,
    tintColor,
    tintOpacity,
    tintBlendMode,
    brightness,
    contrast,
    saturate,
  ]);

  return !enabled || (sample.samples === 0 && !sample.inherited)
    ? initial
    : sample;
}

export interface AdaptiveTextProps extends React.HTMLAttributes<HTMLElement> {
  as?: keyof React.JSX.IntrinsicElements;
  live?: boolean;
  interval?: number;
  /** Add a soft outline halo when sampled ink falls below 4.5:1. */
  halo?: boolean | "auto";
  /** Add a local adaptive scrim when neither ink reaches 4.5:1. */
  backplate?: boolean | "auto";
}

/**
 * Text whose color follows the contrast of whatever is behind it.
 * Renders a plain element and swaps between light/dark ink automatically.
 */
export function AdaptiveText({
  as = "span",
  live = false,
  interval,
  halo = "auto",
  backplate = "auto",
  className,
  style,
  children,
  ...rest
}: AdaptiveTextProps) {
  const ref = React.useRef<HTMLElement | null>(null);
  const sample = useAdaptiveContrast(ref, { live, interval });
  const Tag = as as React.ElementType;
  const ink = sample.tone === "light" ? WHITE_INK : BLACK_INK;
  const showBackplate =
    backplate === true || (backplate === "auto" && sample.contrast < 4.5);
  const showHalo = halo === true || (halo === "auto" && sample.contrast < 4.5);

  return (
    <Tag
      {...rest}
      ref={ref}
      data-adaptive-tone={sample.tone}
      data-adaptive-contrast={sample.contrast.toFixed(2)}
      className={cn("adaptive-ink", className)}
      style={{
        color: ink,
        display: showBackplate ? "inline-block" : undefined,
        maxWidth: showBackplate ? "100%" : undefined,
        padding: showBackplate ? "0.18em 0.48em" : undefined,
        borderRadius: showBackplate ? "0.7em" : undefined,
        border: showBackplate
          ? sample.tone === "light"
            ? "1px solid rgba(255,255,255,0.18)"
            : "1px solid rgba(0,0,0,0.12)"
          : undefined,
        backgroundColor: showBackplate
          ? sample.tone === "light"
            ? "rgba(7, 9, 13, 0.9)"
            : "rgba(255, 255, 255, 0.92)"
          : undefined,
        backdropFilter: showBackplate ? "blur(12px)" : undefined,
        WebkitBackdropFilter: showBackplate ? "blur(12px)" : undefined,
        boxShadow: showBackplate
          ? sample.tone === "light"
            ? "0 8px 30px rgba(0,0,0,0.2)"
            : "0 8px 30px rgba(0,0,0,0.12)"
          : undefined,
        textShadow: showHalo
          ? sample.tone === "light"
            ? "0 1px 2px rgba(0,0,0,0.6)"
            : "0 1px 2px rgba(255,255,255,0.55)"
          : undefined,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
