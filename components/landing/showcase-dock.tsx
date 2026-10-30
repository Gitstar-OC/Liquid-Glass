"use client";

import Link from "next/link";
import { GlassDock, GlassDockItem } from "@/components/glass/glass-dock";
import { GlassButton } from "@/components/glass/glass-button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  GlassDropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
} from "@/components/glass/glass-dropdown";

export function ShowcaseDock({
  dark,
  onThemeChange,
}: {
  dark: boolean;
  onThemeChange: () => void;
}) {
  return (
    <GlassDock aria-label="Explore Liquid Glass" className="showcase-dock">
      {(
        [
          { href: "/components", label: "Components", short: "UI" },
          { href: "/playground", label: "Playground", short: "Playground" },
          { href: "/docs", label: "Documentation", short: "Docs" },
        ] as const
      ).map((item) => (
        <GlassDockItem
          key={item.href}
          label={item.label}
          asChild
          className="showcase-dock-link"
        >
          <Link href={item.href}>
            {item.href === "/components" ? (
              <>
                <span className="dock-label-wide">Components</span>
                <span className="dock-label-small">UI</span>
              </>
            ) : (
              item.short
            )}
          </Link>
        </GlassDockItem>
      ))}
      <span aria-hidden="true" className="mx-1 h-5 w-px bg-foreground/12" />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <GlassButton
            variant="ghost"
            aria-label="Appearance and theme"
            className="showcase-dock-link"
          >
            Theme
          </GlassButton>
        </DropdownMenuTrigger>
        <GlassDropdownMenuContent
          side="top"
          sideOffset={14}
          align="end"
          className="w-44"
        >
          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={dark ? "dark" : "light"}
            onValueChange={(next) => {
              if ((next === "dark") !== dark) onThemeChange();
            }}
          >
            <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </GlassDropdownMenuContent>
      </DropdownMenu>
    </GlassDock>
  );
}
