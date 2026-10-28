"use client";

import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { GlassButton as Button } from "@/components/glass/glass-button";
import { cn } from "@/lib/utils";

export function CodeBlock({
  code,
  title = "tsx",
  className,
}: {
  code: string;
  title?: string;
  className?: string;
}) {
  const [copiedCode, setCopiedCode] = useState("");
  const copied = copiedCode === code;
  const [failed, setFailed] = useState(false);
  return (
    <div
      className={cn(
        "glass-field overflow-hidden rounded-[20px] border-0",
        className,
      )}
    >
      <div className="flex h-11 items-center gap-2 px-4 text-xs text-muted-foreground">
        <Terminal className="size-3.5" />
        <span className="flex-1 font-mono">{title}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={copied ? "Code copied" : "Copy code"}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopiedCode(code);
              setFailed(false);
            } catch {
              setFailed(true);
            }
          }}
        >
          {copied ? <Check /> : <Copy />}
        </Button>
      </div>
      <pre
        tabIndex={0}
        className="max-h-[32rem] overflow-auto p-4 font-mono text-xs leading-6 text-foreground/80"
      >
        <code>{code}</code>
      </pre>
      {failed && (
        <p role="status" className="px-4 pb-3 text-xs text-muted-foreground">
          Select the code to copy it.
        </p>
      )}
    </div>
  );
}
