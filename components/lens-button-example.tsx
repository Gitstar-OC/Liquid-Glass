"use client";

import { useRef, useState } from "react";
import { GlassLensButton } from "@/components/glass/glass-lens-button";
import { GlassIcon } from "@/components/glass/glass-icons";
import { useGlassTheme } from "@/components/glass/glass-theme-provider";
import { SceneBackdrop } from "@/components/site/scene-backdrop";

export function LensButtonExample() {
  const source = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("");
  const { resolvedMode } = useGlassTheme();
  const backdrop = <SceneBackdrop photo={resolvedMode === "dark" ? "ocean" : "dunes"} />;
  return (
    <div className="home-lens-buttons-wrap">
      <div ref={source} className="home-lens-buttons-scene">
        {backdrop}
        <div className="home-lens-buttons-actions">
          <GlassLensButton sourceRef={source} refractionTarget={backdrop} onClick={() => setStatus("Continued.")}>
            Continue <GlassIcon name="arrow" data-icon="inline-end" />
          </GlassLensButton>
          <GlassLensButton sourceRef={source} refractionTarget={backdrop} onClick={() => setStatus("Changes saved.")}>
            <GlassIcon name="check" data-icon="inline-start" /> Save changes
          </GlassLensButton>
        </div>
      </div>
      <span role="status" className="home-lens-buttons-status">{status || "Press an action."}</span>
    </div>
  );
}
