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

/** stagger hues to provide more contrast/distinction between successive colors */
export const palette = {
  light: [
    "hsl(30, 10%, 80%)",
    "hsl(180, 50%, 80%)",
    "hsl(280, 50%, 80%)",
    "hsl(20, 50%, 80%)",
    "hsl(100, 50%, 80%)",
    "hsl(200, 50%, 80%)",
    "hsl(300, 50%, 80%)",
    "hsl(140, 50%, 80%)",
    "hsl(240, 50%, 80%)",
    "hsl(340, 50%, 80%)",
  ] as const,
  dark: [
    "hsl(30, 5%, 50%)",
    "hsl(180, 30%, 50%)",
    "hsl(280, 30%, 50%)",
    "hsl(20, 30%, 50%)",
    "hsl(100, 30%, 50%)",
    "hsl(200, 30%, 50%)",
    "hsl(300, 30%, 50%)",
    "hsl(140, 30%, 50%)",
    "hsl(240, 30%, 50%)",
    "hsl(340, 30%, 50%)",
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
    if (value.trim()) {
      /** add value to color map (if not already defined) */
      map[value] ??= hues[hueIndex++ % hues.length]!;
    }
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
