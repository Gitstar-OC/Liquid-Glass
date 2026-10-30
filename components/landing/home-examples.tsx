"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { GlassSlider } from "@/components/glass/glass-slider";
import { GlassSwitch } from "@/components/glass/glass-switch";
import { GlassToggleGroup } from "@/components/glass/glass-toggle";
import { GlassIcon } from "@/components/glass/glass-icons";
import { Skeleton } from "@/components/ui/skeleton";

const VideoPlayer = dynamic(
  () =>
    import("@/components/glass/glass-video-player").then(
      (module) => module.GlassVideoPlayer,
    ),
  {
    loading: () => (
      <div className="aspect-video w-full rounded-[20px] bg-muted" />
    ),
  },
);
const ProfilePopover = dynamic(
  () =>
    import("@/components/landing/profile-popover-example").then(
      (module) => module.ProfilePopoverExample,
    ),
  {
    loading: () => (
      <Skeleton className="h-[264px] w-full max-w-[380px] rounded-[28px]" />
    ),
  },
);

export const HOME_EXAMPLES = [
  {
    id: "slider",
    name: "Slider",
    doc: "glass-slider",
    hint: "Hold and drag to reveal glass.",
  },
  {
    id: "switch",
    name: "Switch",
    doc: "glass-switch",
    hint: "Press or drag left and right to switch.",
  },
  {
    id: "navigation",
    name: "Navigation",
    doc: "glass-toggle",
    hint: "Choose a section.",
  },
  {
    id: "video",
    name: "Video",
    doc: "glass-video-player",
    hint: "Play, seek or skip through the flowers.",
  },
  {
    id: "popover",
    name: "Popover",
    doc: "glass-dropdown",
    hint: "Open the profile actions to edit or share.",
  },
] as const;
export type HomeExampleId = (typeof HOME_EXAMPLES)[number]["id"];
const SECTIONS = [
  { value: "hubs", label: "Hubs", icon: <GlassIcon name="hubs" /> },
  { value: "spokes", label: "Spokes", icon: <GlassIcon name="spokes" /> },
  { value: "reserves", label: "Reserves", icon: <GlassIcon name="reserves" /> },
  { value: "assets", label: "Assets", icon: <GlassIcon name="assets" /> },
  { value: "chains", label: "Chains", icon: <GlassIcon name="chains" /> },
] as const;

export function HomeExample({
  id,
  previewActive = false,
}: {
  id: HomeExampleId;
  previewActive?: boolean;
}) {
  const [value, setValue] = useState(58),
    [enabled, setEnabled] = useState(true),
    [section, setSection] = useState("hubs");
  if (id === "slider")
    return (
      <div className="home-control-plate home-slider-plate">
        <GlassSlider
          appearance="lens"
          tone="accent"
          opticalIdle={previewActive}
          aria-label="Volume"
          value={[value]}
          onValueChange={([next]) => setValue(next)}
        />
        <output className="sr-only">Volume {value}%</output>
      </div>
    );
  if (id === "switch")
    return (
      <div className="home-control-plate home-switch-plate">
        <GlassSwitch
          opticalIdle={previewActive}
          aria-label="AirDrop"
          checked={enabled}
          onCheckedChange={setEnabled}
        />
      </div>
    );
  if (id === "video")
    return (
      <div className="home-video-wrap">
        <VideoPlayer src="/media/flowers.mp4" poster="/media/flowers.webp" />
        <a
          href="https://aave.com/design/building-glass-for-the-web"
          target="_blank"
          rel="noreferrer"
          className="self-end text-[10px] text-muted-foreground hover:text-foreground"
        >
          Flower footage from the Aave demo ↗
        </a>
      </div>
    );
  if (id === "popover") return <ProfilePopover />;
  return (
    <nav
      aria-label="Glass navigation example"
      className="home-control-plate home-navigation-plate"
    >
      <div className="home-navigation-scroll">
        <GlassToggleGroup
          liquid
          type="single"
          options={SECTIONS}
          itemClassName="home-navigation-item"
          value={section}
          onValueChange={(next) => next && setSection(next)}
          aria-label="Preview navigation"
          spacing={0}
          className="home-navigation"
        />
      </div>
      <span role="status" className="sr-only">
        {section} selected
      </span>
    </nav>
  );
}
