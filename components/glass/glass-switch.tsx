"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import {
  GlassSurface,
  useWithinGlassSurface,
} from "@/components/glass/glass-surface";

export function GlassSwitch({
  className,
  size = "default",
  onKeyDown,
  onPointerDown,
  onPointerUp, onPointerCancel, onLostPointerCapture, onBlur,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default";
}) {
  const within = useWithinGlassSurface();
  const [pointerMotion, setPointerMotion] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  if (props.disabled && pressed) setPressed(false);
  const settle = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const clear = () => { if (settle.current) clearTimeout(settle.current); settle.current = null; setPressed(false); };
  React.useEffect(() => () => { if (settle.current) clearTimeout(settle.current); }, [props.disabled]);
  const release = () => { if (settle.current) clearTimeout(settle.current); settle.current = setTimeout(() => { settle.current = null; setPressed(false); }, 300); };
  const control = (
    <SwitchPrimitive.Root
      {...props}
      onKeyDown={event=>{clear();setPointerMotion(false);onKeyDown?.(event);}}
      onPointerDown={event=>{onPointerDown?.(event);if(event.button!==0||event.defaultPrevented||props.disabled)return;clear();setPointerMotion(true);setPressed(true);event.currentTarget.setPointerCapture?.(event.pointerId);}}
      onPointerUp={event=>{release();onPointerUp?.(event);}}
      onPointerCancel={event=>{clear();onPointerCancel?.(event);}}
      onLostPointerCapture={event=>{if(!settle.current)clear();onLostPointerCapture?.(event);}}
      onBlur={event=>{clear();onBlur?.(event);}}
      data-liquid-pressed={pressed && !props.disabled}
      data-input-modality={pointerMotion ? "pointer" : "keyboard"}
      data-slot="switch"
      data-size={size}
      className={cn(
        "group relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-0 bg-foreground/15 outline-none transition-[background-color] duration-200 ease-(--ease-out) after:absolute after:-inset-2 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-40 data-[state=checked]:bg-(--glass-action)",
        !pointerMotion && "transition-none",
        size === "sm" ? "h-[22px] w-[46px] p-0.5" : "h-7 w-[58px] p-0.5",
        className,
      )}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "glass-switch-thumb pointer-events-none relative z-1 block rounded-full border-0 transition-[transform,scale] duration-300 ease-(--ease-out) motion-reduce:transition-none",
          !pointerMotion && "transition-none",
          size === "sm"
            ? "h-[18px] w-[26px] data-[state=checked]:translate-x-4"
            : "h-[22px] w-[34px] data-[state=checked]:translate-x-5",
        )}
      />
    </SwitchPrimitive.Root>
  );
  return within ? (
    control
  ) : (
    <GlassSurface asChild radius={999} shadow={false}>
      {control}
    </GlassSurface>
  );
}
