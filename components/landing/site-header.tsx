import Link from "next/link";
import { SiteSearch } from "@/components/site/site-search";
import { SiteThemeToggle } from "@/components/site/theme-toggle";
import { MobileSiteNavigation } from "@/components/site/mobile-navigation";
import { cn } from "@/lib/utils";
import { LiquidMark } from "@/components/landing/liquid-mark";

export function SiteHeader({
  active,
}: {
  active?: "playground" | "components" | "docs";
}) {
  return (
    <header className="relative z-30 mx-auto flex h-16 w-full max-w-5xl items-center gap-2 sm:gap-8">
      <Link
        href="/"
        aria-label="Liquid Glass home"
        className="group flex shrink-0 items-center gap-2 text-sm font-semibold tracking-tight"
      >
        <LiquidMark
          variant="header"
          className="transition-transform duration-300 group-hover:rotate-12"
        />
        <span className="hidden md:inline">Liquid Glass</span>
      </Link>
      <nav
        aria-label="Main navigation"
        className="hidden min-w-0 flex-1 items-center gap-2 text-xs sm:flex sm:gap-6 sm:text-[13px]"
      >
        {[
          { href: "/components", label: "Components", id: "components" },
          { href: "/playground", label: "Playground", id: "playground" },
          { href: "/docs", label: "Docs", id: "docs" },
        ].map((item) => (
          <Link
            key={item.id}
            href={item.href}
            aria-current={active === item.id ? "page" : undefined}
            className={cn(
              "relative flex h-16 items-center text-muted-foreground transition-colors hover:text-foreground",
              active === item.id &&
              "text-foreground",
            )}
          >
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <MobileSiteNavigation />
      <SiteSearch />
      <SiteThemeToggle />
    </header>
  );
}
