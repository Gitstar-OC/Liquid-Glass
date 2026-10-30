"use client";

import { useEffect, useState, type RefObject } from "react";

export interface BackdropPlane {
  src: string;
  width: number;
  height: number;
  x: number;
  y: number;
}

/** Align an opt-in image backdrop to the glass in CSS pixels. Unlike SVG
 * backdrop-filter references, filtering an explicit source works in WebKit
 * and Gecko too. No DOM screenshots or asynchronous raster snapshots.
 */
export function useBackdropPlane(
  surface: RefObject<HTMLElement | null>,
  source: RefObject<HTMLImageElement | null> | undefined,
  pad: number,
): BackdropPlane | null {
  const [plane, setPlane] = useState<BackdropPlane | null>(null);
  useEffect(() => {
    const element = surface.current;
    const image = source?.current;
    if (!element || !image) return;
    let frame = 0;
    const update = () => {
      if (!image.complete || !image.naturalWidth) return;
      const imageRect = image.getBoundingClientRect();
      const glassRect = element.getBoundingClientRect();
      if (!imageRect.width || !imageRect.height) return;
      const style = getComputedStyle(image);
      const fit = style.objectFit;
      const cover = Math.max(
        imageRect.width / image.naturalWidth,
        imageRect.height / image.naturalHeight,
      );
      const contain = Math.min(
        imageRect.width / image.naturalWidth,
        imageRect.height / image.naturalHeight,
      );
      const scale =
        fit === "cover"
          ? cover
          : fit === "contain"
            ? contain
            : fit === "scale-down"
              ? Math.min(1, contain)
              : 1;
      const width =
        fit === "fill" ? imageRect.width : image.naturalWidth * scale;
      const height =
        fit === "fill" ? imageRect.height : image.naturalHeight * scale;
      const [horizontal = "50%", vertical = "50%"] =
        style.objectPosition.split(/\s+/);
      const position = (value: string, free: number) => {
        if (value === "center") return free / 2;
        if (value === "right" || value === "bottom") return free;
        if (value === "left" || value === "top") return 0;
        return value.endsWith("%")
          ? (free * parseFloat(value)) / 100
          : parseFloat(value) || 0;
      };
      const next = {
        src: image.currentSrc || image.src,
        width,
        height,
        x:
          imageRect.left -
          glassRect.left -
          element.clientLeft +
          pad +
          position(horizontal, imageRect.width - width),
        y:
          imageRect.top -
          glassRect.top -
          element.clientTop +
          pad +
          position(vertical, imageRect.height - height),
      };
      setPlane((previous) =>
        previous &&
        Object.keys(next).every(
          (key) =>
            previous[key as keyof BackdropPlane] ===
            next[key as keyof BackdropPlane],
        )
          ? previous
          : next,
      );
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(element);
    observer.observe(image);
    image.addEventListener("load", schedule);
    // Layout shifts and object-fit/source changes also alter the mapping.
    const mutations = new MutationObserver(schedule);
    mutations.observe(image, {
      attributes: true,
      attributeFilter: ["style", "class", "src", "srcset", "sizes"],
    });
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, {
      passive: true,
      capture: true,
    });
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      mutations.disconnect();
      image.removeEventListener("load", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
    };
  }, [surface, source, pad]);
  return source ? plane : null;
}
