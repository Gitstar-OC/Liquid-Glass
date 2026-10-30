"use client";

import { useId, useRef, useState } from "react";
import { GlassScene } from "@/components/glass-scene";
import { GlassButton } from "@/components/glass/glass-button";
import { GlassIcon } from "@/components/glass/glass-icons";
import { Popover, PopoverTrigger, GlassPopoverContent } from "@/components/glass/glass-popover";
import { Dialog, DialogClose, DialogTitle, DialogDescription, GlassDialogContent } from "@/components/glass/glass-dialog";
import { GlassInput } from "@/components/glass/glass-input";
import { useGlassTheme } from "@/components/glass/glass-theme-provider";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

/** The actual portrait and its complete paper plane are the refraction source.
 * One lens bends them together; there is no copied photo or custom alignment. */
export function ProfilePopoverExample() {
  const { resolvedMode } = useGlassTheme();
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(true);
  const [name, setName] = useState("Alex Morgan");
  const [draft, setDraft] = useState(name);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState("");
  const trigger = useRef<HTMLButtonElement>(null);
  const inputId = useId();
  const copyLink = async () => {
    try {
      const link = new URL(location.href);
      link.hash = "profile-preview";
      await navigator.clipboard.writeText(link.href);
      setStatus("Profile link copied.");
    } catch { setStatus("Copy the page address to share this profile."); }
    setOpen(false);
  };
  return (
    <div id="profile-preview" ref={setContainer} className="profile-illustration-preview">
      <GlassScene appearance={resolvedMode} className="profile-illustration-scene" content={
        <div className="profile-illustration-source">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/profile-illustration.webp" width={720} height={720}
            alt="Sculpted portrait with teal hair and a terracotta jacket" className="profile-illustration" decoding="async" />
        </div>
      }>
        <Popover open={open} onOpenChange={setOpen}>
          <div className="profile-illustration-trigger">
            <PopoverTrigger asChild><GlassButton ref={trigger} variant="glass" shape="circle" aria-label="Profile actions"><GlassIcon name="more" /></GlassButton></PopoverTrigger>
          </div>
          <GlassPopoverContent container={container} collisionBoundary={container ?? undefined} collisionPadding={20}
            side="right" align="center" sideOffset={12} radius={24} shape="squircle"
            aria-label="Profile actions" className="profile-illustration-menu"
            lensParameters={{ magnification: 1.18, blur: 1, rimStrength: 1.1 }}
            onOpenAutoFocus={event => event.preventDefault()}
            onCloseAutoFocus={event => { if (editing) event.preventDefault(); }}>
            <div className="flex flex-col gap-1">
              <GlassButton variant="ghost" className="justify-start" onClick={() => { setDraft(name); setOpen(false); setEditing(true); }}>Edit profile</GlassButton>
              <GlassButton variant="ghost" className="justify-start" onClick={() => void copyLink()}>Share profile</GlassButton>
            </div>
          </GlassPopoverContent>
        </Popover>
        <div className="profile-illustration-caption"><h3>{name}</h3><p>alex@example.com</p></div>
        <Dialog open={editing} onOpenChange={setEditing}>
          <GlassDialogContent container={container} showCloseButton={false} onCloseAutoFocus={event => { event.preventDefault(); trigger.current?.focus(); }}>
            <form className="flex flex-col gap-4" onSubmit={event => {
              event.preventDefault();
              if (!draft.trim()) return;
              setName(draft.trim()); setStatus("Profile updated."); setEditing(false);
            }}>
              <div><DialogTitle>Edit profile</DialogTitle><DialogDescription>Update your display name.</DialogDescription></div>
              <FieldGroup><Field><FieldLabel htmlFor={inputId}>Display name</FieldLabel><GlassInput id={inputId} value={draft} onChange={event => setDraft(event.target.value)} maxLength={40} required autoComplete="off" /></Field></FieldGroup>
              <div className="flex justify-end gap-2"><DialogClose asChild><GlassButton variant="secondary">Cancel</GlassButton></DialogClose><GlassButton type="submit" variant="primary" disabled={!draft.trim()}>Save</GlassButton></div>
            </form>
          </GlassDialogContent>
        </Dialog>
      </GlassScene>
      <span role="status" className="sr-only">{status}</span>
    </div>
  );
}
