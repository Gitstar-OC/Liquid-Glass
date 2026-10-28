import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface RegistryItem {
  name: string;
  type: string;
  title?: string;
  description?: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files?: { path: string; type: string; target?: string; content?: string }[];
  css?: Record<string, Record<string, Record<string, string>>>;
}

export interface Registry {
  $schema: string;
  name: string;
  homepage: string;
  items: RegistryItem[];
}

export const ORIGIN = (
  process.env.REGISTRY_ORIGIN ?? "http://localhost:3000"
).replace(/\/$/, "");

export const installCommand = (name: string) =>
  `npx shadcn@latest add ${ORIGIN}/r/${name}.json`;

let cache: Registry | null = null;
const built = new Map<string, RegistryItem>();

/** Where `shadcn build` writes the item JSON that is actually published. */
const BUILT_DIR = "public/r";

/** Production caches the manifest; development sees newly generated registry items. */
export function getRegistry(): Registry {
  if (!cache || process.env.NODE_ENV === "development") {
    cache = JSON.parse(
      readFileSync(
        join(process.cwd(), /*turbopackIgnore: true*/ "registry.json"),
        "utf8",
      ),
    ) as Registry;
  }
  return cache;
}

export function getItem(slug: string): RegistryItem | undefined {
  return getRegistry().items.find((item) => item.name === slug);
}

export function getItems(): RegistryItem[] {
  return getRegistry().items;
}

/** The file whose source is most worth showing on a docs page. */
export function primaryFile(item: RegistryItem) {
  return item.files?.find((f) => f.path.endsWith(".tsx")) ?? item.files?.[0];
}

/**
 * The published source of the primary file, read from the built registry
 * rather than the working tree — so the docs show exactly the bytes that
 * `shadcn add` will write, not whatever happens to be on disk.
 */
export function primarySource(item: RegistryItem): string {
  let builtItem = built.get(item.name);
  if (!builtItem) {
    try {
      builtItem = JSON.parse(
        readFileSync(
          join(
            process.cwd(),
            BUILT_DIR,
            /*turbopackIgnore: true*/ `${item.name}.json`,
          ),
          "utf8",
        ),
      ) as RegistryItem;
    } catch {
      return "";
    }
    built.set(item.name, builtItem);
  }
  return primaryFile(builtItem)?.content ?? "";
}

/** `glass-dialog` -> `Glass Dialog`, for items without an explicit title. */
export function humanize(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
