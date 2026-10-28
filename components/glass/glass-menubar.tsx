"use client";

import * as React from "react";
import { Menubar as MenubarPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import { GlassSurface } from "@/components/glass/glass-surface";
import type { GlassSurface as GlassSurfaceKind } from "@/lib/glass-theme";

export function GlassMenubar({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Root>) {
  return (
    <MenubarPrimitive.Root
      data-slot="menubar"
      {...props}
      className={cn(
        "glass-chip flex h-8 items-center gap-0.5 rounded-xl p-[3px]",
        className,
      )}
    />
  );
}

export function GlassMenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  surface,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Content> & {
  surface?: GlassSurfaceKind;
}) {
  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-40 origin-(--radix-menubar-content-transform-origin) duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
          className,
        )}
        {...props}
      >
        <GlassSurface kind="menubar" surface={surface} className="w-full p-1">
          {children}
        </GlassSurface>
      </MenubarPrimitive.Content>
    </MenubarPrimitive.Portal>
  );
}

export function GlassMenubarSubContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubContent>) {
  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.SubContent
        data-slot="menubar-sub-content"
        className={cn(
          "z-50 min-w-40 origin-(--radix-menubar-content-transform-origin) duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
          className,
        )}
        {...props}
      >
        <GlassSurface kind="menubar" className="w-full p-1">
          {children}
        </GlassSurface>
      </MenubarPrimitive.SubContent>
    </MenubarPrimitive.Portal>
  );
}

export {
  MenubarMenu,
  MenubarTrigger,
  MenubarGroup,
  MenubarPortal,
  MenubarRadioGroup,
  MenubarItem,
  MenubarCheckboxItem,
  MenubarRadioItem,
  MenubarLabel,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubTrigger,
} from "@/components/ui/menubar";
