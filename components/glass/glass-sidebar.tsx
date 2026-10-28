"use client";
import * as React from "react";
import { Slot } from "radix-ui";
import {
  GlassSurface,
  type GlassSurfaceProps,
} from "@/components/glass/glass-surface";
import { cn } from "@/lib/utils";
export function GlassSidebar({
  className,
  ...props
}: Omit<GlassSurfaceProps, "kind" | "as">) {
  return (
    <GlassSurface
      kind="card"
      as="aside"
      className={cn("flex w-52 shrink-0 flex-col gap-1 p-3", className)}
      {...props}
    />
  );
}
export function GlassSidebarItem({
  active,
  asChild,
  className,
  ...props
}: React.ComponentProps<"button"> & { active?: boolean; asChild?: boolean }) {
  const Tag = asChild ? Slot.Root : "button";
  return (
    <Tag
      type={asChild ? undefined : "button"}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-9 w-full items-center gap-2.5 rounded-[12px] px-3 text-left text-xs text-foreground/65 transition-colors hover:bg-foreground/8 hover:text-foreground",
        active && "bg-foreground/10 text-foreground",
        className,
      )}
      {...props}
    />
  );
}
