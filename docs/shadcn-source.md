# shadcn/ui reference

The site structure and component polish follow the official [shadcn/ui](https://github.com/shadcn-ui/ui) source, retrieved at commit `617134d5810bba521803b3ed787190bacbb80b35`.

- `components/ui/button.tsx` and `components/ui/slider.tsx` adapt `apps/v4/registry/new-york-v4/ui/`.
- The shared page header, preview frames, settings fields, documentation navigation, and code panels follow the composition patterns in `apps/v4/components/`.
- Liquid glass optics and the `components/glass/` API remain this project's implementation.

Local adaptations include the project's radius scale, selectable text, single-value slider default, and shared site controls. The upstream MIT license is preserved in [shadcn-LICENSE.md](./shadcn-LICENSE.md).
