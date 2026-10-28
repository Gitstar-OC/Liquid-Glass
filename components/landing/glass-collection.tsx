"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { GlassAtlas } from "@/components/glass-atlas";
import { GlassScene, GlassSettingsProvider, type GlassThemeBehavior } from "@/components/glass-scene";
import { GlassSurface } from "@/components/glass/glass-surface";
import { GlassElasticButton } from "@/components/glass/glass-elastic-button";
import { GlassSwitch } from "@/components/glass/glass-switch";
import { GlassButton } from "@/components/glass/glass-button";
import { GlassIcon } from "@/components/glass/glass-icons";
import { GlassSaveButton } from "@/components/glass/glass-state-button";
import { GlassStateSwap } from "@/components/glass/glass-state-swap";
import { GlassConnectivity } from "@/components/glass/glass-connectivity";
import { GlassRangeControl } from "@/components/glass/glass-range-control";
import { GlassMusicPlayer } from "@/components/glass/glass-music-player";
import { GlassSpotlight } from "@/components/glass/glass-spotlight";
import { GlassNavbar } from "@/components/glass/glass-navbar";
import { GlassToaster } from "@/components/glass/glass-toaster";
import { GlassToggleGroup, GlassToggleGroupItem } from "@/components/glass/glass-toggle";
import { useGlassTheme } from "@/components/glass/glass-theme-provider";
import { Drawer, DrawerTrigger, GlassDrawerContent, DrawerTitle, DrawerDescription, DrawerClose } from "@/components/glass/glass-drawer";
import { SceneBackdrop } from "@/components/site/scene-backdrop";
import { ShowcaseDock } from "@/components/landing/showcase-dock";
import { LiquidMark } from "@/components/landing/liquid-mark";
import { BookmarkControl, NotificationControl, MessagePreview, LeaveSitePreview, ShutdownPreview, QuickActions } from "@/components/landing/home-actions";
import { TRACKS } from "@/components/landing/featured-components";
import { COMPONENT_CATALOGUE } from "@/components/gallery/catalogue";
import { useShowcaseScroll } from "@/hooks/use-showcase-scroll";
import { cn } from "@/lib/utils";
import { GLASS_DEFAULT_PARAMS } from "@/lib/glass";

