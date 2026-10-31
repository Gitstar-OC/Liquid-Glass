"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassPanel } from "@/components/glass/glass-panel";

export function GlassDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/15 duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 motion-reduce:duration-75",
        className,
      )}
      {...props}
    />
  );
}

export function GlassDialogContent({
  className,
  children,
  showCloseButton = true,
  surface,
  container,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  container?: HTMLElement | null;
  showCloseButton?: boolean;
  surface?: import("@/lib/glass-theme").GlassSurface;
}) {
  return (
    <DialogPortal container={container}>
      <GlassDialogOverlay
        className={container ? "absolute rounded-[20px]" : undefined}
      />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "glass-dialog-motion fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 text-sm outline-none sm:max-w-sm",
          container && "absolute",
          className,
        )}
        {...props}
      >
        <GlassPanel
          kind="dialog" radius={28} shape="squircle"
          lensParameters={{ scale: 0.025, depth: 10, magnification: 1.04, blur: surface === "thick" ? 12 : surface === "frosted" ? 8 : 6 }}
          className={cn("grid gap-5 p-6", showCloseButton && "[&_[data-slot=dialog-title]]:pr-8")}
        >
          {children}
          {showCloseButton && (
            <DialogPrimitive.Close
              data-slot="dialog-close"
              className="absolute top-1 right-1 grid size-10 place-items-center rounded-full opacity-60 transition-opacity hover:bg-foreground/6 hover:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <XIcon className="size-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          )}
        </GlassPanel>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

function DialogPortal(
  props: React.ComponentProps<typeof DialogPrimitive.Portal>,
) {
  return <DialogPrimitive.Portal {...props} />;
}
