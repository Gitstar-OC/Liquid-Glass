"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { FoundationShowcase } from "@/components/landing/showcase/foundation";
import { InputsShowcase } from "@/components/landing/showcase/inputs";
import { OverlaysShowcase } from "@/components/landing/showcase/overlays";
import { NavigationShowcase } from "@/components/landing/showcase/navigation";

const CATEGORIES = [
  {
    id: "foundation",
    label: "Foundation",
    lede: "The core surfaces and controls that give the system its character.",
    render: () => <FoundationShowcase />,
  },
  {
    id: "inputs",
    label: "Inputs",
    lede: "Inputs and controls with a consistent, tactile response.",
    render: () => <InputsShowcase />,
  },
  {
    id: "overlays",
    label: "Overlays",
    lede: "Overlays that stay clear, legible, and close to their point of origin.",
    render: () => <OverlaysShowcase />,
  },
  {
    id: "navigation",
    label: "Navigation",
    lede: "A quiet navigation layer that keeps context in view.",
    render: () => <NavigationShowcase />,
  },
];

export function ComponentGallery() {
  const [tab, setTab] = React.useState<string>("foundation");
  const active =
    CATEGORIES.find((category) => category.id === tab) ?? CATEGORIES[0];

  return (
    <section
      id="components"
      className="relative scroll-mt-24 px-6 py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-5xl">
        <SectionHeading
          eyebrow="Components"
          title="Made for real interfaces."
          lede={active.lede}
          aside={
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList variant="line" className="h-10 gap-5 rounded-none p-0">
                {CATEGORIES.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="h-10 px-0 text-[12px] after:bottom-0 after:h-px"
                  >
                    {category.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          }
        />

        <Reveal delay={120} className="mt-10">
          {active.render()}
        </Reveal>
      </div>
    </section>
  );
}
