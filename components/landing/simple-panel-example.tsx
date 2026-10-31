"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Bell, BookOpen, ChevronDown, Copy, Eye, MoreHorizontal, SlidersHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import { GlassScene } from "@/components/glass-scene";
import { GlassButton } from "@/components/glass/glass-button";
import { GlassCheckbox } from "@/components/glass/glass-checkbox";
import { GlassCard, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/glass/glass-card";
import { Tooltip, TooltipProvider, TooltipTrigger, GlassTooltipContent } from "@/components/glass/glass-tooltip";
import { HoverCard, HoverCardTrigger, GlassHoverCardContent } from "@/components/glass/glass-hover-card";
import { Popover, PopoverTrigger, PopoverHeader, PopoverTitle, GlassPopoverContent } from "@/components/glass/glass-popover";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, GlassDropdownMenuContent } from "@/components/glass/glass-dropdown";
import { GlassToaster, glassToast } from "@/components/glass/glass-toaster";
import { Drawer, DrawerTrigger, DrawerClose, DrawerHeader, DrawerTitle, DrawerDescription, GlassDrawerContent } from "@/components/glass/glass-drawer";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import type { GlassShape } from "@/lib/glass";
import type { WorkspaceExample } from "@/components/landing/workspace-panel-example";

/** A quiet homepage illustration. The richer workspace remains in the docs. */
export function SimplePanelExample({ example, appearance, container, radius, shape, beak }: {
  example: WorkspaceExample | "toast";
  appearance: "light" | "dark";
  container: HTMLDivElement;
  radius: number;
  shape: GlassShape;
  beak: boolean;
}) {
  const [layout, setLayout] = useState("grid");
  const [details, setDetails] = useState(true);
  const [previews, setPreviews] = useState(true);
  const [hoverOpen, setHoverOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [status, setStatus] = useState("");
  const id = useId();
  const sceneSource = useRef<HTMLDivElement>(null);
  useEffect(() => () => { toast.dismiss(`${id}-notice`); }, [id]);
  const geometry = { radius, shape };
  const placement = { container, collisionBoundary: container, collisionPadding: 16 };
  let content: ReactNode;

  if (example === "popover") {
    content = <Popover>
      <PopoverTrigger asChild><GlassButton variant="secondary">View<ChevronDown data-icon="inline-end" /></GlassButton></PopoverTrigger>
      <GlassPopoverContent {...placement} {...geometry} beak={beak} side="bottom" sideOffset={10} className="w-64">
        <PopoverHeader><PopoverTitle>View options</PopoverTitle></PopoverHeader>
        <FieldGroup className="gap-3">
          <Field><ToggleGroup type="single" value={layout} onValueChange={value => value && setLayout(value)} spacing={0} aria-label="View layout" className="w-full rounded-full bg-foreground/5 p-1">
            <ToggleGroupItem value="grid" className="h-9 flex-1 rounded-full">Grid</ToggleGroupItem><ToggleGroupItem value="list" className="h-9 flex-1 rounded-full">List</ToggleGroupItem>
          </ToggleGroup></Field>
          <Separator />
          <Field orientation="horizontal"><GlassCheckbox id={`${id}-details`} checked={details} onCheckedChange={value => setDetails(value === true)} /><FieldLabel htmlFor={`${id}-details`}>Show details</FieldLabel></Field>
        </FieldGroup>
      </GlassPopoverContent>
    </Popover>;
  } else if (example === "dropdown") {
    content = <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild><GlassButton variant="secondary" size="icon-lg" aria-label="More options"><MoreHorizontal /></GlassButton></DropdownMenuTrigger>
      <GlassDropdownMenuContent {...placement} {...geometry} align="center" sideOffset={10} className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => {
            if (!navigator.clipboard) { setStatus("Copy the page address to share this page."); return; }
            void navigator.clipboard.writeText(location.href).then(() => setStatus("Page link copied."), () => setStatus("The browser could not copy this link."));
          }}><Copy data-icon="inline-start" />Copy page link</DropdownMenuItem>
          <DropdownMenuItem asChild><Link href="/docs"><BookOpen data-icon="inline-start" />Documentation</Link></DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup><DropdownMenuItem asChild><Link href="/playground"><SlidersHorizontal data-icon="inline-start" />Open playground</Link></DropdownMenuItem></DropdownMenuGroup>
      </GlassDropdownMenuContent>
    </DropdownMenu>;
  } else if (example === "drawer") {
    content = <Drawer container={container} shouldScaleBackground={false}>
      <DrawerTrigger asChild><GlassButton variant="secondary">Open drawer</GlassButton></DrawerTrigger>
      <GlassDrawerContent container={container} {...geometry} className="panel-preview-drawer">
        <DrawerHeader className="relative p-0 pr-10 text-left!">
          <DrawerTitle>Preferences</DrawerTitle><DrawerDescription>Workspace display settings.</DrawerDescription>
          <DrawerClose asChild><GlassButton variant="ghost" size="icon" aria-label="Close preferences" className="absolute -top-1 right-0"><X /></GlassButton></DrawerClose>
        </DrawerHeader>
        <FieldGroup>
          <Field orientation="horizontal"><GlassCheckbox id={`${id}-drawer-details`} checked={details} onCheckedChange={value => setDetails(value === true)} /><FieldLabel htmlFor={`${id}-drawer-details`}>Show file details</FieldLabel></Field>
          <Field orientation="horizontal"><GlassCheckbox id={`${id}-previews`} checked={previews} onCheckedChange={value => setPreviews(value === true)} /><FieldLabel htmlFor={`${id}-previews`}>Show previews</FieldLabel></Field>
        </FieldGroup>
        <DrawerClose asChild><GlassButton variant="secondary">Done</GlassButton></DrawerClose>
      </GlassDrawerContent>
    </Drawer>;
  } else if (example === "toast") {
    content = <GlassButton variant="secondary" onClick={() => glassToast("Changes saved", {
      id: `${id}-notice`, toasterId: id, sceneRef: sceneSource, label: "Workspace",
      description: "Your preferences are up to date.",
      action: { label: "Undo", onClick: () => setStatus("Changes undone.") },
    })}><Bell data-icon="inline-start" />Show notification</GlassButton>;
  } else if (example === "tooltip") {
    content = <TooltipProvider delayDuration={250} skipDelayDuration={200}><Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
      <TooltipTrigger asChild><GlassButton variant="secondary" aria-label="Preview" onClick={() => setTooltipOpen(value => !value)}><Eye data-icon="inline-start" />Preview</GlassButton></TooltipTrigger>
      <GlassTooltipContent {...placement} {...geometry} variant={beak ? "beak" : "plain"} side="top" sideOffset={10}>Preview</GlassTooltipContent>
    </Tooltip></TooltipProvider>;
  } else if (example === "hover-card") {
    content = <HoverCard open={hoverOpen} onOpenChange={setHoverOpen} openDelay={250} closeDelay={160}>
      <HoverCardTrigger asChild><GlassButton variant="secondary" onClick={() => setHoverOpen(value => !value)}>Maya Chen</GlassButton></HoverCardTrigger>
      <GlassHoverCardContent {...placement} {...geometry} beak={beak} side="bottom" sideOffset={10} className="w-60">
        <div className="flex flex-col gap-3">
          <div><p className="font-medium">Maya Chen</p><p className="text-xs text-muted-foreground">Product designer</p></div>
          <Separator />
          <dl className="grid grid-cols-[1fr_auto] gap-3 text-xs"><dt className="text-muted-foreground">Team</dt><dd>Brand & design</dd></dl>
        </div>
      </GlassHoverCardContent>
    </HoverCard>;
  } else {
    content = <GlassCard {...geometry} size="sm" className="simple-preview-card">
      <CardHeader><CardTitle>Design workspace</CardTitle><CardDescription>Workspace settings</CardDescription></CardHeader>
      <CardContent><dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-3 text-xs"><dt className="text-muted-foreground">Visibility</dt><dd>Private</dd><dt className="text-muted-foreground">Members</dt><dd>Only you</dd></dl></CardContent>
      <CardFooter className="border-0 bg-transparent text-xs text-muted-foreground">Updated today</CardFooter>
    </GlassCard>;
  }
  return <GlassScene sourceRef={sceneSource} appearance={appearance} className="simple-preview-scene size-full" content={<div className="simple-preview-plane" />}>
    <div className="simple-preview-center">{content}</div>
    {example === "toast" && <GlassToaster id={id} position="top-center" toastOptions={{ duration: 5000 }} />}
    <p role="status" className="sr-only">{status}</p>
  </GlassScene>;
}
