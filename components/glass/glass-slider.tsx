"use client";

import * as React from "react";
import { Slider as SliderPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import { GlassLens } from "@/components/glass/glass-target-lens";
import {
  CONTROL_LENS_PRESETS,
  resolveControlLens,
  type ControlLensParameters,
} from "@/lib/glass-lens-optics";

/** Shared, bounded optical track for controls and the control-lens playground. */
export function GlassSliderSource({
  start = 0,
  end = 0.5,
  vertical = false,
  inset = 0,
  thickness = 6,
  magnification = CONTROL_LENS_PRESETS.slider.magnification,
  color = "var(--glass-action,#006de5)",
  background = "var(--glass-lens-plane,var(--background))",
  dimmed = false,
  children,
}: {
  start?: number;
  end?: number;
  vertical?: boolean;
  inset?: number;
  thickness?: number;
  magnification?: number;
  color?: string;
  background?: string;
  dimmed?: boolean;
  children?: React.ReactNode;
}) {
  const a = Math.max(0, Math.min(1, start)),
    b = Math.max(a, Math.min(1, end)),
    size = thickness * magnification;
  return (
    <div data-slider-optical-source="" style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: -128, background }} />
      <div
        style={{
          position: "absolute",
          borderRadius: 999,
          background: "color-mix(in oklab,var(--foreground) 18%,transparent)",
          overflow: "hidden",
          ...(vertical
            ? { top: inset, bottom: inset, left: "50%", width: size, transform: "translateX(-50%)" }
            : { left: inset, right: inset, top: "50%", height: size, transform: "translateY(-50%)" }),
        }}
      >
        <div
          style={{
            position: "absolute",
            borderRadius: 999,
            background: color,
            opacity: dimmed ? 0.75 : 1,
            ...(vertical
              ? { left: 0, right: 0, top: `${a * 100}%`, height: `${(b - a) * 100}%` }
              : { top: 0, bottom: 0, left: `${a * 100}%`, width: `${(b - a) * 100}%` }),
          }}
        />
      </div>
      {children}
    </div>
  );
}

