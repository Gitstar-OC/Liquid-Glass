"use client";

import { useId, useState, type ReactNode } from "react";
import {
  Heart,
  Plus,
  Volume2,
  Bold,
  Italic,
  Check,
  ArrowRight,
  Bell,
  Folder,
  FileText,
  Info,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { NavigationExample } from "@/components/gallery/navigation-example";
import { LensButtonExample } from "@/components/lens-button-example";
import { ButtonExamples } from "@/components/gallery/button-examples";
import * as G from "@/components/glass";
import { ComponentExample } from "@/components/landing/component-workbench";
import {
  TRACKS,
  SPOTLIGHT_COMMANDS,
} from "@/components/landing/featured-components";

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <G.GlassSurface className="flex w-full max-w-sm flex-col gap-5 p-6">
      <h3 className="text-lg font-medium tracking-tight">{title}</h3>
      {children}
    </G.GlassSurface>
  );
}
export function GalleryExample({
  name,
  container,
}: {
  name: string;
  container: HTMLElement | null;
}) {
  const id = useId();
  const [liked, setLiked] = useState(false);
  const [value, setValue] = useState([62]);
  const [notice, setNotice] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [selected, setSelected] = useState("design");
  const [message, setMessage] = useState("A little space for your next idea.");
  const notify = (label: string) => {
    toast.success(label, { description: "Updated in this preview." });
  };

  switch (name) {
    case "glass-dock":
      return (
        <G.GlassDock aria-label="Example dock">
          {(["components", "sliders", "book"] as const).map((icon) => (
            <G.GlassDockItem
              key={icon}
              label={
                icon === "sliders"
                  ? "Playground"
                  : icon === "book"
                    ? "Documentation"
                    : "Components"
              }
              asChild
            >
              <a
                href={
                  icon === "sliders"
                    ? "/playground"
                    : icon === "book"
                      ? "/docs"
                      : "/components"
                }
              >
                <G.GlassIcon name={icon} className="size-6" />
              </a>
            </G.GlassDockItem>
          ))}
        </G.GlassDock>
      );
    case "glass-sound":
      return <G.GlassSound />;
    case "glass-connectivity":
      return <G.GlassConnectivity />;
    case "glass-range-control":
      return (
        <G.GlassRangeControl
          label="Studio speakers"
          className="max-w-[304px]"
        />
      );
    case "glass-state-button":
    case "glass-button":
      return <ButtonExamples />;
    case "glass-lens-button":
      return <LensButtonExample />;
    case "glass-switch":
      return (
        <Panel title="A little less noise.">
          <div className="flex flex-col gap-6">
            {[
              {
                label: "Notifications",
                description: "The things worth knowing.",
                checked: notifications,
                set: setNotifications,
              },
              {
                label: "Focus mode",
                description: "Make room for your next idea.",
                checked: liked,
                set: setLiked,
              },
            ].map((item) => (
              <div
                className="flex items-center justify-between gap-4"
                key={item.label}
              >
                <div>
                  <label
                    className="text-sm font-medium"
                    htmlFor={`${id}-${item.label}`}
                  >
                    {item.label}
                  </label>
                  <p className="mt-1 text-xs">{item.description}</p>
                </div>
                <G.GlassSwitch
                  id={`${id}-${item.label}`}
                  checked={item.checked}
                  onCheckedChange={item.set}
                />
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-border pt-5">
              <span className="text-xs">Unavailable setting</span>
              <G.GlassSwitch disabled aria-label="Unavailable setting" />
            </div>
          </div>
        </Panel>
      );
    case "glass-slider":
      return (
        <div className="flex w-full max-w-[304px] flex-col gap-5">
          <G.GlassSound />
          <G.GlassRangeControl label="Display" kindOfControl="brightness" />
        </div>
      );
    case "glass-progress":
      return (
        <Panel title="Find your balance.">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2">
              <Volume2 className="size-4" /> Volume
            </span>
            <output className="tabular-nums">{value[0]}%</output>
          </div>
          <G.GlassSlider
            aria-label="Volume"
            value={value}
            onValueChange={setValue}
            appearance="well"
          />
          <div className="flex items-center justify-between pt-3 text-xs">
            <span>Fine adjustment</span>
            <span>{value[0]}%</span>
          </div>
          <G.GlassSlider
            aria-label="Fine adjustment"
            value={value}
            onValueChange={setValue}
          />
          <G.GlassProgress value={value[0]} aria-label="Volume progress" />
        </Panel>
      );
    case "glass-toggle":
      return (
        <Panel title="Make your mark.">
          <div className="flex items-center gap-4">
            <G.GlassToggle
              aria-label="Favorite"
              pressed={liked}
              onPressedChange={setLiked}
              className="size-12 rounded-full"
            >
              <Heart className={liked ? "fill-current" : ""} />
            </G.GlassToggle>
            <div>
              <p className="text-sm">
                {liked ? "In your favorites" : "Save a favorite"}
              </p>
              <p className="mt-1 text-xs">A choice that stays with you.</p>
            </div>
          </div>
          <G.GlassToggleGroup type="multiple" aria-label="Formatting">
            <G.GlassToggleGroupItem value="bold" aria-label="Bold">
              <Bold />
            </G.GlassToggleGroupItem>
            <G.GlassToggleGroupItem value="italic" aria-label="Italic">
              <Italic />
            </G.GlassToggleGroupItem>
          </G.GlassToggleGroup>
        </Panel>
      );
    case "glass-checkbox":
      return (
        <Panel title="Choose what matters.">
          <label className="flex items-center gap-3 text-sm">
            <G.GlassCheckbox defaultChecked /> Product updates
          </label>
          <label className="flex items-center gap-3 text-sm">
            <G.GlassCheckbox /> Occasional inspiration
          </label>
          <G.GlassRadioGroup
            defaultValue="weekly"
            aria-label="Update frequency"
            className="border-t border-border pt-5"
          >
            <label className="flex items-center gap-3 text-sm">
              <G.GlassRadioGroupItem value="weekly" /> Weekly
            </label>
            <label className="flex items-center gap-3 text-sm">
              <G.GlassRadioGroupItem value="monthly" /> Monthly
            </label>
          </G.GlassRadioGroup>
        </Panel>
      );
    case "glass-input":
      return (
        <Panel title="Put it into words.">
          <div className="flex flex-col gap-2">
            <label htmlFor={`${id}-title`} className="text-xs">
              Title
            </label>
            <G.GlassInput id={`${id}-title`} placeholder="Your next idea" />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor={`${id}-note`} className="text-xs">
              A note to yourself
            </label>
            <G.GlassTextarea
              id={`${id}-note`}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="min-h-24 resize-none"
            />
          </div>
        </Panel>
      );
    case "glass-select":
      return (
        <Panel title="Your workspace.">
          <label className="text-xs" htmlFor={`${id}-space`}>
            Working in
          </label>
          <G.GlassSelect value={selected} onValueChange={setSelected}>
            <G.GlassSelectTrigger id={`${id}-space`} className="w-full">
              <G.GlassSelectValue />
            </G.GlassSelectTrigger>
            <G.GlassSelectContent>
              <G.GlassSelectItem value="design">
                Design studio
              </G.GlassSelectItem>
              <G.GlassSelectItem value="engineering">
                Engineering
              </G.GlassSelectItem>
              <G.GlassSelectItem value="personal">
                Personal space
              </G.GlassSelectItem>
            </G.GlassSelectContent>
          </G.GlassSelect>
          <p className="text-xs">Selected: {selected}</p>
        </Panel>
      );
    case "glass-tabs":
      return (
        <Panel title="Everything in its place.">
          <G.GlassTabs defaultValue="overview">
            <G.GlassTabsList>
              <G.GlassTabsTrigger value="overview">Overview</G.GlassTabsTrigger>
              <G.GlassTabsTrigger value="activity">Activity</G.GlassTabsTrigger>
            </G.GlassTabsList>
            <G.GlassTabsContent
              value="overview"
              className="pt-5 text-sm leading-6"
            >
              A clear view of your workspace. Make something good today.
            </G.GlassTabsContent>
            <G.GlassTabsContent
              value="activity"
              className="pt-5 text-sm leading-6"
            >
              All caught up. Your recent changes are saved.
            </G.GlassTabsContent>
          </G.GlassTabs>
        </Panel>
      );
    case "glass-dropdown":
      return (
        <G.GlassDropdownMenu>
          <G.GlassDropdownMenuTrigger asChild>
            <G.GlassButton shape="pill">
              Project actions <Plus />
            </G.GlassButton>
          </G.GlassDropdownMenuTrigger>
          <G.GlassDropdownMenuContent className="w-52">
            <G.GlassDropdownMenuLabel>Project</G.GlassDropdownMenuLabel>
            <G.GlassDropdownMenuItem
              onSelect={() => notify("New document created")}
            >
              <FileText /> New document
            </G.GlassDropdownMenuItem>
            <G.GlassDropdownMenuItem
              onSelect={() => notify("New folder created")}
            >
              <Folder /> New folder
            </G.GlassDropdownMenuItem>
            <G.GlassDropdownMenuSeparator />
            <G.GlassDropdownMenuCheckboxItem
              checked={notifications}
              onCheckedChange={setNotifications}
            >
              Notifications
            </G.GlassDropdownMenuCheckboxItem>
          </G.GlassDropdownMenuContent>
        </G.GlassDropdownMenu>
      );
    case "glass-popover":
      return (
        <G.GlassPopover>
          <G.GlassPopoverTrigger asChild>
            <G.GlassButton shape="pill">
              <SlidersHorizontal /> Quick settings
            </G.GlassButton>
          </G.GlassPopoverTrigger>
          <G.GlassPopoverContent className="w-64">
            <G.GlassPopoverTitle className="font-medium">
              A clearer view.
            </G.GlassPopoverTitle>
            <p className="text-xs">Keep the details close at hand.</p>
            <label className="mt-3 flex items-center justify-between gap-4 text-xs">
              Notifications{" "}
              <G.GlassSwitch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </label>
          </G.GlassPopoverContent>
        </G.GlassPopover>
      );
    case "glass-context-menu":
      return (
        <G.GlassContextMenu>
          <G.GlassContextMenuTrigger asChild>
            <G.GlassSurface className="grid h-40 w-full max-w-sm place-items-center border border-dashed border-foreground/25 text-sm">
              Right-click here
            </G.GlassSurface>
          </G.GlassContextMenuTrigger>
          <G.GlassContextMenuContent className="w-48">
            <G.GlassContextMenuItem onSelect={() => notify("Link copied")}>
              Copy link
            </G.GlassContextMenuItem>
            <G.GlassContextMenuItem onSelect={() => notify("Item duplicated")}>
              Duplicate
            </G.GlassContextMenuItem>
            <G.GlassContextMenuSeparator />
            <G.GlassContextMenuCheckboxItem
              checked={liked}
              onCheckedChange={setLiked}
            >
              Favorite
            </G.GlassContextMenuCheckboxItem>
          </G.GlassContextMenuContent>
        </G.GlassContextMenu>
      );
    case "glass-hover-card":
      return (
        <G.GlassHoverCard>
          <G.GlassHoverCardTrigger asChild>
            <G.GlassButton shape="pill">Meet the studio</G.GlassButton>
          </G.GlassHoverCardTrigger>
          <G.GlassHoverCardContent className="w-64">
            <h3 className="text-sm font-medium">A small team. Good ideas.</h3>
            <p className="mt-2 text-xs leading-5">
              Thoughtful interfaces, built one detail at a time.
            </p>
          </G.GlassHoverCardContent>
        </G.GlassHoverCard>
      );
    case "glass-menubar":
      return (
        <G.GlassMenubar>
          {["File", "Edit", "View"].map((label) => (
            <G.GlassMenubarMenu key={label}>
              <G.GlassMenubarTrigger>{label}</G.GlassMenubarTrigger>
              <G.GlassMenubarContent>
                <G.GlassMenubarItem
                  onSelect={() => notify(`${label} action selected`)}
                >
                  New window
                </G.GlassMenubarItem>
                <G.GlassMenubarItem onSelect={() => notify("Workspace saved")}>
                  Save workspace
                </G.GlassMenubarItem>
              </G.GlassMenubarContent>
            </G.GlassMenubarMenu>
          ))}
        </G.GlassMenubar>
      );
    case "glass-navigation-menu":
      return (
        <G.GlassNavigationMenu viewport={false}>
          <G.GlassNavigationMenuList>
            <G.GlassNavigationMenuItem>
              <G.GlassNavigationMenuTrigger>
                Explore
              </G.GlassNavigationMenuTrigger>
              <G.GlassNavigationMenuContent className="w-56">
                <G.GlassNavigationMenuLink href="/playground">
                  Playground
                </G.GlassNavigationMenuLink>
                <G.GlassNavigationMenuLink href="/docs">
                  Documentation
                </G.GlassNavigationMenuLink>
              </G.GlassNavigationMenuContent>
            </G.GlassNavigationMenuItem>
            <G.GlassNavigationMenuItem>
              <G.GlassNavigationMenuLink href="/">
                Home
              </G.GlassNavigationMenuLink>
            </G.GlassNavigationMenuItem>
          </G.GlassNavigationMenuList>
        </G.GlassNavigationMenu>
      );
    case "glass-command":
      return (
        <G.GlassSurface className="w-full max-w-sm p-2">
          <G.GlassCommand>
            <G.GlassCommandInput placeholder="Find an action…" />
            <G.GlassCommandList>
              <G.GlassCommandEmpty>No actions found.</G.GlassCommandEmpty>
              <G.GlassCommandGroup heading="Workspace">
                {["Create a note", "Find a document", "Open preferences"].map(
                  (label) => (
                    <G.GlassCommandItem
                      key={label}
                      onSelect={() => notify(label)}
                    >
                      {label}
                    </G.GlassCommandItem>
                  ),
                )}
              </G.GlassCommandGroup>
            </G.GlassCommandList>
          </G.GlassCommand>
        </G.GlassSurface>
      );
    case "glass-sheet":
      return (
        <G.GlassSheet>
          <G.GlassSheetTrigger asChild>
            <G.GlassButton shape="pill">
              Open preferences <ArrowRight />
            </G.GlassButton>
          </G.GlassSheetTrigger>
          <G.GlassSheetContent container={container}>
            <G.GlassSheetTitle className="text-xl">
              Make room.
            </G.GlassSheetTitle>
            <G.GlassSheetDescription className="text-xs leading-5">
              A few details, right beside your workspace.
            </G.GlassSheetDescription>
            <label className="my-5 flex items-center justify-between gap-4 text-sm">
              Notifications
              <G.GlassSwitch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </label>
            <G.GlassSheetClose asChild>
              <G.GlassButton>Done</G.GlassButton>
            </G.GlassSheetClose>
          </G.GlassSheetContent>
        </G.GlassSheet>
      );
    case "glass-alert-dialog":
      return (
        <G.GlassAlertDialog>
          <G.GlassAlertDialogTrigger asChild>
            <G.GlassButton shape="pill">Reset this workspace</G.GlassButton>
          </G.GlassAlertDialogTrigger>
          <G.GlassAlertDialogContent container={container}>
            <G.GlassAlertDialogTitle>Start fresh?</G.GlassAlertDialogTitle>
            <G.GlassAlertDialogDescription>
              This preview will reset its local preferences.
            </G.GlassAlertDialogDescription>
            <G.GlassAlertDialogFooter>
              <G.GlassAlertDialogCancel>Keep working</G.GlassAlertDialogCancel>
              <G.GlassAlertDialogAction
                onClick={() => {
                  setNotifications(true);
                  notify("Workspace reset");
                }}
              >
                Reset preview
              </G.GlassAlertDialogAction>
            </G.GlassAlertDialogFooter>
          </G.GlassAlertDialogContent>
        </G.GlassAlertDialog>
      );
    case "glass-tooltip":
      return (
        <G.GlassTooltipProvider>
          <G.GlassTooltip>
            <G.GlassTooltipTrigger asChild>
              <G.GlassButton shape="circle" aria-label="About this interface">
                <Info />
              </G.GlassButton>
            </G.GlassTooltipTrigger>
            <G.GlassTooltipContent>
              Small details. A clearer interface.
            </G.GlassTooltipContent>
          </G.GlassTooltip>
        </G.GlassTooltipProvider>
      );
    case "glass-toaster":
      return notice ? (
        <G.GlassToast
          message="Everything is up to date."
          description="Your changes are saved in this preview."
          onDismiss={() => setNotice(false)}
          action={{ label: "Undo", onClick: () => notify("Changes undone") }}
        />
      ) : (
        <G.GlassButton shape="pill" onClick={() => setNotice(true)}>
          <Bell /> Show notification
        </G.GlassButton>
      );
    case "glass-alert":
      return (
        <G.GlassSurface asChild className="w-full max-w-sm">
          <G.GlassAlert>
            <Check />
            <G.GlassAlertTitle>Ready when you are.</G.GlassAlertTitle>
            <G.GlassAlertDescription>
              Your workspace is up to date. All changes have been saved.
            </G.GlassAlertDescription>
          </G.GlassAlert>
        </G.GlassSurface>
      );
    case "glass-badge":
      return (
        <Panel title="The small signals.">
          <div className="flex flex-wrap gap-3">
            <G.GlassBadge>
              <span className="size-1.5 rounded-full bg-emerald-500" /> Live
            </G.GlassBadge>
            <G.GlassBadge variant="secondary">In progress</G.GlassBadge>
            <G.GlassBadge variant="outline">Draft</G.GlassBadge>
          </div>
        </Panel>
      );
    case "glass-avatar":
      return (
        <Panel title="A familiar face.">
          <div className="flex items-center gap-4">
            <G.GlassAvatar className="size-14">
              <G.GlassAvatarFallback>AM</G.GlassAvatarFallback>
            </G.GlassAvatar>
            <div>
              <p className="text-sm font-medium">Alex Morgan</p>
              <p className="mt-1 text-xs">Design studio</p>
            </div>
          </div>
        </Panel>
      );
    case "glass-accordion":
      return (
        <Panel title="A few good questions.">
          <G.GlassAccordion
            type="single"
            collapsible
            className="border-0 bg-transparent! px-0 shadow-none!"
          >
            {[
              {
                q: "Does the content stay interactive?",
                a: "Yes. The optical layers sit behind real controls and selectable text.",
              },
              {
                q: "Can I change the glass?",
                a: "Every control in the inspector updates the shared engine. Copy the setup to use it in your app.",
              },
            ].map((item, i) => (
              <G.GlassAccordionItem value={String(i)} key={item.q}>
                <G.GlassAccordionTrigger className="text-sm">
                  {item.q}
                </G.GlassAccordionTrigger>
                <G.GlassAccordionContent className="text-xs leading-5">
                  {item.a}
                </G.GlassAccordionContent>
              </G.GlassAccordionItem>
            ))}
          </G.GlassAccordion>
        </Panel>
      );
    case "glass-card":
    case "glass-preferences":
      return (
        <G.GlassPreferences
          onSave={({ name }) => notify(`${name} preferences saved`)}
        />
      );
    case "glass-music-player":
      return <G.GlassMusicPlayer tracks={TRACKS} />;
    case "glass-control-center":
      return <G.GlassControlCenter />;
    case "glass-spotlight":
      return <G.GlassSpotlightPanel commands={SPOTLIGHT_COMMANDS} />;
    case "glass-power":
      return (
        <G.GlassPowerMenu
          container={container}
          onAction={(action) => notify(`${action} preview requested`)}
        />
      );
    case "glass-navbar":
      return <NavigationExample container={container} />;
    case "glass-sidebar":
      return <ComponentExample category="navigation" container={container} />;
    case "glass-drawer":
      return <NavigationExample container={container} />;
    case "glass-dialog":
      return <ComponentExample category="overlays" container={container} />;
    case "glass-button-group":
      return (
        <div className="flex w-full max-w-sm flex-col items-center gap-5">
          <G.GlassButtonGroup aria-label="Formatting actions">
            <G.GlassToggle
              aria-label="Bold"
              pressed={liked}
              onPressedChange={setLiked}
            >
              <Bold />
            </G.GlassToggle>
            <G.GlassToggle
              aria-label="Italic"
              pressed={notifications}
              onPressedChange={setNotifications}
            >
              <Italic />
            </G.GlassToggle>
            <G.GlassButton
              variant="ghost"
              aria-label="Reset formatting"
              onClick={() => {
                setLiked(false);
                setNotifications(false);
              }}
            >
              <G.GlassIcon name="undo" />
            </G.GlassButton>
          </G.GlassButtonGroup>
          <p
            className="text-center text-lg"
            style={{
              fontWeight: liked ? 650 : 400,
              fontStyle: notifications ? "italic" : "normal",
            }}
          >
            Make yourself at home.
          </p>
          <G.GlassButtonGroup aria-label="Document actions">
            <G.GlassButton
              variant="ghost"
              onClick={() => notify("Draft saved")}
            >
              <Check data-icon="inline-start" />
              Save draft
            </G.GlassButton>
            <G.GlassButton
              variant="ghost"
              onClick={() => notify("Link ready to share")}
            >
              <G.GlassIcon name="diagonal" data-icon="inline-start" />
              Share
            </G.GlassButton>
          </G.GlassButtonGroup>
        </div>
      );
    case "glass-form":
    case "glass-combobox":
      return <ComponentExample category="forms" container={container} />;
    default:
      return null;
  }
}
