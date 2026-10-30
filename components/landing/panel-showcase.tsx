"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Eye, FileImage, MoreHorizontal, Copy, FolderOpen, ArrowDownToLine, X, ChevronDown } from "lucide-react";
import { GlassScene, GlassSettingsProvider } from "@/components/glass-scene";
import { useGlassTheme } from "@/components/glass/glass-theme-provider";
import { GlassButton } from "@/components/glass/glass-button";
import { GlassSlider } from "@/components/glass/glass-slider";
import { GlassCheckbox } from "@/components/glass/glass-checkbox";
import { GlassCard, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/glass/glass-card";
import { Tooltip, TooltipProvider, TooltipTrigger, GlassTooltipContent } from "@/components/glass/glass-tooltip";
import { HoverCard, HoverCardTrigger, GlassHoverCardContent } from "@/components/glass/glass-hover-card";
import { Popover, PopoverTrigger, PopoverHeader, PopoverTitle, PopoverDescription, GlassPopoverContent } from "@/components/glass/glass-popover";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuGroup, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, GlassDropdownMenuContent } from "@/components/glass/glass-dropdown";
import { Drawer, DrawerTrigger, DrawerClose, DrawerTitle, DrawerDescription, DrawerHeader, GlassDrawerContent } from "@/components/glass/glass-drawer";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { PreviewToolbar } from "@/components/site/preview-toolbar";
import type { GlassShape } from "@/lib/glass";
import { HomeExample, type HomeExampleId } from "@/components/landing/home-examples";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  { id: "slider", name: "Slider", doc: "glass-slider" },
  { id: "switch", name: "Switch", doc: "glass-switch" },
  { id: "navigation", name: "Navigation", doc: "glass-toggle" },
  { id: "buttons", name: "Buttons", doc: "glass-lens-button" },
  { id: "video", name: "Video", doc: "glass-video-player" },
  { id: "tooltip", name: "Tooltip", doc: "glass-tooltip" },
  { id: "hover-card", name: "Hover card", doc: "glass-hover-card" },
  { id: "popover", name: "Popover", doc: "glass-popover" },
  { id: "dropdown", name: "Dropdown", doc: "glass-dropdown" },
  { id: "drawer", name: "Drawer", doc: "glass-drawer" },
  { id: "card", name: "Card", doc: "glass-card" },
  { id: "profile", name: "Profile menu", doc: "glass-dropdown" },
] as const;
type Example = typeof EXAMPLES[number]["id"];
type PreviewProps = {
  example: Example;
  container: HTMLDivElement;
  radius: number;
  shape: GlassShape;
  beak: boolean;
  pinned: boolean;
  onUnpin: () => void;
};

function FileDetails() {
  return (
    <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-2 text-xs leading-5">
      <dt className="text-muted-foreground">Dimensions</dt><dd>4000 × 3000</dd>
      <dt className="text-muted-foreground">Size</dt><dd>2.4 MB</dd>
      <dt className="text-muted-foreground">Format</dt><dd>JPEG image</dd>
    </dl>
  );
}

