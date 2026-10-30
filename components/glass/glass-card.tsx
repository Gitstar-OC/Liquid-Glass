"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import type { GlassSurfaceProps } from "@/components/glass/glass-surface";
import { GlassPanel, type GlassPanelProps } from "@/components/glass/glass-panel";
import type { GlassSurface as GlassSurfaceKind } from "@/lib/glass-theme";
import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  surface,
  radius,
  ink,
  contrastProtection,
  config,
  shape = "squircle",
  lensParameters,
  children,
  ...props
}: React.ComponentProps<typeof Card> & {
  surface?: GlassSurfaceKind;
  radius?: number;
} & Pick<GlassSurfaceProps, "ink" | "contrastProtection" | "config"> &
  Pick<GlassPanelProps, "shape" | "lensParameters">) {
  return (
    <GlassPanel
      kind="card"
      radius={radius}
      shape={shape}
      ink={ink}
      contrastProtection={contrastProtection}
      lensParameters={{ ...(surface === "frosted" ? { blur: 8 } : {}), ...(config?.blur === undefined ? {} : { blur: config.blur }), ...lensParameters }}
      asChild
    >
      <Card {...props} className={cn("overflow-visible bg-transparent ring-0", className)}>
        {children}
      </Card>
    </GlassPanel>
  );
}

export {
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
