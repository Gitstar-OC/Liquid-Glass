"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Component, BookOpen, SlidersHorizontal } from "lucide-react";
import { GlassButton as Button } from "@/components/glass/glass-button";
import {
  Dialog,
  GlassDialogContent as DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/glass/glass-dialog";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { COMPONENT_CATALOGUE } from "@/components/gallery/catalogue";

export function SiteSearch() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const visit = (href: string) => {
    setOpen(false);
    router.push(href);
  };
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        aria-label="Search documentation"
        onClick={() => setOpen(true)}
        className="size-10 gap-2 p-0 text-muted-foreground lg:w-auto lg:px-3"
      >
        <Search className="size-3.5" />
        <span className="hidden lg:inline">Search docs…</span>
        <kbd className="hidden rounded bg-foreground/5 px-1 text-[10px] lg:inline">
          ⌘ K
        </kbd>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="top-[20%] translate-y-0 p-0 sm:max-w-lg"
        >
          <DialogTitle className="sr-only">Search documentation</DialogTitle>
          <DialogDescription className="sr-only">
            Find a glass component or page.
          </DialogDescription>
          <Command className="bg-transparent">
            <CommandInput
              aria-label="Search documentation"
              placeholder="Find a component…"
              className="h-10"
            />
            <CommandList className="max-h-80">
              <CommandEmpty>No components found.</CommandEmpty>
              <CommandGroup heading="Get started">
                <CommandItem onSelect={() => visit("/docs")}>
                  <BookOpen />
                  Documentation
                </CommandItem>
                <CommandItem onSelect={() => visit("/playground")}>
                  <SlidersHorizontal />
                  Playground
                </CommandItem>
              </CommandGroup>
              <CommandGroup heading="Components">
                {COMPONENT_CATALOGUE.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`${item.title} ${item.group}`}
                    onSelect={() => visit(`/docs/${item.id}`)}
                  >
                    <Component />
                    <span>{item.title}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {item.group}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
