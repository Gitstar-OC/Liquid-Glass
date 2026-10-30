"use client";

import * as React from "react";
import {
  GlassSurface,
  useWithinGlassSurface,
} from "@/components/glass/glass-surface";
import { cn } from "@/lib/utils";
import { Toggle, toggleVariants } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { GlassSelection } from "@/components/glass/glass-selection";

export interface GlassToggleOption {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

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
  className,
  liquid = false,
  children,
  options,
  itemClassName,
  refractionTarget,
  opticalIdle = false,
  ...props
}: React.ComponentProps<typeof ToggleGroup> & {
  liquid?: boolean;
  /** Shorthand that builds both native options and their inert highlighted source. */
  options?: readonly GlassToggleOption[];
  itemClassName?: string;
  refractionTarget?: React.ReactNode;
  /** @deprecated A liquid single selection now stays glass at rest. */
  opticalIdle?: boolean;
}) {
  const optical = liquid && props.type === "single";
  const content = (option: GlassToggleOption) => (
    <>{option.icon}<span>{option.label}</span></>
  );
  const items = options?.map((option) => (
    <GlassToggleGroupItem
      key={option.value}
      value={option.value}
      disabled={option.disabled}
      className={itemClassName}
    >
      {content(option)}
    </GlassToggleGroupItem>
  )) ?? children;
  const target = refractionTarget ?? (options && (
    <div
      className="glass-options-source"
      data-orientation={props.orientation ?? "horizontal"}
    >
      {options.map((option) => (
        <span
          key={option.value}
          data-disabled={option.disabled || undefined}
          className={cn(
            toggleVariants({ variant: props.variant, size: props.size }),
            "glass-options-source-item h-10 shrink-0 rounded-[12px] px-4",
            props.spacing === 0 && "px-2",
            itemClassName,
          )}
        >
          {content(option)}
        </span>
      ))}
    </div>
  ));
  return (
    <ToggleGroup
      {...props}
      data-liquid-selection={optical || undefined}
      className={cn(optical && "relative isolate", className)}
    >
      {optical ? (
        <GlassSelection
          refractionTarget={target}
          opticalIdle={opticalIdle}
        >
          {items}
        </GlassSelection>
      ) : (
        items
      )}
    </ToggleGroup>
  );
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
        "relative z-1 h-10 rounded-[12px] px-4 hover:bg-foreground/4 data-[state=on]:bg-foreground/9 aria-pressed:bg-foreground/9 focus-visible:z-3",
        within ? "border-0 bg-transparent shadow-none" : "glass-chip",
        className,
      )}
    />
  );
}
