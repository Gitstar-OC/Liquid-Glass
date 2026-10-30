"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** An interruptible visual state change. Give the parent button its accessible name. */
export function GlassStateSwap({
  active,
  from,
  to,
  animate = true,
  className,
}: {
  active: boolean;
  from: ReactNode;
  to: ReactNode;
  /** Keyboard actions should pass false so their feedback is immediate. */
  animate?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      data-active={active}
      data-animate={animate}
      className={cn("glass-state-swap", className)}
    >
      <span data-swap-layer="from">{from}</span>
      <span data-swap-layer="to">{to}</span>
    </span>
  );
}
