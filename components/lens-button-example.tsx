"use client";

import { useRef, useState } from "react";
import { GlassLensButton } from "@/components/glass/glass-lens-button";
import { GlassIcon } from "@/components/glass/glass-icons";
import { useGlassTheme } from "@/components/glass/glass-theme-provider";
import { SceneBackdrop } from "@/components/site/scene-backdrop";

export function LensButtonExample() {
  const source = useRef<HTMLImageElement>(null);
  const [status, setStatus] = useState("");
  const { resolvedMode } = useGlassTheme();
  return (
    <div className="home-lens-buttons-wrap">
      <div className="home-lens-buttons-scene">
        <SceneBackdrop ref={source} photo={resolvedMode === "dark" ? "ocean" : "dunes"} />
        <div className="home-lens-buttons-actions">
          <GlassLensButton imageRef={source} onClick={() => setStatus("Continued.")}>
            Continue <GlassIcon name="arrow" data-icon="inline-end" />
          </GlassLensButton>
          <GlassLensButton imageRef={source} onClick={() => setStatus("Changes saved.")}>
            <GlassIcon name="check" data-icon="inline-start" /> Save changes
          </GlassLensButton>
        </div>
      </div>
      <span role="status" className="sr-only">{status}</span>
    </div>
  );
}
