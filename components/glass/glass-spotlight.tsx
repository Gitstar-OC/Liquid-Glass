"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUp, ArrowDown, CornerDownLeft } from "lucide-react";
import type { LensParams } from "@/lib/glass";
import { GlassSurface } from "@/components/glass/glass-surface";
import { GlassIcon } from "@/components/glass/glass-icons";
import { GlassButton } from "@/components/glass/glass-button";
import {
  GlassCommand,
  GlassCommandInput,
  GlassCommandList,
  GlassCommandEmpty,
  GlassCommandGroup,
  GlassCommandItem,
  GlassCommandShortcut,
  GlassCommandDialog,
} from "@/components/glass/glass-command";
import { cn } from "@/lib/utils";

export interface GlassSpotlightCommand {
  id: string;
  label: string;
  group?: string;
  icon?: ReactNode;
  shortcut?: string;
  disabled?: boolean;
  onSelect: () => void;
}
export interface GlassSpotlightPanelProps {
  commands: readonly GlassSpotlightCommand[];
  placeholder?: string;
  className?: string;
  config?: Partial<LensParams>;
  onCommandSelect?: () => void;
}
function SpotlightCommands({
  commands,
  placeholder = "Search anything…",
  onCommandSelect,
}: GlassSpotlightPanelProps) {
  const groups = [
    ...new Set(commands.map((command) => command.group ?? "Suggestions")),
  ];
  return (
    <GlassCommand label="Spotlight">
      <GlassCommandInput
        aria-label="Search commands"
        placeholder={placeholder}
        className="text-sm"
      />
      <GlassCommandList className="max-h-64">
        <GlassCommandEmpty>No results found.</GlassCommandEmpty>
        {groups.map((group) => (
          <GlassCommandGroup key={group} heading={group}>
            {commands
              .filter((command) => (command.group ?? "Suggestions") === group)
              .map((command) => (
                <GlassCommandItem
                  key={command.id}
                  className="min-h-12 gap-3 rounded-xl px-3 text-[13px] data-selected:bg-foreground/12"
                  value={command.label}
                  disabled={command.disabled}
                  onSelect={() => {
                    onCommandSelect?.();
                    command.onSelect();
                  }}
                >
                  {command.icon && (
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-foreground/10 [&_svg]:size-3.5">
                      {command.icon}
                    </span>
                  )}
                  <span>{command.label}</span>
                  {command.shortcut && (
                    <GlassCommandShortcut>
                      {command.shortcut}
                    </GlassCommandShortcut>
                  )}
                </GlassCommandItem>
              ))}
          </GlassCommandGroup>
        ))}
      </GlassCommandList>
      <div className="mt-2 flex items-center justify-between border-t border-foreground/10 px-3 pt-3 pb-1 text-[10px] text-foreground/60">
        <span className="flex items-center gap-1">
          <ArrowUp aria-hidden="true" className="size-3" />
          <ArrowDown aria-hidden="true" className="mr-1 size-3" /> Navigate
        </span>
        <span className="flex items-center gap-1.5">
          <CornerDownLeft aria-hidden="true" className="size-3" /> Open
        </span>
      </div>
    </GlassCommand>
  );
}
export function GlassSpotlightPanel({
  className,
  config,
  ...props
}: GlassSpotlightPanelProps) {
  return (
    <GlassSurface
      kind="command"
      surface="clear"
      config={config}
      className={cn("w-full max-w-[400px] p-3", className)}
    >
      <SpotlightCommands {...props} />
    </GlassSurface>
  );
}
export interface GlassSpotlightProps extends GlassSpotlightPanelProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  container?: HTMLElement | null;
  shortcut?: boolean;
  title?: string;
  triggerLabel?: string;
}
export function GlassSpotlight({
  open,
  defaultOpen = false,
  onOpenChange,
  container,
  shortcut = false,
  title = "Spotlight",
  triggerLabel = "Search anything…",
  className,
  config,
  ...props
}: GlassSpotlightProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [local, setLocal] = useState(defaultOpen);
  const visible = open ?? local;
  const change = (next: boolean) => {
    if (open === undefined) setLocal(next);
    onOpenChange?.(next);
  };
  useEffect(() => {
    if (!shortcut) return;
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open === undefined) setLocal((value) => !value);
        onOpenChange?.(!visible);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [shortcut, open, visible, onOpenChange]);
  return (
    <>
      <GlassButton
        ref={triggerRef}
        className={cn(
          "h-14 w-full max-w-sm justify-start gap-3 px-5 text-lg font-normal text-foreground/65",
          className,
        )}
        onClick={() => change(true)}
      >
        <GlassIcon name="search" data-icon="inline-start" />
        <span className="flex-1 text-left">{triggerLabel}</span>
        {shortcut && (
          <kbd className="rounded-md border border-foreground/10 px-1.5 py-1 text-[10px]">
            ⌘ K
          </kbd>
        )}
      </GlassButton>
      <GlassCommandDialog
        title={title}
        description="Search for an action to run."
        open={visible}
        onOpenChange={change}
        container={container}
        config={{ blur: 8, ...config }}
        onCloseAutoFocus={event => { event.preventDefault(); triggerRef.current?.focus(); }}
      >
        <SpotlightCommands
          {...props}
          onCommandSelect={() => {
            props.onCommandSelect?.();
            change(false);
          }}
        />
      </GlassCommandDialog>
    </>
  );
}
