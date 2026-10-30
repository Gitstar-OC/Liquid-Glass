"use client";

import {
  GlassToggleGroup,
  GlassToggleGroupItem,
} from "@/components/glass/glass-toggle";
import { GlassSwitch as Switch } from "@/components/glass/glass-switch";
import { GlassButton } from "@/components/glass/glass-button";
import { PreviewToolbar } from "@/components/site/preview-toolbar";
import { GlassInput } from "@/components/glass/glass-input";
import {
  OptionSelect,
  ParameterSlider,
} from "@/components/site/preview-controls";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Copy,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { GlassSettingsProvider } from "@/components/glass-scene";
import {
  GLASS_DEFAULT_PARAMS,
  DEFAULT_OPTICS,
  type LensParams,
  type GlassOptics,
} from "@/lib/glass";
import type { DEMO_PHOTOS } from "@/lib/demo-assets";
import { cn } from "@/lib/utils";
import { GalleryPreview } from "@/components/gallery/preview";
import {
  COMPONENT_CATALOGUE,
  COMPONENT_GROUPS,
  type ComponentGroup,
} from "@/components/gallery/catalogue";

const PARAM_CONTROLS: {
  param: Exclude<keyof LensParams, "tintColor">;
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
  section: string;
}[] = [
  {
    param: "blur",
    label: "Blur",
    min: 0,
    max: 20,
    step: 0.25,
    unit: "px",
    section: "main",
  },
  {
    param: "depth",
    label: "Depth",
    min: 0,
    max: 120,
    step: 1,
    unit: "px",
    section: "main",
  },
  {
    param: "splay",
    label: "Splay",
    min: 2,
    max: 40,
    step: 1,
    section: "Refraction",
  },
  {
    param: "feather",
    label: "Feather",
    min: 0,
    max: 40,
    step: 1,
    section: "Refraction",
  },
  {
    param: "curve",
    label: "Curvature",
    min: 0.3,
    max: 3,
    step: 0.1,
    section: "Refraction",
  },
  {
    param: "chroma",
    label: "Chromatic",
    min: 0,
    max: 0.25,
    step: 0.01,
    section: "Refraction",
  },
  {
    param: "glint",
    label: "Glint",
    min: 0,
    max: 150,
    step: 5,
    unit: "%",
    section: "Light & color",
  },
  {
    param: "brightness",
    label: "Brightness",
    min: 0.5,
    max: 1.5,
    step: 0.01,
    section: "Light & color",
  },
  {
    param: "contrast",
    label: "Contrast",
    min: 0.5,
    max: 1.5,
    step: 0.01,
    section: "Light & color",
  },
  {
    param: "saturate",
    label: "Saturation",
    min: 0,
    max: 2,
    step: 0.05,
    section: "Light & color",
  },
  {
    param: "tint",
    label: "Tint",
    min: 0,
    max: 1,
    step: 0.01,
    section: "Light & color",
  },
];
const OPTIC_CONTROLS: {
  param: keyof GlassOptics;
  label: string;
  min: number;
  max: number;
  step: number;
}[] = [
  {
    param: "refractiveIndex",
    label: "Refractive index",
    min: 1,
    max: 2.2,
    step: 0.01,
  },
  { param: "thickness", label: "Thickness", min: 0.05, max: 2, step: 0.05 },
  { param: "lightAngle", label: "Light angle", min: -360, max: 360, step: 1 },
  { param: "roughness", label: "Roughness", min: 0, max: 1, step: 0.01 },
];
function RangeControl({
  label,
  value,
  min,
  max,
  step,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
}) {
  return (
    <ParameterSlider
      label={label}
      value={value}
      min={min}
      max={max}
      step={step}
      unit={unit}
      onValueChange={onChange}
    />
  );
}

