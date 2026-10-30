"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { GlassScene, GlassSettingsProvider } from "@/components/glass-scene";
import { GlassButton } from "@/components/glass/glass-button";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  GlassDropdownMenuContent,
} from "@/components/glass/glass-dropdown";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogTitle,
  GlassDialogContent,
} from "@/components/glass/glass-dialog";
import { GlassIcon } from "@/components/glass/glass-icons";
import { GlassLens } from "@/components/glass/glass-target-lens";
import { GlassLensButton } from "@/components/glass/glass-lens-button";
import { GlassInput } from "@/components/glass/glass-input";
import { useGlassTheme } from "@/components/glass/glass-theme-provider";
import { SceneBackdrop } from "@/components/site/scene-backdrop";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { DEMO_PHOTOS } from "@/lib/demo-assets";
import { CONTROL_LENS_PRESETS } from "@/lib/glass-lens-optics";

/** One aligned profile target moves and appears with the native menu. */
export function ProfilePopoverExample() {
  const { resolvedMode } = useGlassTheme();
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [name, setName] = useState("Alex Morgan");
  const [draft, setDraft] = useState(name);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState("");
  const [showEmail, setShowEmail] = useState(true);
  const [notifications, setNotifications] = useState(false);
  const [menu, setMenu] = useState<HTMLDivElement | null>(null);
  const [lens, setLens] = useState({
    width: 232, height: 116, left: 0, top: 0, sourceWidth: 380, sourceHeight: 264,
    owner: null as HTMLDivElement | null,
  });
  const profile = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const inputId = useId();
  const dark = resolvedMode === "dark";

  useLayoutEffect(() => {
    const source = profile.current;
    const wrapper = menu?.parentElement;
    if (!source || !menu || !wrapper) return;
    let frame = 0;
    const measure = () => {
      const a = source.getBoundingClientRect(),
        b = wrapper.getBoundingClientRect();
      const width = menu.offsetWidth,
        height = menu.offsetHeight;
      if (!width || !height || b.bottom < a.top || b.top > a.bottom) return;
      const left = b.left - a.left,
        top = b.top - a.top;
      setLens((old) =>
        old.owner === menu && old.width === width && old.height === height &&
        Math.abs(old.left - left) < 0.1 && Math.abs(old.top - top) < 0.1 &&
        old.sourceWidth === a.width && old.sourceHeight === a.height
          ? old : { width, height, left, top,
            sourceWidth: a.width, sourceHeight: a.height, owner: menu },
      );
    };
    const schedule = () => {
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          measure();
        });
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(source);
    resize.observe(menu);
    // Radix positions its wrapper; ignore the menu's entrance scale so the
    // optical geometry stays stable instead of rebuilding a map each frame.
    const position = new MutationObserver(schedule);
    position.observe(wrapper, { attributes: true, attributeFilter: ["style"] });
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      position.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
    };
  }, [menu]);

  const copyLink = async () => {
    try {
      const link = new URL(window.location.href);
      link.hash = "profile-preview";
      await navigator.clipboard.writeText(link.href);
      setStatus("Preview link copied.");
    } catch {
      setStatus("Copy the page address to share this preview.");
    }
  };

  return (
    <div ref={setContainer} id="profile-preview" className="home-profile-wrap">
      <GlassSettingsProvider
        optics={{ colorBleed: 0.65 }}
        config={{ tint: dark ? 0.12 : 0.08, blur: 8 }}
      >
        <GlassScene
          className="home-profile-scene"
          appearance={resolvedMode}
          content={
            <div ref={profile} className="size-full">
              <ProfileBackdrop name={name} showEmail={showEmail} />
            </div>
          }
        >
          <DropdownMenu modal={false}>
            <div className="absolute top-5 left-5">
              <DropdownMenuTrigger asChild>
                <GlassLensButton
                  ref={trigger}
                  size="icon-lg"
                  sourceRef={profile}
                  refractionTarget={<ProfileBackdrop name={name} showEmail={showEmail} />}
                  aria-label="Profile actions"
                >
                  <GlassIcon name="more" />
                </GlassLensButton>
              </DropdownMenuTrigger>
            </div>
            <GlassDropdownMenuContent
              ref={setMenu}
              container={container}
              material="external"
              collisionBoundary={container ?? undefined}
              collisionPadding={12}
              sideOffset={8}
              align="start"
              className="home-profile-menu w-[232px] max-w-[calc(100vw-96px)]"
              onCloseAutoFocus={(event) => {
                if (editing) event.preventDefault();
              }}
            >
              <GlassLens
                lens={{ lensW: lens.width, lensH: lens.height, borderRadius: 22 }}
                active={Boolean(menu && lens.owner === menu)}
                parameters={CONTROL_LENS_PRESETS.popover}
                style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
                refractionTarget={
                  <div style={{
                    position: "absolute",
                    left: -lens.left,
                    top: -lens.top,
                    width: lens.sourceWidth,
                    height: lens.sourceHeight,
                  }}>
                    <div className="home-profile-optical-plane" />
                    <ProfileBackdrop name={name} showEmail={showEmail} />
                  </div>
                }
              />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="home-profile-menu-item"
                  onSelect={() => {
                    setDraft(name);
                    setEditing(true);
                  }}
                >
                  <GlassIcon name="edit" />
                  Edit profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="home-profile-menu-item"
                  onSelect={() => void copyLink()}
                >
                  <GlassIcon name="share" />
                  Copy link
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="home-profile-menu-separator" />
              <DropdownMenuGroup aria-label="Profile preferences">
                <DropdownMenuCheckboxItem
                  className="home-profile-menu-item home-profile-menu-choice"
                  checked={showEmail}
                  onCheckedChange={(checked) => setShowEmail(checked === true)}
                  onSelect={(event) => event.preventDefault()}
                >
                  Show email
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  className="home-profile-menu-item home-profile-menu-choice"
                  checked={notifications}
                  onCheckedChange={(checked) => {
                    setNotifications(checked === true);
                    setStatus(checked ? "Preview notifications enabled." : "Preview notifications paused.");
                  }}
                  onSelect={(event) => event.preventDefault()}
                >
                  Notifications
                </DropdownMenuCheckboxItem>
              </DropdownMenuGroup>
            </GlassDropdownMenuContent>
          </DropdownMenu>

          <span role="status" className="home-profile-status">
            {status}
          </span>

          <Dialog open={editing} onOpenChange={setEditing}>
            <GlassDialogContent
              container={container}
              showCloseButton={false}
              onCloseAutoFocus={(event) => {
                event.preventDefault();
                trigger.current?.focus();
              }}
            >
              <form
                className="flex flex-col gap-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  const next = draft.trim();
                  if (!next) return;
                  setName(next);
                  setStatus("Profile updated.");
                  setEditing(false);
                }}
              >
                <div className="flex flex-col gap-1.5">
                  <DialogTitle>Edit profile</DialogTitle>
                  <DialogDescription>
                    Update the name in this preview.
                  </DialogDescription>
                </div>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor={inputId}>Display name</FieldLabel>
                    <GlassInput
                      id={inputId}
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      maxLength={40}
                      required
                      autoComplete="off"
                    />
                  </Field>
                </FieldGroup>
                <div className="flex justify-end gap-2">
                  <DialogClose asChild>
                    <GlassButton variant="secondary">Cancel</GlassButton>
                  </DialogClose>
                  <GlassButton
                    type="submit"
                    variant="primary"
                    disabled={!draft.trim()}
                  >
                    Save
                  </GlassButton>
                </div>
              </form>
            </GlassDialogContent>
          </Dialog>
        </GlassScene>
      </GlassSettingsProvider>
      <a
        href={DEMO_PHOTOS.ocean.href}
        target="_blank"
        rel="noreferrer"
        className="self-end text-[10px] text-muted-foreground hover:text-foreground"
      >
        Photo: {DEMO_PHOTOS.ocean.credit} ↗
      </a>
    </div>
  );
}

/** One visual source for the profile and its small, inert menu target. */
function ProfileBackdrop({ name, showEmail }: { name: string; showEmail: boolean }) {
  return (
    <div className="home-profile-backdrop">
      <div className="home-profile-photo"><SceneBackdrop photo="ocean" /></div>
      <div className="home-profile-identity">
        <h2>{name}</h2>
        <p style={{ visibility: showEmail ? "visible" : "hidden" }}>alex@example.com</p>
      </div>
    </div>
  );
}
