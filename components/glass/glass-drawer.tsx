"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "@/lib/utils";
import { Drawer as BaseDrawer } from "@/components/ui/drawer";
import { GlassPanel, type GlassPanelProps } from "@/components/glass/glass-panel";

export function GlassDrawerContent({
  className,
  children,
  surface,
  config,
  container,
  radius = 28,
  shape = "squircle",
  lensParameters,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content> & {
  container?: HTMLElement | null;
  surface?: import("@/lib/glass-theme").GlassSurface;
  config?: Partial<import("@/lib/glass").LensParams>;
} & Pick<GlassPanelProps, "radius" | "shape" | "lensParameters">) {
  return (
    <DrawerPrimitive.Portal container={container} data-slot="drawer-portal">
      <DrawerPrimitive.Overlay
        data-slot="drawer-overlay"
        className={cn(
          "fixed inset-0 z-50 bg-black/15",
          container && "absolute rounded-[20px]",
        )}
      />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          "group/drawer-content fixed z-50 flex h-auto flex-col text-sm outline-none data-[vaul-drawer-direction=bottom]:inset-x-3 data-[vaul-drawer-direction=bottom]:bottom-3 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=left]:sm:max-w-sm data-[vaul-drawer-direction=right]:sm:max-w-sm",
          container && "absolute",
          className,
        )}
        {...props}
      >
        <GlassPanel
          kind="drawer"
          radius={radius} shape={shape}
          lensParameters={{ ...(surface === "thick" ? { blur: 12 } : {}), ...(config?.blur === undefined ? {} : { blur: config.blur }), ...lensParameters }}
          className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-5 p-6"
        >
          <div className="mx-auto -mt-2 mb-1 hidden h-1 w-10 shrink-0 rounded-full bg-foreground/25 group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
          {children}
        </GlassPanel>
      </DrawerPrimitive.Content>
    </DrawerPrimitive.Portal>
  );
}

export {
  DrawerTrigger,
  DrawerClose,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

export function Drawer(props: React.ComponentProps<typeof BaseDrawer>) {
  return <BaseDrawer autoFocus {...props} />;
}
