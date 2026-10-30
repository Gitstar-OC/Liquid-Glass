"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/landing/reveal";

export interface SectionHeadingProps {
  eyebrow: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  /** `center` for hero-style sections, `start` for editorial ones. */
  align?: "center" | "start";
  className?: string;
  /** Rendered to the right of the heading block (controls, links…). */
  aside?: React.ReactNode;
}

/**
 * One heading pattern for the whole page. Keeping it in a single component is
 * what makes the sections feel like one page instead of five separate ones.
 */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "center",
  className,
  aside,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <Reveal
      className={cn(
        "flex flex-col items-stretch gap-8",
        centered ? "text-center" : "text-start",
        className,
      )}
    >
      <div className={cn("w-full max-w-2xl", centered && "mx-auto")}>
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {eyebrow}
        </p>
        <h2 className="mt-4 text-balance text-[2rem] font-semibold leading-[1.08] tracking-[-0.055em] sm:text-[2.5rem] lg:text-[2.75rem]">
          {title}
        </h2>
        {lede ? (
          <p className="mx-auto mt-4 max-w-xl text-pretty text-[14px] leading-7 text-muted-foreground sm:text-[15px]">
            {lede}
          </p>
        ) : null}
      </div>
      {aside ? (
        <div className={cn("w-full", centered && "flex justify-center")}>
          {aside}
        </div>
      ) : null}
    </Reveal>
  );
}
