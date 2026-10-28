"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useGlassFormField } from "@/components/glass/glass-form";
import { cn } from "@/lib/utils";

export function GlassInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  const field = useGlassFormField();
  return (
    <Input
      id={field?.id}
      aria-invalid={field?.invalid || undefined}
      aria-describedby={field?.describedBy}
      {...props}
      className={cn(
        "glass-field h-10 rounded-full px-4 border-foreground/10 shadow-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
        className,
      )}
    />
  );
}

export function GlassTextarea({
  className,
  ...props
}: React.ComponentProps<typeof Textarea>) {
  const field = useGlassFormField();
  return (
    <Textarea
      id={field?.id}
      aria-invalid={field?.invalid || undefined}
      aria-describedby={field?.describedBy}
      {...props}
      className={cn(
        "glass-field rounded-[12px] border-foreground/10 shadow-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
        className,
      )}
    />
  );
}

export { Label } from "@/components/ui/label";
