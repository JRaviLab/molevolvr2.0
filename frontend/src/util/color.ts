import { useState } from "react";
import { color, interpolateHsl } from "d3";
import { useAtomValue } from "jotai";
import { useDeepCompareEffect } from "@reactuses/core";
import { darkModeAtom } from "@/components/DarkMode";
import colors from "./colors.json";

/**
 * https://tailwindcss.com/docs/customizing-colors
 * https://github.com/tailwindlabs/tailwindcss.com/blob/5a77fe695f8558de7e59b08881ee9f2405a81736/src/components/color.tsx
 */

/** stagger hues to provide more contrast/distinction between successive colors */
const hueOrder = [
  "teal",
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
  "emerald",
  "indigo",
] as const;

const lightNeutral = "hsl(30, 10%, 80%)";
const darkNeutral = "hsl(30, 5%, 50%)";

const blend = (a: string, b: string, t = 0.5) =>
  color(interpolateHsl(a, b)(t))?.formatHex() ?? a;

export const palette = {
  light: [
    lightNeutral,
    ...hueOrder
      .map((hue) => colors[hue]["100"])
      .map((color) => blend(color, "#808080", 0.25)),
  ] as const,
  dark: [
    darkNeutral,
    ...hueOrder
      .map((hue) => colors[hue]["900"])
      .map((color) => blend(color, "#808080", 0.65)),
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
