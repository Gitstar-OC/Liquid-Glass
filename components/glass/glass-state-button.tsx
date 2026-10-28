"use client";

import { useState } from "react";
import { GlassIcon } from "@/components/glass/glass-icons";
import { GlassButton } from "@/components/glass/glass-button";
import { GlassStateSwap } from "@/components/glass/glass-state-swap";

export function GlassSaveButton({ className, onSavedChange }: {
  className?: string; onSavedChange?: (saved: boolean) => void;
}) {
  const [saved, setSaved] = useState(false);
  const [animate, setAnimate] = useState(false);
  return <GlassButton aria-label={saved ? "Saved" : "Save changes"} className={className} onClick={event=>{
    setAnimate(event.detail > 0); setSaved(!saved); onSavedChange?.(!saved);
  }}><GlassStateSwap active={saved} animate={animate} className="min-w-28" from={<><GlassIcon name="arrow" />Save changes</>} to={<><GlassIcon name="check" />Saved</>} /></GlassButton>;
}
export function GlassLikeButton({ className }: { className?: string }) {
  const [liked,setLiked] = useState(false);
  const [animate,setAnimate] = useState(false);
  return <GlassButton shape="circle" aria-label="Like" aria-pressed={liked} className={className} onClick={event=>{
    setAnimate(event.detail > 0);setLiked(!liked);
  }}><GlassStateSwap active={liked} animate={animate} from={<GlassIcon name="heart" />} to={<GlassIcon name="heart" fill="currentColor" />} /></GlassButton>;
}
export function GlassAddButton({ className }: { className?: string }) {
  const [added,setAdded] = useState(false);
  const [animate,setAnimate] = useState(false);
  return <GlassButton shape="circle" aria-label={added ? "Remove from collection" : "Add to collection"} aria-pressed={added} className={className} onClick={event=>{
    setAnimate(event.detail > 0);setAdded(!added);
  }}><GlassStateSwap active={added} animate={animate} from={<GlassIcon name="plus" />} to={<GlassIcon name="check" />} /></GlassButton>;
}
