"use client";
import {
  GlassSurface,
  type GlassSurfaceProps,
} from "@/components/glass/glass-surface";
import { cn } from "@/lib/utils";
export function GlassNavbar({
  className,
  ...props
}: Omit<GlassSurfaceProps, "kind" | "as">) {
  return (
    <GlassSurface
      kind="navbar"
      as="nav"
      radius={999}
      className={cn(
        "flex min-h-14 items-center justify-between gap-2 p-1.5",
        className,
      )}
      {...props}
    />
  );
}
