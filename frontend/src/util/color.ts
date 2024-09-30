/**
 * https://www.materialpalette.com/colors
 * https://gist.github.com/kawanet/a880c83f06d6baf742e45ac9ac52af96
 * https://tailwindcss.com/docs/customizing-colors
 * https://github.com/tailwindlabs/tailwindcss/blob/main/src/public/colors.js
 */
const palette = [
  "#90a4ae",
  "#e57373",
  "#f06292",
  "#ba68c8",
  "#9575cd",
  "#7986cb",
  "#64b5f6",
  "#4fc3f7",
  "#4dd0e1",
  "#4db6ac",
  "#81c784",
  "#aed581",
  "#ffd54f",
  "#ffb74d",
  "#ff8a65",
];

/** map enumerated values to colors */
export const getColorMap = <Value extends string>(values: Value[]) => {
  /** get first (neutral) color and remaining (colorful) colors */
  const [neutral = "", ...colors] = palette;
  let colorIndex = 0;
  /** make blank value a neutral color */
  const map = { "": neutral } as Record<Value, string>;
  for (const value of values)
    if (value.trim())
      /** add value to color map (if not already defined) */
      map[value] ??= colors[(colorIndex++ * 3) % colors.length]!;
  return map;
};
