"use client";
import { GlassButton } from "@/components/glass/glass-button";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { GlassIcon } from "@/components/glass/glass-icons";
import {
  GlassSurface,
  type GlassSurfaceProps,
} from "@/components/glass/glass-surface";
import { GlassStateSwap } from "@/components/glass/glass-state-swap";
import { GlassSlider } from "@/components/glass/glass-slider";
import { cn } from "@/lib/utils";

export interface GlassTrack {
  title: string;
  artist?: string;
  src: string;
  artwork?: string;
}
export interface GlassMusicPlayerProps extends Omit<
  GlassSurfaceProps,
  "kind" | "children"
> {
  tracks: readonly GlassTrack[];
  compact?: boolean;
  footer?: ReactNode;
  defaultTrack?: number;
  trackIndex?: number;
  expandable?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  defaultVolume?: number;
  volume?: number;
  onVolumeValueChange?: (volume: number) => void;
  onTrackChange?: (index: number) => void;
}
const stamp = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

export function GlassMusicPlayer({
  tracks,
  compact = false,
  footer,
  defaultTrack = 0,
  trackIndex,
  expandable = false,
  expanded: controlledExpanded,
  onExpandedChange,
  defaultVolume = 0.4,
  volume: controlledVolume,
  onVolumeValueChange,
  onTrackChange,
  className,
  config,
  ...props
}: GlassMusicPlayerProps) {
  const audio = useRef<HTMLAudioElement>(null);
  const resume = useRef(false);
  const [index, setIndex] = useState(
    Number.isFinite(defaultTrack)
      ? Math.max(0, Math.min(tracks.length - 1, Math.trunc(defaultTrack)))
      : 0,
  );
  const [animatePlayback, setAnimatePlayback] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [localVolume, setVolume] = useState(
    Number.isFinite(defaultVolume)
      ? Math.max(0, Math.min(1, defaultVolume))
      : 0.4,
  );
  const volume = Math.max(
    0,
    Math.min(
      1,
      Number.isFinite(controlledVolume) ? controlledVolume! : localVolume,
    ),
  );
  const [error, setError] = useState(false);
  const [localExpanded, setExpanded] = useState(!expandable);
  const expanded = !expandable || (controlledExpanded ?? localExpanded);
  const changeExpanded = (next: boolean) => {
    setExpanded(next);
    onExpandedChange?.(next);
  };
  const selectedIndex =
    trackIndex !== undefined && Number.isFinite(trackIndex)
      ? Math.trunc(trackIndex)
      : index;
  const activeIndex = Math.max(
    0,
    Math.min(selectedIndex, Math.max(0, tracks.length - 1)),
  );
  const track = tracks[activeIndex];
  useEffect(() => {
    const element = audio.current;
    if (element) element.volume = volume;
  }, [volume]);
  useEffect(() => {
    const element = audio.current;
    if (!element) return;
    element.load();
    if (resume.current) void element.play().catch(() => setError(true));
  }, [track?.src]);
  const toggle = async () => {
    const element = audio.current;
    if (!element || !track) return;
    if (expandable && !expanded) changeExpanded(true);
    if (element.paused) {
      try {
        await element.play();
      } catch {
        setError(true);
      }
    } else element.pause();
  };
  const skip = (direction: number, autoplay = playing) => {
    if (!tracks.length) return;
    const next = (activeIndex + direction + tracks.length) % tracks.length;
    resume.current = autoplay;
    setPosition(0);
    setDuration(0);
    setError(false);
    if (next === index && audio.current) {
      audio.current.currentTime = 0;
      if (autoplay) void audio.current.play().catch(() => setError(true));
    }
    setIndex(next);
    onTrackChange?.(next);
  };
  return (
    <GlassSurface
      kind="card"
      shape="squircle"
      surface="clear"
      config={config}
      data-player-expanded={expanded}
      className={cn(
        "w-full max-w-[300px] p-5",
        expandable && !expanded && "p-3",
        className,
      )}
      {...props}
    >
      {!compact && (
        <div className="mb-4 flex items-center justify-between text-xs font-medium text-foreground/65">
          <span>Now playing</span>
          <GlassIcon
            name="wave"
            aria-hidden="true"
            className={cn("size-4", playing && "text-foreground")}
          />
        </div>
      )}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "grid size-14 shrink-0 place-items-center overflow-hidden rounded-[12px] bg-foreground/8",
            compact && "size-11",
          )}
        >
          {track?.artwork ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={track.artwork}
                alt=""
                className="size-full object-cover"
              />
            </>
          ) : (
            <GlassIcon name="music" className="size-6 text-foreground/40" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              "truncate text-base font-semibold tracking-[-.025em]",
              compact && "text-sm",
            )}
          >
            {track?.title ?? "Nothing queued"}
          </h3>
          <p
            className={cn(
              "mt-1.5 text-xs text-foreground/70",
              compact && "mt-1 text-[11px]",
            )}
          >
            {track?.artist ?? "Choose a track to begin"}
          </p>
        </div>
        {expandable && (
          <GlassButton
            variant="ghost"
            shape="circle"
            className="size-10 shrink-0 p-0"
            aria-label={
              expanded ? "Minimize music player" : "Play music and expand"
            }
            onClick={() => (expanded ? changeExpanded(false) : void toggle())}
          >
            <GlassIcon name={expanded ? "down" : "play"} />
          </GlassButton>
        )}
      </div>
      {expanded && (
        <div className="glass-player-details">
          <GlassSlider
            aria-label="Playback position"
            tone="accent"
            className="mt-3"
            min={0}
            max={duration || 1}
            step={0.1}
            value={[Math.min(position, duration || 1)]}
            disabled={!duration}
            onValueChange={([value]) => {
              if (audio.current) audio.current.currentTime = value;
              setPosition(value);
            }}
          />
          <div className="flex justify-between text-[10px] text-foreground/65 tabular-nums">
            <span>{stamp(position)}</span>
            <span>{stamp(duration)}</span>
          </div>
          <div className="my-2 flex items-center justify-center gap-3">
            <GlassButton
              type="button"
              variant="ghost"
              disabled={!track}
              aria-label="Previous track"
              className="grid size-11 place-items-center rounded-full p-0 disabled:opacity-30"
              onClick={() => skip(-1)}
            >
              <GlassIcon name="previous" className="size-5" />
            </GlassButton>
            <GlassButton
              type="button"
              variant="ghost"
              disabled={!track}
              aria-label={playing ? "Pause music" : "Play music"}
              className="grid size-12 place-items-center rounded-full p-0 disabled:opacity-30"
              onClick={(event) => {
                setAnimatePlayback(event.detail > 0);
                void toggle();
              }}
            >
              <GlassStateSwap
                active={playing}
                animate={animatePlayback}
                from={<GlassIcon name="play" className="size-7" />}
                to={<GlassIcon name="pause" className="size-7" />}
              />
            </GlassButton>
            <GlassButton
              type="button"
              variant="ghost"
              disabled={!track}
              aria-label="Next track"
              className="grid size-11 place-items-center rounded-full p-0 disabled:opacity-30"
              onClick={() => skip(1)}
            >
              <GlassIcon name="next" className="size-5" />
            </GlassButton>
          </div>
          {!compact && (
            <div className="flex items-center gap-3 pt-2">
              <GlassIcon
                name="speaker"
                aria-hidden="true"
                className="size-3.5 shrink-0 text-foreground/70"
              />
              <GlassSlider
                aria-label="Music volume"
                tone="accent"
                min={0}
                max={1}
                step={0.01}
                value={[volume]}
                onValueChange={([value]) => {
                  setVolume(value);
                  onVolumeValueChange?.(value);
                }}
              />
            </div>
          )}
          {footer && <div className="mt-3">{footer}</div>}
          {error && (
            <p role="alert" className="mt-3 text-xs text-muted-foreground">
              This track couldn’t be played.
            </p>
          )}
        </div>
      )}
      <audio
        ref={audio}
        src={track?.src}
        preload="metadata"
        onPlay={() => {
          setPlaying(true);
          setError(false);
        }}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) =>
          setDuration(
            Number.isFinite(event.currentTarget.duration)
              ? event.currentTarget.duration
              : 0,
          )
        }
        onEnded={() => skip(1, true)}
        onError={() => setError(true)}
      />
    </GlassSurface>
  );
}
