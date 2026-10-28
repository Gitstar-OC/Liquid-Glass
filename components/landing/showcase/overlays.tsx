"use client";

import * as React from "react";
import {
  Calendar,
  Cloud,
  CreditCard,
  Layers,
  LogOut,
  Mail,
  MessageSquare,
  Palette,
  Plus,
  Settings,
  Share2,
  Smile,
  Trash,
  User,
} from "lucide-react";
import { toast } from "sonner";

import {
  GlassAlertDialog,
  GlassAlertDialogAction,
  GlassAlertDialogCancel,
  GlassAlertDialogContent,
  GlassAlertDialogDescription,
  GlassAlertDialogFooter,
  GlassAlertDialogHeader,
  GlassAlertDialogTitle,
  GlassAlertDialogTrigger,
  GlassButton,
  GlassCommand,
  GlassCommandEmpty,
  GlassCommandGroup,
  GlassCommandInput,
  GlassCommandItem,
  GlassCommandList,
  GlassCommandSeparator,
  GlassCommandShortcut,
  GlassContextMenu,
  GlassContextMenuContent,
  GlassContextMenuItem,
  GlassContextMenuLabel,
  GlassContextMenuSeparator,
  GlassContextMenuTrigger,
  GlassDialog,
  GlassDialogContent,
  GlassDialogDescription,
  GlassDialogFooter,
  GlassDialogHeader,
  GlassDialogTitle,
  GlassDialogTrigger,
  GlassDrawer,
  GlassDrawerContent,
  GlassDrawerDescription,
  GlassDrawerHeader,
  GlassDrawerTitle,
  GlassDrawerTrigger,
  GlassDropdownMenu,
  GlassDropdownMenuCheckboxItem,
  GlassDropdownMenuContent,
  GlassDropdownMenuItem,
  GlassDropdownMenuLabel,
  GlassDropdownMenuSeparator,
  GlassDropdownMenuShortcut,
  GlassDropdownMenuSub,
  GlassDropdownMenuSubContent,
  GlassDropdownMenuSubTrigger,
  GlassDropdownMenuTrigger,
  GlassHoverCard,
  GlassHoverCardContent,
  GlassHoverCardTrigger,
  GlassInput,
  GlassPopover,
  GlassPopoverContent,
  GlassPopoverDescription,
  GlassPopoverHeader,
  GlassPopoverTitle,
  GlassPopoverTrigger,
  GlassSheet,
  GlassSheetContent,
  GlassSheetDescription,
  GlassSheetHeader,
  GlassSheetTitle,
  GlassSheetTrigger,
  GlassSurface,
  GlassTooltip,
  GlassTooltipContent,
  GlassTooltipProvider,
  GlassTooltipTrigger,
} from "@/components/glass";
import { Scene, SceneGrid } from "@/components/landing/scene";

