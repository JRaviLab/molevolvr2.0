import { cos, sin } from "@/util/math";

export type Point = { x: number; y: number };

/** make regular polygon or star */
const makePolygon = (sides: number, starInset = 1, radius = 1, rotate = 0) =>
  Array(sides)
    .fill(null)
    .map((_, index) => {
      const angle = -90 + 360 * (index / sides) + rotate;
      const scale = index % 2 === 0 ? 1 : starInset;
      return { x: cos(angle) * radius * scale, y: sin(angle) * radius * scale };
    })
    .flat();

/** https://www.jdawiseman.com/papers/easymath/surds_star_inner_radius.html */

/** shape options */
const palette = [
  /** circle */
  makePolygon(50),
  /** square */
  makePolygon(4, 1, 1.1, 45),
  /** diamond */
  makePolygon(4),
  /** triangle */
  makePolygon(3),
  /** pentagon */
  makePolygon(5),
  /** hexagon */
  makePolygon(6, 1, 1, 30),
  /** four point star */
  makePolygon(8, 0.35, 1.1),
  /** five point star */
  makePolygon(10, 0.382, 1.1),
  /** rhombus */
  [
    { x: -0.5, y: -0.75 },
    { x: 1, y: -0.75 },
    { x: 0.5, y: 0.75 },
    { x: -1, y: 0.75 },
  ],
];

/** map enumerated values to shapes */
export const getShapeMap = <Value extends string>(values: Value[]) => {
  /** get first (neutral) shape and remaining shapes */
  const [neutral = "", ...shapes] = palette;
  let index = 0;
  /** make blank value a neutral shape */
  const map = { "": neutral } as Record<Value, Point[]>;
  for (const value of values)
    if (value.trim())
      /** add value to shape map (if not already defined) */
      map[value] ??= shapes[index++ % shapes.length]!;
  return map;
};

/** join shape coordinates to svg polygon string */
export const shapeToString = (
  shape?: Point[],
  centerX = 0,
  centerY = 0,
  scale = 1,
) => shapeToList(shape, centerX, centerY, scale).join(" ");

/** join shape coordinates to flat list of coordinates */
export const shapeToList = (
  shape?: Point[],
  centerX = 0,
  centerY = 0,
  scale = 1,
) =>
  shape?.map(({ x, y }) => [centerX + x * scale, centerY + y * scale]).flat() ??
  [];
