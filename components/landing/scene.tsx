"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * The studio plane every scene sits on: softly lit so the lens reads without
 * turning the demo frame into decoration.
 */
const STAGE_BACKDROP = [
  "radial-gradient(90% 100% at 10% 0%, rgba(125,160,213,0.14), transparent 66%)",
  "radial-gradient(80% 100% at 100% 100%, rgba(154,127,189,0.11), transparent 66%)",
].join(", ");

export type SceneSpan = 4 | 5 | 6 | 7 | 8 | 12;

export interface SceneProps {
  title: string;
  /** One line on what the scene demonstrates, not what it contains. */
  description?: string;
  /** Components this scene puts to work, listed quietly at the right. */
  components?: string;
  span?: SceneSpan;
  /** The stage is the sizing constraint — height in vh, or a Tailwind class. */
  stageClassName?: string;
  children: React.ReactNode;
}

/**
 * A scene is a *usage*, not a specimen: a real interface composed from several
 * glass components, sitting on a stage. Labels share one baseline grid and one
 * type scale so a column of scenes reads as a column, not a pile.
 */
export function Scene({
  title,
  description,
  components,
  span = 6,
  stageClassName,
  children,
}: SceneProps) {
  const used = components?.split("·").map((name) => name.trim());

  return (
    <section
      className={cn(
        "col-span-12 flex min-w-0 flex-col",
        span === 12 && "lg:col-span-12",
        span === 8 && "lg:col-span-8",
        span === 7 && "lg:col-span-7",
        span === 6 && "lg:col-span-6",
        span === 5 && "lg:col-span-5",
        span === 4 && "lg:col-span-4",
      )}
    >
      <header className="mb-5 flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
            {title}
          </h3>
          {description ? (
            <p className="mt-1.5 max-w-md text-pretty text-[13px] leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        {used?.length ? (
          <p className="hidden max-w-[15rem] shrink-0 text-right font-mono text-[9px] leading-relaxed tracking-[0.06em] text-foreground/35 sm:block">
            {used.join("  ·  ")}
          </p>
        ) : null}
      </header>

      <div
        className={cn(
          "scene-stage relative flex min-h-[300px] flex-1 items-center justify-center overflow-hidden rounded-[var(--surface-radius)] border border-foreground/8 bg-[#08080d] p-6 sm:p-8",
          stageClassName,
        )}
      >
        <div
          aria-hidden="true"
          data-adaptive-skip
          className="absolute inset-0"
          style={{
            backgroundImage: STAGE_BACKDROP,
            backgroundSize: "100% 100%, 100% 100%",
          }}
        />
        <div className="relative flex w-full items-center justify-center">
          {children}
        </div>
      </div>
    </section>
  );
}

/**
 * Every scene in a category, laid out on one 12-column grid. Items stretch by
 * default so scenes sharing a row end on the same line.
 */
export function SceneGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-12 gap-x-6 gap-y-12 lg:gap-x-8 lg:gap-y-16">
      {children}
    </div>
  );
}
