"use client";
import { ButtonExamples } from "@/components/gallery/button-examples";
import { PreviewToolbar } from "@/components/site/preview-toolbar";
import { SceneBackdrop } from "@/components/site/scene-backdrop";
import {
  GlassToggleGroup,
  GlassToggleGroupItem,
} from "@/components/glass/glass-toggle";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  Bell,
  Info,
  Folder,
  FileText,
  PanelLeft,
  Plus,
  X,
} from "lucide-react";
import {
  GlassScene,
  useGlassScene,
  useGlassSettings,
} from "@/components/glass-scene";
import { GlassSurface } from "@/components/glass/glass-surface";
import { GlassButton } from "@/components/glass/glass-button";
import { GlassForm, GlassFormField } from "@/components/glass/glass-form";
import { GlassInput } from "@/components/glass/glass-input";
import { GlassCombobox } from "@/components/glass/glass-combobox";
import { GlassSwitch } from "@/components/glass/glass-switch";
import { GlassNavbar } from "@/components/glass/glass-navbar";
import {
  GlassSidebar,
  GlassSidebarItem,
} from "@/components/glass/glass-sidebar";
import {
  GlassTabs,
  GlassTabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/glass/glass-tabs";
import {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogTitle,
  DialogDescription,
  GlassDialogContent,
} from "@/components/glass/glass-dialog";
import {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerTitle,
  DrawerDescription,
  GlassDrawerContent,
} from "@/components/glass/glass-drawer";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  GlassTooltipContent,
} from "@/components/glass/glass-tooltip";
import {
  GlassAccordion,
  GlassAccordionItem,
  GlassAccordionTrigger,
  GlassAccordionContent,
} from "@/components/glass/glass-accordion";
import { glassToast } from "@/components/glass/glass-toaster";
import { toast } from "sonner";
import { GLASS_DEFAULT_PARAMS } from "@/lib/glass";
import { DEMO_PHOTOS } from "@/lib/demo-assets";

export type ComponentCategory =
  "buttons" | "forms" | "navigation" | "overlays" | "feedback";
