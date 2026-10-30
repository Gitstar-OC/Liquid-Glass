"use client";

import { useId, useState, type ReactNode } from "react";
import { ArrowDownToLine, ArrowUpRight, Check, Copy, Grid2X2, Link, List, MoreHorizontal, SlidersHorizontal, X } from "lucide-react";
import { GlassScene } from "@/components/glass-scene";
import { GlassButton } from "@/components/glass/glass-button";
import { GlassCheckbox } from "@/components/glass/glass-checkbox";
import { GlassCard, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/glass/glass-card";
import { Tooltip, TooltipProvider, TooltipTrigger, GlassTooltipContent } from "@/components/glass/glass-tooltip";
import { HoverCard, HoverCardTrigger, GlassHoverCardContent } from "@/components/glass/glass-hover-card";
import { Popover, PopoverTrigger, PopoverHeader, PopoverTitle, PopoverDescription, GlassPopoverContent } from "@/components/glass/glass-popover";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuGroup, DropdownMenuItem, GlassDropdownMenuContent } from "@/components/glass/glass-dropdown";
import { Drawer, DrawerTrigger, DrawerClose, DrawerTitle, DrawerDescription, DrawerHeader, GlassDrawerContent } from "@/components/glass/glass-drawer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SceneBackdrop } from "@/components/site/scene-backdrop";
import { DEMO_PHOTOS } from "@/lib/demo-assets";
import type { GlassShape } from "@/lib/glass";

type Asset = { id: string; name: string; photo: "dunes" | "ocean" | "ice" };
const ASSETS: Asset[] = [
  { id: "dunes", name: "Dunes.webp", photo: "dunes" },
  { id: "ocean", name: "Ocean.webp", photo: "ocean" },
  { id: "ice", name: "Ice.webp", photo: "ice" },
];

type Geometry = { radius: number; shape: GlassShape };
type Positioning = { container: HTMLDivElement; collisionBoundary: HTMLDivElement; collisionPadding: number };
export type WorkspaceExample = "tooltip" | "hover-card" | "popover" | "dropdown" | "drawer" | "card";
type Props = Geometry & {
  example: WorkspaceExample;
  appearance: "light" | "dark";
  container: HTMLDivElement;
  beak: boolean;
  pinned: boolean;
  onUnpin: () => void;
};

/** Ordinary product UI is the source. Only the transient surface is glass. */
function Workspace({ title, path = "Studio / Assets", action, children }: {
  title: string; path?: string; action?: ReactNode; children: ReactNode;
}) {
  return (
    <div className="workspace-plane">
      <div className="workspace-app">
        <header className="workspace-heading">
          <div className="min-w-0"><p className="workspace-path">{path}</p><h3>{title}</h3></div>
          {action}
        </header>
        {children}
      </div>
    </div>
  );
}

function AssetList({ assets, name, action, details = true }: {
  assets: Asset[];
  name?: (asset: Asset) => ReactNode;
  action?: (asset: Asset) => ReactNode;
  details?: boolean;
}) {
  return (
    <Table className="workspace-file-table" aria-label="Assets in Landscape studies">
      <TableHeader><TableRow><TableHead>Name</TableHead>{details && <TableHead className="workspace-file-kind">Type</TableHead>}{action && <TableHead><span className="sr-only">File actions</span></TableHead>}</TableRow></TableHeader>
      <TableBody>{assets.map(asset => <TableRow key={asset.id}>
        <TableCell><div className="workspace-file-name"><div className="workspace-file-thumbnail"><SceneBackdrop photo={asset.photo} /></div><div className="workspace-file-label">{name ? name(asset) : asset.name}</div></div></TableCell>
        {details && <TableCell className="workspace-file-kind">WebP image</TableCell>}
        {action && <TableCell className="w-10">{action(asset)}</TableCell>}
      </TableRow>)}</TableBody>
    </Table>
  );
}

function AssetGrid({ assets, details = true }: { assets: Asset[]; details?: boolean }) {
  return <div className="workspace-asset-grid">{assets.map(asset => <a key={asset.id} href={DEMO_PHOTOS[asset.photo].src} target="_blank" rel="noreferrer" className="workspace-asset-link">
    <div className="workspace-grid-image"><SceneBackdrop photo={asset.photo} /></div>
    <p>{asset.name}<ArrowUpRight aria-hidden="true" /></p>
    {details && <span>WebP image</span>}
  </a>)}</div>;
}

function AssetDetails({ asset }: { asset: Asset }) {
  return <dl className="workspace-asset-details">
    <dt>Collection</dt><dd>Landscape studies</dd>
    <dt>Format</dt><dd>WebP image</dd>
    <dt>Added by</dt><dd>Maya Chen</dd>
    <dt>Photo</dt><dd><a href={DEMO_PHOTOS[asset.photo].href} target="_blank" rel="noreferrer">{DEMO_PHOTOS[asset.photo].credit}</a></dd>
  </dl>;
}

