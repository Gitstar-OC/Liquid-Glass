/**
 * Verifies every built registry item installs into a project that compiles.
 *
 * The CLI cannot be exercised offline (upstream shadcn items live on
 * ui.shadcn.com), so this checks the same invariant statically: for each item,
 * the transitive file set must close over its own imports. Anything left
 * dangling is an import that would 404 at install time.
 *
 * Run with: npm run registry:verify
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "public/r");
const IMPORT_RE = /from\s+"([^"]+)"/g;

/** Provided by `shadcn init` in every consumer project. */
const PROVIDED_BY_INIT = new Set(["@/lib/utils"]);

/** Internal registry URLs always look like <origin>/r/<item>.json. */
const INTERNAL_DEP = /^https?:\/\/[^/]+\/r\/([a-z0-9-]+)\.json$/;

/**
 * `@/lib/glass` is imported, `@lib/glass.ts` is installed — compare both
 * extensionless.
 */
const toTarget = (spec) =>
  spec.replace(/^@\//, "@").replace(/\.(tsx?|jsx?)$/, "");

const load = (name) =>
  JSON.parse(readFileSync(join(OUT, `${name}.json`), "utf8"));

/** An item plus everything it pulls in from this registry, transitively. */
function closure(name, seen = new Set()) {
  if (seen.has(name)) return { files: [], upstream: new Set() };
  seen.add(name);

  const item = load(name);
  const files = [...(item.files ?? [])];
  const upstream = new Set();

  for (const dep of item.registryDependencies ?? []) {
    const match = INTERNAL_DEP.exec(dep);
    if (match) {
      const nested = closure(match[1], seen);
      files.push(...nested.files);
      nested.upstream.forEach((u) => upstream.add(u));
    } else {
      upstream.add(dep);
    }
  }
  return { files, upstream };
}

const catalog = JSON.parse(
  readFileSync(join(process.cwd(), "registry.json"), "utf8"),
);
const failures = [];
let installs = 0;

for (const { name } of catalog.items) {
  const { files, upstream } = closure(name);
  const targets = new Set(files.map((f) => toTarget(f.target)));

  for (const f of files) {
    if (!f.content) {
      failures.push(`${name}: ${f.path} was built without content`);
      continue;
    }
    installs++;

    for (const [, spec] of f.content.matchAll(IMPORT_RE)) {
      if (!spec.startsWith("@/")) continue;
      if (PROVIDED_BY_INIT.has(spec)) continue;
      if (targets.has(toTarget(spec))) continue;

      // `@/components/ui/x` is satisfied by the bare `x` registryDependency.
      if (spec.startsWith("@/components/ui/")) {
        const ui = spec.replace("@/components/ui/", "");
        if (upstream.has(ui)) continue;
        failures.push(
          `${name}: ${f.path} imports ${spec} but nothing declares the "${ui}" shadcn dependency`,
        );
        continue;
      }

      failures.push(
        `${name}: ${f.path} imports ${spec} → ${toTarget(
          spec,
        )}, which the item does not install`,
      );
    }
  }
}

// The build output must exist for every item in the manifest.
const built = new Set(readdirSync(OUT).filter((f) => f.endsWith(".json")));
for (const { name } of catalog.items) {
  if (!built.has(`${name}.json`)) {
    failures.push(
      `missing build output public/r/${name}.json — run npm run registry:build`,
    );
  }
}

if (failures.length) {
  console.error(`✖ ${failures.length} registry problem(s):\n`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  `✔ ${catalog.items.length} items verified — ${installs} file installs, no dangling imports`,
);
