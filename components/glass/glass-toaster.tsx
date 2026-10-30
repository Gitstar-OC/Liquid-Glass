"use client";

import * as React from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";
import { GlassSurface } from "@/components/glass/glass-surface";
import { useGlassTheme } from "@/components/glass/glass-theme-provider";

/** Scene-aware glass notifications, with a lightweight finish outside a scene. */
export function GlassToaster({ ...props }: ToasterProps) {
  const { resolvedMode } = useGlassTheme();

  return (
    <Sonner
      theme={resolvedMode}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "transparent",
          "--normal-text": "var(--foreground)",
          "--normal-border": "transparent",
          "--border-radius": "1rem",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "rounded-2xl text-foreground",
        },
      }}
      {...props}
    />
  );
}

export interface GlassToastOptions {
  /** Reuse an ID to update a notification rather than stacking duplicates. */
  id?: string | number;
  toasterId?: string;
  description?: string;
  image?: { src: string; alt: string };
  duration?: number;
  sceneRef?: React.RefObject<HTMLElement | null>;
  action?: { label: string; onClick: () => void };
}

export function glassToast(message: string, options: GlassToastOptions = {}) {
  return toast.custom(
    (id) => (
      <GlassToast
        message={message}
        {...options}
        onDismiss={() => toast.dismiss(id)}
      />
    ),
    {
      id: options.id,
      duration: options.duration ?? 5000,
      toasterId: options.toasterId,
      unstyled: true,
      className: "glass-toast-host",
    },
  );
}

export function GlassToast({
  message,
  description,
  image,
  sceneRef,
  action,
  onDismiss,
}: { message: string; onDismiss?: () => void } & GlassToastOptions) {
  const { resolvedMode } = useGlassTheme();
  return (
    <GlassSurface
      kind="toast"
      shape="squircle"
      radius={28}
      mode={resolvedMode}
      sceneRef={sceneRef}
      className="flex w-[var(--width,356px)] max-w-[calc(100vw-2rem)] items-center gap-3 p-4"
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image.src}
          alt={image.alt}
          width={44}
          height={44}
          className="size-11 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <InfoIcon className="size-5 shrink-0 opacity-70" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold">{message}</p>
        {description && (
          <p className="mt-1 text-xs leading-[18px] text-foreground/75">
            {description}
          </p>
        )}
        {action && (
          <button
            className="mt-2 text-xs font-medium underline underline-offset-4"
            onClick={() => {
              action.onClick();
              onDismiss?.();
            }}
          >
            {action.label}
          </button>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          aria-label="Dismiss notification"
          className="-mr-1 grid size-8 shrink-0 place-items-center rounded-full opacity-65 hover:bg-foreground/5 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={onDismiss}
        >
          <XIcon className="size-3" />
        </button>
      )}
    </GlassSurface>
  );
}
