import { PageHeader } from "@/components/site/page-header";
import { PlaygroundWorkbench } from "@/components/playground-workbench";
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
      <section className="mx-auto w-full max-w-5xl pt-10 pb-10 sm:pt-12">
        <PageHeader
          title="Playground"
          description="Tune the control lens or work with a live scene."
          className="pt-0"
        />
        <div>
          <PlaygroundWorkbench />
        </div>
      </section>
    </main>
  );
}