function PanelExample({ example, container, radius, shape, beak, pinned, onUnpin }: PreviewProps) {
  const [hovered, setHovered] = useState(false);
  const [open, setOpen] = useState(false);
  const [metadata, setMetadata] = useState(true);
  const [status, setStatus] = useState("");
  const fieldId = useId();
  const geometry = { radius, shape };
  const positioning = { container, collisionBoundary: container, collisionPadding: 24 };
  if (example === "tooltip") return (
    <TooltipProvider delayDuration={300} skipDelayDuration={200}>
      <Tooltip open={pinned || hovered} onOpenChange={setHovered}>
        <TooltipTrigger asChild>
          <GlassButton variant="glass" aria-label="Preview image"><Eye data-icon="inline-start" />Preview</GlassButton>
        </TooltipTrigger>
        <GlassTooltipContent {...positioning} {...geometry} variant={beak ? "beak" : "plain"}
          side="top" sideOffset={10} onEscapeKeyDown={() => { onUnpin(); setHovered(false); }}>
          Preview
        </GlassTooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
  if (example === "hover-card") return (
    <HoverCard openDelay={250} closeDelay={160} open={pinned || hovered} onOpenChange={setHovered}>
      <HoverCardTrigger asChild>
        <GlassButton variant="glass"><FileImage data-icon="inline-start" />Dunes.jpg</GlassButton>
      </HoverCardTrigger>
      <GlassHoverCardContent {...positioning} {...geometry} beak={beak} side="top" sideOffset={12}
        onEscapeKeyDown={() => { onUnpin(); setHovered(false); }}>
        <div className="flex flex-col gap-4">
          <div><p className="text-sm font-medium">Dunes.jpg</p><p className="mt-1 text-xs text-muted-foreground">In Landscape studies</p></div>
          <FileDetails />
        </div>
      </GlassHoverCardContent>
    </HoverCard>
  );
  if (example === "popover") return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild><GlassButton variant="glass">Image details</GlassButton></PopoverTrigger>
      <GlassPopoverContent {...positioning} {...geometry} beak={beak} sideOffset={12}>
        <PopoverHeader><PopoverTitle>Dunes.jpg</PopoverTitle><PopoverDescription>Landscape studies</PopoverDescription></PopoverHeader>
        <FileDetails />
        <FieldGroup>
          <Field orientation="horizontal">
            <GlassCheckbox id={fieldId} checked={metadata} onCheckedChange={checked => setMetadata(checked === true)} />
            <FieldLabel htmlFor={fieldId}>Include metadata</FieldLabel>
          </Field>
        </FieldGroup>
        <GlassButton variant="secondary" onClick={() => setOpen(false)}>Done</GlassButton>
      </GlassPopoverContent>
    </Popover>
  );
  if (example === "dropdown") return (
    <div className="flex flex-col items-center gap-3">
      <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
        <DropdownMenuTrigger asChild><GlassButton variant="glass"><MoreHorizontal data-icon="inline-start" />Actions</GlassButton></DropdownMenuTrigger>
        <GlassDropdownMenuContent {...positioning} {...geometry} className="w-56" sideOffset={10} align="center">
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => setStatus("Image opened in this preview.")}><FolderOpen data-icon="inline-start" />Open image</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setStatus("Dunes copy.jpg created in this preview.")}><Copy data-icon="inline-start" />Duplicate</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setStatus("Original selected for export.")}><ArrowDownToLine data-icon="inline-start" />Export original</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuCheckboxItem checked={metadata} onCheckedChange={checked => setMetadata(checked === true)}
              onSelect={event => event.preventDefault()}>Include metadata</DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
        </GlassDropdownMenuContent>
      </DropdownMenu>
      <span role="status" className="panel-preview-status">{status}</span>
    </div>
  );
  if (example === "drawer") return (
    <Drawer open={open} onOpenChange={setOpen} container={container} shouldScaleBackground={false}>
      <DrawerTrigger asChild><GlassButton variant="glass">Show file</GlassButton></DrawerTrigger>
      <GlassDrawerContent container={container} {...geometry} className="panel-preview-drawer">
        <DrawerHeader className="relative p-0 pr-10 text-left!">
          <DrawerTitle>Dunes.jpg</DrawerTitle><DrawerDescription>Landscape studies</DrawerDescription>
          <DrawerClose asChild><GlassButton variant="ghost" size="icon" aria-label="Close file details" className="absolute -top-1 right-0"><X /></GlassButton></DrawerClose>
        </DrawerHeader>
        <FileDetails />
        <DrawerClose asChild><GlassButton variant="secondary">Done</GlassButton></DrawerClose>
      </GlassDrawerContent>
    </Drawer>
  );
  return (
    <GlassCard {...geometry} className="w-[280px] max-w-full">
      <CardHeader><CardTitle>Dunes.jpg</CardTitle><CardDescription>Landscape studies</CardDescription></CardHeader>
      <CardContent><FileDetails /></CardContent>
      <CardFooter className="border-0 bg-transparent">
        <GlassButton variant="secondary" className="w-full" onClick={() => setStatus("File selected in this preview.")}>Open file</GlassButton>
      </CardFooter>
      <span role="status" className="sr-only">{status}</span>
    </GlassCard>
  );
}

