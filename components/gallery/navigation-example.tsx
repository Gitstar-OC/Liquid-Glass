"use client";

import { useState } from "react";
import { Tabs } from "radix-ui";
import { ArrowUpRight, FileText, Folder, Plus, Power } from "lucide-react";
import { useGlassScene } from "@/components/glass-scene";
import { cn } from "@/lib/utils";
import { GlassNavbar } from "@/components/glass/glass-navbar";
import { GlassButton } from "@/components/glass/glass-button";
import { GlassDrawerContent, Drawer, DrawerTrigger, DrawerClose, DrawerTitle, DrawerDescription } from "@/components/glass/glass-drawer";
import { GlassPowerDialog } from "@/components/glass/glass-power";

/** Reused on the homepage and in the component gallery. */
export function NavigationExample({ container }: { container: HTMLElement | null }) {
  const scene = useGlassScene();
  const captionClass = cn("pt-5 text-center text-xs", scene?.appearance === "light" ? "text-black/75" : "text-white/85");
  const [view, setView] = useState("recent");
  const [selected, setSelected] = useState("Design library");
  const [resting, setResting] = useState(false);
  if (resting) return <GlassButton autoFocus onClick={() => setResting(false)}>Wake preview</GlassButton>;
  return <div className="flex w-full max-w-[360px] flex-col items-center gap-7">
    <Tabs.Root value={view} onValueChange={setView} className="w-full">
      <GlassNavbar aria-label="Library navigation">
        <Tabs.List aria-label="Library views" className="flex min-w-0 flex-1 gap-1">
          {[{id:"recent",label:"Recent"},{id:"saved",label:"Saved"}].map(item => <Tabs.Trigger key={item.id} value={item.id} asChild><GlassButton className="flex-1 px-3 data-[state=active]:bg-foreground/15">{item.label}</GlassButton></Tabs.Trigger>)}
        </Tabs.List>
        <Drawer shouldScaleBackground={false}>
          <DrawerTrigger asChild><GlassButton shape="circle" aria-label="Open library"><Plus /></GlassButton></DrawerTrigger>
          <GlassDrawerContent container={container}>
            <div><DrawerTitle className="text-base">Your library</DrawerTitle><DrawerDescription className="mt-1 text-xs text-foreground/65">Choose a folder to open.</DrawerDescription></div>
            <div className="flex flex-col gap-1">
              {["Design library","Personal projects","Shared with you"].map(label => <DrawerClose asChild key={label}><GlassButton className="justify-start gap-3" onClick={() => setSelected(label)}><Folder data-icon="inline-start" />{label}<ArrowUpRight data-icon="inline-end" className="ml-auto" /></GlassButton></DrawerClose>)}
            </div>
          </GlassDrawerContent>
        </Drawer>
      </GlassNavbar>
      <Tabs.Content value="recent" className={captionClass}>{selected}</Tabs.Content>
      <Tabs.Content value="saved" className={captionClass}>3 saved collections</Tabs.Content>
    </Tabs.Root>
    <div className="flex items-center gap-3">
      <GlassButton onClick={() => setSelected("Untitled note")}><FileText data-icon="inline-start" />New note</GlassButton>
      <GlassPowerDialog container={container} trigger={<GlassButton shape="circle" aria-label="Open power controls"><Power /></GlassButton>} onConfirm={() => setResting(true)} />
    </div>
    <p className="sr-only" role="status">{selected}</p>
  </div>;
}
