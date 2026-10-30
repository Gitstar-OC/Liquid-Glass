"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { GlassAtlas } from "@/components/glass-atlas";
import { GlassScene, GlassSettingsProvider } from "@/components/glass-scene";
import { GlassButton } from "@/components/glass/glass-button";
import { GlassIcon } from "@/components/glass/glass-icons";
import { GlassSurface } from "@/components/glass/glass-surface";
import { useGlassTheme } from "@/components/glass/glass-theme-provider";
import { LiquidMark } from "@/components/landing/liquid-mark";
import { ShowcaseDock } from "@/components/landing/showcase-dock";
import {
  HomeExample,
  HOME_EXAMPLES,
  type HomeExampleId,
} from "@/components/landing/home-examples";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export function GlassCollection() {
  const { resolvedMode: theme, setMode } = useGlassTheme();
  const dark = theme === "dark";
  const [selected, setSelected] = useState<HomeExampleId>("slider");
  const [refraction, setRefraction] = useState(true);
  const [previewActive, setPreviewActive] = useState(false);
  useEffect(() => {
    const openSharedPreview = () => {
      if (window.location.hash === "#profile-preview") setSelected("popover");
    };
    openSharedPreview();
    window.addEventListener("hashchange", openSharedPreview);
    return () => window.removeEventListener("hashchange", openSharedPreview);
  }, []);

  const example = HOME_EXAMPLES.find((item) => item.id === selected)!;
  const neutral = <div className="absolute inset-0 bg-background" />;

  return (
    <section
      className={cn("home-glass", dark ? "showcase-dark" : "showcase-light")}
      data-testid="collection-stage"
      data-theme={theme}
      aria-label="Live glass collection"
    >
      <GlassSettingsProvider
        surface="clear"
        ink={dark ? "light" : "dark"}
        themeBehavior="duotheme"
        config={{
          glint: 75,
          tint: dark ? 0.045 : 0.02,
          tintColor: dark ? "#ffffff" : "#000000",
        }}
        optics={{ colorBleed: 0 }}
      >
        <div className="home-layout">
          <div className="home-intro">
            <LiquidMark variant="landing" />
            <h1>Liquid Glass</h1>

            <GlassScene
              appearance={theme}
              content={neutral}
              className="home-links-scene"
            >
              <GlassAtlas>
                <div className="home-links">
                  {(
                    [
                      { href: "/playground", label: "Playground" },
                      { href: "/docs", label: "Documentation" },
                    ] as const
                  ).map((action) => (
                    <GlassButton key={action.href} asChild variant="ghost">
                      <GlassSurface asChild radius={999} tintBlendMode="normal">
                        <Link href={action.href}>
                          {action.label}
                          {action.href === "/playground" && (
                            <GlassIcon name="arrow" />
                          )}
                        </Link>
                      </GlassSurface>
                    </GlassButton>
                  ))}
                </div>
              </GlassAtlas>
            </GlassScene>
          </div>

          <div className="home-showcase">
            <div className="home-example-heading">
              <span>{example.name}</span>
              <Link
                href={`/docs/${example.doc}`}
                className="inline-flex h-10 items-center gap-1.5 hover:text-foreground"
              >
                View code <GlassIcon name="diagonal" className="size-3.5" />
              </Link>
            </div>

            <GlassSettingsProvider refraction={refraction}>
              <div
                className="home-control-stage"
                data-testid="home-active-example"
                data-example={selected}
                role="region"
                aria-label={`${example.name} example`}
              >
                <HomeExample
                  key={selected}
                  id={selected}
                  previewActive={previewActive}
                />
              </div>
            </GlassSettingsProvider>

            <div className="home-example-controls">
              <ToggleGroup
                type="single"
                value={selected}
                onValueChange={(next) =>
                  next && setSelected(next as HomeExampleId)
                }
                aria-label="Example"
                spacing={0}
                className="home-example-choices"
              >
                {HOME_EXAMPLES.map((item) => (
                  <ToggleGroupItem key={item.id} value={item.id}>
                    {item.name}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>

              <GlassButton
                variant="ghost"
                aria-pressed={refraction}
                onClick={() => setRefraction((value) => !value)}
                className="h-10 px-2 text-xs text-foreground/60"
              >
                Refraction {refraction ? "on" : "off"}
              </GlassButton>
            </div>

            <div className="grid min-h-12 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-2">
              <p className="home-example-hint m-0!" aria-live="polite">
                {example.hint}
              </p>

              {(selected === "slider" || selected === "switch") && (
                <button
                  type="button"
                  aria-pressed={previewActive}
                  onClick={() => setPreviewActive((value) => !value)}
                  className="h-9 shrink-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  {previewActive ? "Return to resting" : "Inspect active state"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="home-dock-position">
          <GlassScene appearance={theme} content={neutral} className="w-fit">
            <ShowcaseDock
              dark={dark}
              onThemeChange={() => setMode(dark ? "light" : "dark")}
            />
          </GlassScene>
        </div>
      </GlassSettingsProvider>
    </section>
  );
}
