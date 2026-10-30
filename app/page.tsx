import { GlassCollection } from "@/components/landing/glass-collection";
import { PanelShowcase } from "@/components/landing/panel-showcase";

export default function Home() {
  return (
    <main className="site-shell min-h-svh">
      <GlassCollection />
      <PanelShowcase />
    </main>
  );
}
