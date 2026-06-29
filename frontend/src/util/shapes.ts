import { cos, sin } from "@/util/math";

type Point = { x: number; y: number };

/** make regular polygon or star */
const makePolygon = (sides: number, starInset = 1) =>
  Array(sides)
    .fill(null)
    .map((_, index) => {
      const angle = -90 + 360 * (index / sides);
      const radius = index % 2 === 0 ? 1 : starInset;
      return { x: cos(angle) * radius, y: sin(angle) * radius };
    })
    .flat();

/** shape options */
const palette = [
  /** circle */
  makePolygon(50),
  /** square */
  [
    { x: -0.85, y: -0.85 },
    { x: 0.85, y: -0.85 },
    { x: 0.85, y: 0.85 },
    { x: -0.85, y: 0.85 },
  ],
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
  makePolygon(10, 0.382),
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
