"use client";

import { useLayoutEffect, useRef, useState, type ComponentProps, type ReactNode, type RefObject } from "react";
import { Button } from "@/components/ui/button";
import { GlassLens } from "@/components/glass/glass-target-lens";
import { GlassImageLens } from "@/components/glass/glass-image-lens";
import { CONTROL_LENS_PRESETS, type ControlLensInput } from "@/lib/glass-lens-optics";
import { cn } from "@/lib/utils";

export interface GlassLensButtonProps extends Omit<ComponentProps<typeof Button>, "variant" | "asChild"> {
  /** Use the video-control material directly on this displayed image. */
  imageRef?: RefObject<HTMLImageElement | null>;
  /** Optional explicit visual source, just like the slider's TrackFill. */
  refractionTarget?: ReactNode;
  /** Aligns that visual source. It never captures or clones this element. */
  sourceRef?: RefObject<HTMLElement | null>;
  lensParameters?: ControlLensInput;
}

/** Native button semantics, sharp labels, and the same cached control lens. */
export function GlassLensButton({
  children, className, imageRef, sourceRef, refractionTarget, lensParameters,
  ref, disabled, size = "lg", type = "button", ...props
}: GlassLensButtonProps) {
  const root = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState({ width: 0, height: 0, left: 0, top: 0, sourceWidth: 0, sourceHeight: 0 });
  useLayoutEffect(() => {
    if (imageRef) return;
    const node = root.current;
    if (!node) return;
    const source = sourceRef?.current;
    const measure = () => {
      const a = node.getBoundingClientRect(), b = source?.getBoundingClientRect();
      const sx = b?.width ? source!.clientWidth / b.width : 1;
      const sy = b?.height ? source!.clientHeight / b.height : 1;
      const next = {
        width: node.offsetWidth, height: node.offsetHeight,
        left: b ? (a.left - b.left) * sx + source!.scrollLeft : 0,
        top: b ? (a.top - b.top) * sy + source!.scrollTop : 0,
        sourceWidth: source?.clientWidth ?? node.offsetWidth,
        sourceHeight: source?.clientHeight ?? node.offsetHeight,
      };
      setFrame(old =>
        old.width === next.width && old.height === next.height &&
        old.left === next.left && old.top === next.top &&
        old.sourceWidth === next.sourceWidth && old.sourceHeight === next.sourceHeight
          ? old : next,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    if (source) observer.observe(source);
    const settled = (event: TransitionEvent) => { if (event.target === node) measure(); };
    node.addEventListener("transitionend", settled);
    source?.addEventListener("scroll", measure, { passive: true });
    return () => {
      observer.disconnect();
      node.removeEventListener("transitionend", settled);
      source?.removeEventListener("scroll", measure);
    };
  }, [imageRef, sourceRef]);
  return (
    <div
      ref={root}
      className="glass-lens-action"
      data-disabled={disabled || undefined}
      data-has-source={Boolean(imageRef || refractionTarget !== undefined) || undefined}
    >
      {imageRef ? (
        <GlassImageLens imageRef={imageRef} active={!disabled} parameters={{ ...CONTROL_LENS_PRESETS.button, ...lensParameters }} />
      ) : <GlassLens
        lens={{ lensW: frame.width, lensH: frame.height, borderRadius: frame.height / 2 }}
        active={!disabled && frame.width > 0 && frame.height > 0}
        parameters={{ ...CONTROL_LENS_PRESETS.button, ...lensParameters }}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        refractionTarget={refractionTarget === undefined ? (
          <div className="glass-lens-action-source" />
        ) : (
          <div style={{ position: "absolute", left: -frame.left, top: -frame.top, width: frame.sourceWidth, height: frame.sourceHeight }}>
            {refractionTarget}
          </div>
        )}
      />}
      <Button {...props} ref={ref} type={type} disabled={disabled} size={size} variant={null} className={cn("glass-lens-action-label", size === "lg" && "h-11 px-[18px] text-[13px]", className)}>
        {children}
      </Button>
    </div>
  );
}
