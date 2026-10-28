"use client";

import * as React from "react";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  GLASS_KINDS,
  GLASS_SURFACES,
  SURFACE_LABELS,
  type GlassKind,
  type GlassSurface,
} from "@/lib/glass-theme";
import {
  useGlassTheme,
  type GlassModeSetting,
} from "@/components/glass/glass-theme-provider";

const MODE_OPTIONS: {
  value: GlassModeSetting;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "light", label: "Light", icon: <SunIcon className="size-3.5" /> },
  { value: "dark", label: "Dark", icon: <MoonIcon className="size-3.5" /> },
  {
    value: "system",
    label: "System",
    icon: <MonitorIcon className="size-3.5" />,
  },
];

/**
 * Keyboard behaviour for a `role="radiogroup"`.
 *
 * ARIA requires a radio group to be a single tab stop whose arrow keys move
 * between radios — and, for a single-select group, moving focus also selects.
 * Without this every radio sits in the tab order and arrow keys do nothing, so
 * the control is unusable by keyboard.
 */
function useRadioGroupKeyboard(
  count: number,
  onSelect: (index: number) => void,
) {
  const [focused, setFocused] = React.useState(0);
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const goTo = React.useCallback(
    (index: number) => {
      const next = ((index % count) + count) % count;
      setFocused(next);
      onSelect(next);
      refs.current[next]?.focus();
    },
    [count, onSelect],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const deltas: Record<string, number> = {
        ArrowRight: 1,
        ArrowDown: 1,
        ArrowLeft: -1,
        ArrowUp: -1,
      };
      const delta = deltas[event.key];
      if (delta !== undefined) {
        event.preventDefault();
        goTo(focused + delta);
      } else if (event.key === "Home") {
        event.preventDefault();
        goTo(0);
      } else if (event.key === "End") {
        event.preventDefault();
        goTo(count - 1);
      }
    },
    [count, focused, goTo],
  );

  // Only the focused radio is reachable by Tab.
  const tabIndexFor = (index: number) => (index === focused ? 0 : -1);

  return { focused, setFocused, refs, onKeyDown, tabIndexFor };
}

export function GlassModeToggle({ className }: { className?: string }) {
  const { mode, setMode } = useGlassTheme();
  const select = React.useCallback(
    (index: number) => {
      const opt = MODE_OPTIONS[index];
      if (opt) setMode(opt.value);
    },
    [setMode],
  );
  const { setFocused, refs, onKeyDown, tabIndexFor } = useRadioGroupKeyboard(
    MODE_OPTIONS.length,
    select,
  );

  return (
    <div
      role="radiogroup"
      aria-label="Glass theme"
      onKeyDown={onKeyDown}
      className={cn(
        "glass-chip flex items-center gap-0.5 rounded-full p-0.5",
        className,
      )}
    >
      {MODE_OPTIONS.map((opt, index) => (
        <button
          key={opt.value}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="button"
          role="radio"
          aria-checked={mode === opt.value}
          // The label is hidden below `sm`, so the icon alone must not be the
          // accessible name.
          aria-label={opt.label}
          data-testid={`mode-${opt.value}`}
          tabIndex={tabIndexFor(index)}
          onFocus={() => setFocused(index)}
          onClick={() => setMode(opt.value)}
          className={cn(
            "flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
            "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
            mode === opt.value
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opt.icon}
          <span className="hidden sm:inline">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

export function SurfacePicker({
  kind,
  value,
  onValue,
  allowAuto = true,
  testIdPrefix,
  className,
}: {
  kind?: GlassKind;
  value?: GlassSurface | undefined;
  onValue: (surface: GlassSurface | null) => void;
  allowAuto?: boolean;
  testIdPrefix?: string;
  className?: string;
}) {
  const showAuto = allowAuto && !kind;
  const options = React.useMemo<(GlassSurface | null)[]>(
    () => [...(showAuto ? [null] : []), ...GLASS_SURFACES],
    [showAuto],
  );
  const select = React.useCallback(
    (index: number) => {
      const next = options[index];
      if (next !== undefined) onValue(next);
    },
    [onValue, options],
  );
  const { setFocused, refs, onKeyDown, tabIndexFor } = useRadioGroupKeyboard(
    options.length,
    select,
  );
  const label = (surface: GlassSurface | null) =>
    surface === null ? "Auto" : SURFACE_LABELS[surface];

  return (
    <div
      role="radiogroup"
      aria-label={kind ? `Surface for ${kind}` : "Global glass surface"}
      onKeyDown={onKeyDown}
      className={cn(
        "glass-chip flex flex-wrap items-center gap-0.5 rounded-full p-0.5",
        className,
      )}
    >
      {options.map((s, index) => {
        const isSelected = s === (value ?? null);
        return (
          <button
            key={s ?? "auto"}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={label(s)}
            data-testid={`${testIdPrefix ?? "surface"}-${s ?? "auto"}`}
            tabIndex={tabIndexFor(index)}
            onFocus={() => setFocused(index)}
            onClick={() => onValue(s)}
            className={cn(
              "cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
              "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
              isSelected
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label(s)}
          </button>
        );
      })}
    </div>
  );
}

/** Global picker that re-pours every component family at once. */
export function GlobalSurfacePicker() {
  const { surfaces, setSurface, resetSurfaces } = useGlassTheme();
  const allSame = (() => {
    const values = Object.values(surfaces).filter(Boolean) as GlassSurface[];
    if (values.length === 0) return undefined;
    return values.every((v) => v === values[0])
      ? values[0]
      : ("mixed" as const);
  })();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SurfacePicker
        value={
          typeof allSame === "string" && allSame !== "mixed"
            ? allSame
            : undefined
        }
        onValue={(s) => {
          if (s === null) resetSurfaces();
          else for (const k of GLASS_KINDS) setSurface(k, s);
        }}
        testIdPrefix="global-surface"
      />
    </div>
  );
}
