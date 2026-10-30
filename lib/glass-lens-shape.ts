import { lensSurface, type GlassShape } from "@/lib/glass";

export interface GlassBeak {
  side: "top" | "right" | "bottom" | "left";
  /** Position along the edge, from zero to one. */
  offset?: number;
  width?: number;
  height?: number;
}
export interface ControlLensShape {
  shape?: GlassShape;
  beak?: GlassBeak;
  /** Fixed CSS-pixel source-color shoulder for larger panels; controls omit it. */
  rimWidth?: number;
}

/** One smooth union, including its normals: the beak is never a second layer. */
export function createControlLensSurface(
  hw: number, hh: number, radius: number,
  geometry: ControlLensShape,
) {
  const sampleBody = (x: number, y: number) => lensSurface(x, y, hw, hh, radius, geometry.shape);
  const beak = geometry.beak;
  if (!beak) return sampleBody;
  const vertical = beak.side === "top" || beak.side === "bottom";
  const sign = beak.side === "top" || beak.side === "left" ? -1 : 1;
  const along = vertical ? hw : hh, across = vertical ? hh : hw;
  const width = Math.max(6, Math.min(beak.width ?? 14, along));
  const height = Math.max(2, Math.min(beak.height ?? 5, 12));
  const margin = Math.max(0, along - radius - width / 2);
  const offset = Math.max(-margin, Math.min(margin, ((beak.offset ?? 0.5) * 2 - 1) * along));
  // The base sits inside the body. Rounded triangle + smooth union removes
  // the seam and gives the small pointer its soft native-style shoulders.
  const vertices = [[-width / 2, -3], [width / 2, -3], [0, height - 0.65]];
  return (x: number, y: number) => {
    const body = sampleBody(x, y);
    const px = (vertical ? x : y) - offset;
    const py = (vertical ? y : x) * sign - across;
    // Only a tiny neighborhood of the edge can contain the joined pointer.
    // Keep its vertices out of the per-pixel allocation path.
    if (py < -6 || py > height + 3 || Math.abs(px) > width / 2 + 6) return body;
    let distance2 = Infinity, dx = 0, dy = 0, inside = true;
    for (let i = 0; i < 3; i++) {
      const a = vertices[i], b = vertices[(i + 1) % 3];
      const ex = b[0] - a[0], ey = b[1] - a[1];
      const vx = px - a[0], vy = py - a[1];
      const t = Math.max(0, Math.min(1, (vx * ex + vy * ey) / (ex * ex + ey * ey)));
      const qx = vx - ex * t, qy = vy - ey * t;
      const d = qx * qx + qy * qy;
      if (d < distance2) { distance2 = d; dx = qx; dy = qy; }
      if (ex * vy - ey * vx < 0) inside = false;
    }
    const length = Math.max(0.0001, Math.sqrt(distance2));
    const direction = inside ? -1 : 1;
    const triangle = direction * length - 0.65;
    const tx = dx / length * direction, ty = dy / length * direction;
    const nx = vertical ? tx : ty * sign, ny = vertical ? ty * sign : tx;
    const h = Math.max(0, Math.min(1, 0.5 + 0.5 * (triangle - body.distance) / 3));
    const gx = nx * (1 - h) + body.nx * h;
    const gy = ny * (1 - h) + body.ny * h;
    const normal = Math.max(0.0001, Math.hypot(gx, gy));
    return {
      distance: triangle * (1 - h) + body.distance * h - 3 * h * (1 - h),
      nx: gx / normal,
      ny: gy / normal,
    };
  };
}
