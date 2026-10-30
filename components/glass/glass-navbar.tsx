"use client";
import { GlassPanel, type GlassPanelProps } from "@/components/glass/glass-panel";
import type { GlassSurfaceProps } from "@/components/glass/glass-surface";
import { cn } from "@/lib/utils";
export function GlassNavbar({
  className,
  children,
  config,
  surface,
  shadow,
  lensParameters,
  asChild = false,
  ...props
}: Omit<GlassPanelProps, "kind"> & Pick<GlassSurfaceProps, "config" | "surface" | "shadow">) {
  // Retained for installed consumers; refracting glass does not paint shadows.
  void shadow;
  return (
    <GlassPanel
      kind="dock"
      asChild
      radius={999}
      shape="round"
      lensParameters={{ ...(surface === "frosted" ? { blur: 8 } : {}), ...(config?.blur === undefined ? {} : { blur: config.blur }), ...lensParameters }}
      className={cn(
        "flex min-h-14 items-center justify-between gap-2 p-1.5",
        className,
      )}
      {...props}
    >
      {asChild ? children : <nav>{children}</nav>}
    </GlassPanel>
  );
}
