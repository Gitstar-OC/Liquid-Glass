"use client";

import * as React from "react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import { GlassPanel, type GlassPanelProps } from "@/components/glass/glass-panel";
import type { GlassSurface as GlassSurfaceKind } from "@/lib/glass-theme";
import type { LensParams } from "@/lib/glass";

const CONTENT_BASE =
  "z-50 max-w-(--radix-dropdown-menu-content-available-width) min-w-40 origin-(--radix-dropdown-menu-content-transform-origin) outline-none";

export function GlassDropdownMenuContent({
  className,
  sideOffset = 8,
  align = "start",
  collisionPadding = 16,
  surface,
  config,
  container,
  material = "surface",
  radius = 18,
  shape = "squircle",
  lensParameters,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content> & {
  surface?: GlassSurfaceKind;
  /** Local material overrides; the menu still uses its bounded scene. */
  config?: Partial<LensParams>;
  container?: HTMLElement | null;
  /** External optics can filter original DOM while this keeps native semantics. */
  material?: "surface" | "external";
} & Pick<GlassPanelProps, "radius" | "shape" | "lensParameters">) {
  const viewport = (
    <div
      data-glass-menu-viewport=""
      className="max-h-[max(48px,calc(var(--radix-dropdown-menu-content-available-height,100dvh)_-_16px))] overflow-x-hidden overflow-y-auto overscroll-contain p-1.5"
    >
      {children}
    </div>
  );
  return (
    <DropdownMenuPrimitive.Portal container={container}>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        align={align}
        collisionPadding={collisionPadding}
        className={cn(
          CONTENT_BASE,
          material === "surface" && "glass-bubble-motion",
          material === "external" && "glass-menu-panel",
          className,
        )}
        {...props}
      >
        {material === "external" ? (
          viewport
        ) : (
          <GlassPanel
            kind="dropdown"
            radius={radius} shape={shape}
            lensParameters={{ ...(surface === "frosted" ? { blur: 8 } : {}), ...(config?.blur === undefined ? {} : { blur: config.blur }), ...lensParameters }}
            className="glass-menu-panel w-full"
          >
            {viewport}
          </GlassPanel>
        )}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  );
}

export function GlassDropdownMenuSubContent({
  className,
  surface,
  radius = 18,
  shape = "squircle",
  lensParameters,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent> & {
  surface?: GlassSurfaceKind;
} & Pick<GlassPanelProps, "radius" | "shape" | "lensParameters">) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.SubContent
        data-slot="dropdown-menu-sub-content"
        collisionPadding={16}
        sideOffset={8}
        className={cn(CONTENT_BASE, "glass-bubble-motion", className)}
        {...props}
      >
        <GlassPanel
          kind="dropdown"
          radius={radius} shape={shape}
          lensParameters={{ ...(surface === "frosted" ? { blur: 8 } : {}), ...lensParameters }}
          className="glass-menu-panel w-full"
        >
          <div
            data-glass-menu-viewport=""
            className="max-h-[max(48px,calc(var(--radix-dropdown-menu-content-available-height,100dvh)_-_16px))] overflow-x-hidden overflow-y-auto overscroll-contain p-1.5"
          >
            {children}
          </div>
        </GlassPanel>
      </DropdownMenuPrimitive.SubContent>
    </DropdownMenuPrimitive.Portal>
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
