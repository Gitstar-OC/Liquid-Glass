"use client";

import * as React from "react";
import { HoverCard as HoverCardPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import { GlassPanel, type GlassPanelProps } from "@/components/glass/glass-panel";

export function GlassHoverCardContent({
  className,
  align = "center",
  sideOffset = 6,
  children,
  radius = 20,
  shape = "squircle",
  beak = false,
  lensParameters,
  container,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content> &
  Pick<GlassPanelProps, "radius" | "shape" | "beak" | "lensParameters"> & {
    container?: HTMLElement | null;
  }) {
  return (
    <HoverCardPrimitive.Portal container={container}>
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "glass-bubble-motion z-50 w-64 origin-(--radix-hover-card-content-transform-origin) outline-hidden",
          className,
        )}
        {...props}
      >
        <GlassPanel kind="hover-card" radius={radius} shape={shape} beak={beak}
          lensParameters={lensParameters} className="w-full p-4 text-sm">
          {children}
        </GlassPanel>
        {beak && <HoverCardPrimitive.Arrow data-glass-beak-anchor="" width={14} height={5} opacity={0} aria-hidden="true" />}
      </HoverCardPrimitive.Content>
    </HoverCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardTrigger } from "@/components/ui/hover-card";
