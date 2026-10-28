"use client";

import { useState } from "react";
import { SceneBackdrop } from "@/components/site/scene-backdrop";
import { GlassScene } from "@/components/glass-scene";
import { GalleryExample } from "@/components/gallery/examples";
import { DEMO_PHOTOS } from "@/lib/demo-assets";
import { cn } from "@/lib/utils";

/** One bounded live scene, shared by gallery and documentation examples. */
export function GalleryPreview({
  name,
  photo = "dunes",
  className,
}: {
  name: string;
  photo?: keyof typeof DEMO_PHOTOS;
  className?: string;
}) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <div
      ref={setContainer}
      className={cn(
        "relative h-[560px] sm:h-[480px] overflow-hidden rounded-[20px] bg-zinc-200",
        className,
      )}
      data-testid="gallery-preview"
    >
      <GlassScene
        frameRate={30}
        appearance={photo === "dunes" ? "light" : "dark"}
        className="size-full"
        content={
          <SceneBackdrop photo={photo} />
        }
      >
        <div className="absolute inset-0 flex items-center justify-center p-5 sm:p-8">
          <GalleryExample key={name} name={name} container={container} />
        </div>
      </GlassScene>
    </div>
  );
}
