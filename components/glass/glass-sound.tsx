"use client";

import { useState } from "react";
import { RadioGroup } from "radix-ui";
import { Check, Monitor, Speaker, Volume1, Volume2 } from "lucide-react";
import { GlassSurface, type GlassSurfaceProps } from "@/components/glass/glass-surface";
import { GlassSlider } from "@/components/glass/glass-slider";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface GlassSoundProps extends Omit<GlassSurfaceProps, "children" | "onChange" | "onVolumeChange" | "defaultValue"> {
  volume?: number;
  defaultVolume?: number;
  onVolumeChange?: (value: number) => void;
  onOutputChange?: (value: string) => void;
}

export function GlassSound({ volume: controlledVolume, defaultVolume = 42, onVolumeChange, onOutputChange, className, ...props }: GlassSoundProps) {
  const [localVolume, setVolume] = useState(defaultVolume);
  const volume = controlledVolume ?? localVolume;
  const [output, setOutput] = useState("speakers");
  return (
    <GlassSurface {...props} className={cn("w-full max-w-[304px] p-3", className)}>
      <h3 className="px-1 text-[13px] font-semibold">Sound</h3>
      <div className="flex items-center gap-2 px-1">
        <Volume1 className="size-4 shrink-0 opacity-55" aria-hidden="true" />
        <GlassSlider aria-label="Output volume" tone="accent" value={[volume]} onValueChange={([next]) => { setVolume(next); onVolumeChange?.(next); }} />
        <Volume2 className="size-4 shrink-0 opacity-75" aria-hidden="true" />
      </div>
      <Separator className="my-2 bg-foreground/10" />
      <p className="mb-1 px-1 text-[11px] font-medium text-foreground/55">Output</p>
      <RadioGroup.Root aria-label="Audio output" value={output} onValueChange={next => { setOutput(next); onOutputChange?.(next); }} className="flex flex-col gap-0.5">
        {[{ value: "speakers", label: "Studio speakers", icon: Speaker }, { value: "display", label: "Studio display", icon: Monitor }].map(({value,label,icon:Icon}) => (
          <RadioGroup.Item key={value} value={value} className="glass-choice-row group flex min-h-10 w-full items-center gap-2.5 rounded-xl px-1.5 text-left text-xs outline-none hover:bg-foreground/6 focus-visible:ring-2 focus-visible:ring-ring/60">
            <span className="glass-control-icon size-7 group-data-[state=checked]:bg-(--glass-action) group-data-[state=checked]:text-white"><Icon className="size-3.5" /></span>
            <span className="flex-1 font-medium">{label}</span>
            <RadioGroup.Indicator><Check className="size-3.5 opacity-65" /></RadioGroup.Indicator>
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
    </GlassSurface>
  );
}