export function ComponentGallery() {
  const [selected, setSelected] = useState("glass-button");
  const [group, setGroup] = useState<ComponentGroup>("All");
  const [search, setSearch] = useState("");
  const [params, setParams] = useState<LensParams>({ ...GLASS_DEFAULT_PARAMS });
  const [optics, setOptics] = useState<GlassOptics>({ ...DEFAULT_OPTICS });
  const [radius, setRadius] = useState(20);
  const [ink, setInk] = useState<"auto" | "light" | "dark">("auto");
  const [protection, setProtection] = useState(true);
  const [photo, setPhoto] = useState<keyof typeof DEMO_PHOTOS>("dunes");
  const [copiedSetup, setCopiedSetup] = useState("");
  const [copyError, setCopyError] = useState(false);
  const preview = useRef<HTMLDivElement>(null);
  const current = COMPONENT_CATALOGUE.find((item) => item.id === selected)!;
  const matches = COMPONENT_CATALOGUE.filter(
    (item) =>
      (group === "All" || item.group === group) &&
      `${item.title} ${item.group}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const update = (key: keyof LensParams, value: number | string) => {
    setParams((old) => ({ ...old, [key]: value }));
    setCopiedSetup("");
  };
  const setup = `<GlassSettingsProvider\n  config={${JSON.stringify(params, null, 2)}}\n  optics={${JSON.stringify(optics, null, 2)}}\n  radius={${radius}}\n  ink="${ink}"\n  contrastProtection={${protection}}\n>\n  <GlassScene content={<YourBackground />}>\n    <YourComponents />\n  </GlassScene>\n</GlassSettingsProvider>`;
  const copied = copiedSetup === setup;
  const reset = () => {
    setParams({ ...GLASS_DEFAULT_PARAMS });
    setOptics({ ...DEFAULT_OPTICS });
    setRadius(20);
    setInk("auto");
    setProtection(true);
    setCopiedSetup("");
  };
  return (
    <div className="flex flex-col gap-10">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_236px]">
        <section
          ref={preview}
          id="preview"
          aria-labelledby="preview-title"
          className="min-w-0 scroll-mt-6"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <OptionSelect
              label="Preview component"
              value={selected}
              onValueChange={setSelected}
              options={COMPONENT_CATALOGUE.map((item) => ({
                value: item.id,
                label: item.title,
              }))}
              className="min-w-44 border-0 bg-zinc-100"
            />
            <Link
              href={`/docs/${current.id}`}
              className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-950"
            >
              View code <ArrowUpRight className="size-3" />
            </Link>
          </div>
          <GlassSettingsProvider
            config={params}
            optics={optics}
            radius={radius}
            ink={ink}
            contrastProtection={protection}
          >
            <GalleryPreview name={selected} photo={photo} />
          </GlassSettingsProvider>
          <h2 id="preview-title" className="sr-only">
            {current.title}
          </h2>
          <PreviewToolbar
            label="Gallery"
            photo={photo}
            onPhotoChange={setPhoto}
            blur={params.blur}
            onBlurChange={(blur) =>
              setParams((previous) => ({ ...previous, blur }))
            }
            href={`/docs/${current.id}`}
          />
        </section>
        <aside
          aria-label="Glass inspector"
          className="site-inspector rounded-[20px] bg-transparent p-0 lg:p-4"
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xs font-medium">
              <SlidersHorizontal className="size-3.5" /> Glass settings
            </h2>
            <GlassButton
              aria-label="Reset glass settings"
              title="Reset glass settings"
              onClick={reset}
              className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-200/50"
            >
              <RotateCcw className="size-3.5" />
            </GlassButton>
          </div>
          <div className="flex flex-col gap-5">
            {PARAM_CONTROLS.filter((c) => c.section === "main").map((c) => (
              <RangeControl
                key={c.param}
                {...c}
                value={params[c.param]}
                onChange={(value) => update(c.param, value)}
              />
            ))}
            <RangeControl
              label="Corner radius"
              value={radius}
              min={0}
              max={48}
              step={1}
              unit="px"
              onChange={setRadius}
            />
          </div>
          <div className="mt-6 flex flex-col gap-2">
            {[
              "Refraction",
              "Light & color",
              "Optical model",
              "Readability",
            ].map((section) => (
              <details key={section} className="group py-4">
                <summary className="flex cursor-pointer items-center justify-between text-xs font-medium marker:hidden">
                  {section}
                  <PlusIndicator />
                </summary>
                <div className="flex flex-col gap-5 pt-6">
                  {PARAM_CONTROLS.filter((c) => c.section === section).map(
                    (c) => (
                      <RangeControl
                        key={c.param}
                        {...c}
                        value={params[c.param]}
                        onChange={(value) => update(c.param, value)}
                      />
                    ),
                  )}
                  {section === "Light & color" && (
                    <label className="flex items-center justify-between text-xs text-zinc-600">
                      Tint color
                      <input
                        type="color"
                        aria-label="Tint color"
                        value={params.tintColor}
                        onChange={(event) =>
                          update("tintColor", event.target.value)
                        }
                        className="h-7 w-9 cursor-pointer rounded border border-zinc-200 bg-transparent p-0.5"
                      />
                    </label>
                  )}
                  {section === "Optical model" &&
                    OPTIC_CONTROLS.map((c) => (
                      <RangeControl
                        key={c.param}
                        {...c}
                        value={optics[c.param]}
                        onChange={(value) =>
                          setOptics((old) => ({ ...old, [c.param]: value }))
                        }
                      />
                    ))}
                  {section === "Readability" && (
                    <>
                      <label className="flex items-center justify-between text-xs text-zinc-600">
                        Text color
                        <OptionSelect
                          label="Text color"
                          value={ink}
                          onValueChange={(value) => setInk(value as typeof ink)}
                          options={[
                            { value: "auto", label: "Automatic" },
                            { value: "light", label: "Light" },
                            { value: "dark", label: "Dark" },
                          ]}
                        />
                      </label>
                      <label className="flex items-center justify-between gap-3 text-xs text-zinc-600">
                        Protect contrast
                        <Switch
                          aria-label="Protect contrast"
                          checked={protection}
                          onCheckedChange={setProtection}
                        />
                      </label>
                      <p className="text-[11px] leading-5 text-zinc-500">
                        Automatic ink follows the source image. A neutral layer
                        protects text on busy backgrounds.
                      </p>
                    </>
                  )}
                </div>
              </details>
            ))}
          </div>
          <GlassButton
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(setup);
                setCopiedSetup(setup);
                setCopyError(false);
              } catch {
                setCopyError(true);
              }
            }}
            className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-[10px] glass-chip text-xs font-medium hover:bg-foreground/10"
          >
            {copied ? (
              <Check className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {copied ? "Setup copied" : "Copy setup"}
          </GlassButton>
          {copyError && (
            <p role="status" className="mt-3 text-xs text-zinc-600">
              Copy unavailable. Select the setup below.
            </p>
          )}
          <p className="mt-3 text-[11px] leading-5 text-zinc-500">
            Shared settings apply to every preview.
          </p>
        </aside>
      </div>
      <section
        aria-labelledby="library-title"
        id="library"
        className="scroll-mt-8 border-t border-zinc-200/80 pt-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2
              id="library-title"
              className="text-xl font-medium tracking-tight"
            >
              Component library
            </h2>
            <p className="mt-1.5 text-xs text-zinc-500">
              {COMPONENT_CATALOGUE.length} components. Preview, adjust, and
              install.
            </p>
          </div>
          <label className="glass-field flex h-10 w-full items-center gap-2 rounded-[12px] px-3 sm:w-56">
            <Search className="size-3.5 text-zinc-400" />
            <GlassInput
              type="search"
              aria-label="Find a component"
              placeholder="Find a component…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="min-w-0 flex-1 border-0 bg-transparent text-xs outline-none"
            />
          </label>
        </div>
        <GlassToggleGroup
          type="single"
          aria-label="Filter components"
          value={group}
          onValueChange={(value) => {
            if (value) setGroup(value as ComponentGroup);
          }}
          className="mt-6 flex flex-wrap gap-2"
        >
          {COMPONENT_GROUPS.map((item) => (
            <GlassToggleGroupItem key={item} value={item}>
              {item}
            </GlassToggleGroupItem>
          ))}
        </GlassToggleGroup>
        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((item) => (
            <GlassButton
              key={item.id}
              aria-pressed={selected === item.id}
              onClick={() => {
                setSelected(item.id);
                preview.current?.scrollIntoView({ block: "start" });
              }}
              className={cn(
                "group h-auto min-h-16 flex items-center justify-between gap-3 rounded-xl px-4 py-3.5 text-left transition-colors",
                selected === item.id
                  ? "bg-foreground/10"
                  : "hover:bg-foreground/5",
              )}
            >
              <span>
                <span className="block text-[13px] font-medium">
                  {item.title}
                </span>
                <span className="mt-1 block text-[11px] text-zinc-500">
                  {item.group}
                </span>
              </span>
              {selected === item.id ? (
                <Check className="size-3.5 text-zinc-700" />
              ) : (
                <ArrowUpRight className="size-3.5 text-zinc-300 group-hover:text-zinc-600" />
              )}
            </GlassButton>
          ))}
        </div>
        {matches.length === 0 && (
          <p role="status" className="py-10 text-center text-sm text-zinc-500">
            No components found. Try another name.
          </p>
        )}
      </section>
      <details className="glass-field rounded-[20px] p-5">
        <summary className="cursor-pointer text-xs font-medium">
          Your glass setup
        </summary>
        <pre className="mt-5 overflow-auto text-[11px] leading-5 text-zinc-600">
          <code>{setup}</code>
        </pre>
      </details>
    </div>
  );
}
function PlusIndicator() {
  return (
    <span
      aria-hidden="true"
      className="text-base leading-none font-normal text-zinc-400 group-open:rotate-45"
    >
      +
    </span>
  );
}
