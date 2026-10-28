"use client";
import * as React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
export function GlassAccordion({
  className,
  ...props
}: React.ComponentProps<typeof Accordion>) {
  return (
    <Accordion
      className={cn(
        "glass-chip overflow-hidden rounded-[20px] px-5",
        className,
      )}
      {...props}
    />
  );
}
export {
  AccordionItem as GlassAccordionItem,
  AccordionTrigger as GlassAccordionTrigger,
  AccordionContent as GlassAccordionContent,
};
