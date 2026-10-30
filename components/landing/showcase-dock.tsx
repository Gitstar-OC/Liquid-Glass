"use client";

import Link from "next/link";
import { GlassDock, GlassDockItem } from "@/components/glass/glass-dock";
import { DropdownMenu, DropdownMenuTrigger, GlassDropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuLabel } from "@/components/glass/glass-dropdown";

export function ShowcaseDock({ dark, onThemeChange }: { dark: boolean; onThemeChange: () => void }) {
  return (
    <GlassDock material="backdrop" aria-label="Explore Liquid Glass" className="showcase-dock">
      {[
        { href: "/components", label: "Components" },
        { href: "/playground", label: "Playground" },
        { href: "/docs", label: "Documentation" },
      ].map(item => <GlassDockItem key={item.href} label={item.label} asChild tooltipVariant="beak" className="showcase-dock-link">
        <Link href={item.href}><span aria-hidden="true" className="showcase-dock-placeholder" /></Link>
      </GlassDockItem>)}
      <DropdownMenu modal={false}>
        <GlassDockItem label="Appearance" asChild tooltipVariant="beak" className="showcase-dock-link">
          <DropdownMenuTrigger><span aria-hidden="true" className="showcase-dock-placeholder" /></DropdownMenuTrigger>
        </GlassDockItem>
        <GlassDropdownMenuContent side="top" sideOffset={14} align="end" className="w-44">
          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={dark ? "dark" : "light"} onValueChange={next => { if ((next === "dark") !== dark) onThemeChange(); }}>
            <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </GlassDropdownMenuContent>
      </DropdownMenu>
    </GlassDock>
  );
}
