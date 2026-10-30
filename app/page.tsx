import { GlassCollection } from "@/components/landing/glass-collection";
import { LandingShowcase } from "@/components/landing/landing-showcase";

export default function Home() {
  return (
    <main className="site-shell min-h-svh">
      <GlassCollection />
      <LandingShowcase />
    </main>
  );
}
