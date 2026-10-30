"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
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
  GlassCommandFooter,
  GlassCommandSeparator,
} from "@/components/glass/glass-command";
import { cn } from "@/lib/utils";

export interface GlassSpotlightCommand {
  id: string;
  label: string;
  group?: string;
  icon?: ReactNode;
  shortcut?: string;
  description?: string;
  keywords?: string[];
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
      />
      <GlassCommandList className="max-h-[min(380px,50dvh)] scroll-py-2 p-2">
        <GlassCommandEmpty>No results found.</GlassCommandEmpty>
        {groups.map((group, index) => (
          <Fragment key={group}>
            {index > 0 && (
              <GlassCommandSeparator className="mx-1 my-2 bg-foreground/8" />
            )}
            <GlassCommandGroup
              heading={group}
              className="p-0 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:text-foreground/50"
            >
              {commands
                .filter((command) => (command.group ?? "Suggestions") === group)
                .map((command) => (
                  <GlassCommandItem
                    key={command.id}
                    value={command.label}
                    keywords={command.keywords}
                    disabled={command.disabled}
                    onSelect={() => {
                      onCommandSelect?.();
                      command.onSelect();
                    }}
                  >
                    {command.icon && (
                      <span
                        aria-hidden="true"
                        className="grid size-5 shrink-0 place-items-center text-foreground/60 [&_svg]:size-4"
                      >
                        {command.icon}
                      </span>
                    )}
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {command.label}
                    </span>
                    {command.description && (
                      <span className="ml-auto hidden text-xs text-foreground/45 sm:block">
                        {command.description}
                      </span>
                    )}
                    {command.shortcut && (
                      <GlassCommandShortcut>
                        {command.shortcut}
                      </GlassCommandShortcut>
                    )}
                  </GlassCommandItem>
                ))}
            </GlassCommandGroup>
          </Fragment>
        ))}
      </GlassCommandList>
      <GlassCommandFooter />
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
      className={cn("w-full max-w-[520px] overflow-hidden", className)}
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
  triggerAriaLabel?: string;
}
export function GlassSpotlight({
  open,
  defaultOpen = false,
  onOpenChange,
  container,
  shortcut = false,
  title = "Spotlight",
  triggerLabel = "Search anything…",
  triggerAriaLabel,
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
        composite={false}
        aria-label={triggerAriaLabel}
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
        config={config}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          triggerRef.current?.focus();
        }}
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
