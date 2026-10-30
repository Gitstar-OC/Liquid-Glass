"use client";

import { useId, useState, type ComponentProps, type ReactNode } from "react";
import { AlertDialog as Primitive } from "radix-ui";
import { GlassIcon, type GlassIconName } from "@/components/glass/glass-icons";
import {
  GlassSurface,
  type GlassSurfaceProps,
} from "@/components/glass/glass-surface";
import { GlassButton } from "@/components/glass/glass-button";
import { GlassCheckbox } from "@/components/glass/glass-checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export interface GlassPowerDialogProps extends ComponentProps<
  typeof Primitive.Root
> {
  container?: HTMLElement | null;
  title?: string;
  description?: string;
  confirmLabel?: string;
  trigger?: ReactNode;
  onConfirm?: (options: { reopenWindows: boolean }) => void;
}
export function GlassPowerDialog({
  container,
  title = "Ready to shut down?",
  description = "Your open windows can be restored when you sign in again.",
  confirmLabel = "Shut down",
  trigger,
  onConfirm,
  ...props
}: GlassPowerDialogProps) {
  return (
    <Primitive.Root {...props}>
      {trigger && <Primitive.Trigger asChild>{trigger}</Primitive.Trigger>}
      <Primitive.Portal container={container}>
        <Primitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/15",
            container && "absolute rounded-[20px]",
          )}
        />
        <Primitive.Content
          className={cn(
            "fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-[300px] -translate-x-1/2 -translate-y-1/2 outline-none",
            container && "absolute",
          )}
        >
          <GlassSurface
            kind="alert-dialog"
            config={{ blur: 8 }}
            className="p-5"
          >
            <PowerContent
              modal
              title={title}
              description={description}
              confirmLabel={confirmLabel}
              onConfirm={onConfirm}
            />
          </GlassSurface>
        </Primitive.Content>
      </Primitive.Portal>
    </Primitive.Root>
  );
}
interface PowerContentProps {
  title?: string;
  description?: string;
  confirmLabel?: string;
  onConfirm?: (options: { reopenWindows: boolean }) => void;
  onCancel?: () => void;
  modal?: boolean;
}
function PowerContent({
  title = "Ready to shut down?",
  description = "Your open windows can be restored when you sign in again.",
  confirmLabel = "Shut down",
  onConfirm,
  onCancel,
  modal = false,
}: PowerContentProps) {
  const id = useId();
  const [reopenWindows, setReopenWindows] = useState(true);
  const titleNode = (
    <h3 className="text-[13px] font-semibold leading-5">{title}</h3>
  );
  const descriptionNode = (
    <p className="mt-1.5 text-xs leading-[18px] text-foreground/75">
      {description}
    </p>
  );
  const cancel = (
    <GlassButton variant="secondary" className="min-w-0" onClick={onCancel}>
      Cancel
    </GlassButton>
  );
  const confirm = (
    <GlassButton
      className="min-w-0"
      variant="primary"
      onClick={() => onConfirm?.({ reopenWindows })}
    >
      {confirmLabel}
    </GlassButton>
  );
  return (
    <div className="glass-power-content flex flex-col gap-3">
      <div className="grid size-12 place-items-center rounded-full bg-foreground/12">
        <GlassIcon name="power" className="size-7" strokeWidth={1.35} />
      </div>
      <div>
        {modal ? (
          <Primitive.Title asChild>{titleNode}</Primitive.Title>
        ) : (
          titleNode
        )}
        {modal ? (
          <Primitive.Description asChild>
            {descriptionNode}
          </Primitive.Description>
        ) : (
          descriptionNode
        )}
      </div>
      <Field orientation="horizontal" className="gap-2">
        <GlassCheckbox
          id={id}
          checked={reopenWindows}
          onCheckedChange={(value) => setReopenWindows(value === true)}
        />
        <FieldLabel htmlFor={id} className="text-[11px] font-normal leading-4">
          Reopen windows when signing in
        </FieldLabel>
      </Field>
      <div className="grid grid-cols-2 gap-2">
        {modal ? <Primitive.Cancel asChild>{cancel}</Primitive.Cancel> : cancel}
        {modal ? (
          <Primitive.Action asChild>{confirm}</Primitive.Action>
        ) : (
          confirm
        )}
      </div>
    </div>
  );
}
export interface GlassPowerPanelProps
  extends
    Omit<GlassSurfaceProps, "children" | "title">,
    Omit<PowerContentProps, "modal"> {}
/** The non-modal panel is useful for a component preview; it never traps focus. */
export function GlassPowerPanel({
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
  className,
  ...props
}: GlassPowerPanelProps) {
  return (
    <GlassSurface
      {...props}
      className={cn("w-full max-w-[300px] p-5", className)}
    >
      <PowerContent
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </GlassSurface>
  );
}
export type GlassPowerAction = "sleep" | "restart" | "shutdown";
export interface GlassPowerMenuProps extends Omit<
  GlassSurfaceProps,
  "kind" | "children"
> {
  onAction?: (action: GlassPowerAction) => void;
  container?: HTMLElement | null;
}
export function GlassPowerMenu({
  onAction,
  container,
  className,
  config,
  ...props
}: GlassPowerMenuProps) {
  return (
    <>
      <GlassSurface
        kind="card"
        surface="clear"
        config={config}
        className={cn("w-full max-w-[300px] p-5", className)}
        {...props}
      >
        <h3 className="text-[13px] font-semibold">Power</h3>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { id: "sleep", label: "Sleep", icon: "moon" as GlassIconName },
            {
              id: "restart",
              label: "Restart",
              icon: "restart" as GlassIconName,
            },
            {
              id: "shutdown",
              label: "Shut down",
              icon: "power" as GlassIconName,
            },
          ].map((item) => {
            const button = (
              <GlassButton
                key={item.id}
                type="button"
                shape="circle"
                aria-label={item.label}
                onClick={
                  item.id === "shutdown"
                    ? undefined
                    : () => onAction?.(item.id as GlassPowerAction)
                }
                className="size-14"
              >
                <GlassIcon name={item.icon} />
              </GlassButton>
            );
            return (
              <div key={item.id} className="flex flex-col items-center gap-2">
                {item.id === "shutdown" ? (
                  <GlassPowerDialog
                    trigger={button}
                    container={container}
                    onConfirm={() => onAction?.("shutdown")}
                  />
                ) : (
                  button
                )}
                <span className="text-xs">{item.label}</span>
              </div>
            );
          })}
        </div>
      </GlassSurface>
    </>
  );
}
