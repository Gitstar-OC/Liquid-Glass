"use client";

import * as React from "react";
import { NavigationMenu as NavigationMenuPrimitive } from "radix-ui";
import { cva } from "class-variance-authority";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassSurface } from "@/components/glass/glass-surface";

export function GlassNavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  viewport?: boolean;
}) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      {...props}
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-start",
        className,
      )}
    >
      {children}
      {viewport && <GlassNavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  );
}

export function GlassNavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      {...props}
      className={cn(
        "glass-chip flex items-center justify-center gap-0.5 rounded-full p-1",
        className,
      )}
    />
  );
}

const navigationMenuTriggerStyle = cva(
  "inline-flex h-10 items-center justify-center gap-1.5 data-[state=open]:bg-foreground/8 rounded-full px-4 text-[13px] font-medium text-foreground transition-colors outline-none hover:bg-foreground/4 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4",
);

export function GlassNavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      {...props}
      className={cn(navigationMenuTriggerStyle(), "group", className)}
    >
      {children}{" "}
      <ChevronDownIcon
        className="size-3 transition-transform duration-200 group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

export function GlassNavigationMenuContent({
  className,
  surface,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content> & {
  surface?: import("@/lib/glass-theme").GlassSurface;
}) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      {...props}
      className={cn(
        "ease-[cubic-bezier(0.22,1,0.36,1)] data-[motion=from-end]:slide-in-from-right-2 data-[motion=from-start]:slide-in-from-left-2 data-[motion=to-end]:slide-out-to-right-2 data-[motion=to-start]:slide-out-to-left-2 data-[motion^=from-]:animate-in data-[motion^=from-]:fade-in data-[motion^=to-]:animate-out data-[motion^=to-]:fade-out **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none w-max max-w-[calc(100vw-2rem)] group-data-[viewport=true]/navigation-menu:absolute group-data-[viewport=false]/navigation-menu:absolute group-data-[viewport=false]/navigation-menu:left-0 group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-2",
        className,
      )}
    >
      <GlassSurface
        kind="popover"
        surface={surface}
        className="h-full w-full p-3"
      >
        {props.children}
      </GlassSurface>
    </NavigationMenuPrimitive.Content>
  );
}

function GlassNavigationMenuViewport({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div
      className={cn(
        "absolute top-full left-0 isolate z-50 w-max max-w-[calc(100vw-2rem)]",
      )}
    >
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        {...props}
        className={cn(
          "relative mt-2 h-(--radix-navigation-menu-viewport-height) w-(--radix-navigation-menu-viewport-width) max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl transition-[width,height] duration-150 ease-out data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          className,
        )}
      />
    </div>
  );
}

export function GlassNavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      {...props}
      className={cn(
        "flex min-h-10 w-full cursor-pointer flex-col justify-center gap-1 rounded-xl px-3 py-2 text-[13px] transition-colors hover:bg-foreground/4 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        className,
      )}
    />
  );
}

export { NavigationMenuItem } from "@/components/ui/navigation-menu";
