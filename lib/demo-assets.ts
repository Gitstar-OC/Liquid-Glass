/** Public photo URLs and source credits used by the website previews. */
export const DEMO_PHOTOS = {
  ice: {
    src: "/images/ice-1280.webp",
    alt: "Sculpted blue glacier ice with smooth dark creases",
    credit: "Xiao Lou",
    href: "https://unsplash.com/photos/abstract-blue-ice-formations-create-a-textured-pattern-rBDQ9WrnvUA",
  },
  ocean: {
    src: "/images/ocean-1280.webp",
    alt: "Blue ocean swells beneath a pale sky",
    credit: "Unsplash",
    href: "https://images.unsplash.com/photo-1518837695005-2083093ee35b",
  },
  coast: {
    src: "https://images.unsplash.com/photo-1593050989889-6a42797c191a?auto=format&fit=crop&w=1400&q=85",
    alt: "Turquoise waves meeting a rocky coastline",
    credit: "Mitchell Luo",
    href: "https://unsplash.com/photos/aerial-view-of-body-of-water-rqeHDhi4EJE",
  },
  dunes: {
    src: "/images/dunes-1280.webp",
    alt: "White sand dunes beneath distant mountains",
    credit: "Royce Fonseca",
    href: "https://unsplash.com/photos/white-sand-dunes-with-distant-mountains-under-a-pale-sky-4l1TgqxNjzA",
  },
  lake: {
    src: "/images/lake-1280.webp",
    alt: "A quiet lake between mountains",
    credit: "",
    href: "",
  },
} as const;

/** The calm backdrops approved for component demonstrations. */
export const CURATED_BACKDROPS = ["dunes", "lake"] as const;
export const DEFAULT_BACKDROP = "dunes" as const;
