"use client";

import { useLayoutEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { GlassSettingsProvider } from "@/components/glass-scene";
import { useGlassTheme } from "@/components/glass/glass-theme-provider";
import { GlassSlider } from "@/components/glass/glass-slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PreviewToolbar } from "@/components/site/preview-toolbar";
import type { GlassShape } from "@/lib/glass";
import { HomeExample, type HomeExampleId } from "@/components/landing/home-examples";
import { cn } from "@/lib/utils";
import type { WorkspaceExample } from "@/components/landing/workspace-panel-example";

const WorkspacePanelExample = dynamic(() => import("@/components/landing/workspace-panel-example").then(module => module.WorkspacePanelExample));
const SimplePanelExample = dynamic(() => import("@/components/landing/simple-panel-example").then(module => module.SimplePanelExample));

export const SHOWCASE_EXAMPLES = [
  { id: "slider", name: "Slider", doc: "glass-slider" },
  { id: "switch", name: "Switch", doc: "glass-switch" },
  { id: "navigation", name: "Navigation", doc: "glass-toggle" },
  { id: "buttons", name: "Buttons", doc: "glass-lens-button" },
  { id: "video", name: "Video", doc: "glass-video-player" },
  { id: "tooltip", name: "Tooltip", doc: "glass-tooltip" },
  { id: "hover-card", name: "Hover card", doc: "glass-hover-card" },
  { id: "popover", name: "Popover", doc: "glass-popover" },
  { id: "dropdown", name: "Dropdown", doc: "glass-dropdown" },
  { id: "drawer", name: "Drawer", doc: "glass-drawer" },
  { id: "card", name: "Card", doc: "glass-card" },
  { id: "profile", name: "Profile menu", doc: "glass-dropdown" },
] as const;
export type ShowcaseExample = typeof SHOWCASE_EXAMPLES[number]["id"];
type Example = ShowcaseExample;
/** Plain stage, one mounted component and one bounded source at a time. */
export function PanelShowcase({ initialExample = "slider", compact = false, minimal = false, enabled = true }: {
  initialExample?: Example;
  compact?: boolean;
  /** Landing illustrations keep tuning controls in the docs/playground. */
  minimal?: boolean;
  /** Release examples when their tab or gallery item is inactive. */
  enabled?: boolean;
}) {
  const { resolvedMode } = useGlassTheme();
  const example = initialExample;
  const [radius, setRadius] = useState(initialExample === "tooltip" ? 13 : initialExample === "drawer" ? 28 : 20);
  const [shape, setShape] = useState<GlassShape>(initialExample === "tooltip" ? "round" : "squircle");
  const [beak, setBeak] = useState(true);
  const [pinned, setPinned] = useState(!minimal && (initialExample === "tooltip" || initialExample === "hover-card"));
  const [refraction, setRefraction] = useState(true);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const section = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const node = section.current;
    if (!node || !enabled) return;
    // Mount visible tab controls before the next paint, so Tab reaches them
    // without waiting for the observer's first asynchronous notification.
    const box = node.getBoundingClientRect();
    const margin = minimal ? 0 : 80;
    setVisible(box.bottom > -margin && box.top < innerHeight + margin && box.right > 0 && box.left < innerWidth);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: minimal ? "0px" : "80px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, minimal]);
  const mounted = visible && enabled;
  const selected = SHOWCASE_EXAMPLES.find(item => item.id === example)!;
  const control = ["slider", "switch", "navigation", "buttons", "video", "profile"].includes(example);
  const thumb = example === "slider" || example === "switch";
  const hint = example === "slider" ? "Hold and drag to reveal glass." : example === "switch" ? "Press or drag left and right to switch."
    : example === "navigation" ? "Choose a section." : example === "video" ? "Play, seek or skip through the flowers."
    : example === "buttons" ? "Two actions over the same background." : example === "profile" ? "Open the profile actions."
    : example === "tooltip" ? "Hover or focus the copy-link action." : example === "hover-card" ? "Hover or focus Maya’s name."
    : example === "card" ? "Click the collection to open it." : example === "drawer" ? "Choose a filename to view its details."
    : example === "dropdown" ? "Open a file’s action menu." : "Change the asset layout with View.";
  return (
    <section ref={section} className={cn("panel-showcase", compact && "panel-showcase-compact", minimal && "panel-showcase-minimal", resolvedMode === "dark" ? "showcase-dark" : "showcase-light")} aria-label={`${selected.name} example`}>
      <div ref={setContainer} className="panel-preview-stage" data-panel-example={example} data-preview={minimal && !control ? "simple" : undefined}>
        <GlassSettingsProvider refraction={refraction}>
          {control ? <div className="home-control-stage size-full" data-example={example === "profile" ? "popover" : example}>
            {mounted && <HomeExample key={example} id={(example === "profile" ? "popover" : example) as HomeExampleId} previewActive={pinned} />}
          </div> : mounted && container ? minimal ? <SimplePanelExample key={example}
            example={example as WorkspaceExample} appearance={resolvedMode} container={container}
            radius={radius} shape={shape} beak={beak} /> : <WorkspacePanelExample key={example}
            example={example as WorkspaceExample}
            appearance={resolvedMode} container={container} radius={radius} shape={shape}
            beak={beak} pinned={pinned} onUnpin={() => setPinned(false)} /> : null}
        </GlassSettingsProvider>
      </div>
      {!minimal && <><PreviewToolbar label={selected.name} href={`/docs/${selected.doc}`} backgroundControls={control ? <span className="text-muted-foreground">{hint}</span> :
        <div className="flex flex-wrap items-center gap-3">
          {(example === "tooltip" || example === "hover-card" || example === "popover") && <ToggleGroup type="single" value={beak ? "beak" : "plain"} onValueChange={value => value && setBeak(value === "beak")} spacing={0} aria-label="Bubble pointer">
            <ToggleGroupItem value="plain">No beak</ToggleGroupItem><ToggleGroupItem value="beak">Joined beak</ToggleGroupItem>
          </ToggleGroup>}
          <ToggleGroup type="single" value={shape} onValueChange={value => value && setShape(value as GlassShape)} spacing={0} aria-label="Corner shape">
            <ToggleGroupItem value="round">Round</ToggleGroupItem><ToggleGroupItem value="squircle">Squircle</ToggleGroupItem>
          </ToggleGroup>
          <label className="flex items-center gap-2 text-muted-foreground">Radius
            <GlassSlider aria-label={`${selected.name} radius`} min={0} max={example === "tooltip" ? 13 : 32} step={1} value={[radius]} onValueChange={([value]) => setRadius(value)} className="w-20" />
            <output className="w-7 tabular-nums">{radius}px</output>
          </label>
        </div>
      } blurControl={null} />
      <div className="mt-3 flex min-h-10 flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>{control ? "" : hint}</span>
        <div className="flex items-center gap-4">
          {(thumb || example === "tooltip" || example === "hover-card") && <button type="button" aria-pressed={pinned} onClick={() => setPinned(value => !value)} className="min-h-10 hover:text-foreground">{thumb ? pinned ? "Return to resting" : "Inspect active state" : pinned ? "Unpin preview" : "Pin preview"}</button>}
          <button type="button" aria-pressed={refraction} onClick={() => setRefraction(value => !value)} className="min-h-10 hover:text-foreground">Refraction {refraction ? "on" : "off"}</button>
        </div>
      </div></>}
    </section>
  );
}
