/**
 * https://tailwindcss.com/docs/customizing-colors
 * https://github.com/tailwindlabs/tailwindcss/blob/main/src/public/colors.js
 * https://www.materialpalette.com/colors
 */
const palette = [
  "#78909c",
  "#ef5350",
  "#ec407a",
  "#ab47bc",
  "#7e57c2",
  "#5c6bc0",
  "#42a5f5",
  "#29b6f6",
  "#26c6da",
  "#26a69a",
  "#66bb6a",
  "#9ccc65",
  "#ffca28",
  "#ffa726",
  "#ff7043",
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
