"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export function GlassProgress({
  className,
  ...props
}: React.ComponentProps<typeof Progress>) {
  return <Progress {...props} className={cn("glass-inset", className)} />;
}