const CATEGORIES: {
  id: ComponentCategory;
  label: string;
  caption: string;
  doc: string;
}[] = [
  {
    id: "buttons",
    label: "Buttons",
    caption: "Buttons, toggles & button groups",
    doc: "glass-button",
  },
  {
    id: "forms",
    label: "Forms",
    caption: "Inputs, comboboxes & switches",
    doc: "glass-form",
  },
  {
    id: "navigation",
    label: "Navigation",
    caption: "Navbars, sidebars & tabs",
    doc: "glass-navbar",
  },
  {
    id: "overlays",
    label: "Overlays",
    caption: "Dialogs & drawers",
    doc: "glass-dialog",
  },
  {
    id: "feedback",
    label: "Feedback",
    caption: "Tooltips, notifications & disclosure",
    doc: "glass-toaster",
  },
];
export function ComponentPreview({
  category,
  backdrop = "dunes",
  blur,
}: {
  category: ComponentCategory;
  backdrop?: keyof typeof DEMO_PHOTOS;
  blur?: number;
}) {
  const settings = useGlassSettings();
  const params = {
    ...GLASS_DEFAULT_PARAMS,
    ...settings.config,
    blur: blur ?? settings.config?.blur ?? GLASS_DEFAULT_PARAMS.blur,
  };
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <div
      ref={setContainer}
      className="relative h-[560px] sm:h-[480px] w-full overflow-hidden rounded-[20px]"
      data-testid={`component-${category}`}
    >
      <GlassScene
        appearance={backdrop === "dunes" ? "light" : "dark"}
        config={params}
        className="size-full"
        content={
          <div className="absolute inset-0 bg-[#d0dce0]">
            <SceneBackdrop photo={backdrop} />
          </div>
        }
      >
        <div className="absolute inset-0 flex items-center justify-center p-5 sm:p-8">
          <ComponentExample category={category} container={container} />
        </div>
      </GlassScene>
    </div>
  );
}
export function ComponentExample({
  category,
  container,
}: {
  category: ComponentCategory;
  container: HTMLElement | null;
}) {
  const scene = useGlassScene();
  const [saved, setSaved] = useState(false);
  const [role, setRole] = useState("designer");
  const [folder, setFolder] = useState("Recents");
  const [sidebar, setSidebar] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [dialog, setDialog] = useState(false);
  if (category === "buttons") return <ButtonExamples />;
  if (category === "forms")
    return (
      <GlassSurface kind="card" className="w-full max-w-xs p-6 text-foreground">
        <h3 className="mb-5 text-base font-medium tracking-tight">Profile</h3>
        <GlassForm
          onSubmit={(event) => {
            event.preventDefault();
            setSaved(true);
            toast.success("Profile updated", {
              description: "Profile updated.",
            });
          }}
        >
          <GlassFormField label="Your name">
            <GlassInput
              name="name"
              required
              autoComplete="name"
              placeholder="Alex Morgan"
              className="text-xs"
              onChange={() => setSaved(false)}
            />
          </GlassFormField>
          <GlassFormField label="What do you do?">
            <GlassCombobox
              value={role}
              onValueChange={(value) => {
                setRole(value);
                setSaved(false);
              }}
              name="role"
              aria-label="Your role"
              options={[
                { value: "designer", label: "Designer" },
                { value: "engineer", label: "Engineer" },
                { value: "founder", label: "Founder" },
                { value: "other", label: "A bit of everything" },
              ]}
            />
          </GlassFormField>
          <div className="flex items-center justify-between gap-4">
            <label
              htmlFor="profile-notifications"
              className="text-xs text-muted-foreground"
            >
              Keep me in the loop
            </label>
            <GlassSwitch
              id="profile-notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
          <GlassButton
            type="submit"
            variant="default"
            className="h-10 w-full text-xs"
          >
            {saved ? (
              <>
                <Check />
                Profile updated
              </>
            ) : (
              <>
                Save profile <ArrowRight />
              </>
            )}
          </GlassButton>
        </GlassForm>
      </GlassSurface>
    );
  if (category === "navigation")
    return (
      <div className="w-full max-w-md flex flex-col gap-3">
        <GlassNavbar shadow={false} className="min-h-12 px-4">
          <span className="text-xs font-medium">Workspace</span>
          <div className="flex gap-1">
            <button
              className="rounded-[10px] p-2 hover:bg-foreground/8"
              aria-label="Toggle sidebar"
              onClick={() => setSidebar((value) => !value)}
            >
              <PanelLeft className="size-4" />
            </button>
            <button
              className="rounded-[10px] p-2 hover:bg-foreground/8"
              aria-label="New note"
              onClick={() => toast("Note created")}
            >
              <Plus className="size-4" />
            </button>
          </div>
        </GlassNavbar>
        <div className="flex gap-3">
          {sidebar && (
            <GlassSidebar
              shadow={false}
              className="w-32 px-2 py-3"
              aria-label="Workspace folders"
            >
              {["Recents", "Documents", "Projects"].map((item) => (
                <GlassSidebarItem
                  key={item}
                  active={folder === item}
                  onClick={() => setFolder(item)}
                  className="px-2 text-[11px]"
                >
                  <Folder className="size-3.5" />
                  {item}
                </GlassSidebarItem>
              ))}
            </GlassSidebar>
          )}
          <GlassSurface
            kind="card"
            shadow={false}
            className="min-h-52 min-w-0 flex-1 p-4"
          >
            <GlassTabs defaultValue="notes">
              <GlassTabsList className="h-8">
                <TabsTrigger value="notes" className="text-[11px]">
                  Notes
                </TabsTrigger>
                <TabsTrigger value="activity" className="text-[11px]">
                  Activity
                </TabsTrigger>
              </GlassTabsList>
              <TabsContent value="notes" className="mt-5">
                <h3 className="text-sm font-medium">{folder}</h3>
                <div className="mt-3 flex flex-col gap-3">
                  {["A place to begin", "The details"].map((item) => (
                    <button
                      className="flex w-full items-center gap-2 text-left text-[11px] text-muted-foreground"
                      key={item}
                      onClick={() => toast(item)}
                    >
                      <FileText className="size-3.5" />
                      {item}
                    </button>
                  ))}
                </div>
              </TabsContent>
              <TabsContent
                value="activity"
                className="mt-5 text-xs leading-6 text-muted-foreground"
              >
                All caught up.
                <br />A little space for your next idea.
              </TabsContent>
            </GlassTabs>
          </GlassSurface>
        </div>
      </div>
    );
  if (category === "overlays")
    return (
      <GlassSurface kind="card" className="w-full max-w-sm p-6 text-foreground">
        <h3 className="text-base font-medium tracking-tight">
          Dialogs & drawers.
        </h3>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          A focused form or a panel of preferences.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Dialog open={dialog} onOpenChange={setDialog}>
            <DialogTrigger asChild>
              <GlassButton className="h-10 px-4 text-xs">
                Open dialog <ArrowUpRight />
              </GlassButton>
            </DialogTrigger>
            <GlassDialogContent
              container={container}
              className="max-w-xs"
              showCloseButton
            >
              <DialogTitle className="text-lg font-medium tracking-tight">
                A new beginning.
              </DialogTitle>
              <DialogDescription className="text-xs leading-5 text-muted-foreground">
                Give your next project a name.
              </DialogDescription>
              <GlassForm
                onSubmit={(event) => {
                  event.preventDefault();
                  setDialog(false);
                  toast.success("Your project is ready.");
                }}
              >
                <GlassFormField label="Project name">
                  <GlassInput
                    required
                    placeholder="Something good"
                    autoFocus
                    className="text-xs"
                  />
                </GlassFormField>
                <div className="flex justify-end gap-2">
                  <DialogClose asChild>
                    <GlassButton>Cancel</GlassButton>
                  </DialogClose>
                  <GlassButton type="submit" variant="default">
                    Create project
                  </GlassButton>
                </div>
              </GlassForm>
            </GlassDialogContent>
          </Dialog>
          <Drawer repositionInputs={false}>
            <DrawerTrigger asChild>
              <GlassButton className="h-10 px-4 text-xs">
                Open drawer <ArrowUpRight />
              </GlassButton>
            </DrawerTrigger>
            <GlassDrawerContent
              container={container}
              className="data-[vaul-drawer-direction=bottom]:max-h-[95%]"
            >
              <div className="mx-auto w-full max-w-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <DrawerTitle className="text-lg font-medium tracking-tight">
                      A little more space.
                    </DrawerTitle>
                    <DrawerDescription className="mt-2 text-xs leading-5 text-muted-foreground">
                      Your preferences, close at hand.
                    </DrawerDescription>
                  </div>
                  <DrawerClose asChild>
                    <button
                      aria-label="Close drawer"
                      className="rounded-[10px] p-2 hover:bg-foreground/8"
                    >
                      <X className="size-4" />
                    </button>
                  </DrawerClose>
                </div>
                <div className="my-6 flex items-center justify-between">
                  <label htmlFor="drawer-updates" className="text-sm">
                    Enable notifications
                  </label>
                  <GlassSwitch
                    id="drawer-updates"
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
                <DrawerClose asChild>
                  <GlassButton variant="default" className="w-full">
                    Done
                  </GlassButton>
                </DrawerClose>
              </div>
            </GlassDrawerContent>
          </Drawer>
        </div>
        <p className="mt-5 text-[11px] text-muted-foreground">
          Escape brings you right back.
        </p>
      </GlassSurface>
    );
  return (
    <TooltipProvider>
      <GlassSurface kind="card" className="w-full max-w-sm p-6 text-foreground">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium tracking-tight">
            Notifications.
          </h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="About notifications"
                className="rounded-[10px] p-2 text-muted-foreground hover:bg-foreground/8"
              >
                <Info className="size-4" />
              </button>
            </TooltipTrigger>
            <GlassTooltipContent>
              Good news. Right when you need it.
            </GlassTooltipContent>
          </Tooltip>
        </div>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          Choose which updates reach you.
        </p>
        <div className="my-6 flex items-center justify-between">
          <label className="text-xs" htmlFor="feedback-notifications">
            Notifications
          </label>
          <GlassSwitch
            id="feedback-notifications"
            checked={notifications}
            onCheckedChange={setNotifications}
          />
        </div>
        <GlassButton
          className="h-10 w-full text-xs"
          disabled={!notifications}
          onClick={() =>
            glassToast("All taken care of.", {
              description: "Your changes have been saved.",
              sceneRef: scene?.source,
              action: { label: "Undo", onClick: () => toast("Changes undone") },
            })
          }
        >
          <Bell className="size-3.5" />
          Send a notification
        </GlassButton>
        <GlassAccordion
          type="single"
          collapsible
          className="mt-5 border-0 bg-transparent! px-0 shadow-none! backdrop-filter-none"
        >
          <GlassAccordionItem value="keyboard">
            <GlassAccordionTrigger className="py-3 text-xs hover:no-underline">
              Made for your keyboard, too?
            </GlassAccordionTrigger>
            <GlassAccordionContent className="text-xs leading-5 text-muted-foreground">
              Tab to move, Enter to choose, and Escape to close. The familiar
              details are built in.
            </GlassAccordionContent>
          </GlassAccordionItem>
        </GlassAccordion>
      </GlassSurface>
    </TooltipProvider>
  );
}

