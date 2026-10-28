import { PageHeader } from "@/components/site/page-header";
import { EnginePlayground } from "@/components/engine-playground";
import { SiteHeader } from "@/components/landing/site-header";
export const metadata = {
  title: "Playground — Liquid Glass",
  description:
    "Shape your glass. Adjust refraction, light, and clarity over a live scene.",
};
export default function PlaygroundPage() {
  return (
    <main className="site-shell min-h-screen bg-background px-5 text-foreground sm:px-8">
      <SiteHeader active="playground" />
      <section className="mx-auto w-full max-w-6xl pt-10 pb-10 sm:pt-12">
        <PageHeader
          title="Playground"
          description="Move the lens, edit the scene, and adjust the optics."
          className="pt-0"
        />
        <div>
          <EnginePlayground />
        </div>
      </section>
    </main>
  );
}
