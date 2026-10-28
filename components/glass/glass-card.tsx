"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import {
  GlassSurface,
  type GlassSurfaceProps,
} from "@/components/glass/glass-surface";
import type { GlassSurface as GlassSurfaceKind } from "@/lib/glass-theme";

export function GlassCard({
  className,
  surface,
  radius,
  ink,
  contrastProtection,
  config,
  children,
  ...props
}: React.ComponentProps<typeof Card> & {
  surface?: GlassSurfaceKind;
  radius?: number;
} & Pick<GlassSurfaceProps, "ink" | "contrastProtection" | "config">) {
  return (
    <GlassSurface
      kind="card"
      surface={surface}
      radius={radius}
      ink={ink}
      contrastProtection={contrastProtection}
      config={config}
      asChild
    >
      <Card {...props} className={className}>
        {children}
      </Card>
    </GlassSurface>
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
