"use client";

import * as React from "react";
import { Badge, badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export function GlassBadge({
  className,
  variant = "glass",
  ...props
}: Omit<React.ComponentProps<typeof Badge>, "variant"> & {
  variant?: BadgeVariant | "glass";
}) {
  if (variant !== "glass") {
    return <Badge variant={variant} className={className} {...props} />;
  }
  return (
    <Badge
      variant="outline"
      {...props}
      className={cn("glass-chip border-none text-foreground", className)}
    />
  );
}
