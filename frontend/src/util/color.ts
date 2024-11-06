/**
 * https://www.materialpalette.com/colors
 * https://gist.github.com/kawanet/a880c83f06d6baf742e45ac9ac52af96
 * https://tailwindcss.com/docs/customizing-colors
 * https://github.com/tailwindlabs/tailwindcss/blob/main/src/public/colors.js
 */

const palette = [
  "#90a4ae",
  "#e57373",
  "#9575cd",
  "#4fc3f7",
  "#81c784",
  "#ffb74d",
  "#f06292",
  "#7986cb",
  "#4dd0e1",
  "#aed581",
  "#ff8a65",
  "#ba68c8",
  "#64b5f6",
  "#4db6ac",
  "#ffd54f",
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
      map[value] ??= colors[colorIndex++ % colors.length]!;
  return map;
};

/**
 * mix colors by particular amount in desired color space
 * https://stackoverflow.com/a/56348573/2180570
 */
export const mixColors = (
  colorA: string,
  colorB: string,
  mix = 0.5,
  space = "srgb",
) => {
  const style = `color-mix(in ${space}, ${colorA}, ${colorB} ${100 * mix}%)`;
  const div = document.createElement("div");
  if (!window.matchMedia(`@supports (color: ${style}`)) return colorA;
  div.style.color = style;
  document.body.append(div);
  const [r = 0, g = 0, b = 0] = window
    .getComputedStyle(div)
    .color.split(/\s/)
    .map(parseFloat)
    .filter((value) => !Number.isNaN(value));
  div.remove();
  const floatToHex = (value: number) =>
    Math.round(255 * value)
      .toString(16)
      .padStart(2, "0");
  return "#" + [r, g, b].map(floatToHex).join("");
};
