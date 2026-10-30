"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { GlassButton } from "@/components/glass/glass-button";
import { PreviewToolbar } from "@/components/site/preview-toolbar";
import { PanelShowcase, SHOWCASE_EXAMPLES, type ShowcaseExample } from "@/components/landing/panel-showcase";

const CONTROLS = ["slider", "switch", "navigation", "buttons", "video"] as const;
const DETAILS: { id: ShowcaseExample; title: string; hint: string }[] = [
  { id: "tooltip", title: "Tooltips", hint: "Hover or focus Preview for a small, joined bubble." },
  { id: "hover-card", title: "Hover cards", hint: "Hover or focus the filename to see its details." },
  { id: "popover", title: "Popovers", hint: "Open Image details to change the file options." },
  { id: "dropdown", title: "Dropdown menus", hint: "Open Actions to explore the menu." },
  { id: "drawer", title: "Drawers", hint: "Open a sheet, then drag down or press Escape to close." },
  { id: "card", title: "Cards", hint: "A single surface for details and actions." },
  { id: "profile", title: "Profile menu", hint: "Open the profile actions over the image." },
];
const HINTS = {
  slider: "Hold and drag to reveal the lens.",
  switch: "Press or drag to either side.",
  navigation: "Choose a section to move the glass.",
  buttons: "Try the actions over the image.",
  video: "Play, pause and seek through the flowers.",
};

/** Native scroll snapping keeps swipes on the browser's scroll path. Only the
 * current slide and an incoming/outgoing slide mount; lower examples are local. */
export function LandingShowcase() {
  const [current, setCurrent] = useState(0);
  const [renderedSlides, setRenderedSlides] = useState([0]);
  const rail = useRef<HTMLDivElement>(null);
  const slides = useRef<(HTMLDivElement | null)[]>([]);
  const railId = useId();
  const headingId = useId();

  useEffect(() => {
    const viewport = rail.current;
    if (!viewport) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      let closest = 0, distance = Infinity;
      const rendered: number[] = [];
      slides.current.forEach((slide, index) => {
        if (!slide) return;
        const left = slide.offsetLeft, width = slide.offsetWidth;
        const overlap = Math.min(left + width, viewport.scrollLeft + viewport.clientWidth) - Math.max(left, viewport.scrollLeft);
        // A small inactive peek stays empty; mount before the actual control
        // crosses the clipping edge so a swipe does not make its content pop.
        if (overlap > width * 0.1) rendered.push(index);
        const next = Math.abs(left - viewport.scrollLeft);
        if (next < distance) { closest = index; distance = next; }
      });
      setCurrent(previous => previous === closest ? previous : closest);
      setRenderedSlides(previous => previous.length === rendered.length && previous.every((value, index) => value === rendered[index]) ? previous : rendered);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    viewport.addEventListener("scroll", schedule, { passive: true });
    const resize = new ResizeObserver(schedule);
    resize.observe(viewport);
    measure();
    return () => {
      viewport.removeEventListener("scroll", schedule);
      resize.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const followProfileLink = () => {
      if (location.hash === "#profile-preview")
        document.getElementById("profile-showcase")?.scrollIntoView();
    };
    followProfileLink();
    window.addEventListener("hashchange", followProfileLink);
    return () => window.removeEventListener("hashchange", followProfileLink);
  }, []);

  const goTo = (index: number) => {
    const slide = slides.current[Math.max(0, Math.min(CONTROLS.length - 1, index))];
    if (!slide || !rail.current) return;
    rail.current.scrollTo({
      left: slide.offsetLeft,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };
  const selected = SHOWCASE_EXAMPLES.find(item => item.id === CONTROLS[current])!;

  return (
    <div className="landing-showcase">
      <section className="landing-carousel" role="region" aria-roledescription="carousel" aria-labelledby={headingId}>
        <div className="landing-carousel-heading">
          <h2 id={headingId}>Controls</h2>
          <div className="landing-carousel-arrows">
            <GlassButton variant="ghost" size="icon-lg" aria-label="Previous component" aria-controls={railId}
              disabled={current === 0} onClick={() => goTo(current - 1)}><ArrowLeft /></GlassButton>
            <GlassButton variant="ghost" size="icon-lg" aria-label="Next component" aria-controls={railId}
              disabled={current === CONTROLS.length - 1} onClick={() => goTo(current + 1)}><ArrowRight /></GlassButton>
          </div>
        </div>
        <div ref={rail} id={railId} className="landing-carousel-rail" tabIndex={0}
          aria-label="Component slides. Swipe or use the left and right arrow keys."
          onKeyDown={event => {
            if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) return;
            const destination = event.key === "ArrowRight" ? current + 1 : event.key === "ArrowLeft" ? current - 1
              : event.key === "Home" ? 0 : event.key === "End" ? CONTROLS.length - 1 : null;
            if (destination === null) return;
            event.preventDefault();
            goTo(destination);
          }}>
          {CONTROLS.map((id, index) => (
            <div key={id} ref={node => { slides.current[index] = node; }} className="landing-carousel-slide"
              role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${CONTROLS.length}: ${SHOWCASE_EXAMPLES.find(item => item.id === id)!.name}`}
              aria-hidden={index !== current} inert={index !== current}>
              <PanelShowcase compact minimal initialExample={id} enabled={renderedSlides.includes(index)} />
            </div>
          ))}
        </div>
        <PreviewToolbar label={selected.name} href={`/docs/${selected.doc}`} blurControl={null}
          backgroundControls={<div className="landing-carousel-caption" aria-live="polite" aria-atomic="true">
            <h3>{selected.name}</h3><p>{HINTS[CONTROLS[current]]}</p>
          </div>} />
        <div className="landing-carousel-pagination" role="group" aria-label="Choose a component slide">
          {CONTROLS.map((id, index) => <button key={id} type="button" aria-controls={railId}
            aria-label={`Show ${SHOWCASE_EXAMPLES.find(item => item.id === id)!.name}`}
            aria-current={index === current ? "true" : undefined} onClick={() => goTo(index)}><span /></button>)}
        </div>
      </section>

      <div className="landing-detail-list">
        {DETAILS.map(item => {
          const example = SHOWCASE_EXAMPLES.find(example => example.id === item.id)!;
          return (
            <article key={item.id} className="landing-detail" id={item.id === "profile" ? "profile-showcase" : `example-${item.id}`}>
              <div className="landing-detail-copy">
                <h2>{item.title}</h2>
                <p>{item.hint}</p>
                <Link href={`/docs/${example.doc}`}>View component <ArrowRight aria-hidden="true" /></Link>
              </div>
              <PanelShowcase compact minimal initialExample={item.id} />
            </article>
          );
        })}
      </div>
    </div>
  );
}