export function GlassSlider({
  className,
  appearance = "line",
  tone = "neutral",
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  orientation = "horizontal",
  inverted = false,
  dir,
  lensParameters,
  opticalIdle = false,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onLostPointerCapture,
  onKeyDown,
  onKeyUp,
  onBlur,
  onFocus,
  ref,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & {
  appearance?: "line" | "well" | "hud" | "lens";
  tone?: "neutral" | "accent";
  lensParameters?: Partial<ControlLensParameters>;
  /** Keep the active material visible for state previews. Normal controls use gestures. */
  opticalIdle?: boolean;
}) {
  const [local, setLocal] = React.useState(defaultValue ?? [min]);
  const values = value ?? local;
  const [pointerMotion, setPointerMotion] = React.useState(true);
  const [pressed, setPressed] = React.useState(false);
  if (props.disabled && pressed) setPressed(false);
  const [activeThumb, setActiveThumb] = React.useState(0);
  const [pull, setPull] = React.useState(0);
  const [pastCompletion, setPastCompletion] = React.useState(false);
  const gesture = React.useRef<{
    id: number;
    start: number;
    length: number;
    grab: number;
    pointer: number;
    completion: number | null;
  } | null>(null);
  const pullFrame = React.useRef(0);
  const pendingPull = React.useRef(0);
  const appliedPull = React.useRef(0);
  const [direction, setDirection] = React.useState(dir ?? "ltr");
  const root = React.useRef<HTMLSpanElement | null>(null);
  const vertical = orientation === "vertical";
  const reverse = vertical ? !inverted : (direction === "rtl") !== inverted;
  const position = (v: number) => {
    const progress =
      max > min ? Math.max(0, Math.min(1, (v - min) / (max - min))) : 0;
    return reverse ? 1 - progress : progress;
  };
  const endpoints = (values.length > 1 ? values : [min, ...values]).map(
    position,
  );
  const start = Math.min(...endpoints),
    end = Math.max(...endpoints);
  const visibleLens = appearance === "lens";
  const thumbWidth = visibleLens
    ? vertical
      ? 22
      : 44
    : appearance === "well"
      ? 12
      : 18;
  const thumbHeight = visibleLens
    ? vertical
      ? 44
      : 22
    : appearance === "well"
      ? 24
      : 14;
  const width = visibleLens ? (vertical ? 32 : 64) : thumbWidth * 1.33;
  const height = visibleLens ? (vertical ? 64 : 32) : thumbHeight * 1.33;
  const extension = vertical
    ? (height - thumbHeight) / 2
    : (width - thumbWidth) / 2;
  const trackInset = (vertical ? thumbHeight : thumbWidth) / 2;
  // Both rails span the native thumb's center-to-center travel. Shortening only
  // the optical copy displaced its fill; leaving both full-width separated the
  // fill endpoint from the thumb at low/high values. Keep the two identical.
  const sourceInset = extension + trackInset;
  const rail = appearance === "well" ? 28 : visibleLens ? 6 : 4;
  const magnification = visibleLens
    ? resolveControlLens({
        ...CONTROL_LENS_PRESETS.slider,
        ...lensParameters,
      }).magnification
    : 1;
  const fill =
    tone === "accent"
      ? "var(--glass-action,#006de5)"
      : "color-mix(in oklab,var(--foreground) 90%,transparent)";
  const stopPull = React.useCallback(() => {
    gesture.current = null;
    cancelAnimationFrame(pullFrame.current);
    pullFrame.current = 0;
    pendingPull.current = 0;
    appliedPull.current = 0;
    setPull(0);
    setPastCompletion(false);
    setPressed(false);
  }, []);
  React.useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) stopPull();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", stopPull);
    return () => {
      cancelAnimationFrame(pullFrame.current);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", stopPull);
    };
  }, [stopPull]);
  React.useEffect(() => {
    if (props.disabled) stopPull();
  }, [props.disabled, stopPull]);
  React.useLayoutEffect(() => {
    if (root.current)
      setDirection(
        dir ??
          (getComputedStyle(root.current).direction === "rtl" ? "rtl" : "ltr"),
      );
  }, [dir]);
  const target = (
    <GlassSliderSource
      start={start}
      end={end}
      vertical={vertical}
      inset={sourceInset}
      thickness={rail}
      magnification={magnification}
      color={fill}
      dimmed={appearance === "well"}
    />
  );
  return (
    <SliderPrimitive.Root
      {...props}
      ref={(node) => {
        root.current = node;
        if (typeof ref === "function") return ref(node);
        if (ref) ref.current = node;
      }}
      data-slot="slider"
      data-appearance={appearance}
      data-liquid-pressed={pressed && !props.disabled}
      data-input-modality={pointerMotion ? "pointer" : "keyboard"}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (event.button !== 0 || event.defaultPrevented || props.disabled)
          return;
        if (gesture.current && gesture.current.id !== event.pointerId) {
          event.preventDefault();
          return;
        }
        setPointerMotion(true);
        setPressed(true);
        const bounds = event.currentTarget.getBoundingClientRect();
        const progress = vertical
          ? (event.clientY - bounds.top) / Math.max(1, bounds.height)
          : (event.clientX - bounds.left) / Math.max(1, bounds.width);
        const closest = values.reduce(
          (best, v, index) =>
            Math.abs(position(v) - progress) <
            Math.abs(position(values[best]) - progress)
              ? index
              : best,
          0,
        );
        setActiveThumb(closest);
        const length = vertical ? bounds.height : bounds.width;
        const half = (vertical ? thumbHeight : thumbWidth) / 2;
        const center =
          half + position(values[closest]) * Math.max(0, length - half * 2);
        const target = event.target instanceof Element ? event.target : null;
        const coordinate = vertical ? event.clientY : event.clientX;
        setPastCompletion(false);
        gesture.current = {
          id: event.pointerId,
          start: vertical ? bounds.top : bounds.left,
          length,
          pointer: coordinate,
          completion: values.length === 1 && values[0] >= max ? coordinate : null,
          // Preserve the grabbed part of a thumb; grabbing its edge must not
          // jump the cap or generate a false elastic pull at an endpoint.
          grab: target?.closest('[data-slot="slider-thumb"]')
            ? progress * length - center
            : 0,
        };
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        const drag = gesture.current;
        if (
          !drag ||
          drag.id !== event.pointerId ||
          event.defaultPrevented ||
          props.disabled
        )
          return;
        const coordinate = vertical ? event.clientY : event.clientX;
        drag.pointer = coordinate;
        if (drag.completion !== null) {
          const extra = (coordinate - drag.completion) * (reverse ? -1 : 1);
          // Reaching max always reveals the complete rim, even after a large
          // pointer jump. Only a FURTHER deliberate pull returns to columns.
          // Hysteresis prevents input noise from flickering between finishes.
          setPastCompletion((wasPast) => extra > 14 ? true : extra < 8 ? false : wasPast);
        }
        const center = coordinate - drag.start - drag.grab;
        const clamped = Math.max(0, Math.min(drag.length, center));
        const excess = center - clamped;
        // Only the lens travels past the rail. Radix retains its native value,
        // limits, form state and keyboard behavior. Saturating resistance keeps
        // even a long drag to a small, reversible 12px pull.
        const limit = visibleLens ? 12 : 5;
        pendingPull.current =
          Math.sign(excess) *
          limit *
          (1 - Math.exp(-Math.abs(excess) / (limit * 2)));
        if (Math.abs(pendingPull.current - appliedPull.current) < 0.005)
          return;
        if (!pullFrame.current)
          pullFrame.current = requestAnimationFrame(() => {
            pullFrame.current = 0;
            appliedPull.current = pendingPull.current;
            setPull(pendingPull.current);
          });
      }}
      onPointerUp={(event) => {
        stopPull();
        onPointerUp?.(event);
      }}
      onPointerCancel={(event) => {
        stopPull();
        onPointerCancel?.(event);
      }}
      onLostPointerCapture={(event) => {
        stopPull();
        onLostPointerCapture?.(event);
      }}
      onKeyDown={(event) => {
        setPointerMotion(false);
        stopPull();
        onKeyDown?.(event);
      }}
      onKeyUp={(event) => {
        stopPull();
        onKeyUp?.(event);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) stopPull();
        onBlur?.(event);
      }}
      onFocus={(event) => {
        if (!gesture.current && event.target.matches(":focus-visible"))
          setPointerMotion(false);
        onFocus?.(event);
      }}
      onValueChange={(next) => {
        if (visibleLens && next.length === 1) {
          const drag = gesture.current;
          if (next[0] >= max) {
            if (drag && drag.completion === null) drag.completion = drag.pointer;
          } else if (drag) drag.completion = null;
          setPastCompletion(false);
        }
        if (value === undefined) setLocal(next);
        onValueChange?.(next);
      }}
      value={values}
      min={min}
      max={max}
      orientation={orientation}
      inverted={inverted}
      dir={dir}
      className={cn(
        "group/slider relative flex min-h-8 w-full touch-none items-center data-disabled:opacity-35 data-vertical:h-full data-vertical:min-h-32 data-vertical:flex-col",
        "isolate",
        visibleLens ? "data-vertical:w-16" : "data-vertical:w-8",
        className,
      )}
    >
      <div
        className={cn(
          "relative flex w-full grow items-center",
          vertical ? "h-full min-h-32 flex-col" : visibleLens ? "h-16" : "h-8",
        )}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          style={
            vertical
              ? { marginBlock: trackInset, height: `calc(100% - ${trackInset * 2}px)` }
              : { marginInline: trackInset, width: `calc(100% - ${trackInset * 2}px)` }
          }
          className={cn(
            "relative grow overflow-hidden rounded-full bg-foreground/18 data-horizontal:h-1 data-horizontal:w-full data-vertical:h-full data-vertical:w-1",
            "grow-0",
            appearance === "well" &&
              "glass-inset data-horizontal:h-7 data-vertical:w-7",
            visibleLens && "data-horizontal:h-[6px] data-vertical:w-[6px]",
          )}
        >
          <SliderPrimitive.Range
            data-slot="slider-range"
            className={cn(
              "absolute rounded-full data-horizontal:h-full data-vertical:w-full",
              tone === "accent" ? "bg-(--glass-action)" : "bg-foreground/90",
              appearance === "well" && "opacity-75",
            )}
          />
        </SliderPrimitive.Track>
        {values.map((v, index) => (
          <GlassLens
            key={index}
            style={{
              position: "absolute",
              zIndex: 2,
              pointerEvents: "none",
              inset: vertical ? `${-extension}px 0` : `0 ${-extension}px`,
            }}
            lens={{
              lensW: width,
              lensH: height,
              borderRadius: visibleLens ? 16 : 6,
            }}
            x={vertical ? 0.5 : position(v)}
            y={vertical ? position(v) : 0.5}
            offsetX={!vertical && activeThumb === index ? pull : 0}
            offsetY={vertical && activeThumb === index ? pull : 0}
            duration={pointerMotion && !pressed ? 180 : 0}
            motion="ease"
            refractionTarget={target}
            active={!props.disabled}
            engaged={opticalIdle || (pressed && activeThumb === index)}
            restScale={{ x: thumbWidth / width, y: thumbHeight / height }}
            parameters={{
              ...CONTROL_LENS_PRESETS.slider,
              ...(!visibleLens
                ? { depth: 4, rimStrength: 0.3, blur: 0, chroma: 0 }
                : {}),
              ...lensParameters,
              magnification: 1,
            }}
            rim={
              visibleLens && values.length === 1 && v >= max && !pastCompletion
                ? "dominant"
                : "column"
            }
          />
        ))}
      </div>
      {values.map((_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          data-slot="slider-thumb"
          data-liquid-active={
            opticalIdle || (pressed && !props.disabled && activeThumb === index)
          }
          data-lens-thumb={opticalIdle || activeThumb === index}
          aria-label={
            props["aria-label"] ??
            (values.length > 1 ? `Value ${index + 1}` : "Value")
          }
          aria-labelledby={props["aria-labelledby"]}
          style={
            {
              "--slider-thumb-fill":
                tone === "accent" || visibleLens
                  ? "#ffffff"
                  : "var(--foreground)",
              ...(visibleLens
                ? { width: thumbWidth, height: thumbHeight, borderRadius: 17 }
                : {}),
            } as React.CSSProperties
          }
          className={cn(
            "glass-slider-thumb relative block h-3.5 w-[18px] shrink-0 rounded-[6px] border-0 outline-none after:absolute after:-inset-3 disabled:pointer-events-none",
            appearance === "well" && "h-6 w-3",
          )}
        />
      ))}
    </SliderPrimitive.Root>
  );
}
