"use client";

import { ArrowDown, ArrowRight, Sparkles } from "lucide-react";
import { LiquidGlass } from "@/components/liquid-glass";
import { GlassBadge, GlassButton } from "@/components/glass";
import { Button } from "@/components/ui/button";
import { InstallCommand } from "@/components/landing/install-command";
import { Reveal } from "@/components/landing/reveal";

export function Hero() {
  return (
    <section
      id="overview"
      className="relative scroll-mt-24 px-6 pb-24 pt-20 sm:pb-28 sm:pt-28"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <Reveal>
          <GlassBadge className="inline-flex h-7 items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.035] px-3 text-[11px] font-medium tracking-[0.015em] text-foreground/75">
            <Sparkles className="size-3 text-sky-300" strokeWidth={1.8} />
            A more tactile layer for shadcn/ui
          </GlassBadge>
        </Reveal>

        <Reveal delay={50}>
          <h1 className="mt-8 max-w-4xl text-balance text-[clamp(3.2rem,8vw,6.6rem)] font-semibold leading-[0.94] tracking-[-0.075em]">
            Glass, with a little
            <br className="hidden sm:block" />
            <span className="hero-shimmer">more depth.</span>
          </h1>
        </Reveal>

        <Reveal delay={100}>
          <p className="mt-7 max-w-[36rem] text-pretty text-[15px] leading-7 text-muted-foreground sm:text-[17px] sm:leading-8">
            A considered set of shadcn components shaped by light, refraction,
            and the details that make an interface feel right.
          </p>
        </Reveal>

        <Reveal delay={150}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="h-11 rounded-full px-5 text-[13px] active:scale-[0.98]">
              <a href="#components">
                Explore the components
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <GlassButton asChild variant="ghost" size="lg" className="h-11 rounded-full px-5 text-[13px] active:scale-[0.98]">
              <a href="#playground">Tune the lens</a>
            </GlassButton>
          </div>
        </Reveal>

        <Reveal delay={190} className="mt-7 w-full max-w-[29rem]">
          <InstallCommand />
        </Reveal>

        <Reveal delay={230} className="mt-16 w-full sm:mt-20">
          <div className="hero-stage relative mx-auto w-full overflow-hidden rounded-[var(--surface-radius)] border border-white/[0.09] p-5 sm:p-8">
            <div aria-hidden className="hero-stage-light" />
            <div className="relative flex items-center justify-between text-left">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">Material study · 01</p>
                <p className="mt-1.5 text-[13px] font-medium tracking-[-0.01em] text-white/85">Light, held in place</p>
              </div>
              <span className="hidden items-center gap-2 font-mono text-[10px] text-white/40 sm:flex">
                <span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,.8)]" />
                LIVE REFRACTION
              </span>
            </div>

            <div className="hero-optics relative mt-6 grid min-h-[230px] place-items-center overflow-hidden rounded-[calc(var(--surface-radius)-8px)] border border-white/[0.07] px-4 py-10 sm:mt-8 sm:min-h-[300px]">
              <div aria-hidden className="hero-ribbons" />
              <LiquidGlass
                preset="regular"
                radius={24}
                pad={56}
                className="relative w-full max-w-[25rem] border border-white/[0.18] shadow-[0_28px_80px_rgba(0,0,0,.35)]"
              >
                <div className="flex items-start justify-between gap-5 p-5 text-left sm:p-6">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/50">Optical system</p>
                    <p className="mt-2 text-xl font-medium tracking-[-0.045em] text-white sm:text-2xl">Quietly dimensional.</p>
                    <p className="mt-2 max-w-[17rem] text-[12px] leading-5 text-white/65">A soft edge, a little color, and enough clarity to let the interface breathe.</p>
                  </div>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full border border-white/15 bg-white/[0.08] text-white/85">
                    <ArrowDown className="size-4" strokeWidth={1.7} />
                  </span>
                </div>
              </LiquidGlass>
            </div>

            <div className="relative mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[11px] text-white/45 sm:justify-between">
              <span>60+ primitives</span>
              <span>5 optical materials</span>
              <span>One coherent system</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
