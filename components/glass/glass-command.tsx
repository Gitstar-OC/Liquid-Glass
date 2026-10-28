"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Dialog as DialogPrimitive } from "radix-ui";
import { SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassSurface } from "@/components/glass/glass-surface";
import { Dialog, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export function GlassCommand({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      {...props}
      className={cn(
        "flex size-full flex-col overflow-hidden rounded-xl p-1",
        className,
      )}
    />
  );
}

export function GlassCommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div data-slot="command-input-wrapper" className="p-1 pb-0">
      <div
        data-slot="input-group"
        className="flex h-12 items-center gap-3 border-b border-foreground/10 px-3"
      >
        <SearchIcon aria-hidden="true" className="size-4 shrink-0 opacity-50" />
        <CommandPrimitive.Input
          data-slot="command-input"
          // cmdk renders a bare <input>; without a name the control is
          // announced as an unlabelled text field by screen readers.
          aria-label="Command"
          className={cn(
            "w-full bg-transparent text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          {...props}
        />
      </div>
    </div>
  );
}

export function GlassCommandDialog({
  title = "Search",
  description = "Find a command or component.",
  children,
  className,
  surface,
  config,
  container,
  onCloseAutoFocus,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root> & {
  title?: string;
  description?: string;
  className?: string;
  surface?: import("@/lib/glass-theme").GlassSurface;
  config?: Partial<import("@/lib/glass").LensParams>;
  container?: HTMLElement | null;
  onCloseAutoFocus?: React.ComponentProps<typeof DialogPrimitive.Content>["onCloseAutoFocus"];
}) {
  return (
    <Dialog {...props}>
      <DialogPrimitive.Portal container={container}>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/15 backdrop-blur-[6px]",
            container && "absolute rounded-[20px]",
          )}
        />
        <DialogPrimitive.Content
          onCloseAutoFocus={onCloseAutoFocus}
          className={cn(
            "fixed top-[32%] left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 outline-none",
            container && "absolute top-1/2",
          )}
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <DialogDescription className="sr-only">
            {description}
          </DialogDescription>
          <GlassSurface
            kind="command"
            surface={surface}
            config={config}
            className={cn("overflow-hidden p-2", className)}
          >
            {children}
          </GlassSurface>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}

export {
  CommandList as GlassCommandList,
  CommandEmpty as GlassCommandEmpty,
  CommandGroup as GlassCommandGroup,
  CommandSeparator as GlassCommandSeparator,
  CommandItem as GlassCommandItem,
  CommandShortcut as GlassCommandShortcut,
} from "@/components/ui/command";
