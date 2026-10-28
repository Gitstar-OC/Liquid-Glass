"use client";

import * as React from "react";
import { Dialog as SheetPrimitive } from "radix-ui";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassSurface } from "@/components/glass/glass-surface";

export function GlassSheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  surface,
  container,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  container?: HTMLElement | null;
  side?: "top" | "right" | "bottom" | "left";
  showCloseButton?: boolean;
  surface?: import("@/lib/glass-theme").GlassSurface;
}) {
  return (
    <SheetPrimitive.Portal data-slot="sheet-portal" container={container}>
      <SheetPrimitive.Overlay
        data-slot="sheet-overlay"
        className={cn(
          "fixed inset-0 z-50 bg-black/20 duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
          container && "absolute",
        )}
      />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-50 flex flex-col gap-4 text-sm transition duration-200 ease-in-out data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-[side=bottom]:data-open:slide-in-from-bottom-10 data-[side=left]:data-open:slide-in-from-left-10 data-[side=right]:data-open:slide-in-from-right-10 data-[side=top]:data-open:slide-in-from-top-10 data-closed:animate-out data-closed:fade-out-0 data-[side=bottom]:data-closed:slide-out-to-bottom-10 data-[side=left]:data-closed:slide-out-to-left-10 data-[side=right]:data-closed:slide-out-to-right-10 data-[side=top]:data-closed:slide-out-to-top-10",
          container && "absolute",
          className,
        )}
        {...props}
      >
        <GlassSurface
          kind="sheet"
          surface={surface}
          className="flex h-full w-full flex-col gap-4 p-4"
        >
          {children}
          {showCloseButton && (
            <SheetPrimitive.Close
              data-slot="sheet-close"
              className="absolute top-3 right-3 grid size-7 place-items-center rounded-lg opacity-60 transition-opacity hover:bg-foreground/10 hover:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <XIcon className="size-4" />
              <span className="sr-only">Close</span>
            </SheetPrimitive.Close>
          )}
        </GlassSurface>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
