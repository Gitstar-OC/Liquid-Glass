"use client";

import * as React from "react";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  GlassCheckbox,
  GlassInput,
  GlassLabel,
  GlassSelect,
  GlassSelectContent,
  GlassSelectItem,
  GlassSelectTrigger,
  GlassSelectValue,
  GlassSlider,
  GlassSurface,
  GlassSwitch,
} from "@/components/glass";

export function InputsShowcase() {
  const [blur, setBlur] = React.useState([14]);
  const [autoSave, setAutoSave] = React.useState(true);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_.85fr]">
      <GlassSurface kind="card" radius={24} className="p-6 sm:p-8">
        <div className="mb-7 flex items-start justify-between gap-5">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Account
            </p>
            <h3 className="mt-2 text-[21px] font-semibold tracking-[-0.04em]">
              Welcome back
            </h3>
            <p className="mt-1.5 text-[13px] leading-5 text-muted-foreground">
              Sign in to continue to your workspace.
            </p>
          </div>
          <span className="grid size-10 shrink-0 place-items-center rounded-full border border-foreground/10 bg-foreground/[0.04] text-foreground/65">
            <LockKeyhole className="size-4" strokeWidth={1.7} />
          </span>
        </div>

        <form
          className="grid gap-5"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="grid gap-2">
            <GlassLabel
              htmlFor="scene-email"
              className="text-[12px] font-medium"
            >
              Email address
            </GlassLabel>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground/70"
                strokeWidth={1.7}
              />
              <GlassInput
                id="scene-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-4">
              <GlassLabel
                htmlFor="scene-password"
                className="text-[12px] font-medium"
              >
                Password
              </GlassLabel>
              <a
                href="#components"
                className="text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <LockKeyhole
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground/70"
                strokeWidth={1.7}
              />
              <GlassInput
                id="scene-password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                className="pl-10"
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 py-0.5">
            <GlassCheckbox id="keep-signed-in" />
            <span className="text-[12px] text-muted-foreground">
              Keep me signed in
            </span>
          </label>

          <Button
            type="submit"
            className="h-11 rounded-xl text-[13px] font-semibold active:scale-[0.99]"
          >
            Continue <ArrowRight className="size-4" />
          </Button>
        </form>

        <p className="mt-6 border-t border-foreground/8 pt-5 text-center text-[12px] text-muted-foreground">
          New to Liquid Glass?{" "}
          <a
            href="#components"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Create an account
          </a>
        </p>
      </GlassSurface>

      <GlassSurface kind="card" radius={24} className="p-6 sm:p-7">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Preferences
          </p>
          <h3 className="mt-2 text-[18px] font-semibold tracking-[-0.035em]">
            Tune the surface
          </h3>
          <p className="mt-1.5 text-[12px] leading-5 text-muted-foreground">
            A compact set of controls with clear labels and steady spacing.
          </p>
        </div>

        <div className="mt-7 grid gap-6">
          <div className="grid gap-2">
            <GlassLabel className="text-[12px] font-medium">
              Material
            </GlassLabel>
            <GlassSelect defaultValue="frosted">
              <GlassSelectTrigger className="w-full">
                <GlassSelectValue />
              </GlassSelectTrigger>
              <GlassSelectContent>
                <GlassSelectItem value="transparent">
                  Transparent
                </GlassSelectItem>
                <GlassSelectItem value="clear">Clear</GlassSelectItem>
                <GlassSelectItem value="regular">Regular</GlassSelectItem>
                <GlassSelectItem value="frosted">Frosted</GlassSelectItem>
                <GlassSelectItem value="thick">Thick</GlassSelectItem>
              </GlassSelectContent>
            </GlassSelect>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <GlassLabel
                htmlFor="scene-blur"
                className="text-[12px] font-medium"
              >
                Backdrop blur
              </GlassLabel>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                {blur[0]} px
              </span>
            </div>
            <GlassSlider
              id="scene-blur"
              value={blur}
              onValueChange={setBlur}
              max={32}
            />
            <div className="flex justify-between font-mono text-[9px] text-muted-foreground/65">
              <span>Subtle</span>
              <span>Diffused</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-foreground/8 pt-5">
            <div>
              <p className="text-[12px] font-medium">Save preferences</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Remember these settings
              </p>
            </div>
            <GlassSwitch
              checked={autoSave}
              onCheckedChange={setAutoSave}
              aria-label="Save preferences"
            />
          </div>
        </div>
      </GlassSurface>
    </div>
  );
}
