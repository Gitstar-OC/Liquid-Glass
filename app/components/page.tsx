import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/landing/site-header";
import { ComponentGallery } from "@/components/gallery/component-gallery";
import { PageHeader } from "@/components/site/page-header";
import { GlassButton as Button } from "@/components/glass/glass-button";
export const metadata = {
  title: "Components — Liquid Glass",
  description:
    "Interactive glass components built on shadcn/ui. Preview, customize, and install the source.",
};
export default function ComponentsPage() {
  return (
    <main className="site-shell min-h-screen bg-background px-5 pb-10 text-foreground sm:px-8">
      <SiteHeader active="components" />
      <section className="mx-auto w-full max-w-5xl">
        <PageHeader
          title="Components"
          description="Preview components, adjust the glass, and install the source."
          actions={
            <Button asChild variant="outline" size="sm">
              <Link href="/playground">
                Open playground <ArrowUpRight />
              </Link>
            </Button>
          }
        />
        <ComponentGallery />
      </section>
    </main>
  );
}
