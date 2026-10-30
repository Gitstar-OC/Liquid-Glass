"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import {
  Tabs,
  TabsContent,
  TabsTrigger as BaseTabsTrigger,
} from "@/components/ui/tabs";
import { GlassSelection } from "@/components/glass/glass-selection";

export function GlassTabs({
  className,
  ...props
}: React.ComponentProps<typeof Tabs>) {
  return <Tabs {...props} className={cn(className)} />;
}

export function GlassTabsList({
  className,
  children,
  refractionTarget,
  ...props
}: React.ComponentProps<"div"> & { refractionTarget?: React.ReactNode }) {
  return (
    <TabsPrimitive.List asChild>
      <div
        data-slot="tabs-list"
        data-variant="default"
        {...props}
        data-liquid-selection="true"
        className={cn(
          "group/tabs-list glass-chip relative isolate inline-flex h-10 w-fit items-center justify-center rounded-[12px] p-1 text-muted-foreground",
          className,
        )}
      >
        <GlassSelection refractionTarget={refractionTarget}>
          {children}
        </GlassSelection>
      </div>
    </TabsPrimitive.List>
  );
}

export function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof BaseTabsTrigger>) {
  return (
    <BaseTabsTrigger
      className={cn(
        "relative z-1 select-text data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none",
        className,
      )}
      {...props}
    />
  );
}
export { TabsContent };
