"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import { GlassPanel, type GlassPanelProps } from "@/components/glass/glass-panel";
import type { GlassSurface as GlassSurfaceKind } from "@/lib/glass-theme";

export function GlassPopoverContent({
  className,
  align = "center",
  sideOffset = 6,
  surface,
  radius = 22,
  shape = "squircle",
  beak = false,
  lensParameters,
  container,
  children,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & {
  surface?: GlassSurfaceKind;
  container?: HTMLElement | null;
} & Pick<GlassPanelProps, "radius" | "shape" | "beak" | "lensParameters">) {
  return (
    <PopoverPrimitive.Portal container={container}>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "glass-bubble-motion z-50 w-72 max-w-(--radix-popover-content-available-width) origin-(--radix-popover-content-transform-origin) outline-hidden",
          className,
        )}
        {...props}
      >
        <GlassPanel
          kind="popover"
          radius={radius} shape={shape} beak={beak}
          lensParameters={{ ...(surface === "frosted" ? { blur: 8 } : surface === "thick" ? { blur: 12 } : {}), ...lensParameters }}
          className="flex w-full flex-col gap-3 p-4 text-sm"
        >
          <div data-glass-panel-viewport="" className="flex max-h-[max(48px,calc(var(--radix-popover-content-available-height,100dvh)_-_32px))] flex-col gap-3 overflow-y-auto overscroll-contain">{children}</div>
        </GlassPanel>
        {beak && <PopoverPrimitive.Arrow data-glass-beak-anchor="" width={14} height={5} opacity={0} aria-hidden="true" />}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}

export {
  Popover,
  PopoverTrigger,
  PopoverAnchor,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from "@/components/ui/popover";
