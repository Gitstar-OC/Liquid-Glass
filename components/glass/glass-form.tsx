"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Field, FieldGroup, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
interface FieldContextValue { id: string; invalid: boolean; describedBy?: string; }
const FieldContext = React.createContext<FieldContextValue | null>(null);
export function GlassForm({ className, children, ...props }: React.ComponentProps<"form">) {
  return <form className={cn(className)} {...props}><FieldGroup>{children}</FieldGroup></form>;
}
export function GlassFormField({ label, description, error, children, className, id, ...props }: Omit<React.ComponentProps<"div">,"children"> & { label:string; description?:string; error?:string; children:React.ReactNode; }) {
  const generated = React.useId();
  const fieldId = id ?? generated;
  const describedBy = error ? `${fieldId}-error` : description ? `${fieldId}-description` : undefined;
  return <FieldContext.Provider value={{ id:fieldId, invalid:!!error, describedBy }}><Field data-invalid={!!error || undefined} className={className} {...props}>
    <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>{children}
    {error ? <FieldError id={`${fieldId}-error`}>{error}</FieldError> : description ? <FieldDescription id={`${fieldId}-description`}>{description}</FieldDescription> : null}
  </Field></FieldContext.Provider>;
}
export function useGlassFormField() { return React.useContext(FieldContext); }
