"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "radix-ui";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassSurface } from "@/components/glass/glass-surface";
import type { GlassSurface as GlassSurfaceKind } from "@/lib/glass-theme";

export function GlassSelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default";
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      {...props}
      className={cn(
        "glass-chip flex w-fit items-center justify-between gap-1.5 rounded-[12px] py-2 pr-3 pl-3 text-sm whitespace-nowrap text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-10 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="pointer-events-none size-4 opacity-60" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function GlassSelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "sticky top-0 z-10 flex cursor-default items-center justify-center bg-popover py-1 text-popover-foreground [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpButton>
  );
}

function GlassSelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "sticky bottom-0 z-10 flex cursor-default items-center justify-center bg-popover py-1 text-popover-foreground [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownButton>
  );
}

export function GlassSelectContent({
  className,
  children,
  position = "item-aligned",
  align = "center",
  surface,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content> & {
  surface?: GlassSurfaceKind;
}) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        data-align-trigger={position === "item-aligned"}
        className={cn(
          "relative z-50 max-h-(--radix-select-content-available-height) min-w-40 origin-(--radix-select-content-transform-origin) duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className,
        )}
        position={position}
        align={align}
        {...props}
      >
        <GlassSurface kind="select" surface={surface} className="w-full">
          {/*
            The glass root is `overflow-hidden isolate`, so the panel cannot
            scroll on its own — the list has to scroll inside it, and the
            scroll affordances have to carry their own opaque backdrop or they
            read as icons floating over the glass.
          */}
          <div className="max-h-(--radix-select-content-available-height) overflow-x-hidden overflow-y-auto overscroll-contain p-1">
            <GlassSelectScrollUpButton />
            <SelectPrimitive.Viewport
              data-position={position}
              className="data-[position=popper]:h-(--radix-select-trigger-height) data-[position=popper]:w-full data-[position=popper]:min-w-(--radix-select-trigger-width)"
            >
              {children}
            </SelectPrimitive.Viewport>
            <GlassSelectScrollDownButton />
          </div>
        </GlassSurface>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectItem,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select";

export { GlassSelectScrollUpButton, GlassSelectScrollDownButton };
