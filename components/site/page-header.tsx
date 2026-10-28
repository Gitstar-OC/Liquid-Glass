import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shared page hierarchy, following the shadcn/ui page-header composition. */
export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  centered = false,
  className,
}: {
  title: string;
  description: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  centered?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 py-10 sm:py-14",
        centered && "items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <div className="text-xs font-medium text-muted-foreground">
          {eyebrow}
        </div>
      )}
      <h1
        className={cn(
          "max-w-3xl text-balance text-4xl font-semibold tracking-[-.04em] sm:text-5xl sm:leading-[1.08]",
          centered && "sm:text-[60px]",
        )}
      >
        {title}
      </h1>
      <p className="max-w-xl text-pretty text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
        {description}
      </p>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 pt-2">{actions}</div>
      )}
    </div>
  );
}
