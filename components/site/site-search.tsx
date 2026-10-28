"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, SlidersHorizontal } from "lucide-react";
import { GlassIcon } from "@/components/glass/glass-icons";
import { GlassSpotlight, type GlassSpotlightCommand } from "@/components/glass/glass-spotlight";
import { COMPONENT_CATALOGUE } from "@/components/gallery/catalogue";

/** Documentation and the showcase use the same palette, rows and keyboard model. */
export function SiteSearch() {
  const router = useRouter();
  const commands = useMemo<GlassSpotlightCommand[]>(() => [
    { id: "docs", label: "Documentation", group: "Get started", icon: <BookOpen/>, onSelect: () => router.push("/docs") },
    { id: "playground", label: "Playground", group: "Get started", icon: <SlidersHorizontal/>, onSelect: () => router.push("/playground") },
    ...COMPONENT_CATALOGUE.map(item => ({ id: item.id, label: item.title, group: "Components", description: item.group, keywords: [item.group, item.id], icon: <GlassIcon name="arrow"/>, onSelect: () => router.push(`/docs/${item.id}`) })),
  ], [router]);
  return <GlassSpotlight shortcut title="Search documentation" triggerAriaLabel="Search documentation" triggerLabel="Search docs…" placeholder="Find a component or page…" commands={commands}
    className="size-10 max-w-none gap-2 p-0 text-xs font-normal lg:w-52 lg:px-3 [&>span]:hidden lg:[&>span]:block [&>kbd]:hidden lg:[&>kbd]:block"/>;
}
