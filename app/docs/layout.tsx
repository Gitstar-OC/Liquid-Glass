import { SiteHeader } from "@/components/landing/site-header";
import { DocsNavigation } from "@/components/docs/navigation";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="site-shell min-h-screen bg-background px-5 text-foreground sm:px-8">
      <SiteHeader active="docs" />
      <div className="mx-auto grid w-full max-w-6xl items-start gap-6 pt-5 md:grid-cols-[168px_minmax(0,1fr)] md:gap-10 md:pt-0">
        <DocsNavigation />
        <main className="min-w-0 py-5 md:py-10">{children}</main>
      </div>
    </div>
  );
}
