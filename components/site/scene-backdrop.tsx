import { DEMO_PHOTOS, DEFAULT_BACKDROP } from "@/lib/demo-assets";
import { cn } from "@/lib/utils";

/** Local, responsive assets keep scene pixels readable and decode costs bounded. */
export function SceneBackdrop({ photo = DEFAULT_BACKDROP, className, priority = false }: {
  photo?: keyof typeof DEMO_PHOTOS; className?: string; priority?: boolean;
}) {
  const local = photo !== "coast";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={DEMO_PHOTOS[photo].src} alt={DEMO_PHOTOS[photo].alt} width={1280} height={854}
      srcSet={local ? `/images/${photo}-640.webp 640w, /images/${photo}-1280.webp 1280w` : undefined}
      sizes="(max-width: 640px) 100vw, (max-width: 1100px) 90vw, 1024px"
      loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async"
      crossOrigin="anonymous" className={cn("size-full object-cover",className)} />
  );
}
