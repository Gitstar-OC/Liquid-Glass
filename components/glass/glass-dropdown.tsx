"use client";

import * as React from "react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import { GlassSurface } from "@/components/glass/glass-surface";
import type { GlassSurface as GlassSurfaceKind } from "@/lib/glass-theme";
import type { LensParams } from "@/lib/glass";
import { useGlassTheme } from "@/components/glass/glass-theme-provider";

const CONTENT_BASE =
  "z-50 overflow-clip max-h-(--radix-dropdown-menu-content-available-height) max-w-(--radix-dropdown-menu-content-available-width) min-w-40 origin-(--radix-dropdown-menu-content-transform-origin) outline-none duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 motion-reduce:animate-none";
const CONTENT_SCALE = "data-open:zoom-in-[.98] data-closed:zoom-out-[.98]";

export function GlassDropdownMenuContent({
  className,
  sideOffset = 8,
  align = "start",
  collisionPadding = 16,
  surface,
  config,
  container,
  material = "surface",
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content> & {
  surface?: GlassSurfaceKind;
  /** Local material overrides; the menu still uses its bounded scene. */
  config?: Partial<LensParams>;
  container?: HTMLElement | null;
  /** External optics can filter original DOM while this keeps native semantics. */
  material?: "surface" | "external";
}) {
  const { resolvedMode } = useGlassTheme();
  const viewport = (
    <div
      data-glass-menu-viewport=""
      className="max-h-(--radix-dropdown-menu-content-available-height) overflow-x-hidden overflow-y-auto overscroll-contain p-1.5"
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
          material === "surface" && CONTENT_SCALE,
          material === "external" && "glass-menu-panel",
          className,
        )}
        {...props}
      >
        {material === "external" ? (
          viewport
        ) : (
          <GlassSurface
            kind="dropdown"
            radius={18}
            tintBlendMode="normal"
            surface={surface}
            config={{
              blur: 16,
              glint: 20,
              depth: 0,
              tint: resolvedMode === "dark" ? 0.72 : 0.82,
              tintColor: resolvedMode === "dark" ? "#202126" : "#f0f0f3",
              ...config,
            }}
            className="glass-menu-panel w-full"
          >
            {viewport}
          </GlassSurface>
        )}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  );
}

export function GlassDropdownMenuSubContent({
  className,
  surface,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent> & {
  surface?: GlassSurfaceKind;
}) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.SubContent
        data-slot="dropdown-menu-sub-content"
        collisionPadding={16}
        sideOffset={8}
        className={cn(CONTENT_BASE, CONTENT_SCALE, className)}
        {...props}
      >
        <GlassSurface
          kind="dropdown"
          radius={18}
          surface={surface}
          className="glass-menu-panel w-full"
        >
          <div
            data-glass-menu-viewport=""
            className="max-h-(--radix-dropdown-menu-content-available-height) overflow-x-hidden overflow-y-auto overscroll-contain p-1.5"
          >
            {children}
          </div>
        </GlassSurface>
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
