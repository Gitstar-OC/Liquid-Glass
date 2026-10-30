"use client";

import { useId, useState } from "react";
import { GlassSlider as Slider } from "@/components/glass/glass-slider";
import { GlassInput as Input } from "@/components/glass/glass-input";
import {
  Select,
  GlassSelectTrigger as SelectTrigger,
  GlassSelectContent as SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectValue,
} from "@/components/glass/glass-select";
import { CURATED_BACKDROPS, DEMO_PHOTOS } from "@/lib/demo-assets";
import { cn } from "@/lib/utils";

export function ParameterSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onValueChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onValueChange: (value: number) => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const commit = () => {
    const next = Number(draft);
    if (draft !== null && draft.trim() && Number.isFinite(next))
      onValueChange(Math.max(min, Math.min(max, next)));
    setDraft(null);
  };
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-3">
        <label id={id} className="text-xs font-medium text-foreground/80">
          {label}
        </label>
        <div className="flex h-7 items-center gap-1 glass-field rounded-[12px] pr-2 text-[11px] text-muted-foreground focus-within:border-ring">
          <Input
            aria-label={`${label} value`}
            type="number"
            min={min}
            max={max}
            step={step}
            value={draft ?? Number(value.toFixed(3))}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commit}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                commit();
                event.currentTarget.blur();
              }
              if (event.key === "Escape") setDraft(null);
            }}
            className="h-full w-14 rounded-none border-0 bg-transparent px-1.5 text-right text-[11px] shadow-none focus-visible:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          {unit && <span aria-hidden="true">{unit}</span>}
        </div>
      </div>
      <Slider
        aria-labelledby={id}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([next]) => onValueChange(next)}
        className="min-h-5"
      />
    </div>
  );
}

export function OptionSelect({
  label,
  value,
  onValueChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        aria-label={label}
        className={cn("h-10 min-w-28", className)}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        position="popper"
        align="start"
        className="site-shell max-h-80"
      >
        <SelectGroup>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="py-2 text-xs"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export function BackdropPicker({
  value,
  onValueChange,
  label = "Backdrop",
  className,
}: {
  value: keyof typeof DEMO_PHOTOS;
  onValueChange: (value: keyof typeof DEMO_PHOTOS) => void;
  label?: string;
  className?: string;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onValueChange(next as keyof typeof DEMO_PHOTOS)}
    >
      <SelectTrigger
        aria-label={label}
        className={cn("h-10 gap-2 font-normal", className)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={DEMO_PHOTOS[value].src}
          alt=""
          className="size-4 rounded-sm object-cover"
        />
        <SelectValue>
          <span className="capitalize">{value}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        position="popper"
        align="start"
        className="site-shell w-60"
      >
        <SelectGroup>
          <SelectLabel>Choose a backdrop</SelectLabel>
          {CURATED_BACKDROPS.map((key) => (
            <SelectItem key={key} value={key} textValue={key}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/images/${key}-640.webp`}
                alt=""
                width={64}
                height={40}
                className="h-10 w-16 rounded-lg object-cover"
              />
              <span className="capitalize">{key}</span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
