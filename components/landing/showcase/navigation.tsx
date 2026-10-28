"use client";

import * as React from "react";
import { ChevronDown, Command, Layers, Plus, Search } from "lucide-react";

import {
  GlassButton,
  GlassMenubar,
  GlassMenubarContent,
  GlassMenubarItem,
  GlassMenubarMenu,
  GlassMenubarSeparator,
  GlassMenubarShortcut,
  GlassMenubarTrigger,
  GlassNavigationMenu,
  GlassNavigationMenuContent,
  GlassNavigationMenuItem,
  GlassNavigationMenuLink,
  GlassNavigationMenuList,
  GlassNavigationMenuTrigger,
  GlassSurface,
  GlassTabs,
  GlassTabsContent,
  GlassTabsList,
  GlassTabsTrigger,
} from "@/components/glass";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Kbd } from "@/components/ui/kbd";
import { Scene, SceneGrid } from "@/components/landing/scene";

const PANELS: Record<string, { title: string; body: string }[]> = {
  material: [
    {
      title: "Diffuse",
      body: "Frosted and thick materials soften busy backdrops without hiding them.",
    },
    {
      title: "Glossy",
      body: "Clear and regular keep hard edges crisp and highlights bright.",
    },
  ],
  optics: [
    {
      title: "Displacement",
      body: "A canvas-generated SDF drives a real backdrop refraction pass.",
    },
    {
      title: "Dispersion",
      body: "Three channel offsets split light at the rim of every surface.",
    },
  ],
  motion: [
    {
      title: "Press physics",
      body: "Every interactive surface answers a press with a spring.",
    },
    {
      title: "Live sampling",
      body: "Adaptive ink re-measures per frame so drifting light never breaks it.",
    },
  ],
};

