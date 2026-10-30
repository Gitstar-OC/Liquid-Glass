"use client";

import { useState } from "react";
import { GlassButton } from "@/components/glass/glass-button";
import {
  GlassSaveButton,
  GlassLikeButton,
  GlassAddButton,
} from "@/components/glass/glass-state-button";

export function ButtonExamples({
  standalone = false,
}: {
  standalone?: boolean;
}) {
  const [applied, setApplied] = useState(false);
  return (
    <div
      data-standalone={standalone}
      className="flex flex-col items-center gap-6"
    >
      <div className="flex flex-wrap items-center justify-center gap-3">
        <GlassSaveButton />
        <GlassButton variant="primary" onClick={() => setApplied(true)}>
          {applied ? "Applied" : "Apply"}
        </GlassButton>
        <GlassButton variant="secondary" onClick={() => setApplied(false)}>
          Cancel
        </GlassButton>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <GlassLikeButton className="size-12" />
        <GlassAddButton className="size-12" />
        <GlassButton liquidOnHold className="h-12">
          Hold for glass
        </GlassButton>
      </div>
      <span className="sr-only" role="status">
        {applied ? "Changes applied" : "Ready"}
      </span>
    </div>
  );
}
