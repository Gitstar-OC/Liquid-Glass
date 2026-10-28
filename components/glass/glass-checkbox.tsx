"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function GlassCheckbox({
  className,
  ...props
}: React.ComponentProps<typeof Checkbox>) {
  return (
    <Checkbox
      {...props}
      className={cn(
        "glass-chip data-checked:bg-foreground data-checked:text-background",
        className,
      )}
    />
  );
}

export function GlassRadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroup>) {
  return <RadioGroup {...props} className={cn(className)} />;
}

export function GlassRadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupItem>) {
  return (
    <RadioGroupItem
      {...props}
      className={cn("glass-chip before:hidden", className)}
    />
  );
}
