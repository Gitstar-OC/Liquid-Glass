"use client";

import { useId, useRef, useState } from "react";
import { GlassLensButton } from "@/components/glass/glass-lens-button";
import { GlassIcon } from "@/components/glass/glass-icons";
import { useGlassTheme } from "@/components/glass/glass-theme-provider";
import { SceneBackdrop } from "@/components/site/scene-backdrop";
import { GlassScene } from "@/components/glass-scene";
import { Dialog, DialogTitle, DialogDescription, GlassDialogContent } from "@/components/glass/glass-dialog";
import { GlassStateSwap } from "@/components/glass/glass-state-swap";
import { DEMO_PHOTOS } from "@/lib/demo-assets";

export function LensButtonExample() {
  const source = useRef<HTMLImageElement>(null);
  const [status, setStatus] = useState("");
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [animate, setAnimate] = useState(true);
  const restoreFocus = useRef<HTMLButtonElement | null>(null);
  const dialogId = useId();
  const { resolvedMode } = useGlassTheme();
  const photo = resolvedMode === "dark" ? "ocean" : "dunes";
  const name = photo === "ocean" ? "Ocean.webp" : "Dunes.webp";
  const preview = (trigger: HTMLButtonElement) => { restoreFocus.current = trigger; setOpen(true); };
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(new URL(DEMO_PHOTOS[photo].src, location.origin).href);
      setCopied(true); setStatus("Image link copied.");
    } catch { setStatus("The browser could not copy the link. Open the image preview to view it."); }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
    <div ref={setContainer} className="home-lens-buttons-wrap">
      <GlassScene appearance={resolvedMode} className="home-lens-buttons-scene" content={
        <button type="button" className="home-lens-image-trigger" aria-label={`Preview ${name}`} aria-haspopup="dialog" aria-controls={dialogId}
          onClick={event => preview(event.currentTarget)}><SceneBackdrop ref={source} photo={photo} /></button>
      }>
        <div className="home-lens-buttons-actions">
          <GlassLensButton imageRef={source} aria-haspopup="dialog" aria-controls={dialogId} onClick={event => preview(event.currentTarget)}>
            Preview <GlassIcon name="diagonal" data-icon="inline-end" />
          </GlassLensButton>
          <GlassLensButton imageRef={source} aria-label="Copy image link" onClick={event => { setAnimate(event.detail !== 0); void copyLink(); }}>
            <GlassStateSwap active={copied} animate={animate} from={<GlassIcon name="copy" />} to={<GlassIcon name="check" />} /> Copy link
          </GlassLensButton>
        </div>
        <GlassDialogContent id={dialogId} container={container} onCloseAutoFocus={event => { event.preventDefault(); restoreFocus.current?.focus({ preventScroll: true }); }}>
          <div><DialogTitle>{name}</DialogTitle><DialogDescription>Landscape studies</DialogDescription></div>
          <div className="workspace-dialog-image"><SceneBackdrop photo={photo} /></div>
          <a href={DEMO_PHOTOS[photo].src} target="_blank" rel="noreferrer" className="text-sm underline underline-offset-4">View original image</a>
        </GlassDialogContent>
      </GlassScene>
      <span role="status" className="sr-only">{status}</span>
    </div>
    </Dialog>
  );
}
