"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PreviewToolbar } from "@/components/site/preview-toolbar";
import { PanelShowcase, SHOWCASE_EXAMPLES, type ShowcaseExample } from "@/components/landing/panel-showcase";

const INTERACTIONS: ShowcaseExample[] = ["slider", "switch", "navigation", "buttons", "video"];
const OVERLAYS: ShowcaseExample[] = ["popover", "dropdown", "drawer"];
const DETAILS: ShowcaseExample[] = ["tooltip", "hover-card", "card"];

/** One mounted example per section. Clear navigation replaces a carousel of
 * empty peeks; each component owns the width and height its interaction needs. */
function ExampleSection({ title, examples, id }: { title?: string; examples: ShowcaseExample[]; id?: string }) {
  const [selected, setSelected] = useState<ShowcaseExample>(examples[0]);
  const [direction, setDirection] = useState(1);
  const [keyboard, setKeyboard] = useState(false);
  const input = useRef<"pointer" | "keyboard">("pointer");
  const keyboardHint = useId();
  const example = SHOWCASE_EXAMPLES.find(item => item.id === selected)!;
  const simple = OVERLAYS.includes(selected) || DETAILS.includes(selected);
  return (
    <section className="landing-example-section" id={id} aria-label={title ?? "Interaction examples"}>
      <Tabs value={selected} onValueChange={next => {
        setKeyboard(input.current === "keyboard");
        setDirection(examples.indexOf(next as ShowcaseExample) > examples.indexOf(selected) ? 1 : -1);
        setSelected(next as ShowcaseExample);
      }} activationMode="automatic" className="landing-interactions">
        <header className="landing-interactions-heading">
          {title && <h2>{title}</h2>}
          {examples.length > 1 && <TabsList variant="line" aria-label={title ?? "Component interactions"} aria-describedby={keyboardHint} className="landing-interaction-tabs"
            onPointerDownCapture={() => { input.current = "pointer"; }}
            onKeyDownCapture={() => { input.current = "keyboard"; }}>
            {examples.map(value => <TabsTrigger key={value} value={value}>{SHOWCASE_EXAMPLES.find(item => item.id === value)!.name}</TabsTrigger>)}
          </TabsList>}
          {examples.length > 1 && <p id={keyboardHint} className="sr-only">Arrow keys change examples. Tab moves to the selected example’s controls.</p>}
        </header>
        <div className="landing-interaction-window" data-example={selected} data-preview={simple ? "simple" : undefined} data-keyboard={keyboard || undefined} style={{ "--slide-direction": direction } as CSSProperties}>
          {examples.map(value => examples.length === 1 ? <div key={value} className="landing-interaction-panel" data-state="active">
            <PanelShowcase compact minimal initialExample={value} />
          </div> : <TabsContent key={value} value={value} tabIndex={-1} className="landing-interaction-panel">
            <PanelShowcase compact minimal initialExample={value} />
          </TabsContent>)}
        </div>
        <PreviewToolbar label={example.name} href={`/docs/${example.doc}`} blurControl={null} />
      </Tabs>
    </section>
  );
}

export function LandingShowcase() {
  useEffect(() => {
    const followProfileLink = () => {
      if (location.hash === "#profile-preview") document.getElementById("profile-showcase")?.scrollIntoView();
    };
    followProfileLink();
    window.addEventListener("hashchange", followProfileLink);
    return () => window.removeEventListener("hashchange", followProfileLink);
  }, []);
  return (
    <div className="landing-showcase">
      <ExampleSection examples={INTERACTIONS} />
      <div className="landing-detail-list">
        <ExampleSection title="Profile" examples={["profile"]} id="profile-showcase" />
        <ExampleSection title="Overlays" examples={OVERLAYS} />
        <ExampleSection title="Details" examples={DETAILS} />
      </div>
    </div>
  );
}