export function NavigationShowcase() {
  return (
    <SceneGrid>
      <Scene
        span={7}
        title="Tabs with content"
        description="The list, the rule and the panel share one surface, so switching context never moves the layout."
        components="Tabs · List · Trigger · Content"
      >
        <GlassSurface kind="card" className="w-full max-w-lg p-5 sm:p-6">
          <GlassTabs defaultValue="material" className="w-full">
            <GlassTabsList className="w-full">
              {Object.keys(PANELS).map((key) => (
                <GlassTabsTrigger
                  key={key}
                  value={key}
                  className="flex-1 capitalize"
                >
                  {key}
                </GlassTabsTrigger>
              ))}
            </GlassTabsList>

            {Object.entries(PANELS).map(([key, panels]) => (
              <GlassTabsContent key={key} value={key} className="pt-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  {panels.map((panel) => (
                    <div
                      key={panel.title}
                      className="rounded-xl border border-foreground/8 p-4"
                    >
                      <p className="text-[13px] font-medium">{panel.title}</p>
                      <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
                        {panel.body}
                      </p>
                    </div>
                  ))}
                </div>
              </GlassTabsContent>
            ))}
          </GlassTabs>
        </GlassSurface>
      </Scene>

      <Scene
        span={5}
        title="Menubar"
        description="Desktop-style menus, poured on the same chip material as the rest of the surface."
        components="Menubar · Trigger · Content · Item"
        stageClassName="items-start pt-10"
      >
        <div className="w-full max-w-sm space-y-4">
          <GlassSurface kind="menubar" className="p-1">
            <GlassMenubar>
              {[
                [
                  "File",
                  [
                    ["New lens", "⌘N"],
                    ["Duplicate", ""],
                    null,
                    ["Export…", ""],
                  ],
                ],
                [
                  "Edit",
                  [
                    ["Undo", "⌘Z"],
                    ["Redo", "⇧⌘Z"],
                    null,
                    ["Paste", "⇧⌘V"],
                  ],
                ],
                [
                  "View",
                  [
                    ["Zoom in", "⌘+"],
                    ["Zoom out", "⌘-"],
                  ],
                ],
              ].map(([menu, entries]) => (
                <GlassMenubarMenu key={menu as string}>
                  <GlassMenubarTrigger>{menu as string}</GlassMenubarTrigger>
                  <GlassMenubarContent>
                    {(entries as (string[] | null)[]).map((entry, i) =>
                      entry === null ? (
                        <GlassMenubarSeparator key={i} />
                      ) : (
                        <GlassMenubarItem key={entry[0]}>
                          {entry[0]}
                          {entry[1] ? (
                            <GlassMenubarShortcut>
                              {entry[1]}
                            </GlassMenubarShortcut>
                          ) : null}
                        </GlassMenubarItem>
                      )
                    )}
                  </GlassMenubarContent>
                </GlassMenubarMenu>
              ))}
            </GlassMenubar>
          </GlassSurface>

          <div className="glass-field flex h-9 items-center gap-2 rounded-xl px-3">
            <Search className="size-4 shrink-0 opacity-50" />
            <input
              className="w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
              placeholder="Search components…"
            />
            <Kbd className="shrink-0 text-[10px]">
              <Command className="size-2.5" />K
            </Kbd>
          </div>

          <div className="space-y-1">
            {[
              ["Aperture toolbar", "2 min ago"],
              ["Dialog, thick", "Yesterday"],
              ["Command palette", "3 days ago"],
            ].map(([name, when]) => (
              <button
                key={name}
                type="button"
                className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-foreground/5"
              >
                <span className="truncate text-[13px] text-foreground/85">
                  {name}
                </span>
                <span className="ml-auto shrink-0 text-[11.5px] text-muted-foreground">
                  {when}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Scene>

      <Scene
        span={12}
        title="Navigation menu"
        description="A mega menu as a real top nav: identity, primary routes, search, account — and a panel that expands on hover."
        components="NavigationMenu · List · Trigger · Content · Link"
        stageClassName="min-h-[230px] p-6 sm:p-10"
      >
        <div className="w-full max-w-4xl">
          <GlassSurface kind="navbar" radius={20} className="p-1.5 pl-4">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2.5">
                <span className="grid size-7 place-items-center rounded-lg bg-foreground text-background">
                  <Layers className="size-4" />
                </span>
                <span className="hidden text-[13px] font-semibold tracking-tight sm:block">
                  Aperture
                </span>
              </span>

              <GlassNavigationMenu className="flex-1">
                <GlassNavigationMenuList>
                  <GlassNavigationMenuItem>
                    <GlassNavigationMenuTrigger>Components</GlassNavigationMenuTrigger>
                    <GlassNavigationMenuContent>
                      <ul className="grid w-[min(38rem,80vw)] gap-1 sm:grid-cols-2">
                        {[
                          ["Foundation", "Buttons, badges, avatars"],
                          ["Inputs", "Fields, selects, toggles"],
                          ["Overlays", "Dialogs, sheets, menus"],
                          ["Navigation", "Tabs, menubars, trails"],
                        ].map(([title, body]) => (
                          <li key={title}>
                            <GlassNavigationMenuLink href="#components">
                              <span className="text-[13px] font-medium">
                                {title}
                              </span>
                              <span className="text-[12px] text-muted-foreground">
                                {body}
                              </span>
                            </GlassNavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </GlassNavigationMenuContent>
                  </GlassNavigationMenuItem>

                  <GlassNavigationMenuItem>
                    <GlassNavigationMenuTrigger>Materials</GlassNavigationMenuTrigger>
                  </GlassNavigationMenuItem>
                  <GlassNavigationMenuItem>
                    <GlassNavigationMenuTrigger>Docs</GlassNavigationMenuTrigger>
                  </GlassNavigationMenuItem>
                </GlassNavigationMenuList>
              </GlassNavigationMenu>

              <GlassButton variant="glass" size="icon" className="ml-auto">
                <Plus className="size-4" />
                <span className="sr-only">New lens</span>
              </GlassButton>
            </div>
          </GlassSurface>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#components">Registry</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#components">Components</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbPage>Navigation</BreadcrumbPage>
              </BreadcrumbList>
            </Breadcrumb>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </Scene>

      <Scene
        span={12}
        title="Disclosure"
        description="Accordion and collapsible keep the same weights and radii as everything else, so a dense panel never looks borrowed."
        components="Accordion · Collapsible"
        stageClassName="min-h-[230px] p-6 sm:p-10"
      >
        <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
          <GlassSurface kind="card" radius={16} className="px-4">
            <Accordion type="single" collapsible defaultValue="item-1">
              <AccordionItem value="item-1">
                <AccordionTrigger>What is refraction?</AccordionTrigger>
                <AccordionContent>
                  A displacement map bends the backdrop inside the glass bounds.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Does it work in Safari?</AccordionTrigger>
                <AccordionContent>
                  Safari falls back to a frosted blur automatically.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Is there a runtime?</AccordionTrigger>
                <AccordionContent>
                  None. Copy the files and go.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </GlassSurface>

          <Collapsible className="space-y-3">
            <CollapsibleTrigger asChild>
              <GlassButton variant="glass" className="w-full justify-between">
                Advanced optics
                <ChevronDown className="size-4" />
              </GlassButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="glass-field grid gap-1.5 rounded-lg p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
                <span>chroma 0.100</span>
                <span>splay 16 · feather 34</span>
                <span>curve 3.0 · glint 55</span>
              </div>
            </CollapsibleContent>

            <GlassSurface kind="card" radius={16} className="p-4">
              <p className="text-[13px] font-medium">Why a canvas?</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
                The displacement map is generated per size, so the bend matches
                the exact corner radius of the surface it sits on.
              </p>
            </GlassSurface>
          </Collapsible>
        </div>
      </Scene>
    </SceneGrid>
  );
}