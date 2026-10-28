"use client";

import Link from "next/link";
import { GlassDock, GlassDockItem } from "@/components/glass/glass-dock";
import { GlassButton } from "@/components/glass/glass-button";
import { DropdownMenu, DropdownMenuTrigger, GlassDropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup, DropdownMenuCheckboxItem, DropdownMenuItem } from "@/components/glass/glass-dropdown";
import type { GlassThemeBehavior } from "@/components/glass-scene";

export function ShowcaseDock({ dark, onThemeChange, themeBehavior, onBehaviorChange, backdrop, onBackdropChange, edges, onEdgesChange }: {
  dark: boolean; onThemeChange: () => void;
  themeBehavior: GlassThemeBehavior; onBehaviorChange: (value: GlassThemeBehavior) => void;
  backdrop: "photos"|"plain"; onBackdropChange:(value:"photos"|"plain")=>void;
  edges:boolean;onEdgesChange:(value:boolean)=>void;
}) {
  return <GlassDock aria-label="Explore Liquid Glass" className="showcase-dock">
    {([
      {href: "/components", label: "Components", short: "UI"},
      {href: "/playground", label: "Playground", short: "Playground"},
      {href: "/docs", label: "Documentation", short: "Docs"},
    ] as const).map(item => <GlassDockItem key={item.href} label={item.label} asChild className="showcase-dock-link">
      <Link href={item.href}>{item.href === "/components" ? <><span className="dock-label-wide">Components</span><span className="dock-label-small">UI</span></> : item.short}</Link>
    </GlassDockItem>)}
    <span aria-hidden="true" className="mx-1 h-5 w-px bg-foreground/12"/>
    <DropdownMenu modal={false}><DropdownMenuTrigger asChild><GlassButton variant="ghost" aria-label="Appearance and theme" className="showcase-dock-link">Theme</GlassButton></DropdownMenuTrigger>
      <GlassDropdownMenuContent side="top" sideOffset={14} align="end" className="w-60">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={dark ? "dark" : "light"} onValueChange={value => {if ((value === "dark") !== dark) onThemeChange();}}>
          <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem><DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator/>
        <DropdownMenuLabel>Text behavior</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={themeBehavior} onValueChange={value => onBehaviorChange(value as GlassThemeBehavior)}>
          <DropdownMenuRadioItem value="unitheme"><span className="flex flex-col gap-0.5"><span>Unitheme</span><span className="text-[11px] opacity-65">Text adapts to the background</span></span></DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="duotheme"><span className="flex flex-col gap-0.5"><span>Duotheme</span><span className="text-[11px] opacity-65">Black in light, white in dark</span></span></DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator/>
        <DropdownMenuLabel>Backdrop</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={backdrop} onValueChange={value=>onBackdropChange(value as "photos"|"plain")}><DropdownMenuRadioItem value="photos">Photos</DropdownMenuRadioItem><DropdownMenuRadioItem value="plain">Plain</DropdownMenuRadioItem></DropdownMenuRadioGroup>
        <DropdownMenuGroup><DropdownMenuCheckboxItem checked={edges} onCheckedChange={onEdgesChange}>Show surface edges</DropdownMenuCheckboxItem></DropdownMenuGroup>
        <DropdownMenuSeparator/>
        <DropdownMenuGroup><DropdownMenuItem asChild><Link href="/credits">Photo credits</Link></DropdownMenuItem></DropdownMenuGroup>
      </GlassDropdownMenuContent>
    </DropdownMenu>
  </GlassDock>;
}
