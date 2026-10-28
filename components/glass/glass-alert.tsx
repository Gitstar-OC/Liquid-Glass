"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function GlassAlert({
  className,
  ...props
}: React.ComponentProps<typeof Alert>) {
  return (
    <Alert
      {...props}
      className={cn(
        "glass-chip rounded-2xl border-none shadow-none",
        className,
      )}
    />
  );
}

export { AlertTitle, AlertDescription };