/** Related shapes share one source; each example has a real, bounded interaction. */
export function GlassCollection() {
  const router = useRouter();
  const { resolvedMode: theme, setMode } = useGlassTheme();
  const [themeBehavior, setThemeBehavior] = useState<GlassThemeBehavior>("unitheme");
  const [volume, setVolume] = useState(58), [focus, setFocus] = useState(false);
  const [refraction, setRefraction] = useState(true), [edges, setEdges] = useState(false);
  const [backdrop, setBackdrop] = useState<"photos" | "plain">("photos");
  const [animateTheme, setAnimateTheme] = useState(false), [view, setView] = useState("library");
  const [track, setTrack] = useState(0), [expanded, setExpanded] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const portalRef = useRef<HTMLDivElement>(null), stageRef = useRef<HTMLDivElement>(null);
  const mountPortal = useCallback((node: HTMLDivElement | null) => { portalRef.current = node; setContainer(node); }, []);
  const drawerTrigger = useRef<HTMLButtonElement | null>(null);
  const rememberTrigger = (event: MouseEvent<HTMLButtonElement>) => { drawerTrigger.current = event.currentTarget; };
  const fitPortal = useCallback((open: boolean) => {
    if (!open || !portalRef.current || !stageRef.current) return;
    const bounds = stageRef.current.getBoundingClientRect();
    portalRef.current.style.height = `${Math.max(0, Math.min(innerHeight, bounds.bottom) - Math.max(0, bounds.top))}px`;
  }, []);
  useEffect(() => { const resize = () => fitPortal(true); window.addEventListener("resize", resize); return () => window.removeEventListener("resize", resize); }, [fitPortal]);
  const story = useRef<HTMLElement>(null), ocean = useRef<HTMLDivElement>(null), dunes = useRef<HTMLDivElement>(null);
  useShowcaseScroll(story, ocean, dunes, true);
  const commands = useMemo(() => COMPONENT_CATALOGUE.map(item => ({ id: item.id, label: item.title, group: item.group, icon: <GlassIcon name="arrow" />, onSelect: () => router.push(`/docs/${item.id}`) })), [router]);
  const dark = theme === "dark";
  const changeTheme = () => setMode(dark ? "light" : "dark");
  return <section ref={story} className="showcase-story" data-scroll-enabled="true" aria-label="Live glass collection">
    <div className="showcase-pin"><div ref={stageRef} className={cn("showcase-stage relative isolate", dark ? "showcase-dark" : "showcase-light")} data-testid="collection-stage" data-theme={theme} data-show-edges={edges} data-backdrop={backdrop} data-theme-behavior={themeBehavior}>
      <GlassSettingsProvider surface="clear" refraction={refraction} showOutlines={edges} themeBehavior={themeBehavior} ink={themeBehavior === "duotheme" ? (dark ? "light" : "dark") : "auto"} config={{ ...GLASS_DEFAULT_PARAMS, blur: backdrop === "plain" ? 0 : GLASS_DEFAULT_PARAMS.blur, tint: dark ? .035 : .025, tintColor: dark ? "#161920" : "#ffffff" }}>
        <GlassScene appearance={theme} frameRate={30} className="showcase-scene" content={<div className="showcase-source absolute inset-0 overflow-hidden bg-background" aria-hidden="true">
          <div className="absolute inset-0" style={{ opacity: backdrop === "plain" ? 0 : 1 }}>
            <div className="absolute inset-0"><SceneBackdrop photo={dark ? "ice" : "dunes"} priority /></div>
            <div ref={ocean} className="showcase-photo showcase-photo-ocean" style={{ opacity: 0 }}><SceneBackdrop photo="ocean" /></div>
            <div ref={dunes} className="showcase-photo showcase-photo-dunes" style={{ opacity: 0 }}><SceneBackdrop photo={dark ? "dunes" : "ice"} /></div>
            {dark && <div className="showcase-night-mask absolute inset-0" />}
          </div>
          <div className="showcase-photo-veil absolute inset-0" />
        </div>}>
          <GlassAtlas className="showcase-atlas">
            <div className="showcase-composition relative">
              <div className="showcase-intro">
                <LiquidMark variant="landing" />
                <h1>Liquid Glass</h1>
                <div className="showcase-cta flex flex-wrap gap-2.5">
                  {([
                    { href: "/components", label: "Components", icon: "arrow" },
                    { href: "/docs", label: "Documentation", icon: null },
                  ] as const).map(action => (
                    <GlassButton key={action.href} asChild variant="ghost">
                      <GlassSurface asChild radius={999} ink={dark ? "light" : "dark"}
                        config={{ tint: dark ? .06 : .035, tintColor: dark ? "#ffffff" : "#000000" }}
                        tintBlendMode="normal">
                        <Link href={action.href}>{action.label}{action.icon && <GlassIcon name={action.icon} data-icon="inline-end" />}</Link>
                      </GlassSurface>
                    </GlassButton>
                  ))}
                </div>
              </div>
              <Drawer shouldScaleBackground={false} noBodyStyles onOpenChange={fitPortal}>
                <div className="showcase-examples">
                  <div className="showcase-middle flex min-w-0 flex-col items-end gap-3">
                    <div className="showcase-circles flex items-center justify-end gap-2.5">
                      <BookmarkControl />
                      <GlassButton className="h-11 w-[68px] px-3 text-xs" aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} onClick={event => { setAnimateTheme(event.detail > 0); changeTheme(); }}><GlassStateSwap active={dark} animate={animateTheme} from={<span>Dark</span>} to={<span>Light</span>} /></GlassButton>
                      <NotificationControl />
                      <DrawerTrigger asChild><GlassButton shape="circle" className="size-11" onClick={rememberTrigger} aria-label="Open library drawer"><GlassIcon name="drawer" /></GlassButton></DrawerTrigger>
                    </div>
                    <div className="showcase-player-slot relative h-[68px] w-full" onKeyDown={event => { if (event.key === "Escape") setExpanded(false); }}>
                      <GlassMusicPlayer tracks={TRACKS} trackIndex={track} onTrackChange={setTrack} expandable expanded={expanded} onExpandedChange={setExpanded} volume={volume / 100} onVolumeValueChange={value => setVolume(Math.round(value * 100))} compact radius={28} priority={expanded ? 10 : 2} config={expanded ? { blur: 8 } : undefined} className={cn("showcase-player max-w-none", expanded && "absolute inset-x-0 top-0 z-30")} />
                    </div>
                    <GlassNavbar aria-label="Library preview" radius={999} className="min-h-12 w-full p-1">
                      <GlassToggleGroup liquid type="single" value={view} onValueChange={next => next && setView(next)} aria-label="Library view" spacing={1} className="w-full min-w-0 flex-1 rounded-full">
                        <GlassToggleGroupItem value="library" className="h-10 flex-1 rounded-full px-2 text-xs">Library</GlassToggleGroupItem>
                        <GlassToggleGroupItem value="recent" className="h-10 flex-1 rounded-full px-2 text-xs">Recent</GlassToggleGroupItem>
                      </GlassToggleGroup>
                    </GlassNavbar>
                    <p role="status" className="sr-only">{view === "library" ? "Library selected" : "Recent items selected"}</p>
                    <MessagePreview paused={focus} container={container} onOpenChange={fitPortal} />
                    <ShutdownPreview />
                    <div className="flex w-full flex-wrap items-center justify-between gap-3 pt-1"><QuickActions onSearch={() => setSearchOpen(true)} /><GlassElasticButton /></div>
                  </div>
                  <div className="showcase-right flex min-w-0 flex-col gap-3">
                    <div className="showcase-actions flex items-center gap-2.5"><DrawerTrigger asChild><GlassButton composite={false} onClick={rememberTrigger} className="min-w-0 flex-1 px-4">Continue<GlassIcon name="arrow" data-icon="inline-end" /></GlassButton></DrawerTrigger><GlassSaveButton composite={false} className="min-w-0 flex-1 px-3" /></div>
                    <GlassSpotlight title="Search components" container={container} open={searchOpen} onOpenChange={open => { fitPortal(open); setSearchOpen(open); }} commands={commands} triggerLabel="Search components" placeholder="Find a component…" className="h-10 w-[calc(100%-1rem)] max-w-none self-end px-4 text-[13px]" />
                    <GlassRangeControl priority={2} label="MacBook Pro Speakers" value={volume} onValueChange={setVolume} sliderTone="accent" />
                    <GlassConnectivity priority={2} className="max-w-none" />
                    <div className="showcase-system-controls flex flex-wrap gap-3">
                      <GlassSurface radius={999} className="flex h-11 min-w-[126px] flex-1 items-center justify-between gap-2 px-3"><label htmlFor="showcase-focus" className="text-xs font-medium">Focus</label><GlassSwitch id="showcase-focus" aria-label="Focus mode" size="sm" checked={focus} onCheckedChange={setFocus} /></GlassSurface>
                      <GlassSurface radius={999} className="flex h-11 min-w-[132px] flex-1 items-center justify-between gap-2 px-3"><label htmlFor="showcase-refraction" className="text-xs font-medium">Refraction</label><GlassSwitch id="showcase-refraction" aria-label="Refraction" size="sm" checked={refraction} onCheckedChange={setRefraction} /></GlassSurface>
                    </div>
                    <LeaveSitePreview />
                  </div>
                </div>
                <GlassDrawerContent container={container} onCloseAutoFocus={event => { event.preventDefault(); drawerTrigger.current?.focus({ preventScroll: true }); }}>
                  <div><DrawerTitle>{view === "library" ? "Your library" : "Recent songs"}</DrawerTitle><DrawerDescription className="mt-2 text-xs text-foreground/65">Choose a song to load into the player.</DrawerDescription></div>
                  <div className="flex flex-col gap-2">{(view === "library" ? TRACKS : [TRACKS[track]]).map(item => <DrawerClose asChild key={item.title}><GlassButton variant="secondary" className="justify-between" onClick={() => { setTrack(TRACKS.indexOf(item)); setExpanded(true); }}>{item.title}{TRACKS[track] === item && <GlassIcon name="check" data-icon="inline-end" />}</GlassButton></DrawerClose>)}</div>
                </GlassDrawerContent>
              </Drawer>
            </div>
            <div className="showcase-dock-position"><ShowcaseDock dark={dark} onThemeChange={changeTheme} themeBehavior={themeBehavior} onBehaviorChange={setThemeBehavior} backdrop={backdrop} onBackdropChange={setBackdrop} edges={edges} onEdgesChange={setEdges} /></div>
            <div className="showcase-portal-track pointer-events-none absolute inset-0"><div ref={mountPortal} className="showcase-portal-window pointer-events-none sticky top-0 w-full" /></div>
          </GlassAtlas>
          <GlassToaster id="showcase" position="bottom-right" offset={{ bottom: 96, right: 24 }} mobileOffset={{ bottom: 24, right: 16, left: 16 }} visibleToasts={1} />
        </GlassScene>
      </GlassSettingsProvider>
    </div></div>
  </section>;
}
