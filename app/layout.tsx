import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";

const manrope = localFont({ src: "./fonts/Manrope-Variable.ttf", variable: "--font-manrope", weight: "200 800", display: "swap" });
import { GlassThemeProvider } from "@/components/glass/glass-theme-provider";
import { GlassSettingsProvider } from "@/components/glass-scene";
import { GlassToaster } from "@/components/glass/glass-toaster";

export const metadata: Metadata = {
  title: "Liquid Glass — Built for the web",
  description:
    "Liquid glass components for React and shadcn/ui. Explore the components or shape your own glass in the playground.",
};

// Applies the persisted glass theme before first paint to avoid a flash.
const themeInitScript = `(function(){try{var m=localStorage.getItem("liquid-glass-mode")||"light";var d=m==="dark"||(m==="system"&&!window.matchMedia("(prefers-color-scheme: light)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} h-full font-sans antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <GlassThemeProvider>
          <GlassSettingsProvider performance={{ maxActiveSurfaces: 5, frameRate: 30 }}>
            {children}
            <GlassToaster position="bottom-right" />
          </GlassSettingsProvider>
        </GlassThemeProvider>
      </body>
    </html>
  );
}
