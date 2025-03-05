import { useState } from "react";
import { useAtomValue } from "jotai";
import { useDeepCompareEffect } from "@reactuses/core";
import { darkModeAtom } from "@/components/DarkMode";

/**
 * references:
 *
 * https://tailwindcss.com/docs/customizing-colors
 * https://github.com/tailwindlabs/tailwindcss/blob/main/src/public/colors.js
 * https://www.materialpalette.com/colors
 * https://gist.github.com/kawanet/a880c83f06d6baf742e45ac9ac52af96?permalink_comment_id=5387840#gistcomment-5387840
 */

/**
 * stagger hues around color wheel to provide more contrast/distinction between
 * successive colors
 */
const hues = [
  180 + 0 * 72 + 0 * 120,
  180 + 0 * 72 + 1 * 120,
  180 + 0 * 72 + 2 * 120,
  180 + 1 * 72 + 0 * 120,
  180 + 1 * 72 + 1 * 120,
  180 + 1 * 72 + 2 * 120,
  180 + 2 * 72 + 0 * 120,
  180 + 2 * 72 + 1 * 120,
  180 + 2 * 72 + 2 * 120,
  180 + 3 * 72 + 0 * 120,
  180 + 3 * 72 + 1 * 120,
  180 + 3 * 72 + 2 * 120,
  180 + 4 * 72 + 0 * 120,
  180 + 4 * 72 + 1 * 120,
  180 + 4 * 72 + 2 * 120,
].map((v) => v % 360);

export const palette = {
  light: [
    "hsl(30, 10%, 85%)",
    ...hues.map((hue) => `hsl(${hue}, 50%, 85%)`),
  ] as const,
  dark: [
    "hsl(30, 5%, 50%)",
    ...hues.map((hue) => `hsl(${hue}, 30%, 50%)`),
  ] as const,
};

/** map enumerated values to colors */
export const getColorMap = <Value extends string>(
  values: Value[],
  level: keyof typeof palette = "light",
) => {
  /** get first (neutral) hue and remaining (colorful) hues */
  const [neutral = "", ...hues] = palette[level];
  let hueIndex = 0;
  /** make blank value a neutral color */
  const map = { "": neutral } as Record<Value, string>;
  for (const value of values)
    if (value.trim())
      /** add value to color map (if not already defined) */
      map[value] ??= hues[hueIndex++ % hues.length]!;

  return map;
};

/** reactive color map */
export const useColorMap = <Value extends string>(
  values: Value[],
  shade: "dark" | "light" | "mode" | "invert" = "mode",
) => {
  /** dark mode state */
  const darkMode = useAtomValue(darkModeAtom);

  /** should use dark or light */
  if (shade === "mode") shade = darkMode ? "dark" : "light";
  else if (shade === "invert") shade = darkMode ? "light" : "dark";

  /** map state */
  const [map, setMap] = useState(() => getColorMap(values, shade));

  /** update map */
  useDeepCompareEffect(() => {
    setMap(getColorMap(values, shade));
  }, [values, shade]);

  return map;
};
