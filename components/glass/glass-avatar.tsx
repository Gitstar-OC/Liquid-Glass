"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export function GlassAvatar({
  className,
  ...props
}: React.ComponentProps<typeof Avatar>) {
  return (
    <Avatar
      {...props}
      className={cn("ring-1 ring-foreground/20 ", className)}
    />
  );
}

export {
  AvatarImage as GlassAvatarImage,
  AvatarFallback as GlassAvatarFallback,
};

export function GlassSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      {...props}
      className={cn("bg-foreground/15 dark:bg-white/12", className)}
    />
  );
}
