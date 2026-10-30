"use client";
import { GlassButton } from "@/components/glass/glass-button";
import { GlassIcon } from "@/components/glass/glass-icons";
import { useGlassTheme } from "@/components/glass/glass-theme-provider";
export function SiteThemeToggle() {
  const { resolvedMode, setMode } = useGlassTheme();
  const dark = resolvedMode === "dark";
  return (
    <GlassButton
      variant="ghost"
      shape="circle"
      className="size-10 shrink-0"
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setMode(dark ? "light" : "dark")}
    >
      <GlassIcon name={dark ? "sun" : "moon"} />
    </GlassButton>
  );
}
