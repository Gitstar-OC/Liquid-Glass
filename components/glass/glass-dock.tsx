"use client";

import {
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
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
import { GlassLens } from "@/components/glass/glass-target-lens";
import { CONTROL_LENS_PRESETS } from "@/lib/glass-lens-optics";
import { GlassPanel } from "@/components/glass/glass-panel";
import { cn } from "@/lib/utils";

type LensDockProps = ComponentProps<"nav"> & {
  material: "lens";
  /** A small, explicitly aligned backdrop; icons remain sharp native children. */
  refractionTarget: ReactNode;
  radius?: number;
};
export type GlassDockProps =
  | (GlassSurfaceProps & { material?: "scene"; refractionTarget?: never })
  | (ComponentProps<"nav"> & { material: "backdrop"; radius?: number })
  | LensDockProps;

/** A single optical surface; app controls and tooltips retain their own semantics. */
export function GlassDock(props: GlassDockProps) {
  if (props.material === "backdrop") {
    const { children, className, radius = 22, material, ...nativeProps } = props;
    return <TooltipProvider delayDuration={250} skipDelayDuration={300}>
      <GlassPanel kind="dock" radius={radius} shape="squircle" asChild>
        <nav {...nativeProps} aria-label={props["aria-label"] ?? "Dock"} data-glass-dock={material}
          className={cn("flex w-fit items-center gap-3 p-3", className)}>{children}</nav>
      </GlassPanel>
    </TooltipProvider>;
  }
  if (props.material === "lens") {
    return (
      <TooltipProvider delayDuration={250} skipDelayDuration={300}>
        <LensDock {...props} />
      </TooltipProvider>
    );
  }
  const { children, className, material = "scene", ...surfaceProps } = props;
  return (
    <TooltipProvider delayDuration={250} skipDelayDuration={300}>
      <GlassSurface
        as="nav"
        kind="navbar"
        shape="round"
        radius={22}
        aria-label="Dock"
        data-glass-dock={material}
        {...surfaceProps}
        className={cn("flex w-fit items-center gap-2 p-2.5", className)}
      >
        {children}
      </GlassSurface>
    </TooltipProvider>
  );
}

/** One stationary compact lens; layout changes are the only geometry updates. */
function LensDock({
  children,
  className,
  style,
  ref,
  material,
  refractionTarget,
  radius = 22,
  ...props
}: LensDockProps) {
  const root = useRef<HTMLElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useImperativeHandle(ref, () => root.current!, []);
  useLayoutEffect(() => {
    const node = root.current;
    if (!node) return;
    const measure = () => {
      // Computed CSS dimensions keep fractional geometry and ignore press scale.
      const css = getComputedStyle(node);
      const width = parseFloat(css.width);
      const height = parseFloat(css.height);
      if (!Number.isFinite(width) || !Number.isFinite(height)) return;
      setSize((previous) =>
        previous.width === width && previous.height === height
          ? previous
          : { width, height },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <nav
      aria-label="Dock"
      {...props}
      ref={root}
      data-glass-dock={material}
      className={cn("relative isolate flex w-fit items-center gap-3 p-3", className)}
      style={{ borderRadius: radius, background: "var(--background)", ...style }}
    >
      <GlassLens
        lens={{
          lensW: size.width || 2,
          lensH: size.height || 2,
          borderRadius: radius,
        }}
        active={size.width > 0 && size.height > 0}
        parameters={{ ...CONTROL_LENS_PRESETS.slider, magnification: 1 }}
        refractionTarget={refractionTarget}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      />
      <div className="relative z-2 flex items-center gap-[inherit]">
        {children}
      </div>
    </nav>
  );
}
export function GlassDockItem({
  label,
  tooltipVariant = "plain",
  children,
  className,
  ...props
}: GlassButtonProps & { label: string; tooltipVariant?: "plain" | "beak" }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <GlassButton
          variant="ghost"
          shape="default"
          aria-label={label}
          {...props}
          className={cn(
            "size-12 rounded-[13px] p-0",
            className,
          )}
        >
          {children}
        </GlassButton>
      </TooltipTrigger>
      <GlassTooltipContent side="top" sideOffset={12} variant={tooltipVariant}>
        {label}
      </GlassTooltipContent>
    </Tooltip>
  );
}
