"use client";

import Link from "next/link";
import { GlassScene, GlassSettingsProvider } from "@/components/glass-scene";
import { GlassButton } from "@/components/glass/glass-button";
import { GlassIcon } from "@/components/glass/glass-icons";
import { useGlassTheme } from "@/components/glass/glass-theme-provider";
import { LiquidMark } from "@/components/landing/liquid-mark";
import { ShowcaseDock } from "@/components/landing/showcase-dock";

/** Identity stays quiet; examples have their own aligned section below. */
export function GlassCollection() {
  const { resolvedMode, setMode } = useGlassTheme();
  const dark = resolvedMode === "dark";
  return (
    <section className="home-glass" data-theme={resolvedMode} aria-label="Liquid Glass">
      <GlassSettingsProvider ink={dark ? "light" : "dark"} themeBehavior="duotheme">
        <div className="home-layout">
          <div className="home-intro">
            <LiquidMark variant="landing" />
            <h1>Liquid Glass</h1>
            <GlassScene appearance={resolvedMode} className="home-links-scene"
              content={<div className="absolute inset-0 bg-background" />}>
              <div className="home-links">
                <GlassButton asChild variant="glass"><Link href="/playground">Playground <GlassIcon name="arrow" /></Link></GlassButton>
                <GlassButton asChild variant="glass"><Link href="/docs">Documentation</Link></GlassButton>
              </div>
            </GlassScene>
          </div>
        </div>
        <div className="home-dock-position">
          <ShowcaseDock dark={dark} onThemeChange={() => setMode(dark ? "light" : "dark")} />
        </div>
      </GlassSettingsProvider>
    </section>
  );
}
