"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface RevealProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  delay?: number;
  /** Fraction of the element that must be visible before revealing. */
  threshold?: number;
  once?: boolean;
}

/** Fade + rise into view on scroll, Apple keynote style. */
export function Reveal({
  as: Tag = "div",
  delay = 0,
  threshold = 0.15,
  once = true,
  className,
  style,
  children,
  ...rest
}: RevealProps) {
  const ref = React.useRef<HTMLElement | null>(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      const id = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(id);
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setShown(false);
        }
      },
      { threshold, rootMargin: "0px 0px -6% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  return (
    <Tag
      {...rest}
      ref={ref}
      data-reveal={shown ? "in" : "out"}
      className={cn("reveal", className)}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </Tag>
  );
}
