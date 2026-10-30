"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { GlassScene, GlassSettingsProvider } from "@/components/glass-scene";
import { GlassButton } from "@/components/glass/glass-button";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
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
import { GlassInput } from "@/components/glass/glass-input";
import { useGlassTheme } from "@/components/glass/glass-theme-provider";
import { SceneBackdrop } from "@/components/site/scene-backdrop";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { DEMO_PHOTOS } from "@/lib/demo-assets";

/** The menu lens bends the original profile DOM; its action labels stay sharp. */
export function ProfilePopoverExample() {
  const { resolvedMode } = useGlassTheme();
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [name, setName] = useState("Alex Morgan");
  const [draft, setDraft] = useState(name);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState("");
  const [menu, setMenu] = useState<HTMLDivElement | null>(null);
  const [lens, setLens] = useState({
    width: 232, height: 116, x: 0, y: 0.46,
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
      const x = Math.max(0, Math.min(1, (b.left - a.left) / Math.max(1, a.width - width))),
        y = Math.max(0, Math.min(1, (b.top - a.top) / Math.max(1, a.height - height)));
      setLens((old) =>
        old.owner === menu && old.width === width && old.height === height &&
        Math.abs(old.x - x) < 0.0001 && Math.abs(old.y - y) < 0.0001
          ? old : { width, height, x, y, owner: menu },
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
            <GlassLens
              lens={{ lensW: lens.width, lensH: lens.height, borderRadius: 18 }}
              x={lens.x}
              y={lens.y}
              active={Boolean(menu && lens.owner === menu)}
              opticalProfile="media"
              parameters={{
                depth: 8,
                blur: 0.5,
                chroma: 0,
                rimStrength: 0.42,
                magnification: 1.18,
              }}
              className="size-full"
            >
              <div ref={profile} className="home-profile-backdrop">
                <div className="home-profile-photo">
                  <SceneBackdrop photo="ocean" />
                </div>
                <div className="home-profile-identity">
                  <h2>{name}</h2>
                  <p>alex@example.com</p>
                </div>
              </div>
            </GlassLens>
          }
        >
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <GlassButton
                ref={trigger}
                shape="circle"
                composite={false}
                aria-label="Profile actions"
                className="absolute top-5 left-5 size-10"
              >
                <GlassIcon name="more" className="size-5" />
              </GlassButton>
            </DropdownMenuTrigger>
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
                  <span className="flex flex-col gap-0.5">
                    Copy link
                    <span className="text-xs opacity-60">Preview URL</span>
                  </span>
                </DropdownMenuItem>
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
