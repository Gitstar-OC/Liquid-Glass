"use client";

import * as React from "react";
import { ContextMenu as ContextMenuPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import { GlassSurface } from "@/components/glass/glass-surface";
import type { GlassSurface as GlassSurfaceKind } from "@/lib/glass-theme";

export function GlassContextMenuContent({
  className,
  surface,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content> & {
  surface?: GlassSurfaceKind;
}) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        className={cn(
          "z-50 max-h-(--radix-context-menu-content-available-height) min-w-40 origin-(--radix-context-menu-content-transform-origin) duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className,
        )}
        {...props}
      >
        <GlassSurface
          kind="context-menu"
          surface={surface}
          className="w-full p-1"
        >
          {children}
        </GlassSurface>
      </ContextMenuPrimitive.Content>
    </ContextMenuPrimitive.Portal>
  );
}

export function GlassContextMenuSubContent({
  className,
  surface,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubContent> & {
  surface?: GlassSurfaceKind;
}) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.SubContent
        data-slot="context-menu-sub-content"
        className={cn(
          "z-50 min-w-40 origin-(--radix-context-menu-content-transform-origin) duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className,
        )}
        {...props}
      >
        <GlassSurface
          kind="context-menu"
          surface={surface}
          className="w-full p-1"
        >
          {children}
        </GlassSurface>
      </ContextMenuPrimitive.SubContent>
    </ContextMenuPrimitive.Portal>
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";
