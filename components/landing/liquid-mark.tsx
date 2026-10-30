import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

export interface LiquidMarkProps extends SVGProps<SVGSVGElement> {
  variant?: "landing" | "header" | "custom";
}

export function LiquidMark({
  variant = "landing",
  className,
  ...props
}: LiquidMarkProps) {
  const isCompact = variant === "header";

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={cn(
        variant === "landing" && "showcase-mark",
        variant === "header" && "size-6 shrink-0",
        className,
      )}
      {...props}
    >
      <circle
        cx="32"
        cy="32"
        r="27"
        stroke="currentColor"
        strokeWidth={isCompact ? 1.5 : 1}
        strokeOpacity={isCompact ? ".22" : ".16"}
      />
      <ellipse
        cx="32"
        cy="32"
        rx="21"
        ry="27"
        transform="rotate(-35 32 32)"
        stroke="currentColor"
        strokeWidth={isCompact ? 1.5 : 1}
        strokeOpacity={isCompact ? ".38" : ".3"}
      />
      <ellipse
        cx="32"
        cy="32"
        rx="14"
        ry="27"
        transform="rotate(-35 32 32)"
        stroke="currentColor"
        strokeWidth={isCompact ? 1.75 : 1}
        strokeOpacity={isCompact ? ".65" : ".55"}
      />
      <path
        d="M16.5 9.9a27 27 0 0 1 31 44.2"
        stroke="currentColor"
        strokeWidth={isCompact ? 2.25 : 1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}
