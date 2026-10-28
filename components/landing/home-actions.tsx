"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { GlassSurface } from "@/components/glass/glass-surface";
import { GlassButton } from "@/components/glass/glass-button";
import { GlassIcon } from "@/components/glass/glass-icons";
import { glassToast } from "@/components/glass/glass-toaster";
import { Popover, PopoverTrigger, GlassPopoverContent } from "@/components/glass/glass-popover";
import { Dialog, DialogTrigger, GlassDialogContent, DialogTitle, DialogDescription } from "@/components/glass/glass-dialog";
import { DEMO_PHOTOS } from "@/lib/demo-assets";
import { GlassPowerPanel } from "@/components/glass/glass-power";
import { GlassButtonGroup } from "@/components/glass/glass-button-group";

const subscribe=()=>()=>{};
const shortcut=()=>/Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘ D" : "Ctrl D";
export function BookmarkControl() {
  const keys=useSyncExternalStore(subscribe,shortcut,()=>"Ctrl D");
  const [copied,setCopied]=useState(false);
  return <Popover><PopoverTrigger asChild><GlassButton shape="circle" className="size-11" aria-label="Bookmark this site"><GlassIcon name="bookmark"/></GlassButton></PopoverTrigger>
    <GlassPopoverContent aria-label="Bookmark this site" className="w-60" side="bottom" align="end">
      <h3 className="text-xs font-semibold">Bookmark this page</h3><p className="text-xs leading-5 text-foreground/70">Press <kbd className="rounded-md bg-foreground/8 px-1.5 py-1 font-semibold">{keys}</kbd> to save it in your browser.</p>
      <GlassButton variant="secondary" className="h-9" onClick={async()=>{try{await navigator.clipboard.writeText(location.href);setCopied(true);}catch{setCopied(false);}}}><GlassIcon name={copied ? "check" : "copy"} data-icon="inline-start"/>{copied ? "Link copied" : "Copy link"}</GlassButton>
    </GlassPopoverContent>
  </Popover>;
}
export function NotificationControl() {
  return <GlassButton shape="circle" className="size-11" aria-label="Show notification" onClick={()=>glassToast("Photo received",{id:"showcase-photo",description:"Alex shared a view with you.",image:{src:DEMO_PHOTOS.ocean.src,alt:"Ocean waves"},toasterId:"showcase",duration:6000})}><GlassIcon name="bell"/></GlassButton>;
}
export function MessagePreview({paused,container,onOpenChange}:{paused:boolean;container:HTMLElement|null;onOpenChange:(open:boolean)=>void}) {
  return <GlassSurface shape="squircle" radius={24} className="flex min-h-20 w-full items-center gap-3 p-3.5" aria-label="Message with image">
    <div className="min-w-0 flex-1"><p className="text-xs font-semibold">{paused ? "Focus is on" : "A photo from Alex"}</p><p className="mt-1 text-[11px] leading-4 text-foreground/65">{paused ? "Notifications are paused." : "Saved you a view."}</p></div>
    <Dialog onOpenChange={onOpenChange}><DialogTrigger asChild><GlassButton variant="ghost" shape="default" className="h-12 w-16 shrink-0 overflow-hidden rounded-xl p-0" aria-label="Open photo from Alex">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={DEMO_PHOTOS.ocean.src} alt="Ocean waves" width={64} height={48} className="size-full object-cover"/>
    </GlassButton></DialogTrigger><GlassDialogContent container={container} className="max-w-[min(420px,calc(100%-2rem))]" showCloseButton>
      <div><DialogTitle>A photo from Alex</DialogTitle><DialogDescription className="mt-1 text-xs text-foreground/65">Ocean light. Shared in this preview.</DialogDescription></div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={DEMO_PHOTOS.ocean.src} alt="Blue ocean swells beneath a pale sky" width={384} height={256} className="aspect-[3/2] w-full rounded-2xl object-cover"/>
    </GlassDialogContent></Dialog>
  </GlassSurface>;
}
export function LeaveSitePreview() {
  const [staying,setStaying]=useState(false);
  return <GlassSurface shape="squircle" radius={24} className="showcase-power flex flex-col justify-between gap-4 p-4" aria-label="Leave site confirmation">
    <div className="grid size-12 place-items-center rounded-full bg-foreground/10"><GlassIcon name="diagonal" className="size-6"/></div>
    <div><h3 className="text-[13px] font-semibold">{staying ? "You’re staying here." : "Leave this site?"}</h3><p className="mt-2 text-xs leading-[18px] text-foreground/70">{staying ? "Your preview is right where you left it." : "Continue to shadcn/ui on GitHub in a new tab."}</p></div>
    <div className="grid grid-cols-2 gap-2"><GlassButton variant="secondary" onClick={()=>setStaying(!staying)}>{staying ? "Review link" : "Stay here"}</GlassButton><GlassButton variant="primary" asChild><a href="https://github.com/shadcn-ui/ui" target="_blank" rel="noopener noreferrer">Continue<GlassIcon name="diagonal" data-icon="inline-end"/></a></GlassButton></div>
  </GlassSurface>;
}

