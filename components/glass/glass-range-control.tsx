"use client";

import { GlassIcon } from "@/components/glass/glass-icons";
import { GlassSurface, type GlassSurfaceProps } from "@/components/glass/glass-surface";
import { GlassSlider } from "@/components/glass/glass-slider";
import { cn } from "@/lib/utils";

export interface GlassRangeControlProps extends Omit<GlassSurfaceProps, "children" | "onChange" | "defaultValue"> {
  label?: string;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  kindOfControl?: "sound" | "brightness";
  disabled?: boolean;
  sliderTone?: "neutral" | "accent";
}

/** A compact, labelled range capsule. Nested instances share their panel's optics. */
export function GlassRangeControl({
  label = "Sound", value, defaultValue = 65, onValueChange,
  kindOfControl = "sound", sliderTone = "neutral", disabled, className, radius = 20, ...surfaceProps
}: GlassRangeControlProps) {

  return (
    <GlassSurface {...surfaceProps} radius={radius} className={cn("glass-range-control w-full px-4 pt-3 pb-2", className)}>
      <p className="text-xs font-semibold leading-4">{label}</p>
      <div className="flex items-center gap-3">
        <GlassIcon name={kindOfControl === "brightness" ? "sun" : value === 0 ? "muted" : "quiet"} className="size-3.5 shrink-0 opacity-65" />
        <GlassSlider
          aria-label={label} appearance="hud" tone={sliderTone} disabled={disabled}
          value={value === undefined ? undefined : [value]}
          defaultValue={[defaultValue]} onValueChange={([next]) => onValueChange?.(next)}
        />
        <GlassIcon name={kindOfControl === "brightness" ? "sun" : "speaker"} className="size-4 shrink-0 opacity-85" />
      </div>
    </GlassSurface>
  );
}