export function ComponentWorkbench() {
  const [backdrop, setBackdrop] = useState<keyof typeof DEMO_PHOTOS>("dunes");
  const [blur, setBlur] = useState(GLASS_DEFAULT_PARAMS.blur);
  const [category, setCategory] = useState<ComponentCategory>("buttons");
  const current = CATEGORIES.find((item) => item.id === category)!;
  return (
    <section
      id="components"
      className="mx-auto mt-14 w-full max-w-5xl scroll-mt-8 sm:mt-16"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-xl font-medium">Components</h2>
        <Link
          href="/components"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          View all
        </Link>
      </div>
      <GlassToggleGroup
        type="single"
        value={category}
        onValueChange={(value) => {
          if (value) setCategory(value as ComponentCategory);
        }}
        aria-label="Component categories"
        className="mb-4 flex flex-wrap justify-start gap-2"
      >
        {CATEGORIES.map((item) => (
          <GlassToggleGroupItem key={item.id} value={item.id}>
            {item.label}
          </GlassToggleGroupItem>
        ))}
      </GlassToggleGroup>
      <div>
        <ComponentPreview
          key={category}
          category={category}
          backdrop={backdrop}
          blur={blur}
        />
      </div>
      <PreviewToolbar
        photo={backdrop}
        onPhotoChange={setBackdrop}
        blur={blur}
        onBlurChange={setBlur}
        label="Component"
        href={`/docs/${current.doc}`}
      />
    </section>
  );
}
