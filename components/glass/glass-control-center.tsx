"use client";

import { useState } from "react";
import { Bluetooth, Wifi, Moon, Sun, Monitor, Radio } from "lucide-react";
import { GlassSurface, type GlassSurfaceProps } from "@/components/glass/glass-surface";
import { GlassButton } from "@/components/glass/glass-button";
import { GlassRangeControl } from "@/components/glass/glass-range-control";
import { cn } from "@/lib/utils";

export interface GlassControlCenterState {
  wifi: boolean;
  bluetooth: boolean;
  brightness: number;
  volume: number;
  focus: boolean;
}
export interface GlassControlCenterProps extends Omit<GlassSurfaceProps, "kind" | "children" | "onChange" | "defaultValue"> {
  value?: Partial<GlassControlCenterState>;
  defaultValue?: Partial<GlassControlCenterState>;
  onValueChange?: (value: GlassControlCenterState) => void;
}
const DEFAULTS = { wifi: true, bluetooth: true, brightness: 72, volume: 58, focus: false };
const percent = (value: number) => Number.isFinite(value) ? Math.max(0,Math.min(100,value)) : 50;

export function GlassControlCenter({ value, defaultValue, onValueChange, className, ...props }: GlassControlCenterProps) {
  const [local, setLocal] = useState({ ...DEFAULTS, ...defaultValue });
  const [mirroring, setMirroring] = useState(false);
  const current = { ...local, ...value };
  const state = { ...current, brightness: percent(current.brightness), volume: percent(current.volume) };
  const update = (patch: Partial<GlassControlCenterState>) => {
    const next = { ...state, ...patch };
    setLocal(next);
    onValueChange?.(next);
  };
  return (
    <GlassSurface {...props} className={cn("@container w-full max-w-[312px] p-3",className)}>
      <div className="mb-3 flex items-center justify-between px-2 pt-1">
        <h3 className="text-[13px] font-semibold">Control center</h3>
        <span className="text-[10px] text-foreground/50">Studio</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[{key:"wifi",label:"Wi-Fi",status:"Studio network",icon:Wifi},{key:"bluetooth",label:"Bluetooth",status:"Connected",icon:Bluetooth}].map(({key,label,status,icon:Icon}) => {
          const field = key as "wifi" | "bluetooth";
          return <GlassButton key={key} aria-pressed={state[field]} onClick={()=>update({[field]:!state[field]})} className="h-22 min-w-0 flex-col justify-center gap-1 px-2 text-center @min-[260px]:h-16 @min-[260px]:flex-row @min-[260px]:justify-start @min-[260px]:gap-2 @min-[260px]:px-2.5 @min-[260px]:text-left">
            <span className={cn("glass-control-icon size-9", state[field] && "bg-white text-(--glass-action)")}><Icon /></span>
            <span className="min-w-0 max-w-full"><span className="block text-xs font-semibold">{label}</span><span className="hidden truncate text-[10px] @min-[260px]:block font-normal text-foreground/60">{state[field] ? status : "Off"}</span></span>
          </GlassButton>;
        })}
        <GlassButton aria-pressed={state.focus} onClick={()=>update({focus:!state.focus})} className="h-14 justify-start gap-2 px-2.5">
          <span className={cn("glass-control-icon size-8",state.focus && "bg-white text-(--glass-action)")}><Moon /></span><span className="text-xs">Focus</span>
        </GlassButton>
        <GlassButton aria-label="Screen mirroring" aria-pressed={mirroring} onClick={()=>setMirroring(!mirroring)} className="h-14 gap-2 px-2.5"><Monitor /><span className="text-xs">Display</span></GlassButton>
      </div>
      <div className="mt-2 flex flex-col gap-2">
        <GlassRangeControl label="Display" kindOfControl="brightness" value={state.brightness} onValueChange={brightness=>update({brightness})} className="glass-chip" />
        <GlassRangeControl label="Sound" value={state.volume} onValueChange={volume=>update({volume})} className="glass-chip" />
      </div>
      <div className="mt-3 flex items-center justify-between px-2 pb-1 text-[10px] text-foreground/50">
        <span className="flex items-center gap-1.5"><Radio className="size-3" /> {state.wifi ? "Connected" : "Offline"}</span>
        <span className="flex items-center gap-1.5"><Sun className="size-3" /> {state.brightness}%</span>
      </div>
    </GlassSurface>
  );
}