function FileDrawer({ asset, container, geometry }: { asset: Asset; container: HTMLDivElement; geometry: Geometry }) {
  return <Drawer container={container} shouldScaleBackground={false}>
    <DrawerTrigger asChild><button type="button" className="workspace-text-action">{asset.name}</button></DrawerTrigger>
    <GlassDrawerContent container={container} {...geometry} className="panel-preview-drawer">
      <DrawerHeader className="relative p-0 pr-10 text-left!">
        <DrawerTitle>{asset.name}</DrawerTitle><DrawerDescription>File details</DrawerDescription>
        <DrawerClose asChild><GlassButton variant="ghost" size="icon" aria-label="Close file details" className="absolute -top-1 right-0"><X /></GlassButton></DrawerClose>
      </DrawerHeader>
      <div className="workspace-drawer-image"><SceneBackdrop photo={asset.photo} /></div>
      <AssetDetails asset={asset} />
      <GlassButton variant="secondary" asChild><a href={DEMO_PHOTOS[asset.photo].src} download={asset.name}><ArrowDownToLine data-icon="inline-start" />Download image</a></GlassButton>
    </GlassDrawerContent>
  </Drawer>;
}

export function WorkspacePanelExample({ example, appearance, container, radius, shape, beak, pinned, onUnpin }: Props) {
  const [hovered, setHovered] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(true);
  const [layout, setLayout] = useState("grid");
  const [showDetails, setShowDetails] = useState(true);
  const [assets, setAssets] = useState(ASSETS);
  const [status, setStatus] = useState("");
  const [copied, setCopied] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const detailsId = useId();
  const geometry = { radius, shape };
  const positioning: Positioning = { container, collisionBoundary: container, collisionPadding: 16 };
  const copyLink = async (asset: Asset) => {
    try {
      await navigator.clipboard.writeText(new URL(DEMO_PHOTOS[asset.photo].src, window.location.origin).href);
      setCopied(true);
      setStatus(`Link to ${asset.name} copied.`);
    } catch {
      setStatus("The browser could not copy this link. Open the image to copy its address.");
    }
  };
  let content: ReactNode;
  let foreground: ReactNode = null;

  if (example === "tooltip") {
    content = <Workspace title="Dunes.webp" path="Landscape studies / Review" action={
      <TooltipProvider delayDuration={300} skipDelayDuration={200}>
        <Tooltip open={pinned || hovered} onOpenChange={setHovered}>
          <TooltipTrigger asChild><GlassButton variant="ghost" size="icon" aria-label="Copy image link" onClick={() => void copyLink(ASSETS[0])}>{copied ? <Check /> : <Link />}</GlassButton></TooltipTrigger>
          <GlassTooltipContent {...positioning} {...geometry} variant={beak ? "beak" : "plain"} side="bottom" align="end" sideOffset={8}
            onEscapeKeyDown={() => { onUnpin(); setHovered(false); }}>{copied ? "Link copied" : "Copy link"}</GlassTooltipContent>
        </Tooltip>
      </TooltipProvider>
    }>
      <div className="workspace-review-image"><SceneBackdrop photo="dunes" /></div>
      <div className="workspace-review-caption"><span>Version 03</span><span>Photo by <a href={DEMO_PHOTOS.dunes.href} target="_blank" rel="noreferrer">Royce Fonseca</a></span></div>
    </Workspace>;
  } else if (example === "hover-card") {
    content = <Workspace title="Landscape studies" path="Studio / Review">
      <div className="workspace-review-image"><SceneBackdrop photo="ocean" /></div>
      <div className="workspace-activity">
        <Avatar size="sm"><AvatarFallback>MC</AvatarFallback></Avatar>
        <p><HoverCard openDelay={250} closeDelay={160} open={pinned || hovered} onOpenChange={setHovered}>
          <HoverCardTrigger asChild><a href="mailto:maya@studio.example" className="workspace-person-link">Maya Chen</a></HoverCardTrigger>
          <GlassHoverCardContent {...positioning} {...geometry} beak={beak} side="top" align="start" sideOffset={12}
            onEscapeKeyDown={() => { onUnpin(); setHovered(false); }}>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3"><Avatar size="lg"><AvatarFallback>MC</AvatarFallback></Avatar><div><p className="font-medium">Maya Chen</p><p className="text-xs text-muted-foreground">Product designer</p></div></div>
              <Separator />
              <dl className="workspace-asset-details"><dt>Team</dt><dd>Brand & design</dd><dt>Local time</dt><dd>9:41 AM</dd></dl>
              <a className="workspace-person-link" href="mailto:maya@studio.example">maya@studio.example</a>
            </div>
          </GlassHoverCardContent>
        </HoverCard> added a new version<span className="workspace-activity-time">12 minutes ago</span></p>
      </div>
    </Workspace>;
  } else if (example === "popover") {
    content = <Workspace title="Landscape studies" action={
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild><GlassButton variant="secondary" size="sm"><SlidersHorizontal data-icon="inline-start" />View</GlassButton></PopoverTrigger>
        <GlassPopoverContent {...positioning} {...geometry} beak={beak} align="end" sideOffset={10} className="w-60" onOpenAutoFocus={event => event.preventDefault()}>
          <PopoverHeader><PopoverTitle>View options</PopoverTitle><PopoverDescription>Arrange your assets.</PopoverDescription></PopoverHeader>
          <FieldGroup>
            <Field><FieldLabel>Layout</FieldLabel>
              <ToggleGroup type="single" value={layout} onValueChange={value => value && setLayout(value)} variant="outline" spacing={0} aria-label="Asset layout" className="w-full">
                <ToggleGroupItem value="grid" className="flex-1"><Grid2X2 data-icon="inline-start" />Grid</ToggleGroupItem>
                <ToggleGroupItem value="list" className="flex-1"><List data-icon="inline-start" />List</ToggleGroupItem>
              </ToggleGroup>
            </Field>
            <Field orientation="horizontal"><GlassCheckbox id={detailsId} checked={showDetails} onCheckedChange={value => setShowDetails(value === true)} /><FieldLabel htmlFor={detailsId}>Show file details</FieldLabel></Field>
          </FieldGroup>
        </GlassPopoverContent>
      </Popover>
    }>{layout === "grid" ? <AssetGrid assets={assets} details={showDetails} /> : <AssetList assets={assets} details={showDetails} name={asset => <a className="workspace-text-action" href={DEMO_PHOTOS[asset.photo].src} target="_blank" rel="noreferrer">{asset.name}</a>} />}</Workspace>;
  } else if (example === "dropdown") {
    content = <Workspace title="Landscape studies"><AssetList assets={assets} action={asset =>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild><GlassButton variant="ghost" size="icon" aria-label={`Actions for ${asset.name}`}><MoreHorizontal /></GlassButton></DropdownMenuTrigger>
        <GlassDropdownMenuContent {...positioning} {...geometry} className="w-52" sideOffset={8} align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => void copyLink(asset)}><Link data-icon="inline-start" />Copy link</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => {
              const copy = { ...asset, id: `${asset.id}-${crypto.randomUUID()}`, name: asset.name.replace(".webp", " copy.webp") };
              setAssets(current => [...current, copy]);
              setStatus(`${copy.name} added to the collection.`);
            }}><Copy data-icon="inline-start" />Duplicate</DropdownMenuItem>
            <DropdownMenuItem asChild><a href={DEMO_PHOTOS[asset.photo].src} download={asset.name}><ArrowDownToLine data-icon="inline-start" />Download</a></DropdownMenuItem>
          </DropdownMenuGroup>
        </GlassDropdownMenuContent>
      </DropdownMenu>
    } /></Workspace>;
  } else if (example === "drawer") {
    content = <Workspace title="Landscape studies"><AssetList assets={assets} name={asset => <FileDrawer asset={asset} container={container} geometry={geometry} />} /></Workspace>;
  } else {
    content = <Workspace title={collectionOpen ? "Landscape studies" : "Collections"} path="Studio / Library" action={collectionOpen && <GlassButton variant="ghost" size="sm" onClick={() => setCollectionOpen(false)}>Back</GlassButton>}>
      {collectionOpen ? <AssetGrid assets={assets} /> : <div className="workspace-collection-cover"><SceneBackdrop photo={appearance === "dark" ? "ocean" : "dunes"} /></div>}
    </Workspace>;
    foreground = !collectionOpen && <div className="workspace-collection-layer">
      <GlassCard {...geometry} size="sm" className="workspace-collection-card">
        <CardHeader><CardTitle><button type="button" onClick={() => setCollectionOpen(true)} className="workspace-collection-title">Landscape studies<ArrowUpRight aria-hidden="true" /></button></CardTitle><CardDescription>Brand photography</CardDescription></CardHeader>
        <CardContent><p className="text-xs">Dunes, open water and ice.</p></CardContent>
        <CardFooter className="justify-between border-0 bg-transparent"><Badge variant="secondary">3 assets</Badge><span className="text-xs text-muted-foreground">Updated today</span></CardFooter>
      </GlassCard>
    </div>;
  }

  return <GlassScene appearance={appearance} className="workspace-scene size-full" content={content}>
    {foreground}
    {status && <p role="status" className="workspace-status">{status}</p>}
  </GlassScene>;
}
