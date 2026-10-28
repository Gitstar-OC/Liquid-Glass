"use client";
import * as React from "react";
import { Popover } from "radix-ui";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command } from "cmdk";
import { GlassButton } from "@/components/glass/glass-button";
import { GlassSurface } from "@/components/glass/glass-surface";
import { GlassCommandInput } from "@/components/glass/glass-command";
import { useGlassFormField } from "@/components/glass/glass-form";
import { cn } from "@/lib/utils";
export interface GlassComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface GlassComboboxProps {
  options: GlassComboboxOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  name?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}
export function GlassCombobox({
  options,
  value,
  defaultValue = "",
  onValueChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search…",
  emptyMessage = "No results found.",
  name,
  className,
  disabled,
  id,
  ...aria
}: GlassComboboxProps) {
  const field = useGlassFormField();
  const [open, setOpen] = React.useState(false);
  const [local, setLocal] = React.useState(defaultValue);
  const selected = value ?? local;
  const current = options.find((option) => option.value === selected);
  const change = (next: string) => {
    if (value === undefined) setLocal(next);
    onValueChange?.(next);
    setOpen(false);
  };
  return (
    <>
      {name && (
        <input type="hidden" name={name} value={selected} disabled={disabled} />
      )}
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <GlassButton
            id={id ?? field?.id}
            aria-describedby={field?.describedBy}
            aria-invalid={field?.invalid || undefined}
            {...aria}
            role="combobox"
            aria-expanded={open}
            aria-label={aria["aria-label"] ?? placeholder}
            disabled={disabled}
            className={cn("h-10 w-full justify-between font-normal", className)}
          >
            {current?.label ?? (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="size-3.5 opacity-40" />
          </GlassButton>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={6}
            className="z-60 w-(--radix-popover-trigger-width) outline-none"
          >
            <GlassSurface kind="select" className="overflow-hidden p-1">
              <Command>
                <GlassCommandInput placeholder={searchPlaceholder} />
                <Command.List className="max-h-56 overflow-auto p-1">
                  <Command.Empty className="px-3 py-5 text-center text-xs text-muted-foreground">
                    {emptyMessage}
                  </Command.Empty>
                  {options.map((option) => (
                    <Command.Item
                      key={option.value}
                      value={option.label}
                      disabled={option.disabled}
                      onSelect={() => change(option.value)}
                      className="flex cursor-pointer items-center justify-between rounded-md px-2 py-2.5 text-xs outline-none data-[disabled=true]:opacity-40 data-[selected=true]:bg-foreground/8"
                    >
                      {option.label}
                      {selected === option.value && (
                        <Check className="size-3.5" />
                      )}
                    </Command.Item>
                  ))}
                </Command.List>
              </Command>
            </GlassSurface>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </>
  );
}
