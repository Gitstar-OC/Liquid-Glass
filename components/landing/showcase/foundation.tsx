"use client";

import * as React from "react";
import {
  Bell,
  Command,
  CreditCard,
  Plus,
  Search,
  Settings,
} from "lucide-react";

import { LiquidGlass } from "@/components/liquid-glass";
import {
  GlassAvatar,
  GlassAvatarFallback,
  GlassBadge,
  GlassButton,
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardFooter,
  GlassCardHeader,
  GlassCardTitle,
  GlassInput,
  GlassLabel,
  GlassProgress,
  GlassSeparator,
  GlassSlider,
  GlassSurface,
  GlassSwitch,
} from "@/components/glass";
import { Kbd } from "@/components/ui/kbd";
import { Scene, SceneGrid } from "@/components/landing/scene";

export function FoundationShowcase() {
  const [notifications, setNotifications] = React.useState(true);
  const [depth, setDepth] = React.useState([64]);

  return (
    <SceneGrid>
      <Scene
        span={12}
        title="Floating toolbar"
        description="The nav bar is the smallest real component in the set — a surface, a chip, a field and an avatar sharing one lens."
        components="LiquidGlass · Button · Badge · Avatar · Switch"
        stageClassName="min-h-[168px] p-6 sm:p-10"
      >
        <LiquidGlass
          preset="clear"
          radius={999}
          pad={72}
          className="w-full max-w-[46rem] p-1.5 pl-3"
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2.5">
              <span className="grid size-7 place-items-center rounded-lg bg-foreground text-background">
                <Plus className="size-4" />
              </span>
              <span className="hidden text-[13px] font-semibold tracking-tight sm:block">
                Aperture
              </span>
            </span>

            <span className="hidden h-5 w-px shrink-0 bg-foreground/15 sm:block" />

            <nav className="hidden items-center gap-1 md:flex">
              {["Lenses", "Materials", "Presets"].map((item, i) => (
                <a
                  key={item}
                  href="#components"
                  className={
                    i === 0
                      ? "rounded-full bg-foreground/10 px-3 py-1.5 text-[13px] font-medium text-foreground"
                      : "rounded-full px-3 py-1.5 text-[13px] font-medium text-foreground/60 transition-colors hover:bg-foreground/10 hover:text-foreground"
                  }
                >
                  {item}
                </a>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-2">
              <div className="glass-field hidden h-8 w-40 items-center gap-2 rounded-lg px-2.5 lg:flex">
                <Search className="size-3.5 shrink-0 opacity-50" />
                <span className="truncate text-[12.5px] text-muted-foreground">
                  Search
                </span>
                <Kbd className="ml-auto text-[10px]">
                  <Command className="size-2.5" />K
                </Kbd>
              </div>

              <GlassSwitch
                checked={notifications}
                onCheckedChange={setNotifications}
                aria-label="Notifications"
              />

              <GlassButton
                variant="glass"
                size="icon"
                aria-label="Notifications"
                className="relative"
              >
                <Bell className="size-4" />
                {notifications ? (
                  <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-emerald-400" />
                ) : null}
              </GlassButton>

              <GlassAvatar size="sm">
                <GlassAvatarFallback>AR</GlassAvatarFallback>
              </GlassAvatar>
            </div>
          </div>
        </LiquidGlass>
      </Scene>

      <Scene
        span={6}
        title="Settings card"
        description="The everyday surface: header, labelled fields, a slider, a switch and a footer with intent."
        components="Card · Label · Input · Slider · Switch · Button"
      >
        <GlassCard className="w-full max-w-sm">
          <GlassCardHeader>
            <div className="flex items-start justify-between gap-4">
              <GlassCardTitle>Lens settings</GlassCardTitle>
              <GlassBadge className="shrink-0">Clear</GlassBadge>
            </div>
            <GlassCardDescription>
              Controls apply to every surface in this family.
            </GlassCardDescription>
          </GlassCardHeader>

          <GlassCardContent className="space-y-5">
            <div className="grid gap-2">
              <GlassLabel htmlFor="scene-label">Label</GlassLabel>
              <GlassInput id="scene-label" defaultValue="Primary nav" />
            </div>

            <div className="grid gap-2.5">
              <div className="flex items-baseline justify-between">
                <GlassLabel htmlFor="scene-depth">Refraction depth</GlassLabel>
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                  {depth[0]}
                </span>
              </div>
              <GlassSlider
                id="scene-depth"
                value={depth}
                onValueChange={setDepth}
                max={120}
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-foreground/8 px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-[13px] font-medium">Adaptive ink</p>
                <p className="truncate text-[12px] text-muted-foreground">
                  Sample the backdrop before choosing.
                </p>
              </div>
              <GlassSwitch defaultChecked aria-label="Adaptive ink" />
            </div>
          </GlassCardContent>

          <GlassCardFooter className="justify-end gap-2">
            <GlassButton variant="ghost">Reset</GlassButton>
            <GlassButton variant="glass-strong">Apply</GlassButton>
          </GlassCardFooter>
        </GlassCard>
      </Scene>

      <Scene
        span={6}
        title="Status rail"
        description="Badges, meters and keyboard hints share the optical scale instead of each inventing their own."
        components="Badge · Progress · Avatar · Separator · Kbd"
      >
        <GlassSurface kind="card" className="w-full max-w-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <GlassAvatar>
                <GlassAvatarFallback>LG</GlassAvatarFallback>
              </GlassAvatar>
              <div className="leading-tight">
                <p className="text-[13px] font-medium">Aperture</p>
                <p className="text-[12px] text-muted-foreground">5 materials</p>
              </div>
            </div>
            <GlassBadge className="gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Live
            </GlassBadge>
          </div>

          <GlassSeparator className="my-5 bg-foreground/10" />

          <div className="space-y-4">
            {[
              ["Refraction", 72],
              ["Saturation", 38],
            ].map(([label, value]) => (
              <div key={label as string} className="grid gap-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-[12.5px] text-muted-foreground">
                    {label}
                  </span>
                  <span className="font-mono text-[11px] tabular-nums text-foreground/70">
                    {value}%
                  </span>
                </div>
                <GlassProgress value={value as number} />
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
              <Settings className="size-3.5" />
              Rebuild the map
            </div>
            <div className="flex items-center gap-1">
              <Kbd>⌘</Kbd>
              <Kbd>⇧</Kbd>
              <Kbd>M</Kbd>
            </div>
          </div>
        </GlassSurface>
      </Scene>

      <Scene
        span={12}
        title="Intent"
        description="Every variant in the scale, on one baseline. Semantic buttons keep their meaning; glass is an opt-in layer on top of it."
        components="Button · Badge · Avatar"
        stageClassName="min-h-[190px] p-6 sm:p-8"
      >
        <div className="flex w-full max-w-3xl flex-col items-center gap-6">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {(
              [
                "default",
                "secondary",
                "outline",
                "ghost",
                "glass",
                "glass-strong",
              ] as const
            ).map((variant) => (
              <GlassButton key={variant} variant={variant}>
                {variant === "glass-strong" ? "Primary" : variant}
              </GlassButton>
            ))}
            <GlassButton variant="destructive">Delete</GlassButton>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <GlassButton variant="glass" size="sm">
              Small
            </GlassButton>
            <GlassButton variant="glass">Medium</GlassButton>
            <GlassButton variant="glass" size="lg">
              Large
            </GlassButton>
            <GlassButton variant="glass" size="icon" aria-label="Billing">
              <CreditCard className="size-4" />
            </GlassButton>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {(["default", "secondary", "outline", "destructive"] as const).map(
              (variant) => (
                <GlassBadge key={variant} variant={variant}>
                  {variant}
                </GlassBadge>
              ),
            )}
          </div>
        </div>
      </Scene>
    </SceneGrid>
  );
}
