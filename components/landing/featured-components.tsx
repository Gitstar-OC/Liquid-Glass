"use client";

import { PreviewToolbar } from "@/components/site/preview-toolbar";
import { SceneBackdrop } from "@/components/site/scene-backdrop";
import { GlassButton } from "@/components/glass/glass-button";
import { useState } from "react";
import { Tabs } from "radix-ui";
import { FileText, Folder, SlidersHorizontal, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { GlassScene, useGlassSettings } from "@/components/glass-scene";
import { GlassMusicPlayer } from "@/components/glass/glass-music-player";
import { GlassControlCenter } from "@/components/glass/glass-control-center";
import {
  GlassSpotlightPanel,
  type GlassSpotlightCommand,
} from "@/components/glass/glass-spotlight";
import { GlassPowerMenu } from "@/components/glass/glass-power";
import { GlassPreferences } from "@/components/glass/glass-preferences";
import { GLASS_DEFAULT_PARAMS } from "@/lib/glass";
import { DEMO_PHOTOS } from "@/lib/demo-assets";
import { cn } from "@/lib/utils";

import { TRACKS } from "@/lib/demo-tracks";
export { TRACKS } from "@/lib/demo-tracks";
export const SPOTLIGHT_COMMANDS: GlassSpotlightCommand[] = [
  {
    id: "new",
    label: "Create a new note",
    icon: <FileText />,
    onSelect: () => toast.success("Note created"),
  },
  {
    id: "files",
    label: "Browse your files",
    icon: <Folder />,
    onSelect: () => toast("Files opened"),
  },
  {
    id: "settings",
    label: "Open preferences",
    icon: <SlidersHorizontal />,
    onSelect: () => toast("Preferences opened"),
  },
  {
    id: "ideas",
    label: "Search notes",
    icon: <Sparkles />,
    onSelect: () => toast("Notes opened"),
  },
];

type FeaturedKind =
  "preferences" | "music" | "controls" | "spotlight" | "power";
const ITEMS: {
  id: FeaturedKind;
  title: string;
  doc: string;
  photo: keyof typeof DEMO_PHOTOS;
}[] = [
  {
    id: "preferences",
    title: "Preferences",
    doc: "glass-preferences",
    photo: "dunes",
  },
  {
    id: "music",
    title: "Music player",
    doc: "glass-music-player",
    photo: "dunes",
  },
  {
    id: "controls",
    title: "Control center",
    doc: "glass-control-center",
    photo: "dunes",
  },
  {
    id: "spotlight",
    title: "Spotlight",
    doc: "glass-spotlight",
    photo: "lake",
  },
  {
    id: "power",
    title: "Power controls",
    doc: "glass-power",
    photo: "dunes",
  },
];
export function FeaturedComponentPreview({
  kind,
  blur,
  backdrop,
  className,
}: {
  kind: FeaturedKind;
  blur?: number;
  backdrop?: keyof typeof DEMO_PHOTOS;
  className?: string;
}) {
  const settings = useGlassSettings();
  const params = {
    ...GLASS_DEFAULT_PARAMS,
    ...settings.config,
    blur: blur ?? settings.config?.blur ?? GLASS_DEFAULT_PARAMS.blur,
  };
  const item = ITEMS.find((value) => value.id === kind)!;
  const photoKey = backdrop ?? item.photo;
  const light = photoKey === "dunes";
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [brightness, setBrightness] = useState(75);
  const [resting, setResting] = useState(false);
  return (
    <div
      ref={setContainer}
      className={cn(
        "relative h-[560px] sm:h-[480px] overflow-hidden bg-slate-200",
        "rounded-[20px]",
        className,
      )}
      data-testid={`featured-${kind}`}
    >
      <GlassScene
        appearance={light ? "light" : "dark"}
        config={params}
        frameRate={30}
        className="size-full"
        content={
          <div className="absolute inset-0">
            <SceneBackdrop photo={photoKey} priority />
            <div
              className="absolute inset-0 bg-slate-950 transition-opacity duration-150"
              style={{
                opacity: kind === "controls" ? (100 - brightness) * 0.0015 : 0,
              }}
            />
          </div>
        }
      >
        <div
          inert={resting}
          aria-hidden={resting || undefined}
          className="absolute inset-0 flex items-center justify-center p-6"
        >
          {kind === "preferences" && (
            <GlassPreferences
              onSave={() => {
                toast.success("Preferences saved");
              }}
            />
          )}
          {kind === "music" && (
            <GlassMusicPlayer tracks={TRACKS} config={params} />
          )}
          {kind === "controls" && (
            <GlassControlCenter
              config={params}
              onValueChange={(value) => setBrightness(value.brightness)}
            />
          )}
          {kind === "spotlight" && (
            <GlassSpotlightPanel
              commands={SPOTLIGHT_COMMANDS}
              config={params}
            />
          )}
          {kind === "power" && (
            <GlassPowerMenu
              config={params}
              container={container}
              onAction={(action) => {
                if (action === "restart") {
                  setResting(false);
                  toast("Session restarted");
                } else setResting(true);
              }}
            />
          )}
        </div>
        {resting && (
          <div className="absolute inset-0 z-40 grid place-items-center bg-slate-950/85">
            <GlassButton
              className="text-white"
              autoFocus
              onClick={() => setResting(false)}
            >
              Wake preview
            </GlassButton>
          </div>
        )}
      </GlassScene>
    </div>
  );
}
export function FeaturedComponents() {
  const [active, setActive] = useState<FeaturedKind>("music");
  const [blur, setBlur] = useState(GLASS_DEFAULT_PARAMS.blur);
  const [backdrop, setBackdrop] = useState<keyof typeof DEMO_PHOTOS>("dunes");
  const current = ITEMS.find((item) => item.id === active)!;
  return (
    <section aria-label="Live glass components">
      <Tabs.Root
        value={active}
        onValueChange={(value) => setActive(value as FeaturedKind)}
      >
        <Tabs.List
          aria-label="Featured components"
          className="mb-4 flex flex-wrap gap-2"
        >
          {ITEMS.map((item) => (
            <Tabs.Trigger key={item.id} value={item.id} asChild>
              <GlassButton className="data-[state=active]:bg-foreground/12">
                {item.title}
              </GlassButton>
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {ITEMS.map((item) => (
          <Tabs.Content
            key={item.id}
            value={item.id}
            className="outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <FeaturedComponentPreview
              kind={item.id}
              backdrop={backdrop}
              blur={blur}
              className="h-[560px] sm:h-[480px] rounded-[20px]"
            />
          </Tabs.Content>
        ))}
      </Tabs.Root>
      <PreviewToolbar
        photo={backdrop}
        onPhotoChange={setBackdrop}
        blur={blur}
        onBlurChange={setBlur}
        label="Showcase"
        href={`/docs/${current.doc}`}
      />
    </section>
  );
}
