"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ControlLensPlayground } from "@/components/control-lens-playground";
const ScenePlayground = dynamic(() =>
  import("@/components/engine-playground").then(
    (module) => module.EnginePlayground,
  ),
);

export function PlaygroundWorkbench() {
  const [view, setView] = useState("lens");
  return (
    <Tabs value={view} onValueChange={setView} className="gap-8">
      <TabsList aria-label="Playground renderer">
        <TabsTrigger value="lens">Lens</TabsTrigger>
        <TabsTrigger value="scene">Scene</TabsTrigger>
      </TabsList>
      <TabsContent value="lens">
        {view === "lens" && <ControlLensPlayground />}
      </TabsContent>
      <TabsContent value="scene">
        {view === "scene" && <ScenePlayground />}
      </TabsContent>
    </Tabs>
  );
}
