"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Dialog as DialogPrimitive } from "radix-ui";
import { SearchIcon, ArrowUp, ArrowDown, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassSurface } from "@/components/glass/glass-surface";
import { Dialog, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useGlassTheme } from "@/components/glass/glass-theme-provider";

export function GlassCommand({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      {...props}
      className={cn(
        "glass-command flex w-full min-w-0 flex-col overflow-hidden",
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
    <div data-slot="command-input-wrapper">
      <div
        data-slot="input-group"
        className="flex h-12 items-center gap-3 px-5"
      >
        <SearchIcon
          aria-hidden="true"
          className="size-[18px] shrink-0 opacity-55"
        />
        <CommandPrimitive.Input
          data-slot="command-input"
          // cmdk renders a bare <input>; without a name the control is
          // announced as an unlabelled text field by screen readers.
          aria-label="Command"
          className={cn(
            "h-full min-w-0 flex-1 bg-transparent text-base placeholder:text-foreground/45 outline-none disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          {...props}
        />
      </div>
      <Separator className="bg-foreground/10" />
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
  onCloseAutoFocus?: React.ComponentProps<
    typeof DialogPrimitive.Content
  >["onCloseAutoFocus"];
}) {
  const { resolvedMode } = useGlassTheme();
  return (
    <Dialog {...props}>
      <DialogPrimitive.Portal container={container}>
        <DialogPrimitive.Overlay
          className={cn(
            "glass-command-overlay fixed inset-0 z-50 bg-black/20 backdrop-blur-xl",
            container && "absolute",
          )}
        />
        <DialogPrimitive.Content
          onCloseAutoFocus={onCloseAutoFocus}
          className={cn(
            "glass-command-dialog fixed top-[clamp(24px,14svh,128px)] left-1/2 z-50 w-[calc(100%-2rem)] max-w-[640px] -translate-x-1/2 outline-none",
            container && "absolute",
          )}
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <DialogDescription className="sr-only">
            {description}
          </DialogDescription>
          <GlassSurface
            kind="command"
            radius={24}
            surface={surface}
            config={{
              blur: 24,
              tint: resolvedMode === "dark" ? 0.62 : 0.5,
              tintColor: resolvedMode === "dark" ? "#2a2b2e" : "#ffffff",
              ...config,
            }}
            tintBlendMode="normal"
            className={cn("overflow-hidden", className)}
          >
            {children}
          </GlassSurface>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}

/** Shared footer keeps command palettes aligned across docs and examples. */
export function GlassCommandFooter() {
  return (
    <>
      <Separator className="bg-foreground/10" />
      <div className="flex h-11 shrink-0 items-center justify-between gap-3 px-4 text-[11px] text-foreground/55">
        <span className="flex items-center gap-1">
          <ArrowUp aria-hidden="true" className="size-3" />
          <ArrowDown aria-hidden="true" className="size-3" />
          <span className="ml-1">Navigate</span>
        </span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <CornerDownLeft aria-hidden="true" className="size-3" />
            Open
          </span>
          <span className="hidden items-center gap-1.5 sm:flex">
            <kbd className="font-sans text-[10px]">esc</kbd>Close
          </span>
        </span>
      </div>
    </>
  );
}

export function GlassCommandItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      {...props}
      data-slot="command-item"
      className={cn(
        "relative flex min-h-11 cursor-default items-center gap-3 rounded-xl px-3 py-2 text-[13px] outline-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-40 data-selected:bg-foreground/8 [&_svg]:shrink-0",
        className,
      )}
    >
      {children}
    </CommandPrimitive.Item>
  );
}

export {
  CommandList as GlassCommandList,
  CommandEmpty as GlassCommandEmpty,
  CommandGroup as GlassCommandGroup,
  CommandSeparator as GlassCommandSeparator,
  CommandShortcut as GlassCommandShortcut,
} from "@/components/ui/command";
