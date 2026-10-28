"use client";
import Link from "next/link";
import { useState } from "react";
import { GlassButton } from "@/components/glass/glass-button";
import { GlassIcon } from "@/components/glass/glass-icons";
import { Popover,PopoverTrigger,GlassPopoverContent } from "@/components/glass/glass-popover";
export function MobileSiteNavigation() {
  const [open,setOpen]=useState(false);
  return <div className="flex flex-1 sm:hidden"><Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><GlassButton variant="ghost" className="h-10 gap-2 px-2" aria-label="Open navigation"><GlassIcon name="components" data-icon="inline-start"/>Browse</GlassButton></PopoverTrigger><GlassPopoverContent align="start" sideOffset={10} collisionPadding={16} className="w-48"><nav aria-label="Main navigation" className="flex flex-col gap-1">{[{href:"/components",title:"Components"},{href:"/playground",title:"Playground"},{href:"/docs",title:"Documentation"}].map(item=><Link key={item.href} href={item.href} onClick={()=>setOpen(false)} className="flex h-10 items-center rounded-xl px-3 text-[13px] hover:bg-foreground/5">{item.title}</Link>)}</nav></GlassPopoverContent></Popover></div>;
}
