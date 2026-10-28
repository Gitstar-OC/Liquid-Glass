"use client";

import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { GlassButton as Button } from "@/components/glass/glass-button";
import { cn } from "@/lib/utils";

export const INSTALL_COMMAND =
  "npx shadcn@latest add http://localhost:3000/r/liquid-glass.json";
export interface InstallCommandProps {
  command?: string;
  className?: string;
  compact?: boolean;
}
export function InstallCommand({
  command = INSTALL_COMMAND,
  className,
  compact = false,
}: InstallCommandProps) {
  const [copiedCommand, setCopiedCommand] = useState("");
  const [failed, setFailed] = useState(false);
  const copied = copiedCommand === command;
  return (
    <div
      className={cn(
        "glass-field overflow-hidden rounded-[20px] border-0",
        className,
      )}
    >
      <div className="flex min-h-12 items-center gap-3 px-4 py-2">
        {!compact && <Terminal className="size-4 shrink-0 text-muted-foreground/80" />}
        <code className="min-w-0 flex-1 overflow-x-auto py-1 font-mono text-xs text-foreground/80 [scrollbar-width:thin]">
          {command}
        </code>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={copied ? "Copied" : "Copy install command"}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(command);
              setCopiedCommand(command);
              setFailed(false);
            } catch {
              setFailed(true);
            }
          }}
        >
          {copied ? <Check /> : <Copy />}
        </Button>
      </div>
      {failed && (
        <p role="status" className="px-4 pb-3 text-xs text-muted-foreground">
          Select the command to copy it.
        </p>
      )}
    </div>
  );
}
