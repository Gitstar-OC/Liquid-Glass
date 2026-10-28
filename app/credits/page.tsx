import { SiteHeader } from "@/components/landing/site-header";
import { PageHeader } from "@/components/site/page-header";
import { DEMO_PHOTOS } from "@/lib/demo-assets";
export const metadata = { title: "Photo credits — Liquid Glass" };
export default function CreditsPage() {
  return (
    <main className="site-shell min-h-screen bg-background px-5 pb-10 text-foreground sm:px-8">
      <SiteHeader />
      <section className="mx-auto max-w-5xl">
        <PageHeader
          title="Credits"
          description="Photography and audio used in the live component previews."
        />
        <div className="grid gap-6 sm:grid-cols-2">
          {Object.values(DEMO_PHOTOS)
            .filter((photo) => photo.href)
            .map((photo) => (
              <a
                key={photo.src}
                href={photo.href}
                target="_blank"
                rel="noreferrer"
                className="group overflow-hidden rounded-xl bg-muted/40"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="h-52 w-full object-cover"
                />
                <div className="p-5">
                  <h2 className="text-sm font-medium">{photo.credit}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    View photograph on Unsplash ↗
                  </p>
                </div>
              </a>
            ))}
        </div>
        <p className="mt-8 text-xs text-muted-foreground">
          Audio previews are original synthesized ambient studies included with
          the demo.
        </p>
      </section>
    </main>
  );
}
