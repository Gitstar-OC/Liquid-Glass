<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Liquid Glass project rules

Read `DESIGN.md` and `docs/glass-performance.md` before changing site UI or the
renderer. Use the shared glass controls and preview toolbar, preserve the 3–5
active-lens budget, remove marketing filler, and record performance evidence for
renderer changes. Keep the shadcn registry installable after shared-file changes.
