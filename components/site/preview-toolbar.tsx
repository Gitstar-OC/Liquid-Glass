"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GlassSlider } from "@/components/glass/glass-slider";
import { BackdropPicker } from "@/components/site/preview-controls";
import type { DEMO_PHOTOS } from "@/lib/demo-assets";

/** Every preview uses the same detached toolbar and dimensions. */
export function PreviewToolbar({
  photo = "dunes",
  onPhotoChange,
  blur = 0,
  onBlurChange,
  label,
  href,
  backgroundControls,
  blurControl,
}: {
  photo?: keyof typeof DEMO_PHOTOS;
  onPhotoChange?: (value: keyof typeof DEMO_PHOTOS) => void;
  blur?: number;
  onBlurChange?: (value: number) => void;
  label: string;
  href?: string;
  backgroundControls?: ReactNode;
  blurControl?: ReactNode;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex flex-wrap items-center gap-4">
        {backgroundControls ?? (onPhotoChange && (
          <BackdropPicker
            value={photo}
            onValueChange={onPhotoChange}
            label={`${label} backdrop`}
          />
        ))}
        {blurControl === undefined ? (onBlurChange && (
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">Blur</span>
            <GlassSlider
              aria-label={`${label} blur`}
              min={0}
              max={20}
              step={0.25}
              value={[blur]}
              onValueChange={([next]) => onBlurChange(next)}
              className="w-24"
            />
            <output className="w-10 text-right tabular-nums">
              {Number(blur.toFixed(2))}px
            </output>
          </div>
        )) : (
          blurControl
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex h-10 items-center gap-1.5 text-muted-foreground hover:text-foreground"
        >
          Source <ArrowUpRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}
