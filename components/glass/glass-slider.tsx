"use client";

import * as React from "react";
import { Slider as SliderPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

export function GlassSlider({
  className, appearance = "line", tone = "neutral", value, defaultValue,
  min = 0, max = 100, onPointerDown, onPointerUp, onPointerCancel, onLostPointerCapture, onKeyDown, onKeyUp, onBlur, ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & {
  appearance?: "line" | "well" | "hud";
  tone?: "neutral" | "accent";
}) {
  const [pointerMotion, setPointerMotion] = React.useState(true);
  const [pressed, setPressed] = React.useState(false);
  const values = value ?? defaultValue ?? [min];
  return (
    <SliderPrimitive.Root data-slot="slider" data-appearance={appearance} data-liquid-pressed={pressed && !props.disabled} data-input-modality={pointerMotion ? "pointer" : "keyboard"}
      onPointerDown={event=>{setPointerMotion(true);if(!props.disabled)setPressed(true);onPointerDown?.(event);}}
      onPointerUp={event=>{setPressed(false);onPointerUp?.(event);}}
      onPointerCancel={event=>{setPressed(false);onPointerCancel?.(event);}}
      onLostPointerCapture={event=>{setPressed(false);onLostPointerCapture?.(event);}}
      onKeyDown={event=>{setPointerMotion(false);setPressed(false);onKeyDown?.(event);}}
      onKeyUp={event=>{setPressed(false);onKeyUp?.(event);}}
      onBlur={event=>{setPressed(false);onBlur?.(event);}}
      value={value} defaultValue={value === undefined ? (defaultValue ?? [min]) : undefined}
      min={min} max={max}
      className={cn("group/slider relative flex min-h-8 w-full touch-none items-center data-disabled:opacity-35 data-vertical:h-full data-vertical:min-h-32 data-vertical:w-8 data-vertical:flex-col", className)} {...props}>
      <SliderPrimitive.Track data-slot="slider-track" className={cn(
        "relative grow overflow-hidden rounded-full bg-foreground/18 data-horizontal:h-1 data-horizontal:w-full data-vertical:h-full data-vertical:w-1",
        appearance === "well" && "glass-inset data-horizontal:h-7 data-vertical:w-7",
      )}>
        <SliderPrimitive.Range data-slot="slider-range" className={cn(
          "absolute rounded-full data-horizontal:h-full data-vertical:w-full",
          tone === "accent" ? "bg-(--glass-action)" : "bg-foreground/90",
          appearance === "well" && "opacity-75",
        )} />
      </SliderPrimitive.Track>
      {values.map((_, index) => (
        <SliderPrimitive.Thumb key={index} data-slot="slider-thumb"
          aria-label={props["aria-label"] ?? (values.length > 1 ? `Value ${index + 1}` : "Value")}
          aria-labelledby={props["aria-labelledby"]}
          style={{"--slider-thumb-fill": tone === "accent" ? "#ffffff" : "var(--foreground)"} as React.CSSProperties}
          className={cn(
            "relative block h-3.5 w-[18px] shrink-0 rounded-[6px] border-0 outline-none transition-[transform,opacity] duration-200 ease-(--ease-out) after:absolute after:-inset-3 focus-visible:ring-2 focus-visible:ring-(--glass-action) focus-visible:ring-offset-2 focus-visible:ring-offset-transparent glass-slider-thumb motion-reduce:transform-none disabled:pointer-events-none",
            appearance === "well" && "h-6 w-3",
          )} />
      ))}
    </SliderPrimitive.Root>
  );
}
