import { useState } from "react";
import { useAtomValue } from "jotai";
import { useDeepCompareEffect } from "@reactuses/core";
import { darkModeAtom } from "@/components/DarkMode";
import colors from "./colors.json";

/**
 * https://tailwindcss.com/docs/customizing-colors
 * https://github.com/tailwindlabs/tailwindcss/blob/9c59b07fb3648a395bb9fb9ea24f3d090964845c/packages/tailwindcss/src/compat/colors.ts
 */

/** stagger hues to provide more contrast/distinction between successive colors */
const hueOrder = [
  "emerald",
  "purple",
  "orange",
  "blue",
  "rose",
  "green",
  "amber",
  "sky",
  "violet",
  "pink",
  "lime",
  "cyan",
  "fuchsia",
  "red",
  "teal",
  "indigo",
] as const;

const lightNeutral = "hsl(30, 10%, 80%)";
const darkNeutral = "hsl(30, 5%, 50%)";

export const palette = {
  light: [
    lightNeutral,
    ...hueOrder
      .map((hue) => colors[hue]["100"])
      .map((color) => `color-mix(in hsl, ${color}, #808080 20%)`),
  ] as const,
  dark: [
    darkNeutral,
    ...hueOrder
      .map((hue) => colors[hue]["900"])
      .map((color) => `color-mix(in hsl, ${color}, #808080 50%)`),
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
