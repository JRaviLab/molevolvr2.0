import { cos, sin } from "@/util/math";

/** make regular polygon or star */
const makePolygon = (sides: number, starInset = 1) =>
  Array(sides)
    .fill(null)
    .map((_, index) => {
      const angle = -90 + 360 * (index / sides);
      const radius = index % 2 === 0 ? 1 : starInset;
      return [cos(angle) * radius, sin(angle) * radius];
    })
    .flat();

/** shape options */
const palette = [
  /** circle */
  makePolygon(50),
  /** square */
  [-0.8, -0.8, 0.8, -0.8, 0.8, 0.8, -0.8, 0.8],
  /** diamond */
  makePolygon(4),
  /** triangle */
  makePolygon(3),
  /** pentagon */
  makePolygon(5),
  /** hexagon */
  makePolygon(6),
  /** four pointed star */
  makePolygon(8, 0.5),
  /**
   * five pointed star
   * https://www.jdawiseman.com/papers/easymath/surds_star_inner_radius.html
   */
  makePolygon(10, 0.38196601125010515),
  /** rhombus */
  [-0.5, -0.75, 1, -0.75, 0.5, 0.75, -1, 0.75],
];

/** map enumerated values to shapes */
export const getShapeMap = <Value extends string>(values: Value[]) => {
  /** get first (neutral) shape and remaining shapes */
  const [neutral = "", ...shapes] = palette;
  let index = 0;
  /** make blank value a neutral shape */
  const map = { "": neutral } as Record<Value, number[]>;
  for (const value of values)
    if (value.trim())
      /** add value to shape map (if not already defined) */
      map[value] ??= shapes[index++ % shapes.length]!;
  return map;
};
