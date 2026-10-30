import { GlassCollection } from "@/components/landing/glass-collection";
import { LandingShowcase } from "@/components/landing/landing-showcase";
import { HomeDock } from "@/components/landing/showcase-dock";

export default function Home() {
  return (
    <main className="site-shell min-h-svh">
      <GlassCollection />
      <LandingShowcase />
      <HomeDock />
    </main>
  );
}
