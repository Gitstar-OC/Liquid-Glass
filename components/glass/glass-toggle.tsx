"use client";

import * as React from "react";
import {
  GlassSurface,
  useWithinGlassSurface,
} from "@/components/glass/glass-surface";
import { cn } from "@/lib/utils";
import { Toggle, toggleVariants } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { GlassSelectionIndicator, useGlassSelection } from "@/components/glass/glass-selection";

export function GlassToggle({
  className,
  variant = "default",
  size = "default",
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof Toggle>) {
  const within = useWithinGlassSurface();
  const classes = cn(
    toggleVariants({ variant, size }),
    "h-10 rounded-[12px] px-4 hover:bg-foreground/4 data-[state=on]:bg-foreground/9 aria-pressed:bg-foreground/9",
    within ? "border-0 bg-transparent shadow-none" : "glass-chip",
    className,
  );
  if (!within)
    return (
      <Toggle
        variant={variant}
        size={size}
        {...props}
        asChild
        className={classes}
      >
        <GlassSurface asChild shadow={false}>
          {asChild ? children : <button type="button">{children}</button>}
        </GlassSurface>
      </Toggle>
    );
  return (
    <Toggle
      variant={variant}
      size={size}
      {...props}
      asChild={asChild}
      className={classes}
    >
      {children}
    </Toggle>
  );
}

export function GlassToggleGroup({
  className, liquid = false, children,
  ...props
}: React.ComponentProps<typeof ToggleGroup> & { liquid?: boolean }) {
  const ref = useGlassSelection(liquid && props.type === "single");
  return <ToggleGroup {...props} ref={ref} data-liquid-selection={liquid || undefined} className={cn(liquid && "relative isolate", className)}>{liquid && <GlassSelectionIndicator/>}{children}</ToggleGroup>;
}

export function GlassToggleGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroupItem>) {
  const within = useWithinGlassSurface();
  return (
    <ToggleGroupItem
      {...props}
      className={cn(
        "relative z-1 h-10 rounded-[12px] px-4 hover:bg-foreground/4 data-[state=on]:bg-foreground/9 aria-pressed:bg-foreground/9",
        within ? "border-0 bg-transparent shadow-none" : "glass-chip",
        className,
      )}
    />
  );
}
