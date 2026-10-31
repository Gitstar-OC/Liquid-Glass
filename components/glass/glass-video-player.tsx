"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { GlassIcon } from "@/components/glass/glass-icons";
import { GlassStateSwap } from "@/components/glass/glass-state-swap";
import { useGlassSettings } from "@/components/glass-scene";
import { GLASS_PRIORITY, registerGlassLens } from "@/lib/glass-performance";
import { subscribeReducedGlass as subscribe, prefersReducedGlass as reduced, serverGlassPreference as server } from "@/lib/glass-preferences";
import { GlassVideoRenderer } from "@/lib/glass-video";
import { cn } from "@/lib/utils";

const timeLabel = (time: number) =>
  `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, "0")}`;

export interface GlassVideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
}
/** Native video and semantic controls; one bounded WebGL layer bends its frames. */
export function GlassVideoPlayer({
  src,
  poster,
  title = "Flower study",
  className,
}: GlassVideoPlayerProps) {
  const root = useRef<HTMLDivElement>(null),
    video = useRef<HTMLVideoElement>(null),
    canvas = useRef<HTMLCanvasElement>(null);
  const controls = useRef<HTMLDivElement>(null),
    bar = useRef<HTMLDivElement>(null);
  const redraw = useRef<() => void>(() => {}),
    refraction = useRef(true);
  const settings = useGlassSettings(),
    solid = useSyncExternalStore(subscribe, reduced, server);
  const [admitted, setAdmitted] = useState(false),
    [optical, setOptical] = useState(false);
  const [playing, setPlaying] = useState(false),
    [time, setTime] = useState(0),
    [duration, setDuration] = useState(0),
    [error, setError] = useState(false);
  const [pointer, setPointer] = useState(true);
  const [recovery, setRecovery] = useState(0);
  useEffect(() => {
    const media = video.current,
      node = root.current;
    if (!media || !node) return;
    const metadata = () => {
      if (Number.isFinite(media.duration)) setDuration(media.duration);
    };
    const hidden = () => {
      if (document.hidden) media.pause();
    };
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) media.pause();
    });
    observer.observe(node);
    media.addEventListener("loadedmetadata", metadata);
    media.addEventListener("durationchange", metadata);
    media.addEventListener("loadeddata", metadata);
    document.addEventListener("visibilitychange", hidden);
    metadata();
    return () => {
      observer.disconnect();
      media.removeEventListener("loadedmetadata", metadata);
      media.removeEventListener("durationchange", metadata);
      media.removeEventListener("loadeddata", metadata);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, [src]);
  useEffect(() => {
    refraction.current = settings.refraction !== false;
    redraw.current();
  }, [settings.refraction]);
  useEffect(() => {
    if (solid || !canvas.current) return;
    return registerGlassLens(canvas.current, setAdmitted, {
      priority: GLASS_PRIORITY.media,
      limit: settings.performance?.maxActiveSurfaces,
    });
  }, [solid, settings.performance?.maxActiveSurfaces]);
  useEffect(() => {
    const node = root.current,
      media = video.current,
      output = canvas.current;
    if (!admitted || solid || !node || !media || !output) return;
    let renderer: GlassVideoRenderer;
    try {
      renderer = new GlassVideoRenderer(output);
    } catch {
      return;
    }
    let disposed = false,
      failed = false,
      frame = 0,
      animation = 0,
      last = -Infinity,
      resizeFrame = 0;
    const draw = () => {
      if (disposed || failed) return;
      try {
        renderer.draw(media, refraction.current);
      } catch {
        failed = true;
        setOptical(false);
        cancel();
      }
    };
    redraw.current = draw;
    const cancel = () => {
      if (frame) media.cancelVideoFrameCallback?.(frame);
      if (animation) cancelAnimationFrame(animation);
      frame = animation = 0;
    };
    const schedule = () => {
      if (disposed || failed || media.paused || document.hidden) return;
      if (typeof media.requestVideoFrameCallback === "function")
        frame = media.requestVideoFrameCallback(tick);
      else animation = requestAnimationFrame(tick);
    };
    const tick = (now: number) => {
      frame = animation = 0;
      if (disposed) return;
      if (now - last >= 1000 / 30 - 1) {
        last = now;
        draw();
      }
      schedule();
    };
    const start = () => {
      cancel();
      draw();
      schedule();
    };
    const pause = () => {
      cancel();
      draw();
    };
    const measure = () => {
      const b = node.getBoundingClientRect();
      if (!b.width || !b.height) return;
      renderer.resize(b.width, b.height);
      const elements = [
        ...(controls.current?.querySelectorAll<HTMLElement>("button") ?? []),
        ...(bar.current ? [bar.current] : []),
      ];
      void renderer
        .setLenses(
          elements.map((element, index) => {
            const a = element.getBoundingClientRect();
            return {
              x: a.left - b.left,
              y: a.top - b.top,
              width: a.width,
              height: a.height,
              radius: a.height / 2,
              parameters: {
                depth: index === 1 ? 17 : 12,
                blur: 0,
                chroma: 0,
                magnification: index === 1 ? 1.12 : 1,
              },
            };
          }),
        )
        .then(() => {
          if (!disposed && !failed) {
            setOptical(true);
            draw();
          }
        })
        .catch(() => {
          if (!disposed) setOptical(false);
        });
    };
    const resize = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(measure);
    });
    resize.observe(node);
    measure();
    const hidden = () => {
      if (document.hidden) {
        cancel();
        media.pause();
      } else draw();
    };
    const lost = (event: Event) => {
      event.preventDefault();
      failed = true;
      cancel();
      setOptical(false);
    };
    const restored = () => setRecovery((value) => value + 1);
    output.addEventListener("webglcontextlost", lost);
    output.addEventListener("webglcontextrestored", restored);
    media.addEventListener("play", start);
    media.addEventListener("pause", pause);
    media.addEventListener("loadeddata", draw);
    media.addEventListener("seeked", draw);
    media.addEventListener("ended", pause);
    document.addEventListener("visibilitychange", hidden);
    start();
    return () => {
      disposed = true;
      cancel();
      cancelAnimationFrame(resizeFrame);
      resize.disconnect();
      redraw.current = () => {};
      media.removeEventListener("play", start);
      media.removeEventListener("pause", pause);
      media.removeEventListener("loadeddata", draw);
      media.removeEventListener("seeked", draw);
      media.removeEventListener("ended", pause);
      document.removeEventListener("visibilitychange", hidden);
      output.removeEventListener("webglcontextlost", lost);
      output.removeEventListener("webglcontextrestored", restored);
      media.pause();
      renderer.destroy();
    };
  }, [admitted, solid, src, recovery]);
  const seek = (value: number) => {
    if (!video.current || !duration) return;
    video.current.currentTime = Math.max(0, Math.min(duration, value));
    setTime(video.current.currentTime);
  };
  const toggle = async () => {
    const media = video.current;
    if (!media) return;
    if (media.paused) {
      try {
        await media.play();
      } catch {
        setError(true);
      }
    } else media.pause();
  };
  return (
    <div
      ref={root}
      className={cn("glass-video-player", className)}
      data-glass-video=""
      data-optical={optical && admitted && !solid}
      data-glass-fallback={optical && admitted && !solid ? undefined : solid ? "accessibility-preference" : !admitted ? "budget" : error ? "media-error" : "video-or-webgl-pending"}
      data-refraction={
        optical && admitted && !solid ? "video-webgl" : "native-video"
      }
      role="region"
      aria-label={title}
    >
      <video
        ref={video}
        src={src}
        poster={poster}
        crossOrigin="anonymous"
        aria-label={title}
        muted
        playsInline
        preload="auto"
        loop
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration);
          setError(false);
        }}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setError(true)}
      />
      <canvas
        ref={canvas}
        aria-hidden="true"
        data-glass-video-canvas=""
        data-glass-rendering={
          optical && admitted && !solid ? "composited" : "lightweight"
        }
      />
      <div
        ref={controls}
        className="glass-video-controls"
        role="group"
        aria-label="Video controls"
        onPointerDown={() => setPointer(true)}
        onKeyDown={() => setPointer(false)}
      >
        <Button
          variant="ghost"
          size="icon"
          className="glass-video-button"
          aria-label="Rewind 15 seconds"
          disabled={error || !duration}
          onClick={() => seek(time - 15)}
        >
          <GlassIcon name="rewind15" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="glass-video-button glass-video-play"
          aria-label={playing ? "Pause video" : "Play video"}
          disabled={error}
          onClick={toggle}
        >
          <GlassStateSwap
            active={playing}
            animate={pointer}
            from={<GlassIcon name="play" />}
            to={<GlassIcon name="pause" />}
          />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="glass-video-button"
          aria-label="Forward 15 seconds"
          disabled={error || !duration}
          onClick={() => seek(time + 15)}
        >
          <GlassIcon name="forward15" />
        </Button>
      </div>
      <div ref={bar} className="glass-video-seek">
        <div className="glass-video-track">
          <span
            style={{ width: `${duration ? (time / duration) * 100 : 0}%` }}
          />
        </div>
        <input
          aria-label="Video position"
          aria-valuetext={`${timeLabel(time)} of ${timeLabel(duration)}`}
          type="range"
          min={0}
          max={duration || 1}
          step={0.1}
          value={time}
          disabled={error || !duration}
          onChange={(event) => seek(Number(event.target.value))}
        />
      </div>
      {error && (
        <span role="status" className="glass-video-error">
          Video unavailable
        </span>
      )}
    </div>
  );
}
