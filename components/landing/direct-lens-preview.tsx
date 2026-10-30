"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { GlassLens } from "@/components/glass/glass-target-lens";
import { SceneBackdrop } from "@/components/site/scene-backdrop";
import { useGlassTheme } from "@/components/glass/glass-theme-provider";

const lens = { lensW: 96, lensH: 57, borderRadius: 28 };
const bounded = (n: number) => Math.max(0, Math.min(1, n));
/** The photo, text and link are the original DOM; no visual duplicate exists. */
export function DirectLensPreview({
  backdrop = "photos",
}: {
  backdrop?: "photos" | "plain";
}) {
  const hintId = useId();
  const { resolvedMode } = useGlassTheme();
  const root = useRef<HTMLDivElement>(null),
    grab = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0.56, y: 0.56 });
  const [dragging, setDragging] = useState(false);
  return (
    <div ref={root} className="absolute inset-0 overflow-hidden rounded-[28px]">
      <GlassLens
        lens={lens}
        x={position.x}
        y={position.y}
        parameters={{ depth: 17, blur: 0.5, chroma: 0 }}
        className="size-full"
      >
        {backdrop === "photos" ? (
          <>
            <SceneBackdrop
              photo={resolvedMode === "dark" ? "ice" : "ocean"}
              priority
            />
            {resolvedMode === "dark" && (
              <div className="absolute inset-0 bg-black/25" />
            )}
          </>
        ) : (
          <div className="home-paper absolute inset-0">
            <div className="home-paper-band" />
            <div className="home-paper-disc" />
          </div>
        )}
        <div
          className={`absolute bottom-6 left-6 flex flex-col gap-2 ${backdrop === "photos" ? "text-white" : "text-foreground"}`}
        >
          <span className="text-xs font-medium">Field notes</span>
          <Link
            href="/docs/glass-target-lens"
            className="w-fit text-xs underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Open documentation →
          </Link>
        </div>
      </GlassLens>
      <button
        type="button"
        aria-label="Move glass lens"
        aria-describedby={hintId}
        className="absolute touch-none rounded-full border-0 bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-foreground/60 focus-visible:ring-offset-4"
        style={{
          width: lens.lensW,
          height: lens.lensH,
          left: `calc(${position.x * 100}% - ${position.x * lens.lensW}px)`,
          top: `calc(${position.y * 100}% - ${position.y * lens.lensH}px)`,
          cursor: dragging ? "grabbing" : "grab",
        }}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          const rect = event.currentTarget.getBoundingClientRect();
          grab.current = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
          setDragging(true);
        }}
        onPointerMove={(event) => {
          if (
            !event.currentTarget.hasPointerCapture(event.pointerId) ||
            !root.current
          )
            return;
          const rect = root.current.getBoundingClientRect();
          setPosition({
            x: bounded(
              (event.clientX - rect.left - grab.current.x) /
                Math.max(1, rect.width - lens.lensW),
            ),
            y: bounded(
              (event.clientY - rect.top - grab.current.y) /
                Math.max(1, rect.height - lens.lensH),
            ),
          });
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId);
          setDragging(false);
        }}
        onPointerCancel={() => setDragging(false)}
        onLostPointerCapture={() => setDragging(false)}
        onKeyDown={(event) => {
          const step = event.shiftKey ? 0.1 : 0.025;
          if (
            ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
              event.key,
            )
          ) {
            event.preventDefault();
            setPosition((p) => ({
              x: bounded(
                p.x +
                  (event.key === "ArrowRight"
                    ? step
                    : event.key === "ArrowLeft"
                      ? -step
                      : 0),
              ),
              y: bounded(
                p.y +
                  (event.key === "ArrowDown"
                    ? step
                    : event.key === "ArrowUp"
                      ? -step
                      : 0),
              ),
            }));
          }
        }}
      />
      <span id={hintId} className="sr-only">
        Drag the lens or use the arrow keys. Shift moves it farther.
      </span>
    </div>
  );
}
