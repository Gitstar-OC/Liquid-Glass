"use client";

import {
  GlassSurface,
  type GlassSurfaceProps,
} from "@/components/glass/glass-surface";
import {
  GlassButton,
  type GlassButtonProps,
} from "@/components/glass/glass-button";
import {
  GlassTooltipContent,
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/glass/glass-tooltip";
import { cn } from "@/lib/utils";

/** A single optical surface; app controls and tooltips retain their own semantics. */
export function GlassDock({
  children,
  className,
  ...props
}: GlassSurfaceProps) {
  return (
    <TooltipProvider delayDuration={250} skipDelayDuration={300}>
      <GlassSurface
        as="nav"
        kind="navbar"
        shape="round"
        radius={22}
        aria-label="Dock"
        {...props}
        className={cn("flex w-fit items-center gap-2 p-2.5", className)}
      >
        {children}
      </GlassSurface>
    </TooltipProvider>
  );
}
export function GlassDockItem({
  label,
  children,
  className,
  ...props
}: GlassButtonProps & { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <GlassButton
          variant="ghost"
          shape="default"
          aria-label={label}
          {...props}
          className={cn(
            "size-12 rounded-[13px] p-0 transition-transform duration-150 ease-(--ease-out) [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-1 motion-reduce:transform-none",
            className,
          )}
        >
          {children}
        </GlassButton>
      </TooltipTrigger>
      <GlassTooltipContent side="top" sideOffset={12}>
        {label}
      </GlassTooltipContent>
    </Tooltip>
  );
}