export function OverlaysShowcase() {
  const [notifications, setNotifications] = React.useState(true);

  return (
    <SceneGrid>
      {/* Rendered in place — no portal — so the palette is the subject. */}
      <Scene
        span={5}
        title="Command palette"
        description="Search, groups, separators and shortcuts in one frosted plane. Press ⌘K in a real app; here it just sits there, open."
        components="Command · Input · Item · Shortcut"
      >
        <GlassSurface kind="command" className="w-full max-w-sm overflow-hidden">
          <GlassCommand>
            <GlassCommandInput placeholder="Type a command or search…" />
            <GlassCommandList>
              <GlassCommandEmpty>No results found.</GlassCommandEmpty>
              <GlassCommandGroup heading="Suggestions">
                {[
                  [Calendar, "Calendar"],
                  [Smile, "Search emoji"],
                  [Cloud, "Weather"],
                ].map(([Icon, label]) => {
                  const I = Icon as React.ElementType;
                  return (
                    <GlassCommandItem key={label as string}>
                      <I className="size-4" />
                      {label as string}
                    </GlassCommandItem>
                  );
                })}
              </GlassCommandGroup>
              <GlassCommandSeparator />
              <GlassCommandGroup heading="Settings">
                <GlassCommandItem>
                  <User className="size-4" />
                  Profile
                  <GlassCommandShortcut>⌘P</GlassCommandShortcut>
                </GlassCommandItem>
                <GlassCommandItem>
                  <Settings className="size-4" />
                  Settings
                  <GlassCommandShortcut>⌘S</GlassCommandShortcut>
                </GlassCommandItem>
              </GlassCommandGroup>
            </GlassCommandList>
          </GlassCommand>
        </GlassSurface>
      </Scene>

      <Scene
        span={7}
        title="Menus in context"
        description="Dropdowns, popovers, selects and context menus anchored to a real surface — each trigger sits where it belongs in the interface, not in a box of its own."
        components="Dropdown · Popover · Select · Context menu · Tooltip"
      >
        <GlassSurface kind="card" className="w-full max-w-lg p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h4 className="truncate text-[15px] font-semibold tracking-[-0.015em]">
                Clearcut
              </h4>
              <p className="mt-1 text-[12.5px] text-muted-foreground">
                A refraction preset · 5 surfaces
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <GlassTooltipProvider delayDuration={150}>
                <GlassTooltip>
                  <GlassTooltipTrigger asChild>
                    <GlassButton variant="glass" size="icon" aria-label="Share">
                      <Share2 className="size-4" />
                    </GlassButton>
                  </GlassTooltipTrigger>
                  <GlassTooltipContent>Copy share link</GlassTooltipContent>
                </GlassTooltip>
              </GlassTooltipProvider>

              <GlassPopover>
                <GlassPopoverTrigger asChild>
                  <GlassButton variant="glass" size="icon" aria-label="Tune">
                    <Palette className="size-4" />
                  </GlassButton>
                </GlassPopoverTrigger>
                <GlassPopoverContent className="w-64">
                  <GlassPopoverHeader>
                    <GlassPopoverTitle>Dimensions</GlassPopoverTitle>
                    <GlassPopoverDescription>
                      Set the size for the selected layer.
                    </GlassPopoverDescription>
                  </GlassPopoverHeader>
                  <div className="grid grid-cols-2 gap-2">
                    <GlassInput defaultValue="190" aria-label="Width" />
                    <GlassInput defaultValue="190" aria-label="Height" />
                  </div>
                </GlassPopoverContent>
              </GlassPopover>
            </div>
          </div>

          <GlassContextMenu>
            <GlassContextMenuTrigger className="mt-5 block w-full cursor-default rounded-2xl border border-dashed border-foreground/15 p-6 text-center transition-colors hover:bg-foreground/[0.03]">
              <Layers className="mx-auto size-5 text-muted-foreground" />
              <p className="mt-2 text-[13px] text-muted-foreground">
                Right-click for the context menu
              </p>
            </GlassContextMenuTrigger>
            <GlassContextMenuContent className="w-52">
              <GlassContextMenuLabel>Edit</GlassContextMenuLabel>
              <GlassContextMenuSeparator />
              <GlassContextMenuItem>
                <Mail className="size-4" /> Email
              </GlassContextMenuItem>
              <GlassContextMenuItem>
                <MessageSquare className="size-4" /> Message
              </GlassContextMenuItem>
              <GlassContextMenuSeparator />
              <GlassContextMenuItem variant="destructive">
                <Trash className="size-4" /> Delete
              </GlassContextMenuItem>
            </GlassContextMenuContent>
          </GlassContextMenu>

          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-foreground/8 pt-5">
            <GlassDropdownMenu>
              <GlassDropdownMenuTrigger asChild>
                <GlassButton variant="glass">
                  Account
                  <CreditCard className="size-4" />
                </GlassButton>
              </GlassDropdownMenuTrigger>
              <GlassDropdownMenuContent align="start" className="w-56">
                <GlassDropdownMenuLabel>My account</GlassDropdownMenuLabel>
                <GlassDropdownMenuSeparator />
                <GlassDropdownMenuItem>
                  <User className="size-4" />
                  Profile
                  <GlassDropdownMenuShortcut>⇧⌘P</GlassDropdownMenuShortcut>
                </GlassDropdownMenuItem>
                <GlassDropdownMenuItem>
                  <CreditCard className="size-4" />
                  Billing
                </GlassDropdownMenuItem>
                <GlassDropdownMenuCheckboxItem
                  checked={notifications}
                  onCheckedChange={setNotifications}
                >
                  Notifications
                </GlassDropdownMenuCheckboxItem>
                <GlassDropdownMenuSeparator />
                <GlassDropdownMenuSub>
                  <GlassDropdownMenuSubTrigger>
                    <Settings className="size-4" />
                    Appearance
                  </GlassDropdownMenuSubTrigger>
                  <GlassDropdownMenuSubContent>
                    <GlassDropdownMenuItem>Light</GlassDropdownMenuItem>
                    <GlassDropdownMenuItem>Dark</GlassDropdownMenuItem>
                    <GlassDropdownMenuItem>System</GlassDropdownMenuItem>
                  </GlassDropdownMenuSubContent>
                </GlassDropdownMenuSub>
                <GlassDropdownMenuSeparator />
                <GlassDropdownMenuItem variant="destructive">
                  <LogOut className="size-4" />
                  Log out
                </GlassDropdownMenuItem>
              </GlassDropdownMenuContent>
            </GlassDropdownMenu>

            <GlassHoverCard>
              <GlassHoverCardTrigger asChild>
                <GlassButton variant="ghost">@liquid</GlassButton>
              </GlassHoverCardTrigger>
              <GlassHoverCardContent className="w-72">
                <div className="flex items-start gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-full bg-white/20 text-sm font-semibold">
                    LG
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">Liquid Glass</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Optical components for the web. Built on shadcn/ui and
                      Radix.
                    </p>
                  </div>
                </div>
              </GlassHoverCardContent>
            </GlassHoverCard>

            <GlassButton
              variant="glass-strong"
              className="ml-auto"
              onClick={() =>
                toast.success("Surface applied", {
                  description: "Clear · depth 56",
                })
              }
            >
              Apply preset
            </GlassButton>
          </div>
        </GlassSurface>
      </Scene>

      <Scene
        span={12}
        title="Modals and panels"
        description="Four ways to interrupt: confirm in place, ask in a dialog, edit from the edge, act from the bottom. Each is one trigger in a real layout."
        components="Dialog · AlertDialog · Sheet · Drawer"
        stageClassName="min-h-[240px] p-6 sm:p-10"
      >
        <div className="grid w-full max-w-4xl gap-6 lg:grid-cols-[1.1fr_1fr]">
          <GlassSurface kind="card" className="p-6">
            <h4 className="text-[14px] font-semibold tracking-[-0.01em]">
              Clearcut
            </h4>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
              Last edited 4 minutes ago by you.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <GlassDialog>
                <GlassDialogTrigger asChild>
                  <GlassButton variant="glass-strong">
                    <Share2 className="size-4" />
                    Share
                  </GlassButton>
                </GlassDialogTrigger>
                <GlassDialogContent>
                  <GlassDialogHeader>
                    <GlassDialogTitle>Share this lens</GlassDialogTitle>
                    <GlassDialogDescription>
                      Anyone with the link can preview the material in real
                      time.
                    </GlassDialogDescription>
                  </GlassDialogHeader>
                  <GlassInput
                    defaultValue="https://liquid.glass/s/8fa2"
                    readOnly
                  />
                  <GlassDialogFooter>
                    <GlassButton variant="glass">Copy link</GlassButton>
                    <GlassButton variant="glass-strong">Send invite</GlassButton>
                  </GlassDialogFooter>
                </GlassDialogContent>
              </GlassDialog>

              <GlassAlertDialog>
                <GlassAlertDialogTrigger asChild>
                  <GlassButton variant="glass">
                    <Trash className="size-4" />
                    Delete
                  </GlassButton>
                </GlassAlertDialogTrigger>
                <GlassAlertDialogContent>
                  <GlassAlertDialogHeader>
                    <GlassAlertDialogTitle>
                      Delete this preset?
                    </GlassAlertDialogTitle>
                    <GlassAlertDialogDescription>
                      This permanently removes the preset and its lenses.
                    </GlassAlertDialogDescription>
                  </GlassAlertDialogHeader>
                  <GlassAlertDialogFooter>
                    <GlassAlertDialogCancel>Cancel</GlassAlertDialogCancel>
                    <GlassAlertDialogAction variant="destructive">
                      Delete
                    </GlassAlertDialogAction>
                  </GlassAlertDialogFooter>
                </GlassAlertDialogContent>
              </GlassAlertDialog>
            </div>
          </GlassSurface>

          <div className="grid content-start gap-2">
            <GlassSheet>
              <GlassSheetTrigger asChild>
                <GlassButton variant="glass" className="justify-start">
                  <Settings className="size-4" />
                  Open the settings sheet
                </GlassButton>
              </GlassSheetTrigger>
              <GlassSheetContent>
                <GlassSheetHeader>
                  <GlassSheetTitle>Lens settings</GlassSheetTitle>
                  <GlassSheetDescription>
                    Fine-tune the material for this surface.
                  </GlassSheetDescription>
                </GlassSheetHeader>
                <div className="space-y-4 px-4">
                  <div className="space-y-2">
                    <GlassInput defaultValue="Clear" aria-label="Preset" />
                    <GlassInput defaultValue="Primary nav" aria-label="Label" />
                  </div>
                </div>
              </GlassSheetContent>
            </GlassSheet>

            <GlassDrawer>
              <GlassDrawerTrigger asChild>
                <GlassButton variant="glass" className="justify-start">
                  <Plus className="size-4" />
                  Open the quick drawer
                </GlassButton>
              </GlassDrawerTrigger>
              <GlassDrawerContent>
                <GlassDrawerHeader>
                  <GlassDrawerTitle>Quick actions</GlassDrawerTitle>
                  <GlassDrawerDescription>
                    Swipe down or tap outside to dismiss.
                  </GlassDrawerDescription>
                </GlassDrawerHeader>
                <div className="flex flex-col gap-2 px-4">
                  <GlassButton variant="glass" className="justify-start">
                    <Plus className="size-4" />
                    New lens
                  </GlassButton>
                  <GlassButton variant="glass" className="justify-start">
                    <User className="size-4" />
                    Invite teammate
                  </GlassButton>
                </div>
              </GlassDrawerContent>
            </GlassDrawer>
          </div>
        </div>
      </Scene>
    </SceneGrid>
  );
}