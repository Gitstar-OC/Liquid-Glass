"use client";
import * as React from "react";
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "@/components/ui/button-group";
import { cn } from "@/lib/utils";
import { GlassSurface } from "@/components/glass/glass-surface";
export function GlassButtonGroup({
  className,
  ...props
}: React.ComponentProps<typeof ButtonGroup>) {
  return (
    <GlassSurface asChild shape="round" radius={999}><ButtonGroup
      className={cn("glass-action-group gap-1 rounded-full p-1 [&>button]:shadow-none", className)}
      {...props}
    /></GlassSurface>
  );
}
export {
  ButtonGroupSeparator as GlassButtonGroupSeparator,
  ButtonGroupText as GlassButtonGroupText,
};
