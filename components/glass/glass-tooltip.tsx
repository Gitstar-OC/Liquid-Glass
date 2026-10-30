"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import { GlassPanel, type GlassPanelProps } from "@/components/glass/glass-panel";

/**
 * Compact bubbles: one continuous contour, with or without a joined pointer.
 */
export function GlassTooltipContent({
  className,
  sideOffset = 6,
  children,
  variant = "plain",
  radius = 13,
  shape = "round",
  lensParameters,
  container,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> &
  Pick<GlassPanelProps, "radius" | "shape" | "lensParameters"> & {
    variant?: "plain" | "beak";
    container?: HTMLElement | null;
  }) {
  return (
    <TooltipPrimitive.Portal container={container}>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "glass-tooltip-motion z-50 inline-flex w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) items-center gap-1.5",
          className,
        )}
        {...props}
      >
        <GlassPanel kind="tooltip" radius={radius} shape={shape} beak={variant === "beak"}
          lensParameters={lensParameters} className="px-3 py-1 text-xs leading-[18px] font-medium">
          {children}
        </GlassPanel>
        {variant === "beak" && <TooltipPrimitive.Arrow data-glass-beak-anchor="" width={14} height={5} opacity={0} aria-hidden="true" />}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export {
  Tooltip,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
