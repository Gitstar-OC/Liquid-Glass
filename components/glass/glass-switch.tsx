"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import { GlassLens } from "@/components/glass/glass-target-lens";
import {
  CONTROL_LENS_PRESETS,
  type ControlLensParameters,
} from "@/lib/glass-lens-optics";

export function GlassSwitch({
  className,
  size = "default",
  checked,
  defaultChecked = false,
  onCheckedChange,
  onKeyDown,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onLostPointerCapture,
  onBlur,
  onClick,
  lensParameters,
  opticalIdle,
  style,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default";
  lensParameters?: Partial<ControlLensParameters>;
  opticalIdle?: boolean;
}) {
  const idle = opticalIdle ?? false;
  const [local, setLocal] = React.useState(defaultChecked);
  const enabled = checked ?? local;
  const [pointer, setPointer] = React.useState(false),
    [pressed, setPressed] = React.useState(false);
  const [dragPosition, setDragPosition] = React.useState<number | null>(null);
  const gesture = React.useRef<{
    id: number;
    x: number;
    start: number;
    travel: number;
    position: number;
    moved: boolean;
  } | null>(null);
  const suppressClick = React.useRef(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const stop = React.useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    gesture.current = null;
    setDragPosition(null);
    setPressed(false);
  }, []);
  React.useEffect(() => {
    const hide = () => {
      if (document.hidden) stop();
    };
    window.addEventListener("blur", stop);
    document.addEventListener("visibilitychange", hide);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      gesture.current = null;
      window.removeEventListener("blur", stop);
      document.removeEventListener("visibilitychange", hide);
    };
  }, [stop]);
  React.useEffect(() => {
    if (props.disabled) stop();
  }, [props.disabled, stop]);
  const release = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      setPressed(false);
    }, 400);
  };
  const small = size === "sm",
    width = small ? 56 : 72,
    height = small ? 22 : 28;
  const thumbWidth = small ? 32 : 42,
    thumbHeight = small ? 18 : 22;
  const lensWidth = small ? 50 : 68,
    lensHeight = small ? 28 : 36;
  const inset = (lensWidth - thumbWidth) / 2 - 3,
    verticalInset = (lensHeight - height) / 2;
  const position = dragPosition ?? (enabled ? 1 : 0);
  const color = (dragPosition === null ? enabled : position >= 0.5)
    ? "var(--glass-action,#006de5)"
    : "color-mix(in oklab,var(--foreground) 14%,var(--card))";
  const finish: React.CSSProperties = {
    position: "absolute",
    borderRadius: 999,
    background: color,
    transition: pointer ? "background-color 180ms var(--ease-out)" : "none",
  };
  return (
    <SwitchPrimitive.Root
      {...props}
      checked={enabled}
      onCheckedChange={(next) => {
        if (checked === undefined) setLocal(next);
        onCheckedChange?.(next);
      }}
      onClick={(event) => {
        if (suppressClick.current && event.detail > 0) {
          suppressClick.current = false;
          event.preventDefault();
          return;
        }
        suppressClick.current = false;
        onClick?.(event);
      }}
      onKeyDown={(event) => {
        stop();
        suppressClick.current = false;
        setPointer(false);
        onKeyDown?.(event);
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (event.button !== 0 || event.defaultPrevented || props.disabled)
          return;
        if (gesture.current) return;
        stop();
        suppressClick.current = false;
        setPointer(true);
        setPressed(true);
        const bounds = event.currentTarget.getBoundingClientRect();
        gesture.current = {
          id: event.pointerId,
          x: event.clientX,
          start: enabled ? 1 : 0,
          position: enabled ? 1 : 0,
          travel: Math.max(1, (bounds.width / width) * (width - 6 - thumbWidth)),
          moved: false,
        };
        event.currentTarget.setPointerCapture?.(event.pointerId);
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        const drag = gesture.current;
        if (
          !drag ||
          drag.id !== event.pointerId ||
          event.defaultPrevented ||
          props.disabled
        )
          return;
        const distance = event.clientX - drag.x;
        if (!drag.moved && Math.abs(distance) < 3) return;
        drag.moved = true;
        suppressClick.current = true;
        drag.position = Math.max(0, Math.min(1, drag.start + distance / drag.travel));
        setDragPosition(drag.position);
      }}
      onPointerUp={(event) => {
        const drag = gesture.current;
        if (drag?.id === event.pointerId) {
          if (drag.moved) {
            const next = drag.position >= 0.5;
            if (next !== enabled) {
              if (checked === undefined) setLocal(next);
              onCheckedChange?.(next);
            }
          }
          gesture.current = null;
          setDragPosition(null);
        }
        release();
        onPointerUp?.(event);
      }}
      onPointerCancel={(event) => {
        stop();
        setPointer(false);
        onPointerCancel?.(event);
      }}
      onLostPointerCapture={(event) => {
        if (gesture.current || !timer.current) stop();
        onLostPointerCapture?.(event);
      }}
      onBlur={(event) => {
        stop();
        setPointer(false);
        onBlur?.(event);
      }}
      data-slot="switch"
      data-size={size}
      data-liquid-pressed={pressed && !props.disabled}
      data-input-modality={pointer ? "pointer" : "keyboard"}
      style={{ width, height, ...style }}
      className={cn(
        "glass-switch relative inline-flex shrink-0 touch-none cursor-pointer items-center rounded-full border-0 bg-transparent p-0 outline-none after:absolute after:-inset-2 disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
    >
      <span aria-hidden="true" style={{ ...finish, inset: 0 }} />
      <GlassLens
        style={{
          position: "absolute",
          zIndex: 2,
          pointerEvents: "none",
          inset: `-${verticalInset}px -${inset}px`,
        }}
        lens={{
          lensW: lensWidth,
          lensH: lensHeight,
          borderRadius: lensHeight / 2,
        }}
        x={position}
        active={!props.disabled}
        engaged={idle || pressed}
        restScale={thumbWidth / lensWidth}
        parameters={{ ...CONTROL_LENS_PRESETS.switch, ...lensParameters }}
        rim="column"
        duration={pointer && dragPosition === null ? 400 : 0}
        refractionTarget={
          <span style={{ position: "absolute", inset: 0 }}>
            <span
              style={{
                position: "absolute",
                inset: -128,
                background: "var(--glass-lens-plane,var(--background))",
              }}
            />
            <span
              data-switch-optical-fill=""
              style={{
                ...finish,
                left: inset,
                top: verticalInset + height * 0.125,
                width,
                height: height * 0.75,
              }}
            />
          </span>
        }
      />
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        style={{
          width: thumbWidth,
          height: thumbHeight,
          position: "absolute",
          left: 3,
          top: (height - thumbHeight) / 2,
          translate: `${position * (width - 6 - thumbWidth)}px 0`,
        }}
        className={cn(
          "glass-switch-thumb pointer-events-none block rounded-full border-0 transition-[translate] duration-200 ease-(--ease-out) motion-reduce:transition-none",
          (!pointer || dragPosition !== null) && "transition-none",
        )}
      />
    </SwitchPrimitive.Root>
  );
}
