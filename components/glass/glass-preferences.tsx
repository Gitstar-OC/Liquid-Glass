"use client";

import { useId, useState } from "react";
import { Check } from "lucide-react";
import {
  GlassSurface,
  type GlassSurfaceProps,
} from "@/components/glass/glass-surface";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { GlassButton as Button } from "@/components/glass/glass-button";
import { GlassInput as Input } from "@/components/glass/glass-input";
import { Field, FieldGroup, FieldLabel as Label, FieldDescription, FieldContent } from "@/components/ui/field";
import { GlassSwitch as Switch } from "@/components/glass/glass-switch";
import { cn } from "@/lib/utils";

export interface GlassPreferencesValue {
  name: string;
  notifications: boolean;
}

/** Ordinary shadcn controls inside one optical surface. Saving stays with the host app. */
export function GlassPreferences({
  defaultValue = { name: "Studio", notifications: true },
  onSave,
  className,
  ...surfaceProps
}: Omit<
  GlassSurfaceProps,
  "children" | "asChild" | "onSubmit" | "defaultValue"
> & {
  defaultValue?: GlassPreferencesValue;
  onSave?: (value: GlassPreferencesValue) => void | Promise<void>;
}) {
  const id = useId();
  const [name, setName] = useState(defaultValue.name);
  const [notifications, setNotifications] = useState(
    defaultValue.notifications,
  );
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  return (
    <GlassSurface
      {...surfaceProps}
      asChild
      className={cn("w-full max-w-[352px]", className)}
    >
      <Card className="gap-0 overflow-visible py-0 ring-0 shadow-none border-0 [--card-spacing:--spacing(6)]">
        <CardHeader className="gap-2 pt-6 pb-6">
          <CardTitle className="text-xl leading-tight tracking-tight">
            Preferences
          </CardTitle>
          <CardDescription className="max-w-64 text-[13px] leading-5">
            Workspace settings.
          </CardDescription>
        </CardHeader>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            if (status === "saving") return;
            setStatus("saving");
            try {
              await onSave?.({ name: name.trim(), notifications });
              setStatus("saved");
            } catch {
              setStatus("error");
            }
          }}
        >
          <CardContent className="pb-6"><FieldGroup>
            <Field>
              <Label htmlFor={`${id}-name`} className="text-[13px]">
                Workspace name
              </Label>
              <Input
                id={`${id}-name`}
                name="workspace"
                required
                maxLength={48}
                pattern={".*\\S.*"}
                value={name}
                disabled={status === "saving"}
                className="w-full"
                onChange={(event) => {
                  setName(event.target.value);
                  setStatus("idle");
                }}
              />
            </Field>
            <Field orientation="horizontal" className="items-center">
              <FieldContent>
                <Label htmlFor={`${id}-notifications`} className="text-[13px]">
                  Notifications
                </Label>
                <FieldDescription id={`${id}-hint`}>
                  Updates and activity from your team.
                </FieldDescription>
              </FieldContent>
              <Switch
                id={`${id}-notifications`}
                aria-describedby={`${id}-hint`}
                checked={notifications}
                disabled={status === "saving"}
                onCheckedChange={(value) => {
                  setNotifications(value);
                  setStatus("idle");
                }}
              />
            </Field>
          </FieldGroup></CardContent>
          <CardFooter className="flex-wrap justify-between gap-3 bg-transparent py-4">
            <p
              role="status"
              className="min-w-0 max-w-36 text-xs leading-5 text-foreground/60"
            >
              {status === "saved"
                ? "Preferences saved."
                : status === "saving"
                  ? "Saving…"
                  : status === "error"
                    ? "Couldn’t save. Try again."
                    : ""}
            </p>
            <Button
              type="submit"
              disabled={status === "saving"}
              variant="default"
              className="px-4"
            >
              {status === "saved" && <Check className="size-3.5" />}
              {status === "saved" ? "Saved" : "Save changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </GlassSurface>
  );
}
