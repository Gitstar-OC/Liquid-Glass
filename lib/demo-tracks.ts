import type { GlassTrack } from "@/components/glass/glass-music-player";
import { DEMO_PHOTOS } from "@/lib/demo-assets";

export const TRACKS: GlassTrack[] = [
  {
    title: "Morning light",
    artist: "An ambient study",
    src: "/audio/morning-light.wav",
    artwork: DEMO_PHOTOS.dunes.src,
  },
  {
    title: "Slow tide",
    artist: "An ambient study",
    src: "/audio/slow-tide.wav",
    artwork: DEMO_PHOTOS.dunes.src,
  },
  {
    title: "Soft focus",
    artist: "An ambient study",
    src: "/audio/soft-focus.wav",
    artwork: DEMO_PHOTOS.lake.src,
  },
];
