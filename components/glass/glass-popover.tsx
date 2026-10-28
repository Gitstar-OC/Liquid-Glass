"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import { GlassSurface } from "@/components/glass/glass-surface";
import type { GlassSurface as GlassSurfaceKind } from "@/lib/glass-theme";

export function GlassPopoverContent({
  className,
  align = "center",
  sideOffset = 6,
  surface,
  children,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & {
  surface?: GlassSurfaceKind;
}) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 origin-(--radix-popover-content-transform-origin) outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className,
        )}
        {...props}
      >
        <GlassSurface
          kind="popover"
          surface={surface}
          className="flex w-full flex-col gap-3 p-3 text-sm"
        >
          {children}
        </GlassSurface>
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
