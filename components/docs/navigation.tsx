"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import {
  COMPONENT_CATALOGUE,
  COMPONENT_GROUPS,
} from "@/components/gallery/catalogue";
import { cn } from "@/lib/utils";

const CORE = [
  { id: "glass-surface", title: "Glass surface" },
  { id: "glass-lens", title: "Refraction engine" },
  { id: "glass-adaptive-ink", title: "Adaptive ink" },
  { id: "glass-theme-provider", title: "Theme provider" },
  { id: "glass-utilities", title: "Utilities" },
  { id: "glass-icons", title: "Icons" },
  { id: "glass-components", title: "Complete library" },
  { id: "performance", title: "Performance" },
];
export function DocsNavigation() {
  const pathname = usePathname();
  const link = (href: string, title: string) => (
    <Link
      key={href}
      href={href}
      aria-current={pathname === href ? "page" : undefined}
      onClick={(event) =>
        event.currentTarget.closest("details")?.removeAttribute("open")
      }
      className={cn(
        "block rounded-md px-2 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        pathname === href && "bg-muted font-medium text-foreground",
      )}
    >
      {title}
    </Link>
  );
  const content = (
    <nav aria-label="Documentation navigation" className="flex flex-col gap-6">
      {link("/docs", "Getting started")}
      <div>
        <p className="mb-2 px-2 text-xs font-medium text-foreground">
          Foundation
        </p>
        {CORE.map((item) => link(`/docs/${item.id}`, item.title))}
      </div>
      {COMPONENT_GROUPS.filter((group) => group !== "All").map((group) => (
        <div key={group}>
          <p className="mb-2 px-2 text-xs font-medium text-foreground">
            {group}
          </p>
          {COMPONENT_CATALOGUE.filter((item) => item.group === group).map(
            (item) => link(`/docs/${item.id}`, item.title),
          )}
        </div>
      ))}
    </nav>
  );
  return (
    <>
      <aside className="sticky top-6 hidden max-h-[calc(100svh-3rem)] self-start overflow-auto py-8 pr-4 [scrollbar-width:thin] md:block">
        {content}
      </aside>
      <details className="group rounded-lg border p-3 md:hidden">
        <summary className="flex cursor-pointer items-center justify-between text-sm font-medium">
          Documentation
          <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-4 max-h-80 overflow-auto">{content}</div>
      </details>
    </>
  );
}
