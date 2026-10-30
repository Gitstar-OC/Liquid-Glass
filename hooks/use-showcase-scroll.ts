"use client";

import { useEffect, type RefObject } from "react";

/** Only schedules work on scroll/resize. There is no idle animation loop. */
export function useShowcaseScroll(
  section: RefObject<HTMLElement | null>,
  lake: RefObject<HTMLDivElement | null>,
  dunes: RefObject<HTMLDivElement | null>,
  enabled: boolean,
) {
  useEffect(() => {
    const root = section.current;
    const first = lake.current;
    const second = dunes.current;
    if (!root || !first || !second) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let visible = true;
    let last = "";
    const paint = () => {
      frame = 0;
      if (!visible || document.hidden) return;
      const rect = root.getBoundingClientRect();
      const travel = Math.max(1, rect.height - innerHeight);
      const progress = Math.max(0, Math.min(1, -rect.top / travel));
      const still = !enabled || media.matches;
      const amount = still ? 0 : progress;
      const key = amount.toFixed(3);
      if (key === last) return;
      last = key;
      first.style.transform = `translate3d(0, ${(1 - amount) * 3}%, 0)`;
      first.style.opacity = String(Math.min(1, amount * 2.3));
      second.style.transform = `translate3d(0, ${(1 - amount) * 5}%, 0)`;
      second.style.opacity = String(
        Math.max(0, Math.min(1, (amount - 0.3) * 2.2)),
      );
      root.dataset.scrollProgress = amount.toFixed(3);
      root.dataset.scrollStage = still
        ? "still"
        : progress < 0.2
          ? "dunes"
          : progress < 0.65
            ? "ocean"
            : "ice";
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) queue();
    });
    observer.observe(root);
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    document.addEventListener("visibilitychange", queue);
    media.addEventListener("change", queue);
    queue();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      document.removeEventListener("visibilitychange", queue);
      media.removeEventListener("change", queue);
    };
  }, [section, lake, dunes, enabled]);
}
