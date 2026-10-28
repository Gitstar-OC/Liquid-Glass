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
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
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
  "data-[state=open]:bg-foreground/10 dark:data-[state=open]:bg-white/15 rounded-lg px-2.5 py-1.5 text-sm font-medium text-foreground transition-all outline-none hover:bg-foreground/10 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=open]:text-foreground dark:hover:bg-white/10 [&_svg:not([class*='size-'])]:size-4",
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
        className="relative top-[1px] ml-1 size-3 transition-transform duration-300 group-data-[state=open]/navigation-menu-trigger:rotate-180"
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
        "ease-[cubic-bezier(0.22,1,0.36,1)] data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 data-[motion^=from-]:animate-in data-[motion^=from-]:fade-in data-[motion^=to-]:animate-out data-[motion^=to-]:fade-out **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none md:absolute md:w-auto",
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
        "absolute top-full left-0 isolate z-50 flex justify-center",
      )}
    >
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        {...props}
        className={cn(
          "origin-top-center relative mt-1.5 h-(--radix-navigation-menu-viewport-height) w-full overflow-hidden rounded-2xl duration-100 md:w-(--radix-navigation-menu-viewport-width) data-open:animate-in data-open:zoom-in-90 data-closed:animate-out data-closed:zoom-out-90",
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
        "flex w-full cursor-pointer flex-col gap-1 rounded-xl p-2 transition-colors hover:bg-foreground/10 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none dark:hover:bg-white/10",
        className,
      )}
    />
  );
}

export { NavigationMenuItem } from "@/components/ui/navigation-menu";
