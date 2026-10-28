"use client";

import * as React from "react";
import { GlassScene } from "@/components/glass-scene";

/**
 * The stage a component demo sits on: a lit backdrop with enough structure
 * that refraction is actually visible, and a quiet dotted plane so small
 * components still read.
 */
export function DemoFrame({
  label,
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="overflow-hidden rounded-[20px] border border-border bg-background">
      <GlassScene
        appearance="light"
        className="min-h-[280px]"
        content={
          <div className="absolute inset-0 bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/stage-refraction.jpg"
              alt=""
              className="size-full object-cover opacity-65"
            />
          </div>
        }
      >
        <div className="relative flex min-h-[280px] w-full items-center justify-center p-7">
          {children}
        </div>
      </GlassScene>
      {label && (
        <figcaption className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
          {label}
        </figcaption>
      )}
    </figure>
  );
}
