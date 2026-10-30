"use client";

import * as React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useGlassScene } from "@/components/glass-scene";
import {
  GlassSurface,
  useWithinGlassSurface,
} from "@/components/glass/glass-surface";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
export type GlassButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "variant"
> & {
  variant?:
    ButtonVariant | "core" | "primary" | "glass" | "glass-strong" | "accent";
  shape?: "default" | "pill" | "circle";
  rendering?: "auto" | "shared";
  /** Own the optical layer so press scaling includes the glass and its glint. */
  composite?: boolean;
  /** A deliberate press reveals the lens. Release, blur, and cancellation restore it. */
  liquidOnHold?: boolean;
};

export function GlassButton({
  className,
  variant = "core",
  type = "button",
  shape = "pill",
  size = "default",
  rendering = "auto",
  liquidOnHold = false,
  composite = true,
  children,
  asChild,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onLostPointerCapture,
  onKeyDown,
  onKeyUp,
  onBlur,
  ...props
}: GlassButtonProps) {
  const scene = useGlassScene();
  const within = useWithinGlassSurface();
  const [held, setHeld] = React.useState(false);
  const [pointerMotion, setPointerMotion] = React.useState(true);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const release = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setHeld(false);
  };
  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [props.disabled],
  );
  // Disabling during a gesture must not revive the held state when re-enabled.
  if (props.disabled && held) setHeld(false);
  const active = liquidOnHold && held && !props.disabled;
  const primary = variant === "primary" || variant === "accent";
  const bare = variant === "ghost" || variant === "link";
  const secondary = variant === "secondary";
  const core = !primary && !bare && !secondary;
  const refract = Boolean(scene && !within && rendering === "auto" && core);
  const classes = cn(
    "relative isolate h-10 select-text text-[13px] font-semibold tracking-[-.015em] text-foreground transition-[background-color,scale,transform] duration-150 ease-(--ease-out) hover:bg-foreground/4 active:bg-foreground/7 active:scale-[.97] motion-reduce:transform-none motion-reduce:active:scale-100",
    shape === "circle"
      ? "size-11 shrink-0 rounded-full p-0"
      : shape === "pill"
        ? "rounded-full px-5"
        : "rounded-xl px-4",
    size === "xs" && "h-6 px-2 text-xs",
    size === "sm" && "h-8 px-3 text-xs",
    size === "lg" && "h-11 px-6",
    size === "icon" && "size-9 p-0",
    size === "icon-xs" && "size-6 p-0",
    size === "icon-sm" && "size-8 p-0",
    size === "icon-lg" && "size-10 p-0",
    !refract && core && !within && "glass-chip",
    within && core && "glass-inline-action",
    (variant === "glass-strong" ||
      variant === "default" ||
      (secondary && !refract)) &&
      "glass-emphasis",
    secondary && "glass-plain-action",
    primary &&
      "glass-accent text-white hover:bg-(--glass-action) active:bg-(--glass-action)",
    bare && "border-0 bg-transparent shadow-none",
    variant === "link" && "underline-offset-4 hover:underline",
    variant === "destructive" && "text-destructive",
    "aria-pressed:bg-foreground/12",
    liquidOnHold && "glass-hold-button",
    className,
  );
  const handlers = {
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
      setPointerMotion(true);
      onPointerDown?.(event);
      if (
        !liquidOnHold ||
        props.disabled ||
        event.defaultPrevented ||
        event.button !== 0
      )
        return;
      release();
      event.currentTarget.setPointerCapture?.(event.pointerId);
      timer.current = setTimeout(() => {
        timer.current = null;
        setHeld(true);
      }, 180);
    },
    onPointerUp: (event: React.PointerEvent<HTMLButtonElement>) => {
      release();
      onPointerUp?.(event);
    },
    onPointerCancel: (event: React.PointerEvent<HTMLButtonElement>) => {
      release();
      onPointerCancel?.(event);
    },
    onLostPointerCapture: (event: React.PointerEvent<HTMLButtonElement>) => {
      release();
      onLostPointerCapture?.(event);
    },
    onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => {
      setPointerMotion(false);
      onKeyDown?.(event);
      if (event.key === "Escape") release();
      if (
        liquidOnHold &&
        !props.disabled &&
        !event.defaultPrevented &&
        (event.key === " " || event.key === "Enter")
      )
        setHeld(true);
    },
    onKeyUp: (event: React.KeyboardEvent<HTMLButtonElement>) => {
      release();
      onKeyUp?.(event);
    },
    onBlur: (event: React.FocusEvent<HTMLButtonElement>) => {
      release();
      onBlur?.(event);
    },
  };
  return (
    <Button
      variant="ghost"
      size={null}
      type={type}
      {...props}
      {...handlers}
      data-glass-button={
        primary ? "primary" : secondary ? "secondary" : bare ? "bare" : "core"
      }
      data-input-modality={pointerMotion ? "pointer" : "keyboard"}
      data-liquid-held={active}
      asChild={refract || asChild}
      className={classes}
    >
      {refract ? (
        <GlassSurface
          kind="card"
          radius={shape === "default" ? 12 : 999}
          asChild
          composite={composite}
          rendering={liquidOnHold && !active ? "shared" : "auto"}
          priority={active ? 5 : 0}
        >
          {asChild ? children : <button type={type}>{children}</button>}
        </GlassSurface>
      ) : (
        children
      )}
    </Button>
  );
}