/** Plain stage, one mounted component and one bounded source at a time. */
export function PanelShowcase({ initialExample = "slider", compact = false }: {
  initialExample?: Example;
  compact?: boolean;
}) {
  const { resolvedMode } = useGlassTheme();
  const [example, setExample] = useState<Example>(initialExample);
  const [radius, setRadius] = useState(initialExample === "tooltip" ? 13 : 20);
  const [shape, setShape] = useState<GlassShape>("round");
  const [beak, setBeak] = useState(true), [pinned, setPinned] = useState(initialExample === "tooltip" || initialExample === "hover-card");
  const [refraction, setRefraction] = useState(true);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    if (compact) return;
    const selectLinkedProfile = () => { if (location.hash === "#profile-preview") setExample("profile"); };
    selectLinkedProfile();
    window.addEventListener("hashchange", selectLinkedProfile);
    return () => window.removeEventListener("hashchange", selectLinkedProfile);
  }, [compact]);
  useEffect(() => {
    const node = section.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "80px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const selected = EXAMPLES.find(item => item.id === example)!;
  const control = ["slider", "switch", "navigation", "buttons", "video", "profile"].includes(example);
  const thumb = example === "slider" || example === "switch";
  const hint = example === "slider" ? "Hold and drag to reveal glass." : example === "switch" ? "Press or drag left and right to switch."
    : example === "navigation" ? "Choose a section." : example === "video" ? "Play, seek or skip through the flowers."
    : example === "buttons" ? "Two actions over the same background." : example === "profile" ? "Open the profile actions."
    : example === "tooltip" ? "Hover or focus Preview." : example === "hover-card" ? "Hover or focus the filename."
    : example === "card" ? "Open the file to try the action." : "Click to open. Escape to close.";
  const choose = (value: string) => {
    if (!value) return;
    setExample(value as Example); setRadius(value === "tooltip" ? 13 : value === "drawer" ? 28 : 20);
    setPinned(value === "tooltip" || value === "hover-card");
  };
  return (
    <section ref={section} className={cn("panel-showcase", compact && "panel-showcase-compact", resolvedMode === "dark" ? "showcase-dark" : "showcase-light")} aria-label="Component examples">
      {!compact && <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium">Components</h2>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild><GlassButton variant="ghost" aria-label="Choose component example">{selected.name}<ChevronDown data-icon="inline-end" /></GlassButton></DropdownMenuTrigger>
          <GlassDropdownMenuContent className="showcase-component-menu w-60" align="end">
            <DropdownMenuRadioGroup value={example} onValueChange={choose}>
              {EXAMPLES.map(item => <DropdownMenuRadioItem key={item.id} value={item.id}>{item.name}</DropdownMenuRadioItem>)}
            </DropdownMenuRadioGroup>
          </GlassDropdownMenuContent>
        </DropdownMenu>
      </div>}
      <div ref={setContainer} className="panel-preview-stage" data-panel-example={example}>
        <GlassSettingsProvider refraction={refraction}>
          {control ? <div className="home-control-stage size-full" data-example={example === "profile" ? "popover" : example}>
            {visible && <HomeExample key={example} id={(example === "profile" ? "popover" : example) as HomeExampleId} previewActive={pinned} />}
          </div> : <GlassScene appearance={resolvedMode} className="size-full" content={
            <div className="panel-source-plane"><div className="panel-preview-source">
              <div className="panel-source-title">Landscape studies</div>
              <div className="panel-source-row"><span className="panel-source-mark" /><span>Dunes.jpg</span><span>2.4 MB</span></div>
              <div className="panel-source-row"><span className="panel-source-mark" /><span>Ocean.jpg</span><span>1.8 MB</span></div>
              <div className="panel-source-row"><span className="panel-source-mark" /><span>Ice.jpg</span><span>3.1 MB</span></div>
            </div></div>
          }>
            <div className="panel-preview-foreground">
              {visible && container && <PanelExample key={example} example={example} container={container} radius={radius} shape={shape} beak={beak} pinned={pinned} onUnpin={() => setPinned(false)} />}
            </div>
          </GlassScene>}
        </GlassSettingsProvider>
      </div>
      <PreviewToolbar label={selected.name} href={`/docs/${selected.doc}`} backgroundControls={control ? <span className="text-muted-foreground">{hint}</span> :
        <div className="flex flex-wrap items-center gap-3">
          {(example === "tooltip" || example === "hover-card" || example === "popover") && <ToggleGroup type="single" value={beak ? "beak" : "plain"} onValueChange={value => value && setBeak(value === "beak")} spacing={0} aria-label="Bubble pointer">
            <ToggleGroupItem value="plain">No beak</ToggleGroupItem><ToggleGroupItem value="beak">Joined beak</ToggleGroupItem>
          </ToggleGroup>}
          <ToggleGroup type="single" value={shape} onValueChange={value => value && setShape(value as GlassShape)} spacing={0} aria-label="Corner shape">
            <ToggleGroupItem value="round">Round</ToggleGroupItem><ToggleGroupItem value="squircle">Squircle</ToggleGroupItem>
          </ToggleGroup>
          <label className="flex items-center gap-2 text-muted-foreground">Radius
            <GlassSlider aria-label={`${selected.name} radius`} min={0} max={example === "tooltip" ? 13 : 32} step={1} value={[radius]} onValueChange={([value]) => setRadius(value)} className="w-20" />
            <output className="w-7 tabular-nums">{radius}px</output>
          </label>
        </div>
      } blurControl={null} />
      <div className="mt-3 flex min-h-10 flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>{control ? "" : hint}</span>
        <div className="flex items-center gap-4">
          {(thumb || example === "tooltip" || example === "hover-card") && <button type="button" aria-pressed={pinned} onClick={() => setPinned(value => !value)} className="min-h-10 hover:text-foreground">{thumb ? pinned ? "Return to resting" : "Inspect active state" : pinned ? "Unpin preview" : "Pin preview"}</button>}
          <button type="button" aria-pressed={refraction} onClick={() => setRefraction(value => !value)} className="min-h-10 hover:text-foreground">Refraction {refraction ? "on" : "off"}</button>
        </div>
      </div>
    </section>
  );
}
