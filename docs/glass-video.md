# Glass video controls

```tsx
import { GlassVideoPlayer } from "@/components/glass/glass-video-player";

<GlassVideoPlayer
  src="/media/your-video.mp4"
  poster="/media/your-poster.webp"
  title="Video preview"
/>;
```

Supply your own media file. The component owns native playback, seeking and
15-second skip actions. Playback starts paused. Its buttons and range input
remain native HTML with accessible labels and focus states.

One transparent WebGL canvas reads the same video frame for all four lenses.
It uses the compact renderer's displacement texture and blue-channel transmission
profile. Saturated source columns produce taller colored rim light; neutral
columns retain a fine edge. The video remains the original native element.

Maps change only with geometry or optical parameters. Playback is capped at
30 optical updates per second; pause and seek render on demand. Hidden media
pauses, and unmount releases its renderer. The canvas participates in the shared
3–5 budget as one compositor. Reduced transparency, context loss and unsupported
WebGL retain the native player and its controls.

Use same-origin media or a server that permits anonymous CORS for WebGL uploads.
The local demo clip is adapted from the flower footage used in
[Aave's glass article](https://aave.com/design/building-glass-for-the-web).
