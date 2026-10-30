import { GlassPerformanceLab } from "@/components/glass-performance-lab";
import { SiteHeader } from "@/components/landing/site-header";

export const metadata = {
  title: "Performance lab — Liquid Glass",
  robots: { index: false, follow: false },
};
export default function PerformancePage() {
  return (
    <main className="site-shell min-h-screen bg-background px-5 sm:px-8">
      <SiteHeader />
      <div className="mx-auto flex max-w-5xl flex-col gap-8 py-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Performance lab
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Compare surface counts with the same source and motion.
          </p>
        </div>
        <GlassPerformanceLab />
      </div>
    </main>
  );
}
