"use client";

import { useState } from "react";
import { RadioGroup } from "radix-ui";
import { GlassIcon, type GlassIconName } from "@/components/glass/glass-icons";
import {
  GlassSurface,
  type GlassSurfaceProps,
} from "@/components/glass/glass-surface";
import { GlassSwitch } from "@/components/glass/glass-switch";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface GlassConnectivityProps extends Omit<
  GlassSurfaceProps,
  "children" | "onChange" | "defaultValue"
> {
  defaultEnabled?: boolean;
  onEnabledChange?: (enabled: boolean) => void;
  onVisibilityChange?: (value: string) => void;
}

export function GlassConnectivity({
  defaultEnabled = true,
  onEnabledChange,
  onVisibilityChange,
  className,
  radius = 20,
  ...props
}: GlassConnectivityProps) {
  const [enabled, setEnabled] = useState(defaultEnabled);
  const [visibility, setVisibility] = useState("contacts");
  return (
    <GlassSurface
      shape="squircle"
      {...props}
      radius={radius}
      className={cn("w-full max-w-[304px] p-2.5", className)}
    >
      <div className="flex min-h-7 items-center justify-between gap-4 px-1">
        <h3 className="flex items-center gap-2 text-[13px] font-semibold">
          AirDrop
        </h3>
        <GlassSwitch
          aria-label="AirDrop"
          checked={enabled}
          onCheckedChange={(next) => {
            setEnabled(next);
            onEnabledChange?.(next);
          }}
        />
      </div>
      <Separator className="my-1.5 bg-foreground/8" />
      <RadioGroup.Root
        aria-label="AirDrop visibility"
        value={visibility}
        disabled={!enabled}
        onValueChange={(next) => {
          setVisibility(next);
          onVisibilityChange?.(next);
        }}
        className="flex flex-col"
      >
        {[
          {
            value: "contacts",
            label: "Contacts only",
            icon: "airdrop" as GlassIconName,
          },
          {
            value: "everyone",
            label: "Everyone",
            icon: "people" as GlassIconName,
          },
        ].map(({ value, label, icon }) => (
          <RadioGroup.Item
            key={value}
            value={value}
            className="glass-choice-row group flex min-h-9 items-center gap-2.5 rounded-xl px-1 text-left text-xs outline-none hover:bg-foreground/4 focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-35"
          >
            <span className="glass-control-icon size-7 group-data-[state=checked]:bg-(--glass-action) group-data-[state=checked]:text-white">
              <GlassIcon name={icon} className="size-4" />
            </span>
            <span className="flex-1 font-medium">{label}</span>
            <RadioGroup.Indicator>
              <GlassIcon name="check" className="size-3.5 opacity-65" />
            </RadioGroup.Indicator>
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
    </GlassSurface>
  );
}