export function ShutdownPreview() {
  const [off,setOff]=useState(false);
  const [canceled,setCanceled]=useState(false);
  if(off) return <GlassSurface shape="squircle" radius={24} className="showcase-shutdown flex flex-col items-start justify-between gap-4 p-4" aria-label="Shutdown preview">
    <GlassIcon name="power" className="size-10 text-foreground/60" strokeWidth={1.35}/>
    <div><h3 className="text-[13px] font-semibold">The preview is off.</h3><p className="mt-1.5 text-xs text-foreground/65">Ready when you are.</p></div>
    <GlassButton variant="primary" className="w-full" onClick={()=>{setOff(false);setCanceled(false);}}>Wake preview</GlassButton>
  </GlassSurface>;
  return <GlassPowerPanel shape="squircle" radius={24} className="showcase-shutdown max-w-none p-4" aria-label="Shutdown confirmation"
    title="Shut down this preview?"
    description={canceled ? "Shutdown canceled. Your preview will stay on." : "Your open windows can be restored when you return."}
    onCancel={()=>setCanceled(true)} onConfirm={()=>setOff(true)}/>;
}

export function QuickActions({onSearch}:{onSearch:()=>void}) {
  const [copied,setCopied]=useState(false);
  return <GlassButtonGroup aria-label="Page actions" className="h-12 shrink-0">
    <GlassButton variant="ghost" shape="circle" className="size-10" aria-label={copied ? "Page link copied" : "Copy page link"} onClick={async()=>{try{await navigator.clipboard.writeText(location.href);setCopied(true);}catch{setCopied(false);}}}><GlassIcon name={copied ? "check" : "copy"} className="size-4"/></GlassButton>
    <GlassButton variant="ghost" shape="circle" className="size-10" aria-label="Find a component" onClick={onSearch}><GlassIcon name="search" className="size-4"/></GlassButton>
    <Popover><PopoverTrigger asChild><GlassButton variant="ghost" shape="circle" className="size-10" aria-label="More page actions"><GlassIcon name="more" className="size-4"/></GlassButton></PopoverTrigger>
      <GlassPopoverContent side="top" align="start" className="w-52 gap-1 p-2" aria-label="More page actions">
        <GlassButton variant="ghost" className="justify-start" asChild><Link href="/playground"><GlassIcon name="sliders" className="size-4"/>Open playground</Link></GlassButton>
        <GlassButton variant="ghost" className="justify-start" asChild><Link href="/docs/glass-button-group"><GlassIcon name="book" className="size-4"/>Button group docs</Link></GlassButton>
      </GlassPopoverContent>
    </Popover>
  </GlassButtonGroup>;
}
