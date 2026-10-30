"use client";

import * as React from "react";
import { GlassScene } from "@/components/glass-scene";
import { useGlassTheme } from "@/components/glass/glass-theme-provider";
import { SceneBackdrop } from "@/components/site/scene-backdrop";

/**
 * A bounded local photo or plain canvas, using the current appearance.
 */
export function DemoFrame({
  label,
  children,
  backdrop = "photos",
}: {
  label?: string;
  children: React.ReactNode;
  backdrop?: "photos" | "plain";
}) {
  const { resolvedMode } = useGlassTheme();
  return (
    <figure className="overflow-hidden rounded-[20px] border border-border bg-background">
      <GlassScene
        appearance={resolvedMode}
        className="min-h-[280px]"
        content={
          <div className="absolute inset-0 bg-muted/40">
            {backdrop === "photos" && (
              <>
                <SceneBackdrop
                  photo={resolvedMode === "dark" ? "ice" : "dunes"}
                />
                {resolvedMode === "dark" && (
                  <div className="absolute inset-0 bg-black/25" />
                )}
              </>
            )}
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
